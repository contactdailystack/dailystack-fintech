# PicksWise — Transactions List Wireframe (Screen 4)

Mobile-first (iOS) UX spec and wireframes for the Transactions List screen. Focus on fast search, filtering, and one-thumb interactions.

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
- Allow users to search, filter, inspect, edit, and batch-manage transactions efficiently.

2. User goals
- Find specific transactions quickly, filter by category/date, correct or tag transactions, and perform bulk actions.

3. Information Architecture
- Header with back/search → Filter row (category/date/preset ranges) → List grouped by day (sticky group header) → Each item expandable with details and quick actions (edit, tag, split) → Bottom sheet for bulk actions

4. Layout Structure (Mobile-first)
- Top search bar (sticky under header) with clear button and voice input optional.
- Filter chips directly below search (horizontal scroll) — Category / Date Range / Tags / Amount.
- List: grouped by day, each group has a header (date + subtotal) and list items with merchant, category, amount, and small tag icons.
- Swipe gestures on items: swipe left to Delete, swipe right to Edit/Tag/Report.

5. Component Hierarchy
- Search Input: autocomplete suggestions, merchant recognition
- Filter Chips: toggles with count badges
- Group Header: date label + subtotal + expand/collapse
- Transaction Item: icon, title, category pill, note preview, amount (right aligned), chevron
- Item Actions: Edit modal, Tag dropdown, Split transaction flow
- Bulk Action Sheet: export, delete selected, tag selected

6. User Flow
- Open Transactions → Results load with skeletons → Type in search → realtime filtered results → tap filter chip to refine → long-press for multi-select → perform bulk action → confirm modal for destructive actions

7. Empty State
- No transactions in range: show helpful CTA to add transaction or import data; show sample transactions preview to illustrate features.

8. Error State
- Search backend fail: show inline error under search with retry and fallback to cached local data. For delete failures, show undo snackbar and retry option.

9. Success State
- After edit/save: optimistic update of item with subtle highlight; show toast "Saved". After delete: show undo option in snackbar.

10. Mobile-First Wireframe Notes
- Keep group headers sticky to help orientation. Prioritize vertical rhythm and small density to avoid cramped lists. Provide haptic feedback on swipe actions.

Accessibility & Performance
- Ensure search suggestions are announced by screen readers; swipe actions accessible via context menu for assistive tech; lazy-load images/icons for performance.

Handoff Notes
- Provide API contract for search (q, category, date_from, date_to, page) and for batch endpoints. Provide transaction item component props and event hooks for edit/delete/split.
