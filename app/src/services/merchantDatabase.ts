/**
 * ============================================================
 * DailyStack — merchantDatabase.ts
 * ============================================================
 * Shared merchant templates and category metadata.
 * Used by:
 *   - SubscriptionTrackerPage (manual add modal)
 *   - csvImportService (auto-categorization)
 *   - CSVImportModal (import preview)
 *
 * Single source of truth for all merchant/category data.
 */

import type { BillingCycle } from './subscriptionService';

// ─── Merchant Quick-Add Templates ───────────────────────────────────────────
export interface MerchantTemplate {
  name: string;
  nameTh: string;
  category: string;
  billingCycle: BillingCycle;
  approximateAmount: number;
  color: string;
  logo: string;
}

export const MERCHANT_DATABASE: MerchantTemplate[] = [
  // ── Telecom ──────────────────────────────────────────────────────────────
  { name: 'AIS', nameTh: 'AIS ไอเอส', category: 'telecom', billingCycle: 'monthly', approximateAmount: 599, color: '#0093F9', logo: 'A' },
  { name: 'TrueMove H', nameTh: 'ทรู มูฟ เอช', category: 'telecom', billingCycle: 'monthly', approximateAmount: 399, color: '#00A651', logo: 'T' },
  { name: 'dtac', nameTh: 'ดีแทค', category: 'telecom', billingCycle: 'monthly', approximateAmount: 399, color: '#FF6B00', logo: 'D' },
  { name: 'AIS Fibre', nameTh: 'AIS ไฟเบอร์', category: 'telecom', billingCycle: 'monthly', approximateAmount: 599, color: '#0093F9', logo: 'A' },
  { name: 'TrueLife', nameTh: 'ทรู ไลฟ์', category: 'telecom', billingCycle: 'monthly', approximateAmount: 799, color: '#00A651', logo: 'T' },
  { name: 'dtac Home', nameTh: 'ดีแทค โฮม', category: 'telecom', billingCycle: 'monthly', approximateAmount: 499, color: '#FF6B00', logo: 'D' },
  { name: 'TOT Fibre', nameTh: 'TOT ไฟเบอร์', category: 'telecom', billingCycle: 'monthly', approximateAmount: 399, color: '#E60000', logo: 'O' },
  { name: '3BB', nameTh: '3BB', category: 'telecom', billingCycle: 'monthly', approximateAmount: 399, color: '#FF00AA', logo: '3' },
  { name: 'My by CAT', nameTh: 'My by CAT', category: 'telecom', billingCycle: 'monthly', approximateAmount: 299, color: '#0066CC', logo: 'M' },
  // ── Streaming ────────────────────────────────────────────────────────────
  { name: 'Netflix', nameTh: 'Netflix', category: 'streaming', billingCycle: 'monthly', approximateAmount: 199, color: '#E50914', logo: 'N' },
  { name: 'Netflix Premium', nameTh: 'Netflix Premium', category: 'streaming', billingCycle: 'monthly', approximateAmount: 419, color: '#E50914', logo: 'N' },
  { name: 'Disney+ Hotstar', nameTh: 'Disney+ ฮอตสตาร์', category: 'streaming', billingCycle: 'monthly', approximateAmount: 299, color: '#113CCF', logo: 'D' },
  { name: 'Spotify', nameTh: 'Spotify', category: 'streaming', billingCycle: 'monthly', approximateAmount: 99, color: '#1DB954', logo: 'S' },
  { name: 'Spotify Family', nameTh: 'Spotify Family', category: 'streaming', billingCycle: 'monthly', approximateAmount: 159, color: '#1DB954', logo: 'S' },
  { name: 'YouTube Premium', nameTh: 'YouTube Premium', category: 'streaming', billingCycle: 'monthly', approximateAmount: 199, color: '#FF0000', logo: 'Y' },
  { name: 'Amazon Prime', nameTh: 'Amazon Prime', category: 'streaming', billingCycle: 'monthly', approximateAmount: 199, color: '#FF9900', logo: 'A' },
  { name: 'Apple TV+', nameTh: 'Apple TV+', category: 'streaming', billingCycle: 'monthly', approximateAmount: 199, color: '#000000', logo: 'A' },
  { name: 'HBO GO', nameTh: 'HBO GO', category: 'streaming', billingCycle: 'monthly', approximateAmount: 199, color: '#8B5CF6', logo: 'H' },
  { name: 'IQIYI', nameTh: 'IQIYI', category: 'streaming', billingCycle: 'monthly', approximateAmount: 199, color: '#00BE00', logo: 'I' },
  { name: 'WeTV', nameTh: 'WeTV', category: 'streaming', billingCycle: 'monthly', approximateAmount: 99, color: '#FF4081', logo: 'W' },
  // ── Cloud / Productivity ────────────────────────────────────────────────
  { name: 'Microsoft 365', nameTh: 'Microsoft 365', category: 'software', billingCycle: 'monthly', approximateAmount: 329, color: '#0078D4', logo: 'M' },
  { name: 'Google One', nameTh: 'Google One', category: 'software', billingCycle: 'monthly', approximateAmount: 99, color: '#4285F4', logo: 'G' },
  { name: 'iCloud+', nameTh: 'iCloud+', category: 'software', billingCycle: 'monthly', approximateAmount: 83, color: '#3478F6', logo: 'I' },
  { name: 'Dropbox', nameTh: 'Dropbox', category: 'software', billingCycle: 'monthly', approximateAmount: 163, color: '#0061FF', logo: 'D' },
  { name: 'Notion', nameTh: 'Notion', category: 'software', billingCycle: 'monthly', approximateAmount: 133, color: '#000000', logo: 'N' },
  // ── Insurance ───────────────────────────────────────────────────────────
  { name: 'PT Prachachon Insurance', nameTh: 'ประกันภัย พ.ต. ประชาชน', category: 'insurance', billingCycle: 'monthly', approximateAmount: 199, color: '#0044CC', logo: 'P' },
  { name: 'Viriyah Insurance', nameTh: 'วิริยะประกันภัย', category: 'insurance', billingCycle: 'yearly', approximateAmount: 3000, color: '#FF6600', logo: 'V' },
  // ── Fitness ─────────────────────────────────────────────────────────────
  { name: 'Fitness First', nameTh: 'ฟิตเนสเฟิร์ส', category: 'fitness', billingCycle: 'monthly', approximateAmount: 999, color: '#E60000', logo: 'F' },
  { name: 'Virgin Active', nameTh: 'เวอร์จิน แอคทีฟ', category: 'fitness', billingCycle: 'monthly', approximateAmount: 1499, color: '#E6007A', logo: 'V' },
  { name: 'J Fit', nameTh: 'เจ ฟิต', category: 'fitness', billingCycle: 'monthly', approximateAmount: 499, color: '#FF8C00', logo: 'J' },
  { name: 'AnyRoom', nameTh: 'แอนนี่รูม', category: 'fitness', billingCycle: 'monthly', approximateAmount: 999, color: '#6C63FF', logo: 'A' },
  // ── Food Delivery ───────────────────────────────────────────────────────
  { name: 'Grab Unlimited', nameTh: 'แกร็บ อันลิมิเต็ด', category: 'foodDelivery', billingCycle: 'monthly', approximateAmount: 199, color: '#00B14F', logo: 'G' },
  { name: 'LINE MAN Mart', nameTh: 'ไลน์แมน มาร์ท', category: 'foodDelivery', billingCycle: 'monthly', approximateAmount: 99, color: '#00B900', logo: 'L' },
  { name: 'Foodpanda Premium', nameTh: 'ฟูดแพนดา พรีเมียม', category: 'foodDelivery', billingCycle: 'monthly', approximateAmount: 99, color: '#FF5722', logo: 'F' },
  // ── Finance / Investment ──────────────────────────────────────────────
  { name: 'Finansia Hero', nameTh: 'ฟินาเซีย ฮีโร่', category: 'finance', billingCycle: 'monthly', approximateAmount: 299, color: '#00CC99', logo: 'F' },
  { name: 'Aspire', nameTh: 'แอสไพร์', category: 'finance', billingCycle: 'monthly', approximateAmount: 299, color: '#6C5CE7', logo: 'A' },
  { name: 'KFintech', nameTh: 'เคฟินเทค', category: 'finance', billingCycle: 'monthly', approximateAmount: 199, color: '#FF6B6B', logo: 'K' },
  // ── Bills / Utilities ──────────────────────────────────────────────────
  { name: 'Rent', nameTh: 'ค่าเช่า', category: 'bills', billingCycle: 'monthly', approximateAmount: 12000, color: '#8B5CF6', logo: 'R' },
  { name: 'Electricity Bill', nameTh: 'ค่าไฟฟ้า', category: 'bills', billingCycle: 'monthly', approximateAmount: 1500, color: '#F59E0B', logo: 'E' },
  { name: 'Water Bill', nameTh: 'ค่าน้ำประปา', category: 'bills', billingCycle: 'monthly', approximateAmount: 300, color: '#3B82F6', logo: 'W' },
];

