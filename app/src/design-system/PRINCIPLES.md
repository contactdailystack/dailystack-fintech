/**
 * ============================================================
 * DailyStack Design System — Design Principles v1.0
 * ============================================================
 * The Tesla of Personal Finance — Core Design Philosophy
 * 
 * This document establishes the design principles that guide
 * all UI/UX decisions for DailyStack FinTech.
 * 
 * Based on: DailyStack Master Constitution v4.1
 * Core Beliefs Strategy + Customer Avatar Analysis
 */

// ─── Core Beliefs & Component Service Map ──────────────────────────

/**
 * BELIEF 01: Frictionless Duality
 * 
 * "ความง่ายและความแม่นยำไม่จำเป็นต้องเลือก"
 * 
 * Components serve this belief by:
 * - Mode Toggle: One-tap switch between Smart Mode and Precision Mode
 * - TeslaCard: Adaptive content density based on mode
 * - TeslaPill: Mode indicator badges
 * 
 * Psychological backing:
 * - Dual-track interface eliminates "either/or" anxiety
 * - Spring physics demonstrates mode cohesion
 * - Consistent dark background maintains cognitive continuity
 */

/**
 * BELIEF 02: Living Balance Sheet
 * 
 * "ทุกบาทมีชีวิตและหายใจได้"
 * 
 * Components serve this belief by:
 * - Net Worth display: Large 48-56pt tabular figures
 * - TeslaCard: Stacked breakdown bars with real-time updates
 * - Color shifts: Neutral → Green (increase) / Amber (decrease)
 * - Transfer animations: Visualize money movement
 * 
 * Psychological backing:
 * - Causal connection between actions and Net Worth
 * - Count-up/down animations show impact
 * - Transfer dots demonstrate double-entry bookkeeping visually
 */

/**
 * BELIEF 03: Privacy Aura
 * 
 * "ข้อมูลของคุณไม่ออกจากเครื่อง"
 * 
 * Components serve this belief by:
 * - Privacy Mode: Geometric capsule shapes (not blur)
 * - Pulsing glow: Active security indicator
 * - No bank password prompts anywhere
 * - GlassSurface: Premium feel with implied protection
 * 
 * Psychological backing:
 * - Geometric shapes suggest complexity/encryption
 * - Pulsing glow = ongoing reassurance
 * - Visual flow animation proves no server intermediaries
 */

/**
 * BELIEF 04: Lifetime Ownership
 * 
 * "ลงทุนครั้งเดียว เป็นเจ้าของตลอดชีวิต"
 * 
 * Components serve this belief by:
 * - Zero ads: No banner, no upsell popups
 * - "Your Ownership" section in Settings
 * - License key display with activation date
 * - Device list for cross-platform management
 * 
 * Psychological backing:
 * - Pride of ownership through premium aesthetics
 * - No subscription fatigue triggers
 * - "Sunk cost" becomes "investment" through lifetime framing
 */

/**
 * BELIEF 05: End-of-Day Discipline
 * 
 * "วินิจฉัยไม่ใช่บันทึก"
 * 
 * Components serve this belief by:
 * - Rich Notifications: Inline action buttons
 * - Soft Amber indicators (not red badges)
 * - Gentle Catch-Up cards with AI suggestions
 * - 1-tap confirmation flow
 * 
 * Psychological backing:
 * - Low activation energy for daily check-in
 * - Gentle urgency without shame/anxiety
 * - AI-assisted reduces manual fatigue
 */

// ─── Design Decision Matrix ────────────────────────────────────────

/**
 * When making design decisions, apply this matrix:
 * 
 * QUESTION: Does this serve the user, or the designer's aesthetics?
 * 
 * | Decision Area     | YES (Serve User)              | NO (Serve Designer)      |
 * |-------------------|-------------------------------|--------------------------|
 * | Motion            | Purposeful, completes thought | Decorative, distracting   |
 * | Haptics           | Confirms action, no noise     | Constant, fatiguing       |
 * | Color             | Communicates state clearly    | Artistic expression      |
 * | Typography        | Reads fast, scans well        | Display font everywhere   |
 * | Spacing           | Breathing room, clarity       | Tight, impressive density |
 * | Icons             | Clear meaning, accessible     | Aesthetic, ambiguous     |
 */

// ─── Color Usage Rules ──────────────────────────────────────────────

