# Design System Specification: Academic Precision & Momentum

## 1. Overview & Creative North Star
This design system is built to transform the digital prep-university experience from a static repository into a high-performance academic cockpit. Our Creative North Star is **"The Academic Architect."** 

We are moving away from the "generic LMS" look. Instead of a flat, grid-locked interface, we utilize **Intentional Asymmetry** and **Tonal Depth**. The layout should feel authoritative yet breathable—like a premium editorial magazine mixed with a high-end productivity tool. We break the "template" feel by using dramatic typography scales and overlapping elements that guide the student’s eye toward what matters most: their progress and the live classroom.

## 2. Colors: The Chromotherapy of Success
While the palette is rooted in institutional tradition, the application must feel contemporary. We use a sophisticated hierarchy of reds and grays to define focus without causing cognitive fatigue.

*   **Primary Engine:** Use `primary` (#af101a) for core brand moments and `primary_container` (#d32f2f) for high-action states.
*   **The "No-Line" Rule:** Explicitly prohibit the use of 1px solid borders for sectioning. Boundaries must be defined solely through background color shifts. For example, a `surface-container-low` (#f3f3f3) sidebar sitting against a `surface` (#f9f9f9) main area creates a clean, sophisticated break that lines cannot achieve.
*   **Surface Hierarchy & Nesting:** Treat the UI as physical layers.
    *   **Base:** `surface` (#f9f9f9)
    *   **Sections:** `surface-container-low` (#f3f3f3)
    *   **Interactive Cards:** `surface-container-lowest` (#ffffff)
    *   **Nesting:** A `surface-container-lowest` card should live on top of a `surface-container` (#eeeeee) zone to create natural, effortless depth.
*   **Glass & Gradient Rule:** To avoid a "flat" appearance, floating navigation or top bars should utilize Glassmorphism: `surface` color at 80% opacity with a `20px` backdrop-blur. 
*   **Signature Textures:** For the "Live Class" hero or major CTA sections, use a subtle linear gradient from `primary` (#af101a) to `primary_container` (#d32f2f) at a 135-degree angle. This adds "soul" and professional polish.

## 3. Typography: Editorial Authority
We utilize a dual-font strategy to balance prestige with extreme utility.

*   **Display & Headlines (Manrope):** Chosen for its geometric precision. Use `display-lg` (3.5rem) for motivational headers and `headline-md` (1.75rem) for section titles. The generous x-height of Manrope feels modern and optimistic.
*   **Body & Labels (Inter):** The industry standard for readability. Use `body-lg` (1rem) for lesson descriptions and `label-md` (0.75rem) for metadata (e.g., "30 mins remaining").
*   **Hierarchy Tip:** Pair a `display-sm` headline with a `label-md` in all-caps (0.05em letter spacing) directly above it to create a sophisticated, editorial "kicker" effect.

## 4. Elevation & Depth: Atmospheric Layering
Forget heavy drop shadows. We communicate hierarchy through **Tonal Layering** and light.

*   **The Layering Principle:** Depth is achieved by "stacking" the surface tokens. A card shouldn't just have a shadow; it should be a lighter tone (`surface-container-lowest`) than the ground it sits on (`surface-container`).
*   **Ambient Shadows:** When a card must float (e.g., a "Join Live" modal), use an extra-diffused shadow: `offset-y: 8px`, `blur: 24px`, color: `on-surface` at 6% opacity. This mimics natural ambient light.
*   **The "Ghost Border" Fallback:** If a container requires more definition (e.g., in high-glare mobile environments), use a "Ghost Border": `outline-variant` (#e4beba) at 15% opacity. Never use 100% opaque borders.
*   **Glassmorphism:** For mobile bottom-sheets and floating action buttons, use the `surface_tint` at low opacity with a blur to ensure the content underneath "bleeds" through, maintaining a sense of place.

## 5. Components: Tactile Precision

### Buttons (The "Touch-First" Paradigm)
*   **Primary:** Solid `primary` (#af101a) with `on_primary` (#ffffff) text. Use `xl` (1.5rem) corner radius. Min height: `3.5rem` (Spacing `10`) for mobile accessibility.
*   **Secondary:** `secondary_container` (#e4e2e1) background with `on_secondary_container` (#656464) text. No border.
*   **The Pulse (Live Indicator):** A `primary` circle with two concentric rings of the same color at 40% and 10% opacity, expanding and fading via a CSS keyframe.

### Cards & Materials List
*   **Card Style:** Use `surface-container-lowest` (#ffffff) with `xl` (1.5rem) rounding. 
*   **The "No-Divider" Rule:** In lists of materials or schedules, do not use lines. Separate items using `2.5` (0.85rem) of vertical whitespace or by alternating background tones between `surface` and `surface-container-low`.
*   **Touch Targets:** Every list item must have a minimum vertical hit area of `Spacing 12` (4rem).

### Input Fields
*   **Style:** Filled style using `surface-container-high` (#e8e8e8). 
*   **Indicator:** A 2px bottom bar using `primary` appears only on focus.
*   **Rounding:** `sm` (0.25rem) for a more "structured" and "serious" academic feel compared to the rounder buttons.

### Additional Signature Component: The Progress Orbit
For student tracking, instead of a standard bar, use a semi-circular stroke with a gradient of `primary` to `tertiary_fixed_dim`. This adds a custom, premium feel to the dashboard.

## 6. Do's and Don'ts

### Do
*   **Do** use `Spacing 8` (2.75rem) for page gutters on mobile to create a "boutique" feel.
*   **Do** overlap images or badges over the edge of cards to break the "boxed-in" look.
*   **Do** use `tertiary` (#005f7b) for success states or "Material Downloaded" indicators to contrast against the brand red.

### Don't
*   **Don't** use pure black (#000000) for text. Use `on_surface` (#1a1c1c) for better long-form reading comfort.
*   **Don't** use `DEFAULT` (0.5rem) rounding for cards; it looks too "templated." Use `lg` (1rem) or `xl` (1.5rem) for a more bespoke appearance.
*   **Don't** place a shadow on every card. Only shadow the "Active" or "Floating" elements. Let tone do the work for the rest.