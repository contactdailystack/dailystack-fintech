/**
 * detect-ghost-subscriptions — DailyStack MVP Edge Function
 * Purpose: Find forgotten/unused subscriptions
 */

import { supabaseAdmin, verifyAuth, corsHeaders, jsonResponse, errorResponse } from '../_shared/index.ts';
import { z } from 'https://deno.land/x/zod@v3.22.4/mod.ts';

const InputSchema = z.object({
  user_id: z.string().uuid().optional(), // If provided, validate ownership
});

interface GhostSubscription {
  name: string;
  estimated_cost: number;
  confidence: number;
  billing_cycle: string;
  suggestion: string;
  category: string;
}

// Known ghost subscription patterns
const GHOST_PATTERNS = [
  { name: 'Netflix', category: 'Entertainment', base_cost: 299, confidence_boost: 0.2 },
  { name: 'Spotify', category: 'Entertainment', base_cost: 129, confidence_boost: 0.15 },
  { name: 'Disney+', category: 'Entertainment', base_cost: 199, confidence_boost: 0.2 },
  { name: 'YouTube Premium', category: 'Entertainment', base_cost: 199, confidence_boost: 0.15 },
  { name: 'Amazon Prime', category: 'Shopping', base_cost: 199, confidence_boost: 0.1 },
  { name: 'Microsoft 365', category: 'Productivity', base_cost: 349, confidence_boost: 0.15 },
  { name: 'Adobe CC', category: 'Productivity', base_cost: 1649, confidence_boost: 0.2 },
  { name: 'Dropbox', category: 'Cloud', base_cost: 199, confidence_boost: 0.1 },
  { name: 'iCloud+', category: 'Cloud', base_cost: 99, confidence_boost: 0.1 },
  { name: 'ChatGPT Plus', category: 'AI', base_cost: 650, confidence_boost: 0.25 },
  { name: 'Claude Pro', category: 'AI', base_cost: 590, confidence_boost: 0.25 },
];

Deno.serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  // Verify authentication
  const auth = await verifyAuth(req);
  if (!auth) {
    return errorResponse('Unauthorized', 401);
  }
  const userId = auth.userId;

  // Parse and validate input
  let userIdOverride: string | undefined;
  try {
    const body = await req.json();
    const parsed = InputSchema.safeParse(body);
    if (!parsed.success) {
      return errorResponse('Invalid input: ' + parsed.error.message, 400);
    }
    userIdOverride = parsed.data.user_id;
  } catch {
    // No body provided — use auth user_id
  }

  // Validate ownership if user_id provided
  const targetUserId = userIdOverride || userId;
  if (userIdOverride && userIdOverride !== userId) {
    return errorResponse('Cannot access other users data', 403);
  }

  try {
    // Get user's existing subscriptions from the database
    const { data: subscriptions, error: subError } = await supabaseAdmin
      .from('subscriptions')
      .select('name, cost, billing_cycle, category, next_billing_date, created_at')
      .eq('user_id', targetUserId)
      .eq('is_active', true);

    if (subError) throw subError;

    // Also check user_subscriptions table
    const { data: userSubs, error: userSubError } = await supabaseAdmin
      .from('user_subscriptions')
      .select('plan_name, price_thb, created_at')
      .eq('user_id', targetUserId)
      .eq('status', 'active');

    if (userSubError) console.warn('user_subscriptions query failed:', userSubError);

    // Get transaction history to analyze spending patterns
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const { data: transactions } = await supabaseAdmin
      .from('transactions')
      .select('amount, category, description, created_at')
      .eq('user_id', targetUserId)
      .gte('created_at', thirtyDaysAgo.toISOString());

    // Detect potential ghosts
    const detectedGhosts: GhostSubscription[] = [];
    const activeSubNames = new Set(
      (subscriptions || []).map(s => s.name.toLowerCase())
    );

    for (const pattern of GHOST_PATTERNS) {
      // Skip if user already has this subscription
      if (activeSubNames.has(pattern.name.toLowerCase())) continue;

      // Check transactions for this pattern
      const matchingTx = (transactions || []).filter(t =>
        t.description?.toLowerCase().includes(pattern.name.toLowerCase()) ||
        t.category?.toLowerCase().includes(pattern.name.toLowerCase())
      );

      if (matchingTx.length === 0) {
        // No recent transactions — likely a ghost
        const confidence = 0.3 + pattern.confidence_boost;

        if (confidence >= 0.5) {
          detectedGhosts.push({
            name: pattern.name,
            estimated_cost: pattern.base_cost,
            confidence,
            billing_cycle: 'monthly',
            suggestion: `คุณอาจถูก charge ${pattern.name} โดยไม่รู้ตัว ตรวจสอบ statement ของคุณได้เลย`,
            category: pattern.category,
          });
        }
      }
    }

    // Store detected ghosts in database
    for (const ghost of detectedGhosts) {
      await supabaseAdmin.from('ghost_subscriptions').upsert({
        user_id: targetUserId,
        detected_name: ghost.name,
        estimated_cost: ghost.estimated_cost,
        confidence_score: ghost.confidence,
        status: 'pending',
        billing_cycle: ghost.billing_cycle,
        category: ghost.category,
        suggested_action: ghost.suggestion,
      }, {
        onConflict: 'user_id,detected_name',
      });
    }

    return jsonResponse({
      ghosts: detectedGhosts,
      total_monthly_cost: detectedGhosts.reduce((sum, g) => sum + g.estimated_cost, 0),
      analyzed_count: detectedGhosts.length,
      user_id: targetUserId,
    });

  } catch (err) {
    console.error('Ghost detection error:', err);
    return errorResponse('Internal server error', 500);
  }
});
