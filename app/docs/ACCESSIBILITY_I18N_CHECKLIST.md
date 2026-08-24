Accessibility & i18n Checklist
=================================

Goal: medium-priority pass to improve keyboard/ screen-reader accessibility and add basic i18n support (Thai + English).

Accessibility quick wins
- Ensure `<html lang="th">` or dynamic `lang` is set in `index.html`.
- Run an automated axe audit (recommend `axe-core` / `axe-devtools`).
- Verify all interactive controls have keyboard focus and visible focus styles.
- Add `aria-label` to icon-only buttons and `role` when using non-semantic elements.
- Ensure images/SVGs have `alt` or `role="img"` + `aria-label`.
- Check color contrast for text and important UI elements (WCAG 4.5:1 for large text, 7:1 for normal where possible).

i18n quick wins
- Add `react-i18next` and `i18next` (dev/README below).  
- Keep all user-facing strings in JSON resource files (see `src/locales/*.json`).
- Replace hard-coded strings in major components (`BottomNav`, `PaywallPage`, `SlideToUpgrade`, `ProfileSettingsPage`) with `useTranslation()`.
- Add translation keys for labels, error messages, and alerts.

How to proceed
1. Install runtime packages:
   - `npm install i18next react-i18next`
2. Run the automated accessibility scanner in CI or locally and capture a report.
3. Incrementally replace strings in a small batch of components (3–7 files) and run `npx tsc --noEmit` after each batch.
4. QA with keyboard-only navigation and a screen reader (NVDA/VoiceOver) focusing on primary flows.

Notes
- I added `src/i18n.ts` and starter locale files. The app now imports `./i18n` in `main.tsx`.
- Next I can either (A) codemod string literals to i18n keys, or (B) manually update high-priority components. Which do you prefer?
