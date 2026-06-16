import OpenAI from "openai";
import { NextResponse } from "next/server";
import { computeScore, type PropertyInput } from "@/lib/scoring";
import { rateLimit, clientIp, TOO_MANY } from "@/lib/rate-limit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

const EXTRACT_SYS = `Du extrahierst aus einer gesprochenen Immobilien-Beschreibung strukturierte Daten als JSON.
Gib NUR JSON zurück mit diesen Feldern:
{ "city": string, "street": string, "price": number, "rent": number (Kaltmiete pro Monat in EUR; falls Warmmiete genannt, ca. 20% abziehen),
 "area": number (m²), "year": number (Baujahr; 0 wenn unbekannt), "hausgeld": number (mtl., 0 wenn unbekannt),
 "energyClass": string ("A+".."H", "D" wenn unbekannt), "locationGrade": string ("A"|"B"|"C"|"D", "B" wenn unbekannt),
 "propertyType": string ("etw"|"efh"|"mfh"|"dhh", "etw" wenn unbekannt), "rooms": number (0 wenn unbekannt),
 "renovations": string[] (genannte Sanierungen/Mängel, sonst []),
 "missing": string[] (welche der Pflichtangaben Kaufpreis/Miete/Größe/Stadt FEHLEN) }
Rechne keine Werte, die nicht genannt wurden. Zahlen ohne Tausenderpunkte.`;

const VERDICT_SYS = `Du bist ein nüchterner, erfahrener Immobilien-Investor, der eine knappe Zweitmeinung gibt.
Auf Basis der berechneten Kennzahlen lieferst du JSON:
{ "verdict": string (1-2 Sätze gesprochenes Urteil, direkt, ehrlich, du-Form),
 "negotiationScript": string (1 konkreter Satz zum Vorlesen beim Verkäufer, mit Zielpreis falls sinnvoll),
 "keyPoint": string (der EINE wichtigste Punkt, max 8 Wörter) }
Kein Geschwafel, keine Floskeln. Wenn die Zahlen schwach sind, sag es klar.`;

function decisionFromScore(s: number): { label: string; color: string } {
  // s = totalScore (0-100)
  if (s >= 72) return { label: "KAUFEN", color: "#10B981" };
  if (s >= 50) return { label: "VERHANDELN", color: "#F59E0B" };
  return { label: "FINGER WEG", color: "#EF4444" };
}

export async function POST(req: Request) {
  if (!rateLimit("voice_" + clientIp(req), 8, 60 * 60 * 1000)) return NextResponse.json(TOO_MANY, { status: 429 });
  try {
    const form = await req.formData();
    const audio = form.get("audio") as File | null;
    const textInput = (form.get("text") as string) || "";
    const ctxPrev = ((form.get("context") as string) || "").trim();
    const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY, timeout: 45000 });

    let said = textInput.trim();
    if (!said && audio) {
      const tr = await client.audio.transcriptions.create({ file: audio, model: "whisper-1", language: "de" });
      said = (tr.text || "").trim();
    }
    if (!said) return NextResponse.json({ error: "Keine Eingabe erkannt." }, { status: 400 });
    // Kontext aus vorherigen Rückfragen voranstellen → die KI sieht alles bisher Gesagte
    const transcript = ctxPrev ? `${ctxPrev}. ${said}` : said;

    // 1) Daten extrahieren
    const ex = await client.chat.completions.create({
      model: "gpt-4o", temperature: 0, max_tokens: 500,
      response_format: { type: "json_object" },
      messages: [{ role: "system", content: EXTRACT_SYS }, { role: "user", content: transcript }],
    });
    const d = JSON.parse(ex.choices[0]?.message?.content || "{}");
    const missing: string[] = Array.isArray(d.missing) ? d.missing : [];
    if (!d.price || !d.rent || !d.area || !d.city) {
      return NextResponse.json({ needMore: true, transcript, missing: missing.length ? missing : ["Kaufpreis", "Kaltmiete", "Größe", "Stadt"] });
    }

    // 2) Engine
    const input: PropertyInput = {
      street: d.street || "", city: d.city, price: Number(d.price) || 0, rent: Number(d.rent) || 0,
      hausgeld: Number(d.hausgeld) || Math.round((Number(d.area) || 0) * 3.5),
      area: Number(d.area) || 0, year: Number(d.year) || 1990,
      energyClass: d.energyClass || "D", locationGrade: d.locationGrade || "B",
      renovations: Array.isArray(d.renovations) ? d.renovations : [],
      propertyType: d.propertyType || "etw", rooms: Number(d.rooms) || undefined,
    };
    const result = computeScore(input);
    const dec = decisionFromScore(result.totalScore);
    const pct = (x: number) => (x > 1 ? Math.round(x * 100) / 100 : Math.round(x * 10000) / 100);
    const netY = pct(result.kpis.netYield);
    const grossY = pct(result.kpis.grossYield);
    const factor = Math.round(result.kpis.factor * 10) / 10;
    const sqm = Math.round(result.kpis.sqmPrice);
    const cash = Math.round(result.kpis.netCashflow);
    const score10 = Math.round(result.totalScore) / 10;

    // 3) Urteil + Verhandlungs-Skript (sprachlich, geerdet an den echten Zahlen)
    const ctx = `Score: ${result.totalScore}/100 (${dec.label}). KPIs: Nettorendite ${netY}%, Bruttorendite ${grossY}%, Kaufpreisfaktor ${factor}, €/m² ${sqm}, Cashflow ${cash} €/Monat. Stärken: ${result.strengths.slice(0,3).join("; ")}. Risiken: ${result.risks.slice(0,3).join("; ")}. Objekt: ${input.city}, ${input.price} € Kaufpreis, ${input.rent} € Kaltmiete, ${input.area} m².`;
    const vd = await client.chat.completions.create({
      model: "gpt-4o", temperature: 0.4, max_tokens: 350,
      response_format: { type: "json_object" },
      messages: [{ role: "system", content: VERDICT_SYS }, { role: "user", content: ctx }],
    });
    const v = JSON.parse(vd.choices[0]?.message?.content || "{}");

    return NextResponse.json({
      transcript,
      score: score10,
      decision: dec.label, color: dec.color,
      keyPoint: v.keyPoint || "",
      verdict: v.verdict || "",
      negotiationScript: v.negotiationScript || "",
      kpis: { netYield: netY, grossYield: grossY, factor, sqmPrice: sqm, cashflow: cash },
      city: input.city, price: input.price,
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Fehler bei der Analyse.";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
