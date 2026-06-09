# PicksWise — Add Transaction Wireframe (Screen 3)

Mobile-first (iOS) UX spec and wireframes for the Quick Add Transaction flow. Focus on one-handed use and sub-3s capture.

Deliverables in this file:
- Purpose & goals
- Information Architecture
- Layout structure (mobile)
- Component hierarchy
- Detailed user flow
- Empty / error / success states
- Accessibility & performance notes
- Handoff notes for dev

---

1. Purpose of the screen
- Enable users to record a transaction (expense or income) quickly and accurately with minimal friction.

2. User goals
- Capture amount, category, date, and optional note within 3 seconds using one thumb.

3. Information Architecture
- Entry point: FAB or Quick Add keyboard shortcut → Bottom sheet modal (draggable) → Numeric keypad + category row → Note (optional) → Date selector → Save

4. Layout Structure (Mobile-first)
- Use a bottom sheet that covers ~72% height when open and is draggable to full-screen for advanced options.
- Top: compact header with drag handle and title "Add Transaction".
- Main: Large amount display + numeric keypad occupying lower half of the sheet.
- Above keypad: horizontal category selector (scrollable) with icons and last-used suggestions.
- Bottom: Row with small controls (date toggle, repeat, mood tag) and full-width Save CTA above system nav.

5. Component Hierarchy
- Bottom Sheet Shell: drag handle, close X.
- Amount Display: large typography, currency symbol, quick +/- toggle for expense/income.
- Numeric Keypad: large buttons (44–64px), backspace, decimal, and quick presets (฿50, ฿100, ฿500) optional.
- Category Selector: icon + label chips, last-used pinned to left.
- Inline Note Input: single-line, optional; microcopy placeholder "Tap to add note or merchant".
- Controls Row: Date (Today / Yesterday / Custom), Mood (emoji chips), Repeat toggle.
- Save CTA: Primary full-width (label: "Save Expense" / "Save Income")

6. User Flow
- Open sheet (FAB) → amount entered via keypad → select category (auto-suggest from merchant if available) → optional note → confirm Save → optimistic UX: update local state and animate into Recent Activity.

7. Empty State
- If no categories are available: show "Create category" quick inline modal and smart suggestions.

8. Error State
- Invalid amount: highlight amount field with red border and small helper text.
- Offline/save fail: queue locally and show toast "Saved locally; will sync when online" and retry button in activity feed.

9. Success State
- Close sheet with smooth animation, show toast "Transaction saved" and briefly animate the balance card in the Dashboard.

10. Mobile-First Wireframe Notes
- Ensure keypad and primary CTA are within thumb zone; avoid small inline CTAs.
- Support haptic tap feedback on save (iOS) and subtle micro-animation for confirmation.

Accessibility & Performance
- All inputs labelled, ensure high-contrast text; numeric keypad must support screen readers; respect `prefers-reduced-motion`.

Handoff Notes
- Provide component props for category chip (id, icon, color, label), transaction payload (amount, type, categoryId, note, date, mood), and optimistic UI response schema.
