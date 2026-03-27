import { NextRequest, NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId, firstName, lastName, email, phone, message, propertyAddress, purchasePrice, monthlyRent, score } = body;

    if (!userId || !firstName || !lastName || !phone) {
      return NextResponse.json({ error: "Fehlende Pflichtfelder" }, { status: 400 });
    }

    const { error } = await getSupabase()
      .from("financing_leads")
      .insert({
        user_id: userId,
        first_name: firstName,
        last_name: lastName,
        contact_email: email || null,
        contact_phone: phone,
        message: message || null,
        property_address: propertyAddress || null,
        property_price: purchasePrice || null,
        monthly_rent: monthlyRent || null,
        score: score || null,
        status: "new",
      });

    if (error) {
      console.error("Financing lead insert error:", error);
      return NextResponse.json({ error: "Fehler beim Speichern" }, { status: 500 });
    }

    // Benachrichtigungen senden (non-blocking)
    const origin = req.nextUrl.origin;
    fetch(`${origin}/api/notify-lead`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        firstName: firstName || '',
        lastName: lastName || '',
        email: email || '',
        phone: phone || '',
        message: message || '',
        propertyAddress: propertyAddress || '',
        purchasePrice: purchasePrice || '',
        monthlyRent: monthlyRent || '',
        score: score || ''
      })
    }).catch(err => console.error('Notification failed:', err));

    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Unbekannter Fehler";
    console.error("Financing lead error:", msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
