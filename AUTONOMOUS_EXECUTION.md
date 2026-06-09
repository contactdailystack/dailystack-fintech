# DailyStack Autonomous Execution Implementation

This document codifies the Autonomous Development Loop and maps it to repository automation.

Goals
- Enforce SSOT-driven development workflow
- Run automated preflight checks on every change
- Provide local scripts for AI agents or engineers to run preflight
- Provide CI workflow to validate build/typecheck on push/PR

Process mapping

1. Read SSOT: `docs/executive-briefs/DailyStack FinTech Master Constitution (SSOT)_2026-06-06.txt`
2. Development order: Security -> Revenue Impact -> User Value -> Conversion -> Retention -> Performance -> UI
3. Preflight checks (local + CI): TypeScript typecheck, Build, Tests (if present)
4. Self-validation: ensure feature maps to at least one business goal (User Value/Revenue/Conversion/Retention/Trust)
5. If any mandatory check fails, block merge and escalate per Escalation Rules in SSOT

Automation provided
- Local preflight script: `supabase-skeleton/scripts/run_checks.ps1`
- CI workflow: `.github/workflows/ci.yml` runs `npm ci` and `npm run typecheck` in `supabase-skeleton`
- Package scripts: `typecheck`, `check` in `supabase-skeleton/package.json`

Escalation
- Exceptions listed in SSOT (product positioning, pricing, revenue model, security architecture, production data deletion, SSOT changes) require Founder approval.

Verification
- Before marking a feature done, ensure all checks listed in SSOT mandatory checklist are satisfied or have documented mitigation.
