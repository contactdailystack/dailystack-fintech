# PicksWise Design System & Consistency Guidelines

All screens and feature developments in PicksWise (DailyStack FinTech) must adhere to these consistency guidelines using the **Home (Dashboard)** and **Net Worth** screens as the design references (Source of Truth).

## Core Reference Specs

*   **Background:** Pure White (`#FFFFFF`) for page content container backgrounds.
*   **Primary Hero Card:** Premium Black (`#0A0A0A`), border `#151515`, text `#FFFFFF`, accent `#C6FF1A`.
*   **Secondary Cards & Containers:** Soft Gray (`#F5F5F5`), border `#E5E5E5`, text `#111827`, subtitles `#666666`.
*   **Brand Highlights / Focus Accents:** Pilo Lime (`#C6FF1A`).
*   **Typography Scale:**
    *   Title: Space Grotesk / Inter bold (`text-2xl`), color `#111827`.
    *   Metadata / Sublabel: Kanit / Inter text-xs (`text-zinc-500` / `#666666`).
    *   Monospace: JetBrains Mono (`font-mono`) for amounts and numbers.
*   **Corner Radius:**
    *   Large containers / Stats grid: `rounded-[24px]` or `rounded-[32px]`.
    *   List Items / Smaller cards: `rounded-[20px]`.
    *   Action pills / Buttons: `rounded-full`.
*   **Layout Spacing:**
    *   Horizontal margins: Mobile (`px-6`), Desktop (`px-8` or `px-12`).
    *   Top padding: Top safe area only, minimal layout padding.
*   **Interactive Sheet Modals (iOS Pattern):**
    *   Slide-up from bottom on mobile (`rounded-t-[24px]` / `rounded-t-[32px]`).
    *   Centered popup on desktop (`rounded-[32px]`).
    *   Backdrop: `bg-black/60 backdrop-blur-sm`.
    *   Inputs: Background `#F5F5F5`, border `#E5E5E5`, focus ring `#C6FF1A`.
