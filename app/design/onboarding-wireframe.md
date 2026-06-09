# PicksWise — Onboarding Wireframe (Screen 1)

Mobile-first (iOS) low/mid-fidelity wireframe and detailed UX spec for the Onboarding funnel.

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
- Welcome, communicate value proposition, and collect essential profile data (goal, income, categories).

2. User goals
- Get started quickly (< 90s).  Set up minimal profile so the app can show meaningful insights.

3. Information Architecture
- Stepper (progress) — 4 primary steps: Welcome → Goal → Income → Categories → Summary
- Each step is a focused card with one primary action and optional “Skip/Import later”.

4. Layout Structure (Mobile-first)
- Viewport: 375×812 (iPhone 12-size baseline).
- Top: compact stepper (30px high) with step label and progress fraction.
- Center: primary card (rounded 16px) with question + input controls.
- Middle: contextual helper microcopy beneath inputs.
- Bottom: sticky primary CTA (full-width) and secondary link (Skip / Import).

5. Component Hierarchy
- App Shell: status bar + (optional) header with small skip link.
- Stepper component: step index + progress bar.
- Card: Title, subtitle, input area, contextual examples.
- Input types: numeric input (income), single-choice goal chips, category grid (multi-select chips with icons), provider import button.
- Footer: Primary CTA (Next/Confirm) + secondary control (Skip / Connect bank later).

6. User Flow
- Entry: Launch → Welcome Screen (value prop + CTA “Get started”) → Goal selection (multi-select chips) → Income input (numeric, currency auto-detect) → Category setup (suggested categories with quick toggles) → Summary screen (compact) → Complete (take to Dashboard + short tour overlay).

7. Empty State
- If user skips steps or leaves inputs blank, show gentle microcopy and examples. For categories: show suggested starter set with single-tap add.

8. Error State
- Invalid income: inline validation under input with correction suggestion: “Please enter a number without symbols.”
- Import failure: show retry CTA + reason (e.g., provider timeout). Allow manual fallback.

9. Success State
- On confirm: show micro-summary card with a green check and two CTAs: “Go to Dashboard” and “Take product tour”. Persist profile to local storage and attempt background sync.

10. Mobile-First Wireframe Description (pixel structure)
- Top 8%: Stepper (Step 1 of 4)
- Next 30%: Hero title & value prop short line
- Center 45%: Card with form input(s) and illustrative icon
- Bottom sticky: Primary CTA full-width (48–56px high), safe zone for reachability

UX Notes
- Reduce friction: default values, smart suggestions (category inferred from salary or merchant), one-tap category add.
- Privacy: explain where data is stored; optional bank import is clearly labeled and skippable.
- Accessibility: labels for all inputs, Large Tap targets, contrast >= 4.5:1 for text and primary CTAs, prefers-reduced-motion respected.

Hand-off / Acceptance Criteria
- Developer can implement the onboarding funnel with the stepper and bottom-sheet forms. Each step must persist to local state and allow navigation back. Numeric fields validate live. Primary CTA must be keyboard-accessible.

---

Appendix: Quick copy snippets
- Welcome headline: "Welcome to PicksWise — Your Financial Operating System"
- Hero subhead: "Understand where money goes and start small habits that compound."
- Goal chip examples: "Build Emergency Fund", "Reduce Impulse Spend", "Save for Travel", "Pay Down Debt"
- Onboarding CTA: "Get started" → subsequent steps use "Continue" / "Confirm"
