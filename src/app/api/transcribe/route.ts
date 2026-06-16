import OpenAI from "openai";
import { NextResponse } from "next/server";
import { rateLimit, clientIp, TOO_MANY } from "@/lib/rate-limit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 30;

// Reine Whisper-Transkription (für den Besichtigungs-Begleiter, eine Antwort pro Frage).
export async function POST(req: Request) {
  if (!rateLimit("transcribe_" + clientIp(req), 80, 60 * 60 * 1000)) return NextResponse.json(TOO_MANY, { status: 429 });
  try {
    const form = await req.formData();
    const audio = form.get("audio") as File | null;
    if (!audio) return NextResponse.json({ error: "Keine Audio-Daten." }, { status: 400 });
    const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY, timeout: 28000 });
    const tr = await client.audio.transcriptions.create({ file: audio, model: "whisper-1", language: "de" });
    return NextResponse.json({ text: (tr.text || "").trim() });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Transkription fehlgeschlagen.";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
