# DailyStack Color System Policy
## "Neo-Brutalist × Japanese Retro Pop × Editorial Ecosystem"

---

## Table of Contents

1. [Vision & Philosophy](#1-vision--philosophy)
2. [Architecture Overview](#2-architecture-overview)
3. [Layer 1: Global Brand Tokens](#3-layer-1-global-brand-tokens)
4. [Layer 2: Shared Semantic Tokens](#4-layer-2-shared-semantic-tokens)
5. [Layer 3: Feature Palettes](#5-layer-3-feature-palettes)
6. [Layer 4: Component Tokens](#6-layer-4-component-tokens)
7. [Layer 5: State Tokens](#7-layer-5-state-tokens)
8. [Dark Mode Architecture](#8-dark-mode-architecture)
9. [Accent-Only Policy](#9-accent-only-policy)
10. [Component Design Rules](#10-component-design-rules)
11. [Motion & Animation](#11-motion--animation)
12. [Accessibility Requirements](#12-accessibility-requirements)
13. [Implementation Guide](#13-implementation-guide)
14. [Migration & Maintenance](#14-migration--maintenance)

---

## 1. Vision & Philosophy

DailyStack's color system embodies **"Neo-Brutalist × Japanese Retro Pop × Editorial Ecosystem"**:

- **Neo-Brutalist**: Thick borders (2-3px), sharp offset shadows, structural ink tones, deliberate exposed grid
- **Japanese Retro Pop**: Warm coral pinks, festival yellows, magazine sticker aesthetics, playful nostalgic energy
- **Editorial Ecosystem**: Large rounded corners, high-contrast typography hierarchy, magazine-quality spacing

The system transforms from a **single brand color** to a **multi-feature color ecosystem** where each feature has its own personality while sharing a common architectural foundation.

---

## 2. Architecture Overview

### Color Hierarchy Layers

```
┌─────────────────────────────────────────────────────────────┐
│  Layer 1: Global Brand    (--brand-*)  — Immutable constants │
│  Layer 2: Semantic       (--semantic-*)- Cross-feature states │
│  Layer 3: Feature        (--feature-*-*) — Per-feature tokens │
│  Layer 4: Component      (--component-*)  — UI-specific maps  │
│  Layer 5: State          (--state-*)      — Interaction states │
└─────────────────────────────────────────────────────────────┘
```

### Token Naming Convention

```
--[layer]-[scope]-[role]-[state?]

Examples:
--brand-primary              → Brand layer, primary role
--feature-dating-primary    → Feature layer, dating scope, primary role
--semantic-surface-1        → Semantic layer, surface role, variant 1
--component-btn-bg          → Component layer, btn element, background role
--state-hover-overlay       → State layer, hover situation, overlay variant
```

### Theme Proxy System

Components consume `--theme-*` tokens which map to the **active feature palette**:

```css
/* Default (brand fallback) */
--theme-primary: var(--brand-primary);
--theme-accent:  var(--brand-primary-dark);

/* Feature-scoped override */
.feature-dating {
  --theme-primary: var(--feature-dating-primary);
  --theme-accent:  var(--feature-dating-accent);
}
```

---

## 3. Layer 1: Global Brand Tokens

Immutable brand constants that remain unchanged across features.

| Token | Value | Usage |
|-------|-------|-------|
| `--brand-500` | `#56BE89` | Primary Mint — Main brand color |
| `--brand-600` | `#3A9E68` | Primary Dark — Brand dark variant |
| `--brand-ink` | `#1A1C1E` | Thick border, Brutalist structure |
| `--brand-ink-light` | `#313B44` | Light ink for subtle borders |

### Surface Spectrum (Light Mode)

Increasing elevation from background to elevated surface: `bg → surface-2 → surface-1 → surface-elevated`

| Token | Value | Elevation Level |
|-------|-------|-----------------|
| `--surface-bg` | `#F9FAFB` | Lowest (app background) |
| `--surface-2` | `#F4F5F7` | Subtle separation |
| `--surface-1` | `#FFFFFF` | Card/Panel |
| `--surface-elevated` | `#FFFFFF` | Floating/Modal |

### Shadow System (Sharp Offset — Brutalist Depth)

Not blurry/soft shadows — hard-edged offset shadows creating depth:

| Token | Offset | Usage |
|-------|--------|-------|
| `--shadow-sm` | 2px 2px | Buttons, inputs |
| `--shadow-md` | 3px 3px | Cards |
| `--shadow-lg` | 4px 4px | Major cards |
| `--shadow-xl` | 6px 6px | Modals, dropdowns |

---

## 4. Layer 2: Shared Semantic Tokens

Cross-feature states and surfaces that maintain consistency.

### Semantic States

| Token | Value | Usage |
|-------|-------|-------|
| `--semantic-bg` | `var(--surface-bg)` | App background |
| `--semantic-surface-1` | `var(--surface-1)` | Primary surface |
| `--semantic-surface-2` | `var(--surface-2)` | Secondary surface |
| `--semantic-text` | `var(--text-primary)` | Primary text |
| `--semantic-muted` | `#9CA3AF` | Secondary/muted text |

### Global State Colors

| Token | Value | Usage |
|-------|-------|-------|
| `--state-success` | `#22C55E` | Success states, confirmations |
| `--state-warning` | `#F59E0B` | Warning states, cautions |
| `--state-error` | `#EF4444` | Error states, destructive actions |
| `--state-info` | `#06B6D4` | Informational states |

---

## 5. Layer 3: Feature Palettes

Each feature has its own color ecosystem with deterministically structured tokens.

### Palette Structure (All Features)

Every feature palette follows this template:

```css
--feature-{name}-primary        /* Main brand color */
--feature-{name}-on-primary    /* Text on primary (contrast) */
--feature-{name}-primary-hover /* Hover state */
--feature-{name}-primary-pressed /* Pressed/Active state */
--feature-{name}-accent        /* Secondary accent */
--feature-{name}-soft-bg       /* Light desaturated background */
--feature-{name}-muted        /* Muted surface (labels/badges) */
--feature-{name}-border        /* Border for feature surfaces */
--feature-{name}-decorative    /* Decorative accent */
--feature-{name}-dark-variant  /* Dark mode primary color */
--feature-{name}-*_contrast   /* WCAG AA compliant text (4.5:1) */
```

### Feature 1: Dating

**Feel**: Warm, Friendly, Romantic  
**Origin**: Warm coral tones with Japanese magazine sticker aesthetic

| Token | Value |
|-------|-------|
| `--feature-dating-primary` | `#FF6B81` |
| `--feature-dating-on-primary` | `#FFFFFF` |
| `--feature-dating-accent` | `#FF3B30` |
| `--feature-dating-soft-bg` | `#FFF1EE` |
| `--feature-dating-muted` | `#FBE7E9` |
| `--feature-dating-border` | `#FFD5D8` |
| `--feature-dating-decorative` | `#FFD1C4` |
| `--feature-dating-dark-variant` | `#9C2E3A` |

### Feature 2: Events

**Feel**: Energetic, Dynamic, Festival  
**Origin**: Retro yellow like old Japanese festival lanterns

| Token | Value |
|-------|-------|
| `--feature-events-primary` | `#FFD24D` |
| `--feature-events-on-primary` | `#131313` |
| `--feature-events-accent` | `#FF7A00` |
| `--feature-events-soft-bg` | `#FFF9EE` |
| `--feature-events-muted` | `#FFF3D6` |
| `--feature-events-border` | `#FFE6A8` |
| `--feature-events-decorative` | `#FFB84D` |
| `--feature-events-dark-variant` | `#6B4B00` |

### Feature 3: Community

**Feel**: Open, Social, Connected  
**Origin**: Bright sky blue evoking openness and community bonds

| Token | Value |
|-------|-------|
| `--feature-community-primary` | `#5CC3FF` |
| `--feature-community-on-primary` | `#021026` |
| `--feature-community-accent` | `#00D1D1` |
| `--feature-community-soft-bg` | `#F3FBFF` |
| `--feature-community-muted` | `#DFF7FF` |
| `--feature-community-border` | `#C5EEFF` |
| `--feature-community-decorative` | `#8FF0E6` |
| `--feature-community-dark-variant` | `#0E5E7A` |

### Feature 4: Marketplace

**Feel**: Clean, Productive, Trustworthy  
**Origin**: Mint green — aligned with DailyStack brand identity

| Token | Value |
|-------|-------|
| `--feature-marketplace-primary` | `#56BE89` (aligned with brand) |
| `--feature-marketplace-on-primary` | `#022012` |
| `--feature-marketplace-accent` | `#2F7A4B` |
| `--feature-marketplace-soft-bg` | `#ECFBF3` |
| `--feature-marketplace-muted` | `#DFF7EC` |
| `--feature-marketplace-border` | `#CFEFDD` |
| `--feature-marketplace-decorative` | `#9AD4B2` |
| `--feature-marketplace-dark-variant` | `#246042` |

### Feature 5: AI Assistant

**Feel**: Futuristic, Intelligent, Cutting-edge  
**Origin**: Electric purple — cyber-futuristic with retro warmth

| Token | Value |
|-------|-------|
| `--feature-ai-primary` | `#8A4CFF` |
| `--feature-ai-on-primary` | `#FFFFFF` |
| `--feature-ai-accent` | `#00B3FF` |
| `--feature-ai-soft-bg` | `#F1ECFB` |
| `--feature-ai-muted` | `#E9E4FF` |
| `--feature-ai-border` | `#D6CCFF` |
| `--feature-ai-decorative` | `#3B2B8D` |
| `--feature-ai-dark-variant` | `#2B114F` |

### Feature 6: Wallet / Finance

**Feel**: Reliable, Functional, Stable  
**Origin**: Deep retro red — trustworthy financial authority

| Token | Value |
|-------|-------|
| `--feature-wallet-primary` | `#D6453E` |
| `--feature-wallet-on-primary` | `#FFFFFF` |
| `--feature-wallet-accent` | `#B25422` |
| `--feature-wallet-soft-bg` | `#FBF5F1` |
| `--feature-wallet-muted` | `#F9E8E7` |
| `--feature-wallet-border` | `#F7D7D5` |
| `--feature-wallet-decorative` | `#6E1B1B` |
| `--feature-wallet-dark-variant` | `#531214` |

### Feature 7: Pet / Lifestyle

**Feel**: Comfortable, Natural, Warm  
**Origin**: Soft sage green — natural, pet-friendly warmth

| Token | Value |
|-------|-------|
| `--feature-pet-primary` | `#9FD8A8` |
| `--feature-pet-on-primary` | `#07250E` |
| `--feature-pet-accent` | `#8B5A3C` |
| `--feature-pet-soft-bg` | `#FBFDF8` |
| `--feature-pet-muted` | `#EEF7EE` |
| `--feature-pet-border` | `#E7F3E6` |
| `--feature-pet-decorative` | `#788C4B` |
| `--feature-pet-dark-variant` | `#294221` |

---

## 6. Layer 4: Component Tokens

UI-specific proxy tokens that map semantic intentions to component-level styling.

### Button System

```css
--component-btn-bg:              var(--theme-primary);
--component-btn-text:            var(--theme-on-primary);
--component-btn-border:          var(--brand-ink);
--component-btn-border-width:    2px;
--component-btn-shadow:          var(--shadow-md);
--component-btn-radius:          var(--radius-md);
--component-btn-padding-x:        20px;
--component-btn-padding-y:       12px;
--component-btn-font-weight:      600;
```

### Card System

```css
--component-card-bg:             var(--semantic-surface-1);
--component-card-border:         var(--border-default);
--component-card-radius:        var(--radius-lg);
--component-card-padding:       16px;
--component-card-shadow:         var(--shadow-md);
```

### Navigation System

```css
--component-nav-bg:              var(--semantic-surface-2);
--component-nav-text:            var(--text-secondary);
--component-nav-text-active:    var(--theme-primary);
--component-nav-indicator:      var(--theme-primary);
--component-nav-indicator-weight: 4px;  /* Active strip thickness */
```

### Badge Variants

```css
--component-badge-bg:            var(--theme-soft-bg);
--component-badge-text:          var(--theme-primary);
--component-badge-radius:        var(--radius-sm);
```

---

## 7. Layer 5: State Tokens

Interaction state tokens for hover, pressed, disabled, and focus states.

### Interaction States

| Token | Value | Usage |
|-------|-------|-------|
| `--state-hover-bg` | `rgba(26, 28, 30, 0.04)` | Hover background |
| `--state-pressed-scale` | `0.97` | Tactile press scaling |
| `--state-pressed-translate` | `translate(2px, 2px)` | Retro keyboard feel |
| `--state-disabled-opacity` | `0.48` | Disabled state opacity |
| `--state-focus-ring-width` | `3px` | Focus ring thickness |

---

## 8. Dark Mode Architecture

**IMPORTANT**: This is NOT a generic gray UI dark mode. We use **tinted dark surfaces** with 6% feature color alpha to preserve Retro Personality and Brutalist Depth.

### Base Dark Surfaces

| Token | Light Value | Dark Value |
|-------|-------------|------------|
| `--surface-bg` | `#F9FAFB` | `#0F1416` |
| `--surface-2` | `#F4F5F7` | `#111316` |
| `--surface-1` | `#FFFFFF` | `#0B0E0F` |
| `--text-primary` | `#1A1C1E` | `#F1F3F4` |

### Tinted Dark Surfaces (6% Alpha Tint)

Dark surfaces blend 6% of the feature's primary color for personality:

```css
.dark .feature-dating,
.feature-dating.dark {
  --surface-bg: color-mix(in srgb, #0F1416 94%, var(--feature-dating-primary));
  --surface-1:  color-mix(in srgb, #0B0E0F 92%, var(--feature-dating-primary));
}
```

### Decorative Color Saturation Cap

- **Light Mode**: Primary saturation cap at ~78%
- **Dark Mode**: Reduce saturation by 18-24% from Light Mode
- **Decorative Colors**: Maximum 8-12% of screen area

---

## 9. Accent-Only Policy

### The Rule

> **Do NOT use highly saturated primary tokens as large-area surfaces.**

Primaries remain valid as accents:
- Icons
- Borders
- Small buttons
- Highlights

For large surfaces, use:
- `--feature-<name>-muted`
- `--feature-<name>-soft-bg`
- `--semantic-surface-*`

### Examples

**BAD** — Primary used as surface:
```tsx
<div className="bg-[var(--brand-primary)]" />
```

**GOOD** — Feature surface:
```tsx
<div className="bg-[var(--feature-dating-muted)]" />
```

**GOOD** — Semantic surface:
```tsx
<div className="bg-[var(--semantic-surface-1)]" />
```

---

## 10. Component Design Rules

### Buttons (Chunky / Tactile)

- **Thick border**: 2-3px with `--brand-ink`
- **Sharp offset shadow**: 3px 3px with hard edges
- **Active press effect**: `translate(2px, 2px)` + reduced shadow
- **Tactile feel**: Like retro game cartridge buttons
- **Minimum tappable area**: Customizable (44px recommended)

```css
.btn:active {
  transform: translate(2px, 2px);
  box-shadow: var(--state-pressed-shadow); /* 1px 1px */
}
```

### Cards

- **Large rounded corners**: 16-24px radius
- **Soft-bg tint**: Feature-tinted background
- **Sharp shadows**: Not blurry/soft — hard-edged Brutalist style
- **Optional thick border**: 3px border variant available

### Navigation & Tabs

- **Neutral base**: Gray/default active state
- **Active feature**: Dynamic 4px accent strip in feature color
- **Strip position**: Left side, vertically centered

### Badges

- **Sticker-like**: Japanese editorial magazine label aesthetic
- **Small, bold**: 12px font, 600 weight
- **Feature-colored**: Uses feature palette

### Toasts / Alerts

- **Status strip**: 6px left border in status color
- **Soft background**: Status-tinted light background
- **State colors**: `--state-success`, `--state-warning`, `--state-error`, `--state-info`

---

## 11. Motion & Animation

### Timing Functions

| Name | Curve | Usage |
|------|-------|-------|
| `retro` | `cubic-bezier(0.22, 1, 0.36, 1)` | Snappy, slight overshoot |
| `smooth` | `cubic-bezier(0.4, 0, 0.2, 1)` | Standard ease |
| `bounce` | `cubic-bezier(0.68, -0.55, 0.265, 1.55)` | Bouncy entrance |

### Duration Guidelines

| Speed | Duration | Usage |
|-------|----------|-------|
| `fast` | 150ms | Button interactions |
| `normal` | 200ms | Standard transitions |
| `slow` | 250ms | Feature page transitions |
| `slower` | 350ms | Modals, major reveals |

### Feature Transitions

**RULE**: Never use full-bleed abrupt color changes. Use cross-fade or fade-in only.

```css
.crossfade {
  transition: background-color 300ms ease, border-color 300ms ease;
}
```

### Micro-interactions (Full Motion Allowed)

Heavy motion is permitted ONLY for micro-interactions:
- Button press feedback
- Card hover effects
- Tab switching
- Skeleton loading shimmer

---

## 12. Accessibility Requirements

### WCAG AA Contrast

| Text Size | Minimum Contrast Ratio |
|-----------|------------------------|
| Normal text (< 18px) | 4.5:1 |
| Large text (≥ 18px) | 3:1 |
| UI components | 3:1 |

### Contrast Tokens

Each feature palette includes `*_contrast` tokens pre-calculated for WCAG AA compliance:

```css
--feature-dating-primary-contrast: #FFFFFF;
--feature-dating-accent-contrast: #FFFFFF;
```

### Focus States

- **Focus ring width**: 3px
- **Focus ring color**: `--focus-ring` (brand light mint)
- **Focus ring offset**: 2px
- **Minimum tappable area**: 44px × 44px

---

## 13. Implementation Guide

### CSS Variables (design-tokens.css)

The CSS variables file is the **source of truth**. All color values are defined here first.

```css
/* Layer 1-5 tokens in design-tokens.css */
:root {
  --brand-primary: #56BE89;
  --feature-dating-primary: #FF6B81;
  /* ... */
}
```

### Tailwind Config (tailwind.config.js)

Tailwind configuration references CSS variables for runtime proxy switching:

```js
colors: {
  brand: { primary: 'var(--brand-primary)', /* ... */ },
  dating: { primary: 'var(--feature-dating-primary)', /* ... */ },
}
```

### Feature Scoping

Apply `.feature-{name}` class to containers to switch theme proxies:

```tsx
<div className="feature-dating">
  <button className="btn">Use Dating Primary</button>
  <Card className="card-feature">Feature-tinted card</Card>
</div>
```

### Using CSS Variables in JSX

```tsx
// Using inline style for CSS variable
<div style={{ 
  backgroundColor: 'var(--feature-dating-soft-bg)',
  borderColor: 'var(--feature-dating-border)'
}} />

// Using Tailwind arbitrary value
<div className="bg-[var(--feature-dating-muted)]" />
```

---

## 14. Migration & Maintenance

### Migrating Existing Code

1. **Replace hardcoded colors** with CSS variable references
2. **Identify feature scope** from file path or component context
3. **Apply feature scoping class** to active feature containers
4. **Use component tokens** for standard UI patterns

### Adding New Feature Palettes

1. **Add tokens to Layer 3** in `design-tokens.css`
2. **Define feature scoping class** with `--theme-*` overrides
3. **Add Tailwind config colors** in `tailwind.config.js`
4. **Add contrast tokens** for WCAG AA compliance
5. **Update documentation** with new palette details

### Enforcement

A CI guard (`scripts/check-primary-surface-usage.mjs`) fails when primary tokens are used in background declarations.

---

## Quick Reference: Feature Token Map

| Feature | Primary | Soft-BG | Accent | Dark Variant |
|---------|---------|---------|--------|--------------|
| Dating | `#FF6B81` | `#FFF1EE` | `#FF3B30` | `#9C2E3A` |
| Events | `#FFD24D` | `#FFF9EE` | `#FF7A00` | `#6B4B00` |
| Community | `#5CC3FF` | `#F3FBFF` | `#00D1D1` | `#0E5E7A` |
| Marketplace | `#56BE89` | `#ECFBF3` | `#2F7A4B` | `#246042` |
| AI | `#8A4CFF` | `#F1ECFB` | `#00B3FF` | `#2B114F` |
| Wallet | `#D6453E` | `#FBF5F1` | `#B25422` | `#531214` |
| Pet | `#9FD8A8` | `#FBFDF8` | `#8B5A3C` | `#294221` |
| Brand (default) | `#56BE89` | `#FFFFFF` | `#3A9E68` | `#3A9E68` |

---

*Version: 1.0 | Last Updated: 2026-05-26*  
*Part of: DailyStack Design System v2.0*
