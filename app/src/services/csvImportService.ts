/**
 * ============================================================
 * DailyStack — csvImportService.ts
 * ============================================================
 * Architecture for CSV / Bank Statement Import
 * P1: Structure only — no Bank API integration
 *
 * Flow:
 *   1. File Validation  → validateFile()
 *   2. Parse            → parseCSV() / parsePDFText()
 *   3. Normalize        → normalizeTransactions()
 *   4. Detect Recurring → detectRecurringPayments()
 *   5. Detect Duplicates → detectDuplicates()
 *   6. Preview          → buildImportPreview()
 *   7. Commit           → commitImport()
 *
 * IMPORTANT: No Bank API / Aggregator calls in this file.
 */

import { supabase } from '../supabaseClient';
import { MERCHANT_DATABASE, CATEGORY_META } from './merchantDatabase';
import type { Subscription } from './subscriptionService';
import { matchRules, loadRules } from './ruleEngine';

// ─── Types ─────────────────────────────────────────────────────────────────

export type BillingCycle = 'weekly' | 'monthly' | 'yearly';

/** A raw parsed transaction from a CSV / bank statement */
export interface ParsedTransaction {
  date: string;          // ISO date string YYYY-MM-DD
  description: string;   // Raw bank description text
  amount: number;        // THB (positive = debit, negative = credit)
  reference?: string;    // Bank reference / transaction ID
  category?: string;      // Auto-detected category
}

/** A normalized subscription candidate */
export interface SubscriptionCandidate {
  name: string;
  amount: number;
  billingCycle: BillingCycle;
  dueDate: number;       // Day of month (1-31)
  category: string;
  color: string;
  confidence: number;    // 0-1, how confident we are this is recurring
  sourceTransaction: ParsedTransaction;
  autoCategory: boolean; // True if category was auto-detected
}

/** Import preview row */
export interface ImportPreviewItem {
  candidate: SubscriptionCandidate;
  status: 'new' | 'duplicate' | 'update';
  existingSubscriptionId?: string;
  selected: boolean;
}

/** Full import session state */
export interface ImportSession {
  id: string;
  filename: string;
  fileSize: number;
  parsedAt: string;
  transactions: ParsedTransaction[];
  candidates: SubscriptionCandidate[];
  previewItems: ImportPreviewItem[];
  selectedCount: number;
  totalMonthlyImpact: number;
  duplicateCount: number;
  status: 'parsing' | 'preview' | 'importing' | 'done' | 'error';
  error?: string;
}

// ─── Merchant Database (for auto-categorization) ───────────────────────────

// Normalize merchant name → best match from MERCHANT_DATABASE
function matchMerchant(description: string): typeof MERCHANT_DATABASE[0] | null {
  const lower = description.toLowerCase();
  // Exact-ish match: check if description contains any known merchant name
  for (const merchant of MERCHANT_DATABASE) {
    const mName = merchant.name.toLowerCase();
    const mNameTh = merchant.nameTh;
    if (lower.includes(mName) || lower.includes(mNameTh)) {
      return merchant;
    }
  }
  return null;
}

// Auto-categorize description text
function autoCategoryFromText(description: string): string {
  const lower = description.toLowerCase();
  // Telecom
  if (/ais|ไอเอส|truemove|ทรู|dtac|ดีแทค|3bb|tot fibre|ไฟเบอร์/i.test(lower)) return 'telecom';
  // Streaming
  if (/netflix|spotify|youtube|disney|prime video|amazon|hbo|apple tv|iqiyi|wetv/i.test(lower)) return 'streaming';
  // Fitness
  if (/fitness|first choice|virgin active|j fit|anyroom|ฟิตเนส/i.test(lower)) return 'fitness';
  // Food delivery
  if (/grab|foodpanda|lineman|ไลน์แมน|shopee food/i.test(lower)) return 'foodDelivery';
  // Insurance
  if (/insurance|ประกัน|prudential|aia| AXA |bangkok life/i.test(lower)) return 'insurance';
  // Bills / Utilities
  if (/electric|น้ำประปา|ค่าไฟ|การไฟฟ้า|ค่าเช่า|rent|ขนส่ง|พลังงาน/i.test(lower)) return 'bills';
  // Finance
  if (/bank|krungsri|scb|kbank|bbl|ttb|ทีเอ็มบี/i.test(lower)) return 'finance';
  return 'other';
}

