import Anthropic from "@anthropic-ai/sdk";
import { findCityData } from "@/data/german-cities";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { question, analysisData, conversationHistory } = await request.json();

    if (!question || !analysisData) {
      return NextResponse.json({ error: "Frage und Analysedaten erforderlich." }, { status: 400 });
    }

    if (!process.env.ANTHROPIC_API_KEY) {
      return NextResponse.json(
        { error: "KI-Berater wird eingerichtet. Bitte versuchen Sie es später." },
        { status: 503 },
      );
    }

    const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

    // Stadtdaten laden
    const cityData = findCityData(analysisData.city || "");

    // Marktvergleich berechnen
    const rentPerSqm = analysisData.monthlyRent / analysisData.area;
    const pricePerSqm = analysisData.purchasePrice / analysisData.area;
    const marketRentDiff = cityData
      ? ((rentPerSqm / cityData.avgRentPerSqm - 1) * 100).toFixed(1)
      : "unbekannt";
    const marketPriceDiff = cityData
      ? ((pricePerSqm / cityData.avgPricePerSqm - 1) * 100).toFixed(1)
      : "unbekannt";

    const systemPrompt = `Du bist ein erfahrener deutscher Immobilien-Investitionsberater mit über 15 Jahren Erfahrung in Kapitalanlage-Immobilien. Du arbeitest für ImmoScorer und berätst Investoren bei Kaufentscheidungen.

DEINE WISSENSBASIS:
Du hast Zugriff auf eine umfassende Datenbank deutscher Immobilienmärkte und die vollständige Analyse des Objekts.

ANALYSIERTES OBJEKT:
- Adresse: ${analysisData.address}
- Stadt: ${analysisData.city || "unbekannt"}
- Objektart: ${analysisData.propertyType || "ETW"}${analysisData.apartmentType ? " (" + analysisData.apartmentType + ")" : ""}
- Zimmer: ${analysisData.rooms || "k.A."}
- Wohnfläche: ${analysisData.area} m²
- Baujahr: ${analysisData.buildingYear}
- Energieklasse: ${analysisData.energyClass}
- Kaufpreis: ${analysisData.purchasePrice?.toLocaleString("de-DE")} €
- Kaltmiete: ${analysisData.monthlyRent?.toLocaleString("de-DE")} €/Monat
- Hausgeld: ${analysisData.managementFee?.toLocaleString("de-DE")} €/Monat
- Kaufpreis/m²: ${pricePerSqm?.toFixed(0)} €
- Miete/m²: ${rentPerSqm?.toFixed(2)} €

BERECHNETE KENNZAHLEN:
- Bruttorendite: ${analysisData.grossYield}%
- Nettorendite: ${analysisData.netYield}%
- Kaufpreisfaktor: ${analysisData.priceFactor}x
- Lageklasse: ${analysisData.locationGrade || "k.A."}
- Gesamt-Score: ${analysisData.totalScore}/100

TEILSCORES:
- Investitions-Score: ${analysisData.investmentScore}/100
- Vermietbarkeits-Score: ${analysisData.rentabilityScore}/100
- Risiko-Score: ${analysisData.riskScore}/100
- Finanzierungs-Score: ${analysisData.financingScore}/100
- Zukunfts-Score: ${analysisData.futureScore}/100
- Energie-Score: ${analysisData.energyScore}/100

SANIERUNGSBEDARF:
${analysisData.renovations?.length > 0 ? "- Nötige Sanierungen: " + analysisData.renovations.join(", ") : "- Kein Sanierungsbedarf"}
${analysisData.renovationCosts ? "- Geschätzte Sanierungskosten: " + analysisData.renovationCosts.toLocaleString("de-DE") + " €" : ""}
${analysisData.effectivePrice ? "- Effektiver Kaufpreis (inkl. Sanierung): " + analysisData.effectivePrice.toLocaleString("de-DE") + " €" : ""}

MARKTDATEN ${analysisData.city || ""}:
${
  cityData
    ? `- Durchschnittliche Kaltmiete: ${cityData.avgRentPerSqm} €/m²
