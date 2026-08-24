// Phase 7 Runtime Verification — Dashboard v36 screenshots
const { chromium } = require('@playwright/test');

const VIEWPORTS = [
  { name: '375x667', width: 375, height: 667 },
  { name: '390x844', width: 390, height: 844 },
  { name: '430x932', width: 430, height: 932 },
  { name: 'desktop', width: 1280, height: 900 },
];

const URL = 'http://localhost:5173/dashboard';

(async () => {
  const browser = await chromium.launch({ headless: true });
  const errors = [];

  for (const vp of VIEWPORTS) {
    const context = await browser.newContext({
      viewport: { width: vp.width, height: vp.height },
      deviceScaleFactor: 2,
    });
    const page = await context.newPage();

    // Collect console errors
    const pageErrors = [];
    page.on('console', msg => {
      if (msg.type() === 'error') pageErrors.push(msg.text());
    });
    page.on('pageerror', err => pageErrors.push(err.message));

    try {
      await page.goto(URL, { waitUntil: 'networkidle', timeout: 15000 });
      await page.waitForTimeout(2000); // animations

      const outPath = `screenshots/v36-dashboard-${vp.name}.png`;
      await page.screenshot({ path: outPath, fullPage: false });
      console.log(`✅ ${vp.name}: ${outPath}`);

      if (pageErrors.length > 0) {
        console.log(`⚠️  ${vp.name} console errors:`);
        pageErrors.forEach(e => console.log(`   - ${e}`));
        errors.push(...pageErrors.map(e => `[${vp.name}] ${e}`));
      } else {
        console.log(`✅ ${vp.name}: no console errors`);
      }
    } catch (e) {
      console.log(`❌ ${vp.name}: ${e.message}`);
      errors.push(`[${vp.name}] ${e.message}`);
    }

    await context.close();
  }

  await browser.close();

  if (errors.length > 0) {
    console.log('\n--- ERRORS SUMMARY ---');
    errors.forEach(e => console.log(e));
  } else {
    console.log('\n✅ All viewports passed');
  }
})();
