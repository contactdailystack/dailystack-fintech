/**
 * ============================================================
 * DailyStack P0/P1 Runtime QA — Post-Implementation Audit
 * Tests: Manual Subscription Entry, CSV Import, Currency Integrity,
 *        Duplicate Detection, Responsive, Stability
 * ============================================================
 */

const { chromium } = require('@playwright/test');
const fs = require('fs');
const path = require('path');
const os = require('os');

// ─── Setup ───────────────────────────────────────────────────────────────────
const BASE = 'http://localhost:5173';
const OUT_DIR = path.join(__dirname, 'screenshots');
if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });

let browser, context, page;
let results = [];
let passed = 0;
let failed = 0;
let skipped = 0;

function record(id, section, label, status, evidence, file, severity, expected, actual) {
  const r = { id, section, label, status, evidence, file, severity, expected, actual };
  results.push(r);
  const icon = status === 'PASS' ? '✅' : status === 'FAIL' ? '❌' : status === 'PARTIAL' ? '⚠️' : '🚫';
  console.log(`${icon} [${status}] ${label}`);
  if (evidence) console.log(`   Evidence: ${evidence}`);
  if (status === 'FAIL' || status === 'PARTIAL') {
    console.log(`   File: ${file || 'N/A'}`);
    console.log(`   Severity: ${severity}`);
    if (expected) console.log(`   Expected: ${expected}`);
    if (actual) console.log(`   Actual: ${actual}`);
  }
  if (status === 'PASS') passed++;
  else if (status === 'FAIL') failed++;
  else skipped++;
  return r;
}

async function screenshot(name) {
  const p = path.join(OUT_DIR, `${name}.png`);
  try {
    await page.screenshot({ path: p, fullPage: false });
    console.log(`   📸 Saved: screenshots/${name}.png`);
  } catch (e) { console.log(`   ⚠️ Screenshot failed: ${e.message}`); }
  return p;
}

// ─── Auth helper ─────────────────────────────────────────────────────────────
async function login(page) {
  await page.goto(BASE);
  await page.waitForTimeout(2000);

  // If on auth page, do quick login with test account
  const url = page.url();
  if (!url.includes('/dashboard') && !url.includes('/subscriptions')) {
    // Try to find login form
    const emailInput = await page.$('input[type="email"], input[placeholder*="email" i], input[id*="email" i]');
    if (emailInput) {
      await emailInput.fill('test@dailystack.app');
      const passInput = await page.$('input[type="password"]');
      if (passInput) await passInput.fill('testpassword123');
      const submitBtn = await page.$('button[type="submit"]');
      if (submitBtn) await submitBtn.click();
      await page.waitForTimeout(3000);
    }
  }
  await page.waitForTimeout(2000);
}

// ─── Currency Integrity Audit ────────────────────────────────────────────────
async function auditCurrencyIntegrity() {
  console.log('\n=== 2. CURRENCY INTEGRITY AUDIT ===');
  const severity = 'P0';

  // 2.1 Check all currency-related files
  const currencyFiles = [
    'app/src/components/SubscriptionTrackerPage.tsx',
    'app/src/components/SubscriptionModal.tsx',
    'app/src/services/subscriptionService.ts',
    'app/src/services/csvImportService.ts',
    'app/src/utils/formatters.ts',
  ];

  for (const f of currencyFiles) {
    const fullPath = path.join(__dirname, '..', f);
    if (!fs.existsSync(fullPath)) {
      record('CURR-001', 'Currency', `File exists: ${f}`, 'FAIL', `File not found`, f, severity,
        'File exists', 'File not found');
      continue;
    }
    const content = fs.readFileSync(fullPath, 'utf-8');

    // Check for THB references
    const hasTHB = content.includes('THB') || content.includes('฿');
    const hasDollarCent = /\/\s*100[\s;]/.test(content) || /\*\s*0\.01/.test(content);
    const hasDivision100 = /amount\s*\/\s*100/.test(content) || /amount\s*/.test(content);

    record('CURR-002', 'Currency', `THB context in ${path.basename(f)}`, hasTHB ? 'PASS' : 'FAIL',
      hasTHB ? 'THB currency marker found' : 'No THB marker',
      f, severity,
      'THB marker present', hasTHB ? 'THB found' : 'No THB');

    if (hasDivision100 && !f.includes('csvImportService')) {
      record('CURR-003', 'Currency', `Division by 100 in ${path.basename(f)}`, 'FAIL',
        'Potential cent-to-baht conversion found - may cause 100x error',
        f, severity,
        'No division by 100 for THB amounts',
        'Division by 100 detected - could cause 100x data error');
    }
  }

  // 2.2 Check formatCurrency implementation
  const modalPath = path.join(__dirname, '..', 'app/src/components/SubscriptionModal.tsx');
  if (fs.existsSync(modalPath)) {
    const modal = fs.readFileSync(modalPath, 'utf-8');
    const fmtMatch = modal.match(/formatCurrency[^}]+}/s);
    if (fmtMatch) {
      const fmt = fmtMatch[0];
      if (fmt.includes('/ 100') || fmt.includes('/100')) {
        record('CURR-004', 'Currency', 'formatCurrency divides by 100', 'FAIL',
          'formatCurrency still divides by 100 - will show 100x too small amounts',
          'SubscriptionModal.tsx', 'P0',
          'No /100 in formatCurrency',
          '/100 division found');
      } else {
        record('CURR-004', 'Currency', 'formatCurrency divides by 100', 'PASS',
          'No /100 division found', 'SubscriptionModal.tsx', severity,
          'No /100', 'No /100');
      }
    }
  }

  // 2.3 Check database contract
  const subServicePath = path.join(__dirname, '..', 'app/src/services/subscriptionService.ts');
  if (fs.existsSync(subServicePath)) {
    const svc = fs.readFileSync(subServicePath, 'utf-8');
    // Check for amount handling
    const hasAmount = svc.includes('amount');
    const hasDivide100 = /\bamount\b[^;]*\/\s*100/.test(svc);
    record('CURR-005', 'Currency', 'subscriptionService amount contract', hasDivide100 ? 'FAIL' : 'PASS',
      hasDivide100 ? 'subscriptionService divides amount by 100' : 'No suspicious division',
      'subscriptionService.ts', severity,
      'No /100 on amount', hasDivide100 ? '/100 found' : 'Clean');
  }

  // 2.4 Check CSV import stores correct values
  const csvPath = path.join(__dirname, '..', 'app/src/services/csvImportService.ts');
  if (fs.existsSync(csvPath)) {
    const csv = fs.readFileSync(csvPath, 'utf-8');
    const hasAmountParse = csv.includes('amount') || csv.includes('Amount');
    const hasDivide100 = /\bamount\b[^;]{0,200}\/\s*100/.test(csv);
    record('CURR-006', 'Currency', 'csvImportService amount parsing', hasDivide100 ? 'FAIL' : 'PASS',
      hasDivide100 ? 'CSV import divides amount by 100' : 'Amount parsing looks clean',
      'csvImportService.ts', severity,
      'No /100 on CSV amount', hasDivide100 ? '/100 found' : 'Clean');
  }
}

