# PicksWise vs Rocket Money: UX/UI Redesign Research Report

**Date:** 2025-01-XX
**Researcher:** Mavis (AI)
**Project:** PicksWise (formerly DailyStack FinTech) — Thai subscription tracker app

---

## Executive Summary

Rocket Money (formerly Truebill) is a US-based fintech app trusted by 3.4M+ users, featured in Forbes as "This App Will Save You Hundreds." It evolved from a subscription-cancellation tool into a comprehensive financial command center. This report analyzes Rocket Money's patterns and maps them to PicksWise's current codebase to produce actionable redesign recommendations.

**Key Insight:** Rocket Money's magic isn't any single feature — it's the *end-to-end financial command center* experience: link accounts → auto-discover subscriptions → budget → cancel/negotiate → save. PicksWise already has most of these features, but they're scattered across different mental models. The redesign should unify them under one coherent flow.

---

## Part 1: Rocket Money Feature Analysis

### Core Feature Stack (2026)

| Feature | Description | Monetization |
|---|---|---|
| **Subscription Detection** | Auto-scans linked bank/credit accounts via Plaid for recurring charges | Free (basic) |
| **Subscription Cancellation** | Agents cancel subscriptions on user's behalf | Premium only (core revenue driver) |
| **Bill Negotiation** | AI + human concierge negotiates lower rates on cable, internet, phone, insurance | Takes 35-60% of savings as fee |
| **Budget Management** | Set monthly category limits, auto-categorize transactions | Free (2 categories) / Premium (unlimited) |
| **Net Worth Tracking** | Pulls balances from all linked accounts | Free (basic) / Premium (trend over time) |
| **Credit Score Monitoring** | Tracks VantageScore monthly | Free (basic) / Premium (detailed) |
| **Smart Savings** | FDIC-insured auto-savings based on AI spending analysis | Free |
| **Balance Alerts** | Notifications when checking balance drops or credit spend is high | Free |
| **Spending Insights** | Weekly summaries, category breakdowns, duplicate charge detection | Free |
| **Financial Goals** | Emergency fund, retirement, vacation savings tracking | Premium |
| **Shared Accounts** | Family/partner account access | Premium |

### Pricing Model

- **Free:** Basic subscription tracking, 2 budget categories, balance alerts, spending insights, credit monitoring
- **Premium:** $7-$14/month (choose-your-price model) — unlimited budgets, cancellation service, bill negotiation, advanced analytics, financial goals, shared accounts, iOS widgets, web access

### UI/UX Patterns Observed

1. **Dashboard-first architecture:** All accounts visible on one screen with net worth prominently displayed
2. **Subscription timeline view:** Upcoming bills shown chronologically with account/amount info
3. **Category spending rings:** Visual progress bars showing budget consumption per category
4. **Alert-first interaction:** Proactive notifications for price increases, free trial conversions, low balance
5. **"Cancel for me" CTA:** One-tap cancellation removes friction entirely
6. **Payday view:** Calendar overlay showing income vs. recurring expenses
7. **Smart suggestions:** AI recommends realistic budgets based on spending history

---

## Part 2: PicksWise Current Architecture

### Existing Pages (from App.tsx)

| Route | Component | Tesla Name | Status |
|---|---|---|---|
| `/dashboard` | DashboardPage | Money Pulse | ✅ Active |
| `/subscriptions` | SubscriptionTrackerPage | Subscription Shadow | ✅ Active |
| `/networth` | NetWorthPage | — | ✅ Active |
| `/activity` | ActivityPage | — | ✅ Active |
| `/settings` | ProfileSettingsPage | Control Center | ✅ Active |
| `/coach` | AICoachPage | — | ✅ Active |
| `/insights` | InsightsPage | — | ✅ Active |
| `/database` | DatabasePage | — | ✅ Active |
| `/stories` | WeeklyStoryPage | Money Story | ✅ Active |
| `/evolution` | FinancialEvolutionPage | — | ✅ Active |
| `/alternative` | AlternativeAssetsPage | — | ✅ Active |
| `/moneyTwin` | MoneyTwinPage | Money Twin | ✅ Active |
| `/simulation` | GoalSimulationPage | Goal Launcher | ✅ Active |
| `/budget` | BudgetManagementPage | Spending Guardian | ✅ Active |
| `/coachHistory` | AICoachHistoryPage | — | ✅ Active |
| `/more` | MorePage | — | ✅ Active |
| `/paywall` | PaywallPage | — | ✅ Active |

### Current Bottom Navigation (v24.0)

- Dashboard | Subscriptions | Budget | More
- Uses PicksWise Design Law v1.0 colors (White bg, CI Green active, Gray inactive)

---

## Part 3: Comparison — What's Missing vs. Rocket Money

