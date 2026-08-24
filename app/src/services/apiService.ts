/**
 * apiService.ts — DailyStack Frontend API Service
 * Wrapper for all Supabase Edge Function calls
 * Provides unified error handling, auth, and retry logic
 */

import { supabase } from '../supabaseClient';

// ─── Types ─────────────────────────────────────────────────────────
export interface GhostResult {
  name: string;
  estimated_cost: number;
  confidence: number;
  billing_cycle: string;
  suggestion: string;
  category: string;
}

export interface AlertResult {
  alert_level: 'safe' | 'warning' | 'danger';
  percentage_used: number;
  threshold_amount: number;
  current_spent: number;
  remaining: number;
  message: string;
  message_en: string;
  category: string;
}

export interface InsightTraits {
  impulse_rating: number;
  future_orientation: number;
  value_seeking: number;
  social_resistance: number;
}

export interface InsightsResult {
  archetype_name: string;
  archetype_label_th: string;
  archetype_label_en: string;
  traits: InsightTraits;
  overall_score: number;
  insights: string[];
  recommendations: string[];
  compared_to_peers: number;
  is_mock: boolean;
}

export interface AnalysisResult {
  insights: string[];
  patterns: {
    total_spent: number;
    transaction_count: number;
    avg_per_transaction: number;
    top_category: string;
    weekend_ratio: number;
    impulse_spikes: number;
    categories: Array<{ category: string; total: number; percentage: number }>;
  };
  recommendations: string[];
  period_days: number;
  is_mock: boolean;
}

export interface ApiError {
  error: string;
  status?: number;
}

// ─── Edge Function Base URL ────────────────────────────────────────
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

// ─── Retry Helper ───────────────────────────────────────────────────
async function withRetry<T>(
  fn: () => Promise<T>,
  retries = 2,
  delay = 1000
): Promise<T> {
  for (let i = 0; i <= retries; i++) {
    try {
      return await fn();
    } catch (err) {
      if (i === retries) throw err;
      await new Promise(r => setTimeout(r, delay * Math.pow(2, i)));
    }
  }
  throw new Error('Should not reach here');
}

// ─── Token Refresh Helper ─────────────────────────────────────────────
async function refreshTokenIfNeeded(): Promise<string | null> {
  const { data: session } = await supabase.auth.getSession();
  const token = session?.session?.access_token;

  if (!token) {
    // Try to refresh the session
    const { error } = await supabase.auth.refreshSession();
    if (error) {
      console.warn('[apiService] Token refresh failed:', error.message);
      return null;
    }
    const { data: newSession } = await supabase.auth.getSession();
    return newSession?.session?.access_token || null;
  }

  return token;
}

// ─── Custom Error Types ─────────────────────────────────────────────
export class TokenExpiredError extends Error {
  constructor() {
    super('Session expired. Please log in again.');
    this.name = 'TokenExpiredError';
  }
}

// Renamed to avoid conflict with ApiError interface
export class ApiHttpError extends Error {
  statusCode: number;
  constructor(message: string, status: number) {
    super(message);
    this.name = 'ApiHttpError';
    this.statusCode = status;
  }
}

// ─── Generic Edge Function Caller ───────────────────────────────────
async function callEdgeFunction<T>(
  functionName: string,
  body?: Record<string, unknown>,
  options?: { retries?: number }
): Promise<T> {
  let token = await refreshTokenIfNeeded();

  if (!token) {
    throw new TokenExpiredError();
  }

  const callWithToken = async (authToken: string): Promise<T> => {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'apikey': ANON_KEY,
      'Authorization': `Bearer ${authToken}`,
    };

    const fetchOptions: RequestInit = {
      method: body ? 'POST' : 'GET',
      headers,
    };
    if (body) {
      fetchOptions.body = JSON.stringify(body);
    }

    const url = `${SUPABASE_URL}/functions/v1/${functionName}`;

    const res = await fetch(url, fetchOptions);

    // Handle 401 Unauthorized — try one token refresh
    if (res.status === 401) {
      const newToken = await refreshTokenIfNeeded();
      if (newToken && newToken !== authToken) {
        // Retry with new token
        const retryHeaders = { ...headers, 'Authorization': `Bearer ${newToken}` };
        const retryRes = await fetch(url, { ...fetchOptions, headers: retryHeaders });
        if (!retryRes.ok) {
          const errorData = await retryRes.json().catch(() => ({ error: 'Unknown error' }));
          throw new ApiHttpError(errorData.error || `HTTP ${retryRes.status}`, retryRes.status);
        }
        return retryRes.json() as Promise<T>;
      }
      throw new TokenExpiredError();
    }

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({ error: 'Unknown error' }));
      throw new ApiHttpError(errorData.error || `HTTP ${res.status}`, res.status);
    }

    return res.json() as Promise<T>;
  };

  const response = await withRetry(async () => {
    return callWithToken(token!);
  }, options?.retries ?? 1);

  return response;
}