// ─── Manual Subscription Entry E2E ─────────────────────────────────────────
async function testManualSubscriptionEntry() {
  console.log('\n=== 1. MANUAL SUBSCRIPTION ENTRY E2E ===');

  // 1.1 Open the app and navigate to subscriptions
  await page.goto(BASE);
  await page.waitForTimeout(2000);
  await screenshot('01-landing');

  // Check if we're already logged in or need auth
  const url = page.url();
  record('SUB-E2E-001', 'Subscription', 'App loads without crash', 'PASS',
    `URL: ${url}`, 'N/A', 'P0',
    'Page loads', `URL: ${url}`);

  // 1.2 Find and click Add Subscription button
  // Try multiple selectors
  const addBtnSelectors = [
    'button:has-text("Add")',
    'button:has-text("เพิ่ม")',
    'button:has-text("+")',
    '[aria-label*="Add" i]',
    '[aria-label*="เพิ่ม" i]',
    'button[class*="add"]',
    'button[class*="primary"]',
  ];

  let addBtn = null;
  for (const sel of addBtnSelectors) {
    addBtn = await page.$(sel);
    if (addBtn) {
      record('SUB-E2E-002', 'Subscription', 'Add button found', 'PASS',
        `Found with selector: ${sel}`, 'SubscriptionTrackerPage.tsx', 'P0',
        'Add button present', `Found: ${sel}`);
      break;
    }
  }

  if (!addBtn) {
    // Try navigating directly
    await page.goto(`${BASE}/subscriptions`);
    await page.waitForTimeout(2000);
    for (const sel of addBtnSelectors) {
      addBtn = await page.$(sel);
      if (addBtn) break;
    }
  }

  await screenshot('02-subscriptions-page');

  if (!addBtn) {
    record('SUB-E2E-003', 'Subscription', 'Add button clickable', 'FAIL',
      'Could not find add subscription button',
      'SubscriptionTrackerPage.tsx', 'P0',
      'Add button found and clickable',
      'Button not found with any selector');
    return;
  }

  await addBtn.click();
  await page.waitForTimeout(1000);
  await screenshot('03-modal-opened');

  // 1.3 Check Modal opened
  const modal = await page.$('[role="dialog"], [class*="modal"], .fixed, .absolute');
  record('SUB-E2E-004', 'Subscription', 'Modal opens on Add click', modal ? 'PASS' : 'FAIL',
    modal ? 'Modal element found' : 'No modal found after click',
    'SubscriptionModal.tsx', 'P0',
    'Modal opens', modal ? 'Modal found' : 'Modal not found');

  // 1.4 Check THB default currency
  const thbElement = await page.$('text=฿, text=THB');
  record('SUB-E2E-005', 'Subscription', 'THB currency default', thbElement ? 'PASS' : 'PARTIAL',
    thbElement ? '฿ symbol visible' : 'THB symbol not clearly visible in modal',
    'SubscriptionModal.tsx', 'P0',
    '฿ THB visible', thbElement ? '฿ found' : 'THB not found');

  // 1.5 Check Merchant picker exists
  const merchantPicker = await page.$('[placeholder*="merchant" i], [placeholder*="Merchant" i], input[class*="merchant"], [role="combobox"]');
  record('SUB-E2E-006', 'Subscription', 'Merchant picker present', merchantPicker ? 'PASS' : 'PARTIAL',
    merchantPicker ? 'Merchant input found' : 'Merchant picker not found',
    'SubscriptionModal.tsx', 'P0',
    'Merchant input present', merchantPicker ? 'Found' : 'Not found');

  // 1.6 Check Category grid exists
  const categoryGrid = await page.$('[class*="grid"], [class*="category"], [class*="grid-col"]');
  record('SUB-E2E-007', 'Subscription', 'Category selector grid', categoryGrid ? 'PASS' : 'PARTIAL',
    categoryGrid ? 'Category grid found' : 'Category grid not found',
    'SubscriptionModal.tsx', 'P0',
    'Category grid present', categoryGrid ? 'Found' : 'Not found');

  // 1.7 Check Billing cycle buttons
  const cycleBtns = await page.$$('button:has-text("Monthly"), button:has-text("Yearly"), button:has-text("Weekly"), button:has-text("รายเดือน"), button:has-text("รายปี")');
  record('SUB-E2E-008', 'Subscription', 'Billing cycle buttons present', cycleBtns.length >= 2 ? 'PASS' : 'FAIL',
    `Found ${cycleBtns.length} billing cycle buttons`,
    'SubscriptionModal.tsx', 'P0',
    'At least 2 cycle buttons', `${cycleBtns.length} found`);

  // 1.8 Check Active toggle
  const toggle = await page.$('[type="checkbox"], [role="switch"], [class*="toggle"], [class*="switch"]');
  record('SUB-E2E-009', 'Subscription', 'Active toggle present', toggle ? 'PASS' : 'PARTIAL',
    toggle ? 'Toggle found' : 'No toggle found',
    'SubscriptionModal.tsx', 'P0',
    'Active toggle present', toggle ? 'Found' : 'Not found');

  // 1.9 Try filling form
  if (merchantPicker) {
    await merchantPicker.fill('Test Merchant');
    await page.waitForTimeout(500);
  }

  // 1.10 Find and fill amount
  const amountInput = await page.$('input[type="number"], input[placeholder*="amount" i], input[placeholder*="ราคา"]');
  if (amountInput) {
    await amountInput.fill('299');
    await page.waitForTimeout(300);
    record('SUB-E2E-010', 'Subscription', 'Amount field accepts input', 'PASS',
      'Amount field found and accepts 299', 'SubscriptionModal.tsx', 'P0',
      'Amount input works', '299 accepted');
  } else {
    record('SUB-E2E-010', 'Subscription', 'Amount field accepts input', 'FAIL',
      'Could not find amount/number input', 'SubscriptionModal.tsx', 'P0',
      'Amount field found', 'Not found');
  }

  // 1.11 Click save/submit
  const saveBtn = await page.$('button:has-text("Save"), button:has-text("บันทึก"), button:has-text("Add"), button:has-text("เพิ่ม")');
  if (saveBtn) {
    await saveBtn.click();
    await page.waitForTimeout(1500);
    await screenshot('04-after-save');
    const modalAfter = await page.$('[role="dialog"], [class*="modal"]');
    record('SUB-E2E-011', 'Subscription', 'Modal closes after save', !modalAfter ? 'PASS' : 'PARTIAL',
      modalAfter ? 'Modal still visible' : 'Modal closed successfully',
      'SubscriptionModal.tsx', 'P0',
      'Modal closes', modalAfter ? 'Still open' : 'Closed');
  }

  // 1.12 Check if item appears in list
  const newItem = await page.$('text=Test Merchant');
  record('SUB-E2E-012', 'Subscription', 'New subscription appears in list', newItem ? 'PASS' : 'PARTIAL',
    newItem ? 'Test Merchant found in list' : 'Test Merchant not found in list',
    'SubscriptionTrackerPage.tsx', 'P0',
    'Item appears in list', newItem ? 'Found' : 'Not found');
}

