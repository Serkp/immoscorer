import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { getSupabaseAdmin } from "@/lib/supabase";

/* Stripe-Client erst zur Laufzeit erzeugen — verhindert Modul-Ladeabsturz,
   wenn der Key fehlt (z. B. lokaler Build), und erlaubt eine saubere 503. */
function getStripe(): Stripe | null {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) return null;
  return new Stripe(key, {
    apiVersion: "2024-12-18.acacia" as Stripe.LatestApiVersion,
  });
}

export async function POST(req: NextRequest) {
  try {
    const stripe = getStripe();
    if (!stripe || !process.env.STRIPE_PRICE_ID) {
      return NextResponse.json(
        { error: "Zahlungen sind aktuell nicht konfiguriert." },
        { status: 503 },
      );
    }
    const { userId, email } = await req.json();

    const { data: existing } = await getSupabaseAdmin()
      .from("subscriptions")
      .select("stripe_customer_id")
      .eq("user_id", userId)
      .single();

    let customerId = existing?.stripe_customer_id;

    if (!customerId) {
      const customer = await stripe.customers.create({
        email,
        metadata: { userId },
      });
      customerId = customer.id;

      await getSupabaseAdmin().from("subscriptions").insert({
        user_id: userId,
        stripe_customer_id: customerId,
        status: "inactive",
      });
    }

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: "subscription",
      line_items: [{ price: process.env.STRIPE_PRICE_ID, quantity: 1 }],
      success_url: `${req.nextUrl.origin}/analysis?checkout=success`,
      cancel_url: `${req.nextUrl.origin}/analysis?checkout=cancel`,
      metadata: { userId },
    });

    return NextResponse.json({ url: session.url });
  } catch (error: unknown) {
    console.error("Stripe checkout error:", error);
    return NextResponse.json(
      { error: "Die Zahlung konnte nicht gestartet werden. Bitte später erneut versuchen." },
      { status: 500 },
    );
  }
}
