# Design System Specification: The Cognitive Curator

This design system is a high-end framework crafted for a premium AI-driven career ecosystem. We move beyond the "template" aesthetic by embracing an editorial, layered approach that treats the interface as a living, breathing workspace rather than a static grid.

## 1. Overview & Creative North Star
**The Creative North Star: "The Intelligent Atmosphere"**
Our goal is to create an environment that feels both authoritative and ethereal. We achieve this through **Organic Asymmetry** and **Tonal Depth**. Instead of boxing content into rigid rows, we use varying surface heights and generous whitespace to guide the eye. The UI should feel like a curated gallery of opportunities, where AI components appear not as "widgets," but as translucent layers of insight floating atop a stable, professional foundation.

---

## 2. Color & Surface Architecture
We move away from the "flat web" by using a sophisticated palette of deep indigos and vibrant synthetics.

### The Color Logic
*   **Primary (`#333697`) & Secondary (`#5445cf`):** These are our "Trust & Innovation" anchors. Use Primary for structural branding and Secondary for "active" AI states.
*   **Tertiary (`#004a54`):** Reserved for "Success" or "Growth" metrics within the learning platform.
*   **Surface Containers:** We use a range from `surface-container-lowest` (#ffffff) to `surface-container-highest` (#e0e3e5) to define hierarchy.

### The "No-Line" Rule
**Explicit Instruction:** Do not use 1px solid borders to section off content. Boundaries must be defined solely through background color shifts. 
*   *Example:* A `surface-container-low` (#f2f4f6) sidebar sitting against a `surface` (#f7f9fb) main content area. This creates a "soft edge" that feels more premium and less cluttered.

### The "Glass & Gradient" Rule
To signify AI-powered features, utilize Glassmorphism.
*   **Execution:** Apply a semi-transparent `surface-container-lowest` with a `backdrop-blur` (16px–24px). 
*   **Signature Textures:** Use a subtle linear gradient from `primary` (#333697) to `primary_container` (#4b4fb0) for hero sections or high-impact CTAs to add "soul" and depth.

---

## 3. Typography: The Editorial Voice
We use a dual-font system to balance character with utility. 

*   **Display & Headlines (Manrope):** A geometric sans-serif that feels tech-forward yet approachable. 
    *   *Role:* Use `display-lg` (3.5rem) for hero statements to create a high-contrast, editorial feel. 
*   **Body & Labels (Inter):** Chosen for its exceptional legibility at small scales. 
    *   *Role:* `body-md` (0.875rem) is the workhorse for job descriptions and course content.

**Hierarchy Tip:** Maximize the scale contrast. Don't be afraid to pair a `display-sm` headline directly with `body-sm` metadata to create a sophisticated, "sparse" aesthetic.

---

## 4. Elevation & Depth: Tonal Layering
Traditional drop shadows are largely forbidden. We build depth through the **Layering Principle**.

*   **Tonal Stacking:** Place a `surface-container-lowest` card on a `surface-container-low` section. The minute shift from #ffffff to #f2f4f6 provides all the "lift" required.
*   **Ambient Shadows:** If a floating element (like a modal) is required, use a shadow with a blur of 40px and 4% opacity. The shadow color must be a tinted version of `on-surface` (#191c1e), never pure black.
*   **The Ghost Border:** If a container needs more definition for accessibility, use the `outline_variant` (#c5c5d4) at **15% opacity**. It should be felt, not seen.

---

## 5. Component Guidelines

### Buttons: The Interaction Points
*   **Primary:** Solid `primary` background with `on_primary` text. Use `lg` (1rem) rounding.
*   **AI Action:** Utilize a subtle gradient from `secondary` to `primary_container`. 
*   **Tertiary:** No background; use `secondary` text. Hover state reveals a `surface-container-high` subtle fill.

### Cards: The Job & Course Units
*   **Style:** No borders. Use `surface-container-lowest` (#ffffff) on a `surface` (#f7f9fb) background.
*   **Spacing:** Use `xl` (1.5rem) internal padding to provide "breathing room."
*   **Interaction:** On hover, shift the background to `surface-container-highest` or apply a 4px vertical translation.

### Glassmorphic AI Insights
*   **Context:** Used for AI job-match scores or learning recommendations.
*   **Style:** `surface-container-lowest` at 60% opacity with a 20px blur. This makes the AI feel like an "overlay" on top of the standard data.

### Input Fields
*   **Style:** Subtle `surface-container-highest` background. No border in the default state.
*   **Focus State:** A 2px "Ghost Border" of `secondary` at 40% opacity.

---

## 6. Do’s and Don’ts

### Do:
*   **Do** use asymmetrical layouts. A heavy text block on the left balanced by a floating glass card on the right creates a custom, high-end feel.
*   **Do** use the `tertiary_fixed_dim` (#28d9f3) as a highlight color for small "New" or "Live" badges.
*   **Do** embrace whitespace. If you think there is enough space, add 16px more.

### Don't:
*   **Don't** use 100% opaque, high-contrast borders. It breaks the "Intelligent Atmosphere."
*   **Don't** use standard Material Design "Floating Action Buttons." They feel too "utility-app" for this editorial experience.
*   **Don't** use dividers. If two pieces of content need separation, use an 80px vertical gap or a subtle change in surface tone.

---

## 7. Roundedness Scale
*   **sm (4px):** Selection indicators, small badges.
*   **DEFAULT (8px):** Input fields, small cards.
*   **md (12px):** Standard cards, buttons, AI modules.
*   **xl (24px):** Large hero sections, modal containers.