// ─── Step 1: File Validation ───────────────────────────────────────────────

export interface ValidationResult {
  valid: boolean;
  error?: string;
  detectedFormat?: 'csv' | 'unknown';
}

export function validateFile(file: File): ValidationResult {
  if (!file) {
    return { valid: false, error: 'No file selected.' };
  }

  // Size limit: 10MB
  const MAX_SIZE = 10 * 1024 * 1024;
  if (file.size > MAX_SIZE) {
    return {
      valid: false,
      error: `File too large (${(file.size / 1024 / 1024).toFixed(1)} MB). Maximum is 10 MB.`,
    };
  }

  // Minimum size: 10 bytes
  if (file.size < 10) {
    return { valid: false, error: 'File appears empty or corrupted.' };
  }

  // Type check
  const csvTypes = ['text/csv', 'application/vnd.ms-excel', 'text/plain', 'application/csv'];
  const ext = file.name.toLowerCase().split('.').pop();
  const isCSV = csvTypes.includes(file.type) || ext === 'csv' || ext === 'txt';
  const isPDF = ext === 'pdf';

  if (isCSV) return { valid: true, detectedFormat: 'csv' };
  if (isPDF) return { valid: true, detectedFormat: 'unknown' }; // PDF parse = unknown format

  return {
    valid: false,
    error: `Unsupported file type "${file.type || ext}". Please upload a CSV or PDF bank statement.`,
  };
}

// ─── Step 2: Parse CSV ──────────────────────────────────────────────────────

/**
 * Parse a CSV bank statement into raw ParsedTransactions.
 * Supports common Thai bank CSV formats (SCB, KBank, BBL, Krungsri, TMB).
 *
 * Common column patterns detected:
 *   - date: "วันที่", "Transaction Date", "Date", "Posting Date"
 *   - description: "รายละเอียด", "Description", "Transaction Description", "Detail"
 *   - amount: "จำนวนเงิน", "Amount", "Debit", "Credit", "Dr/Cr"
 *   - debit: "เดบิต", "Debit Amount"
 *   - credit: "เครดิต", "Credit Amount"
 */
export async function parseCSV(file: File): Promise<ParsedTransaction[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        const transactions = parseCSVText(text, file.name);
        resolve(transactions);
      } catch (err) {
        reject(new Error(`CSV parse failed: ${err instanceof Error ? err.message : 'Unknown error'}`));
      }
    };
    reader.onerror = () => reject(new Error('Failed to read file.'));
    reader.readAsText(file, 'UTF-8');
  });
}

/**
 * Parse CSV text string into ParsedTransactions.
 * Auto-detects delimiter (comma, semicolon, tab) and encoding.
 */
