# PicksWise — Home Dashboard Wireframe (Screen 2)

Mobile-first (iOS) low/mid-fidelity wireframe and detailed UX spec for the Home Dashboard.

Deliverables in this file:
- Purpose & goals
- Information Architecture
- Layout structure (mobile)
- Component hierarchy
- Detailed user flow
- Empty / error / success states
- Accessibility & performance notes
- Hand-off notes for design/dev

---

1. Purpose of the screen
- Provide a concise Financial Snapshot, quick access to common actions, and immediate behavioral insights.

2. User goals
- Quickly understand balance and budget state, view recent activity, and perform quick actions (add tx, view report).

3. Information Architecture
- Header (profile + settings) → Balance Card (primary) → Budget Overview (carousel of budgets) → Insights Strip (AI-driven) → Recent Activity (list) → Quick Actions (FAB + bottom bar)

4. Layout Structure (Mobile-first)
- Viewport baseline 375×812.
- Header 56px (sticky) with avatar and notifications.
- Balance card prominent at top (full-width card, 32–40% screen height).
- Budget Overview horizontal carousel beneath (cards with progress bars).
- Insights strip (single-line, scrollable) with AI micro insights.
- Recent Activity list (grouped by day) scrollable.
- Floating primary FAB bottom-right for Quick Add; bottom navigation included (5 items).

5. Component Hierarchy
- App Shell: Status bar / Sticky header / Bottom nav
- Balance Card: total balance, breakdown (income/expenses/savings), quick toggle for accounts
- Budget Card: category, progress bar, remaining amount, small CTA to adjust
- Insights Chip: short sentence + confidence tag + quick action
- Activity Item: merchant/icon, title, category tag, amount, chevron to expand
- Quick Actions: FAB (add expense), persistent quick bar for Add Income / Reports

6. User Flow
- Cold open: Load dashboard with cached data → show skeleton while fetching → render balance and budgets → user taps an insight → opens Financial Story or recommended action → user taps FAB to add tx → modal opens

7. Empty State
- No accounts or transactions: show action panel to import accounts or add first transaction; offer demo data toggle to preview features.

8. Error State
- Data sync fail: inline banner under header with Retry CTA; activity list fallbacks to cached items; offline indicator in header.

9. Success State
- After adding transaction: animate amount change in balance card, insert item at top of Recent Activity, show small toast "Saved" and update budget progress.

10. Mobile-First Wireframe Description
- Header (56px) → Balance Card (card height ~220px) → Budget Carousel (card height ~110px) → Insights strip (height 72px) → Recent Activity list fills remaining viewport → FAB bottom-right, Bottom Nav fixed.

UX Notes
- Visual emphasis on balance card with subtle motion when numbers change.
- Use color-coded budget chips and consistent tokens from design system.
- Ensure touch targets >=44px and accessible contrast.
- For long lists, implement incremental loading and skeleton rows.

Acceptance Criteria
- Balance numbers update responsively when a transaction is added.
- Insights should be tappable and open contextual drilldowns.
- All interactive elements reachable within one-thumb reach.
