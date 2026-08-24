# Thailand Bank Transaction Import — Feasibility Study
**Project:** PicksWise (formerly DailyStack FinTech) — P2 Roadmap Decision Gate
**Author:** Mavis — Thailand Feasibility Research
**Date:** 2026-07-14
**Status:** DECISION READY

---

## Executive Summary

### Decision Gate: NO-GO for Bank API Integration (MVP Phase)

**Bank connection / transaction import via third-party API aggregators is NOT viable for the MVP.** Thailand's open banking ecosystem is in a pre-standardization phase — API aggregator standards have not been finalized, and real bank coverage is effectively zero for PicksWise's target user base.

**Recommended MVP path:** Manual subscription entry + CSV/statement import only. Reassess after Thailand virtual banks launch (mid-2026) and open banking API standards mature.

### Evidence Summary

| Claim | Status | Source |
|---|---|---|
| Plaid covers Thailand | ❌ FALSE | Plaid.com/global lists US, CA, UK, EU only — no Thailand coverage explorer |
| Thailand has mature open banking | ❌ FALSE | "Open banking implementation in Thailand remains subject to feasibility studies, and the application programming interface standards have yet to be finalised" | Chambers FinTech 2026 Thailand |
| Thai bank APIs are open to TPPs | ❌ FALSE | 0 of 229 Thai banks have developer portals or sandbox access | Open Banking Tracker, 2026 |
| Any aggregator covers major Thai banks | ⚠️ UNCLEAR | 1 of 229 Thai institutions reachable via aggregators (Mercantile Bank — not a major bank) | Open Banking Tracker, 2026 |
| LINE Pay provides transaction data | ❌ FALSE | LINE Pay is a payment API (accept/cancel/refund) — no account aggregation | LINE Pay API docs |
| Fintable covers Thai banks | ⚠️ POSSIBLE but unverified | Listed on Open Banking Tracker; underlying providers (Plaid/Nordigen) have minimal Thailand presence | Banq.ai, Open Banking Tracker |

### Priority Framework for MVP

- **P0 (Do First):** Manual subscription entry UX redesign — ship this in the current sprint
- **P1 (Do Next):** CSV / bank statement import — user uploads PDF or CSV, app parses subscriptions
- **P2 (Reassess Q4 2026):** Bank connection — only after Thailand virtual banks launch and open banking API standards are finalized

---

## 1. Thailand Open Banking Landscape

### 1.1 Current State (July 2026)

Thailand is classified as **"In Progress"** on open banking development. Key facts:

- **Open Banking Tracker (2026):** 229 banks and financial institutions tracked in Thailand
  - **0** have developer portals
  - **0** offer sandbox access
  - **1** is reachable through an API aggregator
- **Chambers FinTech 2026 — Thailand:** "Thailand's open banking implementation in Thailand remains subject to feasibility studies, and the application programming interface standards have yet to be finalised."
- **BOT "3 Opens" Strategy:** Thailand's open banking framework builds on PromptPay success, but is in early stages. BOT published a consultation paper in November 2023 on "Open Data for Consumer Empowerment" — the data-sharing framework is still being developed.
- **dStatement (Jan 2022):** The first open banking initiative was the dStatement — an exchange of financial statement data among banks to support digital loan applications. This is bank-to-bank, not third-party access.

