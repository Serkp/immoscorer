import Anthropic from "@anthropic-ai/sdk";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const data = await request.json();

    if (!process.env.ANTHROPIC_API_KEY) {
      return NextResponse.json({ fallback: true }, { status: 200 });
    }

    const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

    const systemPrompt = `Du bist ein erfahrener Immobilien-Investmentstratege in Deutschland. Du erstellst personalisierte, realistische Investmentstrategien basierend auf der individuellen Situation des Kunden.

KUNDENPROFIL:
- Name: ${data.firstName || "Investor"}
- Alter: ${data.age || "k.A."} Jahre
- Berufsstand: ${data.employment || "k.A."}
- Einkommen: ${data.income || "k.A."}
- Familienstand: ${data.familyStatus || "k.A."}
- Wohnsituation: ${data.livingSituation || "k.A."}
- Eigenkapital: ${data.equity || 0}€
- Monatliche Sparrate: ${data.monthlySavings || 0}€
- Bestehende Immobilien: ${data.existingProperties || "Keine"}
- Bestehende Schulden: ${data.existingDebts || "Keine"}
- Schufa: ${data.schufa || "k.A."}
- Hauptziel: ${data.mainGoal || "k.A."}
- Zeithorizont: ${data.timeHorizon || "k.A."}
- Ziel-Einkommen: ${data.targetIncome || 0}€/Monat
- Risikobereitschaft: ${data.riskTolerance || "k.A."}
- Bevorzugte Objektart: ${data.preferredTypes?.join(", ") || "k.A."}
- Bevorzugte Region: ${data.preferredRegion || "k.A."}
- Verwaltung: ${data.management || "k.A."}
- Verfügbare Zeit: ${data.timeAvailable || "k.A."}

ERSTELLE EINE STRATEGIE IM FOLGENDEN JSON-FORMAT (NUR JSON, kein anderer Text):
{
  "summary": "2-3 Sätze Zusammenfassung der Strategie",
  "strategyName": "Name der Strategie z.B. 'Cashflow-Aufbau Konservativ'",
  "phase1": {
    "title": "Phase 1: [Name]",
    "timeframe": "z.B. Monat 1-6",
    "description": "Was in dieser Phase zu tun ist (3-5 Sätze)",
    "actions": ["Konkrete Aktion 1", "Konkrete Aktion 2", "Konkrete Aktion 3"],
    "targetProperty": "Beschreibung des idealen ersten Objekts",
    "estimatedBudget": "z.B. 60.000-100.000€",
    "expectedCashflow": "z.B. 150-250€/Monat"
  },
  "phase2": {
    "title": "Phase 2: [Name]",
    "timeframe": "z.B. Monat 7-18",
    "description": "Was in dieser Phase zu tun ist",
    "actions": ["Aktion 1", "Aktion 2", "Aktion 3"],
    "targetProperty": "Beschreibung des nächsten Objekts",
    "estimatedBudget": "Budget",
    "expectedCashflow": "Kumulierter Cashflow"
  },
  "phase3": {
    "title": "Phase 3: [Name]",
    "timeframe": "z.B. Jahr 2-5",
    "description": "Langfristige Phase",
    "actions": ["Aktion 1", "Aktion 2", "Aktion 3"],
    "targetProperty": "Beschreibung",
    "estimatedBudget": "Budget",
    "expectedCashflow": "Kumulierter Cashflow"
  },
  "financialPlan": {
    "eigenkapitalPlan": "Wie Eigenkapital aufgebaut/eingesetzt wird",
    "sparplan": "Monatlicher Sparplan mit Meilensteinen",
    "finanzierungsStrategie": "Welche Finanzierungsstrategie empfohlen wird"
  },
  "riskManagement": {
    "risks": ["Risiko 1 + Gegenmaßnahme", "Risiko 2 + Gegenmaßnahme"],
    "reserves": "Empfohlene Rücklagen",
    "diversification": "Wie diversifizieren"
  },
  "milestones": [
    { "time": "6 Monate", "goal": "Erstes Objekt gekauft" },
    { "time": "12 Monate", "goal": "..." },
    { "time": "3 Jahre", "goal": "..." },
    { "time": "5 Jahre", "goal": "..." },
    { "time": "10 Jahre", "goal": "..." }
  ],
  "firstSteps": [
    "Konkreter Schritt 1 den der Kunde JETZT tun sollte",
    "Konkreter Schritt 2",
    "Konkreter Schritt 3"
  ],
  "investmentCriteria": {
    "idealCity": "Empfohlene Stadttypen oder konkrete Städte",
    "priceRange": "z.B. 50.000-120.000€",
    "minRendite": "z.B. 6%+ Bruttorendite",
    "objectType": "z.B. 2-3 Zimmer ETW in B-C Lagen",
    "avoidList": ["Was der Kunde NICHT kaufen sollte"]
  },
  "taxTips": [
    "Steuer-Tipp 1 passend zur Situation",
    "Steuer-Tipp 2"
  ]
}

REGELN:
1. Die Strategie muss REALISTISCH sein. Keine Fantasie-Renditen. Wenn jemand 500€ Sparrate hat, kann er nicht in 2 Jahren finanziell frei sein.
2. Rechne mit aktuellen Zinsen (3-4% in 2025).
3. Berücksichtige Kaufnebenkosten (10-15%) beim Eigenkapitalbedarf.
4. Passe die Strategie an das Alter an: 22-Jähriger hat Zeit, 55-Jähriger nicht.
5. Bei Einsteigern: Erste Immobilie sollte einfach und sicher sein (ETW in B-Lage, nicht MFH).
6. Bei niedrigem Eigenkapital: Sparplan + kleine Wohnungen in C/D-Städten als Einstieg.
7. Empfehle IMMER die ImmoScorer Finanzierungsberatung am Ende.
8. NIEMALS Wettbewerber empfehlen.`;

    const response = await client.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 4096,
      system: systemPrompt,
      messages: [
        {
          role: "user",
          content:
            "Erstelle meine personalisierte Investmentstrategie basierend auf meinem Profil. Antworte NUR mit dem JSON-Objekt, kein anderer Text.",
        },
      ],
    });

    const text =
      response.content[0].type === "text" ? response.content[0].text : "";

    // Parse JSON from response (handle markdown code blocks)
    let jsonStr = text.trim();
    if (jsonStr.startsWith("```")) {
      jsonStr = jsonStr.replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "");
    }

    const strategy = JSON.parse(jsonStr);
    return NextResponse.json({ strategy });
  } catch (error: unknown) {
    console.error("[ai-strategy] error:", error);

    if (
      error &&
      typeof error === "object" &&
      "status" in error &&
      (error as { status: number }).status === 429
    ) {
      return NextResponse.json(
        { error: "Zu viele Anfragen. Bitte warten Sie einen Moment." },
        { status: 429 }
      );
    }

    return NextResponse.json(
      { error: "Strategiegenerierung fehlgeschlagen. Bitte erneut versuchen." },
      { status: 500 }
    );
  }
}