export function parseCSVText(text: string, filename?: string): ParsedTransaction[] {
  if (!text || !text.trim()) return [];

  // Detect delimiter
  const firstLine = text.split(/\r?\n/)[0];
  const delimiter = firstLine.includes('\t') ? '\t'
    : firstLine.includes(';') ? ';'
    : ',';

  // Parse rows
  const lines = text.split(/\r?\n/).filter(l => l.trim());
  if (lines.length < 2) return [];

  // Parse header
  const header = parseCSVLine(lines[0], delimiter).map(h => h.trim().toLowerCase());

  // Find column indices
  const dateIdx = header.findIndex(h =>
    /วันที่|date|transaction.?date|posting.?date|วัน|trans.?date/i.test(h)
  );
  const descIdx = header.findIndex(h =>
    /รายละเอียด|description|detail|merchant|narration|narrative|transaction/i.test(h)
  );
  const amountIdx = header.findIndex(h =>
    /จำนวนเงิน|amount|total|sum/i.test(h)
  );
  const debitIdx = header.findIndex(h =>
    /เดบิต|debit|dr|รายจ่าย/i.test(h)
  );
  const creditIdx = header.findIndex(h =>
    /เครดิต|credit|cr|รายรับ/i.test(h)
  );
  const refIdx = header.findIndex(h =>
    /ref|reference|id|transaction.?id|เลขที่/i.test(h)
  );

  if (dateIdx < 0 || descIdx < 0) {
    // Fallback: try to parse as date,amount pairs
    return parseCSVFallback(lines);
  }

  const transactions: ParsedTransaction[] = [];

  for (let i = 1; i < lines.length; i++) {
    const cols = parseCSVLine(lines[i], delimiter);
    if (cols.length < 2) continue;

    const dateStr = cols[dateIdx]?.trim();
    const description = cols[descIdx]?.trim();
    if (!dateStr || !description) continue;

    // Parse date
    const parsedDate = parseDate(dateStr);
    if (!parsedDate) continue;

    // Parse amount
    let amount = 0;
    if (amountIdx >= 0 && cols[amountIdx]) {
      amount = parseAmount(cols[amountIdx]);
    } else if (debitIdx >= 0 || creditIdx >= 0) {
      const debit = debitIdx >= 0 ? parseAmount(cols[debitIdx] || '0') : 0;
      const credit = creditIdx >= 0 ? parseAmount(cols[creditIdx] || '0') : 0;
      amount = credit > 0 ? -credit : debit; // negative = credit, positive = debit
    }

    transactions.push({
      date: parsedDate,
      description,
      amount,
      reference: refIdx >= 0 ? cols[refIdx]?.trim() : undefined,
    });
  }

  return transactions;
}

/** Parse one CSV line handling quoted fields */
function parseCSVLine(line: string, delimiter: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;
  for (const char of line) {
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === delimiter && !inQuotes) {
      result.push(current);
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current);
  return result;
}

/** Fallback parser for simple date,amount CSV */
function parseCSVFallback(lines: string[]): ParsedTransaction[] {
  const transactions: ParsedTransaction[] = [];
  const dateRegex = /\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4}/;
  const amountRegex = /[\-]?[\d,]+\.?\d*/;

  for (const line of lines) {
    const dateMatch = line.match(dateRegex);
    const amountMatches = line.match(amountRegex);
    if (dateMatch && amountMatches) {
      const date = parseDate(dateMatch[0]);
      const amount = parseAmount(amountMatches[0]);
      if (date) {
        const description = line.replace(dateRegex, '').replace(amountRegex, '').replace(/[\|\-\s,]+/g, ' ').trim();
        transactions.push({ date, description: description || 'Unknown', amount });
      }
    }
  }
  return transactions;
}

// ─── Step 3: Normalize ─────────────────────────────────────────────────────

/**
 * Normalize parsed transactions → subscription candidates.
 * Uses merchant database for auto-fill and frequency detection.
 * User-defined rules (#6c) take priority over auto-categorization.
 */
