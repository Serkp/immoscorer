import { NextRequest, NextResponse } from "next/server";
import { rateLimit, clientIp, TOO_MANY } from "@/lib/rate-limit";

const GOOGLE_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_PLACES_API_KEY;

export async function GET(req: NextRequest) {
  if (!rateLimit(`places-details:${clientIp(req)}`, 60, 60_000)) {
    return NextResponse.json(TOO_MANY.body, { status: TOO_MANY.status });
  }
  const placeId = req.nextUrl.searchParams.get("placeId");

  if (!placeId) {
    return NextResponse.json({ error: "placeId fehlt" }, { status: 400 });
  }

  if (!GOOGLE_API_KEY) {
    return NextResponse.json({ error: "API Key nicht konfiguriert" }, { status: 500 });
  }

  try {
    const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${encodeURIComponent(placeId)}&fields=address_components,geometry,formatted_address&language=de&key=${GOOGLE_API_KEY}`;
    const res = await fetch(url);
    const data = await res.json();

    if (data.status !== "OK") {
      console.error("Google Details error:", data.status, data.error_message);
      return NextResponse.json({ error: "Adresse konnte nicht geladen werden." }, { status: 400 });
    }

    const result = data.result;
    let street = "";
    let streetNumber = "";
    let city = "";
    let postalCode = "";
    let state = "";

    for (const comp of result.address_components || []) {
      const types: string[] = comp.types;
      if (types.includes("route")) street = comp.long_name;
      if (types.includes("street_number")) streetNumber = comp.long_name;
      if (types.includes("locality")) city = comp.long_name;
      if (types.includes("postal_code")) postalCode = comp.long_name;
      if (types.includes("administrative_area_level_1")) state = comp.long_name;
    }

    const fullStreet = streetNumber ? `${street} ${streetNumber}` : street;

    return NextResponse.json({
      street: fullStreet,
      city,
      postalCode,
      state,
      lat: result.geometry?.location?.lat ?? 0,
      lng: result.geometry?.location?.lng ?? 0,
      formattedAddress: result.formatted_address || "",
    });
  } catch (error: unknown) {
    console.error("Places details error:", error);
    return NextResponse.json({ error: "Adresse konnte nicht geladen werden." }, { status: 500 });
  }
}
