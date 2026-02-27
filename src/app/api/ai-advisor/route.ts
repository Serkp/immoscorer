import Anthropic from "@anthropic-ai/sdk";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { answer: "KI-Berater wird bald verfügbar sein. Für persönliche Beratung nutzen Sie unsere kostenlose Finanzierungsanfrage." },
        { status: 200 },
      );
    }

    const { question, analysisData } = await request.json();
    if (!question || !analysisData) {
      return NextResponse.json({ error: "Frage und Analysedaten erforderlich." }, { status: 400 });
    }

    const client = new Anthropic({ apiKey });

    const systemPrompt = `Du bist ein erfahrener Immobilien-Investitionsberater in Deutschland.
Du hast Zugriff auf folgende Analyse-Daten des Nutzers:
Objekt: ${analysisData.address || "Unbekannt"}
Objektart: ${analysisData.propertyType || "ETW"}
Kaufpreis: ${analysisData.purchasePrice || 0}€
Kaltmiete: ${analysisData.monthlyRent || 0}€/Mon.
Wohnfläche: ${analysisData.area || 0}m²
Baujahr: ${analysisData.buildingYear || 0}
Energieklasse: ${analysisData.energyClass || "Unbekannt"}
Gesamt-Score: ${analysisData.totalScore || 0}/100
Bruttorendite: ${analysisData.grossYield || "0"}%
Nettorendite: ${analysisData.netYield || "0"}%
Kaufpreisfaktor: ${analysisData.priceFactor || "0"}x
Lageklasse: ${analysisData.locationGrade || "Unbekannt"}
Sanierungsbedarf: ${analysisData.renovations || "Keiner"}

Antworte auf Deutsch, prägnant, konkret auf dieses Objekt bezogen.
Maximal 200 Wörter. Keine allgemeinen Floskeln.
Wenn der Nutzer nach Finanzierung fragt, erwähne dass ImmoScorer eine kostenlose Finanzierungsberatung anbietet.`;

    const message = await client.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 500,
      system: systemPrompt,
      messages: [{ role: "user", content: question }],
    });

    const textBlock = message.content.find((b) => b.type === "text");
    return NextResponse.json({ answer: textBlock?.text || "Keine Antwort erhalten." });
  } catch (err) {
    console.error("[ai-advisor] error:", err);
    return NextResponse.json(
      { answer: "Es ist ein Fehler aufgetreten. Bitte versuchen Sie es später erneut." },
      { status: 500 },
    );
  }
}