### Features Rocket Money Has That PicksWise Doesn't

| Feature | Rocket Money | PicksWise | Gap |
|---|---|---|---|
| Bank account linking (Plaid) | ✅ Full | ❌ No | P0 — without this, subscription auto-detection is manual |
| Subscription auto-detection | ✅ AI scans transactions | ⚠️ Manual entry only | P0 — core value prop |
| Cancel-for-me service | ✅ Agent-based | ❌ No | P1 — monetization opportunity |
| Bill negotiation | ✅ Human + AI concierge | ❌ No | P1 — revenue model |
| Credit score monitoring | ✅ VantageScore | ❌ No | P2 — but depends on bank linking |
| Smart savings (auto-transfer) | ✅ FDIC-insured | ❌ No | P2 |
| Shared/family accounts | ✅ | ❌ No | P2 |
| iOS widgets | ✅ | ❌ No | P2 |
| Payday calendar view | ✅ | ❌ No | P1 |
| Price increase alerts | ✅ | ❌ No | P1 |
| Free trial tracking | ✅ | ⚠️ Basic only | P1 |

### Features PicksWise Has That Rocket Money Doesn't

| Feature | PicksWise | Rocket Money | Advantage |
|---|---|---|---|
| AI Coach / Money Twin | ✅ | ❌ No | **Key differentiator** |
| Weekly Money Story | ✅ | ❌ No | **Key differentiator** |
| Thai localization | ✅ | ❌ No | **Core market focus** |
| Goal Launcher simulation | ✅ | ⚠️ Basic goals only | **Better UX** |
| Financial Evolution tracking | ✅ | ❌ No | **Unique analytics** |
| Tesla-style UI design | ✅ | ⚠️ Standard fintech | **More memorable brand** |

---

## Part 4: UX/UI Redesign Recommendations

### 4.1 Information Architecture Redesign

**Current Problem:** 17 routes with inconsistent naming and no clear hierarchy.

**Proposed IA (3-tab model):**

```
┌─────────────────────────────────────────────────────┐
│  NAVIGATION TABS                                    │
├─────────────────────────────────────────────────────┤
│  💰 MONEY PULSE   │  👻 SHADOWS   │  🛡️ GUARDIAN   │
│  (Dashboard)      │(Subscriptions)│   (Budget)     │
├─────────────────────────────────────────────────────┤
│  Sub-pages (drawer or secondary nav within tab)     │
│  - Money Twin (AI Insights)                        │
│  - Weekly Story                                    │
│  - Net Worth                                       │
│  - Goal Launcher                                   │
│  - Financial Evolution                             │
│  - Alternative Assets                              │
│  - Settings / More                                │
└─────────────────────────────────────────────────────┘
```

**Rationale:** Matches Rocket Money's 3-core-tab structure while preserving PicksWise's unique features as sub-pages.

### 4.2 Dashboard Redesign (Money Pulse)

**Rocket Money Pattern:**
- Net worth prominently at top
- Upcoming bills list (next 7 days)
- Budget rings showing category spend
- Quick actions: Cancel subscription, Add budget, View insights

**PicksWise Adoption:**

```tsx
// Proposed Dashboard Layout

// Top: Net Worth Hero
<NetWorthHero balance={profile.balance} change={+2.4} />

// Section 1: Upcoming Bills (Rocket Money style)
<UpcomingBillsSection subscriptions={subscriptions} days={7} />

// Section 2: Budget Progress Rings
<BudgetRingsSection budgets={budgets} spent={spent} />

// Section 3: Quick Actions
<QuickActionsGrid>
  <ActionCard icon="cancel" label="Cancel Sub" />
  <ActionCard icon="negotiate" label="Lower Bill" />
  <ActionCard icon="budget" label="Add Budget" />
  <ActionCard icon="insights" label="Money Twin" />
</QuickActionsGrid>

// Section 4: Recent Activity (compact)
<RecentTransactions count={5} />
```

### 4.3 Subscription Tracker Redesign (Subscription Shadow)

**Rocket Money Pattern:**
- All subscriptions in one chronological list
- Grouped by: Active, Trial Ending Soon, Price Increased, Cancelled
- Each item shows: Logo, Name, Price, Next billing date, Account source
- Swipe-to-cancel with "Cancel for me" option

**PicksWise Improvements:**

```tsx
<SuspensionTrackerPage>
  <SubscriptionSummary total={totalMonthly} savings={savedThisMonth} />

  <SubscriptionFilters>
    <FilterChip active={true}>All</FilterChip>
    <FilterChip>Active</FilterChip>
    <FilterChip>Trial Ending</FilterChip>
    <FilterChip>Price Increased</FilterChip>
  </SubscriptionFilters>

  <SubscriptionList>
    <SubscriptionCard
      name="Netflix"
      price={399}
      billingDate="15 ม.ค."
      category="Entertainment"
      logo={netflixLogo}
      status="active"
      onCancel={() => showCancelModal()}
    />
  </SubscriptionList>

  <AddSubscriptionFAB />
</SuspensionTrackerPage>
```

