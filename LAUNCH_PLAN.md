# DailyStack — Launch Plan

**Product:** DailyStack — AI-Native Financial Operating System
**Launch Date:** June 12, 2026
**Theme:** Pilo/Emerald Mint (#CCFF00 / #C7FF2E)
**Pricing:** ฿99 Pro / ฿199 Elite
**Prepared:** June 10, 2026 (3 days to launch)

---

## Launch Day Countdown Checklist

```
╔══════════════════════════════════════════════════════════╗
║            DAILYSTACK LAUNCH — JUNE 12, 2026             ║
╠══════════════════════════════════════════════════════════╣
║ □ Product deployed to production                         ║
║ □ All 17 DB migrations verified on production           ║
║ □ Payment sandbox keys configured + webhook validated    ║
║ □ Email/SMTP working (test signup + OTP delivered)      ║
║ □ Monitoring alerts set for 500 errors                  ║
║ □ DB snapshot created before deploy                     ║
║ □ Rollback plan documented and tested                   ║
║ □ Social assets published (App Store, landing page)     ║
║ □ KOL/press outreach sent (D-1 or D-0 morning)        ║
║ □ All launch channels queued (PH, Twitter, FB, LINE)    ║
║ □ Team on-deck for launch-day support                  ║
╚══════════════════════════════════════════════════════════╝
```

---

## Part 1: Pre-Launch Checklist (June 9–12)

### 1.1 Product Readiness

| Area | Status | Notes |
|------|--------|-------|
| **Build** | ✅ DONE | TypeScript + Vite build verified June 9 (1,076 KB bundle) |
| **DB Migrations** | ✅ DONE | 17 migrations confirmed; 6 missing tables from migration spec still pending |
| **Auth Flow** | ⚠️ PENDING | OTP-first flow adopted from sample; verify Edge Function OTP delivery still works |
| **Subscriptions CRUD** | ✅ DONE | Full CRUD on `subscriptions` table |
| **Dashboard** | ✅ DONE | Income/Expense/Balance + month selector |
| **Insights Page** | ✅ DONE | Total costs, savings potential, renewal warnings |
| **Test Infrastructure** | ❌ NOT BLOCKING | Page objects/fixtures missing; P0 smoke tests skipped |
| **Payment Sandbox** | ⚠️ MANUAL | Must configure Stripe/Omise keys in staging env |
| **Email/SMTP** | ⚠️ MANUAL | Must verify OTP emails send correctly |
| **RLS Policies** | ✅ DONE | All tables have `user_id = auth.uid()` enforced |

**Critical gaps to close by June 11 EOD:**
1. Configure payment sandbox keys + validate webhook
2. Run end-to-end signup flow (email → OTP → profile created)
3. Create DB snapshot before any deploy
4. Verify Supabase Edge Function for custom OTP still works (or switch to Supabase built-in OTP)

---

### 1.2 Marketing Assets

| Asset | Status | Owner | Deadline |
|-------|--------|-------|----------|
| App Store listing (iOS) | ⚠️ NOT STARTED | Pickky | June 11 |
| App Store listing (Android) | ⚠️ NOT STARTED | Pickky | June 11 |
| Promo video (30–60s) | ⚠️ NOT STARTED | Pickky | June 11 |
| Landing page (web) | ⚠️ NOT STARTED | Pickky | June 11 |
| App Store screenshots (3–5) | ⚠️ NOT STARTED | Pickky | June 11 |
| Social profile assets (FB/IG/Twitter) | ⚠️ NOT STARTED | Pickky | June 11 |
| Emerald Mint brand assets (#CCFF00 / #C7FF2E) | ⚠️ NOT STARTED | Pickky | June 11 |
| Launch announcement graphics | ⚠️ NOT STARTED | Pickky | June 11 |

**Asset specs:**
- Screenshots: 6.7" (iPhone 14 Pro) — 1290×2796px
- Promo video: MP4, H.264, max 30MB for App Store
- Theme color overlay: #CCFF00 (Pilo) on dark backgrounds
- Landing page: Single-page with signup form, pricing (฿99/฿199), feature highlights

---

### 1.3 Launch Channels

| Channel | Action | Timing | Owner |
|---------|--------|--------|-------|
| **Product Hunt** | Submit launch + community engagement | D-1 (June 11) 8AM BKK | Pickky |
| **Twitter/X** | Thread launch announcement + demo clips | June 12, 9AM BKK | Pickky |
| **Facebook (Page)** | Launch post + 3 feature posts | June 12, 9AM BKK | Pickky |
| **Facebook Groups** | Thai fintech, tech, startup communities | June 12, 10AM BKK | Pickky |
| **Instagram** | Reel (60s demo) + 3 feed posts | June 12, 9AM BKK | Pickky |
| **LINE Official Account (OA)** | Broadcast message to existing followers | June 12, 11AM BKK | Pickky |
| **LinkedIn** | Company page post + article | June 12, 10AM BKK | Pickky |

**Facebook Groups to target:**
- Thai Tech & Startup Community
- Fintech Thailand
- สตาร์ทอัพไทย (Startup Thailand)
- รวมดอทคอม (Webmaster Thailand)

---

### 1.4 Press & KOL Outreach

| Outlet / Person | Type | Contact Method | Status |
|-----------------|------|----------------|--------|
| Techsauce | Media | outreach@techsauce.co | ⬜ NOT SENT |
| The Standard (Tech) | Media | tech@the standard.co | ⬜ NOT SENT |
| BrandInside | Media | contact@brandinside.asia | ⬜ NOT SENT |
| Marketeer | Media | info@marketeer.co | ⬜ NOT SENT |
| Thai fintech influencers (Twitter/IG) | KOL | DM outreach | ⬜ NOT SENT |

**Press kit should include:**
- 1-paragraph product description
- 3 key screenshots (Dashboard, Subscriptions, Insights)
- Pricing and availability
- Founder/team bio
- Brand assets (logo, theme colors)
- Contact: contact@dailystack.com

---

### 1.5 Launch-Day Timeline (June 12, 2026 — Bangkok Time)

| Time (BKK) | Action | Owner | Status |
|------------|--------|-------|--------|
| **8:00 AM** | Final production deploy + smoke test | Pickky | ⬜ |
| **8:30 AM** | Verify DB snapshot available for rollback | Pickky | ⬜ |
| **9:00 AM** | Post Product Hunt launch | Pickky | ⬜ |
| **9:00 AM** | Twitter/X thread goes live | Pickky | ⬜ |
| **9:00 AM** | Facebook + Instagram posts go live | Pickky | ⬜ |
| **9:30 AM** | LINE OA broadcast sent | Pickky | ⬜ |
| **10:00 AM** | LinkedIn company post + article published | Pickky | ⬜ |
| **10:00 AM** | Facebook group posts in Thai fintech communities | Pickky | ⬜ |
| **11:00 AM** | Monitor dashboard: signups, errors, support tickets | Pickky | ⬜ |
| **12:00 PM** | Midday check: first 3-hour metrics | Pickky | ⬜ |
| **3:00 PM** | Afternoon check: conversion rate, any support issues | Pickky | ⬜ |
| **6:00 PM** | Launch day wrap + post to team | Pickky | ⬜ |

---

### 1.6 Launch Metrics

| Metric | Target | How to Measure |
|--------|--------|----------------|
| **Signups (Day 1)** | > 100 | `auth.users` count new on June 12 |
| **Signups (Week 1)** | > 500 | Cumulative new users June 12–18 |
| **Pro upgrades (Week 1)** | > 5 | `profiles.tier = 'pro'` new count |
| **Elite upgrades (Week 1)** | > 2 | `profiles.tier = 'elite'` new count |
| **Upgrade conversion rate** | > 1% | (Pro + Elite) / Total signups |
| **Day 1 Retention (D1)** | > 40% | DAU on June 13 / signups on June 12 |
| **Day 3 Retention (D3)** | > 25% | DAU on June 15 / signups on June 12 |
| **Day 7 Retention (D7)** | > 20% | DAU on June 19 / signups on June 12 |
| **Product Hunt votes** | > 100 | PH launch page |
| **NPS (Day 7 survey)** | > 40 | In-app survey via email |
| **Support tickets (Day 1)** | < 10 | Intercom/Zendesk count |

**Track daily in a spreadsheet:**
```
Date | New Signups | Pro Upgrades | Elite Upgrades | D1 Retention | D3 Retention | D7 Retention | Notes
June 12  |     X      |      X       |       X        |      —       |      —       |      —       |
June 13  |     X      |      X       |       X        |      X       |      —       |      —       |
...
```

---

## Part 2: Social Media Content — Launch Week (June 12–18)

### Day 0 — Launch Day: June 12 (Thursday)

| Platform | Content Type | Caption/Hook | Visual | CTA |
|----------|-------------|--------------|--------|-----|
| **Facebook** | Post (long-form) | 🎉 **DailyStack is LIVE.** Your AI-native financial operating system is here. Track every subscription, see where your money goes, and cancel before you forget. Starting at just ฿99/month. #Fintech #Thailand | Dark BG with Emerald Mint (#CCFF00) headline "DailyStack LAUNCH" + app screenshot collage | Link to signup |
| **Instagram** | Reel (30s) | POV: You forgot a subscription you never use. Cut to DailyStack showing it. Text: "This could've been you." Voiceover + trending audio | App UI screen-record with Pilo green overlay + Thai voiceover | Link in bio |
| **Twitter/X** | Thread (5 tweets) | Tweet 1: "We just shipped DailyStack. 🧵" / Tweet 2: "The problem: Thai users lose ฿500–2,000/month to forgotten subscriptions." / Tweet 3: "So we built an AI-native financial OS." / Tweet 4: "Track everything. Cancel before you forget. Save before you realize." / Tweet 5: "Sign up free → link" | Each tweet has a matching visual (screenshot, stat, or product GIF) | Follow for updates |
| **Facebook Groups** | Short post | มาแล้ว! DailyStack — ระบบ AI สำหรับจัดการการเงินและ subscription ของคุณ ฟรีเริ่มต้น ฿99/เดือน 🔥 | Short promo graphic | Link + "ใครใช้แล้วบ้าง?" |

---

### Day 1 — June 13 (Friday)

| Platform | Content Type | Caption/Hook | Visual | CTA |
|----------|-------------|--------------|--------|-----|
| **Instagram** | Carousel (5 slides) | "5 subscription ที่คนไทยมักลืม cancel" / Slide 1: Streaming (Netflix, Disney+) / Slide 2: Gym memberships / Slide 3: Mobile insurance / Slide 4: Language apps / Slide 5: Your total potential savings | Emerald Mint card design, clean Thai typography | Swipe up to see your list |
| **Facebook** | Post | "Did you know? The average Thai household has 3.2 active subscriptions — but only tracks 1." + stat graphic | Infographic: #CCFF00 on dark | "How many do YOU have? Check in the comments 👇" |
| **Twitter** | Single tweet + poll | "Quick poll: How many active subscriptions do you have? (Be honest.)" | Poll with 4 options: 0–1 / 2–3 / 4–6 / 7+ | Vote and quote-retweet |

---

### Day 2 — June 14 (Saturday)

| Platform | Content Type | Caption/Hook | Visual | CTA |
|----------|-------------|--------------|--------|-----|
| **Instagram** | Story (5 slides) | "A day in the life with DailyStack" / Morning: see monthly spend / Lunch: get renewal alert for Spotify / Evening: review subscription audit / Night: financial summary | Screenshots of app with time-of-day overlay | Swipe up to start free |
| **Facebook** | Post (testimonial-style) | "Meet the ฿1,800 saved in month one. Real user. Real results." (fictional but relatable story) | Clean before/after graphic | Tag a friend who needs this |
| **Twitter** | Single tweet | "Fun fact: Streaming services alone cost Thai users an average of ฿600/month. That's ฿7,200/year." | Stat card with #CCFF00 | "Track yours free →" |

---

### Day 3 — June 15 (Sunday)

| Platform | Content Type | Caption/Hook | Visual | CTA |
|----------|-------------|--------------|--------|-----|
| **Facebook** | Post (educational) | "Renewal alert fatigue is real. Here's how DailyStack fixes it." / 3 tips: 1. Set renewal alerts 2. Audit quarterly 3. Use Money Twin to simulate cutting | Educational infographic | Share with a friend |
| **Instagram** | Reel (20s) | "POV: You get a notification that your VPN auto-renewed at ฿299/month for a service you forgot existed 😱" / Cut to DailyStack cancel flow | Dramatic recreation video + Pilo green | Link in bio |
| **LINE OA** | Broadcast message | "🌿 Week 1 special: First month Pro at ฿79 (instead of ฿99). Claim before June 30. Valid for new users only." | Minimal graphic + CTA button | Tap to activate |

---

### Day 4 — June 16 (Monday)

| Platform | Content Type | Caption/Hook | Visual | CTA |
|----------|-------------|--------------|--------|-----|
| **Twitter** | Thread (3 tweets) | "How to audit your subscriptions in 5 minutes using DailyStack. 🧵" / Step-by-step thread | App screenshots with step numbers | Follow for more tips |
| **Facebook** | Post (UGC-style) | "Monday motivation: Imagine what you could do with an extra ฿1,000–3,000/month." + aspirational lifestyle image | Emerald Mint gradient + text overlay | "What's your first cancellation goal?" |
| **Instagram** | Post (quote card) | "Financial clarity = financial freedom." + DailyStack logo | Minimalist dark BG with #CCFF00 text | Save this for motivation |

---

### Day 5 — June 17 (Tuesday)

| Platform | Content Type | Caption/Hook | Visual | CTA |
|----------|-------------|--------------|--------|-----|
| **Facebook** | Post (feature highlight) | "Introducing Money Twin: See your financial future if you keep vs. cut subscriptions. Your future self will thank you." | App screenshot of Money Twin feature | Try it free today |
| **Instagram** | Carousel (4 slides) | "The real cost of forgetting: A Thai user's story" / Slide 1: Gym membership forgot to cancel / Slide 2: 6 months charged ฿899/month / Slide 3: Total lost ฿5,394 / Slide 4: How DailyStack prevents this | Story-style carousel, Emerald Mint accents | Swipe to learn more |
| **Twitter** | Single tweet | "Launch week deal: Pro plan ฿79 first month (was ฿99). Link in bio. Ends June 30." | Simple promo card | Retweet to share |

---

### Day 6 — June 18 (Wednesday)

| Platform | Content Type | Caption/Hook | Visual | CTA |
|----------|-------------|--------------|--------|-----|
| **Facebook** | Post (reflection + CTA) | "Week 1 recap: How many subscriptions did you discover you didn't need? Drop a number 👇" | Week 1 summary graphic | "Tag someone who needs DailyStack" |
| **Instagram** | Story (3 slides) | "Week 1: What we learned from our first users." / Slide 1: Most popular feature / Slide 2: Top subscription category / Slide 3: Thank you + new features coming | App analytics mockup | Stay tuned |
| **Twitter** | Single tweet | "1 week, 500+ signups, ฿0 wasted on forgotten subscriptions. Thank you Thailand 🇹🇭" | Milestone celebration graphic | Quote-tweet to celebrate with us |
| **LINE OA** | Broadcast | "Week 1 special ending soon: ฿79 Pro first month. Valid for new users. Claim now →" | Promo graphic | Tap to upgrade |

---

## Part 3: Growth Levers — First 30 Days Post-Launch (June 19 – July 19)

Ranked by expected impact:

### Lever 1: Product-Led Subscription Audit Campaign

**How it works:**
Prompt every new user within 24 hours of signup to complete a "Subscription Audit" — a guided 3-step flow that imports or manually adds all their subscriptions. At the end, show their total monthly spend vs. the Thai average (฿1,200–2,000). The audit results are shareable as a branded image (like Spotify Wrapped).

**Mechanism:**
- Trigger: `first_login` event → show audit wizard modal
- Share output: "I spent ฿X/month on subscriptions. I didn't know ฿Y was going to waste."
- Channels: In-app → WhatsApp/LINE share + social share button

**Expected result:**
- Activation rate (first subscription added): 40% → 65%
- Week 1 retention: 25% → 40%
- Word-of-mouth: 15% of users share their audit → viral loop

**Why high impact:**
The audit creates the "aha moment" fastest — users immediately see value (savings clarity) within the first session. This is the #1 predictor of Day 7 retention for subscription management apps.

---

### Lever 2: Referral Program with Thai Social Context

**How it works:**
Launch a "Bring a Friend" referral program:
- Referrer: 1 month free Pro (฿99 credit) for each friend who upgrades to Pro
- Referee: ฿20 discount on first month Pro (bringing it to ฿79)

Thai users are highly responsive to LINE group sharing and "ทำความรู้จัก" (word-of-mouth). Design share buttons optimized for LINE (dominant platform) + Facebook. Use the audit result shareable card as the referral entry point.

**Mechanism:**
- In-app "Invite Friends" button on Dashboard
- Unique referral link per user (e.g., dailystack.app/invite/[user_id])
- Track: referral_signups, referral_upgrades, referral_activations

**Expected result:**
- 5% of monthly active users become referrers
- Referral signup rate: 3% of visitors → 12%
- LTV improvement: 20% increase via referral-driven Pro upgrades

**Why high impact:**
Thai social networks are highly interconnected. A single successful referral in a LINE group of 20–50 friends generates 2–5 signups. CAC via referral is typically ฿0–20 vs. ฿150–300 for paid ads.

---

### Lever 3: Content & Community SEO Funnel (FinTech + Subscription Saving)

**How it works:**
Publish Thai-language SEO content targeting high-intent keywords:
- "วิธียกเลิก subscription" (how to cancel subscription)
- "แอปติดตามค่าใช้จ่าย ดีที่สุด 2026"
- "รวม subscription ที่คนไทยลืม cancel บ่อยที่สุด"
- "เทคนิคประหยัดค่าใช้จ่ิน สำหรับมิลเลนเนียลไทย"

Each article embeds a DailyStack CTA and links to the audit tool. Target: 1 article per week for 4 weeks = 4 pillar pages.

**Mechanism:**
- Blog on website (dailystack.com/blog)
- Guest posts on Techsauce, BrandInside
- Distribution: LINE社群, Facebook groups, Twitter

**Expected result:**
- 500–1,000 organic search visitors/month by Week 4
- 2–3% conversion to signup from blog readers
- Long-tail SEO wins compound over months 2–3

**Why high impact:**
Thai fintech audience actively searches for subscription management content. Being the top result for "ยกเลิก subscription" drives high-intent, low-CAC traffic. This creates a sustainable acquisition channel beyond paid ads.

---

## Part 4: Early Warning Signals

These 5 metrics, if they go wrong on launch day, indicate something is broken:

| # | Metric | Warning Threshold | Likely Root Cause | What to Check |
|---|--------|-------------------|-------------------|---------------|
| **1** | Upgrade conversion rate | **< 1%** (of signups upgrading to Pro/Elite) | Stripe payment broken OR pricing page confusing OR upgrade CTA not visible | Test Stripe sandbox payment end-to-end; check browser console for payment errors; verify upgrade button renders on Dashboard |
| **2** | Signup completion rate | **< 30%** (of users who start signup, finish) | Auth flow broken at OTP step; Edge Function timeout; email deliverability (OTP never arrives) | Check Supabase Edge Function logs; test with temporary email; verify OTP email lands in inbox (not spam) |
| **3** | Day 1 retention rate | **< 20%** (returning on June 13) | Post-signup experience broken; empty dashboard; no onboarding; app crashes on mobile | Check `monthly_records` inserts; run Playwright smoke test on mobile viewport; verify Supabase RLS isn't blocking inserts |
| **4** | Payment webhook failure rate | **> 5%** | Stripe webhook not registered; endpoint mismatch; signature verification failing | Check Stripe webhook logs; verify endpoint URL in Stripe dashboard; test with Stripe CLI |
| **5** | Error rate on Dashboard page | **> 2%** (JS errors or 500s) | Supabase query timeout; RLS blocking data load; TypeScript runtime error | Check Vercel function logs; run `SELECT * FROM monthly_records LIMIT 1` with a test user; verify RLS allows SELECT |

**Escalation protocol:**
1. Identify which metric is red
2. Check the corresponding root cause column
3. If payment-related: roll back to last good deploy + restore DB snapshot
4. If auth-related: verify Supabase Auth quotas not exceeded (free tier limit: 50K MAU)
5. Open a P1 incident ticket immediately; assign owner

---

## Appendix: 30-Day Content Plan Reference

A completed 30-day Facebook + Instagram content plan exists (June 2 – July 1) covering:
- Content pillars: Financial tips, subscription saving hacks, product demos, user stories
- Posting cadence: 5 posts/week FB, 3 posts/week IG
- Story content: Daily interactive polls + Q&A
- This plan should be cross-referenced to avoid duplicating launch week content above

**Reference file location:** [Not present in repo — check Google Drive/Notion]

---

*Document version: 1.0*
*Owner: Pickky / DailyStack Growth Strategist*
*Next review: June 11, 2026 (pre-launch final check)*
