# DailyStack — Pilo Design System v8.0

## Overview

The Pilo Design System is inspired by the Pilo Autonomous Taxi App aesthetic — a premium, high-contrast design language that emphasizes **cleanliness**, **boldness**, and **autonomy**. 

### Design Philosophy

| Principle | Description |
|-----------|-------------|
| **High Contrast Minimalism** | Use stark contrasts (black/white) with strategic accent colors |
| **60-30-10 Rule** | 60% background, 30% surfaces/text, 10% accent |
| **Tech-forward** | Clean lines, geometric shapes, futuristic feel |
| **Trust** | Consistent patterns, clear hierarchy, accessible contrast |

---

## Color System

### Primary — Pilo Lime `#D1FF3B`

The hero accent color. Used **sparingly** (5-10% of screen) for maximum impact.

| Token | Value | Usage |
|-------|-------|-------|
| `--pilo` | `#D1FF3B` | Primary accent, CTAs |
| `--pilo-light` | `#E8FF7A` | Hover states, highlights |
| `--pilo-dark` | `#B8E600` | Active/pressed states |
| `--pilo-glow` | `rgba(209,255,59,0.40)` | Glow effects |
| `--pilo-glow-sm` | `rgba(209,255,59,0.20)` | Subtle glow |
| `--pilo-surface` | `rgba(209,255,59,0.08)` | Background tints |
| `--pilo-text` | `#111111` | Text on lime backgrounds |

### Surface System

#### Light Mode
| Token | Value | Usage |
|-------|-------|-------|
| `--bg-base` | `#FFFFFF` | Main background |
| `--surface-1` | `#FFFFFF` | Primary surfaces |
| `--surface-2` | `#F8F8F8` | Secondary surfaces |
| `--surface-3` | `#F2F2F2` | Tertiary surfaces |
| `--surface-4` | `#EBEBEB` | Quaternary surfaces |

#### Dark Mode
| Token | Value | Usage |
|-------|-------|-------|
| `--bg-base` | `#0A0A0A` | Main background |
| `--surface-1` | `#111111` | Primary surfaces |
| `--surface-2` | `#161616` | Secondary surfaces |
| `--surface-3` | `#1C1C1C` | Tertiary surfaces |
| `--surface-4` | `#242424` | Quaternary surfaces |

### Surface Black — Pilo Signature

High-contrast black cards for key information:

```css
.ds-card-dark {
  background: #111111;
  color: #FFFFFF;
  border-radius: 28px;
  box-shadow: 0 8px 24px rgba(0,0,0,0.35);
}
```

### Life Dimensions Colors

Each dimension has a unique accent:

| Dimension | Color | Hex |
|-----------|-------|-----|
| Work | Pilo Lime | `#D1FF3B` |
| Learning | Mint | `#5BE89C` |
| Social | Coral | `#FF7EAD` |
| Passions | Purple | `#A78BFA` |
| Wellbeing | Gold | `#FBBF24` |

### Semantic Colors

| Token | Color | Usage |
|-------|-------|-------|
| `--success` | `#22C55E` | Positive states |
| `--warning` | `#F59E0B` | Caution states |
| `--error` | `#EF4444` | Error states |
| `--info` | `#3B82F6` | Informational |

---

## Typography

### Font Stack

```css
--font-heading: 'Space Grotesk', 'Prompt', system-ui, sans-serif;
--font-body: 'Space Grotesk', 'Prompt', system-ui, sans-serif;
--font-mono: 'JetBrains Mono', monospace;
```

### Type Scale

| Token | Size | Weight | Usage |
|-------|------|--------|-------|
| `--text-xs` | 12px | - | Labels, captions |
| `--text-sm` | 13px | - | Secondary text |
| `--text-base` | 16px | - | Body text |
| `--text-lg` | 18px | - | Lead text |
| `--text-xl` | 20px | - | Section titles |
| `--text-2xl` | 24px | - | Card titles |
| `--text-3xl` | 30px | - | Page titles |
| `--text-4xl` | 36px | - | Hero numbers |
| `--text-5xl` | 48px | - | Display text |

### Font Weights