export function normalizeTransactions(
  transactions: ParsedTransaction[],
  rules?: { pattern: string; category: string }[]
): SubscriptionCandidate[] {
  const candidates: SubscriptionCandidate[] = [];

  for (const tx of transactions) {
    if (tx.amount >= 0) continue; // Only process debits (outgoing payments)

    const absAmount = Math.abs(tx.amount);
    const merchant = matchMerchant(tx.description);
    const autoCat = autoCategoryFromText(tx.description);

    // User rule match wins over merchant db / heuristics
    const matchedRule = rules ? matchRules(rules, tx.description) : null;

    // Detect billing cycle from amount consistency
    const cycle = detectBillingCycle(tx, absAmount);

    // Determine due date (day of month from transaction date)
    const txDate = new Date(tx.date);
    const dueDate = txDate.getDate();

    const candidate: SubscriptionCandidate = {
      name: merchant
        ? (merchant.nameTh || merchant.name)
        : (autoCat !== 'other' ? `${autoCat} Payment` : tx.description.slice(0, 40)),
      amount: absAmount,
      billingCycle: cycle,
      dueDate,
      category: matchedRule?.category || merchant?.category || autoCat,
      color: merchant?.color || (CATEGORY_META[autoCat]?.color || CATEGORY_META.other.color),
      confidence: matchedRule ? 1 : merchant ? 0.9 : (autoCat !== 'other' ? 0.6 : 0.3),
      sourceTransaction: tx,
      autoCategory: !!merchant || !!matchedRule,
    };

    candidates.push(candidate);
  }

  return candidates;
}

// ─── Step 4: Detect Recurring Payments ────────────────────────────────────

/**
 * Detect recurring patterns in parsed transactions.
 * Groups transactions by normalized description similarity.
 */
export function detectRecurringPayments(
  candidates: SubscriptionCandidate[]
): SubscriptionCandidate[] {
  // Group by normalized name + approximate amount (within 10% variance)
  const groups = new Map<string, SubscriptionCandidate[]>();

  for (const candidate of candidates) {
    const key = normalizeGroupKey(candidate.name);
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)!.push(candidate);
  }

  const result: SubscriptionCandidate[] = [];

  for (const [_, group] of groups) {
    if (group.length === 0) continue;

    // Sort by date
    group.sort((a, b) => a.sourceTransaction.date.localeCompare(b.sourceTransaction.date));

    // Use the most recent occurrence as the representative
    const representative = { ...group[group.length - 1] };

    // Adjust confidence based on frequency
    const count = group.length;
    if (count >= 3) {
      representative.confidence = Math.min(0.95, 0.6 + count * 0.1);
    } else if (count === 2) {
      representative.confidence = 0.5;
    } else {
      representative.confidence = 0.3; // single occurrence = low confidence
    }

    // Average amount from group
    const avgAmount = Math.round(group.reduce((s, c) => s + c.amount, 0) / group.length);
    representative.amount = avgAmount;

    // Determine best billing cycle from group
    representative.billingCycle = bestCycleFromGroup(group);

    result.push(representative);
  }

  return result;
}

function normalizeGroupKey(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9ก-๙]/gi, '')
    .slice(0, 30);
}

function bestCycleFromGroup(group: SubscriptionCandidate[]): BillingCycle {
  if (group.length < 2) return group[0]?.billingCycle || 'monthly';

  const dates = group
    .map(c => new Date(c.sourceTransaction.date).getTime())
    .sort((a, b) => a - b);

  const intervals: number[] = [];
  for (let i = 1; i < dates.length; i++) {
    intervals.push(Math.round((dates[i] - dates[i - 1]) / (1000 * 60 * 60 * 24)));
  }

  const avgInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length;

  if (avgInterval <= 10) return 'weekly';
  if (avgInterval <= 40) return 'monthly';
  return 'yearly';
}

// ─── Step 5: Duplicate Detection ───────────────────────────────────────────

/**
 * Compare candidates against existing subscriptions in DB.
 * Marks duplicates with existing subscription IDs.
 */
export async function detectDuplicates(
  candidates: SubscriptionCandidate[],
  existingSubscriptions: Subscription[]
): Promise<Map<string, string>> {
  const duplicateMap = new Map<string, string>(); // candidateName → existingId

  const existingNormalized = existingSubscriptions.map(s => ({
    id: s.id,
    key: normalizeGroupKey(s.name),
    amount: s.amount,
    amountVariance: s.amount * 0.15, // 15% variance
  }));

  for (const candidate of candidates) {
    const key = normalizeGroupKey(candidate.name);
    const match = existingNormalized.find(
      e => e.key === key && Math.abs(e.amount - candidate.amount) <= e.amountVariance
    );
    if (match) {
      duplicateMap.set(key, match.id);
    }
  }

  return duplicateMap;
}

