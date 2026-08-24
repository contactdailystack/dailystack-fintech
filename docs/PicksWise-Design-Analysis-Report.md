# PicksWise Design Analysis Report
## Reference Deep Analysis: CycleMate + Pilo → PicksWise Design Direction

**Author:** Senior UX Researcher & Design System Architect  
**Date:** 2026-07-11  
**References:** CycleMate (Bicycle App) + Pilo (Autonomous Taxi App)  
**Target:** PicksWise — Thai FinTech Subscription Tracker with "Decision Intelligence" positioning

---

# Executive Summary

PicksWise is a Thai fintech subscription tracker positioned as a **"Decision Intelligence"** platform. The design must bridge two worlds: the clarity and trust signals of fintech (money is at stake) with the engagement and modern aesthetics of lifestyle apps. This report analyzes two reference projects and synthesizes a design direction that elevates PicksWise beyond typical finance apps.

**Key Insight:** The uploaded reference images (Thai HR app with floating pill navigation) represent the navigation paradigm already implemented in PicksWise. The real opportunity is in **Dashboard Strategy, Visual Hierarchy for financial data, and the Emotional Design** that makes users feel confident about their money decisions.

---

# Part A: 30-Point Deep Design Analysis

## 1. Product Philosophy

### CycleMate
- **Philosophy:** "AI-powered cycling companion" — technology serves the joy of cycling
- **Core Value:** Enhance the experience, not replace human judgment
- **Emotional Tone:** Energetic, motivational, community-driven
- **Positioning:** Fitness companion with AI intelligence layer
- **Design DNA:** Human-centric technology (user is the hero, AI is the helper)

