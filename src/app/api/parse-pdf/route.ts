import { NextResponse } from "next/server";
import { createRequire } from "node:module";
import { rateLimit, clientIp, TOO_MANY } from "@/lib/rate-limit";

export const maxDuration = 30;
export const dynamic = "force-dynamic";

// Use createRequire to bypass webpack bundling — pdfjs-dist doesn't work with webpack
const nodeRequire = createRequire(import.meta.url);

async function parsePdfBuffer(data: Uint8Array): Promise<{ text: string; pages: number }> {
  const { PDFParse } = nodeRequire("pdf-parse");

  const pdf = new PDFParse({ data });
  try {
    const result = await pdf.getText();
    const text = (result.text || "").replace(/\n-- \d+ of \d+ --$/gm, "").trim();
    return { text, pages: result.total || 0 };
  } finally {
    await pdf.destroy().catch(() => {});
  }
}

export async function POST(request: Request) {
  if (!rateLimit(`parse-pdf:${clientIp(request)}`, 10, 60_000)) {
    return NextResponse.json(TOO_MANY.body, { status: TOO_MANY.status });
  }
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "Keine Datei hochgeladen." }, { status: 400 });
    }

    if (file.type !== "application/pdf") {
      return NextResponse.json({ error: "Nur PDF-Dateien werden akzeptiert." }, { status: 400 });
    }

    // 10 MB limit
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ error: "Die Datei darf maximal 10 MB groß sein." }, { status: 400 });
    }

    const arrayBuf = await file.arrayBuffer();

    let text = "";
    let pages = 0;

    try {
      const result = await parsePdfBuffer(new Uint8Array(arrayBuf));
      text = result.text;
      pages = result.pages;
    } catch (parseError) {
      console.error("[parse-pdf] PDF parsing failed:", parseError);
      return NextResponse.json(
        { error: "Die PDF konnte nicht gelesen werden. Bitte stellen Sie sicher, dass es sich um eine gültige PDF-Datei handelt." },
        { status: 422 },
      );
    }

    if (!text || text.length < 20) {
      return NextResponse.json(
        { error: "Die PDF enthält keinen lesbaren Text. Möglicherweise handelt es sich um ein gescanntes Dokument." },
        { status: 422 },
      );
    }

    return NextResponse.json({ text, pages });
  } catch (error) {
    console.error("[parse-pdf] error:", error);
    return NextResponse.json(
      { error: "Fehler beim Verarbeiten der PDF. Bitte versuchen Sie es erneut." },
      { status: 500 },
    );
  }
}