// ─── Step 6: Build Import Preview ─────────────────────────────────────────

export interface ImportPreview {
  items: ImportPreviewItem[];
  selectedCount: number;
  totalMonthlyImpact: number;
  duplicateCount: number;
  newCount: number;
}

export async function buildImportPreview(
  candidates: SubscriptionCandidate[],
  existingSubscriptions: Subscription[]
): Promise<ImportPreview> {
  const duplicateMap = await detectDuplicates(candidates, existingSubscriptions);
  const selectedIds = new Set<string>();

  const items: ImportPreviewItem[] = candidates.map(candidate => {
    const key = normalizeGroupKey(candidate.name);
    const existingId = duplicateMap.get(key);

    let status: ImportPreviewItem['status'] = 'new';
    if (existingId) {
      status = 'duplicate';
      // Don't pre-select duplicates
    } else if (candidate.confidence >= 0.5) {
      // Pre-select high-confidence new items
      selectedIds.add(key);
    }

    return {
      candidate,
      status,
      existingSubscriptionId: existingId,
      selected: status !== 'duplicate',
    };
  });

  const selectedItems = items.filter(i => i.selected);
  const totalMonthlyImpact = selectedItems.reduce((sum, item) => {
    return sum + annualizedToMonthly(item.candidate.amount, item.candidate.billingCycle);
  }, 0);

  return {
    items,
    selectedCount: selectedItems.length,
    totalMonthlyImpact,
    duplicateCount: items.filter(i => i.status === 'duplicate').length,
    newCount: items.filter(i => i.status === 'new').length,
  };
}

// ─── Step 7: Commit Import ─────────────────────────────────────────────────

export interface ImportResult {
  success: boolean;
  importedCount: number;
  skippedCount: number;
  error?: string;
}

/**
 * Commit selected import items to the database.
 * Called after user confirms the import preview.
 */
export async function commitImport(
  items: ImportPreviewItem[],
  onProgress?: (done: number, total: number) => void
): Promise<ImportResult> {
  const toImport = items.filter(i => i.selected && i.status !== 'duplicate');
  let importedCount = 0;
  let skippedCount = 0;

  for (let i = 0; i < toImport.length; i++) {
    const item = toImport[i];
    const { candidate } = item;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Calculate next billing date
      const now = new Date();
      const nextBilling = new Date(now.getFullYear(), now.getMonth(), candidate.dueDate);
      if (nextBilling < now) nextBilling.setMonth(nextBilling.getMonth() + 1);

      const { error } = await supabase.from('subscriptions').insert({
        user_id: user.id,
        name: candidate.name,
        cost: candidate.amount,
        billing_cycle: candidate.billingCycle,
        category: candidate.category,
        next_billing_date: nextBilling.toISOString().split('T')[0],
        is_active: true,
        notes: `Imported from CSV on ${new Date().toLocaleDateString('th-TH')}`,
      });

      if (error) throw error;
      importedCount++;
    } catch (err) {
      console.error('[csvImport] Failed to import:', candidate.name, err);
      skippedCount++;
    }

    onProgress?.(i + 1, toImport.length);
  }

  return {
    success: importedCount > 0,
    importedCount,
    skippedCount,
    error: skippedCount > 0 ? `${skippedCount} items failed to import.` : undefined,
  };
}

// ─── Utility Functions ───────────────────────────────────────────────────────

