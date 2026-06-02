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
  const stripe = getStripe();
  if (!stripe) {
    return NextResponse.json(
      { error: "Stripe ist nicht konfiguriert." },
      { status: 503 },
    );
  }

  const body = await req.text();
  const sig = req.headers.get("stripe-signature");

  let event: Stripe.Event;

  try {
    if (
      !process.env.STRIPE_WEBHOOK_SECRET ||
      process.env.STRIPE_WEBHOOK_SECRET === "whsec_placeholder"
    ) {
      event = JSON.parse(body) as Stripe.Event;
    } else {
      if (!sig) {
        return NextResponse.json(
          { error: "Missing signature" },
          { status: 400 },
        );
      }
      event = stripe.webhooks.constructEvent(
        body,
        sig,
        process.env.STRIPE_WEBHOOK_SECRET,
      );
    }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Invalid signature";
    console.error("Webhook signature verification failed:", message);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  try {
    const supabaseAdmin = getSupabaseAdmin();

    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const userId = session.metadata?.userId;
        const subscriptionId = session.subscription as string;

        if (userId && subscriptionId) {
          const sub = await stripe.subscriptions.retrieve(subscriptionId) as unknown as Record<string, unknown>;
          const periodEnd = typeof sub.current_period_end === "number"
            ? new Date(sub.current_period_end * 1000).toISOString()
            : new Date().toISOString();
          await supabaseAdmin
            .from("subscriptions")
            .update({
              stripe_subscription_id: subscriptionId,
              status: "active",
              current_period_end: periodEnd,
            })
            .eq("user_id", userId);
        }
        break;
      }

      case "invoice.paid": {
        const paidInvoice = event.data.object as unknown as Record<string, unknown>;
        const paidSubId = paidInvoice.subscription as string;

        if (paidSubId) {
          const sub = await stripe.subscriptions.retrieve(paidSubId) as unknown as Record<string, unknown>;
          const periodEnd = typeof sub.current_period_end === "number"
            ? new Date(sub.current_period_end * 1000).toISOString()
            : new Date().toISOString();
          await supabaseAdmin
            .from("subscriptions")
            .update({
              status: "active",
              current_period_end: periodEnd,
            })
            .eq("stripe_subscription_id", paidSubId);
        }
        break;
      }

      case "invoice.payment_failed": {
        const failedInvoice = event.data.object as unknown as Record<string, unknown>;
        const failedSubId = failedInvoice.subscription as string;

        if (failedSubId) {
          await supabaseAdmin
            .from("subscriptions")
            .update({ status: "past_due" })
            .eq("stripe_subscription_id", failedSubId);
        }
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        await supabaseAdmin
          .from("subscriptions")
          .update({ status: "canceled" })
          .eq("stripe_subscription_id", subscription.id);
        break;
      }
    }
  } catch (error) {
    console.error("Webhook handler error:", error);
  }

  return NextResponse.json({ received: true });
}
