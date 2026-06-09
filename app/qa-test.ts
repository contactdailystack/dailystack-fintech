import { chromium } from 'playwright'
import * as fs from 'fs'
import * as path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const BASE = 'http://localhost:5174'
const OUT = path.join(__dirname, 'qa-screenshots')
fs.mkdirSync(OUT, { recursive: true })

const results: { page: string; ok: boolean; errors: string[]; screenshot?: string }[] = []

async function screenshot(page: Page, name: string) {
  const file = path.join(OUT, `${name}.png`)
  await page.screenshot({ path: file, fullPage: false })
  return file
}

async function run() {
  const browser = await chromium.launch({ headless: true })
  const page = await browser.newPage()
  page.setViewportSize({ width: 390, height: 844 })

  const consoleErrors: string[] = []
  page.on('console', (msg: any) => {
    if (msg.type() === 'error') consoleErrors.push(msg.text())
  })

  // ── Test 1: Landing page at / ──────────────────────────
  console.log('TEST: Landing page at /')
  await page.goto(BASE + '/', { waitUntil: 'networkidle', timeout: 15000 })
  await page.waitForTimeout(1000)
  const body1 = await page.locator('body').innerText().catch(() => '')
  const t1ok = body1.includes('Financial Clarity') && body1.includes('Made Simple') && body1.includes('Sign Up') && body1.includes('Login') && body1.includes('Continue with Google')
  results.push({ page: 'Landing page at /', ok: t1ok, errors: [...consoleErrors] })
  consoleErrors.length = 0
  await screenshot(page, '01-landing-page')

  // ── Test 2: Auth page at /login ────────────────────────
  console.log('TEST: Auth page at /login')
  await page.goto(BASE + '/login', { waitUntil: 'networkidle', timeout: 15000 })
  await page.waitForTimeout(1000)
  const body2 = await page.locator('body').innerText().catch(() => '')
  const t2ok = body2.includes('Financial Clarity') && body2.includes('Sign Up') && body2.includes('Login') && body2.includes('Continue with Google')
  results.push({ page: 'Auth page at /login', ok: t2ok, errors: [...consoleErrors] })
  consoleErrors.length = 0
  await screenshot(page, '02-auth-page')

  // ── Test 3: Landing page Sign Up button navigates ────
  console.log('TEST: Sign Up button navigates')
  await page.goto(BASE + '/', { waitUntil: 'networkidle', timeout: 15000 })
  await page.waitForTimeout(1000)
  const ctaBtn = page.locator('text=Sign Up').first()
  if (await ctaBtn.isVisible().catch(() => false)) {
    await ctaBtn.click()
    await page.waitForTimeout(1500)
  }
  const url3 = page.url()
  const t3ok = url3.includes('/login') || url3.includes('/onboarding')
  results.push({ page: 'Sign Up button navigates', ok: t3ok, errors: [...consoleErrors] })
  consoleErrors.length = 0
  await screenshot(page, '03-signup-click')

  // ── Test 4: Google button present ───────────────────────
  console.log('TEST: Google button on landing page')
  const body4 = await page.locator('body').innerText().catch(() => '')
  const t4ok = body4.includes('Continue with Google')
  results.push({ page: 'Google button on landing', ok: t4ok, errors: [...consoleErrors] })
  consoleErrors.length = 0
  await screenshot(page, '04-google-button')

  // ── Test 5: Onboarding — protected, redirects to /login ──
  console.log('TEST: Onboarding page (protected → /login)')
  await page.goto(BASE + '/onboarding', { waitUntil: 'networkidle', timeout: 15000 })
  await page.waitForTimeout(1000)
  const url5 = page.url()
  const body5 = await page.locator('body').innerText().catch(() => '')
  const t5ok = url5.includes('/login') && body5.includes('Financial Clarity')
  results.push({ page: 'Onboarding page (auth guard)', ok: t5ok, errors: [...consoleErrors] })
  consoleErrors.length = 0
  await screenshot(page, '05-onboarding')

  // ── Test 6: Settings — protected, redirects to /login ──
  console.log('TEST: Settings page (protected → /login)')
  await page.goto(BASE + '/settings', { waitUntil: 'networkidle', timeout: 15000 })
  await page.waitForTimeout(1000)
  const url6 = page.url()
  const body6 = await page.locator('body').innerText().catch(() => '')
  const t6ok = url6.includes('/login') && body6.includes('Financial Clarity')
  results.push({ page: 'Settings page (auth guard)', ok: t6ok, errors: [...consoleErrors] })
  consoleErrors.length = 0
  await screenshot(page, '06-settings')

  // ── Test 7: Dashboard — protected, redirects to /login ──
  console.log('TEST: Dashboard page (protected → /login)')
  await page.goto(BASE + '/dashboard', { waitUntil: 'networkidle', timeout: 15000 })
  await page.waitForTimeout(1000)
  const url7 = page.url()
  const body7 = await page.locator('body').innerText().catch(() => '')
  const t7ok = url7.includes('/login') && body7.includes('Financial Clarity')
  results.push({ page: 'Dashboard page (auth guard)', ok: t7ok, errors: [...consoleErrors] })
  consoleErrors.length = 0
  await screenshot(page, '07-dashboard')

  // ── Test 8: Subscriptions — protected, redirects to /login ──
  console.log('TEST: Subscriptions page (protected → /login)')
  await page.goto(BASE + '/subscriptions', { waitUntil: 'networkidle', timeout: 15000 })
  await page.waitForTimeout(1000)
  const url8 = page.url()
  const body8 = await page.locator('body').innerText().catch(() => '')
  const t8ok = url8.includes('/login') && body8.includes('Financial Clarity')
  results.push({ page: 'Subscriptions page (auth guard)', ok: t8ok, errors: [...consoleErrors] })
  consoleErrors.length = 0
  await screenshot(page, '08-subscriptions')

  // ── Test 9: Insights — protected, redirects to /login ──
  console.log('TEST: Insights page (protected → /login)')
  await page.goto(BASE + '/insights', { waitUntil: 'networkidle', timeout: 15000 })
  await page.waitForTimeout(1000)
  const url9 = page.url()
  const body9 = await page.locator('body').innerText().catch(() => '')
  const t9ok = url9.includes('/login') && body9.includes('Financial Clarity')
  results.push({ page: 'Insights page (auth guard)', ok: t9ok, errors: [...consoleErrors] })
  consoleErrors.length = 0
  await screenshot(page, '09-insights')

  // ── Test 10: Wallet — protected, redirects to /login ──
  console.log('TEST: Wallet page (protected → /login)')
  await page.goto(BASE + '/wallet', { waitUntil: 'networkidle', timeout: 15000 })
  await page.waitForTimeout(1000)
  const url10 = page.url()
  const body10 = await page.locator('body').innerText().catch(() => '')
  const t10ok = url10.includes('/login') && body10.includes('Financial Clarity')
  results.push({ page: 'Wallet page (auth guard)', ok: t10ok, errors: [...consoleErrors] })
  consoleErrors.length = 0
  await screenshot(page, '10-wallet')

  // ── Test 11: Todo — protected, redirects to /login ──
  console.log('TEST: Todo page (protected → /login)')
  await page.goto(BASE + '/todo', { waitUntil: 'networkidle', timeout: 15000 })
  await page.waitForTimeout(1000)
  const url11 = page.url()
  const body11 = await page.locator('body').innerText().catch(() => '')
  const t11ok = url11.includes('/login') && body11.includes('Financial Clarity')
  results.push({ page: 'Todo page (auth guard)', ok: t11ok, errors: [...consoleErrors] })
  consoleErrors.length = 0
  await screenshot(page, '11-todo')

  // ── Summary ────────────────────────────────────────────
  await browser.close()

  console.log('\n\n=== QA RESULTS ===')
  const pass = results.filter(r => r.ok).length
  const fail = results.filter(r => !r.ok).length
  for (const r of results) {
    const icon = r.ok ? '✅' : '❌'
    console.log(`${icon} ${r.page}: ${r.ok ? 'PASS' : 'FAIL'}`)
    if (r.errors.length > 0) {
      console.log(`   Console errors: ${r.errors.slice(0, 3).join(' | ')}`)
    }
  }
  console.log(`\nTotal: ${pass} passed, ${fail} failed out of ${results.length}`)
  console.log(`Screenshots saved to: ${OUT}`)
}

run().catch(e => { console.error('QA failed:', e); process.exit(1) })