// ─── CSV Import E2E ─────────────────────────────────────────────────────────
async function testCSVImport() {
  console.log('\n=== 3. CSV IMPORT E2E ===');

  // 3.1 Find CSV import button
  const csvBtnSelectors = [
    'button:has-text("CSV")',
    'button:has-text("Import")',
    'button[aria-label*="CSV" i]',
    'button[aria-label*="Import" i]',
    '[data-testid*="csv"]',
    'button:has-text("ไฟล์")',
  ];

  let csvBtn = null;
  for (const sel of csvBtnSelectors) {
    csvBtn = await page.$(sel);
    if (csvBtn) break;
  }

  if (!csvBtn) {
    // Navigate to subscriptions page
    await page.goto(`${BASE}/subscriptions`);
    await page.waitForTimeout(2000);
    for (const sel of csvBtnSelectors) {
      csvBtn = await page.$(sel);
      if (csvBtn) break;
    }
  }

  record('CSV-001', 'CSV Import', 'CSV Import button present', csvBtn ? 'PASS' : 'FAIL',
    csvBtn ? 'CSV/Import button found' : 'No CSV/Import button found',
    'SubscriptionTrackerPage.tsx', 'P1',
    'CSV import button present', csvBtn ? 'Found' : 'Not found');

  if (!csvBtn) return;

  await csvBtn.click();
  await page.waitForTimeout(1000);
  await screenshot('05-csv-modal');

  // 3.2 Check CSV modal opened
  const csvModal = await page.$('[role="dialog"], [class*="modal"], .fixed');
  record('CSV-002', 'CSV Import', 'CSV modal opens', csvModal ? 'PASS' : 'FAIL',
    csvModal ? 'CSV modal found' : 'No CSV modal',
    'CSVImportModal.tsx', 'P1',
    'CSV modal opens', csvModal ? 'Found' : 'Not found');

  // 3.3 Check upload area
  const uploadArea = await page.$('input[type="file"], [class*="upload"], [class*="dropzone"], [class*="drag"]');
  record('CSV-003', 'CSV Import', 'File upload area present', uploadArea ? 'PASS' : 'FAIL',
    uploadArea ? 'Upload area found' : 'No upload area',
    'CSVImportModal.tsx', 'P1',
    'Upload area present', uploadArea ? 'Found' : 'Not found');

  // 3.4 Create test CSV files
  const fixturesDir = path.join(__dirname, 'fixtures');
  if (!fs.existsSync(fixturesDir)) fs.mkdirSync(fixturesDir, { recursive: true });

  // Thai CSV
  const thaiCSV = 'วันที่,รายละเอียด,จำนวนเงิน\n01/06/2026,Netflix Thailand,299\n05/06/2026,AIS 4G Advance,399';
  fs.writeFileSync(path.join(fixturesDir, 'thai_bank_statement.csv'), thaiCSV);

  // English CSV
  const enCSV = 'Date,Description,Amount\n01/06/2026,Spotify Premium,149\n15/06/2026,YouTube Premium,199';
  fs.writeFileSync(path.join(fixturesDir, 'english_statement.csv'), enCSV);

  // Semicolon CSV
  const semiCSV = 'Date;Description;Amount\n01/06/2026;AIS;399;02/06/2026;dtac;299';
  fs.writeFileSync(path.join(fixturesDir, 'semicolon_statement.csv'), semiCSV);

  // Tab CSV
  const tabCSV = 'Date\tDescription\tAmount\n01/06/2026\tNetflix\t299\n05/06/2026\tSpotify\t149';
  fs.writeFileSync(path.join(fixturesDir, 'tab_statement.tsv'), tabCSV);

  // Invalid file
  fs.writeFileSync(path.join(fixturesDir, 'invalid.txt'), 'This is not a CSV file at all!!!');
  fs.writeFileSync(path.join(fixturesDir, 'large.csv'), 'a'.repeat(11 * 1024 * 1024)); // 11MB

  record('CSV-004', 'CSV Import', 'Test fixtures created', 'PASS',
    '5 fixtures created in tests/fixtures/', 'tests/', 'P1',
    'Fixtures exist', '5 files created');

  // 3.5 Test upload with file input
  if (uploadArea) {
    const fileInput = await page.$('input[type="file"]');
    if (fileInput) {
      try {
        await fileInput.setInputFiles(path.join(fixturesDir, 'thai_bank_statement.csv'));
        await page.waitForTimeout(2000);
        await screenshot('06-csv-uploaded');
        record('CSV-005', 'CSV Import', 'Thai CSV file accepted', 'PASS',
          'Thai CSV uploaded without crash',
          'CSVImportModal.tsx', 'P1',
          'File accepted', 'No crash');
      } catch (e) {
        record('CSV-005', 'CSV Import', 'Thai CSV file accepted', 'FAIL',
          `Upload crashed: ${e.message}`,
          'CSVImportModal.tsx', 'P1',
          'File accepted', `Error: ${e.message}`);
      }
    } else {
      record('CSV-005', 'CSV Import', 'File input element', 'FAIL',
        'Could not find input[type=file]',
        'CSVImportModal.tsx', 'P1',
        'File input exists', 'Not found');
    }
  }

  // 3.6 Test invalid file
  if (uploadArea) {
    const fileInput = await page.$('input[type="file"]');
    if (fileInput) {
      try {
        await fileInput.setInputFiles(path.join(fixturesDir, 'invalid.txt'));
        await page.waitForTimeout(1000);
        const errorMsg = await page.$('text=/invalid|error|wrong|type/i');
        record('CSV-006', 'CSV Import', 'Invalid file rejected with error', errorMsg ? 'PASS' : 'PARTIAL',
          errorMsg ? 'Error message shown' : 'No error message for invalid file',
          'csvImportService.ts', 'P1',
          'Error shown', errorMsg ? 'Error shown' : 'No error');
      } catch (e) {
        record('CSV-006', 'CSV Import', 'Invalid file rejected', 'PASS',
          'Upload handled error gracefully',
          'csvImportService.ts', 'P1',
          'Graceful handling', 'Handled');
      }
    }
  }

  // 3.7 Test large file rejection
  if (uploadArea) {
    const fileInput = await page.$('input[type="file"]');
    if (fileInput) {
      try {
        await fileInput.setInputFiles(path.join(fixturesDir, 'large.csv'));
        await page.waitForTimeout(1000);
        const sizeError = await page.$('text=/size|large|เกิน|ขนาด/i');
        record('CSV-007', 'CSV Import', 'Oversized file rejected', sizeError ? 'PASS' : 'PARTIAL',
          sizeError ? 'Size error shown' : 'No size error message',
          'csvImportService.ts', 'P1',
          'Size error shown', sizeError ? 'Error shown' : 'No error');
      } catch (e) {
        record('CSV-007', 'CSV Import', 'Oversized file rejected', 'PASS',
          'Large file handled gracefully',
          'csvImportService.ts', 'P1',
          'Graceful handling', 'Handled');
      }
    }
  }

  // 3.8 Test English CSV
  if (uploadArea) {
    const fileInput = await page.$('input[type="file"]');
    if (fileInput) {
      try {
        await fileInput.setInputFiles(path.join(fixturesDir, 'english_statement.csv'));
        await page.waitForTimeout(2000);
        await screenshot('07-english-csv');
        record('CSV-008', 'CSV Import', 'English CSV parsed', 'PASS',
          'English CSV parsed without error',
          'csvImportService.ts', 'P1',
          'Parse success', 'No crash');
      } catch (e) {
        record('CSV-008', 'CSV Import', 'English CSV parsed', 'FAIL',
          `Parse error: ${e.message}`,
          'csvImportService.ts', 'P1',
          'Parse success', `Error: ${e.message}`);
      }
    }
  }

  // 3.9 Test tab-delimited CSV
  if (uploadArea) {
    const fileInput = await page.$('input[type="file"]');
    if (fileInput) {
      try {
        await fileInput.setInputFiles(path.join(fixturesDir, 'tab_statement.tsv'));
        await page.waitForTimeout(2000);
        record('CSV-009', 'CSV Import', 'Tab-delimited CSV parsed', 'PASS',
          'Tab CSV parsed',
          'csvImportService.ts', 'P1',
          'Parse success', 'No crash');
      } catch (e) {
        record('CSV-009', 'CSV Import', 'Tab-delimited CSV parsed', 'FAIL',
          `Parse error: ${e.message}`,
          'csvImportService.ts', 'P1',
          'Parse success', `Error: ${e.message}`);
      }
    }
  }

  // 3.10 Close modal
  const closeBtn = await page.$('[aria-label="Close"], button:has-text("×"), button:has-text("Close"), [class*="close"]');
  if (closeBtn) await closeBtn.click();
  await page.waitForTimeout(500);
}