### 4.4 Budget Management Redesign (Spending Guardian)

**Rocket Money Pattern:**
- Category budget rings with progress bars
- Over-budget warnings with red highlight
- Suggested budgets based on spending history
- Alert when approaching limit (80%, 100%)

**PicksWise Adoption:**

```tsx
<BudgetManagementPage>
  <BudgetOverview
    totalBudget={50000}
    totalSpent={32000}
    remaining={18000}
  />

  <BudgetRings>
    {categories.map(cat => (
      <BudgetRing
        key={cat.id}
        category={cat.name}
        limit={cat.limit}
        spent={cat.spent}
        icon={cat.icon}
      />
    ))}
  </BudgetRings>

  <BudgetSuggestions
    suggestions={aiSuggestedBudgets}
    onAccept={(budget) => applyBudget(budget)}
  />

  <AlertBanner type="warning" message="Food budget 85% used" />
</BudgetManagementPage>
```

### 4.5 Key UI Patterns to Adopt from Rocket Money

| Pattern | Rocket Money | Implementation |
|---|---|---|
| **Subscription cards with logos** | Auto-fetch merchant logos via Plaid | Use first-letter avatar or brand API |
| **Bill timeline** | Chronological list with due dates | Add to Dashboard and Subscriptions page |
| **Budget progress rings** | Animated circular progress | Enhance current BudgetManagementPage |
| **Payday overlay** | Calendar showing income vs. expenses | Add Calendar view option to Activity page |
| **Smart suggestions** | AI-suggested budgets based on history | Add to BudgetManagementPage |
| **Price increase alerts** | Push notification + in-app badge | Add notification template in alertNotifications.ts |
| **Cancel-for-me flow** | Modal → Agent takes over | Add Premium gate + cancellation request flow |

---

## Part 5: Priority Development Roadmap

### P0 — Must-Have (MVP Parity with Rocket Money Free Tier)

| # | Task | Impact | Effort |
|---|---|---|---|
| P0-1 | **Bank Account Linking (Plaid/Line Pay)** | Enables auto-subscription detection | High |
| P0-2 | **Subscription Auto-Detection** | Core value prop — find hidden subscriptions | High |
| P0-3 | **Dashboard Redesign** | First impression — must match Rocket Money quality | Medium |
| P0-4 | **Price Increase Alerts** | Notification template + trigger logic | Low |
| P0-5 | **Free Trial Tracking** | Reminder before trial ends | Low |

### P1 — Should-Have (Competitive Differentiation)

| # | Task | Impact | Effort |
|---|---|---|---|
| P1-1 | **Cancel-for-Me Service Flow** | Premium monetization — Rocket Money's core revenue | High |
| P1-2 | **Bill Negotiation Service** | Premium monetization — unique for Thai market | High |
| P1-3 | **Smart Budget Suggestions** | AI-driven personalized budgets | Medium |
| P1-4 | **Payday Calendar View** | Cash flow visibility | Medium |
| P1-5 | **Budget Progress Notifications** | 80%/100% limit alerts | Low |

### P2 — Nice-to-Have (Premium Features)

| # | Task | Impact | Effort |
|---|---|---|---|
| P2-1 | **Credit Score Monitoring** | Engagement + upsell | Medium |
| P2-2 | **Smart Savings Auto-Transfer** | Engagement + retention | High |
| P2-3 | **Shared/Family Accounts** | Multi-user support | High |
| P2-4 | **iOS/Android Widgets** | Re-engagement | Medium |
| P2-5 | **Web App Access** | Desktop parity | High |

---

## Part 6: Screen-by-Screen Redesign Plan

### Screen 1: Dashboard (Money Pulse)
**Current State:** Stock overview + recent transactions
**Redesign Goal:** Financial command center

| Element | Action |
|---|---|
| Net Worth Hero | Move from `/networth` — show prominently |
| Upcoming Bills (7 days) | Add from Rocket Money pattern |
| Budget Progress Rings | Enhance existing |
| Quick Actions Grid | Add Cancel Sub, Lower Bill CTAs |
| Recent Transactions | Keep (already good) |
| AI Insight Card | Keep Money Twin teaser |

### Screen 2: Subscription Tracker (Subscription Shadow)
**Current State:** List of manual subscriptions
**Redesign Goal:** Auto-detected subscriptions + cancellation flow

