import OpenAI from "openai";
import { NextResponse } from "next/server";

async function callOpenAI(systemPrompt: string, userMessage: string): Promise<string> {
  const client = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
    timeout: 30000,
  });
  const response = await client.chat.completions.create({
    model: "gpt-4o",
    max_tokens: 4000,
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userMessage },
    ],
  });
  return response.choices[0]?.message?.content || "";
}

async function callAnthropic(systemPrompt: string, userMessage: string): Promise<string> {
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": process.env.ANTHROPIC_API_KEY!,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: "claude-sonnet-4-20250514",
      max_tokens: 4000,
      system: systemPrompt,
      messages: [{ role: "user", content: userMessage }],
    }),
    signal: AbortSignal.timeout(30000),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error?.message || `Anthropic API error: ${res.status}`);
  }
  const data = await res.json();
  return data.content?.[0]?.type === "text" ? data.content[0].text : "";
}

const SYSTEM_PROMPT = `Du bist ein erfahrener deutscher Immobilien-Gutachter und Exposé-Analyst mit über 20 Jahren Erfahrung. Du analysierst Immobilien-Exposés kritisch und objektiv.

DEINE AUFGABE:
Analysiere das gegebene Immobilien-Exposé und liefere eine strukturierte, kritische Bewertung.

ANTWORTE IMMER ALS VALIDES JSON mit exakt dieser Struktur:
{
  "zusammenfassung": "Kurze Zusammenfassung des Objekts in 2-3 Sätzen",
  "score": <Zahl 0-100, Gesamtbewertung der Exposé-Qualität>,
  "extrahierte_daten": {
    "objektart": "...",
    "adresse": "... oder 'Nicht angegeben'",
    "kaufpreis": "... oder 'Nicht angegeben'",
    "wohnflaeche": "... oder 'Nicht angegeben'",
    "zimmer": "... oder 'Nicht angegeben'",
    "baujahr": "... oder 'Nicht angegeben'",
    "energieklasse": "... oder 'Nicht angegeben'",
    "kaltmiete": "... oder 'Nicht angegeben'",
    "hausgeld": "... oder 'Nicht angegeben'",
    "grundstueck": "... oder 'Nicht angegeben'",
    "etage": "... oder 'Nicht angegeben'",
    "provision": "... oder 'Nicht angegeben'"
  },
  "kategorien": [
    {
      "name": "Vollständigkeit",
      "score": <0-100>,
      "bewertung": "Detaillierte Bewertung der Informationsvollständigkeit",
      "icon": "clipboard"
    },
    {
      "name": "Transparenz",
      "score": <0-100>,
      "bewertung": "Bewertung der Ehrlichkeit und Transparenz",
      "icon": "eye"
    },
    {
      "name": "Marktkonformität",
      "score": <0-100>,
      "bewertung": "Einschätzung ob Preis/Konditionen marktgerecht sind",
      "icon": "trending"
    },
    {
      "name": "Risikofaktoren",
      "score": <0-100>,
      "bewertung": "Identifizierte Risiken und versteckte Probleme",
      "icon": "alert"
    },
    {
      "name": "Marketing vs. Realität",
      "score": <0-100>,
      "bewertung": "Analyse von Übertreibungen und Marketing-Sprache",
      "icon": "search"
    }
  ],
  "rote_flaggen": ["Liste konkreter Warnzeichen/Red Flags aus dem Exposé"],
  "fehlende_infos": ["Liste wichtiger fehlender Informationen die man nachfragen sollte"],
  "marketing_phrasen": [
    {
      "phrase": "Zitierte Phrase aus dem Exposé",
      "realitaet": "Was das wirklich bedeuten könnte"
    }
  ],
  "handlungsempfehlungen": ["Konkrete nächste Schritte und Empfehlungen für den Kaufinteressenten"],
  "fazit": "Abschließende Gesamteinschätzung mit klarer Kauf-/Nicht-Kauf-Tendenz in 3-5 Sätzen"
}

ANALYSE-REGELN:
1. Sei KRITISCH und OBJEKTIV — nicht alles glauben was im Exposé steht
2. Marketing-Sprache entlarven (z.B. "renovierungsbedürftig" = erheblicher Investitionsbedarf)
3. Fehlende Informationen als Warnsignal werten
4. Typische Makler-Tricks erkennen (beschönigende Formulierungen, fehlende Fotos bestimmter Bereiche)
5. Unrealistische Renditeversprechen aufdecken
6. Auf Energieeffizienz und GEG-Konformität achten
7. Kaufnebenkosten und versteckte Kosten berücksichtigen
8. Bei Eigentumswohnungen: Hausgeld, Sonderumlagen, Teilungserklärung beachten
9. Lage objektiv bewerten (nicht nur Makler-Beschreibung)
10. IMMER auf Deutsch antworten

WICHTIG: Antworte NUR mit dem JSON-Objekt, kein Text davor oder danach.`;

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { exposeText } = body;

    if (!exposeText || exposeText.trim().length < 50) {
      return NextResponse.json(
        { error: "Bitte fügen Sie einen Exposé-Text mit mindestens 50 Zeichen ein." },
        { status: 400 },
      );
    }

    if (!process.env.OPENAI_API_KEY && !process.env.ANTHROPIC_API_KEY) {
      return NextResponse.json(
        { error: "KI-Analyse ist aktuell nicht verfügbar. Bitte versuchen Sie es später erneut." },
        { status: 503 },
      );
    }

    const userMessage = `Analysiere folgendes Immobilien-Exposé:\n\n---\n${exposeText.slice(0, 8000)}\n---`;

    let result = "";

    try {
      if (process.env.OPENAI_API_KEY) {
        result = await callOpenAI(SYSTEM_PROMPT, userMessage);
      } else if (process.env.ANTHROPIC_API_KEY) {
        result = await callAnthropic(SYSTEM_PROMPT, userMessage);
      }
    } catch (apiError) {
      console.warn("[ai-expose] Primary API failed:", (apiError as Error).message);
      try {
        if (process.env.OPENAI_API_KEY && process.env.ANTHROPIC_API_KEY) {
          result = process.env.OPENAI_API_KEY
            ? await callAnthropic(SYSTEM_PROMPT, userMessage)
            : await callOpenAI(SYSTEM_PROMPT, userMessage);
        } else {
          throw apiError;
        }
      } catch (fallbackError) {
        console.warn("[ai-expose] Fallback also failed:", (fallbackError as Error).message);
        return NextResponse.json(
          { error: "KI-Analyse fehlgeschlagen. Bitte versuchen Sie es erneut." },
          { status: 500 },
        );
      }
    }

    // Parse JSON from the response (handle markdown code blocks)
    let cleaned = result.trim();
    if (cleaned.startsWith("```")) {
      cleaned = cleaned.replace(/^```(?:json)?\s*/, "").replace(/\s*```$/, "");
    }

    try {
      const analysis = JSON.parse(cleaned);
      return NextResponse.json({ analysis });
    } catch {
      console.error("[ai-expose] Failed to parse JSON response:", result.slice(0, 200));
      return NextResponse.json(
        { error: "Die KI-Antwort konnte nicht verarbeitet werden. Bitte versuchen Sie es erneut." },
        { status: 500 },
      );
    }
  } catch (error: unknown) {
    console.error("[ai-expose] error:", error);

    if (
      error &&
      typeof error === "object" &&
      "status" in error &&
      (error as { status: number }).status === 429
    ) {
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
