import { NextResponse } from "next/server";
import { PDFParse } from "pdf-parse";

// Allow up to 10 MB uploads
export const config = {
  api: {
    bodyParser: false,
    responseLimit: false,
  },
};

export const maxDuration = 30;

export async function POST(request: Request) {
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

    const buffer = Buffer.from(await file.arrayBuffer());

    const pdf = new PDFParse({ data: new Uint8Array(buffer) });
    const textResult = await pdf.getText();
    await pdf.destroy();

    const text = textResult.text?.trim();

    if (!text || text.length < 20) {
      return NextResponse.json(
        { error: "Die PDF enthält keinen lesbaren Text. Möglicherweise handelt es sich um ein gescanntes Dokument." },
        { status: 422 },
      );
    }

    return NextResponse.json({
      text,
      pages: textResult.total,
    });
  } catch (error) {
    console.error("[parse-pdf] error:", error);
    return NextResponse.json(
      { error: "Fehler beim Verarbeiten der PDF. Bitte versuchen Sie es erneut." },
      { status: 500 },
    );
  }
}
