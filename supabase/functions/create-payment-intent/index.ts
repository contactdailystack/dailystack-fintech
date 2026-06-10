/**
 * create-payment-intent/index.ts
 * Supabase Edge Function — creates Stripe PaymentIntent with PromptPay QR.
 * Returns QR payload for client-side rendering.
 */
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import Stripe from "https://esm.sh/stripe@14.0.0?target=deno";

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") ?? "", {
  apiVersion: "2023-10-16",
  httpClient: Stripe.createFetchHttpClient(),
});

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // ── Auth ──────────────────────────────────────────────────────────────
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Missing Authorization header" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? ""
    );
    const { data: { user }, error: authError } = await supabase.auth.getUser(
      authHeader.replace("Bearer ", "")
    );
    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ── Parse body ────────────────────────────────────────────────────────
    const { tier, action, payment_intent_id, amount: clientAmount, currency = "thb", userId, productName } = await req.json();

    // ── check_status action ────────────────────────────────────────────────
    if (action === "check_status") {
      if (!payment_intent_id) {
        return new Response(JSON.stringify({ error: "Missing payment_intent_id" }), {
          status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const pi = await stripe.paymentIntents.retrieve(payment_intent_id);
      return new Response(
        JSON.stringify({ status: pi.status }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Server-side price enforcement - never trust client amount
    const prices: Record<string, number> = {
      pro: parseInt(Deno.env.get("STRIPE_PRICE_PRO") ?? "99"),
      elite: parseInt(Deno.env.get("STRIPE_PRICE_ELITE") ?? "199"),
    };
    const amount = prices[tier];
    if (!amount) {
      return new Response(JSON.stringify({ error: "Invalid tier" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const stripeAmount = Math.round(amount * 100);

    const paymentIntent = await stripe.paymentIntents.create({
      amount: stripeAmount,
      currency,
      payment_method_types: ["promptpay"],
      metadata: {
        userId: user.id,
        tier,
        productName: productName ?? `DailyStack ${tier.toUpperCase()}`,
      },
      description: `DailyStack ${tier.toUpperCase()} subscription`,
      receipt_settings: {
        allowed_usernames: undefined,
      },
    });

    // ── Generate QR code from QR data ──────────────────────────────────────
    const qrData = paymentIntent.next_action?.promptpay_display_qr_code?.qr_data;
    if (!qrData) {
      return new Response(JSON.stringify({ error: "PromptPay QR not available. Please ensure your Stripe account is enabled for PromptPay." }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Build a data URL for the QR code image (client will display it as <img>)
    // We'll return the raw QR string — client encodes to QR via qrcode library
    const expiresAt = paymentIntent.next_action?.promptpay_display_qr_code?.expires_at
      ? Math.floor(new Date(paymentIntent.next_action.promptpay_display_qr_code.expires_at).getTime() / 1000)
      : Math.floor(Date.now() / 1000) + 15 * 60; // default 15 min

    return new Response(
      JSON.stringify({
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id,
        qrData, // raw QR payload string
        amount: paymentIntent.amount,
        currency: paymentIntent.currency,
        expiresAt,
        status: paymentIntent.status,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (err: unknown) {
    console.error("[create-payment-intent] Error:", err);
    const message = err instanceof Error ? err.message : "Internal server error";
    return new Response(JSON.stringify({ error: message }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