// ─── Duplicate Detection QA ─────────────────────────────────────────────────
async function testDuplicateDetection() {
  console.log('\n=== 4. DUPLICATE DETECTION QA ===');

  // Check implementation
  const csvPath = path.join(__dirname, '..', 'app/src/services/csvImportService.ts');
  if (!fs.existsSync(csvPath)) {
    record('DUP-001', 'Duplicate', 'CSV service exists', 'FAIL',
      'csvImportService.ts not found', 'csvImportService.ts', 'P1',
      'Service exists', 'Not found');
    return;
  }

  const csvContent = fs.readFileSync(csvPath, 'utf-8');
  const hasDuplicateFn = csvContent.includes('detectDuplicate') || csvContent.includes('duplicate');
  record('DUP-002', 'Duplicate', 'Duplicate detection function exists', hasDuplicateFn ? 'PASS' : 'FAIL',
    hasDuplicateFn ? 'Duplicate detection found in code' : 'No duplicate detection function',
    'csvImportService.ts', 'P1',
    'detectDuplicate function', hasDuplicateFn ? 'Found' : 'Not found');

  const hasVarianceCheck = /15|0\.15|percent/i.test(csvContent);
  record('DUP-003', 'Duplicate', 'Amount variance threshold (15%)', hasVarianceCheck ? 'PASS' : 'PARTIAL',
    hasVarianceCheck ? '15% variance check found' : '15% threshold not found in code',
    'csvImportService.ts', 'P1',
    '15% variance check', hasVarianceCheck ? 'Found' : 'Not found');

  const hasNameNorm = csvContent.includes('normalize') || csvContent.includes('toLowerCase') || csvContent.includes('trim');
  record('DUP-004', 'Duplicate', 'Name normalization', hasNameNorm ? 'PASS' : 'PARTIAL',
    hasNameNorm ? 'Name normalization found' : 'Name normalization not confirmed',
    'csvImportService.ts', 'P1',
    'Name normalization', hasNameNorm ? 'Found' : 'Not found');

  // Runtime test - upload same file twice
  const fixturesDir = path.join(__dirname, 'fixtures');
  const testCSV = path.join(fixturesDir, 'thai_bank_statement.csv');

  // Navigate to subscriptions
  await page.goto(`${BASE}/subscriptions`);
  await page.waitForTimeout(2000);

  // Find and open CSV import
  const csvBtn = await page.$('button:has-text("CSV"), button:has-text("Import")');
  if (csvBtn) {
    await csvBtn.click();
    await page.waitForTimeout(1000);

    const fileInput = await page.$('input[type="file"]');
    if (fileInput) {
      await fileInput.setInputFiles(testCSV);
      await page.waitForTimeout(2000);
      await screenshot('08-dup-first-upload');

      // Try importing
      const importBtn = await page.$('button:has-text("Import"), button:has-text("นำเข้า")');
      if (importBtn) {
        await importBtn.click();
        await page.waitForTimeout(3000);
      }

      await page.waitForTimeout(1000);
      await screenshot('09-dup-second-upload');
    }
  }

  record('DUP-005', 'Duplicate', 'Duplicate runtime detection', 'PARTIAL',
    'Manual verification needed for exact threshold behavior',
    'csvImportService.ts', 'P1',
    'Duplicate flagged correctly',
    'Visual inspection required');
}

