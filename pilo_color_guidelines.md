# Pilo App Design System: Strict Color & Typography Guidelines

This document establishes the official color usage conditions and strict visual constraints for the **Pilo App Design System** based on the Pilo Autonomous Taxi App UX/UI Branding system ([Behance Reference](https://www.behance.net/gallery/249780345/Pilo-Autonomous-Taxi-App-UXUI-Branding)).

All developers and designers must adhere to these guidelines to maintain a world-class premium dark aesthetic.

---

## 🎨 1. Core Color Palette & Hex Specifications

| Token Name | Hex Code | Visual Target / Weight | Primary Purpose |
| :--- | :--- | :--- | :--- |
| **Pilo Cockpit Black** | `#0F0F0F` | **Background (90%+ Weight)** | Deep AMOLED dark base; reduces eye strain and provides infinite contrast. |
| **Pilo Surface Grey** | `#1C232A` / `#1A1A1A`| **Surfaces & Cards (7% Weight)** | Used for cards, sheets, containers, and elevated layout wrappers. |
| **Pilo Charcoal** | `#2E2E2E` | **Controls & Inputs (2% Weight)** | Text inputs, segment controls, slider tracks, and inactive buttons. |
| **Pilo Neon Lime** | `#C7FF2E` | **Primary Accent (1% Weight)** | High-contrast highlights, primary CTAs, active status, and action markers. |
| **Pilo Emerald Mint** | `#56BE89` | **Secondary Accent (<1% Weight)** | Success states, eco-friendly pathways, or subtle gradients. |

---

## ⚠️ 2. Strict Color Usage Conditions (The Rules)

### 🚨 Rule 1: The Accent Restriction (No Neon Fatigue)
* **DO NOT** use `#C7FF2E` (Pilo Neon Lime) as a background color for large panels, or as a color for standard text, titles, or paragraphs.
* **DO NOT** overlap multiple Neon Lime elements closely together.
* **ONLY USE** Neon Lime for:
  - Main Call-to-Action (CTA) filled buttons.
  - Active tab markers or path lines on maps.
  - Critical success checkmarks and active state indicators (e.g. "Best Choice").

### 🚨 Rule 2: Background Dominance
* **NEVER** use pure white (`#FFFFFF`) or light-grey as the primary page background.
* The primary background must remain strictly `#0F0F0F`.
* Secondary surfaces (`#1A1A1A` or `#1C232A`) must always maintain at least a **4.5:1 contrast ratio** with typography.

### 🚨 Rule 3: Premium Glassmorphism Specs
All cards and panels overlaying the background should use Pilo's glassmorphic specification:
```css
background: rgba(28, 35, 42, 0.8); /* Cockpit Surface with transparency */
backdrop-filter: blur(20px) saturate(180%);
border: 1px solid rgba(255, 255, 255, 0.08); /* Subtle white border */
```

### 🚨 Rule 4: Visual Hierarchy for Typography
Typography must follow this precise hierarchy:
1. **Primary Headers (`#FFFFFF`):** Main information, titles, prominent currency rolls.
2. **Secondary Copy (`#A0A0A0`):** Explanatory text, labels, subheadings.
3. **Muted Metadata (`#606060`):** Disabled states, placeholders, inactive icons.

---

## 📱 3. Core Typography Specifications (iOS & Android Cockpit)

Pilo's premium visual layout requires **Space Grotesk** (English UI) and **Kanit** (Thai UI) for web applications, or native **SF Pro Display** for mobile cockpits.

### Text Classes
```css
/* Hero Headers */
font-size: 48px;
font-weight: 700;
letter-spacing: -0.02em; /* -0.96px */
line-height: 56px;

/* Segment Labels & Badges */
font-size: 11px;
font-weight: 600;
letter-spacing: 0.08em; /* 0.88px */
text-transform: uppercase;
line-height: 14px;
```

---

## 🔍 4. Verification Checklists for UI Reviews
- [ ] Primary screen background is strictly `#0F0F0F`.
- [ ] Neon Lime `#C7FF2E` is reserved only for active tabs, status pills, and direct CTA clicks.
- [ ] Text inputs use Pilo Charcoal `#2E2E2E` with white text and `#C7FF2E` border glow on focus.
- [ ] Ease-out transitions are exactly 200ms on all hover and active states.