| Token | Weight | Usage |
|-------|--------|-------|
| `--font-light` | 300 | Light text |
| `--font-normal` | 400 | Body text |
| `--font-medium` | 500 | Emphasized |
| `--font-semibold` | 600 | Subtitles |
| `--font-bold` | 700 | Titles |
| `--font-extrabold` | 800 | Hero text |
| `--font-black` | 900 | Brand text |

---

## Components

### Buttons

#### Primary Button
```html
<button class="ds-btn ds-btn-primary">
  Primary Action
</button>
```
- Background: `--pilo`
- Border-radius: `--radius-pill` (9999px)
- Shadow: `0 4px 16px var(--pilo-glow-sm)`
- Hover: lift + stronger glow

#### Secondary Button
```html
<button class="ds-btn ds-btn-secondary">
  Secondary
</button>
```
- Background: transparent
- Border: 1.5px `--border-strong`
- Hover: background `--surface-2`

#### Ghost Button
```html
<button class="ds-btn ds-btn-ghost">
  Ghost
</button>
```
- No border
- Hover: background `--surface-2`

#### FAB (Floating Action Button)
```html
<button class="ds-fab">
  <Icon name="add" />
</button>
```
- Position: fixed bottom-right
- Background: `--pilo`
- Shadow: `0 8px 32px var(--pilo-glow)`

---

### Cards

#### Base Card
```html
<div class="ds-card">
  Content here
</div>
```
- Background: `--bg-card`
- Border: 1px `--border-subtle`
- Border-radius: `--radius-card` (28px)
- Padding: 24px
- Shadow: `--shadow-sm`

#### Elevated Card
```html
<div class="ds-card-elevated">
  Content here
</div>
```
- Hover: lift + shadow increase

#### Dark Card
```html
<div class="ds-card-dark">
  <p>High contrast content</p>
</div>
```
- Background: `#111111`
- Text: white
- Shadow: dark

#### Glow Card
```html
<div class="ds-card-glow">
  Pilo accent glow
</div>
```
- Border: 1px `--pilo` at 15% opacity
- Shadow: `--pilo-glow` at 8%

#### Hero Card
```html
<div class="ds-hero-card">
  <h3>Weekly Overview</h3>
</div>
```
- Gradient background
- Radial glow accent

---

### Inputs

#### Text Input
```html
<input class="ds-input" placeholder="Enter text..." />
```
- Background: `--surface-2`
- Border: 1.5px `--border-subtle`
- Focus: `--pilo` border + glow

#### OTP Input
```html
<div class="ds-otp-container">
  <input class="ds-otp-cell" />
  <input class="ds-otp-cell" />
  ...
</div>
```

---

### Navigation

#### Bottom Nav
```html
<nav class="ds-bottom-nav">
  <button class="ds-nav-item active">
    <Icon name="home" />
  </button>
  ...
</nav>
```
- Position: fixed bottom
- Background: glass effect
- Border-radius: pill

#### Part Nav
```html
<div class="ds-part-nav">
  <button class="ds-part-pill active">Work</button>
  ...
</div>
```

---

### Progress

#### Progress Bar
```html
<div class="ds-progress-bar-track">
  <div class="ds-progress-bar-fill" style="width: 75%" />
</div>
```

#### Progress Ring
```html
<ProgressRing progress={78} size={120} strokeWidth={8} />
```

---

### Badges

```html
<span class="ds-badge ds-badge-pilo">New</span>
<span class="ds-badge ds-badge-dark">Dark</span>
<span class="ds-badge ds-badge-muted">Muted</span>
<span class="ds-badge ds-badge-success">Success</span>
```

---

## Shadows

### Light Mode
| Token | Value |
|-------|-------|
| `--shadow-xs` | `0 1px 2px rgba(17,17,17,0.04)` |
| `--shadow-sm` | `0 2px 8px rgba(17,17,17,0.06)` |
| `--shadow-md` | `0 4px 16px rgba(17,17,17,0.08)` |
| `--shadow-lg` | `0 8px 32px rgba(17,17,17,0.10)` |
| `--shadow-xl` | `0 16px 48px rgba(17,17,17,0.12)` |
| `--shadow-card` | `0 4px 20px rgba(17,17,17,0.08)` |