| Element | Action |
|---|---|
| Monthly Total Hero | Keep — add savings comparison |
| Filter Tabs | Add Active / Trial / Price Increased / Cancelled |
| Subscription List | Add logos, billing dates, account source |
| Swipe Actions | Add cancel/edit swipe gestures |
| Add FAB | Keep |
| Cancel-for-Me | Add Premium gate modal |

### Screen 3: Budget (Spending Guardian)
**Current State:** Category budget list
**Redesign Goal:** Visual budget rings + smart suggestions

| Element | Action |
|---|---|
| Total Budget Overview | Keep + add trend indicator |
| Budget Rings | Replace list with animated rings |
| Category Cards | Keep for detail view |
| AI Suggestions | Add smart budget recommendations |
| Alerts | Add over-budget warnings |
| Add Budget FAB | Keep |

### Screen 4: Money Twin (AI Insights)
**Current State:** Basic AI interpretation
**Redesign Goal:** Expand with Rocket Money-style insights

| Element | Action |
|---|---|
| Weekly Summary | Keep + enhance |
| Spending Insights | Add category breakdown charts |
| Duplicate Detection | Add Rocket Money pattern |
| Smart Alerts | Add proactive warnings |
| Goal Progress | Integrate Goal Launcher |

---

## Part 7: Technical Impact Assessment

### Frontend Changes

| Area | Impact | Files to Modify |
|---|---|---|
| Dashboard layout | Medium | DashboardPage.tsx |
| Navigation structure | Medium | FloatingBottomNav.tsx, App.tsx |
| Subscription cards | High | SubscriptionTrackerPage.tsx, TransactionItem.tsx |
| Budget rings | Medium | BudgetManagementPage.tsx, StatCard.tsx |
| Notifications | Low | alertNotifications.ts |

### Backend Changes

| Area | Impact | Notes |
|---|---|---|
| Bank linking API | High | Need Plaid or Line Pay integration |
| Auto-detection logic | High | Pattern matching on transaction data |
| Cancellation service | Medium | Agent workflow + status tracking |
| Budget suggestions | Medium | AI analysis pipeline |

### Database Changes

| Table | Changes Needed |
|---|---|
| subscriptions | Add: `detected_at`, `source_account`, `status`, `price_history` |
| transactions | Add: `subscription_id`, `category_override` |
| budgets | Add: `ai_suggested_limit`, `alert_threshold` |
| notifications | Add: `type`, `trigger_conditions` |
| users | Add: `plaid_access_token`, `linked_accounts` |

### API Changes

| Endpoint | New/Modified |
|---|---|
| `POST /subscriptions/detect` | New — trigger auto-detection |
| `POST /subscriptions/cancel` | New — cancellation request |
| `POST /bills/negotiate` | New — negotiation request |
| `GET /budgets/suggestions` | New — AI budget recommendations |
| `POST /accounts/link` | New — bank account linking |

---

## Part 8: What PicksWise Does Better (Competitive Moat)

Rocket Money has a weak monetization model (35-60% cut on savings) and limited AI features. PicksWise's strengths:

1. **Money Twin AI** — Rocket Money has nothing like this. Expand and promote heavily.
2. **Thai Market Focus** — Thai localization + Line Pay integration = native feel Rocket Money can't match.
3. **Weekly Money Story** — Unique engagement feature that drives retention.
4. **Tesla-style UI** — Memorable, premium feel. Rocket Money looks like every other fintech app.
5. **Goal Launcher** — Better goal visualization than Rocket Money's basic goals.

**Recommendation:** Lead with Money Twin in marketing. It's PicksWise's unfair advantage.

---

## Sources

1. Rocket Money Official Website — https://www.rocketmoney.com/
2. Rocket Money on Google Play — https://play.google.com/store/apps/details?id=com.truebill
3. Rocket Money on App Store — https://apps.apple.com/us/app/rocket-money-bills-budgets
4. Rocket Money Pricing — https://www.rocketmoney.com/learn/personal-finance/how-much-does-rocket-money-cost
5. Rocket Money Best Budgeting Apps — https://www.rocketmoney.com/learn/personal-finance/best-budgeting-apps
6. Plan and Multiply Review — https://www.planandmultiply.com/en/blog/rocket-money-budget-app-review-alternatives-2026
7. CNET Rocket Money Review — https://www.cnet.com/personal-finance/banking/reviews/rocket-money-review/
8. Wall Street Survivor Review — https://www.wallstreetsurvivor.com/rocket-money-review/
9. Forbes Best Budgeting Apps — https://www.forbes.com/financial-services/best-budgeting-apps-2/
10. Apple Search Ads Success Story — https://ads.apple.com/app-store/success-stories/rocket-money
11. NerdWallet Best Budget Apps — https://www.nerdwallet.com/finance/learn/best-budget-apps
