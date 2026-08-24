/**
 * ============================================================
 * DailyStack Validation Library — Zod Schemas
 * ============================================================
 * Centralized input validation for all data entering the app.
 * Use these schemas BEFORE sending data to Supabase.
 */

import { z } from 'zod';

// ─── Auth Schemas ────────────────────────────────────────────────
export const SignUpSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least 1 uppercase letter')
    .regex(/[0-9]/, 'Password must contain at least 1 number'),
  fullName: z.string().min(1).max(100).optional(),
});

export const SignInSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(1, 'Password is required'),
});

// ─── Transaction Schemas ──────────────────────────────────────────
export const TransactionCreateSchema = z.object({
  amount: z.number().positive('Amount must be positive'),
  category: z.string().min(1).max(50),
  description: z.string().max(200).optional().default(''),
  date: z.string().datetime().optional(),
  type: z.enum(['income', 'expense', 'transfer']),
  wallet_id: z.string().uuid().optional(),
});

export const TransactionUpdateSchema = z.object({
  id: z.string().uuid(),
  amount: z.number().positive().optional(),
  category: z.string().min(1).max(50).optional(),
  description: z.string().max(200).optional(),
  date: z.string().datetime().optional(),
  type: z.enum(['income', 'expense', 'transfer']).optional(),
});

// ─── Subscription Schemas ─────────────────────────────────────────
export const SubscriptionCreateSchema = z.object({
  name: z.string().min(1).max(100),
  cost: z.number().positive('Cost must be positive'),
  billing_cycle: z.enum(['monthly', 'yearly', 'weekly']),
  category: z.string().min(1).max(50).default('other'),
  next_billing_date: z.string().datetime(),
  notes: z.string().max(500).optional(),
  is_active: z.boolean().default(true),
});

export const SubscriptionUpdateSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).max(100).optional(),
  cost: z.number().positive().optional(),
  billing_cycle: z.enum(['monthly', 'yearly', 'weekly']).optional(),
  category: z.string().min(1).max(50).optional(),
  next_billing_date: z.string().datetime().optional(),
  notes: z.string().max(500).optional(),
  is_active: z.boolean().optional(),
});

// ─── Budget Schemas ───────────────────────────────────────────────
export const BudgetSchema = z.object({
  month: z.number().int().min(1).max(12),
  year: z.number().int().min(2020).max(2100),
  income: z.number().min(0).default(0),
  expenses: z.number().min(0).default(0),
});