**Source:** [Chambers FinTech 2026 — Thailand](https://practiceguides.chambers.com/practice-guides/fintech-2026/thailand/trends-and-developments) | [Open Banking Tracker — Thailand](https://www.openbankingtracker.com/country/thailand) | [Open Banking Tracker — Thailand Banks](https://www.openbankingtracker.com/providers/country/th)

### 1.2 Thailand Virtual Banks — Opening 2026

On 19 June 2025, the Ministry of Finance and Bank of Thailand approved three virtual bank licensees:

1. **ACM Holding Co. (Ascend Money / TrueMoney)** — CP Group
2. **Krungthai Bank + AIS + PTT Oil & Retail** —国有银行+电信+零售
3. **SCBX + WeTechnology + KakaoBank** — SCB集团+韩国KakaoBank+微众银行

All three are required to begin operations by mid-2026 (within one year of approval). These virtual banks will be built on modern digital infrastructure and may offer better API access than traditional Thai banks.

**Implication:** Virtual banks (mid-2026 launch) are a potential future entry point for bank connection. Their APIs may be more TPP-friendly than traditional banks.

**Source:** [Chambers FinTech 2026 — Thailand](https://practiceguides.chambers.com/practice-guides/fintech-2026/thailand/trends-and-developments) | [Krungsri Research — Virtual Banks](https://www.krungsri.com/en/research/research-intelligence/virtual-bank-2025)

### 1.3 PDPA Enforcement Status (2026)

Thailand's Personal Data Protection Act (PDPA) is actively enforced:

- **August 2025:** THB 21.5 million in fines issued under PDPA
- **October 2025:** Mandatory DPO (Data Protection Officer) required for state agencies
- Cross-border transfer rules are enforceable
- **Implication for PicksWise:** Any bank connection feature that collects, stores, or transmits Thai user financial data must comply with PDPA. This adds compliance overhead for any third-party aggregator integration.

**Source:** [CookieInformation — Thailand PDPA 2026](https://cookieinformation.com/blog/what-is-the-thailand-pdpa/) | [Fiskil — Thailand Open Finance Tracker](https://www.fiskil.com/open-finance-tracker)

---

## 2. Provider Research — Thailand Coverage

### 2.1 Plaid (USA)

| Dimension | Finding |
|---|---|
| **Thailand Coverage** | ❌ NONE confirmed |
| **Official Documentation** | Plaid.com/global lists US, Canada, UK, Europe only. No Thailand Coverage Explorer exists. |
| **Open Banking Tracker** | Plaid listed as covering Thailand (country-level flag), but Mercantile Bank is the only Thai institution listed — not a major retail bank |
| **Verdict** | BLOCKED for Thailand. No official Thailand product page or coverage explorer. |

**Source:** [Plaid Global](https://plaid.com/global/) | [Banq.ai Asia Coverage](https://www.banq.ai/coverage/asia) | [Open Banking Tracker — Thailand Banks](https://www.openbankingtracker.com/providers/country/th)

### 2.2 TrueLayer (UK)

| Dimension | Finding |
|---|---|
| **Thailand Coverage** | ❌ NONE — Thailand not in their 21 confirmed countries |
| **Official Documentation** | TrueLayer lists 21 countries: UK, Ireland, France, Germany, Spain, Finland, Sweden, Italy, Netherlands, Portugal, Poland, Latvia, Lithuania, Luxembourg, Malta, Greece, Austria, Belgium, Croatia, Cyprus, Estonia |
| **Verdict** | BLOCKED. Thailand not listed. Their Thailand country-level flag on Open Banking Tracker likely reflects their general market research, not production access. |

**Source:** [TrueLayer — Countries](https://support.truelayer.com/hc/en-us/articles/10973416170769-What-countries-is-TrueLayer-live-in) | [TrueLayer Docs — Supported Providers](https://docs.truelayer.com/docs/supported-providers-table)

### 2.3 Nordigen / GoCardless (UK/Latvia)

| Dimension | Finding |
|---|---|
| **Thailand Coverage** | ⚠️ UNCLEAR — listed on Banq.ai for Thailand but Nordigen's focus is Europe (900+ banks in 29 European countries, 63 total countries including non-EU markets) |
| **Thailand institutions on Banq.ai** | TransferWise Thailand listed via Nordigen/GoCardless — but TransferWise is a money transfer service, not a Thai retail bank |
| **Key fact** | Nordigen (acquired by GoCardless 2022) was built on PSD2/EU open banking framework. Thailand does not have a PSD2-equivalent, so Nordigen's coverage claim for Thailand is likely thin |
| **Verdict** | CONDITIONAL. Banq.ai listing may include TransferWise only. Requires direct verification with GoCardless sales team before relying on this. |

**Source:** [Banq.ai Asia Coverage](https://www.banq.ai/coverage/asia) | [GoCardless — Nordigen Acquisition](https://gocardless.com/en-us/blog/gocardless-acquire-open-banking-platform-nordigen) | [Nordigen Medium — Banking APIs](https://nordigen.medium.com/list-of-all-banking-apis-updated-3bb6029a0033)

### 2.4 Salt Edge (Spain)

| Dimension | Finding |
|---|---|
| **Thailand Coverage** | ⚠️ POSSIBLE — listed on Banq.ai (Thailand: 2 institutions via 6 aggregators including Salt Edge) and Open Banking Tracker |
| **Claims** | 1,586+ institutions in 73 countries |
| **Thailand institutions on Banq.ai** | TransferWise Thailand + Mercantile Bank Thailand |
| **Verdict** | CONDITIONAL. Salt Edge has the broadest global coverage claim of any aggregator. Banq.ai shows them for Thailand. However, neither TransferWise nor Mercantile Bank are major Thai retail banks. Major Thai banks (SCB, KBank, BBL, Krungsri) NOT confirmed via Salt Edge. Requires direct verification. |

**Source:** [Banq.ai Asia Coverage](https://www.banq.ai/coverage/asia) | [Salt Edge — Coverage](https://www.saltedge.com/products/account_information/coverage) | [Open Banking Tracker — Thailand Banks](https://www.openbankingtracker.com/providers/country/th)

### 2.5 Bud Financial (UK)

| Dimension | Finding |
|---|---|
| **Thailand Coverage** | ❌ NONE confirmed |
| **Official Documentation** | Bud Connect docs explicitly state: "Connect enables you to: Get Open Banking coverage for 60+ UK banks." No Thailand or Asia mention. |
| **Focus** | UK and EU markets only |
| **Verdict** | BLOCKED. UK/EU focused. No Asia coverage. |

**Source:** [Bud Financial — Intro to Connect](https://docs.thisisbud.com/docs/intro-to-connect) | [Bud Financial — API Provider](https://apis.io/providers/bud-co/)

### 2.6 Akoya (USA)

| Dimension | Finding |
|---|---|
| **Thailand Coverage** | ❌ NONE — US market only |
| **Official Documentation** | Akoya powers "7.5K+ apps" in the US. FDX API standards (US Financial Data Exchange). No international expansion mentioned. |
| **Banq.ai** | Not listed for Thailand |
| **Verdict** | BLOCKED. US-only. Built on FDX standards, not applicable to Thailand. |

**Source:** [Akoya — Home](https://akoya.com/) | [Akoya — FDX](https://financialdataexchange.org/fdx-feed/member-spotlight-akoya/)

### 2.7 Fintable (Singapore)

| Dimension | Finding |
|---|---|
| **Thailand Coverage** | ⚠️ POSSIBLE but unverified — listed on Open Banking Tracker (Thailand page) |
| **How it works** | Fintable aggregates Plaid, Finicity, Tink, and Nordigen/GoCardless under one roof. For Thailand, they would rely on these providers' connections. |
| **Thailand coverage via aggregators** | Plaid (minimal/none) + Nordigen (unclear) = very limited Thai bank access |
| **Custom integration** | $5,000 one-time fee, 2-week timeline per unsupported bank |
| **Verdict** | CONDITIONAL. Fintable is essentially a meta-aggregator. Their Thailand coverage depends entirely on Plaid/Nordigen, both of which have minimal Thailand presence. Not a viable path without direct bank integrations. |

**Source:** [Fintable — Coverage](https://fintable.io/coverage) | [Fintable — Guide](https://fintable.io/guide) | [AppSumo — Fintable Q&A](https://appsumo.com/products/fintable/questions/please-answer-these-questions-for-me-1-974862/)

### 2.8 LINE Pay Thailand

| Dimension | Finding |
|---|---|
| **Transaction Data API** | ❌ NOT AVAILABLE |
| **What LINE Pay provides** | Payment acceptance, refunds, cancellations, balance inquiry, transaction history (merchant-side only) |
| **Verdict** | BLOCKED for PicksWise use case. LINE Pay is a payment processor, not an account information service provider (AISP). Cannot pull user's bank transactions via LINE Pay. |

**Source:** [LINE Pay API](https://pay.line.me/) | Verified from API documentation structure

### 2.9 Thai Bank Direct APIs

Thai banks (SCB, KBank, BBL, Krungsri, etc.) have developer portals but are **NOT open to third-party developers** for account aggregation:

- Bangkok Bank API portal exists (developer.bangkokbank.com) but provides **product/service information APIs only** — not transaction data or account access APIs
- No Thai bank has implemented AISP (Account Information Service Provider) endpoints for third-party access
- **0 of 229 Thai banks** have developer portals on Open Banking Tracker
- No sandbox access available
- Open banking API standards have "yet to be finalised" in Thailand (Chambers FinTech 2026)

**Source:** [Bangkok Bank API](https://developer.bangkokbank.com/) | [Open Banking Tracker — Thailand](https://www.openbankingtracker.com/providers/country/th)

---

## 3. Thailand API Aggregator Summary

| Provider | Thailand Status | Coverage Detail | Verdict |
|---|---|---|---|
| **Plaid** | ❌ None confirmed | No Thailand page or coverage explorer | BLOCKED |
| **TrueLayer** | ❌ None confirmed | 21 EU/UK countries only; Thailand not listed | BLOCKED |
| **Nordigen/GoCardless** | ⚠️ Unclear | Listed on Banq.ai but likely TransferWise only | CONDITIONAL — verify with sales |
| **Salt Edge** | ⚠️ Unclear | Listed on Banq.ai (2 institutions) | CONDITIONAL — verify with sales |
| **Bud Financial** | ❌ None confirmed | UK/EU only | BLOCKED |
| **Akoya** | ❌ None confirmed | US-only (FDX standards) | BLOCKED |
| **Fintable** | ⚠️ Possible | Meta-aggregator; Thailand depends on Plaid/Nordigen | CONDITIONAL — verify specific banks |
| **LINE Pay** | ❌ No account data | Payment API only | BLOCKED |
| **Thai bank direct APIs** | ❌ Not TPP-ready | 0 developer portals, 0 sandbox access | BLOCKED |

**Critical note:** The Open Banking Tracker lists all 6 aggregators as having "Thailand coverage" at the country level. However, the **bank-level data** (Open Banking Tracker → Thailand → 229 banks → 1 aggregator-reachable) reveals the truth: only **Mercantile Bank Thailand** (minor bank) is confirmed reachable via Plaid, and TransferWise Thailand is reachable via Bridge/Fintecture/Nordigen/Salt Edge. **No major Thai retail bank (SCB, KBank, BBL, Krungsri, TMB) is confirmed reachable.**

---

## 4. PDPA Impact Assessment by Channel

| Channel | PDPA Risk | Notes |
|---|---|---|
| **Manual subscription entry** | ✅ LOW | User voluntarily enters their own data. No third-party access. |
| **CSV/statement import** | ✅ LOW | User uploads their own file. PicksWise processes locally or server-side without sharing. |
| **Bank API (any aggregator)** | ⚠️ MEDIUM-HIGH | Requires storing/transmitting bank connection tokens. Cross-border data transfer (e.g., Plaid US servers) triggers PDPA Section 28 cross-border rules. Needs explicit consent mechanism and potentially SCCs (Standard Contractual Clauses). |
| **LINE Pay** | ✅ LOW | Not a transaction data source for PicksWise use case. |
| **Screen scraping** | ❌ HIGH | PDPA prohibits unauthorized access to computer systems. Screen scraping Thai bank login credentials would likely violate PDPA and banking security laws. |

**Recommendation:** If/when bank API integration is pursued, PicksWise must:
1. Be licensed or registered as an AISP (if Thailand requires this)
2. Implement explicit, granular consent flows
3. Use encrypted token storage (never store in `users` table — use `financial_connections` table per multi-tenant iron rule)
4. Evaluate cross-border transfer implications for each aggregator's server locations
5. Conduct a PDPA Data Protection Impact Assessment (DPIA) before launch

---

## 5. Thailand Open Banking Market Outlook

**Market Size:** Thailand Open Banking Market projected to grow from USD 5.6 billion (2025) to USD 19.2 billion (2031), CAGR 23.1%. [Mobility Foresights](https://mobilityforesights.com/product/thailand-open-banking-market)

**Key catalysts:**
- Virtual banks launching mid-2026 (KakaoBank + SCBX, Ascend Money/TrueMoney, Krungthai + AIS)
- BOT "Your Data" data-sharing initiative progressing
- National Digital ID scheme supporting open banking KYC
- ASEAN Regional Payment Connectivity expanding
- IMF/World Bank Annual Meetings hosted in Bangkok, Oct 2026

**Best time to reassess:** Q4 2026 — after virtual banks launch and open banking API standards are finalized.

---

## 6. Decision Gate — Go / Conditional Go / No-Go

### Decision: Bank API Integration for PicksWise MVP

**VERDICT: NO-GO**

| Criterion | Required Threshold | Current Status | Met? |
|---|---|---|---|
| At least 1 major Thai retail bank reachable via aggregator | SCB, KBank, BBL, Krungsri, or TMB | 0 confirmed | ❌ NO |
| Open banking API standards finalized in Thailand | Published, stable API spec | "Yet to be finalised" | ❌ NO |
| Thai bank developer portals / sandbox access | At least 1 major bank | 0 of 229 banks | ❌ NO |
| AISP licensing framework available | Clear path to become AISP in Thailand | Unclear / not established | ❌ NO |
| PDPA compliance pathway for cross-border data | Legal basis for data transfer | Requires legal review | ⚠️ UNCLEAR |
| Production-ready aggregator confirmed for Thailand | Direct verification from aggregator | None confirmed | ❌ NO |

### Next Decision Point

**Reassess in Q4 2026.** Triggers:
1. Thailand virtual banks (mid-2026) launch and publish APIs
2. BOT finalizes open banking API standards
3. At least 1 major Thai bank confirmed reachable via a production-tested aggregator
4. PDPA AISP licensing pathway clarified

---

## 7. Updated P0/P1/P2 Roadmap

### P0 — Must Have (Current Sprint)

**1. Manual Subscription Entry UX Redesign**
- Improve the manual subscription entry experience
- Focus on reducing friction for first-time users
- Smart defaults (currency THB, common merchant detection, category suggestions)
- Estimated: Current sprint scope

**Database design note:** When adding bank connections in the future:
- **NEVER** store access tokens in `users` table
- Create `financial_connections` table with:
  - `company_id` (multi-tenant iron rule)
  - `user_id`
  - `provider` (e.g., 'salt_edge', 'nordigen')
  - `encrypted_access_token` (server-side only, encrypted at rest)
  - `consent_expires_at`
  - `last_synced_at`
  - `status` (active/revoked/error)
  - `created_at`, `updated_at`
- RLS policies enforce tenant isolation
- Separate audit log table for all sync events

### P1 — Should Have (Next Sprint)

**2. CSV / Bank Statement Import**
- User uploads PDF bank statement or CSV export
- PicksWise parses transactions and identifies recurring payments
- Ghost subscription detection from parsed data
- Privacy-preserving: file processed server-side, not shared
- No aggregator dependency
- PDPA impact: Low (user uploads their own data)
- Estimated: 1 sprint

**3. Receipt / Invoice Import**
- User forwards bank notification SMS/email or uploads receipt
- OCR or pattern matching to extract subscription details
- Works with Thai banking apps' transaction notifications

### P2 — Nice to Have (Reassess Q4 2026)

**4. Bank Connection via Aggregator**
- Pursue after: virtual banks launch + open banking standards finalize
- Evaluate: Salt Edge, Nordigen/GoCardless, or Fintable
- Requires: AISP licensing research, PDPA DPIA, aggregator verification
- Estimated: 2-3 sprints + legal review + aggregator partnership

**5. LINE Notify / PromptPay Integration**
- Thai-specific notification channels for renewal alerts
- Not a transaction data source — complementary to bank connection

**6. Virtual Bank Integration (2026+)**
- When KakaoBank Thailand, Ascend Money, or Krungthai Digital launch APIs
- These are built on modern infrastructure and may be more TPP-friendly

---

## 8. Source Citations

| # | Claim | Source | Type |
|---|---|---|---|
| 1 | Plaid Thailand: US, CA, UK, EU only | Plaid.com/global | VF (Verified from primary source) |
| 2 | Thailand: 229 banks, 0 developer portals, 0 sandbox, 1 aggregator-reachable | Open Banking Tracker 2026, Thailand page | VF |
| 3 | Thailand open banking: feasibility studies ongoing, API standards not finalised | Chambers FinTech 2026 — Thailand, practiceguides.chambers.com | CE (Consulting/expert source) |
| 4 | TrueLayer: 21 EU/UK countries only, Thailand not listed | TrueLayer support article, docs.truelayer.com | VF |
| 5 | Bud Financial: UK/EU coverage, 60+ UK banks | Bud Financial docs, docs.thisisbud.com | VF |
| 6 | Akoya: US-only, FDX standards | Akoya home, akoya.com | VF |
| 7 | Nordigen: 900+ European banks, PSD2-based | Nordigen Medium article, nordigen.medium.com | VF |
| 8 | GoCardless acquired Nordigen 2022, expanding to 2,300 banks in 31 countries | GoCardless press release, govcashless.com | VF |
| 9 | Thailand virtual banks: 3 approved June 2025, launching mid-2026 | Chambers FinTech 2026 — Thailand; Krungsri Research | CE |
| 10 | TransferWise Thailand reachable via Bridge, Fintecture, Nordigen, Salt Edge | Banq.ai Asia Coverage, May 2026 | VF |
| 11 | Mercantile Bank Thailand reachable via Plaid | Banq.ai Asia Coverage, May 2026 | VF |
| 12 | Salt Edge: 1,586 institutions in 73 countries | Open Banking Tracker — Salt Edge | VF |
| 13 | Fintable: aggregates Plaid, Finicity, Tink, Nordigen; custom integration $5,000/bank | Fintable guide, fintable.io/guide | VF |
| 14 | PDPA Thailand: active enforcement, THB 21.5M fines Aug 2025, mandatory DPO Oct 2025 | CookieInformation blog | CE |
| 15 | Thailand Open Banking Market: USD 5.6B (2025) → USD 19.2B (2031), CAGR 23.1% | Mobility Foresights | INF (Industry forecast) |
| 16 | BOT "3 Opens" strategy, PromptPay foundation, open banking in progress | Fiskil Open Finance Tracker; Open Banking Tracker Thailand | CE |
| 17 | LINE Pay: payment API (accept/cancel/refund) — no account aggregation | LINE Pay API documentation | VF |
| 18 | Bangkok Bank API portal: product/service info only, not AISP | Bangkok Bank Developer Portal, developer.bangkokbank.com | VF |

---

## 9. Appendix: Multi-Tenant Design Rules for Future Bank Integration

If PicksWise pursues bank API integration in the future, the following architecture rules must be followed (per multi-tenant iron rule):

### 9.1 Token Storage

```
financial_connections (table)
├── id (UUID, PK)
├── company_id (UUID, FK, NOT NULL)  -- multi-tenant isolation
├── user_id (UUID, FK)
├── aggregator_provider (TEXT)      -- 'salt_edge', 'nordigen', etc.
├── encrypted_access_token (TEXT)   -- AES-256 encrypted, server-side only
├── encrypted_refresh_token (TEXT) -- AES-256 encrypted
├── institution_id (TEXT)           -- bank's ID in aggregator's system
├── account_ids (JSONB)             -- array of linked account IDs
├── consent_granted_at (TIMESTAMPTZ)
├── consent_expires_at (TIMESTAMPTZ)
├── last_synced_at (TIMESTAMPTZ)
├── sync_status (TEXT)              -- 'active', 'error', 'revoked'
├── error_message (TEXT)
├── created_at, updated_at
```

**RULE: NEVER store access tokens in `users` table.**

### 9.2 Consent Records

```
financial_connection_consents (table)
├── id
├── connection_id (FK)
├── scopes (TEXT[])                -- e.g., ['transactions', 'balances']
├── granted_at (TIMESTAMPTZ)
├── expires_at (TIMESTAMPTZ)
├── revoked_at (TIMESTAMPTZ, nullable)
```

### 9.3 Sync Audit Log

```
financial_connection_sync_logs (table)
├── id
├── connection_id (FK)
├── company_id (UUID, NOT NULL)
├── event_type (TEXT)              -- 'sync_started', 'sync_completed', 'sync_failed'
├── transactions_fetched (INT)
├── error_code (TEXT)
├── error_detail (TEXT)
├── created_at
```

### 9.4 RLS Policies

All three tables must have RLS enabled:
- `company_id = current_setting('app.current_company_id')::UUID`

### 9.5 Aggregator Config from DB

All aggregator credentials must come from `company_settings` or a dedicated `financial_aggregator_configs` table — never hardcoded.

---

*Document generated by Mavis — Thailand Feasibility Research*
*Research date: 2026-07-14*
*Confidence level: HIGH on factual claims (VF sources), MEDIUM on aggregator Thailand status (requires direct verification with aggregators)*
