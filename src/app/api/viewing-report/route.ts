import OpenAI from "openai";
import { NextResponse } from "next/server";
import { rateLimit, clientIp, TOO_MANY } from "@/lib/rate-limit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

const SYS = `Du bist ein erfahrener, nüchterner Immobilien-Gutachter und Kaufberater. Ein Investor war gerade bei einer Wohnungs-Besichtigung und hat zu einer Experten-Checkliste Antworten eingesprochen. Werte das ehrlich, konkret und praxisnah aus.
Gib NUR JSON zurück:
{
 "recommendation": "WEITERVERFOLGEN" | "GENAU PRÜFEN" | "FINGER WEG",
 "summary": string (2-3 Sätze gesprochenes Fazit, du-Form, direkt, ehrlich),
 "redFlags": [{ "title": string (max 6 Wörter), "severity": "hoch"|"mittel"|"niedrig", "note": string (1 konkreter Satz) }],
 "positives": [string (je 1 kurzer Punkt)],
 "negotiationLevers": [{ "lever": string (was du beim Verkäufer ansprichst), "rationale": string (warum das den Preis drückt) }],
 "repairBudget": string (grobe EUR-Spanne für erkennbare Sanierungen, "" wenn nichts erkennbar),
 "askNext": [string (je 1 wichtige Rückfrage, die der Käufer noch klären sollte)]
}
Erfinde nichts. Übersprungene oder unklare Antworten ignorierst du. Sei ehrlich: schwache Substanz = klare Worte. Maximal 6 redFlags, 5 positives, 5 negotiationLevers, 3 askNext.`;

type Ans = { q: string; a: string };

export async function POST(req: Request) {
  if (!rateLimit("viewreport_" + clientIp(req), 25, 60 * 60 * 1000)) return NextResponse.json(TOO_MANY, { status: 429 });
  try {
    const body = (await req.json()) as { answers?: Ans[]; property?: { city?: string; price?: number; area?: number } };
    const answers = Array.isArray(body.answers) ? body.answers : [];
    const qa = answers
      .filter((x) => x && x.a && String(x.a).trim())
      .map((x, i) => `${i + 1}. ${x.q}\n   Antwort: ${String(x.a).trim()}`)
      .join("\n");
    if (!qa.trim()) return NextResponse.json({ error: "Keine verwertbaren Antworten." }, { status: 400 });

    const p = body.property || {};
    const ctx = p.city || p.price
      ? `Objekt: ${p.city || "k.A."}${p.price ? `, Kaufpreis ${p.price} €` : ""}${p.area ? `, ${p.area} m²` : ""}.\n\n`
      : "";

    const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY, timeout: 50000 });
    const r = await client.chat.completions.create({
      model: "gpt-4o", temperature: 0.3, max_tokens: 900,
      response_format: { type: "json_object" },
      messages: [{ role: "system", content: SYS }, { role: "user", content: ctx + "Besichtigungs-Antworten:\n" + qa }],
    });
    const data = JSON.parse(r.choices[0]?.message?.content || "{}");
    return NextResponse.json(data);
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Auswertung fehlgeschlagen.";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