### Dark Mode
| Token | Value |
|-------|-------|
| `--shadow-sm` | `0 2px 8px rgba(0,0,0,0.4)` |
| `--shadow-md` | `0 4px 16px rgba(0,0,0,0.5)` |
| `--shadow-lg` | `0 8px 32px rgba(0,0,0,0.6)` |

### Glow Shadows
| Token | Value |
|-------|-------|
| `--shadow-pilo` | `0 0 28px rgba(209,255,59,0.40)` |
| `--shadow-pilo-sm` | `0 0 16px rgba(209,255,59,0.20)` |

---

## Border Radius

| Token | Value | Usage |
|-------|-------|-------|
| `--radius-xs` | 8px | Small elements |
| `--radius-sm` | 12px | Inputs, small cards |
| `--radius-md` | 16px | Medium elements |
| `--radius-lg` | 24px | Large cards |
| `--radius-xl` | 32px | Extra large |
| `--radius-pill` | 9999px | Buttons, pills |
| `--radius-card` | 28px | Standard cards |
| `--radius-nav` | 32px | Navigation |

---

## Animation

### Timing
| Token | Value |
|-------|-------|
| `--duration-instant` | 50ms |
| `--duration-fast` | 100ms |
| `--duration-normal` | 200ms |
| `--duration-slow` | 300ms |
| `--duration-slower` | 400ms |

### Easing
| Token | Value |
|-------|-------|
| `--ease-linear` | linear |
| `--ease-out` | `cubic-bezier(0,0,0.2,1)` |
| `--ease-smooth` | `cubic-bezier(0.22,1,0.36,1)` |
| `--ease-spring` | `cubic-bezier(0.34,1.56,0.64,1)` |

### Animations
```css
.animate-fade-up    /* Entrance: fade + slide up */
.animate-fade-in    /* Simple fade */
.animate-scale-in   /* Scale from 0.92 */
.animate-pulse-soft /* Gentle pulse */
.animate-pulse-glow /* Glow pulse */
.animate-float      /* Gentle float */
.animate-spin       /* 360 spin */
```

---

## Accessibility

### Contrast Ratios

All text combinations meet WCAG 2.1 AA standards:

| Combination | Ratio | Level |
|-------------|-------|-------|
| `--text-primary` on `--bg-base` | 17.5:1 | AAA |
| `--text-secondary` on `--bg-base` | 6.2:1 | AA |
| `--pilo` on `--surface-black` | 11.2:1 | AAA |

### Focus States

All interactive elements have visible focus indicators:

```css
:focus-visible {
  outline: 2px solid var(--pilo);
  outline-offset: 2px;
}
```

### Reduced Motion

Animations respect `prefers-reduced-motion`:

```css
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

---

## Usage

### Import the Design System

```tsx
// In your main App or Layout
import './styles/design-tokens-pilo.css';

// Or import specific components
import { PiloDesignShowcase } from './components/PiloDesignShowcase';
```

### Using CSS Variables

```tsx
// Use CSS variables directly in inline styles
<div style={{ 
  background: 'var(--bg-card)',
  color: 'var(--text-primary)',
  borderRadius: 'var(--radius-card)'
}}>
  Card Content
</div>
```

### Using Tailwind Classes

```tsx
// Tailwind classes map to CSS variables
<button className="ds-btn ds-btn-primary bg-pilo">
  Click me
</button>

<div className="ds-card bg-surface-1 text-text-primary">
  Content
</div>
```

---

## File Structure

```
src/
├── styles/
│   └── design-tokens-pilo.css    # Main design system CSS
├── app/
│   └── components/
│       └── PiloDesignShowcase.tsx  # Component showcase
└── tailwind.config.js            # Tailwind integration
```

---

## Changelog

### v8.0 (2026-06-01)
- Complete Pilo Design System implementation
- High-contrast color palette
- Electric Lime (#D1FF3B) accent
- Surface Black cards
- Pilo-style animations
- Full Dark/Light mode support
