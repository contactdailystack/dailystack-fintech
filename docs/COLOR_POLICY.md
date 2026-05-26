Color System — Accent-Only Policy
================================

Goal
----
Prevent highly saturated `primary` tokens from being used as large-area surfaces. Primaries remain valid as accents (icons, borders, small buttons, highlights). For large surfaces (cards, large buttons, panels, progress bars) use muted or soft-bg tokens.

Policy
------
- Do not use `--brand-primary`, `--feature-*-primary`, or `--theme-primary` as background for large surfaces (card bg, full-width banners, large buttons, progress fills).
- Use `--feature-<name>-muted` or `--feature-<name>-soft-bg` for feature-scoped surfaces.
- Use `--semantic-surface-1`, `--semantic-surface-2`, or `--semantic-bg` for global surfaces.
- Reserve `--brand-primary` and `--feature-*-primary` for small accents, icons, strokes, and interactive focus states.

Examples
--------
- Bad (primary used as surface):

  className="bg-[var(--brand-primary)]"

- Good (feature surface):

  className="bg-[var(--feature-dating-muted)]"

- Good (semantic surface):

  className="bg-[var(--semantic-surface-1)]"

Enforcement
-----------
A CI guard (`scripts/check-primary-surface-usage.mjs`) now fails when primary tokens are used in background/bg declarations. The generated report is at `report/primary-surface-report.md` and lists matches to review.

Migration guidance
------------------
- For pages/components under a feature folder (e.g., `src/app/pages/dating`), prefer `--feature-dating-muted`.
- For cross-feature shared components, prefer semantic surfaces and use primaries only sparingly.
- If you want, I can run an automated migration that heuristically replaces `bg-[var(--brand-primary)]` with `bg-[var(--feature-<detected>-muted)]` when the file path includes a feature name. Request which features to auto-migrate.

Questions / Next steps
---------------------
- I can auto-fix all matches for `dating`, `events`, `community` files now (heuristic). Proceed? Or would you prefer manual review per file?