/** Parse various date formats → ISO date string */
function parseDate(input: string): string | null {
  const trimmed = input.trim();
  // Try ISO first
  if (/^\d{4}-\d{2}-\d{2}/.test(trimmed)) return trimmed.slice(0, 10);

  // Thai date: DD/MM/YYYY or D/M/YYYY
  const slashMatch = trimmed.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})$/);
  if (slashMatch) {
    const [, d, m, y] = slashMatch;
    return `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
  }

  // MM/DD/YYYY (ambiguous — assume Thai context = DD/MM)
  const mdyMatch = trimmed.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})$/);
  if (mdyMatch) {
    const [, a, b, y] = mdyMatch;
    // If first > 12, it's DD/MM; otherwise assume DD/MM in Thai context
    const d = parseInt(a) > 12 ? a : b;
    const m = parseInt(a) > 12 ? b : a;
    return `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
  }

  // Try native Date parsing as fallback
  const d = new Date(trimmed);
  if (!isNaN(d.getTime())) {
    return d.toISOString().slice(0, 10);
  }

  return null;
}

/** Parse amount string → number (THB) */
function parseAmount(input: string): number {
  if (!input) return 0;
  // Remove currency symbols, spaces, and commas
  const cleaned = input.replace(/[฿$,\s]/g, '').trim();
  const num = parseFloat(cleaned);
  return isNaN(num) ? 0 : Math.round(num);
}

/** Detect billing cycle from a single transaction (heuristic) */
function detectBillingCycle(tx: ParsedTransaction, amount: number): BillingCycle {
  // High amounts are often annual
  if (amount >= 3000) return 'yearly';
  // Weekly heuristics (very regular small amounts)
  if (amount <= 200) return 'monthly'; // Thai context: small recurring = monthly
  return 'monthly';
}

/** Convert amount to monthly equivalent */
function annualizedToMonthly(amount: number, cycle: BillingCycle): number {
  switch (cycle) {
    case 'weekly': return amount * 52 / 12;
    case 'yearly': return amount / 12;
    case 'monthly': return amount;
    default: return amount;
  }
}

// ─── Import Pipeline ────────────────────────────────────────────────────────

/**
 * Full import pipeline: validate → parse → normalize → detect recurring → build preview.
 */
export async function runImportPipeline(
  file: File,
  existingSubscriptions: Subscription[]
): Promise<ImportSession> {
  const sessionId = crypto.randomUUID();

  // Step 1: Validate
  const validation = validateFile(file);
  if (!validation.valid) {
    return {
      id: sessionId,
      filename: file.name,
      fileSize: file.size,
      parsedAt: new Date().toISOString(),
      transactions: [],
      candidates: [],
      previewItems: [],
      selectedCount: 0,
      totalMonthlyImpact: 0,
      duplicateCount: 0,
      status: 'error',
      error: validation.error,
    };
  }

  // Step 2: Parse
  let transactions: ParsedTransaction[] = [];
  try {
    if (validation.detectedFormat === 'csv') {
      transactions = await parseCSV(file);
    }
    // PDF parsing: placeholder — requires PDF.js or server-side processing
    // TODO: implement PDF text extraction in a future sprint
  } catch (err) {
    return {
      id: sessionId,
      filename: file.name,
      fileSize: file.size,
      parsedAt: new Date().toISOString(),
      transactions: [],
      candidates: [],
      previewItems: [],
      selectedCount: 0,
      totalMonthlyImpact: 0,
      duplicateCount: 0,
      status: 'error',
      error: `Parse failed: ${err instanceof Error ? err.message : 'Unknown error'}`,
    };
  }

  // Step 3: Normalize
  const rules = await loadRules();
  const candidates = normalizeTransactions(transactions, rules);

  // Step 4: Detect recurring
  const recurring = detectRecurringPayments(candidates);

  // Step 5: Build preview
  const preview = await buildImportPreview(recurring, existingSubscriptions);

  return {
    id: sessionId,
    filename: file.name,
    fileSize: file.size,
    parsedAt: new Date().toISOString(),
    transactions,
    candidates: recurring,
    previewItems: preview.items,
    selectedCount: preview.selectedCount,
    totalMonthlyImpact: preview.totalMonthlyImpact,
    duplicateCount: preview.duplicateCount,
    status: 'preview',
  };
}