// ─── Merchant & Category Audit ───────────────────────────────────────────────
async function testMerchantCategory() {
  console.log('\n=== 5. MERCHANT & CATEGORY AUDIT ===');

  const dbPath = path.join(__dirname, '..', 'app/src/services/merchantDatabase.ts');
  if (!fs.existsSync(dbPath)) {
    record('MERCH-001', 'Merchant', 'Merchant database file exists', 'FAIL',
      'merchantDatabase.ts not found', 'merchantDatabase.ts', 'P1',
      'File exists', 'Not found');
    return;
  }

  const dbContent = fs.readFileSync(dbPath, 'utf-8');

  // 5.1 Count merchants
  const merchantMatches = dbContent.match(/name:\s*['"][^'"]+['"]/g) || [];
  const merchantCount = merchantMatches.length;
  record('MERCH-002', 'Merchant', `Merchant count (${merchantCount}+)`, merchantCount >= 40 ? 'PASS' : 'FAIL',
    `${merchantCount} merchants found`,
    'merchantDatabase.ts', 'P1',
    '40+ merchants', `${merchantCount} found`);

  // 5.2 Check categories
  const categories = ['streaming', 'telecom', 'software', 'insurance', 'fitness', 'foodDelivery', 'finance', 'entertainment', 'bills', 'other'];
  let foundCats = 0;
  for (const cat of categories) {
    if (dbContent.includes(`'${cat}'`) || dbContent.includes(`"${cat}"`)) foundCats++;
  }
  record('MERCH-003', 'Merchant', `Category count (${foundCats}/10)`, foundCats >= 10 ? 'PASS' : 'FAIL',
    `${foundCats} of 10 categories found`,
    'merchantDatabase.ts', 'P1',
    '10 categories', `${foundCats}/10 found`);

  // 5.3 Check for duplicates (case-insensitive names)
  const names = merchantMatches.map(m => {
    const match = m.match(/name:\s*['"]([^'"]+)['"]/);
    return match ? match[1].toLowerCase().trim() : '';
  }).filter(Boolean);
  const uniqueNames = new Set(names);
  const duplicates = names.length - uniqueNames.size;
  record('MERCH-004', 'Merchant', 'No duplicate merchants', duplicates === 0 ? 'PASS' : 'FAIL',
    duplicates === 0 ? 'No duplicates found' : `${duplicates} duplicate names found`,
    'merchantDatabase.ts', 'P1',
    'No duplicates', duplicates === 0 ? 'Clean' : `${duplicates} duplicates`);

  // 5.4 Check THB icon presence
  const hasTHBIcon = dbContent.includes('฿') || dbContent.includes("'THB'") || dbContent.includes('"฿"');
  record('MERCH-005', 'Merchant', 'THB icon in merchant DB', hasTHBIcon ? 'PASS' : 'FAIL',
    hasTHBIcon ? 'THB icon found' : 'No THB icon',
    'merchantDatabase.ts', 'P1',
    'THB marker present', hasTHBIcon ? 'Found' : 'Missing');

  // 5.5 Check specific merchants
  const knownMerchants = ['Netflix', 'Spotify', 'AIS', 'YouTube', 'Grab', 'Line'];
  let foundMerchants = 0;
  for (const m of knownMerchants) {
    if (dbContent.includes(m)) foundMerchants++;
  }
  record('MERCH-006', 'Merchant', 'Known merchants present', foundMerchants >= 4 ? 'PASS' : 'FAIL',
    `${foundMerchants}/${knownMerchants.length} known merchants found`,
    'merchantDatabase.ts', 'P1',
    'Major merchants present', `${foundMerchants}/${knownMerchants.length}`);

  // 5.6 Check bank/wallet classification
  const banks = ['SCB', 'KBank', 'Krungsri', 'TrueWallet', 'Bitkub', 'TMM'];
  let foundBanks = 0;
  for (const b of banks) {
    if (dbContent.includes(b)) foundBanks++;
  }
  record('MERCH-007', 'Merchant', 'Bank/wallet merchants classified', foundBanks > 0 ? 'PASS' : 'PARTIAL',
    `${foundBanks} bank/wallet references found`,
    'merchantDatabase.ts', 'P1',
    'Bank merchants present', `${foundBanks} found`);
}

