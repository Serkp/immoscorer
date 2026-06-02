import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { getSupabaseAdmin } from "@/lib/supabase";

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
    if (!stripe) {
      return NextResponse.json(
        { error: "Zahlungen sind aktuell nicht konfiguriert." },
        { status: 503 },
      );
    }
    const { userId } = await req.json();

    const { data } = await getSupabaseAdmin()
      .from("subscriptions")
      .select("stripe_customer_id")
      .eq("user_id", userId)
      .single();

    if (!data?.stripe_customer_id) {
      return NextResponse.json({ error: "Kein Abo gefunden" }, { status: 404 });
    }

    const session = await stripe.billingPortal.sessions.create({
      customer: data.stripe_customer_id,
      return_url: `${req.nextUrl.origin}/analysis`,
    });

    return NextResponse.json({ url: session.url });
  } catch (error: unknown) {
    console.error("Stripe portal error:", error);
    return NextResponse.json(
      { error: "Das Kundenportal konnte nicht geöffnet werden. Bitte später erneut versuchen." },
      { status: 500 },
    );
  }
}
