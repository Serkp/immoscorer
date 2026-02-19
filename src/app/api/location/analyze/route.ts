import { NextRequest, NextResponse } from "next/server";

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
}

export async function POST(req: NextRequest) {
  try {
    const { lat, lng } = await req.json();

    if (!lat || !lng) {
      return NextResponse.json({ error: "Koordinaten fehlen" }, { status: 400 });
    }

    if (!GOOGLE_API_KEY) {
      return NextResponse.json({ error: "API Key nicht konfiguriert" }, { status: 500 });
    }

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

    // Alle Kategorien parallel abfragen
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

    // ─── Transit Score ───
    const transitCount = categoryResults.find((r) => r.type === "transit_station")?.count || 0;
    const transitScore = Math.min(100, Math.round(transitCount * 12));

    // ─── Walk Score ───
    const essentialTypes = ["supermarket", "pharmacy", "doctor", "restaurant", "school"];
    const essentialFound = essentialTypes.filter((type) => {
      const result = categoryResults.find((r) => r.type === type);
      return result && result.count > 0;
    }).length;
    const totalNearby = categoryResults.reduce((sum, r) => sum + Math.min(r.count, 10), 0);
    const walkScore = Math.min(
      100,
      Math.round((essentialFound / essentialTypes.length) * 60 + (totalNearby / 40) * 40)
    );

    // ─── Location Grade ───
    const combinedScore =
      walkScore * 0.5 + transitScore * 0.3 + (essentialFound / essentialTypes.length) * 100 * 0.2;
    let locationGrade: "A" | "B" | "C" | "D";
    if (combinedScore >= 75) locationGrade = "A";
    else if (combinedScore >= 55) locationGrade = "B";
    else if (combinedScore >= 35) locationGrade = "C";
    else locationGrade = "D";

    // ─── Mietwachstum ───
    const rentGrowthMap = { A: "+3,2 %", B: "+2,4 %", C: "+1,5 %", D: "+0,8 %" };
    const rentGrowth = rentGrowthMap[locationGrade];

    // ─── Beschreibung ───
    const descMap = {
      A: "Erstklassige urbane Lage mit hervorragender Infrastruktur und Anbindung.",
      B: "Gute Wohnlage mit solider Infrastruktur und guter Erreichbarkeit.",
      C: "Durchschnittliche Lage mit grundlegender Versorgung. Einige Einrichtungen fehlen in der direkten Umgebung.",
      D: "Einfache Randlage mit eingeschränkter Infrastruktur. Längere Wege zu wichtigen Einrichtungen.",
    };

    // ─── Highlights ───
    const highlights: string[] = [];
    for (const cat of categoryResults) {
      if (cat.count > 0 && cat.places.length > 0) {
        highlights.push(
          `${cat.label}: ${cat.places[0]}${cat.count > 1 ? ` (+${cat.count - 1} weitere)` : ""}`
        );
      }
    }

    const result: LocationAnalysisResult = {
      walkScore,
      transitScore,
      locationGrade,
      rentGrowth,
      description: descMap[locationGrade],
      nearbyHighlights: highlights.slice(0, 5),
    };

    return NextResponse.json(result);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unbekannter Fehler";
    console.error("Location analysis error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