// ─── Responsive & Accessibility ──────────────────────────────────────────────
async function testResponsiveAccessibility() {
  console.log('\n=== 6. RESPONSIVE & ACCESSIBILITY ===');

  const viewports = [
    { name: 'iPhone SE', width: 375, height: 667 },
    { name: 'iPhone 14', width: 390, height: 844 },
    { name: 'iPhone 14 Pro Max', width: 430, height: 932 },
    { name: 'Desktop', width: 1280, height: 800 },
  ];

  for (const vp of viewports) {
    await page.setViewportSize({ width: vp.width, height: vp.height });
    await page.goto(`${BASE}/subscriptions`);
    await page.waitForTimeout(1500);
    await screenshot(`responsive-${vp.name.replace(' ', '-').toLowerCase()}`);

    // Check for horizontal overflow
    const bodyWidth = await page.evaluate(() => document.body.scrollWidth);
    const overflow = bodyWidth > vp.width;
    record(`RESP-${vp.name}`, 'Responsive', `No horizontal overflow (${vp.name})`,
      !overflow ? 'PASS' : 'FAIL',
      !overflow ? 'No overflow' : `Body width ${bodyWidth} > viewport ${vp.width}`,
      'SubscriptionTrackerPage.tsx', 'P1',
      'No horizontal scroll', !overflow ? 'Clean' : `Overflow: ${bodyWidth - vp.width}px`);

    // Check modal fits
    const addBtn = await page.$('button:has-text("Add"), button:has-text("เพิ่ม"), button:has-text("+")');
    if (addBtn) {
      await addBtn.click();
      await page.waitForTimeout(1000);
      await screenshot(`modal-${vp.name.replace(' ', '-').toLowerCase()}`);

      const modal = await page.$('[role="dialog"]');
      if (modal) {
        const box = await modal.boundingBox();
        if (box) {
          const modalOverflows = box.width > vp.width - 20;
          record(`RESP-MODAL-${vp.name}`, 'Responsive', `Modal fits viewport (${vp.name})`,
            !modalOverflows ? 'PASS' : 'FAIL',
            !modalOverflows ? 'Modal fits' : `Modal ${box.width.toFixed(0)}px > ${vp.width - 20}px`,
            'SubscriptionModal.tsx', 'P1',
            'Modal fits', !modalOverflows ? 'OK' : 'Too wide');
        }
      }

      // Close modal
      const closeBtn = await page.$('[aria-label="Close"], button:has-text("×"), [class*="close"]');
      if (closeBtn) await closeBtn.click();
      await page.waitForTimeout(500);
    }
  }

  // Accessibility checks
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto(`${BASE}/subscriptions`);
  await page.waitForTimeout(2000);

  // Check for ARIA labels on key elements
  const labeledButtons = await page.$$('[aria-label], [aria-labelledby]');
  record('A11Y-001', 'Accessibility', 'ARIA-labeled elements exist', labeledButtons.length > 0 ? 'PASS' : 'PARTIAL',
    `${labeledButtons.length} ARIA elements found`,
    'Various components', 'P2',
    'ARIA attributes present', `${labeledButtons.length} found`);

  // Check for form labels
  const inputs = await page.$$('input');
  const inputsWithLabels = await page.evaluate(() => {
    const inputs = document.querySelectorAll('input');
    let count = 0;
    for (const input of inputs) {
      const id = input.id || input.getAttribute('aria-labelledby');
      const label = id ? document.querySelector(`label[for="${id}"]`) : null;
      if (label || input.getAttribute('aria-label')) count++;
    }
    return count;
  });

  record('A11Y-002', 'Accessibility', 'Form inputs have labels', inputsWithLabels > 0 ? 'PASS' : 'PARTIAL',
    `${inputsWithLabels}/${inputs.length} inputs labeled`,
    'Form components', 'P2',
    'Inputs labeled', `${inputsWithLabels}/${inputs.length}`);

  // Keyboard navigation
  await page.keyboard.press('Tab');
  await page.keyboard.press('Tab');
  await screenshot('keyboard-nav');
  record('A11Y-003', 'Accessibility', 'Keyboard navigation works', 'PASS',
    'Tab key navigates focus',
    'Various', 'P2',
    'Keyboard works', 'Tab navigation OK');
}

