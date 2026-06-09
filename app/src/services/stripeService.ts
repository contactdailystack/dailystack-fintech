/**
 * stripeService.ts
 * Client-side Stripe service for PromptPay QR payments.
 */

export interface PaymentIntentResult {
  clientSecret: string;
  paymentIntentId: string;
  qrData: string;
  amount: number;
  currency: string;
  expiresAt: number;
}

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL ?? "";
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY ?? "";

function edgeUrl(path: string) {
  return `${SUPABASE_URL}/functions/v1/${path}`;
}

async function authedFetch(url: string, options: RequestInit = {}) {
  const res = await fetch(url, {
    ...options,
    headers: {
      Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
      "Content-Type": "application/json",
      ...options.headers,
    },
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: "Unknown error" }));
    throw new Error(err.error ?? `HTTP ${res.status}`);
  }
  return res.json();
}

/**
 * Create a Stripe PaymentIntent with PromptPay QR for the specified tier.
 * Amount is computed server-side - client only sends tier.
 */
export async function createPromptPayPayment(
  tier: "pro" | "elite"
): Promise<PaymentIntentResult> {
  return authedFetch(edgeUrl("create-payment-intent"), {
    method: "POST",
    body: JSON.stringify({
      tier,
      currency: "thb",
      productName: `DailyStack ${tier.toUpperCase()} Plan`,
    }),
  });
}

/**
 * Poll payment status from Stripe via Edge Function.
 * Returns: { status: "pending" | "succeeded" | "failed" | "cancelled" | "expired" }
 */
export async function checkPaymentStatus(paymentIntentId: string): Promise<{
  status: "pending" | "succeeded" | "failed" | "cancelled" | "expired";
}> {
  return authedFetch(
    `${edgeUrl("create-payment-intent")}?payment_intent_id=${paymentIntentId}`
  );
}