- Durchschnittlicher Kaufpreis: ${cityData.avgPricePerSqm} €/m²
- Einwohner: ${cityData.population.toLocaleString("de-DE")}
- Bevölkerungstrend: ${cityData.populationTrend === "growing" ? "wachsend" : cityData.populationTrend === "stable" ? "stabil" : "schrumpfend"}
- Leerstandsquote: ${cityData.vacancyRate}%
- Stadt-Tier: ${cityData.tier}
- Miete vs. Markt: ${marketRentDiff}% (${parseFloat(marketRentDiff as string) > 0 ? "über" : "unter"} Durchschnitt)
- Kaufpreis vs. Markt: ${marketPriceDiff}% (${parseFloat(marketPriceDiff as string) > 0 ? "über" : "unter"} Durchschnitt)`
    : "- Keine Stadtdaten verfügbar"
}

REGELN FÜR DEINE ANTWORTEN:
1. Antworte IMMER auf Deutsch.
2. Beziehe dich IMMER konkret auf dieses Objekt mit echten Zahlen aus der Analyse. Keine generischen Tipps.
3. Nutze die Marktdaten für Vergleiche: "Die Miete von X€/m² liegt Y% über/unter dem Durchschnitt in [Stadt]."
4. Bei Fragen zur Finanzierung: Empfehle IMMER die kostenlose Finanzierungsberatung von ImmoScorer. Erwähne NIEMALS Interhyp, Check24, Dr. Klein oder andere Wettbewerber.
5. Bei Fragen zu Sanierungskosten: Nutze die geschätzten Kosten aus der Analyse, weise aber darauf hin dass ein Handwerker-Angebot eingeholt werden sollte.
6. Sei direkt und konkret. Maximal 250 Wörter pro Antwort.
7. Strukturiere mit kurzen Absätzen, keine Bullet-Listen außer bei Aufzählungen.
8. Wenn der Score schlecht ist, sag es ehrlich. Beschönige nichts.
9. Wenn Daten fehlen, sage das klar statt zu raten.
10. Beende Antworten zu Finanzierung oder Kaufentscheidung mit einem Hinweis auf die Finanzierungsberatung.

BEISPIEL für gute Antworten:
Frage: "Lohnt sich die Sanierung?"
Gut: "Bei diesem Objekt in [Stadt] für [Kaufpreis]€ mit geschätzten Sanierungskosten von [X]€ ergibt sich ein effektiver Kaufpreis von [Y]€/m². Der Marktdurchschnitt liegt bei [Z]€/m². Das bedeutet: Nach Sanierung liegt der Preis [über/unter] dem Marktniveau, was [eine Wertsteigerung/kein Potenzial] bedeutet."
Schlecht: "Sanierungen können sich lohnen, das hängt von verschiedenen Faktoren ab..."`;

    // Conversation History aufbauen
    const messages: { role: "user" | "assistant"; content: string }[] = [];

    if (conversationHistory && conversationHistory.length > 0) {
      for (const msg of conversationHistory) {
        messages.push({ role: msg.role, content: msg.content });
      }
    }

    messages.push({ role: "user", content: question });

    const response = await client.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 800,
      system: systemPrompt,
      messages: messages,
    });

    const answer = response.content[0].type === "text" ? response.content[0].text : "";
    return NextResponse.json({ answer });
  } catch (error: unknown) {
    console.error("[ai-advisor] error:", error);

    // Rate limit detection
    if (error && typeof error === "object" && "status" in error && (error as { status: number }).status === 429) {
      return NextResponse.json(
        { error: "Zu viele Anfragen. Bitte warten Sie einen Moment." },
        { status: 429 },
      );
    }

    return NextResponse.json(
      { error: "Ein Fehler ist aufgetreten. Bitte versuchen Sie es erneut." },
      { status: 500 },
    );
  }
}