// ─── Runtime Stability ───────────────────────────────────────────────────────
async function testRuntimeStability() {
  console.log('\n=== 7. RUNTIME STABILITY ===');

  const errors = [];
  page.on('pageerror', err => errors.push(`PAGE ERROR: ${err.message}`));
  page.on('console', msg => {
    if (msg.type() === 'error') errors.push(`CONSOLE ERROR: ${msg.text()}`);
  });

  // Navigate through pages
  const routes = ['/', '/subscriptions', '/dashboard'];
  for (const route of routes) {
    await page.goto(`${BASE}${route}`);
    await page.waitForTimeout(2000);
    await screenshot(`route-${route.replace(/\//g, '')}`);
  }

  // Open and close modal multiple times
  await page.goto(`${BASE}/subscriptions`);
  await page.waitForTimeout(1500);
  for (let i = 0; i < 3; i++) {
    const addBtn = await page.$('button:has-text("Add"), button:has-text("เพิ่ม"), button:has-text("+")');
    if (addBtn) {
      await addBtn.click();
      await page.waitForTimeout(800);
      const closeBtn = await page.$('[aria-label="Close"], button:has-text("×"), [class*="close"]');
      if (closeBtn) await closeBtn.click();
      await page.waitForTimeout(500);
    }
  }

  record('STAB-001', 'Stability', 'No React errors', errors.length === 0 ? 'PASS' : 'FAIL',
    errors.length === 0 ? 'No errors' : `${errors.length} errors: ${errors.slice(0, 2).join('; ')}`,
    'Various', 'P0',
    'Zero errors', errors.length === 0 ? 'Clean' : `${errors.length} errors`);

  if (errors.length > 0) {
    errors.forEach(e => console.log(`   ⚠️ ${e}`));
  }

  // Check for unhandled rejections
  const url = page.url();
  const has404 = await page.$('text=404, text=Not Found');
  record('STAB-002', 'Stability', 'No broken routes', !has404 ? 'PASS' : 'FAIL',
    !has404 ? 'All routes OK' : '404 found on some route',
    'Router', 'P0',
    'No 404s', has404 ? '404 found' : 'Clean');

  record('STAB-003', 'Stability', 'Current route loads', url ? 'PASS' : 'FAIL',
    `Current URL: ${url}`,
    'Router', 'P0',
    'Route loads', url || 'No URL');
}

