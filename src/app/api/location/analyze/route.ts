import { NextRequest, NextResponse } from "next/server";
import { findCityData } from "@/data/german-cities";
import { rateLimit, clientIp, TOO_MANY } from "@/lib/rate-limit";

const GOOGLE_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_PLACES_API_KEY;

interface CategoryResult {
  type: string;
  label: string;
  count: number;
  places: string[];
}

export interface LocationAnalysisResult {
  walkScore: number;
  transitScore: number;
  locationGrade: "A" | "B" | "C" | "D";
  rentGrowth: string;
  description: string;
  nearbyHighlights: string[];
  // New market-data fields
  avgRentPerSqm: number | null;
  avgPricePerSqm: number | null;
  rentComparison: "über Durchschnitt" | "im Durchschnitt" | "unter Durchschnitt" | null;
  priceComparison: "über Durchschnitt" | "im Durchschnitt" | "unter Durchschnitt" | null;
  cityTier: "A" | "B" | "C" | "D" | null;
  populationTrend: string | null;
}

export async function POST(req: NextRequest) {
  if (!rateLimit(`location-analyze:${clientIp(req)}`, 15, 60_000)) {
    return NextResponse.json(TOO_MANY.body, { status: TOO_MANY.status });
  }
  try {
    const body = await req.json();
    const { lat, lng, city, price, rent, area } = body as {
      lat: number;
      lng: number;
      city?: string;
      price?: number;
      rent?: number;
      area?: number;
    };

    if (!lat || !lng) {
      return NextResponse.json({ error: "Koordinaten fehlen" }, { status: 400 });
    }

    if (!GOOGLE_API_KEY) {
      return NextResponse.json({ error: "API Key nicht konfiguriert" }, { status: 500 });
    }

    // ─── 1. City market data lookup ───
    const cityData = city ? findCityData(city) : null;

    // User-entered per-sqm values
    const userRentPerSqm = rent && area && area > 0 ? rent / area : null;
    const userPricePerSqm = price && area && area > 0 ? price / area : null;

    // ─── 2. Google Places infrastructure query ───
    const categories = [
      { type: "transit_station", label: "ÖPNV" },
      { type: "supermarket", label: "Supermarkt" },
      { type: "restaurant", label: "Restaurant" },
      { type: "school", label: "Schule" },
      { type: "hospital", label: "Krankenhaus" },
      { type: "park", label: "Park" },
      { type: "shopping_mall", label: "Einkaufszentrum" },
      { type: "pharmacy", label: "Apotheke" },
      { type: "doctor", label: "Arzt" },
      { type: "gym", label: "Fitnessstudio" },
    ];

    const results = await Promise.allSettled(
      categories.map(async (cat) => {
        const url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${lat},${lng}&radius=1000&type=${cat.type}&key=${GOOGLE_API_KEY}`;
        const res = await fetch(url);
        const data = await res.json();
        return {
          type: cat.type,
          label: cat.label,
          count: data.results?.length || 0,
          places: (data.results || []).slice(0, 3).map((p: { name: string }) => p.name),
        } as CategoryResult;
      })
    );

    const categoryResults = results
      .filter((r): r is PromiseFulfilledResult<CategoryResult> => r.status === "fulfilled")
      .map((r) => r.value);

    // ═══════════════════════════════════════
    // SCORING — 4 weighted components
    // ═══════════════════════════════════════

    // ─── Component 1: Rent level (35%) ───
    let rentScore = 50; // default if no data
    if (cityData) {
      if (userRentPerSqm) {
        const ratio = userRentPerSqm / cityData.avgRentPerSqm;
        // Above average rent = positive (good demand area)
        if (ratio >= 1.15) rentScore = 95;
        else if (ratio >= 1.05) rentScore = 80;
        else if (ratio >= 0.95) rentScore = 65;
        else if (ratio >= 0.85) rentScore = 45;
        else rentScore = 25;
      } else {
        // No user rent/area, use city average as baseline
        const tierRentScore: Record<string, number> = { A: 85, B: 65, C: 45, D: 25 };
        rentScore = tierRentScore[cityData.tier] ?? 50;
      }
    }

    // ─── Component 2: City tier & population (20%) ───
    let cityScore = 50; // default unknown city
    if (cityData) {
      const tierPoints: Record<string, number> = { A: 100, B: 75, C: 50, D: 25 };
      const base = tierPoints[cityData.tier] ?? 50;
      const popBonus = cityData.populationTrend === "growing" ? 10 :
                       cityData.populationTrend === "stable" ? 0 : -10;
      cityScore = Math.max(0, Math.min(100, base + popBonus));
    }

    // ─── Component 3: Google Places infrastructure (25%) ───
    const getCount = (type: string) => categoryResults.find((r) => r.type === type)?.count || 0;

    const transitCount = getCount("transit_station");
    const supermarketCount = getCount("supermarket");
    const restaurantCount = getCount("restaurant");
    const schoolCount = getCount("school");
    const hospitalCount = getCount("hospital");
    const parkCount = getCount("park");
    const pharmacyCount = getCount("pharmacy");
    const doctorCount = getCount("doctor");

    // ÖPNV: <3 schlecht, 3-8 ok, >8 gut
    const transitPts = transitCount < 3 ? 20 : transitCount <= 8 ? 55 : 85;
    // Supermärkte: <2 schlecht, 2-5 ok, >5 gut
    const superPts = supermarketCount < 2 ? 20 : supermarketCount <= 5 ? 55 : 85;
    // Restaurants: <3 schlecht, 3-10 ok, >10 gut
    const restPts = restaurantCount < 3 ? 25 : restaurantCount <= 10 ? 55 : 80;
    // Schulen: 0 schlecht, 1-2 ok, >2 gut
    const schoolPts = schoolCount === 0 ? 20 : schoolCount <= 2 ? 55 : 80;
    // Krankenhäuser: 0 = Abzug, ≥1 ok
    const hospPts = hospitalCount === 0 ? 30 : 75;
    // Parks
    const parkPts = parkCount === 0 ? 30 : parkCount <= 2 ? 55 : 80;
    // Apotheken + Ärzte zusammen
    const healthPts = (pharmacyCount + doctorCount) < 2 ? 25 : (pharmacyCount + doctorCount) <= 6 ? 55 : 80;

    const infraScore = Math.round(
      transitPts * 0.25 +
      superPts * 0.20 +
      restPts * 0.10 +
      schoolPts * 0.10 +
      hospPts * 0.10 +
      parkPts * 0.10 +
      healthPts * 0.15
    );

    // ─── Component 4: Purchase price vs market (20%) ───
    let priceScore = 50; // default if no data
    if (cityData && userPricePerSqm) {
      const ratio = userPricePerSqm / cityData.avgPricePerSqm;
      // Below average price = positive (bargain)
      if (ratio <= 0.80) priceScore = 95;
      else if (ratio <= 0.90) priceScore = 80;
      else if (ratio <= 1.05) priceScore = 60;
      else if (ratio <= 1.15) priceScore = 40;
      else priceScore = 20;
    } else if (cityData) {
      priceScore = 50; // no price data, neutral
    }

    // ═══════════════════════════════════════
    // COMBINED SCORE
    // ═══════════════════════════════════════
    const combinedScore = Math.round(
      rentScore * 0.35 +
      cityScore * 0.20 +
      infraScore * 0.25 +
      priceScore * 0.20
    );

    let locationGrade: "A" | "B" | "C" | "D";
    if (combinedScore >= 80) locationGrade = "A";
    else if (combinedScore >= 60) locationGrade = "B";
    else if (combinedScore >= 40) locationGrade = "C";
    else locationGrade = "D";

    // ─── Walk Score (recalculated with stricter thresholds) ───
    const walkScore = Math.max(0, Math.min(100, Math.round(infraScore * 0.7 + (cityScore * 0.3))));

    // ─── Transit Score (stricter) ───
    const transitScore = Math.max(0, Math.min(100, transitPts));

    // ─── Rent growth estimate ───
    const rentGrowthMap: Record<string, string> = { A: "+3,2 %", B: "+2,4 %", C: "+1,5 %", D: "+0,8 %" };
    const rentGrowth = rentGrowthMap[locationGrade];

    // ─── Description ───
    const descMap: Record<string, string> = {
      A: "Erstklassige Lage mit starker Marktnachfrage, exzellenter Infrastruktur und überdurchschnittlichem Mietpreisniveau.",
      B: "Gute Wohnlage mit solider Infrastruktur und stabilem Mietmarkt.",
      C: "Durchschnittliche Lage — grundlegende Versorgung vorhanden, Marktdaten zeigen moderates Potenzial.",
      D: "Einfache Lage mit unterdurchschnittlichen Marktdaten. Eingeschränkte Infrastruktur und schwächere Nachfrage.",
    };

    // ─── Highlights ───
    const highlights: string[] = [];

    // Market data highlights first
    if (cityData) {
      highlights.push(`Stadt-Tier ${cityData.tier} — Ø-Miete ${cityData.avgRentPerSqm.toFixed(1)} €/m², Ø-Kaufpreis ${cityData.avgPricePerSqm.toLocaleString("de-DE")} €/m²`);
      const trendLabel = cityData.populationTrend === "growing" ? "wachsend" :
                         cityData.populationTrend === "stable" ? "stabil" : "rückläufig";
      highlights.push(`Bevölkerung: ${(cityData.population / 1000).toFixed(0)}k (${trendLabel})`);
    }

    // Infrastructure highlights
    for (const cat of categoryResults) {
      if (cat.count > 0 && cat.places.length > 0) {
        highlights.push(
          `${cat.label}: ${cat.places[0]}${cat.count > 1 ? ` (+${cat.count - 1} weitere)` : ""}`
        );
      }
    }

    // ─── Comparison labels ───
    let rentComparison: "über Durchschnitt" | "im Durchschnitt" | "unter Durchschnitt" | null = null;
    if (cityData && userRentPerSqm) {
      const ratio = userRentPerSqm / cityData.avgRentPerSqm;
      rentComparison = ratio >= 1.05 ? "über Durchschnitt" : ratio <= 0.95 ? "unter Durchschnitt" : "im Durchschnitt";
    }

    let priceComparison: "über Durchschnitt" | "im Durchschnitt" | "unter Durchschnitt" | null = null;
    if (cityData && userPricePerSqm) {
      const ratio = userPricePerSqm / cityData.avgPricePerSqm;
      priceComparison = ratio >= 1.05 ? "über Durchschnitt" : ratio <= 0.95 ? "unter Durchschnitt" : "im Durchschnitt";
    }

    const result: LocationAnalysisResult = {
      walkScore,
      transitScore,
      locationGrade,
      rentGrowth,
      description: descMap[locationGrade],
      nearbyHighlights: highlights.slice(0, 7),
      avgRentPerSqm: cityData?.avgRentPerSqm ?? null,
      avgPricePerSqm: cityData?.avgPricePerSqm ?? null,
      rentComparison,
      priceComparison,
      cityTier: cityData?.tier ?? null,
      populationTrend: cityData ? (cityData.populationTrend === "growing" ? "wachsend" : cityData.populationTrend === "stable" ? "stabil" : "rückläufig") : null,
    };

    return NextResponse.json(result);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unbekannter Fehler";
    console.error("Location analysis error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