// ─── API Service ───────────────────────────────────────────────────
export const apiService = {
  /**
   * Detect ghost subscriptions — find forgotten subscriptions
   */
  async detectGhosts(): Promise<{ ghosts: GhostResult[]; total_monthly_cost: number }> {
    try {
      return await callEdgeFunction<{ ghosts: GhostResult[]; total_monthly_cost: number }>(
        'detect-ghost-subscriptions'
      );
    } catch (err) {
      console.warn('[apiService] detectGhosts failed, returning empty:', err);
      return { ghosts: [], total_monthly_cost: 0 };
    }
  },

  /**
   * Check budget alert level for a category
   */
  async checkBudgetAlert(
    category: string,
    spent: number,
    limit: number
  ): Promise<AlertResult> {
    try {
      return await callEdgeFunction<AlertResult>('check-budget-alerts', {
        category,
        spent,
        limit,
      });
    } catch (err) {
      console.warn('[apiService] checkBudgetAlert failed, computing locally:', err);
      // Fallback: compute locally
      const pct = (spent / limit) * 100;
      const alertLevel = pct >= 90 ? 'danger' : pct >= 70 ? 'warning' : 'safe';
      return {
        alert_level: alertLevel,
        percentage_used: Math.round(pct),
        threshold_amount: limit,
        current_spent: spent,
        remaining: Math.max(0, limit - spent),
        message: `งบ${category}ใช้ไป ${Math.round(pct)}% แล้ว`,
        message_en: `${category} at ${Math.round(pct)}%`,
        category,
      };
    }
  },

  /**
   * Get AI financial insights — user's archetype and traits
   */
  async getUserInsights(): Promise<InsightsResult> {
    try {
      return await callEdgeFunction<InsightsResult>('user-insights');
    } catch (err) {
      console.warn('[apiService] getUserInsights failed:', err);
      return {
        archetype_name: 'balanced_saver',
        archetype_label_th: 'นักออมสมดุล',
        archetype_label_en: 'Balanced Saver',
        traits: { impulse_rating: 50, future_orientation: 50, value_seeking: 50, social_resistance: 50 },
        overall_score: 50,
        insights: ['เพิ่มรายการแรกเพื่อให้ AI เรียนรู้พฤติกรรมของคุณ'],
        recommendations: ['เริ่มบันทึกรายจ่ายวันนี้เพื่อดูมิติการเงินของคุณ'],
        compared_to_peers: 50,
        is_mock: true,
      };
    }
  },

  /**
   * Analyze spending patterns
   */
  async analyzeSpending(periodDays = 30): Promise<AnalysisResult> {
    try {
      return await callEdgeFunction<AnalysisResult>('analyze-spending', {
        period_days: periodDays,
      });
    } catch (err) {
      console.warn('[apiService] analyzeSpending failed:', err);
      return {
        insights: ['เพิ่มรายการธุรกรรมเพื่อรับการวิเคราะห์'],
        patterns: { total_spent: 0, transaction_count: 0, avg_per_transaction: 0, top_category: '-', weekend_ratio: 0, impulse_spikes: 0, categories: [] },
        recommendations: ['เริ่มบันทึกรายจ่ายวันนี้'],
        period_days: periodDays,
        is_mock: true,
      };
    }
  },
};

export default apiService;