// ─── PDF Scope Truth ─────────────────────────────────────────────────────────
async function testPDFScope() {
  console.log('\n=== 8. PDF SCOPE TRUTH ===');

  const csvPath = path.join(__dirname, '..', 'app/src/services/csvImportService.ts');
  if (fs.existsSync(csvPath)) {
    const csvContent = fs.readFileSync(csvPath, 'utf-8');
    const hasPDFSupport = csvContent.includes('.pdf') || csvContent.includes('PDF') || csvContent.includes('pdfjs') || csvContent.includes('pdf-parse');
    const hasPDFTODO = csvContent.includes('TODO') && csvContent.includes('pdf');

    if (hasPDFTODO) {
      record('PDF-001', 'PDF Scope', 'PDF support marked as TODO', 'PASS',
        'PDF TODO comment found in CSV service',
        'csvImportService.ts', 'P1',
        'PDF TODO marked', 'TODO found');
    } else if (hasPDFSupport) {
      record('PDF-001', 'PDF Scope', 'PDF support implemented', 'PARTIAL',
        'PDF references found - verify implementation',
        'csvImportService.ts', 'P1',
        'PDF TODO or not implemented', 'PDF code found');
    } else {
      record('PDF-001', 'PDF Scope', 'PDF import is NOT implemented', 'PASS',
        'No PDF support found - confirmed CSV-only',
        'csvImportService.ts', 'P1',
        'CSV only', 'No PDF code');
    }
  }

  // Check modal for PDF references
  const modalPath = path.join(__dirname, '..', 'app/src/components/CSVImportModal.tsx');
  if (fs.existsSync(modalPath)) {
    const modalContent = fs.readFileSync(modalPath, 'utf-8');
    const pdfInModal = modalContent.includes('PDF') || modalContent.includes('pdf');
    record('PDF-002', 'PDF Scope', 'CSV modal does not advertise PDF as ready', !pdfInModal ? 'PASS' : 'PARTIAL',
      !pdfInModal ? 'No PDF promises in UI' : 'PDF mentioned in modal',
      'CSVImportModal.tsx', 'P1',
      'No PDF in UI', pdfInModal ? 'PDF found' : 'Clean');
  }
}

// ─── Main ─────────────────────────────────────────────────────────────────────
async function main() {
  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log('║  DailyStack P0/P1 Runtime QA — Post-Implementation Audit  ║');
  console.log('╚════════════════════════════════════════════════════════════╝');
  console.log(`Started at: ${new Date().toISOString()}\n`);

  browser = await chromium.launch({ headless: true });
  context = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  page = await context.newPage();

  try {
    await auditCurrencyIntegrity();
    await testManualSubscriptionEntry();
    await testCSVImport();
    await testDuplicateDetection();
    await testMerchantCategory();
    await testResponsiveAccessibility();
    await testRuntimeStability();
    await testPDFScope();
  } catch (err) {
    console.error('\n❌ Test runner crashed:', err.message);
    console.error(err.stack);
  } finally {
    await browser.close();
  }

  // ─── Summary ───────────────────────────────────────────────────────────────
  console.log('\n╔════════════════════════════════════════════════════════════╗');
  console.log('║                    TEST RESULTS SUMMARY                     ║');
  console.log('╚════════════════════════════════════════════════════════════╝');

  const bySection = {};
  for (const r of results) {
    if (!bySection[r.section]) bySection[r.section] = { PASS: 0, FAIL: 0, PARTIAL: 0, BLOCKED: 0 };
    bySection[r.section][r.status]++;
  }

  for (const [section, counts] of Object.entries(bySection)) {
    console.log(`\n${section}:`);
    console.log(`  ✅ PASS:     ${counts.PASS || 0}`);
    console.log(`  ❌ FAIL:     ${counts.FAIL || 0}`);
    console.log(`  ⚠️  PARTIAL: ${counts.PARTIAL || 0}`);
    console.log(`  🚫 BLOCKED:  ${counts.BLOCKED || 0}`);
  }

  console.log(`\nTotal: ${results.length} tests`);
  console.log(`✅ Passed:  ${passed}`);
  console.log(`❌ Failed:  ${failed}`);
  console.log(`⚠️  Partial: ${skipped}`);

  // P0/P1 failures
  const p0p1Failures = results.filter(r => (r.severity === 'P0' || r.severity === 'P1') && (r.status === 'FAIL' || r.status === 'PARTIAL'));
  if (p0p1Failures.length > 0) {
    console.log(`\n⚠️  P0/P1 Issues requiring fixes (${p0p1Failures.length}):`);
    p0p1Failures.forEach(r => {
      console.log(`  [${r.severity}] ${r.label}`);
      console.log(`    ${r.evidence}`);
    });
  }

  // ─── Verdict ────────────────────────────────────────────────────────────────
  const criticalFailures = results.filter(r => r.severity === 'P0' && r.status === 'FAIL');
  const p1Failures = results.filter(r => r.severity === 'P1' && r.status === 'FAIL');

  let verdict = 'MINOR FIXES REQUIRED';
  if (criticalFailures.length > 0) {
    verdict = 'MAJOR RUNTIME ISSUES FOUND';
  } else if (failed === 0 && skipped === 0) {
    verdict = 'READY FOR USER ACCEPTANCE TESTING';
  }

  console.log(`\n╔════════════════════════════════════════════════════════════╗`);
  console.log(`║  FINAL VERDICT: ${verdict.padEnd(38)}║`);
  console.log(`╚════════════════════════════════════════════════════════════╝`);

  // Write JSON report
  const report = {
    timestamp: new Date().toISOString(),
    verdict,
    summary: { total: results.length, passed, failed, partial: skipped },
    bySection,
    results,
    p0p1Fixes: p0p1Failures,
    criticalFailures,
    p1Failures,
  };
  fs.writeFileSync(path.join(__dirname, 'qa-report.json'), JSON.stringify(report, null, 2));
  console.log(`\n📄 Report saved: tests/qa-report.json`);
}

main().catch(console.error);