### Pilo
- **Philosophy:** "Fully autonomous taxi — no driver, no surge pricing, no small talk"
- **Core Value:** Remove friction at every step; the technology disappears
- **Emotional Tone:** Confident, futuristic but approachable, trust-first
- **Positioning:** Autonomous mobility made natural and effortless
- **Design DNA:** Technology as invisible infrastructure (user doesn't need to understand the tech)

### PicksWise Adaptation
**Recommended Philosophy:** *"Your financial clarity engine"* — AI surfaces insights that make you feel in control, not overwhelmed. The technology doesn't replace your judgment; it amplifies it.

**Design DNA for PicksWise:**
- **Technology as financial co-pilot** — not a black box, but an explainable partner
- **Confidence through clarity** — complex financial data made simple
- **Proactive intelligence** — surfaces opportunities before users ask

### Key Distinction from References
CycleMate and Pilo both use AI as a **background** feature. PicksWise should position AI as a **visible, interactive co-pilot** — users see the AI reasoning, not just the results.

---

## 2. Brand Identity

### CycleMate
- **Visual Language:** Fresh, energetic, nature-inspired
- **Color Palette:** Greens (growth, nature), whites (cleanliness), accent blues (trust, technology)
- **Imagery:** Photography-forward, real cyclists, outdoor adventure
- **Tone:** Friendly, encouraging, community-focused
- **Logo Approach:** Minimal, icon-based, memorable

### Pilo
- **Visual Language:** Clean, bold, autonomous
- **Color Palette:** Primary brand color dominates, high contrast, minimal neutrals
- **Imagery:** Abstract geometric shapes, product renders, no stock photography
- **Tone:** Confident, futuristic but warm, institutional yet approachable
- **Logo Approach:** Bold wordmark, geometric icon, strong brand mark

### PicksWise Adaptation

**Brand Personality for PicksWise:**
- **Confident but not intimidating** — financial apps can feel like corporate banking; PicksWise should feel like a smart friend
- **Modern Thai identity** — blend international fintech polish with Thai cultural warmth
- **Clarity over decoration** — every visual element serves comprehension

**Recommended Visual Language:**
- **Aesthetic:** "Premium Minimal" — clean but not sterile, sophisticated but accessible
- **Mood:** Calm confidence — users should feel their finances are under control
- **Metaphor:** A high-end instrument panel — precise, beautiful, purposeful

**Color System (See Section 12 for detailed breakdown):**
- Primary: Lime (#CDFF24) — brand anchor, used sparingly for emphasis
- Background: Deep dark (#0B0F0A) — premium, reduces eye strain, makes data pop
- Surface: Elevated grays for cards and containers
- Success/Alert: Traditional green/red with lime tint for brand consistency
- Text: High contrast whites and muted grays

---

## 3. UX Strategy

### CycleMate
**UX Focus:** Gamification + Motivation + Real-time feedback
- Ride tracking with live metrics creates immediate gratification
- Achievement system drives continued engagement
- Weather and safety alerts show "caring" design
- Social features create community accountability

**Key Insight:** Users return because cycling is enjoyable AND the app makes them feel good about doing it.

### Pilo
**UX Focus:** Trust-building + Friction elimination + Transparency
- Every step explains what the system is doing and why
- No surprises — predictive transparency before actions
- "The ride is the product" — interface serves the journey, not features
- Voice AI booking demonstrates cutting-edge but accessible tech

**Key Insight:** Users trust the system because every interaction demonstrates reliability and predictability.

### PicksWise Adaptation

**UX Strategy for PicksWise: "Financial Intelligence Layer"**

1. **Decision-First Architecture**
   - Every screen answers: "What should I do about my subscriptions?"
   - Not just data display — actionable recommendations
   - Surface insights at decision points, not in reports

2. **Progressive Intelligence**
   - Novice users see simplified summaries with guided actions
   - Power users see detailed analytics and AI reasoning
   - The app adapts to user sophistication level

3. **Trust Through Transparency**
   - Show how insights are generated (e.g., "This recommendation is based on your 6-month spending pattern")
   - Explain anomalies ("Unusual charge detected: 200% above your normal streaming average")
   - Never make users wonder "why am I seeing this?"

4. **Emotional Calibration**
   - Positive reinforcement for good financial decisions
   - Gentle, non-alarmist alerts for issues
   - Celebrate milestones (subscription savings, goal achievements)

---

## 4. Information Architecture

### CycleMate
**IA Structure:**
```
Home (Live Tracking)
├── Quick Stats
├── Current Ride
├── Weather Widget
└── Start Ride CTA

Routes
├── Saved Routes
├── Discover New
└── Route Planner

Activity
├── Ride History
├── Achievements
└── Statistics

Profile
├── Settings
├── My Bike
└── Community
```

**Rationale:** Task-oriented — primary action (ride tracking) is always accessible.

### Pilo
**IA Structure:**
```
Home (Map View)
├── Current Location
├── Destination Input
├── Vehicle Options
└── Book Ride CTA

Your Rides
├── Active Ride
├── Scheduled
└── History

Profile
├── Payment
├── Preferences
└── Settings
```

**Rationale:** Single-focus — the map IS the home screen; destination input is the primary flow.

### PicksWise Adaptation

**Recommended IA for PicksWise:**

```
Home (Money Pulse Dashboard)
├── Quick Financial Health Score
├── Subscription Overview (This Month)
├── AI Insight of the Day
└── Action Card: Top Priority

Subscriptions (Shadow View)
├── Active List
├── Upcoming Renewals
├── Recent Changes
└── Add New CTA

Insights (Money Twin)
├── Spending Patterns
├── Optimization Opportunities
├── Predictions
└── AI Assistant Chat

Goals (Goal Launcher)
├── Active Goals
├── Progress Trackers
└── Achievements

Settings (Control Center)
├── Profile
├── Notifications
├── Connected Accounts
└── Preferences
```

**Key Differences from References:**
- **PicksWise uses tab navigation** (implemented in FloatingBottomNav v15.7) — appropriate for multi-feature apps
- **Home is a dashboard, not a list** — CycleMate's task-focused approach suits fitness; financial health requires overview-first
- **AI features are discoverable** — Pilo hides AI behind voice; PicksWise should make AI reasoning visible

---

## 5. Navigation Structure

### CycleMate
- **Type:** Tab bar (4 tabs) with nested stack navigation
- **Primary Tabs:** Home, Routes, Activity, Profile
- **Pattern:** Standard mobile pattern, familiar to all users
- **Strength:** Low cognitive load, always one tap to primary features

### Pilo
- **Type:** Map-centric single screen with bottom sheet navigation
- **Primary Pattern:** Map is constant context; destination input and ride options slide up
- **Pattern:** Progressive disclosure — start with minimal UI, expand as needed
- **Strength:** Reduced decision fatigue; user only sees relevant options

### PicksWise Adaptation

**Navigation Design (Based on v15.7 FloatingBottomNav):**

- **5-Tab Structure:** Home, Subscriptions, Insights, Goals, Settings
- **Pattern:** Persistent bottom navigation with floating pill design
- **Active State:** Triple-encoding (filled icon + pill bg + color change)

**Design Refinements for PicksWise:**

1. **Floating Pill is Correct** — matches Pilo's modern aesthetic and provides visual breathing room from content

2. **Tab Labels Should Reflect Decision Intelligence:**
   - "Home" → "Money Pulse" (reinforces dashboard metaphor)
   - "Subscriptions" → "Shadow" (reinforces tracking metaphor)
   - "Insights" → "Money Twin" (reinforces AI co-pilot metaphor)
   - "Goals" → "Launchpad" (reinforces achievement metaphor)
   - "Settings" → "Control Center" (reinforces control metaphor)

3. **Gesture Navigation:**
   - Swipe between tabs (like Instagram stories) for power users
   - Long-press tab for quick actions (e.g., long-press "Subscriptions" → "Add New")

---

## 6. User Flow

### CycleMate
**Primary Flow: Start Ride**
```
Open App → See Quick Stats → Tap "Start Ride" → Live Tracking Begins → View Real-time Metrics → End Ride → See Summary → Share/Compare
```

**Secondary Flows:**
- Plan Route → View Map → Save Favorite → Navigate
- View Activity → See History → Tap Achievement → Celebrate

**Flow Characteristics:**
- Linear and focused for primary action
- Discovery opportunities in secondary features
- Social layer adds accountability

### Pilo
**Primary Flow: Book Ride**
```
Open App → Map Shows → Enter Destination → See Options → Select Vehicle → Confirm Booking → Track Arrival → Ride Progress → Arrival → Rate Experience
```

**Flow Characteristics:**
- Minimal steps to booking (3 taps maximum)
- Every step shows system status and ETA
- "The ride is the product" — in-app experience mirrors real journey

### PicksWise Adaptation

**Primary Flows for PicksWise:**

**Flow 1: Monthly Subscription Review (Weekly)**
```
Open App → See Money Pulse (Health Score + AI Insight) → View "This Month's Subscriptions" → See Changes Since Last Week → Take Action (Cancel/Renew/Adjust) → Confirm → Done
```

**Flow 2: Goal Progress Check (Monthly)**
```
Open App → See Goal Launcher Widget → View Progress Toward Goal → See AI Prediction ("On track" or "Need adjustment") → View Recommendations → Take Action or Dismiss → Done
```

**Flow 3: New Subscription Discovery (Monthly)**
```
Open App → See AI Insight ("You might save X with alternative Y") → View Recommendation → Compare Options → Subscribe Through App → Tracked Automatically
```

**Flow Design Principles:**
- **Maximum 3 taps to any action** — match Pilo's frictionless approach
- **Context-aware defaults** — show the most likely next action
- **Undo-ability** — make every action reversible for confidence
- **Exit points** — users should feel they can stop anytime without losing progress

---

## 7. Screen Hierarchy

### CycleMate
**Home Screen Hierarchy:**
1. Hero: Current/Last Ride Stats (largest visual weight)
2. CTA: "Start Ride" button (prominent, inviting)
3. Quick Stats: Weekly summary cards
4. Weather Widget: Contextual info
5. Recent Activity: Scrollable list

**Design Approach:** Status-forward — what did I do recently? What should I do now?

### Pilo
**Home Screen Hierarchy:**
1. Hero: Map (dominates screen, provides context)
2. Primary Input: Destination search (floating, prominent)
3. Secondary: Vehicle selection (bottom sheet, appears on input)
4. Tertiary: Price and ETA (clear, comparative)

**Design Approach:** Context-forward — where am I going? What are my options? How much will it cost?

### PicksWise Adaptation

**Recommended Screen Hierarchy for PicksWise:**

**Home (Money Pulse) — Decision-First Layout:**
1. **Financial Health Score** (Hero) — single number that tells them their financial wellness status at a glance
2. **AI Insight Card** (Featured) — the one most important thing they should know today
3. **This Month's Subscriptions** (Key Data) — what they're spending, any anomalies
4. **Goal Progress Widget** (Progress) — visual progress toward primary goal
5. **Quick Actions** (CTA) — most likely next action based on context

**Hierarchy Principles:**
- **One hero metric per screen** — don't overwhelm with multiple big numbers
- **Progressive detail** — tap to expand, don't show everything initially
- **Action-oriented cards** — each card should suggest a decision or action

---

## 8. Layout System

### CycleMate
- **Base Grid:** 8px grid system
- **Spacing Scale:** 4, 8, 12, 16, 24, 32, 48px
- **Card Pattern:** Rounded corners (12px), subtle shadows, generous padding (16px)
- **Layout Rhythm:** Full-width cards stacked vertically with 12px gaps
- **Screen Density:** Medium — balances breathing room with information density

### Pilo
- **Base Grid:** 8px grid system
- **Spacing Scale:** 8, 16, 24, 32px
- **Card Pattern:** Minimal cards, large touch targets, generous whitespace
- **Layout Rhythm:** Content floats in space; map provides background context
- **Screen Density:** Low — lots of empty space, content feels premium

### PicksWise Adaptation

**Recommended Layout System:**

**Grid:**
- **Base Unit:** 4px
- **Standard Grid:** 8px
- **Component Spacing:** 8, 12, 16, 24, 32px
- **Screen Margins:** 16px (mobile), 24px (tablet)
- **Card Padding:** 16px standard, 12px compact

**Layout Patterns:**
1. **Dashboard Layout:** Hero card (full-width) → Secondary cards (2-column) → List items (full-width)
2. **Detail Layout:** Header (sticky) → Content (scrollable) → Action bar (sticky bottom)
3. **Comparison Layout:** Side-by-side cards with clear visual separation

**Visual Rhythm:**
- Hero elements get 24px+ spacing above
- Related items grouped with 8-12px gaps
- Section breaks use 16-24px whitespace (not dividers)

---

## 9. Visual Hierarchy

### CycleMate
**Hierarchy Elements:**
1. **Primary:** Current ride stats — large numbers, brand color accents
2. **Secondary:** Quick stats — medium size, neutral colors
3. **Tertiary:** Supporting info — smaller, muted

**Visual Weight Distribution:**
- Numbers dominate (metrics are the hero)
- Colors used to indicate status (green = good, orange = warning)
- Icons are secondary, support text

### Pilo
**Hierarchy Elements:**
1. **Primary:** Map (spatial context is paramount)
2. **Secondary:** Destination and vehicle selection
3. **Tertiary:** Price and ETA

**Visual Weight Distribution:**
- Location and movement dominate
- UI elements are minimal and float over the map
- Text is sparse, large, high-contrast

### PicksWise Adaptation

**Visual Hierarchy for Financial Data:**

**Principle 1: Number Size = Importance**
- Large numbers for totals (what you spent, what you saved)
- Medium numbers for comparisons (vs. last month)
- Small numbers for context (percentage, trend arrow)

**Principle 2: Color = Signal, Not Decoration**
- Lime (#CDFF24): Brand emphasis, positive highlights, CTAs
- Green: Success, savings achieved, goals met
- Red: Alerts, overspending, issues requiring attention
- Gray: Neutral information, inactive states

**Principle 3: Hierarchy Layers**
1. **Surface Level:** The one number/metric that matters most right now
2. **Context Level:** Supporting details that explain the surface level
3. **Deep Level:** Detailed data available on demand (tap to expand)

**Typography Hierarchy:**
- Display: 32-40px (Hero metrics)
- Heading: 20-24px (Section titles)
- Body: 16px (Card content)
- Caption: 12-14px (Supporting info)
- Micro: 10-11px (Labels, timestamps)

---

## 10. Grid & Spacing System

### CycleMate
- **Grid:** 8px base
- **Component Spacing:** 12px internal, 16px external
- **Card Margins:** 16px horizontal
- **List Item Spacing:** 12px between items
- **Touch Targets:** Minimum 44px

### Pilo
- **Grid:** 8px base
- **Component Spacing:** 16px standard, 24px generous
- **Card Margins:** Minimal — content often bleeds to edges on map
- **Touch Targets:** Large (48-56px for primary actions)
- **Whitespace:** Generous — every element has room to breathe

### PicksWise Adaptation

**Recommended Grid & Spacing:**

**Grid System:**
```
4px  — Micro spacing (icon padding, tight lists)
8px  — Standard spacing (between related elements)
12px — Comfortable spacing (list items, small gaps)
16px — Standard margins and card padding
24px — Section spacing (between major sections)
32px — Screen margins (on larger screens)
```

**Component Spacing:**
```
Inside Components:
- Icon to label: 4-8px
- Label to value: 4px
- Internal padding: 12-16px

Between Components:
- Card gap: 12px (compact) / 16px (standard)
- Section gap: 24px
- Screen edge: 16px
```

**Touch Target Compliance:**
- Minimum: 44px × 44px (Apple HIG)
- Recommended: 48px × 48px (premium feel)
- Primary CTAs: 56px height

---

## 11. Typography

### CycleMate
- **Primary Font:** Sans-serif (system fonts for performance)
- **Heading Weight:** Semi-bold (600)
- **Body Weight:** Regular (400)
- **Number Style:** Tabular figures for alignment
- **Line Height:** 1.4-1.5 for readability
- **Size Scale:** 12, 14, 16, 20, 24, 32px

### Pilo
- **Primary Font:** Geometric sans-serif (futuristic but readable)
- **Heading Weight:** Bold (700)
- **Body Weight:** Regular (400)
- **Number Style:** Large, bold for key metrics
- **Line Height:** 1.3-1.4 (tighter for UI density)
- **Size Scale:** 14, 16, 18, 24, 32, 48px

### PicksWise Adaptation

**Typography System for PicksWise:**

**Font Selection:**
- **Primary (UI):** Space Grotesk (English) + Kanit (Thai)
- **Numeric Display:** DM Mono or Space Grotesk (tabular figures essential)
- **System Fallback:** system-ui, -apple-system, sans-serif

**Type Scale:**
```
Display:    32-40px / 700 weight / -0.5px tracking
Heading 1:  24px / 600 weight / 0 tracking
Heading 2:  20px / 600 weight / 0 tracking
Heading 3:  18px / 500 weight / 0 tracking
Body:       16px / 400 weight / 0 tracking
Caption:    14px / 400 weight / 0.1px tracking
Label:      12px / 500 weight / 0.5px tracking
Micro:      10-11px / 500 weight / 0.5px tracking
```

**Financial Data Typography:**
- **Key Metrics:** Display size, tabular figures, lime accent
- **Comparisons:** Body size, color-coded (green/red)
- **Labels:** Caption size, muted gray
- **Timestamps:** Micro size, ultra-muted

---

## 12. Color System

### CycleMate
**Palette:**
- Primary: Green (#22C55E) — growth, nature, wellness
- Secondary: Blue (#3B82F6) — technology, trust
- Background: White (#FFFFFF)
- Surface: Light gray (#F5F5F5)
- Text Primary: Dark gray (#1F2937)
- Text Secondary: Medium gray (#6B7280)
- Accent: Orange (#F59E0B) — alerts, achievements

**Usage Pattern:**
- Green for positive metrics and achievements
- Orange for warnings and attention items
- White/gray backgrounds for content separation

### Pilo
**Palette:**
- Primary: Electric blue (#0066FF) — bold, autonomous, futuristic
- Secondary: Dark navy (#0A0F1E) — depth, premium
- Background: Near-black (#0F1117)
- Surface: Dark gray (#1A1D29)
- Text: White (#FFFFFF) and light gray (#A0A0A0)
- Accent: Cyan (#00D4FF) — futuristic highlights

**Usage Pattern:**
- High contrast for readability on dark backgrounds
- Single bold color for brand recognition
- Minimal color palette (dark + one accent)

### PicksWise Adaptation

**PicksWise Color System (Dark Theme):**

**Background Layers:**
```
Canvas:     #0B0F0A (deepest background)
Surface 1:  #171C15 (cards, elevated surfaces)
Surface 2:  #1E241C (modals, overlays)
Surface 3:  #252D23 (hover states, active surfaces)
```

**Brand Colors:**
```
Primary:    #CDFF24 (lime — brand anchor, CTAs, highlights)
Primary Muted:   rgba(205, 255, 36, 0.15) (subtle backgrounds)
Primary Glow:    rgba(205, 255, 36, 0.3) (glows, shadows)
```

**Semantic Colors:**
```
Success:    #34D399 (green — achievements, savings)
Warning:    #FBBF24 (amber — attention needed)
Error:      #F87171 (red — critical alerts, overspending)
Info:       #60A5FA (blue — informational, neutral)
```

**Text Colors:**
```
Text Primary:   #FFFFFF (headings, important numbers)
Text Secondary: #A0A9A0 (body text, descriptions)
Text Tertiary:  #5C665C (labels, timestamps)
Text Disabled:  #3D443D (disabled states)
```

**Interactive States:**
```
Default:    Inherit from element
Hover:      +10% lightness
Active:     +Primary glow border
Pressed:    -5% lightness, scale(0.98)
Disabled:   Text Tertiary, no interaction
```

**Color Usage Rules:**
1. **Primary Lime only for:**
   - Brand moments (logo, splash)
   - Primary CTAs
   - Active states (current tab, selected item)
   - Key metric highlights

2. **Semantic colors for:**
   - Status indicators (savings, alerts)
   - Trend arrows (up = green, down = red)
   - Error states

3. **Never use color alone for meaning** — always pair with icon or text

---

## 13. Iconography

### CycleMate
- **Style:** Rounded line icons, consistent 2px stroke
- **Sizing:** 20-24px standard, 32px featured
- **Color:** Single color (inherit from text color)
- **Library:** Custom icons with fitness/sports metaphors

### Pilo
- **Style:** Minimal line icons, geometric, sharp
- **Sizing:** 24px standard, 32px for primary actions
- **Color:** White on dark backgrounds
- **Library:** Custom icon system with autonomous vehicle metaphors

### PicksWise Adaptation

**Icon System for PicksWise:**

**Style Guidelines:**
- **Type:** Rounded line icons (friendly but professional)
- **Stroke Weight:** 2px (consistent across all icons)
- **Corner Radius:** Rounded (2-3px) — matches brand's modern feel
- **Size Scale:** 16px (inline), 20px (standard), 24px (featured)
- **Color:** Inherits from text color (single-color icons)

**Icon Families:**
1. **Navigation Icons:** Home, Wallet, Sparkles (AI), Target, Settings
2. **Action Icons:** Plus, Minus, Edit, Trash, Share, External Link
3. **Status Icons:** Check, Alert, Info, Trend Up/Down, Calendar
4. **Category Icons:** Entertainment, Utilities, Software, Food, Transport

**Accessibility:**
- All icons must have aria-labels or accompanying text
- Minimum contrast ratio: 3:1 against background
- Touch targets: 44px minimum

---

## 14. Card Design

### CycleMate
**Card Characteristics:**
- Rounded corners: 12px
- Background: White with subtle shadow
- Padding: 16px internal
- Border: None
- Shadow: Subtle drop shadow (0 2px 8px rgba(0,0,0,0.08))

**Card Types:**
1. **Stat Card:** Number + label + trend indicator
2. **Action Card:** Primary CTA with icon
3. **List Card:** Grouped items with dividers
4. **Media Card:** Image + overlay text

### Pilo
**Card Characteristics:**
- Rounded corners: 16-24px (generous)
- Background: Surface color (slightly elevated from canvas)
- Padding: 20-24px internal
- Border: Optional subtle border
- Shadow: Minimal or none (relies on background separation)

**Card Types:**
1. **Map Card:** Transparent, floats over map
2. **Option Card:** Vehicle selection with specs
3. **Price Card:** Large number + comparison
4. **Status Card:** Real-time tracking info

### PicksWise Adaptation

**Card System for PicksWise (Dark Theme):**

**Card Variants:**

**1. Metric Card (Hero)**
```
┌─────────────────────────────────┐
│  Financial Health Score         │  ← Label (Caption, muted)
│                                 │
│         87                      │  ← Value (Display, primary lime)
│         +5 this month           │  ← Comparison (Body, green)
│                                 │
│  ▓▓▓▓▓▓▓▓▓▓░░░░░░░░░         │  ← Progress bar (subtle)
└─────────────────────────────────┘
```
- Corner radius: 16px
- Background: Surface 1
- Padding: 20px
- Border: 1px Surface 2 (subtle separation)

**2. Subscription Card**
```
┌─────────────────────────────────┐
│  [Icon]  Netflix               │  ← Icon + Title
│          399 THB/month         │  ← Price (Body, white)
│          Renews in 5 days       │  ← Status (Caption, warning color)
│                         [→]    │  ← Action
└─────────────────────────────────┘
```
- Corner radius: 12px
- Background: Surface 1
- Padding: 16px
- Left border: 3px (category color)

**3. AI Insight Card**
```
┌─────────────────────────────────┐
│  💡 Money Twin Insight         │  ← Header (Label, lime)
│                                 │
│  You could save 1,200 THB/year  │  ← Value prop (Heading 2, white)
│  by switching to annual plans   │  ← Explanation (Body, secondary)
│                                 │
│  [View Options]  [Dismiss]     │  ← Actions (Text buttons)
└─────────────────────────────────┘
```
- Corner radius: 16px
- Background: Surface 2 with lime border
- Padding: 20px
- Border: 1px Primary Muted

**4. Goal Progress Card**
```
┌─────────────────────────────────┐
│  Vacation Fund                 │  ← Goal name
│                                 │
│  8,500 / 20,000 THB            │  ← Progress
│  [████████░░░░░░░░░░░] 42%    │  ← Visual progress
│                                 │
│  On track to reach by Dec 2026 │  ← AI prediction (Caption, success)
└─────────────────────────────────┘
```
- Corner radius: 16px
- Background: Surface 1
- Progress fill: Primary lime
- Padding: 16px

---

## 15. Component Library

### CycleMate
**Component Set:**
- Buttons (primary, secondary, ghost)
- Input fields (text, search)
- Cards (stat, list, action)
- Lists (simple, grouped)
- Tabs (underline, pill)
- Toggle switches
- Progress indicators
- Avatar components

**Component Characteristics:**
- Consistent 12px border radius
- Shadow-based elevation
- Generous padding
- Clear state variations

### Pilo
**Component Set:**
- Buttons (large, prominent)
- Bottom sheets (slides up, dismissible)
- Map controls (floating, minimal)
- Status indicators (dots, progress)
- Cards (transparent, floating)
- Input fields (minimal border)

**Component Characteristics:**
- Large touch targets (48-56px)
- Generous spacing
- Dark mode native
- Floating, layered UI

### PicksWise Adaptation

**PicksWise Component Library Structure:**

**1. Buttons**
```
Primary Button
├── Default: Lime bg, dark text
├── Hover: +10% brightness
├── Active: scale(0.98)
├── Loading: Spinner + "Processing..."
└── Disabled: 50% opacity

Secondary Button
├── Default: Surface 2 bg, white text
├── Hover: Surface 3 bg
├── Active: scale(0.98)
└── Disabled: Text disabled color

Ghost Button
├── Default: Transparent bg, primary text
├── Hover: Primary muted bg
├── Active: Primary glow border
└── Disabled: Text disabled color
```

**2. Input Fields**
```
Text Input
├── Default: Surface 1 bg, Surface 2 border
├── Focus: Primary border, subtle glow
├── Error: Error border, error message below
├── Disabled: Surface 2 bg, disabled text
└── With icon: Icon left-aligned, 40px padding
```

**3. Cards**
```
Standard Card
├── Default: Surface 1 bg, 1px Surface 2 border
├── Hover: Surface 2 bg (interactive cards only)
└── Selected: Primary border

Elevated Card
├── Default: Surface 2 bg, shadow
└── Used for: Modals, overlays
```

**4. Navigation**
```
Tab Bar (see v15.7 FloatingBottomNav)
├── Pill design with 5 tabs
├── Active: Triple-encoding (filled icon + pill + color)
├── Inactive: Outline icon + muted text
└── Avatar: Circular profile image
```

---

## 16. Design System

### CycleMate
**System Characteristics:**
- Color tokens (primary, secondary, neutral)
- Typography scale (heading, body, caption)
- Spacing tokens (xs, sm, md, lg, xl)
- Border radius tokens (sm, md, lg, full)
- Shadow tokens (sm, md, lg)
- Component variants (default, hover, active, disabled)

### Pilo
**System Characteristics:**
- Dark-first color system
- Large spacing scale
- Generous border radius
- Minimal shadows (relies on color)
- Single primary color + neutrals
- Component states (focus, hover, active)

### PicksWise Adaptation

**PicksWise Design System Architecture:**

**1. Token Layers**
```
Primitive Tokens (Raw values)
├── Colors: #CDFF24, #0B0F0A, etc.
├── Sizes: 4, 8, 12, 16, 24, 32, 48px
├── Radii: 4, 8, 12, 16, 24, 9999px
└── Shadows: Multiple levels

Semantic Tokens (Meaning-based)
├── Background: canvas, surface-1, surface-2, surface-3
├── Brand: primary, primary-muted, primary-glow
├── Text: text-primary, text-secondary, text-tertiary
├── Interactive: hover, active, disabled
└── Feedback: success, warning, error, info

Component Tokens (Component-specific)
├── button-bg: primary
├── card-bg: surface-1
├── nav-active: primary
└── input-border: surface-2
```

**2. Naming Convention**
- **Pattern:** `{property}-{variant}-{state}`
- **Examples:**
  - `color-text-primary`
  - `size-spacing-md`
  - `radius-card-lg`
  - `shadow-card-default`

**3. Implementation**
- CSS custom properties for web
- Style dictionary for cross-platform
- Component library documentation

---

## 17. Interaction Design

### CycleMate
**Key Interactions:**
1. **Ride Start:** Large button tap → immediate response with haptic
2. **Stats Update:** Real-time number animation (counting up)
3. **Achievement Unlock:** Celebration animation + confetti
4. **Route Planning:** Map drag → zoom, tap → pin drop
5. **Swipe Actions:** Swipe on list items for quick actions

**Interaction Principles:**
- Immediate feedback (haptics, animations)
- Celebratory moments for achievements
- Gesture-based shortcuts for power users

### Pilo
**Key Interactions:**
1. **Destination Input:** Auto-complete with recent locations
2. **Vehicle Selection:** Bottom sheet slides up with options
3. **Ride Tracking:** Map follows vehicle with smooth animation
4. **Voice Booking:** Wake word → speech → confirmation
5. **Rating:** Star tap with emoji feedback

**Interaction Principles:**
- Minimal taps to complete action
- Predictive next steps
- Trust-building transparency at every step

### PicksWise Adaptation

**Interaction Principles for PicksWise:**

**1. Decision-Prompting Interactions**
- Dashboard cards pulse subtly when they need attention
- AI insights appear with gentle entrance animation (not jarring)
- Swipe on subscription card: left to snooze, right to take action

**2. Financial Data Interactions**
- Tap on metric → expand to show breakdown
- Long-press on number → copy value
- Pull-to-refresh → update all data with subtle loading state
- Swipe between time periods (week/month/year)

**3. Action-Oriented Interactions**
- Primary CTA always visible and prominent
- Confirmation for destructive actions (cancel subscription)
- Undo capability for reversible actions
- Progress indicators for async actions (adding subscription)

**4. Gesture Navigation**
- Swipe left/right between main tabs
- Swipe down to dismiss modals
- Pull down for quick search
- Long-press for context menus

---

## 18. Motion Design

### CycleMate
**Motion Principles:**
- **Energy:** Animations reflect the activity (cycling = movement, speed)
- **Celebration:** Achievements trigger particle effects
- **Progress:** Numbers count up/down with easing
- **Rhythm:** Consistent timing (300ms standard, 150ms micro)

**Key Animations:**
- Ride tracking: Real-time line drawing on map
- Achievement unlock: Burst + confetti
- Stats update: Number rolling animation
- Screen transitions: Shared element transitions

### Pilo
**Motion Principles:**
- **Confidence:** Smooth, predictable movements
- **Futuristic:** Subtle floating/pulsing elements
- **Seamless:** No jarring transitions
- **Rhythm:** Longer durations (400-600ms) for premium feel

**Key Animations:**
- Vehicle arrival: Smooth map following
- Bottom sheet: Spring physics slide up
- Status updates: Crossfade between states
- Loading: Pulsing dots or skeleton screens

### PicksWise Adaptation

**Motion System for PicksWise:**

**Motion Philosophy:** "Calm Confidence" — animations should feel smooth, predictable, and reassuring. Financial data is serious; motion should not distract but should confirm actions.

**Timing Tokens:**
```
Micro:      100ms  (hover, focus)
Standard:   200ms  (state changes, reveals)
Complex:    300ms  (page transitions, modals)
Extended:   400ms  (celebrations, major reveals)
```

**Easing Tokens:**
```
Default:    cubic-bezier(0.25, 0.1, 0.25, 1) — smooth and natural
Enter:      cubic-bezier(0, 0, 0.2, 1) — decelerate in
Exit:       cubic-bezier(0.4, 0, 1, 1) — accelerate out
Bounce:     cubic-bezier(0.34, 1.56, 0.64, 1) — subtle spring
```

**Key Animations:**

**1. Page Transitions**
- Fade + subtle slide (200ms)
- Tab switch: Crossfade with layout animation

**2. Card Animations**
- Enter: Fade up + scale from 0.95 to 1 (200ms)
- Exit: Fade down + scale to 0.95 (150ms)
- Reorder: Smooth layout shift (300ms)

**3. Data Animations**
- Number changes: Count up/down animation (400ms)
- Progress bars: Fill animation (300ms)
- Charts: Draw-in animation (600ms)

**4. Feedback Animations**
- Button tap: Scale to 0.98 (100ms)
- Success: Check mark draw + pulse (300ms)
- Error: Subtle shake (200ms)
- Loading: Skeleton shimmer (continuous)

**5. Celebration Animations (for goals/achievements)**
- Confetti burst (limited to important moments)
- Achievement badge pulse + glow
- Milestone banner slide in

---

## 19. Micro-interactions

### CycleMate
**Notable Micro-interactions:**
1. **Start Ride Button:** Pulses gently to invite tap
2. **Achievement Badge:** Bounces when unlocked
3. **Weather Widget:** Animates weather icons
4. **Progress Circle:** Fills with animation
5. **Swipe to Delete:** Reveals red delete zone

### Pilo
**Notable Micro-interactions:**
1. **Vehicle Selection:** Cards lift on hover/tap
2. **Price Update:** Numbers morph smoothly
3. **ETA Countdown:** Real-time tick animation
4. **Map Zoom:** Smooth pinch/pan
5. **Bottom Sheet:** Spring physics drag

### PicksWise Adaptation

**Micro-interactions for PicksWise:**

**1. Dashboard**
- Health Score: Pulses subtly when score changes
- AI Insight: Gentle glow on arrival
- Metric cards: Lift slightly on tap to invite interaction

**2. Subscription List**
- Swipe left: Reveals snooze action (gray)
- Swipe right: Reveals take action (lime)
- Add new: Plus button rotates 45° on tap
- Delete: Confirm with shake animation

**3. Goal Progress**
- Progress ring: Animates on screen entry
- Milestone reached: Burst of particles + sound (optional)
- Prediction text: Types in character by character

**4. Input Fields**
- Focus: Border color transition + subtle glow
- Valid: Green check appears with pop
- Invalid: Red border + shake + error message slides in

**5. Buttons**
- Hover: Background lightens
- Tap: Scale down + haptic feedback
- Loading: Text fades, spinner appears
- Success: Check replaces spinner

---

## 20. Animation Principles

### CycleMate
- **Purpose:** Motivation and feedback
- **Style:** Energetic, celebratory
- **Frequency:** High — every action has feedback
- **Performance:** Optimized for smooth 60fps

### Pilo
- **Purpose:** Trust and confidence
- **Style:** Smooth, predictable, premium
- **Frequency:** Moderate — only meaningful transitions
- **Performance:** GPU-accelerated for fluid motion

### PicksWise Adaptation

**Animation Principles for PicksWise:**

**1. Purpose-Driven Animation**
Every animation must serve a purpose:
- **Orient** — Where am I? What changed?
- **Feedback** — Did my action work?
- **Explain** — What does this mean?
- **Delight** — This is a premium experience

**2. Respect Cognitive Load**
- Don't animate everything — only meaningful changes
- Financial data should stabilize (numbers stop moving when you're reading)
- Use animation to reduce uncertainty, not add noise

**3. Performance First**
- Use `transform` and `opacity` only (GPU-accelerated)
- Avoid animating `width`, `height`, `top`, `left`
- Target 60fps always
- Use `will-change` hints for complex animations

**4. Accessibility**
- Respect `prefers-reduced-motion`
- Provide non-animated alternatives
- Don't rely on animation alone for meaning

**5. Context-Sensitive Timing**
- Fast (150ms) for micro-interactions
- Medium (250ms) for state changes
- Slow (400ms) for page transitions
- Never block user interaction for animation

---

## 21. Empty States

### CycleMate
**Empty States:**
1. **No Rides:** Illustration of cyclist + "Start your first ride!" + CTA
2. **No Routes:** Map illustration + "Plan your first route"
3. **No Achievements:** Locked badge grid + "Keep cycling to unlock"

**Design Approach:** Motivational — show what they can achieve

### Pilo
**Empty States:**
1. **No Active Ride:** Map with prompt "Where to?" + destination input
2. **No History:** Clean message + illustration of empty road
3. **No Payment:** "Add payment method" with icon

**Design Approach:** Directive — tell them what to do next

### PicksWise Adaptation

**Empty States for PicksWise:**

**1. No Subscriptions**
```
┌─────────────────────────────────┐
│                                 │
│      [Wallet Icon - large]     │
│                                 │
│   You have no active           │
│   subscriptions yet            │
│                                 │
│   Add your first subscription   │
│   to start tracking your       │
│   spending                     │
│                                 │
│   [+ Add Subscription]         │
│                                 │
└─────────────────────────────────┘
```
- Illustration: Animated wallet with sparkles
- Tone: Encouraging, not accusatory
- CTA: Primary button

**2. No Goals**
```
┌─────────────────────────────────┐
│                                 │
│      [Target Icon - large]     │
│                                 │
│   Set your first savings goal   │
│                                 │
│   Track progress and get        │
│   AI-powered suggestions        │
│                                 │
│   [+ Create Goal]               │
│                                 │
└─────────────────────────────────┘
```
- Tone: Aspirational
- CTA: Primary button

**3. No AI Insights Available**
```
┌─────────────────────────────────┐
│                                 │
│   Your finances look great!     │
│                                 │
│   No new insights right now.    │
│   Check back after your next    │
│   billing cycle.                │
│                                 │
│   [↻ Refresh]                   │
│                                 │
└─────────────────────────────────┘
```
- Tone: Positive, not empty
- Show some value even in empty state

---

## 22. Loading States

### CycleMate
**Loading Patterns:**
1. **Skeleton screens** for lists and cards
2. **Spinner** for actions (starting ride)
3. **Progress bar** for uploads/downloads
4. **Shimmer animation** for content loading

### Pilo
**Loading Patterns:**
1. **Map with pulsing current location** while calculating
2. **Minimal spinner** in buttons during action
3. **Skeleton cards** for ride options
4. **Dots animation** for ETA calculation

### PicksWise Adaptation

**Loading States for PicksWise:**

**1. Initial Load (App Launch)**
- Branded splash screen with logo
- 2-3 second max, then show cached data
- Skeleton UI for main content

**2. Dashboard Load**
```
┌─────────────────────────────────┐
│  ████████  Financial Health    │  ← Skeleton shimmer
│                                 │
│  ████████████████              │  ← Skeleton
│                                 │
│  ┌──────────┐  ┌──────────┐   │
│  │ ████████ │  │ ████████ │   │  ← Card skeletons
│  └──────────┘  └──────────┘   │
│                                 │
│  ████████████████████████████  │  ← List skeleton
└─────────────────────────────────┘
```

**3. Action Loading (e.g., Adding Subscription)**
- Button shows spinner + "Adding..."
- Disable form inputs
- Success → checkmark animation → redirect

**4. Pull-to-Refresh**
- Lime-colored spinner
- "Updating..." text
- Haptic feedback on release

**5. Infinite Scroll**
- Show 3 skeleton cards at bottom
- Stop when all loaded
- "You've seen it all" message

---

## 23. Error States

### CycleMate
**Error Patterns:**
1. **Network Error:** Retry button + illustration
2. **Location Error:** Prompt to enable location
3. **Sync Error:** "Sync failed" with retry

### Pilo
**Error Patterns:**
1. **Booking Failed:** "Something went wrong" + retry option
2. **Payment Error:** Clear error message + payment retry
3. **Network Error:** "Connection lost" with auto-retry

### PicksWise Adaptation

**Error States for PicksWise:**

**1. Network Error**
```
┌─────────────────────────────────┐
│                                 │
│   [Wifi Icon - error state]     │
│                                 │
│   Connection lost               │
│                                 │
│   Check your internet and       │
│   try again                    │
│                                 │
│   [↻ Try Again]                │
│                                 │
│   Your data is saved locally    │
│   and will sync when online     │
│                                 │
└─────────────────────────────────┘
```
- Tone: Helpful, not alarming
- Show that data is safe
- Clear CTA

**2. Subscription Add Failed**
```
┌─────────────────────────────────┐
│   Couldn't add subscription     │
│                                 │
│   This might be a temporary     │
│   issue. Your data wasn't saved.│
│                                 │
│   [Try Again]  [Cancel]         │
└─────────────────────────────────┘
```
- Tone: Honest about what happened
- No data loss reassurance

**3. API Error (Generic)**
```
┌─────────────────────────────────┐
│   Something went wrong          │
│                                 │
│   We're looking into it.        │
│   Please try again in a moment. │
│                                 │
│   [↻ Refresh]                  │
└─────────────────────────────────┘
```
- Tone: Professional, apologetic
- Don't blame user

**4. Validation Error (Form)**
```
┌─────────────────────────────────┐
│  Name                           │
│  ┌───────────────────────────┐  │
│  │ Netflix                   │  │  ← Input with error
│  └───────────────────────────┘  │
│  ⚠ This subscription already   │
│    exists in your list          │
└─────────────────────────────────┘
```
- Inline error below field
- Shake animation
- Clear guidance

---

## 24. Accessibility

### CycleMate
**Accessibility Features:**
- High contrast mode support
- VoiceOver/TalkBack labels
- Dynamic type support
- Minimum touch targets (44px)

### Pilo
**Accessibility Features:**
- Voice control for booking
- Large text mode support
- High contrast UI elements
- Clear focus indicators

### PicksWise Adaptation

**Accessibility Requirements for PicksWise:**

**1. Color Contrast**
- All text meets WCAG AA (4.5:1 for body, 3:1 for large text)
- Interactive elements have 3:1 contrast minimum
- Don't rely on color alone for meaning

**2. Touch Targets**
- Minimum 44px × 44px (Apple HIG)
- Recommended 48px × 48px for primary actions
- Adequate spacing between targets (8px minimum)

**3. Screen Reader Support**
- All icons have `aria-label`
- Images have descriptive alt text
- Decorative elements marked as `aria-hidden`
- Proper heading hierarchy (h1 → h2 → h3)

**4. Motion & Animation**
- Respect `prefers-reduced-motion`
- Provide pause control for auto-playing animations
- Don't use flashing animations

**5. Text Scaling**
- Support up to 200% text size
- Layout adapts without horizontal scrolling
- Test with system font sizes

**6. Keyboard Navigation**
- Logical tab order
- Visible focus indicators
- Skip links for long content

---

## 25. Premium Experience

### CycleMate
**Premium Elements:**
- Achievement badges with unlock animations
- Personal records highlighted
- Statistics with beautiful data visualization
- Community comparison features

### Pilo
**Premium Elements:**
- Clean, bold interface
- Smooth animations throughout
- High-quality vehicle renders
- Polished micro-interactions

### PicksWise Adaptation

**Premium Experience Elements for PicksWise:**

**1. Design Quality**
- Consistent spacing and typography
- Thoughtful motion design
- High-quality iconography
- Polished micro-interactions

**2. Perceived Value**
- AI insights feel like personalized advice
- Progress tracking feels rewarding
- Data visualization is beautiful and clear
- Empty states show care

**3. Performance**
- Instant feedback on all interactions
- Smooth 60fps animations
- Fast load times
- Offline capability

**4. Trust Signals**
- Security badges and explanations
- Clear privacy policies
- Transparent pricing (no hidden fees)
- Responsive customer support access

**5. Delightful Details**
- Haptic feedback on important actions
- Celebratory animations for milestones
- Thoughtful empty states
- Personalization that feels helpful, not creepy

---

## 26. Emotional Design

### CycleMate
**Emotional Triggers:**
- Achievement celebrations (dopamine hits)
- Progress visualization (satisfaction)
- Community comparison (social proof)
- Weather-aware suggestions (caring)

### Pilo
**Emotional Design:**
- Trust-building at every step
- No surprises (confidence)
- Futuristic but warm
- "The ride is the product" (presence)

### PicksWise Adaptation

**Emotional Design for PicksWise:**

**1. Financial Confidence**
- Show users their financial health clearly
- Celebrate savings achievements
- Make complex data feel manageable
- Reduce money anxiety

**2. Progress Motivation**
- Visual progress toward goals
- Milestone celebrations
- AI predictions that show hope ("You're on track!")
- Positive framing of insights

**3. Empowerment Through Clarity**
- Turn data into decisions
- Make the complex simple
- Give users agency
- Show them they're in control

**4. Reassurance Through Transparency**
- Explain AI recommendations
- Show data sources
- Make algorithms feel explainable
- Never hide what the app is doing

**5. Positive Framing**
- "You saved X this month!" not "You spent Y"
- "Opportunity found" not "Problem detected"
- "Almost there!" not "You're behind"

---

## 27. Gamification (If Applicable)

### CycleMate
**Gamification Elements:**
- Achievement badges with tiers (Bronze, Silver, Gold)
- Streak tracking (days active)
- Personal records (fastest ride, longest distance)
- Level system (Beginner → Expert)
- Leaderboards (social comparison)

### Pilo
**Gamification Elements:**
- None apparent — focused on functional trust

### PicksWise Adaptation

**Gamification for PicksWise (Optional):**

**Recommended Elements:**
1. **Savings Achievements**
   - "First 1,000 THB saved"
   - "6 months of tracking"
   - "Canceled a subscription in time"

2. **Streaks**
   - Weekly check-in streak
   - Monthly review streak
   - Streak protection (skip days)

3. **Progress Levels**
   - Novice → Tracker → Optimizer → Master
   - Unlocks features or insights at each level

4. **Milestones**
   - Visual celebrations when goals are reached
   - Shareable achievement cards
   - Progress summaries

**Important:** Gamification should enhance, not distract. In fintech, too much gamification can feel inappropriate or manipulative. Use sparingly and always with genuine value.

---

## 28. Onboarding Experience

### CycleMate
**Onboarding:**
1. Welcome screen with app value proposition
2. Profile setup (name, fitness level)
3. Bike registration (optional)
4. Permission requests (location, notifications)
5. First ride tutorial

### Pilo
**Onboarding:**
1. App purpose (what it is, what it isn't)
2. Phone number verification
3. Payment method setup
4. Destination tutorial
5. First ride offer

### PicksWise Adaptation

**Onboarding for PicksWise:**

**Step 1: Value Proposition**
```
┌─────────────────────────────────┐
│                                 │
│   [App Logo]                    │
│                                 │
│   Your subscription spending,    │
│   finally under control         │
│                                 │
│   Track. Optimize. Save.        │
│                                 │
│   [Get Started]                 │
│                                 │
└─────────────────────────────────┘
```

**Step 2: Core Features Overview**
```
┌─────────────────────────────────┐
│                                 │
│   [Feature illustrations]        │
│                                 │
│   Track all subscriptions       │
│   → See everything in one place│
│                                 │
│   Get smart insights            │
│   → AI finds savings for you   │
│                                 │
│   Reach your goals             │
│   → Save for what matters      │
│                                 │
│   [Continue]                    │
│                                 │
└─────────────────────────────────┘
```

**Step 3: First Subscription**
```
┌─────────────────────────────────┐
│                                 │
│   Add your first subscription   │
│                                 │
│   [Netflix] [Spotify] [Disney+] │
│   [Gym] [Phone] [Internet]     │
│                                 │
│   Or [Search manually]          │
│                                 │
└─────────────────────────────────┘
```

**Step 4: Set One Goal (Optional)**
```
┌─────────────────────────────────┐
│                                 │
│   Set your first savings goal   │
│                                 │
│   [Vacation] [New Phone]        │
│   [Emergency Fund] [Other]      │
│                                 │
│   Target: [    ] THB            │
│   By: [    ]                     │
│                                 │
│   [Skip for now]                │
│                                 │
└─────────────────────────────────┘
```

**Step 5: Notifications Permission**
```
┌─────────────────────────────────┐
│                                 │
│   [Bell Icon]                   │
│                                 │
│   Stay on top of your spending  │
│                                 │
│   Get reminded before           │
│   subscriptions renew           │
│                                 │
│   [Enable Notifications]        │
│   [Maybe later]                 │
│                                 │
└─────────────────────────────────┘
```

---

## 29. Dashboard Strategy

### CycleMate
**Dashboard Focus:**
- Current/Last ride stats (hero)
- Quick action (Start Ride)
- Weekly summary
- Weather context

### Pilo
**Dashboard Focus:**
- Map (location context)
- Destination input (primary action)
- Ride options (when destination entered)

### PicksWise Adaptation

**PicksWise Dashboard Strategy: "Money Pulse"**

**Philosophy:** The dashboard is the product's heart. It must answer: "What do I need to know/do about my money right now?"

**Dashboard Layout (Top to Bottom):**

**1. Financial Health Score (Hero)**
- Single number (0-100) representing overall financial wellness
- Comparison to last period (↑ or ↓)
- Tap to see breakdown

**2. AI Insight of the Day**
- Most important thing the user should know/do today
- Actionable recommendation
- Dismiss or explore

**3. This Month's Overview**
- Total subscription spending
- Comparison to last month
- Alert if unusual activity

**4. Upcoming Renewals**
- Next 3 renewals with dates
- Days until renewal
- Quick action to review

**5. Goal Progress Widget**
- Primary goal progress
- AI prediction (on track?)
- Tap to see all goals

**6. Quick Actions**
- Add subscription
- Review spending
- Contact support

**Progressive Disclosure:**
- Default: Above fold shows just health score + AI insight
- Expanded: Pull down to see full dashboard
- Detail: Tap any card for full information

---

## 30. UX Patterns That Stand Out

### CycleMate
**Outstanding Patterns:**
1. **Real-time tracking** with live metrics creates engagement
2. **Achievement system** with unlock animations drives retention
3. **Weather integration** shows contextual care
4. **Social features** add accountability

### Pilo
**Outstanding Patterns:**
1. **Map-centric interface** makes location feel central
2. **Bottom sheet pattern** keeps context while showing details
3. **Trust-building transparency** at every step
4. **Voice AI booking** demonstrates cutting-edge but accessible

### PicksWise Adaptation

**Outstanding Patterns for PicksWise:**

1. **Health Score Pattern** (from finance apps)
   - Single number that summarizes complex data
   - Sets emotional tone for the session
   - Creates goal to improve

2. **AI Insight Cards** (distinctive for PicksWise)
   - Visible AI reasoning, not just recommendations
   - "Based on your..." explanation
   - Actionable next steps

3. **Floating Pill Navigation** (v15.7)
   - Modern, premium aesthetic
   - Triple-encoding active state
   - Smooth animations

4. **Swipe Actions on Lists**
   - Left: Snooze/ignore
   - Right: Take action
   - Gesture-based efficiency

5. **Goal Progress Visualization**
   - Visual progress toward milestones
   - AI predictions for timeline
   - Celebration on achievement

---

# Part B: Summary & Recommendations

## Section 1: Strengths of Each Reference

### CycleMate Strengths

| Area | Strength | Why It Works |
|------|----------|--------------|
| **Gamification** | Achievement system with unlock animations | Creates dopamine-driven engagement loop |
| **Real-time Feedback** | Live tracking with instant metrics | Makes users feel in control of their activity |
| **Visual Progress** | Progress bars, streaks, personal records | Taps into human desire for achievement |
| **Community** | Social comparison, sharing | Accountability drives continued use |
| **Contextual Care** | Weather alerts, safety notifications | Shows the app cares beyond the core feature |

### Pilo Strengths

| Area | Strength | Why It Works |
|------|----------|--------------|
| **Trust Transparency** | Predictive communication at every step | Reduces anxiety in autonomous systems |
| **Minimal Friction** | 3-tap booking flow | Removes barriers to action |
| **Premium Aesthetic** | Clean, bold design with generous whitespace | Feels like a high-end product |
| **Map-Centric UI** | Location as primary context | Spatial awareness creates confidence |
| **Smooth Animations** | Spring physics, fluid transitions | Creates premium, polished feel |

---

## Section 2: What to Adapt for PicksWise

### High Priority Adaptations

**1. Health Score Dashboard**
- **From:** Financial wellness apps, Pilo's executive summary
- **For:** PicksWise Money Pulse dashboard
- **Adaptation:** Single score (0-100) showing financial subscription health
- **Benefit:** Users know their status immediately

**2. AI Insight Cards**
- **From:** Pilo's transparency approach
- **For:** PicksWise Money Twin feature
- **Adaptation:** Show AI reasoning, not just recommendations
- **Benefit:** Users trust recommendations they understand

**3. Floating Pill Navigation**
- **From:** The uploaded reference images
- **For:** PicksWise bottom navigation (v15.7 implemented)
- **Adaptation:** Triple-encoding active state, lime brand color
- **Benefit:** Modern, premium navigation aesthetic

**4. Swipe Actions on Lists**
- **From:** CycleMate's gesture shortcuts
- **For:** Subscription list management
- **Adaptation:** Swipe left = snooze, swipe right = take action
- **Benefit:** Power-user efficiency

**5. Celebration Animations**
- **From:** CycleMate's achievement system
- **For:** Goal milestones, savings achievements
- **Adaptation:** Subtle confetti, progress animations
- **Benefit:** Emotional satisfaction drives retention

### Medium Priority Adaptations

**6. Progressive Disclosure**
- **From:** Pilo's bottom sheet pattern
- **For:** Dashboard and detail views
- **Adaptation:** Default view = summary, tap = details
- **Benefit:** Reduces cognitive load

**7. Trust-Building Transparency**
- **From:** Pilo's approach
- **For:** AI recommendations, data usage
- **Adaptation:** Explain how insights are generated
- **Benefit:** Users feel informed, not manipulated

**8. Premium Spacing**
- **From:** Pilo's generous whitespace
- **For:** Overall layout system
- **Adaptation:** More breathing room between elements
- **Benefit:** Premium, confident aesthetic

---

## Section 3: What NOT to Adapt (with Reasons)

### Elements to Avoid

| Element | Reference | Reason Not to Adapt |
|---------|-----------|---------------------|
| **Fitness Tracking UI** | CycleMate | Different domain; financial data needs different treatment |
| **Map-Centric Home** | Pilo | Location isn't core to subscription tracking |
| **Vehicle Selection UI** | Pilo | Not applicable to fintech |
| **Social Leaderboards** | CycleMate | Can feel inappropriate/motivating in finance context |
| **Extreme Gamification** | CycleMate | Financial apps should be serious, not game-like |
| **Voice Booking** | Pilo | Unnecessary complexity for subscription management |
| **Ride Tracking Animations** | CycleMate | Different data type, different visualization needs |

### Over-Adaptation Risks

1. **Too Much Celebration** — Users manage money, not win races. Celebrations should be measured.

2. **Too Many Features Visible** — Unlike fitness apps, financial users want clarity, not endless options.

3. **Social Comparison** — Comparing subscription spending can feel judgmental. Avoid direct social features.

4. **Over-Gamification** — "Points" and "Levels" can trivialize serious financial decisions.

---

## Section 4: PicksWise Design Direction

### Overall Design Philosophy

**"Financial Intelligence, Human Clarity"**

PicksWise should feel like a sophisticated financial instrument that anyone can use. Think: the dashboard of a luxury car — precise, beautiful, purposeful. Not a toy, not a bank statement.

### Core Design Principles

**1. Clarity Over Complexity**
- Show users what matters, not everything
- Progressive disclosure for detail lovers
- One clear action per screen

**2. Intelligence You Can See**
- AI reasoning is visible, not hidden
- Recommendations come with explanations
- Users understand why they see what they see

**3. Calm Confidence**
- No jarring animations or loud colors
- Smooth, predictable interactions
- Premium feel without pretension

**4. Decision-First Architecture**
- Every screen answers: "What should I do?"
- Not just data display — actionable insights
- Guide users toward smart choices

### Visual Direction

**Aesthetic:** "Premium Dark Minimal"
- Deep dark backgrounds (#0B0F0A) make data pop
- Lime accent (#CDFF24) used sparingly for brand moments
- Generous whitespace creates breathing room
- Clean typography with excellent hierarchy

**Color Strategy:**
- Background: Deep dark (reduces eye strain, premium feel)
- Brand: Lime (fresh, modern, distinctive)
- Data: High contrast whites for numbers
- Alerts: Traditional green/red with brand tint

**Typography:**
- Space Grotesk (English) — geometric, modern, readable
- Kanit (Thai) — clean, friendly, excellent for UI
- DM Mono for financial figures — tabular, aligned

**Motion:**
- Smooth and purposeful (200-300ms standard)
- Spring physics for organic feel
- Subtle celebrations for milestones
- Never distracting from financial data

### Component Direction

**Cards:**
- Rounded corners (16px)
- Subtle elevation (not heavy shadows)
- Generous padding (16-20px)
- Lime border for featured/AI cards

**Navigation:**
- Floating pill bottom nav (v15.7 implemented)
- 5 tabs with Tesla-style naming
- Triple-encoding active state

**Buttons:**
- Primary: Lime background, dark text
- Secondary: Surface color background
- Ghost: Transparent with lime on hover

**Input Fields:**
- Dark surface backgrounds
- Subtle borders
- Lime focus state with glow

### Feature-Specific Direction

**Dashboard (Money Pulse):**
- Hero: Financial health score (large number)
- Featured: AI insight card with lime border
- Grid: 2-column card layout for quick stats
- Bottom: Goal progress widget

**Subscription List (Shadow):**
- Card-based list with category color indicators
- Swipe actions for efficiency
- Pull-to-refresh
- Floating add button

**Insights (Money Twin):**
- AI reasoning visible in cards
- Comparison visualizations
- Clear action recommendations
- Dismiss or explore pattern

**Goals (Goal Launcher):**
- Progress rings with celebration on milestone
- AI predictions for timeline
- Achievement badges (subtle, not overdone)

**Settings (Control Center):**
- Grouped list sections
- Toggle switches for preferences
- Profile with avatar (from v15.7)

---

## Implementation Roadmap

### Phase 1: Foundation (Current)
- [x] Floating pill navigation (v15.7)
- [ ] Design token system
- [ ] Typography scale
- [ ] Color system implementation

### Phase 2: Dashboard
- [ ] Financial health score component
- [ ] AI insight card design
- [ ] Dashboard layout system
- [ ] Progress visualization components

### Phase 3: Core Features
- [ ] Subscription card design
- [ ] Swipe action patterns
- [ ] Goal progress visualization
- [ ] Empty/loading/error states

### Phase 4: Polish
- [ ] Animation system
- [ ] Micro-interactions
- [ ] Celebration moments
- [ ] Onboarding flow

### Phase 5: Accessibility & Testing
- [ ] WCAG compliance audit
- [ ] Screen reader testing
- [ ] Color contrast validation
- [ ] Performance optimization

---

## Conclusion

PicksWise has a unique opportunity to define a new category: "Decision Intelligence for Subscriptions." By combining:

- **Pilo's trust-building transparency**
- **CycleMate's engagement through progress**
- **Premium fintech aesthetics**
- **Thai cultural warmth**

The resulting design will be:
- **Clear** — Complex financial data made simple
- **Intelligent** — AI that explains itself
- **Premium** — A product users are proud to use
- **Culturally Relevant** — Designed for Thai users, not generic

The floating pill navigation (v15.7) is an excellent foundation. The next step is building the dashboard with the health score and AI insight card system, followed by refining the component library with the color and typography system outlined in this report.

**Design is not decoration — it's the interface between human intelligence and financial clarity. Make it worthy of both.**

---

*Report Generated: 2026-07-11*
*References: CycleMate (Behance), Pilo (Behance), Fintech UX Best Practices, PicksWise Current Implementation*


---

# Part C: Complete UX Architecture (SSOT)

---

## SECTION 1: Complete Screen Inventory

### BASIC TIER (Free Users)

#### 1. Splash Screen
| Property | Detail |
|----------|--------|
| **Screen Name** | Splash |
| **Purpose** | Brand presentation + app initialization |
| **User Goal** | Reach the app quickly |
| **Entry Points** | App launch |
| **Exit Points** | Auto-navigate to Onboarding (new) or Dashboard (returning) |
| **Required Components** | Logo, Brand tagline, Loading indicator, App version |
| **Upgrade Opportunity** | Show premium feature teasers during loading |

#### 2. Onboarding — Welcome
| Property | Detail |
|----------|--------|
| **Screen Name** | OnboardingWelcome |
| **Purpose** | Introduce value proposition |
| **User Goal** | Understand why to use PicksWise |
| **Entry Points** | First app launch |
| **Exit Points** | Continue to Features Overview |
| **Required Components** | App logo, Headline, Subheadline, CTA button, Skip link |
| **Upgrade Opportunity** | Premium testimonial preview |

#### 3. Onboarding — Features Overview
| Property | Detail |
|----------|--------|
| **Screen Name** | OnboardingFeatures |
| **Purpose** | Demonstrate core features |
| **User Goal** | See what the app can do |
| **Entry Points** | Welcome screen |
| **Exit Points** | Continue to First Subscription |
| **Required Components** | Feature cards (3), Illustration, Progress indicator |
| **Upgrade Opportunity** | Elite feature showcase at bottom |

#### 4. Onboarding — First Subscription
| Property | Detail |
|----------|--------|
| **Screen Name** | OnboardingFirstSubscription |
| **Purpose** | Capture first subscription |
| **User Goal** | Add their first subscription to start tracking |
| **Entry Points** | Features Overview |
| **Exit Points** | Continue to Goal (optional) or Dashboard |
| **Required Components** | Search input, Quick-add chips, Subscription form, Skip option |
| **Upgrade Opportunity** | "Add 5 more to unlock Pro" messaging |

#### 5. Onboarding — First Goal
| Property | Detail |
|----------|--------|
| **Screen Name** | OnboardingFirstGoal |
| **Purpose** | Set initial savings goal |
| **User Goal** | Define what they're saving for |
| **Entry Points** | First Subscription complete |
| **Exit Points** | Continue to Notifications or Dashboard |
| **Required Components** | Goal type selector, Amount input, Target date picker, Skip option |
| **Upgrade Opportunity** | Goal categories with images (Elite) |

#### 6. Onboarding — Notifications Permission
| Property | Detail |
|----------|--------|
| **Screen Name** | OnboardingNotifications |
| **Purpose** | Request notification permission |
| **User Goal** | Enable renewal reminders |
| **Entry Points** | First Goal complete |
| **Exit Points** | Continue to Dashboard |
| **Required Components** | Bell icon, Benefit explanation, Enable CTA, Maybe later link |
| **Upgrade Opportunity** | "Never miss a renewal" premium messaging |

#### 7. Dashboard — Money Pulse (Home)
| Property | Detail |
|----------|--------|
| **Screen Name** | DashboardMoneyPulse |
| **Purpose** | Show financial health at a glance |
| **User Goal** | Know their subscription status immediately |
| **Entry Points** | Tab navigation, App launch |
| **Exit Points** | Any card → Detail screen |
| **Required Components** | Health Score hero, AI Insight card, Monthly overview, Upcoming renewals, Goal widget |
| **Upgrade Opportunity** | Advanced analytics, Historical trends (Pro) |

#### 8. Subscriptions — Shadow View
| Property | Detail |
|----------|--------|
| **Screen Name** | SubscriptionsList |
| **Purpose** | Display all subscriptions |
| **User Goal** | View, manage, and understand their subscriptions |
| **Entry Points** | Tab navigation |
| **Exit Points** | Subscription detail, Add new, Settings |
| **Required Components** | Search bar, Filter chips, Subscription cards, FAB for add |
| **Upgrade Opportunity** | Category analytics, Bulk actions (Pro) |

#### 9. Subscription Detail
| Property | Detail |
|----------|--------|
| **Screen Name** | SubscriptionDetail |
| **Purpose** | Show full subscription information |
| **User Goal** | Understand subscription history and costs |
| **Entry Points** | Subscription card tap |
| **Exit Points** | Back to list, Edit subscription, Cancel subscription |
| **Required Components** | Subscription info, Cost breakdown, Payment history, Renewal history, Actions |
| **Upgrade Opportunity** | Price prediction, Alternative suggestions (Pro) |

#### 10. Add Subscription — Search
| Property | Detail |
|----------|--------|
| **Screen Name** | AddSubscriptionSearch |
| **Purpose** | Find and add new subscription |
| **User Goal** | Add a subscription to track |
| **Entry Points** | FAB tap, Empty state CTA |
| **Exit Points** | Cancel, Subscription form, Manual add |
| **Required Components** | Search input, Popular suggestions, Recent searches, Manual entry link |
| **Upgrade Opportunity** | "Popular in Thailand" curated list |

#### 11. Add Subscription — Form
| Property | Detail |
|----------|--------|
| **Screen Name** | AddSubscriptionForm |
| **Purpose** | Capture subscription details |
| **User Goal** | Complete adding subscription |
| **Entry Points** | Search result select, Manual entry |
| **Exit Points** | Save → Dashboard, Cancel |
| **Required Components** | Name, Category, Amount, Billing cycle, Start date, Notes, Notification settings |
| **Upgrade Opportunity** | Auto-detect billing date (Pro) |

#### 12. Goals — Goal Launcher
| Property | Detail |
|----------|--------|
| **Screen Name** | GoalsList |
| **Purpose** | Display savings goals |
| **User Goal** | Track progress toward goals |
| **Entry Points** | Tab navigation |
| **Exit Points** | Goal detail, Create new goal |
| **Required Components** | Active goals list, Completed goals, Create goal CTA, Progress rings |
| **Upgrade Opportunity** | Goal templates, Milestone celebrations (Pro) |

#### 13. Goal Detail
| Property | Detail |
|----------|--------|
| **Screen Name** | GoalDetail |
| **Purpose** | Show goal progress and predictions |
| **User Goal** | Understand goal trajectory |
| **Entry Points** | Goal card tap |
| **Exit Points** | Back to list, Edit goal, Delete goal |
| **Required Components** | Progress visualization, AI prediction, Linked subscriptions, Milestones |
| **Upgrade Opportunity** | Auto-adjust predictions (Pro) |

#### 14. Create Goal
| Property | Detail |
|----------|--------|
| **Screen Name** | CreateGoal |
| **Purpose** | Set new savings goal |
| **User Goal** | Create a goal to track |
| **Entry Points** | Goals empty state, FAB |
| **Exit Points** | Save → Goals list, Cancel |
| **Required Components** | Goal name, Target amount, Target date, Icon/emoji, Linked subscription (optional) |
| **Upgrade Opportunity** | Goal templates, AI-suggested targets (Pro) |

#### 15. Settings — Control Center
| Property | Detail |
|----------|--------|
| **Screen Name** | SettingsList |
| **Purpose** | App configuration |
| **User Goal** | Customize app behavior |
| **Entry Points** | Tab navigation |
| **Exit Points** | Any setting detail, Profile |
| **Required Components** | Profile section, Notifications, Currency, Language, Security, About, Sign out |
| **Upgrade Opportunity** | Export data, Connected accounts (Pro) |

#### 16. Profile Settings
| Property | Detail |
|----------|--------|
| **Screen Name** | ProfileSettings |
| **Purpose** | Manage user profile |
| **User Goal** | Update personal information |
| **Entry Points** | Settings → Profile |
| **Exit Points** | Back to settings |
| **Required Components** | Avatar, Name, Email, Phone, Notification preferences |
| **Upgrade Opportunity** | Profile customization, Avatar gallery (Pro) |

#### 17. Notification Settings
| Property | Detail |
|----------|--------|
| **Screen Name** | NotificationSettings |
| **Purpose** | Configure alerts |
| **User Goal** | Control what notifications they receive |
| **Entry Points** | Settings → Notifications |
| **Exit Points** | Back to settings |
| **Required Components** | Renewal reminders, Spending alerts, Goal milestones, Tips & insights, Marketing |
| **Upgrade Opportunity** | Custom notification schedules (Pro) |

#### 18. Insights — Money Twin (Basic)
| Property | Detail |
|----------|--------|
| **Screen Name** | InsightsList |
| **Purpose** | Show AI-generated insights |
| **User Goal** | Understand spending patterns |
| **Entry Points** | Tab navigation |
| **Exit Points** | Insight detail, Subscription reference |
| **Required Components** | Insight cards, Spending summary, Pattern visualization |
| **Upgrade Opportunity** | Full AI reasoning, Historical comparison (Pro) |

#### 19. Insight Detail
| Property | Detail |
|----------|--------|
| **Screen Name** | InsightDetail |
| **Purpose** | Explain insight in depth |
| **User Goal** | Understand why this insight matters |
| **Entry Points** | Insight card tap |
| **Exit Points** | Back to list, Related subscriptions, Take action |
| **Required Components** | Insight explanation, Supporting data, Recommendation, Action buttons |
| **Upgrade Opportunity** | Full AI reasoning chain (Pro) |

---

### PRO TIER (Paid Users — $4.99/month or $39.99/year)

#### 20. Dashboard — Money Pulse (Pro)
| Property | Detail |
|----------|--------|
| **Screen Name** | DashboardMoneyPulsePro |
| **Purpose** | Enhanced dashboard with advanced metrics |
| **User Goal** | Deep understanding of subscription health |
| **Entry Points** | Tab navigation (Pro user) |
| **Exit Points** | Any card → Detail, Analytics deep-dive |
| **Required Components** | Basic components + Historical trends, Benchmark comparison, Advanced KPIs |
| **Upgrade Opportunity** | Custom widgets (Elite) |

#### 21. Analytics — Spending Trends
| Property | Detail |
|----------|--------|
| **Screen Name** | AnalyticsSpendingTrends |
| **Purpose** | Visualize spending over time |
| **User Goal** | Identify patterns and anomalies |
| **Entry Points** | Dashboard → View Trends |
| **Exit Points** | Back to dashboard, Export data |
| **Required Components** | Line chart, Bar chart, Category breakdown, Time range selector |
| **Upgrade Opportunity** | Custom date ranges, Export to PDF (Elite) |

#### 22. Analytics — Category Analysis
| Property | Detail |
|----------|--------|
| **Screen Name** | AnalyticsCategoryAnalysis |
| **Purpose** | Break down spending by category |
| **User Goal** | Understand where money goes |
| **Entry Points** | Dashboard → Categories |
| **Exit Points** | Back to dashboard, Category subscriptions |
| **Required Components** | Pie chart, Category list, Trends per category |
| **Upgrade Opportunity** | Category comparison (Elite) |

#### 23. Recommendations — Alternative Subscriptions
| Property | Detail |
|----------|--------|
| **Screen Name** | RecommendationsAlternatives |
| **Purpose** | Show cheaper alternatives |
| **User Goal** | Find opportunities to save |
| **Entry Points** | Insight card, Insights tab |
| **Exit Points** | View option, Dismiss |
| **Required Components** | Current vs Alternative comparison, Savings calculation, Action CTA |
| **Upgrade Opportunity** | Personalized alternatives (Elite) |

#### 24. Recommendations — Plan Optimization
| Property | Detail |
|----------|--------|
| **Screen Name** | RecommendationsPlanOptimization |
| **Purpose** | Suggest billing cycle changes |
| **User Goal** | Find immediate savings |
| **Entry Points** | Insight card, AI tab |
| **Exit Points** | View plans, Dismiss |
| **Required Components** | Current plan, Suggested plan, Annual savings, Action CTA |
| **Upgrade Opportunity** | Custom plan suggestions (Elite) |

#### 25. Notifications — Smart Reminders
| Property | Detail |
|----------|--------|
| **Screen Name** | NotificationsSmartReminders |
| **Purpose** | Advanced notification settings |
| **User Goal** | Fine-tune reminders |
| **Entry Points** | Settings → Notifications → Smart |
| **Exit Points** | Back to notifications |
| **Required Components** | Reminder timing, Spending threshold alerts, Unusual activity alerts |
| **Upgrade Opportunity** | Custom schedules, AI-optimized timing (Elite) |

#### 26. Data — Export
| Property | Detail |
|----------|--------|
| **Screen Name** | DataExport |
| **Purpose** | Export subscription data |
| **User Goal** | Download their data |
| **Entry Points** | Settings → Data |
| **Exit Points** | Back to settings |
| **Required Components** | Format selector (CSV, PDF, Excel), Date range, Export button |
| **Upgrade Opportunity** | Scheduled exports, API access (Elite) |

#### 27. Goals — Advanced Tracking
| Property | Detail |
|----------|--------|
| **Screen Name** | GoalsAdvancedTracking |
| **Purpose** | Enhanced goal features |
| **User Goal** | Deep goal management |
| **Entry Points** | Goals tab (Pro user) |
| **Exit Points** | Goal detail, Back to list |
| **Required Components** | Linked subscriptions, Auto-allocation, Milestone alerts, Progress sharing |
| **Upgrade Opportunity** | Collaborative goals (Elite) |

---

### ELITE TIER (Power Users — $9.99/month or $79.99/year)

#### 28. Portfolio — Multi-Account Overview
| Property | Detail |
|----------|--------|
| **Screen Name** | PortfolioOverview |
| **Purpose** | Aggregate view across accounts |
| **User Goal** | Holistic subscription management |
| **Entry Points** | Tab navigation |
| **Exit Points** | Account detail, Settings |
| **Required Components** | Total spend, Account cards, Consolidated insights |
| **Upgrade Opportunity** | — |

#### 29. Portfolio — Account Detail
| Property | Detail |
|----------|--------|
| **Screen Name** | AccountDetail |
| **Purpose** | View single account subscriptions |
| **User Goal** | Manage specific account |
| **Entry Points** | Portfolio → Account card |
| **Exit Points** | Back to portfolio, Edit account |
| **Required Components** | Account info, Subscriptions in account, Per-account analytics |
| **Upgrade Opportunity** | — |

#### 30. Simulation — What-If Scenarios
| Property | Detail |
|----------|--------|
| **Screen Name** | SimulationWhatIf |
| **Purpose** | Model future scenarios |
| **User Goal** | Plan subscription changes |
| **Entry Points** | Insights → What If |
| **Exit Points** | Back to insights, Apply scenario |
| **Required Components** | Scenario builder, Impact preview, Comparison view |
| **Upgrade Opportunity** | — |

#### 31. Simulation — Goal Projection
| Property | Detail |
|----------|--------|
| **Screen Name** | SimulationGoalProjection |
| **Purpose** | Model goal achievement |
| **User Goal** | Understand goal feasibility |
| **Entry Points** | Goal detail → Project |
| **Exit Points** | Back to goal, Adjust parameters |
| **Required Components** | Projection chart, Adjustable parameters, Confidence interval |
| **Upgrade Opportunity** | — |

#### 32. API — Connected Services
| Property | Detail |
|----------|--------|
| **Screen Name** | APIConnectedServices |
| **Purpose** | Manage third-party integrations |
| **User Goal** | Connect additional services |
| **Entry Points** | Settings → Integrations |
| **Exit Points** | Back to settings, Service detail |
| **Required Components** | Service list, Connect new, Webhook settings |
| **Upgrade Opportunity** | — |

#### 33. Team — Family Sharing
| Property | Detail |
|----------|--------|
| **Screen Name** | TeamFamilySharing |
| **Purpose** | Share subscription tracking |
| **User Goal** | Manage family subscriptions together |
| **Entry Points** | Settings → Family |
| **Exit Points** | Back to settings, Member detail |
| **Required Components** | Family members, Shared goals, Shared insights, Permissions |
| **Upgrade Opportunity** | — |

#### 34. Reports — Monthly Digest
| Property | Detail |
|----------|--------|
| **Screen Name** | ReportsMonthlyDigest |
| **Purpose** | Monthly summary report |
| **User Goal** | Review monthly subscription activity |
| **Entry Points** | Dashboard → Reports, Email link |
| **Exit Points** | Share, Back to dashboard |
| **Required Components** | Monthly summary, Top changes, Savings summary, Goal progress |
| **Upgrade Opportunity** | Custom report builder (Future) |

#### 35. Reports — Annual Summary
| Property | Detail |
|----------|--------|
| **Screen Name** | ReportsAnnualSummary |
| **Purpose** | Year-end subscription report |
| **User Goal** | Annual financial review |
| **Entry Points** | Reports tab (December), Dashboard |
| **Exit Points** | Share, Export, Back to dashboard |
| **Required Components** | Annual spend, Category breakdown, Goal achievements, Savings total |
| **Upgrade Opportunity** | Tax preparation integration (Future) |

---

## SECTION 2: Feature-to-Screen Mapping

| Feature | Purpose | Screen(s) | User Value | Plan | Dependencies |
|---------|---------|-----------|-----------|------|--------------|
| **Health Score** | Calculate financial wellness | DashboardMoneyPulse | At-a-glance status | All | Subscription data, Payment history |
| **AI Insight Engine** | Generate actionable insights | InsightsList, InsightDetail | Decision support | All | Spending patterns, User preferences |
| **Subscription Tracking** | Track recurring payments | SubscriptionsList, SubscriptionDetail | Awareness | All | Bank/Cards connection |
| **Add Subscription** | Manual entry | AddSubscriptionSearch, AddSubscriptionForm | Control | All | None |
| **Subscription Search** | Find popular services | AddSubscriptionSearch | Ease | All | Service database |
| **Renewal Alerts** | Notify before renewal | Notifications | Prevention | All | Notification permission |
| **Goal Setting** | Set savings targets | GoalsList, CreateGoal | Motivation | All | None |
| **Goal Tracking** | Monitor progress | GoalDetail, GoalsList | Progress | All | Linked subscriptions |
| **Spending Analysis** | Understand patterns | AnalyticsSpendingTrends | Insight | Pro | 3+ months data |
| **Category Breakdown** | View by category | AnalyticsCategoryAnalysis | Clarity | Pro | Categorization engine |
| **Alternative Suggestions** | Find cheaper options | RecommendationsAlternatives | Savings | Pro | Service database, Pricing data |
| **Plan Optimization** | Suggest billing changes | RecommendationsPlanOptimization | Savings | Pro | Price intelligence |
| **Smart Reminders** | Adaptive notifications | NotificationsSmartReminders | Convenience | Pro | Usage patterns |
| **Data Export** | Download data | DataExport | Control | Pro | None |
| **Multi-Account** | Aggregate views | PortfolioOverview, AccountDetail | Scale | Elite | Multiple accounts |
| **What-If Simulation** | Model scenarios | SimulationWhatIf | Planning | Elite | Prediction engine |
| **Goal Projection** | Model goal achievement | SimulationGoalProjection | Planning | Elite | Goal engine |
| **API Integration** | Connect services | APIConnectedServices | Automation | Elite | API keys |
| **Family Sharing** | Share with family | TeamFamilySharing | Collaboration | Elite | Family accounts |
| **Monthly Digest** | Summary reports | ReportsMonthlyDigest | Review | Pro | Report engine |
| **Annual Summary** | Year-end report | ReportsAnnualSummary | Review | Pro | Full year data |

---

## SECTION 3: Complete Information Architecture

```
PicksWise
│
├── [Onboarding Flow]
│   ├── Welcome
│   │   └── Brand introduction + value prop
│   ├── Features Overview
│   │   └── 3 feature highlights
│   ├── First Subscription
│   │   ├── Quick-add (popular services)
│   │   ├── Search
│   │   └── Manual form
│   ├── First Goal (optional)
│   │   ├── Goal templates
│   │   └── Custom goal form
│   └── Notifications Permission
│       └── Reminder opt-in
│
├── [Main App — Tab Navigation]
│   │
│   ├── [Money Pulse] — Dashboard
│   │   ├── Health Score Hero
│   │   ├── AI Insight of the Day
│   │   ├── Monthly Overview Card
│   │   ├── Upcoming Renewals Widget
│   │   ├── Goal Progress Widget
│   │   └── Quick Actions
│   │       ├── Add Subscription
│   │       ├── View All Insights
│   │       └── Generate Report (Pro)
│   │
│   ├── [Shadow] — Subscriptions
│   │   ├── Search & Filter
│   │   ├── Subscription List
│   │   │   └── [Subscription Detail]
│   │   │       ├── Info & History
│   │   │       ├── Edit Subscription
│   │   │       └── Cancel/Delete
│   │   └── Add Subscription (FAB)
│   │       ├── Quick Add
│   │       ├── Search
│   │       └── Manual Form
│   │
│   ├── [Money Twin] — Insights
│   │   ├── AI Insight Cards
│   │   │   └── [Insight Detail]
│   │   │       ├── Reasoning
│   │   │       ├── Recommendation
│   │   │       └── Actions
│   │   ├── Spending Patterns
│   │   └── Optimization Opportunities
│   │
│   ├── [Launchpad] — Goals
│   │   ├── Active Goals
│   │   │   └── [Goal Detail]
│   │   │       ├── Progress Ring
│   │   │       ├── AI Prediction
│   │   │       ├── Linked Subscriptions
│   │   │       └── Milestones
│   │   ├── Completed Goals
│   │   └── Create Goal
│   │
│   └── [Control Center] — Settings
│       ├── Profile
│       ├── Notifications
│       │   ├── Renewal Reminders
│       │   └── Smart Reminders (Pro)
│       ├── Currency & Language
│       ├── Security
│       │   ├── Biometrics
│       │   └── PIN
│       ├── Data & Privacy
│       │   ├── Export Data (Pro)
│       │   └── Connected Accounts
│       ├── Appearance
│       ├── Subscription Plans
│       └── About & Support
│
├── [Pro/Elite Features]
│   │
│   ├── Analytics Hub
│   │   ├── Spending Trends
│   │   ├── Category Analysis
│   │   └── Benchmark Comparison
│   │
│   ├── Recommendations Engine
│   │   ├── Alternative Subscriptions
│   │   └── Plan Optimization
│   │
│   ├── Portfolio (Elite)
│   │   ├── Multi-Account Overview
│   │   └── Account Detail
│   │
│   ├── Simulations (Elite)
│   │   ├── What-If Scenarios
│   │   └── Goal Projections
│   │
│   └── Reports
│       ├── Monthly Digest
│       └── Annual Summary
│
├── [Paywall]
│   ├── Feature Comparison
│   ├── Plan Selection
│   │   ├── Basic (Free)
│   │   ├── Pro ($4.99/mo)
│   │   └── Elite ($9.99/mo)
│   └── Payment Processing
│
├── [Modals & Overlays]
│   ├── Confirmation Dialogs
│   ├── Bottom Sheets
│   │   ├── Filter Sheet
│   │   ├── Action Sheet
│   │   └── Subscription Quick View
│   ├── Toast Notifications
│   └── Celebration Animations
│
└── [System]
    ├── Error Screens
    ├── Loading States
    ├── Empty States
    └── Offline Mode
```

---

## SECTION 4: User Journey Maps

### Basic User Journey

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ BASIC USER — NEW USER JOURNEY                                              │
└─────────────────────────────────────────────────────────────────────────────┘

PHASE 1: DISCOVERY & ONBOARDING
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

GOAL: First-time user evaluates and starts using PicksWise

Pain Points:
• "Do I really need another finance app?"
• "Will this take too much time to set up?"
• "What if I forget to use it?"

Decision Moments:
→ Value proposition clear enough to justify download?
→ First subscription add easy enough to start?
→ Dashboard makes sense immediately?

Touchpoints:
• App Store listing
• First launch → Welcome screen
• Onboarding flow (5 steps max)
• First subscription added
• Dashboard appears

Upgrade Moments:
→ "Add 3+ subscriptions to unlock Pro" → appears naturally
→ Goal creation offered after first subscription
→ Pro features shown as "locked" not hidden

Retention Moments:
→ Day 1: "I can see my spending clearly"
→ Day 3: First renewal reminder received
→ Day 7: First insight generated


PHASE 2: ACTIVE TRACKING
━━━━━━━━━━━━━━━━━━━━━━━━

GOAL: User tracks subscriptions regularly

Pain Points:
• "I keep forgetting to add new subscriptions"
• "I don't know if I'm overspending"
• "Too many notifications annoy me"

Decision Moments:
→ Should I add this new subscription?
→ Is this price increase normal?
→ Should I cancel or downgrade?

Touchpoints:
• Daily: Open app → Quick glance at dashboard
• Weekly: Review upcoming renewals
• Monthly: Check spending total

Upgrade Moments:
→ "You're tracking 5 subscriptions — Pro shows you 15 more insights"
→ Renewal reminder → "Pro users save 1,200 THB/year on average"
→ Year-end → "See your annual subscription report"


PHASE 3: HABIT FORMATION
━━━━━━━━━━━━━━━━━━━━━━━━

GOAL: PicksWise becomes part of routine

Pain Points:
• "I need reminders but don't want spam"
• "Sometimes I forget to check the app"
• "Is my data safe?"

Decision Moments:
→ "Should I upgrade to Pro?"
→ "Should I add a goal?"
→ "Should I connect more accounts?"

Touchpoints:
• Push notification: "Netflix renews tomorrow"
• Dashboard: "You saved 500 THB this month"
• Insight: "Spotify annual plan saves you 600 THB"

Retention Moments:
→ "I saved money by taking action on an insight"
→ "My goal is 40% complete"
→ "I haven't missed a renewal in 3 months"


━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
UPGRADE TO PRO MOMENT:
• User hits 5 subscriptions limit on insights
• Monthly report shows potential savings
• Reviews subscription and sees "Unlock Pro" card
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

### Pro User Journey

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ PRO USER — POWER USER JOURNEY                                              │
└─────────────────────────────────────────────────────────────────────────────┘

PHASE 1: ADVANCED ADOPTION
━━━━━━━━━━━━━━━━━━━━━━━━━━

GOAL: Pro user unlocks deeper value

Pain Points:
• "I want more than basic tracking"
• "How do I optimize my spending?"
• "Can I predict future costs?"

Decision Moments:
→ Which insights are most valuable?
→ Should I change billing cycles?
→ What alternatives should I consider?

Touchpoints:
• Analytics → Spending Trends
• Recommendations → Alternatives
• Smart Reminders setup

Upgrade Moments:
→ "Unlock Elite to simulate What-If scenarios"
→ "Add multiple accounts for 360° view"
→ "Export your annual report"


PHASE 2: OPTIMIZATION
━━━━━━━━━━━━━━━━━━━━━

GOAL: User actively optimizes subscription portfolio

Pain Points:
• "I need to see the full picture"
• "Which subscriptions should I keep?"
• "Am I on the best plans?"

Decision Moments:
→ Cancel vs Keep → driven by insights
→ Monthly vs Annual → driven by recommendations
→ Consolidate accounts → driven by Portfolio view

Touchpoints:
• Analytics dashboard (Pro)
• Recommendations engine (Pro)
• Goal projections (Elite)

Retention Moments:
→ "I switched to annual billing and saved 2,400 THB"
→ "I canceled 3 subscriptions based on insights"
→ "My goal is ahead of schedule"


PHASE 3: ADVOCACY
━━━━━━━━━━━━━━━━

GOAL: Pro user becomes brand advocate

Pain Points:
• "I want to share my progress"
• "Can my family benefit too?"
• "How do I export my data?"

Decision Moments:
→ "Should I recommend to friends?"
→ "Should I add family members?"
→ "Should I export for tax purposes?"

Touchpoints:
• Share achievement card
• Family sharing invitation
• Annual report generation

Retention Moments:
→ "I shared my savings with my partner"
→ "Family plan makes this even better value"
→ "Annual report helped with tax filing"
```

### Elite User Journey

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ ELITE USER — POWER USER JOURNEY                                             │
└─────────────────────────────────────────────────────────────────────────────┘

PHASE 1: FULL POWER
━━━━━━━━━━━━━━━━━━

GOAL: Elite user leverages complete feature set

Pain Points:
• "I need multi-account visibility"
• "I want to plan scenarios"
• "I need API access for automation"

Decision Moments:
→ Set up multi-account portfolio
→ Create What-If scenarios
→ Configure API integrations

Touchpoints:
• Portfolio view (All accounts)
• Simulation engine
• API connections


PHASE 2: PLANNING & FORECASTING
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

GOAL: User plans future subscription decisions

Pain Points:
• "What if I add Netflix Family?"
• "Will I reach my goal if I add more subscriptions?"
• "What's my projected spend next year?"

Decision Moments:
→ What-If scenario outcomes
→ Goal projection confidence
→ Budget adjustments

Touchpoints:
• Simulation → What-If
• Simulation → Goal Projection
• Annual report planning


PHASE 3: ENTERPRISE USAGE
━━━━━━━━━━━━━━━━━━━━━━━━━

GOAL: User uses PicksWise for business or family

Pain Points:
• "I need to manage team subscriptions"
• "I need API for my workflows"
• "I need custom reports"

Decision Moments:
→ Set up team/family accounts
→ Configure API webhooks
→ Generate custom reports

Touchpoints:
• Family/Team sharing
• API dashboard
• Custom report builder
```

---

## SECTION 5: UX Flow Diagrams

### Flow 1: First Time User

```
[App Launch]
      │
      ▼
[Check Auth Status]
      │
      ├─[No Account]──→ [Onboarding Welcome]
      │                        │
      │                        ▼
      │                [Onboarding Features]
      │                        │
      │                        ▼
      │                [Onboarding First Sub]
      │                        │
      │                        ▼
      │                [Add Subscription?]
      │                   │        │
      │               [Yes]      [Skip]
      │                   │        │
      │                   ▼        ▼
      │            [Quick Add]  [Dashboard]
      │            or Search         │
      │                   │        │
      │                   └────┬───┘
      │                        ▼
      │               [Onboarding Goal?]
      │                   │        │
      │               [Yes]      [Skip]
      │                   │        │
      │                   ▼        ▼
      │              [Create Goal]  ▼
      │                   │      [Notif Perm?]
      │                   └────┬───┘
      │                        ▼
      │                [Permission Flow]
      │                        │
      │                        ▼
      │                    [Dashboard]
      │
      └─[Has Account]──→ [Load Dashboard]
```

### Flow 2: Daily Active User

```
[Open App]
      │
      ▼
[Show Cached Dashboard]
      │
      ▼
[Load Fresh Data (Background)]
      │
      ▼
[Display Dashboard]
      │
      ├──[View Health Score]──→ [Score Breakdown Modal]
      │
      ├──[View AI Insight]──→ [Insight Detail]
      │                            │
      │                       [Take Action?]
      │                            │
      │                       [Yes]    [No]
      │                            │      │
      │                            ▼      ▼
      │                     [Subscription] [Dismiss]
      │                            │
      │                            ▼
      │                       [Dashboard]
      │
      ├──[Check Renewals]──→ [Renewals List]
      │                            │
      │                    [Tap Renewal]
      │                            │
      │                            ▼
      │                    [Renewal Options]
      │                   │     │     │
      │              [Keep] [Downgrade] [Cancel]
      │                   │     │     │
      │                   └─────┴─────┘
      │                         │
      │                         ▼
      │                    [Confirm + Update]
      │
      └──[Add New Sub]──→ [Quick Add / Search]
                                │
                                ▼
                          [Add Subscription Form]
                                │
                                ▼
                          [Save + Dashboard]
```

### Flow 3: Weekly Review

```
[Open App]
      │
      ▼
[Dashboard: Weekly Summary]
      │
      ▼
[Show: This Week's Changes]
      │
      ├──[New Subscriptions Added?]
      │         │
      │         ▼
      │   [Review New Subscriptions]
      │         │
      │         ▼
      │   [Confirm / Adjust / Cancel]
      │
      ├──[Upcoming Renewals]
      │         │
      │         ▼
      │   [Review Next 7 Days]
      │         │
      │         ▼
      │   [Take Action if Needed]
      │
      ├──[New AI Insights]
      │         │
      │         ▼
      │   [Review Top Insights]
      │         │
      │         ▼
      │   [Take Action or Dismiss]
      │
      └──[Goal Progress Check]
                │
                ▼
          [View Progress]
                │
                ▼
          [Adjust if Needed]
```

### Flow 4: Monthly Review

```
[Open App]
      │
      ▼
[Dashboard: Monthly Overview]
      │
      ▼
[Show: Month's Summary Card]
      │
      ├──[Total Spent This Month]
      │         │
      │         ▼
      │   [Compare to Last Month]
      │         │
      │         ▼
      │   [View Breakdown by Category]
      │
      ├──[Generate Monthly Report]──→ [Report View]
      │                                    │
      │                               [Share / Export]
      │
      ├──[Review All Renewals]
      │         │
      │         ▼
      │   [Assess: Keep / Change / Cancel]
      │
      ├──[Check Goal Progress]
      │         │
      │         ▼
      │   [View Milestones Reached]
      │         │
      │         ▼
      │   [Celebrate Achievement]
      │
      └──[Plan Next Month]
                │
                ▼
          [Set Intentions]
```

### Flow 5: Subscription Upgrade

```
[User notices plan change suggestion]
      │
      ▼
[View Recommendation]
      │
      ▼
[Show: Current vs Alternative]
      │
      ├──[Details]
      │     │
      │     ▼
      │ [Compare Features]
      │     │
      │     ▼
      │ [Check User Needs]
      │
      ▼
[Decision: Upgrade?]
      │
      ├─[Yes]──→ [Redirect to Provider]
      │                │
      │                ▼
      │           [Update in PicksWise]
      │
      └─[Not Yet]──→ [Snooze Reminder]
                           │
                           ▼
                      [Remind Later]
```

### Flow 6: AI Recommendation

```
[AI Engine analyzes patterns]
      │
      ▼
[Generate Recommendation]
      │
      ▼
[Show: Insight Card on Dashboard]
      │
      ▼
[User taps insight]
      │
      ▼
[Show: Insight Detail]
      │
      ├──[Show: AI Reasoning]
      │     │
      │     ▼
      │ [Explain: What data was used]
      │     │
      │     ▼
      │ [Explain: Why this matters]
      │
      ▼
[Show: Recommendation]
      │
      ▼
[User Actions]
      │
      ├──[Take Action]──→ [Execute Recommendation]
      │                          │
      │                          ▼
      │                     [Track Outcome]
      │
      ├─[Learn More]──→ [Show Detailed Analysis]
      │
      └─[Dismiss]──→ [Record Dismissal + Update Model]
```

### Flow 7: Goal Creation

```
[User taps "Create Goal"]
      │
      ▼
[Choose: Template or Custom]
      │
      ├─[Template]──→ [Show Goal Templates]
      │                      │
      │                      ▼
      │                [Select Template]
      │
      └─[Custom]──→ [Enter Goal Name]
                           │
                           ▼
                    [Enter Target Amount]
                           │
                           ▼
                    [Set Target Date]
                           │
                           ▼
                    [Link Subscriptions?]
                       │         │
                    [Yes]       [No]
                       │         │
                       ▼         ▼
                 [Link Subs]  [Skip]
                       │         │
                       └────┬────┘
                            ▼
                      [Preview Projection]
                            │
                            ▼
                      [Confirm + Create]
                            │
                            ▼
                      [Show Goal Card]
```

### Flow 8: Goal Completion

```
[User reaches goal target]
      │
      ▼
[Trigger: Completion Detection]
      │
      ▼
[Show: Celebration Animation]
      │
      ├──[Confetti Effect]
      ├──[Achievement Badge]
      └──[Congratulations Message]
            │
            ▼
      [Show: Summary]
      │
      ├──[Total Saved]
      ├──[Duration]
      └──[Milestones Hit]
            │
            ▼
      [Options]
      │
      ├──[Share Achievement]
      │         │
      │         ▼
      │    [Generate Share Card]
      │
      ├─[Set New Goal]
      │         │
      │         ▼
      │    [Create New Goal Flow]
      │
      └─[Done]
              │
              ▼
         [Return to Goals]
```

### Flow 9: Premium Conversion

```
[User encounters Pro feature]
      │
      ▼
[Show: Feature Preview]
      │
      ▼
[Show: "Unlock Pro" Card]
      │
      ├──[See all Pro features]
      │         │
      │         ▼
      │   [Show Feature Comparison]
      │
      ▼
[Prompt: Upgrade or Continue]
      │
      ├─[Upgrade]──→ [Paywall Screen]
      │                      │
      │                      ▼
      │               [Plan Selection]
      │                      │
      │                      ▼
      │               [Payment Processing]
      │                      │
      │                      ▼
      │               [Success + Unlock]
      │
      └─[Continue Free]──→ [Return to Previous Screen]
                                    │
                                    ▼
                              [Note: Feature Locked]
```

---

## SECTION 6: Component Inventory

### Layout Components

#### ScreenContainer
| Property | Value |
|----------|-------|
| **Purpose** | Wrapper for all screens with safe areas |
| **States** | Default, Scrolled, Loading |
| **Props** | `children`, `showHeader`, `headerTitle`, `stickyHeader`, `fab` |
| **Variants** | `default`, `tabScreen`, `modal` |
| **Reuse Locations** | All screens |
| **Priority** | P0 |

#### SafeAreaWrapper
| Property | Value |
|----------|-------|
| **Purpose** | Handle notch and home indicator |
| **States** | Default |
| **Props** | `edges` (top, bottom, left, right) |
| **Variants** | `full`, `content`, `header` |
| **Reuse Locations** | All screens |
| **Priority** | P0 |

#### ScrollView
| Property | Value |
|----------|-------|
| **Purpose** | Scrollable content container |
| **States** | Default, Refreshing, Loading more |
| **Props** | `onRefresh`, `onEndReached`, `children`, `contentContainerStyle` |
| **Variants** | `vertical`, `horizontal`, `nested` |
| **Reuse Locations** | Lists, Dashboards, Analytics |
| **Priority** | P0 |

#### StackLayout
| Property | Value |
|----------|-------|
| **Purpose** | Vertical stacking of content |
| **States** | Default |
| **Props** | `spacing`, `align`, `children` |
| **Variants** | `tight`, `normal`, `loose` |
| **Reuse Locations** | Cards, Forms, Lists |
| **Priority** | P0 |

#### GridLayout
| Property | Value |
|----------|-------|
| **Purpose** | Two-column grid layout |
| **States** | Default |
| **Props** | `columns`, `gap`, `children` |
| **Variants** | `1-col`, `2-col`, `3-col` |
| **Reuse Locations** | Dashboard widgets, Card grids |
| **Priority** | P1 |

---

### Navigation Components

#### FloatingBottomNav
| Property | Value |
|----------|-------|
| **Purpose** | Main app navigation (v15.7) |
| **States** | Default (5 tabs) |
| **Props** | `currentTab`, `onNavigate`, `lang`, `userAvatar`, `userInitials` |
| **Variants** | `default`, `withBadge` |
| **Reuse Locations** | All tab screens |
| **Priority** | P0 |

#### TabBarIcon
| Property | Value |
|----------|-------|
| **Purpose** | Individual tab icon |
| **States** | Active, Inactive, Badge |
| **Props** | `icon`, `active`, `badge` |
| **Variants** | `outline`, `filled` |
| **Reuse Locations** | FloatingBottomNav |
| **Priority** | P0 |

#### HeaderBar
| Property | Value |
|----------|-------|
| **Purpose** | Screen header with back button |
| **States** | Default, Transparent, Large title |
| **Props** | `title`, `subtitle`, `leftAction`, `rightAction`, `transparent` |
| **Variants** | `default`, `largeTitle`, `search` |
| **Reuse Locations** | Detail screens, Settings |
| **Priority** | P0 |

#### BottomSheet
| Property | Value |
|----------|-------|
| **Purpose** | Modal that slides from bottom |
| **States** | Closed, Peeking, Expanded, Full |
| **Props** | `isOpen`, `onClose`, `snapPoints`, `children` |
| **Variants** | `filter`, `action`, `detail` |
| **Reuse Locations** | Filters, Quick views, Share |
| **Priority** | P1 |

---

### Card Components

#### MetricCard (Hero)
| Property | Value |
|----------|-------|
| **Purpose** | Display key financial metric |
| **States** | Default, Loading, Trend up, Trend down |
| **Props** | `label`, `value`, `trend`, `trendValue`, `onPress` |
| **Variants** | `hero`, `compact`, `detailed` |
| **Reuse Locations** | Dashboard, Analytics |
| **Priority** | P0 |

#### SubscriptionCard
| Property | Value |
|----------|-------|
| **Purpose** | Display single subscription |
| **States** | Default, Upcoming renewal, Alert, Loading |
| **Props** | `subscription`, `onPress`, `onSnooze`, `onAction` |
| **Variants** | `default`, `compact`, `detailed` |
| **Reuse Locations** | Subscription list, Dashboard widgets |
| **Priority** | P0 |

#### InsightCard
| Property | Value |
|----------|-------|
| **Purpose** | Display AI insight |
| **States** | Default, New, Dismissed, Loading |
| **Props** | `insight`, `onPress`, `onDismiss`, `onAction` |
| **Variants** | `alert`, `recommendation`, `info` |
| **Reuse Locations** | Insights list, Dashboard |
| **Priority** | P0 |

#### GoalProgressCard
| Property | Value |
|----------|-------|
| **Purpose** | Display goal with progress |
| **States** | Active, Completed, Off-track, Loading |
| **Props** | `goal`, `onPress`, `showPrediction` |
| **Variants** | `ring`, `bar`, `minimal` |
| **Reuse Locations** | Goals list, Dashboard |
| **Priority** | P0 |

#### ActionCard
| Property | Value |
|----------|-------|
| **Purpose** | CTA card with primary action |
| **States** | Default, Loading, Disabled |
| **Props** | `title`, `subtitle`, `actionLabel`, `onAction`, `icon` |
| **Variants** | `primary`, `secondary`, `premium` |
| **Reuse Locations** | Empty states, Upsells, Prompts |
| **Priority** | P1 |

---

### Form Components

#### TextInput
| Property | Value |
|----------|-------|
| **Purpose** | Text entry field |
| **States** | Default, Focused, Error, Disabled, Loading |
| **Props** | `label`, `placeholder`, `value`, `onChange`, `error`, `icon`, `rightIcon` |
| **Variants** | `default`, `search`, `password`, `multiline` |
| **Reuse Locations** | All forms |
| **Priority** | P0 |

#### AmountInput
| Property | Value |
|----------|-------|
| **Purpose** | Currency amount entry |
| **States** | Default, Focused, Error |
| **Props** | `label`, `value`, `currency`, `onChange`, `error` |
| **Variants** | `withSuffix`, `withoutDecimal` |
| **Reuse Locations** | Add subscription, Goals |
| **Priority** | P0 |

#### SelectInput
| Property | Value |
|----------|-------|
| **Purpose** | Dropdown selection |
| **States** | Default, Open, Selected, Error |
| **Props** | `label`, `options`, `value`, `onChange`, `placeholder` |
| **Variants** | `default`, `searchable` |
| **Reuse Locations** | Forms, Filters |
| **Priority** | P0 |

#### DatePickerInput
| Property | Value |
|----------|-------|
| **Purpose** | Date selection |
| **States** | Default, Open, Selected, Error |
| **Props** | `label`, `value`, `onChange`, `mode`, `minDate`, `maxDate` |
| **Variants** | `date`, `monthYear`, `range` |
| **Reuse Locations** | Forms, Filters |
| **Priority** | P1 |

#### Toggle
| Property | Value |
|----------|-------|
| **Purpose** | Binary on/off switch |
| **States** | On, Off, Disabled, Loading |
| **Props** | `value`, `onChange`, `label`, `description` |
| **Variants** | `default`, `withLabel` |
| **Reuse Locations** | Settings, Notifications |
| **Priority** | P0 |

#### Checkbox
| Property | Value |
|----------|-------|
| **Purpose** | Multi-select option |
| **States** | Unchecked, Checked, Indeterminate, Disabled |
| **Props** | `value`, `onChange`, `label`, `description` |
| **Variants** | `default`, `radio` |
| **Reuse Locations** | Filters, Settings |
| **Priority** | P1 |

---

### Button Components

#### PrimaryButton
| Property | Value |
|----------|-------|
| **Purpose** | Primary CTA |
| **States** | Default, Hover, Pressed, Loading, Disabled |
| **Props** | `label`, `onPress`, `loading`, `disabled`, `icon`, `fullWidth` |
| **Variants** | `default`, `destructive`, `premium` |
| **Reuse Locations** | All forms, Dialogs, CTAs |
| **Priority** | P0 |

#### SecondaryButton
| Property | Value |
|----------|-------|
| **Purpose** | Secondary action |
| **States** | Default, Hover, Pressed, Loading, Disabled |
| **Props** | `label`, `onPress`, `loading`, `disabled`, `icon` |
| **Variants** | `default`, `outline`, `ghost` |
| **Reuse Locations** | Forms, Dialogs |
| **Priority** | P0 |

#### IconButton
| Property | Value |
|----------|-------|
| **Purpose** | Icon-only button |
| **States** | Default, Hover, Pressed, Disabled |
| **Props** | `icon`, `onPress`, `size`, `variant` |
| **Variants** | `circle`, `square`, `ghost` |
| **Reuse Locations** | Headers, Toolbars, Cards |
| **Priority** | P0 |

#### FAB (Floating Action Button)
| Property | Value |
|----------|-------|
| **Purpose** | Primary floating action |
| **States** | Default, Expanded, Loading |
| **Props** | `icon`, `onPress`, `label`, `expanded` |
| **Variants** | `default`, `mini`, `extended` |
| **Reuse Locations** | Subscription list, Goals list |
| **Priority** | P1 |

---

### Feedback Components

#### Toast
| Property | Value |
|----------|-------|
| **Purpose** | Temporary notification |
| **States** | Success, Error, Warning, Info |
| **Props** | `message`, `type`, `duration`, `action` |
| **Variants** | `inline`, `withAction` |
| **Reuse Locations** | Global |
| **Priority** | P0 |

#### AlertDialog
| Property | Value |
|----------|-------|
| **Purpose** | Blocking confirmation |
| **States** | Open, Closing |
| **Props** | `title`, `message`, `confirmLabel`, `cancelLabel`, `type` |
| **Variants** | `default`, `destructive`, `success` |
| **Reuse Locations** | Cancel subscription, Delete goal |
| **Priority** | P0 |

#### Skeleton
| Property | Value |
|----------|-------|
| **Purpose** | Loading placeholder |
| **States** | Loading (animated shimmer) |
| **Props** | `variant`, `width`, `height`, `borderRadius` |
| **Variants** | `text`, `card`, `avatar`, `list` |
| **Reuse Locations** | All lists, Dashboard, Cards |
| **Priority** | P0 |

#### EmptyState
| Property | Value |
|----------|-------|
| **Purpose** | Display when no data |
| **States** | Default |
| **Props** | `icon`, `title`, `description`, `actionLabel`, `onAction` |
| **Variants** | `noData`, `error`, `search` |
| **Reuse Locations** | Lists, Dashboards, Search |
| **Priority** | P0 |

#### ProgressRing
| Property | Value |
|----------|-------|
| **Purpose** | Circular progress indicator |
| **States** | Default, Animated |
| **Props** | `progress`, `size`, `strokeWidth`, `color` |
| **Variants** | `default`, `withLabel`, `mini` |
| **Reuse Locations** | Goals, Health score |
| **Priority** | P1 |

#### ConfettiAnimation
| Property | Value |
|----------|-------|
| **Purpose** | Celebration effect |
| **States** | Playing, Complete |
| **Props** | `colors`, `duration`, `intensity` |
| **Variants** | `subtle`, `full` |
| **Reuse Locations** | Goal completion, Achievement |
| **Priority** | P2 |

---

### Data Display Components

#### Chart
| Property | Value |
|----------|-------|
| **Purpose** | Data visualization |
| **States** | Default, Loading, Empty, No data |
| **Props** | `data`, `type`, `timeRange`, `onSegmentPress` |
| **Variants** | `line`, `bar`, `pie`, `area` |
| **Reuse Locations** | Analytics, Dashboard |
| **Priority** | P1 |

#### Avatar
| Property | Value |
|----------|-------|
| **Purpose** | User/profile display |
| **States** | Image, Initials, Loading |
| **Props** | `src`, `name`, `size`, `onPress` |
| **Variants** | `small`, `medium`, `large`, `xlarge` |
| **Reuse Locations** | Profile, Settings, Lists |
| **Priority** | P0 |

#### Badge
| Property | Value |
|----------|-------|
| **Purpose** | Status indicator |
| **States** | Default, New, Alert |
| **Props** | `text`, `variant`, `size` |
| **Variants** | `default`, `success`, `warning`, `error`, `pro`, `elite` |
| **Reuse Locations** | Navigation, Cards, Lists |
| **Priority** | P1 |

#### Chip
| Property | Value |
|----------|-------|
| **Purpose** | Tag/filter selection |
| **States** | Default, Selected, Disabled |
| **Props** | `label`, `selected`, `onPress`, `icon` |
| **Variants** | `default`, `filter`, `category` |
| **Reuse Locations** | Filters, Categories, Tags |
| **Priority** | P1 |

#### TrendIndicator
| Property | Value |
|----------|-------|
| **Purpose** | Show change direction |
| **States** | Up, Down, Neutral |
| **Props** | `value`, `percentage`, `showValue` |
| **Variants** | `withLabel`, `compact` |
| **Reuse Locations** | Dashboard, Analytics, Cards |
| **Priority** | P0 |

---

## SECTION 7: Design Token System (Production-Ready)

### Color Tokens

#### Primitive Colors
```css
/* Brand Colors */
--color-lime-50: #F5FFE6;
--color-lime-100: #EBFFD1;
--color-lime-200: #D6FBA3;
--color-lime-300: #B8F06F;
--color-lime-400: #9AE23F;
--color-lime-500: #7ACC1A;
--color-lime-600: #5EAB0F;
--color-lime-700: #4A8A0D;
--color-lime-800: #3C6F10;
--color-lime-900: #335A11;
--color-lime: #CDFF24;  /* Primary brand */

/* Semantic Greens */
--color-success-50: #ECFDF5;
--color-success-100: #D1FAE5;
--color-success-500: #34D399;
--color-success-600: #059669;

/* Semantic Reds */
--color-error-50: #FEF2F2;
--color-error-100: #FEE2E2;
--color-error-500: #F87171;
--color-error-600: #DC2626;

/* Semantic Ambers */
--color-warning-50: #FFFBEB;
--color-warning-100: #FEF3C7;
--color-warning-500: #FBBF24;
--color-warning-600: #D97706;

/* Semantic Blues */
--color-info-50: #EFF6FF;
--color-info-100: #DBEAFE;
--color-info-500: #60A5FA;
--color-info-600: #2563EB;

/* Grays */
--color-gray-50: #FAFAFA;
--color-gray-100: #F5F5F5;
--color-gray-200: #E5E5E5;
--color-gray-300: #D4D4D4;
--color-gray-400: #A3A3A3;
--color-gray-500: #737373;
--color-gray-600: #525252;
--color-gray-700: #404040;
--color-gray-800: #262626;
--color-gray-900: #171717;
```

#### Semantic Tokens
```css
/* Background */
--bg-canvas: #0B0F0A;
--bg-surface-1: #171C15;
--bg-surface-2: #1E241C;
--bg-surface-3: #252D23;
--bg-elevated: #2D362B;

/* Brand */
--brand-primary: #CDFF24;
--brand-primary-muted: rgba(205, 255, 36, 0.15);
--brand-primary-glow: rgba(205, 255, 36, 0.3);
--brand-primary-subtle: rgba(205, 255, 36, 0.08);

/* Text */
--text-primary: #FFFFFF;
--text-secondary: #A0A9A0;
--text-tertiary: #5C665C;
--text-disabled: #3D443D;
--text-inverse: #0B0F0A;

/* Feedback */
--color-success: #34D399;
--color-warning: #FBBF24;
--color-error: #F87171;
--color-info: #60A5FA;

/* Borders */
--border-default: rgba(255, 255, 255, 0.1);
--border-subtle: rgba(255, 255, 255, 0.06);
--border-strong: rgba(255, 255, 255, 0.2);
--border-brand: rgba(205, 255, 36, 0.3);

/* Interactive */
--interactive-hover: rgba(255, 255, 255, 0.05);
--interactive-active: rgba(255, 255, 255, 0.08);
--interactive-pressed: rgba(255, 255, 255, 0.03);
```

### Typography Tokens

```css
/* Font Families */
--font-sans: 'Space Grotesk', 'Kanit', system-ui, -apple-system, sans-serif;
--font-mono: 'DM Mono', 'SF Mono', 'Fira Code', monospace;

/* Font Sizes */
--text-micro: 10px;
--text-label: 12px;
--text-caption: 14px;
--text-body: 16px;
--text-h3: 18px;
--text-h2: 20px;
--text-h1: 24px;
--text-display-sm: 28px;
--text-display-md: 32px;
--text-display-lg: 40px;
--text-display-xl: 48px;

/* Font Weights */
--font-normal: 400;
--font-medium: 500;
--font-semibold: 600;
--font-bold: 700;

/* Line Heights */
--leading-tight: 1.2;
--leading-snug: 1.35;
--leading-normal: 1.5;
--leading-relaxed: 1.65;

/* Letter Spacing */
--tracking-tight: -0.5px;
--tracking-normal: 0;
--tracking-wide: 0.5px;
--tracking-wider: 1px;
```

### Spacing Tokens

```css
/* Base spacing scale */
--space-0: 0;
--space-px: 1px;
--space-0-5: 2px;
--space-1: 4px;
--space-1-5: 6px;
--space-2: 8px;
--space-2-5: 10px;
--space-3: 12px;
--space-3-5: 14px;
--space-4: 16px;
--space-5: 20px;
--space-6: 24px;
--space-7: 28px;
--space-8: 32px;
--space-9: 36px;
--space-10: 40px;
--space-12: 48px;
--space-14: 56px;
--space-16: 64px;

/* Semantic spacing */
--spacing-xs: 4px;
--spacing-sm: 8px;
--spacing-md: 12px;
--spacing-lg: 16px;
--spacing-xl: 24px;
--spacing-2xl: 32px;
--spacing-3xl: 48px;
--spacing-screen-margin: 16px;
--spacing-section-gap: 24px;
--spacing-card-gap: 12px;
```

### Border Radius Tokens

```css
/* Radius scale */
--radius-none: 0;
--radius-sm: 4px;
--radius-md: 8px;
--radius-lg: 12px;
--radius-xl: 16px;
--radius-2xl: 24px;
--radius-full: 9999px;

/* Semantic radii */
--radius-button: 12px;
--radius-card: 16px;
--radius-input: 10px;
--radius-chip: 9999px;
--radius-avatar: 9999px;
--radius-modal: 24px;
```

### Shadow Tokens

```css
/* Elevation levels */
--shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.25);
--shadow-md: 0 2px 4px rgba(0, 0, 0, 0.25), 0 1px 2px rgba(0, 0, 0, 0.15);
--shadow-lg: 0 4px 6px rgba(0, 0, 0, 0.3), 0 2px 4px rgba(0, 0, 0, 0.2);
--shadow-xl: 0 8px 16px rgba(0, 0, 0, 0.35), 0 4px 8px rgba(0, 0, 0, 0.25);
--shadow-2xl: 0 16px 32px rgba(0, 0, 0, 0.4);

/* Brand glow */
--shadow-glow-sm: 0 0 8px rgba(205, 255, 36, 0.25);
--shadow-glow-md: 0 0 12px rgba(205, 255, 36, 0.35), 0 0 4px rgba(205, 255, 36, 0.2);
--shadow-glow-lg: 0 0 20px rgba(205, 255, 36, 0.45), 0 0 8px rgba(205, 255, 36, 0.3);

/* Layered shadows */
--shadow-card: 0 4px 6px rgba(0, 0, 0, 0.3), 0 2px 4px rgba(0, 0, 0, 0.25), 0 0 0 0.5px rgba(255, 255, 255, 0.06);
--shadow-elevated: 0 8px 16px rgba(0, 0, 0, 0.4), 0 0 0 0.5px rgba(255, 255, 255, 0.08);
```

### Motion Tokens

```css
/* Duration scale */
--duration-instant: 50ms;
--duration-fast: 100ms;
--duration-normal: 200ms;
--duration-slow: 300ms;
--duration-slower: 400ms;
--duration-slowest: 500ms;

/* Easing curves */
--ease-default: cubic-bezier(0.25, 0.1, 0.25, 1);
--ease-in: cubic-bezier(0.4, 0, 1, 1);
--ease-out: cubic-bezier(0, 0, 0.2, 1);
--ease-in-out: cubic-bezier(0.4, 0, 0.2, 1);
--ease-bounce: cubic-bezier(0.34, 1.56, 0.64, 1);
--ease-spring: cubic-bezier(0.175, 0.885, 0.32, 1.275);

/* Animation tokens */
--transition-fast: all var(--duration-fast) var(--ease-out);
--transition-normal: all var(--duration-normal) var(--ease-out);
--transition-slow: all var(--duration-slow) var(--ease-in-out);

/* Spring physics */
--spring-bouncy: { stiffness: 400, damping: 28 };
--spring-smooth: { stiffness: 300, damping: 30 };
--spring-tight: { stiffness: 500, damping: 25 };
```

### Component Tokens

```css
/* Button */
--button-height-sm: 36px;
--button-height-md: 44px;
--button-height-lg: 52px;
--button-height-xl: 56px;
--button-padding-sm: 12px;
--button-padding-md: 16px;
--button-padding-lg: 20px;
--button-radius: var(--radius-button);
--button-font-weight: var(--font-semibold);

/* Input */
--input-height: 48px;
--input-padding: 12px 16px;
--input-radius: var(--radius-input);
--input-border-width: 1px;
--input-focus-ring: 0 0 0 3px rgba(205, 255, 36, 0.3);

/* Card */
--card-padding: 16px;
--card-padding-lg: 20px;
--card-radius: var(--radius-card);
--card-gap: 12px;

/* Navigation */
--nav-height: 56px;
--nav-padding: 4px;
--nav-gap: 2px;
--nav-item-min-width: 64px;
--nav-blur: 20px;

/* Avatar */
--avatar-xs: 24px;
--avatar-sm: 32px;
--avatar-md: 40px;
--avatar-lg: 48px;
--avatar-xl: 64px;
--avatar-2xl: 80px;

/* Badge */
--badge-height-sm: 18px;
--badge-height-md: 22px;
--badge-padding-sm: 4px 8px;
--badge-padding-md: 6px 10px;
```

### Dark Mode / Light Mode Tokens

```css
/* Dark Mode (Default) */
[data-theme="dark"], :root {
  --bg-canvas: #0B0F0A;
  --bg-surface-1: #171C15;
  --bg-surface-2: #1E241C;
  --bg-surface-3: #252D23;
  --text-primary: #FFFFFF;
  --text-secondary: #A0A9A0;
  --border-default: rgba(255, 255, 255, 0.1);
}

/* Light Mode (Future) */
[data-theme="light"] {
  --bg-canvas: #FAFAFA;
  --bg-surface-1: #FFFFFF;
  --bg-surface-2: #F5F5F5;
  --bg-surface-3: #E5E5E5;
  --text-primary: #171717;
  --text-secondary: #525252;
  --border-default: rgba(0, 0, 0, 0.1);
}
```

---

## SECTION 8: AI Feature Architecture

### Money Twin — Core AI System

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           MONEY TWIN ARCHITECTURE                          │
└─────────────────────────────────────────────────────────────────────────────┘

                            ┌─────────────────┐
                            │   USER INPUT    │
                            │ (Subscriptions,  │
                            │  Goals, Actions)│
                            └────────┬────────┘
                                     │
                                     ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                         DATA INGESTION LAYER                               │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐    │
│  │ Subscription │  │   Payment   │  │    User     │  │   Market    │    │
│  │    Data     │  │   History   │  │  Behavior   │  │    Data     │    │
│  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘    │
│         │                  │                  │                  │           │
└─────────┼──────────────────┼──────────────────┼──────────────────┼───────────┘
          │                  │                  │                  │
          ▼                  ▼                  ▼                  ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                         CONTEXT AGGREGATION                                │
│                         ┌─────────────────┐                                │
│                         │  Context Store  │                                │
│                         │ (User Profile, │                                │
│                         │  Preferences,  │                                │
│                         │  History)       │                                │
│                         └────────┬────────┘                                │
└────────────────────────────────────────────────────────────────┼────────────┘
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                        AI PROCESSING ENGINES                              │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐    │
│  │  Behavior   │  │   Pattern   │  │Recommendation│  │  Priority   │    │
│  │   Engine    │  │   Engine     │  │   Engine    │  │   Engine    │    │
│  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘    │
│         │                  │                  │                  │           │
└─────────┼──────────────────┼──────────────────┼──────────────────┼───────────┘
          │                  │                  │                  │
          ▼                  ▼                  ▼                  ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                         INSIGHT GENERATION                                 │
│  ┌─────────────────────────────────────────────────────────────────┐      │
│  │                      INSIGHT ENGINE                              │      │
│  │  • Generate actionable insights                                 │      │
│  │  • Score by relevance & impact                                 │      │
│  │  • Add explanation reasoning                                    │      │
│  └─────────────────────────────────────────────────────────────────┘      │
└────────────────────────────────────────────────────────────────┼────────────┘
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                      DECISION SUPPORT LAYER                               │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐    │
│  │  Dashboard   │  │ Insights    │  │ Predictions │  │  Goals      │    │
│  │   Widgets    │  │    Cards     │  │             │  │  Engine     │    │
│  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘    │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Engine Specifications

#### 1. Behavior Engine

**Purpose:** Learn user habits and patterns

**Inputs:**
- App usage patterns (open frequency, features used)
- Action history (subscriptions added, cancelled, modified)
- Time-of-day patterns
- Interaction depth (dismissals, actions taken on insights)

**Outputs:**
- User engagement score
- Preferred notification times
- Content preferences
- Feature adoption level

**Logic:**
```typescript
interface BehaviorEngine {
  // Analyze engagement patterns
  getEngagementLevel(): 'low' | 'medium' | 'high';
  
  // Predict optimal notification time
  predictBestNotificationTime(): TimeSlot;
  
  // Identify feature preferences
  getFeaturePreferences(): FeaturePreference[];
  
  // Detect churn risk
  getChurnRisk(): number; // 0-1
  
  // Calculate user value
  getUserValue(): 'basic' | 'engaged' | 'power';
}
```

**Dependencies:** Event tracking, User profile, Time series data
**User Value:** Personalized experience, timely reminders, reduced churn

---

#### 2. Pattern Engine

**Purpose:** Identify spending patterns and anomalies

**Inputs:**
- Subscription payment history (amounts, dates, frequencies)
- Category spending distribution
- Seasonal patterns (annual vs monthly billing)
- Price increase history

**Outputs:**
- Spending trend classification (increasing, stable, decreasing)
- Anomaly detection alerts
- Category insights
- Renewal predictions

**Logic:**
```typescript
interface PatternEngine {
  // Detect spending trends
  analyzeSpendingTrend(): SpendingTrend;
  
  // Find anomalies
  detectAnomalies(): Anomaly[];
  
  // Predict renewal dates
  predictRenewals(): RenewalPrediction[];
  
  // Identify category patterns
  getCategoryInsights(): CategoryInsight[];
  
  // Calculate billing optimization
  getBillingOptimization(): BillingOptimization[];
  
  // Detect price changes
  detectPriceChanges(): PriceChange[];
}
```

**Dependencies:** Payment history, Service catalog, Price databases
**User Value:** Awareness of spending patterns, early anomaly alerts

---

#### 3. Recommendation Engine

**Purpose:** Generate actionable optimization suggestions

**Inputs:**
- User's current subscriptions
- Market data (alternatives, pricing)
- User preferences and goals
- Historical action outcomes

**Outputs:**
- Alternative subscription suggestions
- Plan upgrade/downgrade recommendations
- Bundle opportunities
- Cancellation suggestions

**Logic:**
```typescript
interface RecommendationEngine {
  // Find cheaper alternatives
  findAlternatives(subscriptionId: string): Alternative[];
  
  // Suggest billing cycle changes
  suggestBillingOptimization(subscriptionId: string): BillingChange[];
  
  // Identify unused subscriptions
  detectUnusedSubscriptions(): UnusedSubscription[];
  
  // Generate savings summary
  calculateSavingsPotential(): SavingsSummary;
  
  // Score recommendations by impact
  rankRecommendations(): RankedRecommendation[];
  
  // Generate personalized tips
  generateTips(): PersonalizedTip[];
}
```

**Dependencies:** Market data, User subscriptions, Pricing APIs
**User Value:** Money saved, better subscription choices

---

#### 4. Priority Engine

**Purpose:** Rank insights by relevance and impact

**Inputs:**
- All generated insights
- User context (current goals, engagement level)
- Time sensitivity
- Potential impact

**Outputs:**
- Prioritized insight queue
- Daily insight selection
- Alert prioritization
- Dashboard insight order

**Logic:**
```typescript
interface PriorityEngine {
  // Calculate insight priority score
  scoreInsight(insight: Insight): number;
  
  // Get top insight for dashboard
  getTopInsight(): Insight;
  
  // Filter by relevance
  filterRelevant(insights: Insight[]): Insight[];
  
  // Determine alert level
  getAlertLevel(insight: Insight): 'info' | 'warning' | 'urgent';
  
  // Predict user interest
  predictInterest(insight: Insight): number;
}
```

**Dependencies:** All other engines, User preferences, Time context
**User Value:** Most important insights first, reduced noise

---

#### 5. Insight Engine

**Purpose:** Generate explainable insights

**Inputs:**
- Processed data from all engines
- User context
- Historical insights

**Outputs:**
- Insight cards with reasoning
- Action recommendations
- Confidence scores

**Logic:**
```typescript
interface InsightEngine {
  // Generate complete insight
  generateInsight(context: InsightContext): Insight;
  
  // Add human-readable explanation
  addReasoning(insight: Insight): Insight;
  
  // Calculate confidence
  calculateConfidence(insight: Insight): number;
  
  // Generate related insights
  findRelated(insight: Insight): Insight[];
  
  // Track insight effectiveness
  trackOutcome(insight: Insight, action: Action): void;
}
```

**Dependencies:** All other engines, User profile, Insight history
**User Value:** Understandable recommendations, trust building

---

#### 6. Decision Engine

**Purpose:** Support user decision-making

**Inputs:**
- User goals and constraints
- Multiple scenarios
- Historical preferences

**Outputs:**
- Scenario comparisons
- What-if projections
- Decision recommendations

**Logic:**
```typescript
interface DecisionEngine {
  // Generate scenario comparison
  compareScenarios(scenarios: Scenario[]): ScenarioComparison;
  
  // Calculate impact of changes
  calculateImpact(changes: Change[]): ImpactAnalysis;
  
  // Predict goal achievement
  predictGoalAchievement(goal: Goal): Prediction;
  
  // Recommend best path
  suggestOptimalPath(goal: Goal): PathRecommendation;
  
  // Model future states
  simulateFuture(state: CurrentState, changes: Change[]): FutureState[];
}
```

**Dependencies:** Pattern engine, Recommendation engine, User goals
**User Value:** Informed decisions, realistic planning

---

#### 7. Goal Engine

**Purpose:** Track and predict goal achievement

**Inputs:**
- Goal definitions
- Linked subscriptions
- Spending patterns
- User actions

**Outputs:**
- Progress tracking
- Milestone predictions
- Adjustment suggestions

**Logic:**
```typescript
interface GoalEngine {
  // Calculate current progress
  calculateProgress(goalId: string): GoalProgress;
  
  // Predict completion date
  predictCompletion(goalId: string): DatePrediction;
  
  // Identify blockers
  detectBlockers(goalId: string): Blocker[];
  
  // Suggest adjustments
  suggestAdjustment(goalId: string): Adjustment[];
  
  // Calculate savings rate
  getSavingsRate(goalId: string): number;
  
  // Detect milestone proximity
  detectMilestones(goalId: string): Milestone[];
}
```

**Dependencies:** Subscription data, Payment history, User actions
**User Value:** Goal clarity, motivation, realistic timelines

---

#### 8. Future Simulation Engine (Elite)

**Purpose:** Model hypothetical scenarios

**Inputs:**
- Current state snapshot
- Hypothetical changes
- Time range

**Outputs:**
- Scenario projections
- Impact analysis
- Risk assessment

**Logic:**
```typescript
interface SimulationEngine {
  // Run what-if simulation
  runSimulation(config: SimulationConfig): SimulationResult;
  
  // Model goal projection
  projectGoal(goal: Goal, changes: Change[]): Projection;
  
  // Calculate compound effects
  calculateCompoundEffects(changes: Change[]): Effect[];
  
  // Generate confidence intervals
  getConfidenceIntervals(projection: Projection): Interval[];
  
  // Compare multiple scenarios
  compareScenarios(scenarios: Scenario[]): ComparisonResult;
}
```

**Dependencies:** All engines, Historical data, Market trends
**User Value:** Advanced planning, informed changes

---

### Insight Types

| Type | Description | Engine | Priority |
|------|-------------|--------|----------|
| **Renewal Alert** | Upcoming subscription renewal | Pattern | High |
| **Price Increase** | Detected price change | Pattern | High |
| **Savings Opportunity** | Cheaper alternative found | Recommendation | High |
| **Billing Optimization** | Annual vs monthly savings | Recommendation | Medium |
| **Unused Subscription** | No usage detected | Pattern | Medium |
| **Goal On Track** | Goal progress positive | Goal | Medium |
| **Spending Spike** | Unusual spending detected | Pattern | High |
| **Milestone Reached** | Goal milestone achieved | Goal | Medium |
| **Usage Reminder** | Subscription due soon | Behavior | Low |
| **Category Insight** | Category spending analysis | Pattern | Low |

---

## SECTION 9: Feature Lock Matrix

| Feature | Basic (Free) | Pro ($4.99/mo) | Elite ($9.99/mo) |
|---------|:------------:|:--------------:|:-----------------:|
| **SUBSCRIPTION TRACKING** | | | |
| Track subscriptions | ✅ Unlimited | ✅ Unlimited | ✅ Unlimited |
| Add manually | ✅ | ✅ | ✅ |
| Search popular services | ✅ | ✅ | ✅ |
| View subscription detail | ✅ | ✅ | ✅ |
| Edit subscriptions | ✅ | ✅ | ✅ |
| Delete subscriptions | ✅ | ✅ | ✅ |
| Category management | Basic | Advanced | Custom |
| **DASHBOARD** | | | |
| Financial Health Score | ✅ | ✅ | ✅ |
| AI Insight of the Day | ✅ | ✅ | ✅ |
| Upcoming renewals | ✅ | ✅ | ✅ |
| Goal progress widget | ✅ | ✅ | ✅ |
| Historical trends | — | ✅ 3 months | ✅ 12 months |
| Benchmark comparison | — | ✅ | ✅ |
| Custom widgets | — | — | ✅ |
| **INSIGHTS (MONEY TWIN)** | | | |
| Basic insights | ✅ 5/month | ✅ Unlimited | ✅ Unlimited |
| AI reasoning visible | — | ✅ | ✅ |
| Savings opportunities | Basic | Advanced | Full |
| Pattern analysis | — | ✅ | ✅ |
| Custom insight parameters | — | — | ✅ |
| **ANALYTICS** | | | |
| Spending trends | — | ✅ | ✅ |
| Category breakdown | — | ✅ | ✅ |
| Historical comparison | — | ✅ 3 months | ✅ 12 months |
| Export reports | — | PDF | PDF + Excel + CSV |
| **GOALS** | | | |
| Create goals | ✅ 3 goals | ✅ 10 goals | ✅ Unlimited |
| Progress tracking | ✅ | ✅ | ✅ |
| AI predictions | — | ✅ | ✅ |
| Linked subscriptions | — | ✅ 5 | ✅ Unlimited |
| Milestone alerts | — | ✅ | ✅ |
| Goal templates | — | ✅ | ✅ |
| **RECOMMENDATIONS** | | | |
| Alternative suggestions | — | ✅ | ✅ |
| Plan optimization | — | ✅ | ✅ |
| Bundle opportunities | — | — | ✅ |
| **NOTIFICATIONS** | | | |
| Renewal reminders | ✅ 3/day | ✅ 10/day | ✅ Unlimited |
| Spending alerts | Basic | Advanced | Custom |
| Smart timing | — | ✅ | ✅ |
| Custom schedules | — | — | ✅ |
| **PORTFOLIO** | | | |
| Single account | ✅ | ✅ | ✅ |
| Multi-account | — | — | ✅ |
| Account grouping | — | — | ✅ |
| **SIMULATIONS** | | | |
| What-If scenarios | — | — | ✅ |
| Goal projection | — | — | ✅ |
| Compound effect modeling | — | — | ✅ |
| **REPORTS** | | | |
| Monthly digest | — | ✅ | ✅ |
| Annual summary | — | ✅ | ✅ |
| Custom report builder | — | — | ✅ |
| **INTEGRATIONS** | | | |
| Data export | — | ✅ | ✅ |
| API access | — | — | ✅ |
| Webhook support | — | — | ✅ |
| **FAMILY/SHARED** | | | |
| Individual account | ✅ | ✅ | ✅ |
| Family sharing | — | — | ✅ 5 members |
| Shared goals | — | — | ✅ |
| Collaborative tracking | — | — | ✅ |
| **SUPPORT** | | | |
| Standard support | ✅ | ✅ | ✅ |
| Priority support | — | ✅ | ✅ |
| Dedicated account manager | — | — | ✅ |
| **PRICING** | Free | $4.99/mo | $9.99/mo |
| Annual discount | — | $39.99/yr (-33%) | $79.99/yr (-33%) |

---

## SECTION 10: Apple HIG Compliance Audit

### Navigation Compliance

| Element | HIG Requirement | Current State | Status |
|---------|----------------|--------------|--------|
| **Tab Bar Height** | 49pt minimum (83pt with home indicator) | 56px (7pt over) | ✅ Compliant |
| **Tab Bar Position** | Bottom of screen | Bottom (fixed) | ✅ Compliant |
| **Tab Count** | 3-5 tabs recommended | 5 tabs | ✅ Compliant |
| **Tab Icons** | 25-28pt SF Symbols or equivalent | 22-24px Lucide | ⚠️ Close |
| **Tab Labels** | 10pt minimum, readable | 11px | ✅ Compliant |
| **Safe Area** | Respect top/bottom insets | ✅ Implemented | ✅ Compliant |

**Recommended Changes:**
- Consider using SF Symbols where available for native feel
- Icon size: Increase from 22px to 24px for primary tabs

---

### Spacing Compliance

| Element | HIG Requirement | Current State | Status |
|---------|----------------|--------------|--------|
| **Touch Targets** | 44×44pt minimum | 48×48px | ✅ Compliant |
| **Inter-element spacing** | 8pt minimum between targets | 8px | ✅ Compliant |
| **Margins** | 16pt standard, 20pt large screens | 16px | ✅ Compliant |
| **Content insets** | Match system conventions | Custom | ✅ Compliant |
| **Grouped content** | 12-16pt spacing | 12-16px | ✅ Compliant |

---

### Typography Compliance

| Element | HIG Requirement | Current State | Status |
|---------|----------------|--------------|--------|
| **System fonts** | SF Pro recommended | Space Grotesk + Kanit | ✅ Acceptable |
| **Dynamic Type** | Support all sizes | Not implemented | ⚠️ Needs |
| **Minimum body text** | 17pt at default | 16px ≈ 12pt | ⚠️ Small |
| **Label text** | 13pt minimum | 11px (10pt) | ⚠️ Small |
| **Font weights** | Use system weights | Custom weights | ✅ Acceptable |

**Recommended Changes:**
- Increase body text to 17px (17pt equivalent)
- Increase label text to 13px minimum
- Implement Dynamic Type support for accessibility

---

### Safe Area Compliance

| Element | HIG Requirement | Current State | Status |
|---------|----------------|--------------|--------|
| **Notch handling** | Content below notch | ✅ Safe area wrapper | ✅ Compliant |
| **Home indicator** | Respect bottom inset | ✅ env(safe-area-inset-bottom) | ✅ Compliant |
| **Status bar** | Avoid overlap | ✅ Padding applied | ✅ Compliant |
| **Landscape** | Adapt layout | Not tested | ⚠️ Test needed |

---

### Touch Target Compliance

| Element | HIG Requirement | Current State | Status |
|---------|----------------|--------------|--------|
| **Minimum size** | 44×44pt | 48×48px | ✅ Compliant |
| **Recommended size** | 48×48pt preferred | 48×48px | ✅ Compliant |
| **Primary CTAs** | 44pt minimum | 52px | ✅ Compliant |
| **Interactive areas** | Adequate spacing | 8px gap | ✅ Compliant |

---

### Motion Compliance

| Element | HIG Requirement | Current State | Status |
|---------|----------------|--------------|--------|
| **Duration** | 200-400ms for transitions | 200-300ms | ✅ Compliant |
| **Easing** | System curves preferred | Custom curves | ✅ Acceptable |
| **Reduced motion** | Respect system setting | Not implemented | ⚠️ Needs |
| **Spring animations** | Use native physics | Framer Motion | ✅ Acceptable |

**Recommended Changes:**
- Implement `prefers-reduced-motion` media query
- Add spring configurations matching iOS native feel

---

### Accessibility Compliance

| Element | HIG Requirement | Current State | Status |
|---------|----------------|--------------|--------|
| **VoiceOver labels** | All interactive elements | Partial | ⚠️ Incomplete |
| **Dynamic Type** | Scale with system | Not implemented | ⚠️ Needs |
| **Increase contrast** | 7:1 for body, 4.5:1 for large | ~14:1 / ~5.5:1 | ✅ Compliant |
| **Button labels** | Descriptive, no "button" | Descriptive | ✅ Compliant |
| **Focus indicators** | Visible focus state | ✅ Implemented | ✅ Compliant |

**Recommended Changes:**
- Add `accessibilityLabel` to all interactive elements
- Implement Dynamic Type scaling
- Test with VoiceOver

---

### Gesture Compliance

| Element | HIG Requirement | Current State | Status |
|---------|----------------|--------------|--------|
| **System gestures** | Don't block iOS gestures | Safe area respected | ✅ Compliant |
| **Swipe back** | Support system back gesture | Not implemented | ⚠️ Recommend |
| **Pull to refresh** | Standard pattern | ✅ Implemented | ✅ Compliant |
| **Long press** | Use for context menus | Not implemented | ⚠️ Recommend |

---

### Visual Hierarchy Compliance

| Element | HIG Requirement | Current State | Status |
|---------|----------------|--------------|--------|
| **Font scaling** | Clear hierarchy, 3 levels max | 5+ levels | ⚠️ Complex |
| **Color usage** | Intentional, not decorative | Intentional | ✅ Compliant |
| **Contrast** | 4.5:1 minimum | 5.5:1+ | ✅ Compliant |
| **Emphasis** | One primary action per view | Multiple | ⚠️ Review |

---

### Summary: Apple HIG Compliance Status

| Category | Compliant | Needs Work | Total |
|----------|:---------:|:----------:|:-----:|
| Navigation | 5 | 1 | 6 |
| Spacing | 5 | 0 | 5 |
| Typography | 2 | 3 | 5 |
| Safe Areas | 4 | 1 | 5 |
| Touch Targets | 4 | 0 | 4 |
| Motion | 3 | 1 | 4 |
| Accessibility | 2 | 3 | 5 |
| Gestures | 2 | 2 | 4 |
| Visual Hierarchy | 2 | 2 | 4 |
| **TOTAL** | **29** | **13** | **42** |

**Overall Compliance: ~69%**

**Priority Improvements:**
1. **P0:** Implement Dynamic Type
2. **P0:** Add VoiceOver labels throughout
3. **P1:** Add reduced motion support
4. **P1:** Implement swipe back gesture
5. **P2:** Icon size increase to 24px

---

## SECTION 11: UX Laws Analysis

### Hick's Law — Decision Time

**Principle:** "The time it takes to make a decision increases with the number and complexity of choices."

**Application to PicksWise:**

| Screen | Current State | Application |
|--------|--------------|------------|
| Dashboard | 5+ insights visible | ✅ Good — one hero insight |
| Subscription list | Unlimited items | ⚠️ Filter chips reduce options |
| Add subscription | 50+ services | ⚠️ Quick-add reduces to 6 |
| Insights | Multiple categories | ⚠️ Need prioritization |

**Design Impact:**
- Dashboard shows only 1 "AI Insight of the Day" — reduces choice overload
- Quick-add chips limit initial options to 6 popular services
- Filter chips on subscription list reduce visible options
- Progressive disclosure reveals more options on demand

**Recommendation:** Continue limiting visible choices; show top 3 recommendations max per category.

---

### Fitts's Law — Pointing & Selection

**Principle:** "The time to acquire a target is a function of the distance to and size of the target."

**Application to PicksWise:**

| Element | Size | Distance | Status |
|---------|------|----------|--------|
| Tab bar items | 48×48px | Edge to center | ✅ Easy |
| FAB button | 56×56px | Bottom-right | ✅ Good |
| Action buttons | 52px height | Variable | ✅ Good |
| Back button | 44×44px | Top-left corner | ✅ Accessible |

**Design Impact:**
- Touch targets exceed Apple HIG minimum (44px) — comfortable for users
- Floating pill navigation positioned for thumb reach
- FAB positioned for right-thumb access on most phones

**Recommendation:** Maintain minimum 44px touch targets; consider gesture shortcuts for power users.

---

### Miller's Law — Information Chunking

**Principle:** "The average person can only keep 7 (plus or minus 2) items in their working memory."

**Application to PicksWise:**

| Data Type | Items Shown | Chunking Strategy |
|-----------|-------------|-------------------|
| Tab navigation | 5 tabs | ✅ Well within limit |
| Dashboard cards | 4-5 sections | ✅ Chunked by purpose |
| Subscription categories | 8-10 categories | ⚠️ Consider grouping |
| Insight types | 10+ types | ⚠️ Need hierarchy |

**Design Impact:**
- 5 tabs work well for working memory
- Dashboard sections chunked: Health → Insight → Renewals → Goals
- Categories could be grouped: Entertainment, Utilities, Software, Health, etc.

**Recommendation:** Group subscription categories into 4-5 high-level groups for better comprehension.

---

### Jakob's Law — User Familiarity

**Principle:** "Users spend most of their time on other sites. This means users prefer your site to work the same way as all the other sites they know."

**Application to PicksWise:**

| Pattern | Industry Standard | PicksWise | Status |
|---------|-----------------|-----------|--------|
| Bottom navigation | iOS/Android standard | ✅ Floating pill | ✅ Acceptable variant |
| Swipe actions | Common in apps | ⚠️ Not implemented | ⚠️ Add |
| Pull to refresh | Standard | ✅ Implemented | ✅ Good |
| Tab icons | SF Symbols style | ⚠️ Lucide | ✅ Acceptable |
| Card layout | Standard cards | ✅ Used | ✅ Good |

**Design Impact:**
- Follows established patterns for familiarity
- Floating pill is a known pattern (Tesla, Apple Music)
- Standard gestures (swipe, pull) should be supported

**Recommendation:** Add swipe actions on subscription list to match industry patterns.

---

### Tesler's Law — Complexity Management

**Principle:** "Every application has an inherent amount of complexity that cannot be removed or hidden."

**Application to PicksWise:**

| Complexity Type | Handled By | Status |
|----------------|------------|--------|
| Financial calculations | AI engine | ✅ Hidden |
| Spending patterns | Visualization | ✅ Simplified |
| Goal tracking | Progress widgets | ✅ Abstracted |
| Subscription management | CRUD forms | ⚠️ Some complexity visible |
| AI reasoning | Insight cards | ✅ Explanation provided |

**Design Impact:**
- AI engine handles complex calculations — user sees simple insights
- Financial data visualized simply — users don't see raw numbers
- Goal progress shown as progress ring, not spreadsheet

**Recommendation:** Continue hiding complexity; ensure all complexity has a purpose.

---

### Peak-End Rule — Memory & Recall

**Principle:** "People judge experiences largely on how they were at their peak and at their end, rather than the sum of every moment."

**Application to PicksWise:**

| Moment | Peak Experience | End Experience |
|--------|-----------------|----------------|
| Onboarding | First subscription added | Dashboard revealed |
| Insight action | Savings realized | Confirmation toast |
| Goal completion | Milestone reached | Celebration animation |
| Monthly review | Total savings shown | Report generated |

**Design Impact:**
- Onboarding ends with satisfying dashboard reveal
- Celebration animations on goal milestones create peak moments
- Confirmation toasts provide satisfying endings to actions

**Recommendation:** Ensure every flow has a memorable peak and satisfying end.

---

### Goal Gradient Effect — Motivation

**Principle:** "The tendency to approach a goal increases with proximity to the goal."

**Application to PicksWise:**

| Goal Element | Gradient Effect | Status |
|--------------|-----------------|--------|
| Progress ring | Visual progress increases motivation | ✅ Good |
| Milestone markers | Visible sub-goals encourage continued effort | ✅ Good |
| Completion prediction | Shows when goal will be reached | ✅ Excellent |
| Almost-there messaging | "42% complete — you're close!" | ⚠️ Implement |

**Design Impact:**
- Progress rings provide constant visual feedback
- Milestone markers break large goals into achievable chunks
- AI predictions show realistic completion timelines

**Recommendation:** Add "almost there" messaging when approaching milestones (90%+).

---

### Progressive Disclosure — Information Architecture

**Principle:** "Show only what is needed at each step."

**Application to PicksWise:**

| Screen | First View | Progressive Disclosure |
|--------|------------|----------------------|
| Dashboard | Health score + top insight | Tap for breakdown |
| Insight card | Summary | Tap for full reasoning |
| Subscription | Name + price | Tap for history |
| Goal | Progress ring | Tap for details |

**Design Impact:**
- Dashboard shows hero metric, details on tap
- Insight cards show summary, full reasoning hidden
- Progressive disclosure prevents overwhelm

**Recommendation:** Continue this pattern; ensure every screen has a clear "first view."

---

### Von Restorff Effect — Distinctiveness

**Principle:** "Items that stand out from their peers are more memorable."

**Application to PicksWise:**

| Element | Distinctive Treatment | Status |
|---------|----------------------|--------|
| Active tab | Lime fill + pill bg | ✅ Triple-encoding |
| AI insights | Lime border glow | ✅ Distinguishes from regular cards |
| Premium features | Lock icon + badge | ✅ Clear distinction |
| Health score | Large display number | ✅ Hero treatment |
| Alert items | Warning color | ✅ Color coding |

**Design Impact:**
- Active states use triple-encoding (color + fill + pill) for memorability
- AI insights have lime border to stand out
- Premium features clearly marked with lock badges

**Recommendation:** Continue distinctive treatment for important elements.

---

### Aesthetic-Usability Effect — Perceived Quality

**Principle:** "Aesthetic design is perceived as more usable."

**Application to PicksWise:**

| Aesthetic Element | Impact | Status |
|------------------|--------|--------|
| Floating pill nav | Premium feel | ✅ Strong |
| Smooth animations | Polished experience | ✅ Good |
| Consistent spacing | Professional look | ✅ Good |
| Dark theme | Sophisticated feel | ✅ Strong |
| Micro-interactions | Delight factor | ⚠️ Needs work |

**Design Impact:**
- Dark theme with lime accent creates distinctive, premium aesthetic
- Smooth animations (200-300ms) enhance perceived quality
- Consistent spacing (8px grid) creates professional appearance

**Recommendation:** Continue polish on micro-interactions; they're the difference between good and great.

---

## SECTION 12: Design QA Checklist

### Layout Verification

```
□ Screen follows 8px grid system
□ Margins are 16px on mobile
□ Content does not extend beyond safe areas
□ No horizontal scroll on any screen
□ Vertical rhythm is consistent (multiples of 8px)
□ Hero section is visually dominant
□ Content density is appropriate for context
□ Empty states have proper spacing
□ Modal/bottom sheet has proper padding (20px)
```

### Component Verification

```
□ Cards have 16px corner radius
□ Buttons have 12px corner radius
□ Input fields have 10px corner radius
□ Shadows follow elevation scale (sm, md, lg)
□ Cards have 16-20px internal padding
□ Touch targets are minimum 44×44px
□ Touch targets have 8px spacing between them
□ Icons are aligned with text (center or left)
□ Text input labels are above input fields
□ Button text is centered
□ Loading states show skeleton shimmer
□ Error states have red border + message below
```

### Spacing Verification

```
□ Section spacing is 24px
□ Card gap is 12px
□ List item spacing is 12px
□ Icon-to-text spacing is 8px
□ Button padding follows size tokens
□ Input padding is 12px 16px
□ Header padding is 16px
□ Footer padding matches header
□ Between related items: 8-12px
□ Between sections: 24px
□ Screen edge margin: 16px
```

### Typography Verification

```
□ Heading 1: 24px, Semibold (600)
□ Heading 2: 20px, Semibold (600)
□ Heading 3: 18px, Medium (500)
□ Body: 16px, Regular (400)
□ Caption: 14px, Regular (400)
□ Label: 12px, Medium (500)
□ Micro: 10-11px, Medium (500)
□ All text has proper line height (1.4-1.6)
□ Text never truncates without ellipsis
□ Font fallback is system-ui
```

### Color Verification

```
□ Background uses semantic tokens (--bg-canvas, --bg-surface-1)
□ Text uses semantic tokens (--text-primary, --text-secondary)
□ Brand lime (#CDFF24) used sparingly
□ Semantic colors match meaning (success=green, error=red)
□ No color used alone for meaning (pair with icon/text)
□ Interactive states have hover/active variants
□ Disabled states have reduced opacity
□ Focus states have visible outline
□ Dark theme is default and only theme
```

### Accessibility Verification

```
□ All images have alt text
□ All icons have aria-label (or hidden from AT)
□ Touch targets are minimum 44×44px
□ Color contrast is 4.5:1 minimum (WCAG AA)
□ Large text contrast is 3:1 minimum
□ Focus indicators are visible
□ Tab order is logical
□ Screen reader announces dynamic content
□ Reduced motion is respected (prefers-reduced-motion)
□ Text scales to 200% without breaking
□ No content lost at 200% text size
```

### Motion Verification

```
□ Duration is 100-400ms (not instant, not slow)
□ Easing uses ease-out for interactions
□ Page transitions use 200-300ms
□ Micro-interactions use 100-150ms
□ Loading states use skeleton shimmer
□ No motion that blocks interaction
□ Animation serves purpose (orient, feedback, delight)
□ Respects prefers-reduced-motion
□ Transform and opacity used (GPU-accelerated)
□ No animating layout properties (width, height, top, left)
```

### Dark Mode Verification

```
□ Background is #0B0F0A (dark)
□ Surface colors are elevated (#171C15, #1E241C)
□ Text is white (#FFFFFF) on dark
□ Secondary text is muted (#A0A9A0)
□ Borders are subtle (rgba white at 10%)
□ Cards have slight elevation
□ No pure black (#000000) anywhere
□ No pure white (#FFFFFF) except on text
□ Interactive elements have subtle hover states
□ Icons inherit text color (not hardcoded white)
```

### Responsive Verification

```
□ Layout adapts to screen width
□ Minimum supported width: 375px (iPhone SE)
□ Maximum content width: 430px (tablet)
□ Bottom navigation is fixed and accessible
□ Cards stack properly at all sizes
□ Typography scales appropriately
□ Images are responsive (max-width: 100%)
□ No horizontal overflow at any width
```

### Interaction Verification

```
□ All buttons have tap feedback (scale or opacity)
□ Swipe gestures are discoverable
□ Pull-to-refresh is functional
□ Long-press reveals context menu (where appropriate)
□ Haptic feedback on important actions
□ Loading states prevent double-taps
□ Form submission shows loading indicator
□ Success/error feedback is immediate
□ Undo is available for destructive actions
□ Back navigation works correctly
```

### Visual Consistency Verification

```
□ Same components look same everywhere
□ Spacing is consistent across screens
□ Typography scale is followed
□ Color tokens are used (not hardcoded)
□ Component states are complete (all permutations)
□ No orphaned components or screens
□ Animation timing is consistent
□ Icon style is consistent (stroke weight, size)
□ Border radius is consistent (per component type)
□ Shadow levels are consistent (per elevation)
```

---

## Document Control

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2026-07-11 | Senior UX Architect | Initial Product Design Bible |

---

**End of Product Design Bible**

*This document is the Single Source of Truth (SSOT) for all PicksWise UX/UI work.*
*Any design decisions must align with this document.*
*Updates to this document require architectural review.*
