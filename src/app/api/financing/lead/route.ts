import { NextRequest, NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId, property, price, score, name, email, phone, message } = body;

    if (!userId || !name || !email) {
      return NextResponse.json({ error: "Fehlende Pflichtfelder" }, { status: 400 });
    }

    const { error } = await getSupabase()
      .from("financing_leads")
      .insert({
        user_id: userId,
        property_address: property,
        property_price: price,
        score,
        contact_name: name,
        contact_email: email,
        contact_phone: phone || null,
        message: message || null,
        status: "new",
      });

    if (error) {
      console.error("Financing lead insert error:", error);
      return NextResponse.json({ error: "Fehler beim Speichern" }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Unbekannter Fehler";
    console.error("Financing lead error:", msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
