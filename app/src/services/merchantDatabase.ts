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

// ─── Cancel Instructions (RM-parity: replaces concierge cancellation) ──────
export interface CancelInfo {
  /** Official cancel/manage page */
  url: string;
  stepsEn: string[];
  stepsTh: string[];
}

/** Fuzzy-match a subscription/merchant name against the cancel-instructions DB.
 *  Exact name wins, then longest containing match. Returns null when unknown. */
export function findCancelInfo(name: string): (CancelInfo & { service: string }) | null {
  const clean = (name || '').trim().toLowerCase();
  if (!clean) return null;
  let best: { service: string; info: CancelInfo } | null = null;
  for (const [service, info] of Object.entries(CANCEL_INSTRUCTIONS)) {
    const key = service.toLowerCase();
    if (clean === key || clean.includes(key) || key.includes(clean)) {
      if (!best || service.length > best.service.length) best = { service, info };
    }
  }
  return best ? { ...best.info, service: best.service } : null;
}

const CANCEL_INSTRUCTIONS: Record<string, CancelInfo> = {
  Netflix: {
    url: 'https://www.netflix.com/cancelplan',
    stepsEn: [
      'Sign in at netflix.com',
      'Open Account → Membership',
      'Tap "Cancel Plan" and confirm',
      'Streaming stays available until the end of the paid period',
    ],
    stepsTh: [
      'เข้าสู่ระบบที่ netflix.com',
      'ไปที่ Account → Membership',
      'กด "Cancel Plan" แล้วยืนยัน',
      'ดูต่อได้จนถึงวันสิ้นสุดรอบบิลที่จ่ายแล้ว',
    ],
  },
  Spotify: {
    url: 'https://www.spotify.com/account/subscription/',
    stepsEn: [
      'Sign in at spotify.com → Account',
      'Open "Manage your plan"',
      'Choose "Cancel Premium"',
      'Confirm — account reverts to Free after the billing date',
    ],
    stepsTh: [
      'เข้าสู่ระบบ spotify.com → Account',
      'เปิด "Manage your plan"',
      'เลือก "Cancel Premium"',
      'ยืนยัน — บัญชีจะเปลี่ยนเป็นฟรีหลังครบรอบบิล',
    ],
  },
  'YouTube Premium': {
    url: 'https://www.youtube.com/paid_memberships',
    stepsEn: [
      'Open youtube.com/paid_memberships',
      'Find YouTube Premium → "Manage"',
      'Tap "Deactivate" → confirm reason',
      'Benefits continue until the next billing date',
    ],
    stepsTh: [
      'เปิด youtube.com/paid_memberships',
      'เลือก YouTube Premium → "จัดการ"',
      'กด "ยกเลิก" → ยืนยันเหตุผล',
      'ใช้สิทธิ์ต่อได้ถึงวันเรียกเก็บเงินถัดไป',
    ],
  },
  'Disney+': {
    url: 'https://www.hotstar.com/th/subscriptions',
    stepsEn: [
      'Sign in at hotstar.com → My Space',
      'Open Subscriptions',
      'Follow "Cancel Subscription" flow',
      'If billed via Apple/Google, cancel in that store instead',
    ],
    stepsTh: [
      'เข้าสู่ระบบ hotstar.com → My Space',
      'เปิด Subscriptions',
      'กด "Cancel Subscription" ตามขั้นตอน',
      'ถ้าชำระผ่าน Apple/Google ต้องยกเลิกในสโตร์นั้นแทน',
    ],
  },
  'HBO GO': {
    url: 'https://play.hbogo.co.th/settings/subscription',
    stepsEn: [
      'Sign in to HBO GO TH',
      'Go to Settings → Subscription',
      'Select "Cancel Subscription" and confirm',
      'Watch until the current period ends',
    ],
    stepsTh: [
      'เข้าสู่ระบบ HBO GO ไทย',
      'ไปที่ Settings → Subscription',
      'เลือก "Cancel Subscription" และยืนยัน',
      'รับชมต่อได้จนครบรอบที่ชำระแล้ว',
    ],
  },
  IQIYI: {
    url: 'https://www.iq.com/vip/web/manage',
    stepsEn: [
      'Sign in at iq.com → VIP Member center',
      'Open "My Account → Manage Subscription"',
      'Turn off auto-renewal / cancel',
      'VIP perks last until expiry date',
    ],
    stepsTh: [
      'เข้าสู่ระบบ iq.com → ศูนย์ VIP Member',
      'เปิด "My Account → Manage Subscription"',
      'ปิด auto-renewal / ยกเลิก',
      'สิทธิ์ VIP ใช้ได้ถึงวันหมดอายุ',
    ],
  },
  WeTV: {
    url: 'https://wetv.vip/th/pay/vipcenter',
    stepsEn: [
      'Open WeTV VIP Center',
      'Go to My Subscription',
      'Disable auto-renewal',
      'Membership remains active until period end',
    ],
    stepsTh: [
      'เปิดศูนย์ VIP ของ WeTV',
      'ไปที่ My Subscription',
      'ปิดการต่ออายุอัตโนมัติ',
      'สมาชิกยังใช้ได้จนครบรอบ',
    ],
  },
  Apple: {
    url: 'https://apps.apple.com/th/account/subscriptions',
    stepsEn: [
      'iPhone: Settings → [your name] → Subscriptions',
      'Pick the subscription (Apple TV+, iCloud+, App Store subs)',
      'Tap "Cancel Subscription"',
      'Works for any app billed through Apple',
    ],
    stepsTh: [
      'iPhone: Settings → [ชื่อของคุณ] → Subscriptions',
      'เลือกรายการ (Apple TV+, iCloud+, แอปที่ผ่าน App Store)',
      'กด "Cancel Subscription"',
      'ใช้ยกเลิกได้ทุกแอปที่ชำระผ่าน Apple',
    ],
  },
  Google: {
    url: 'https://play.google.com/store/account/subscriptions',
    stepsEn: [
      'Open Play Store → Payments & subscriptions',
      'Select the subscription (YouTube, Google One, apps)',
      'Tap "Cancel subscription" → confirm',
      'Or visit play.google.com/store/account/subscriptions on web',
    ],
    stepsTh: [
      'เปิด Play Store → การชำระเงินและการสมัคร',
      'เลือกรายการ (YouTube, Google One, แอปต่างๆ)',
      'กด "ยกเลิกการสมัคร" → ยืนยัน',
      'หรือเปิด play.google.com/store/account/subscriptions บนเว็บ',
    ],
  },
  Amazon: {
    url: 'https://www.amazon.com/gp/primecentral',
    stepsEn: [
      'Sign in → Prime Central',
      'Open Membership → "End membership"',
      'Confirm cancellation',
      'Prime benefits stop immediately or at period end depending on option',
    ],
    stepsTh: [
      'เข้าสู่ระบบ → Prime Central',
      'เปิด Membership → "End membership"',
      'ยืนยันการยกเลิก',
      'สิทธิ์ Prime อาจหยุดทันทีหรือสิ้นรอบขึ้นกับตัวเลือก',
    ],
  },
  Microsoft: {
    url: 'https://account.microsoft.com/services',
    stepsEn: [
      'Sign in at account.microsoft.com/services',
      'Find Microsoft 365 → "Manage"',
      'Choose "Cancel subscription" (or turn off recurring billing)',
      'Apps switch to read-only mode after expiry',
    ],
    stepsTh: [
      'เข้าสู่ระบบ account.microsoft.com/services',
      'เลือก Microsoft 365 → "Manage"',
      'กด "Cancel subscription" (หรือปิด recurring billing)',
      'แอปจะโหมดดูอย่างเดียวหลังหมดอายุ',
    ],
  },
  Grab: {
    url: 'https://www.grab.com/th/express/unlimited/',
    stepsEn: [
      'Open Grab app → Profile → GrabUnlimited',
      'Tap "Manage subscription"',
      'Choose "Cancel" and confirm',
      'Perks remain until the current cycle ends',
    ],
    stepsTh: [
      'เปิดแอป Grab → โปรไฟล์ → GrabUnlimited',
      'กด "จัดการแพ็กเกจ"',
      'เลือก "ยกเลิก" และยืนยัน',
      'สิทธิ์ยังใช้ได้จนครบรอบปัจจุบัน',
    ],
  },
  Foodpanda: {
    url: 'https://www.foodpanda.co.th/subscription',
    stepsEn: [
      'Open foodpanda → Account → pandapro',
      'Tap "Manage membership"',
      'Select "Cancel membership" and confirm',
      'Free-delivery perks last until period end',
    ],
    stepsTh: [
      'เปิด foodpanda → บัญชี → pandapro',
      'กด "จัดการสมาชิก"',
      'เลือก "ยกเลิกสมาชิก" และยืนยัน',
      'สิทธิ์ส่งฟรีใช้ได้ถึงสิ้นรอบ',
    ],
  },
};

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
  { name: 'Water Bill', nameTh: 'ค่าน้ำประปา', category: 'bills', billingCycle: 'monthly', approximateAmount: 300, color: '#1786C2', logo: 'W' },
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