// ─── Category Metadata ────────────────────────────────────────────────────────
export interface CategoryMeta {
  labelEn: string;
  labelTh: string;
  color: string;
}

export const CATEGORY_META: Record<string, CategoryMeta> = {
  streaming:      { labelEn: 'Streaming',       labelTh: 'สตรีมมิ่ง',        color: '#E50914' },
  telecom:        { labelEn: 'Telecom',         labelTh: 'โทรศัพท์/อินเทอร์เน็ต', color: '#0093F9' },
  software:       { labelEn: 'Software',        labelTh: 'ซอฟต์แวร์',         color: '#0078D4' },
  insurance:      { labelEn: 'Insurance',       labelTh: 'ประกัน',           color: '#0044CC' },
  fitness:        { labelEn: 'Fitness',         labelTh: 'ฟิตเนส',            color: '#E60000' },
  foodDelivery:   { labelEn: 'Food Delivery',   labelTh: 'สั่งอาหาร',         color: '#FF5722' },
  finance:        { labelEn: 'Finance',         labelTh: 'การเงิน',           color: '#00CC99' },
  entertainment:  { labelEn: 'Entertainment',   labelTh: 'บันเทิง',           color: '#8B5CF6' },
  bills:          { labelEn: 'Bills',           labelTh: 'บิล/ค่าบริการ',    color: '#F97316' },
  other:          { labelEn: 'Other',           labelTh: 'อื่นๆ',             color: '#6B7280' },
};