/**
 * MINT (#CCFF00 / #C7FF2E)
 * - Primary actions, CTAs
 * - Active states
 * - Success indicators
 * - Money-related highlights
 * 
 * CYAN (#0284C7)
 * - Technology indicators
 * - Growth trends
 * - Cross-platform sync
 * 
 * AMBER (#F97316) — NEVER RED
 * - Budget warnings (approaching limit)
 * - Upcoming subscription alerts
 * - Gentle urgency signals
 * - Amber pulse animation
 * 
 * GREEN (#4CAF50)
 * - Completed transactions
 * - Positive changes
 * - Success states
 * 
 * PURPLE (#8B5CF6)
 * - AI insights
 * - Recommendations
 * - Smart mode indicators
 */

// ─── Typography Rules ──────────────────────────────────────────────

/**
 * Space Grotesk: English + Numbers
 * - Net Worth display
 * - Headings
 * - Financial figures (tabular-nums)
 * 
 * Kanit: Thai language
 * - Body text
 * - Descriptions
 * - Helper text
 * 
 * JetBrains Mono: Technical strings only
 * - Code snippets
 * - API keys
 * - Technical data
 */

// ─── Accessibility Guidelines ──────────────────────────────────────

/**
 * WCAG AA Compliance:
 * 
 * Color Contrast:
 * - Text on dark background: 4.5:1 minimum
 * - Large text (18pt+): 3:1 minimum
 * - UI components: 3:1 minimum
 * 
 * Touch Targets:
 * - Minimum 44x44pt (Apple HIG)
 * - Recommended 48x48dp (Material)
 * - One-handed thumb zone optimization
 * 
 * Motion Sensitivity:
 * - Respect prefers-reduced-motion
 * - Provide static alternatives
 * - No flashing content (>3Hz)
 * 
 * Screen Readers:
 * - Semantic HTML
 * - ARIA labels for icons
 * - Status announcements for dynamic content
 */

// ─── Component Selection Guide ──────────────────────────────────────

/**
 * TeslaCard — When you need:
 * - Elevated content container
 * - Grouped related information
 * - Interactive cards with press states
 * 
 * TeslaPill — When you need:
 * - Status badges
 * - Category indicators
 * - Mode labels
 * 
 * TeslaButton — When you need:
 * - Primary actions (mint)
 * - Secondary actions (ghost/outline)
 * - Haptic feedback on press
 * 
 * TeslaInput — When you need:
 * - Text entry with floating labels
 * - Validation feedback
 * - Currency inputs
 * 
 * GlassSurface — When you need:
 * - Modal backdrops
 * - Overlay content
 * - Premium glass-morphism effect
 * 
 * TeslaDivider — When you need:
 * - Section separation
 * - Group labels
 * - Visual hierarchy
 */

// ─── Motion & Haptic Pairing ───────────────────────────────────────

/**
 * Every interactive element should have motion + haptic:
 * 
 * | Action              | Motion        | Haptic      |
 * |---------------------|---------------|-------------|
 * | Button press        | Scale 0.96    | CRISP_CLICK |
 * | Toggle switch       | Spring slide  | CRISP_CLICK |
 * | Card expand         | Height spring | THUD        |
 * | Transaction record  | Success glow | DEEP_RESONANCE |
 * | Goal achieved       | Bounce        | SUCCESS_CASCADE |
 * | Budget warning      | Pulse amber   | AMBER_PULSE |
 * | Navigation          | Fade/slide    | SELECT      |
 */

// ─── Anti-Patterns ─────────────────────────────────────────────────

/**
 * NEVER do these:
 * 
 * 1. Use red (#FF0000 or #FF5C73) for warnings
 *    → Use Amber (#F97316) instead
 * 
 * 2. Use emoji in UI
 *    → Use [Icon: Name] format with lucide-react
 * 
 * 3. Use aggressive red badges
 *    → Use Soft Amber Dot (#FF9800 at 60% opacity)
 * 
 * 4. Add advertising banners or upsell popups
 *    → Zero ads guaranteed
 * 
 * 5. Use decorative animations
 *    → Every animation must serve a purpose
 * 
 * 6. Request bank passwords
 *    → Privacy-first, no server intermediaries
 * 
 * 7. Use non-tabular figures for money
 *    → Tabular-nums for alignment
 */


