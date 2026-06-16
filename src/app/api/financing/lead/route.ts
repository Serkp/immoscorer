import { NextRequest, NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";
import { rateLimit, clientIp, TOO_MANY } from "@/lib/rate-limit";

export async function POST(req: NextRequest) {
  if (!rateLimit(`financing-lead:${clientIp(req)}`, 5, 60_000)) {
    return NextResponse.json(TOO_MANY.body, { status: TOO_MANY.status });
  }
  try {
    const body = await req.json();
    const { userId, firstName, lastName, email, phone, message, propertyAddress, purchasePrice, monthlyRent, score } = body;

    if (!firstName || !lastName || !phone) {
      return NextResponse.json({ error: "Fehlende Pflichtfelder" }, { status: 400 });
    }

    // DB-Eintrag nur für eingeloggte Nutzer (Tabelle ist an user_id gebunden).
    // Anonyme Leads werden trotzdem zugestellt (Benachrichtigung unten) — kein Lead geht verloren.
    if (userId) {
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
      if (error) console.error("Financing lead insert error:", error);
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
