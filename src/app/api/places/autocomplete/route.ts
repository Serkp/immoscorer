import { NextRequest, NextResponse } from "next/server";
import { rateLimit, clientIp, TOO_MANY } from "@/lib/rate-limit";

const GOOGLE_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_PLACES_API_KEY;

export async function GET(req: NextRequest) {
  if (!rateLimit(`places-autocomplete:${clientIp(req)}`, 60, 60_000)) {
    return NextResponse.json({ predictions: [], ...TOO_MANY.body }, { status: TOO_MANY.status });
  }
  const input = req.nextUrl.searchParams.get("input");

  if (!input || input.length < 2) {
    return NextResponse.json({ predictions: [] });
  }

  if (!GOOGLE_API_KEY) {
    return NextResponse.json({ error: "API Key nicht konfiguriert" }, { status: 500 });
  }

  try {
    const url = `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(input)}&types=address&components=country:de&language=de&key=${GOOGLE_API_KEY}`;
    const res = await fetch(url);
    const data = await res.json();

    if (data.status !== "OK" && data.status !== "ZERO_RESULTS") {
      console.error("Google Autocomplete error:", data.status, data.error_message);
      return NextResponse.json({ predictions: [] });
    }

    const predictions = (data.predictions || []).slice(0, 5).map(
      (p: { place_id: string; structured_formatting: { main_text: string; secondary_text?: string } }) => ({
        placeId: p.place_id,
        main: p.structured_formatting.main_text,
        secondary: p.structured_formatting.secondary_text || "",
      })
    );

    return NextResponse.json({ predictions });
  } catch (error: unknown) {
    console.error("Places autocomplete error:", error);
    return NextResponse.json({ predictions: [] }, { status: 500 });
  }
}
