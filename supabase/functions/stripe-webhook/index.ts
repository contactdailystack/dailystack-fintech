/**
 * stripe-webhook/index.ts
 * Supabase Edge Function — handles Stripe webhook events.
 * Confirms payment success and upgrades user tier in database.
 */
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import Stripe from "https://esm.sh/stripe@14.0.0?target=deno";

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") ?? "", {
  apiVersion: "2023-10-16",
  httpClient: Stripe.createFetchHttpClient(),
});

const endpointSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET") ?? "";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, stripe-signature",
};

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.text();
    const signature = req.headers.get("stripe-signature");

    if (!signature) {
      return new Response(JSON.stringify({ error: "Missing stripe-signature header" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Verify webhook signature
    let event: Stripe.Event;
    try {
      event = await stripe.webhooks.constructEventAsync(body, signature, endpointSecret);
    } catch (webhookErr: unknown) {
      const msg = webhookErr instanceof Error ? webhookErr.message : "Webhook verification failed";
      console.error("[stripe-webhook] Signature verification failed:", msg);
      return new Response(JSON.stringify({ error: msg }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    // ── Handle events ──────────────────────────────────────────────────────
    switch (event.type) {
      case "payment_intent.succeeded": {
        const pi = event.data.object as Stripe.PaymentIntent;
        const tier = pi.metadata?.tier;
        const userId = pi.metadata?.userId;

        if (!userId || !tier) {
          console.error("[stripe-webhook] Missing metadata on PI:", pi.id);
          break;
        }

        console.log(`[stripe-webhook] Payment succeeded for user ${userId}, tier=${tier}`);

        // P0 Security Fix: validate amount matches expected tier price
        // This prevents clients from hacking metadata to upgrade to expensive tiers at cheap prices
        const expectedPrices: Record<string, number> = {
          pro: parseInt(Deno.env.get("STRIPE_PRICE_PRO") ?? "9900"),
          elite: parseInt(Deno.env.get("STRIPE_PRICE_ELITE") ?? "19900"),
        };
        const expectedAmount = expectedPrices[tier];
        if (!expectedAmount || pi.amount !== expectedAmount) {
          console.error(`[stripe-webhook] Amount mismatch: expected ${expectedAmount} satang for tier ${tier}, got ${pi.amount}`);
          break; // Don't upgrade - amount doesn't match
        }

        // Upgrade user tier in users table
        const { error: updateError } = await supabaseAdmin
          .from("users")
          .update({ subscription_tier: tier, updated_at: new Date().toISOString() })
          .eq("id", userId);

        if (updateError) {
          console.error("[stripe-webhook] Failed to update profile:", updateError);
          throw updateError;
        }

        // Create subscription record
        const { error: subError } = await supabaseAdmin
          .from("user_subscriptions")
          .insert({
            user_id: userId,
            subscription_tier: tier,
            plan_name: `DailyStack ${tier.toUpperCase()}`,
            plan_type: "monthly",
            price_thb: pi.amount / 100, // derived from actual charged amount
            currency: "THB",
            status: "active",
            expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // +30 days
          });

        if (subError) {
          console.error("[stripe-webhook] Failed to create subscription:", subError);
          // Non-fatal — profile is updated
        }

        break;
      }

      case "payment_intent.payment_failed": {
        const pi = event.data.object as Stripe.PaymentIntent;
        console.warn("[stripe-webhook] Payment failed:", pi.id, pi.last_payment_error?.message);
        break;
      }

      default:
        console.log("[stripe-webhook] Unhandled event type:", event.type);
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err: unknown) {
    console.error("[stripe-webhook] Error:", err);
    const message = err instanceof Error ? err.message : "Internal server error";
    return new Response(JSON.stringify({ error: message }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