export const BudgetCategorySchema = z.object({
  category_name: z.string().min(1).max(50),
  monthly_limit: z.number().positive(),
  color_code: z.string().regex(/^#[0-9A-Fa-f]{6}$/).default('#0FB0CE'),
  icon_name: z.string().max(50).default('ShoppingCart'),
  sort_order: z.number().int().min(0).default(0),
});

// ─── Goal Schemas ─────────────────────────────────────────────────
export const GoalCreateSchema = z.object({
  goal_name: z.string().min(1).max(100),
  target_amount: z.number().positive(),
  current_amount: z.number().min(0).default(0),
  target_date: z.string().datetime().optional(),
  icon_name: z.string().max(50).default('Target'),
  color_code: z.string().regex(/^#[0-9A-Fa-f]{6}$/).default('#0FB0CE'),
});

export const GoalUpdateSchema = z.object({
  id: z.string().uuid(),
  goal_name: z.string().min(1).max(100).optional(),
  target_amount: z.number().positive().optional(),
  current_amount: z.number().min(0).optional(),
  target_date: z.string().datetime().optional(),
  icon_name: z.string().max(50).optional(),
  color_code: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
  status: z.enum(['in_progress', 'achieved', 'paused']).optional(),
});

// ─── Profile Schemas ──────────────────────────────────────────────
export const ProfileUpdateSchema = z.object({
  full_name: z.string().min(1).max(100).optional(),
  phone: z.string().regex(/^\+?[0-9]{10,15}$/).optional(),
  avatar_url: z.string().url().optional(),
  preferred_currency: z.enum(['THB', 'USD', 'EUR']).default('THB'),
  language: z.enum(['th', 'en']).default('th'),
});

// ─── Alert Schemas ────────────────────────────────────────────────
export const BudgetAlertSchema = z.object({
  category_name: z.string().min(1).max(50),
  alert_type: z.enum(['warning', 'danger', 'milestone']),
  threshold_amount: z.number().positive().optional(),
  current_spent: z.number().min(0).optional(),
  percentage_used: z.number().min(0).max(100).optional(),
  message: z.string().max(500).optional(),
});

// ─── Ghost Subscription Schemas ────────────────────────────────────
export const GhostSubscriptionSchema = z.object({
  detected_name: z.string().min(1).max(100),
  estimated_cost: z.number().positive(),
  confidence_score: z.number().min(0).max(1).default(0.5),
  billing_cycle: z.enum(['monthly', 'yearly', 'weekly']).default('monthly'),
  category: z.string().max(50).default('other'),
  suggested_action: z.string().max(200).optional(),
});

export const GhostSubscriptionUpdateSchema = z.object({
  id: z.string().uuid(),
  status: z.enum(['pending', 'confirmed', 'cancelled', 'dismissed']),
});

// ─── Type Exports ─────────────────────────────────────────────────
export type SignUpData = z.infer<typeof SignUpSchema>;
export type SignInData = z.infer<typeof SignInSchema>;
export type TransactionCreate = z.infer<typeof TransactionCreateSchema>;
export type TransactionUpdate = z.infer<typeof TransactionUpdateSchema>;
export type SubscriptionCreate = z.infer<typeof SubscriptionCreateSchema>;
export type SubscriptionUpdate = z.infer<typeof SubscriptionUpdateSchema>;
export type BudgetData = z.infer<typeof BudgetSchema>;
export type BudgetCategoryData = z.infer<typeof BudgetCategorySchema>;
export type GoalCreate = z.infer<typeof GoalCreateSchema>;
export type GoalUpdate = z.infer<typeof GoalUpdateSchema>;
export type ProfileUpdate = z.infer<typeof ProfileUpdateSchema>;
export type BudgetAlert = z.infer<typeof BudgetAlertSchema>;
export type GhostSubscription = z.infer<typeof GhostSubscriptionSchema>;

// ─── Safe Parse Helper ────────────────────────────────────────────
export function safeParse<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): { success: true; data: T } | { success: false; errors: string[] } {
  const result = schema.safeParse(data);
  if (result.success) {
    return { success: true, data: result.data };
  }
  const errors = result.error.issues.map((e) => `${(e.path as (string | number)[]).join('.')}: ${e.message}`);
  return { success: false, errors };
}

// ─── Service Input Schemas (match app-shaped service inputs) ──────
const finiteNumber = z.number().refine(Number.isFinite, 'Must be a finite number');
const dateString = z.string().regex(/^\d{4}-\d{2}-\d{2}([T].*)?$/, 'Invalid date format (expected YYYY-MM-DD)');
const hexColor = z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Invalid hex color');

export const SaveTransactionInputSchema = z.object({
  amount: finiteNumber.refine((v) => v !== 0, 'Amount cannot be zero'),
  description: z.string().max(200),
  category: z.string().min(1).max(50),
  workspace: z.string().max(50).optional(),
  location: z.string().max(100).optional(),
  timeOfDay: z.string().max(20).optional(),
  dayOfWeek: z.string().max(20).optional(),
  note: z.string().max(500).optional(),
});

export const SubscriptionInputSchema = z.object({
  name: z.string().min(1).max(100),
  amount: finiteNumber.positive('Amount must be positive'),
  dueDate: z.number().int().min(1).max(31),
  category: z.string().min(1).max(50),
  billingCycle: z.enum(['weekly', 'monthly', 'yearly']),
  color: hexColor.optional(),
  icon: z.string().max(50).optional(),
  isActive: z.boolean(),
  lastPaidDate: dateString.optional(),
  paidDates: z.array(z.number().int().min(1).max(31)).max(62).optional(),
  skipDates: z.array(z.number().int().min(1).max(31)).max(62).optional(),
  priceChange: finiteNumber.optional(),
  isGhost: z.boolean().optional(),
  trialEndDate: dateString.optional(),
});

export const SubscriptionWithIdSchema = SubscriptionInputSchema.extend({
  id: z.string().uuid(),
});

export const GoalCreateInputSchema = z.object({
  goal_name: z.string().min(1).max(100),
  target_amount: finiteNumber.positive('Target amount must be positive'),
  current_amount: finiteNumber.min(0),
  target_date: dateString.optional(),
  icon_name: z.string().max(50),
  color_code: hexColor,
});

export const GoalUpdateInputSchema = z.object({
  goal_name: z.string().min(1).max(100).optional(),
  target_amount: finiteNumber.positive('Target amount must be positive').optional(),
  current_amount: finiteNumber.min(0).optional(),
  target_date: dateString.nullable().optional(),
  icon_name: z.string().max(50).optional(),
  color_code: hexColor.optional(),
  status: z.enum(['in_progress', 'achieved', 'paused']).optional(),
});
