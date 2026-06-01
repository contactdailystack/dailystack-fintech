# DailyStack — Premium Visual Overhaul Plan v2

## Confirmed Direction

**Dark-first, Arc Browser / Linear aesthetic**
- Background: `#1C232A` base
- Cards: Soft floating dark layers
- Accent: Mint `#56be89` (strategic), Lime `#D9FD82` (secondary highlights)
- Mood: Soft, calm, cinematic — not gamer/cyberpunk
- Motion: Smooth, intentional, physics-based

---

## Design Language

### Color Palette
| Token | Value | Usage |
|-------|-------|-------|
| `--bg-base` | `#1C232A` | Page background |
| `--bg-elevated` | `#1E2830` | Elevated surfaces |
| `--bg-card` | `#232D38` | Floating cards |
| `--bg-card-hover` | `#283242` | Card hover state |
| `--border` | `rgba(255,255,255,0.06)` | Subtle borders |
| `--border-hover` | `rgba(255,255,255,0.12)` | Border hover |
| `--mint` | `#56be89` | Primary accent |
| `--mint-soft` | `rgba(86,190,137,0.12)` | Mint tint bg |
| `--lime` | `#D9FD82` | Secondary accent |
| `--text-primary` | `#F5F5F7` | Primary text |
| `--text-secondary` | `#9CA3AF` | Secondary text |
| `--text-muted` | `#6B7280` | Muted/placeholder |
| `--surface-glass` | `rgba(255,255,255,0.04)` | Glass overlays |

### Typography
| Role | Font | Weight |
|------|------|--------|
| Display | Space Grotesk | 700-800 |
| Body | Space Grotesk | 400-500 |
| Thai | Prompt | 400-600 |
| Code | JetBrains Mono | 400 |

### Motion Easing
- Default: `cubic-bezier(0.22, 1, 0.36, 1)` — spring-out
- Smooth: `cubic-bezier(0.4, 0, 0.2, 1)` — ease-in-out
- Duration: 200ms (micro), 400ms (standard), 600ms (page)

### Radius Strategy
- Cards: 24px
- Buttons (pill): 9999px
- Inputs: 16px
- Badges: 9999px
- Avatars: 9999px (circle)

---

## Implementation Phases

### Phase 1 — Foundation (Sequential, critical path)
1. `src/styles/dailystack.css` — Single source of truth: dark tokens, reset, base classes
2. `src/styles/animations.css` — Motion library: keyframes, transitions, scroll reveals
3. `src/components/ui/premium-components.tsx` — Complete DS* component library

### Phase 2 — Core Pages (Parallel)
- `AuthPage.tsx`, `Dashboard.tsx`, `Settings.tsx`

### Phase 3 — Feature Pages (Parallel)
- `Dating.tsx`, `Onboarding.tsx`, `Memberships.tsx`

### Phase 4 — Landing Page (Parallel)
- Full landing redesign

### Phase 5 — Screens (Parallel)
- Dating screens, Chat components

---

## What Changes vs What's Preserved

**Changes:** JSX visual layer, CSS classes, color values, layout structure, animation styles
**Preserved:** All `.tsx` business logic, handlers, API calls, state management, routing, types, services
