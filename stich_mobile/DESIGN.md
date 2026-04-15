# Design System Document

## 1. Overview & Creative North Star: "The Digital Larder"

This design system is built upon the philosophy of **"The Digital Larder"**—a concept that treats grocery shopping not as a chore of clicking buttons, but as a sensory, human-centric experience. It rejects the "supermarket warehouse" aesthetic in favor of a high-end editorial feel that is raw, minimalist, and deeply intentional. 

The goal is to break the rigid, boxed-in templates of traditional e-commerce. We achieve this through **Organic Brutalism**: using a clean, spacious layout where elements are permitted to breathe, asymmetrically overlap, and exist without the confinement of heavy borders. The system prioritizes tactile depth, "human" typography, and a tonal palette that evokes the earth, stone, and sun-bleached linens.

---

## 2. Colors: Tonal Depth over Structural Lines

The color strategy is grounded in neutrals (`background: #faf9f7`) with subtle, earthy accents (`primary: #576158` - an olive-sage) to create a "raw" feel.

*   **The "No-Line" Rule:** To maintain a premium editorial feel, **1px solid borders for sectioning are strictly prohibited.** Content boundaries must be defined solely through background color shifts. For example, a product gallery in `surface-container-low` should sit on a `surface` background without a stroke.
*   **Surface Hierarchy & Nesting:** Treat the UI as layers of fine paper. 
    *   **Level 0 (Base):** `surface` (#faf9f7).
    *   **Level 1 (Subtle Inset):** `surface-container-low` (#f3f4f1) for secondary content.
    *   **Level 2 (Active Cards):** `surface-container-lowest` (#ffffff) to provide a soft, high-contrast "lift."
*   **The "Glass & Gradient" Rule:** For floating navigation or top-tier overlays, use **Glassmorphism**. Apply `surface` at 80% opacity with a `24px` backdrop-blur to allow the rich product photography to bleed through, softening the interface.
*   **Signature Textures:** For main CTAs, use a subtle linear gradient from `primary` (#576158) to `primary-dim` (#4b554c) at a 45-degree angle. This provides a visual "soul" that flat hex codes lack.

---

## 3. Typography: Editorial Authority

The typography pairs the structured elegance of **Epilogue** (Display/Headlines) with the approachable clarity of **Manrope** (Body/Labels).

*   **Display & Headline (Epilogue):** These are the "hero" elements. Use `display-lg` (3.5rem) with tight letter-spacing (-0.02em) to create an authoritative, editorial impact. This conveys the brand’s "Fresh" promise with raw power.
*   **Body & Titles (Manrope):** Chosen for its humanized, modern proportions. Use `body-lg` (1rem) for product descriptions and `title-sm` (1rem, Medium weight) for product names.
*   **Intentional Scale:** We use high-contrast scales. A massive `headline-lg` should often sit near a quiet `label-md` to create a rhythmic, non-traditional layout that feels curated.

---

## 4. Elevation & Depth: Tonal Layering

We move away from the "shadow-heavy" look of 2010s apps. Depth is achieved through **Ambient Light** and **Tonal Layering**.

*   **The Layering Principle:** Rather than adding shadows to every card, we stack `surface-container-lowest` cards on `surface-container` backgrounds. The subtle shift in hex code creates enough "lift" for the human eye to perceive hierarchy.
*   **Ambient Shadows:** Use shadows only for floating elements (e.g., "Add to Cart" sticky bars). Shadows must be extra-diffused: `0px 12px 32px rgba(47, 51, 49, 0.06)`. The tint is derived from `on-surface` (#2f3331) to look natural, never muddy.
*   **The "Ghost Border" Fallback:** If a border is required for accessibility (e.g., in a search input), use `outline-variant` (#afb3b0) at **15% opacity**. It should be felt, not seen.
*   **Glassmorphism:** Use semi-transparent `surface-container-highest` for modal backdrops to maintain a sense of space and continuity.

---

## 5. Components: Refined & Raw

### Buttons
*   **Primary:** Solid `primary` background with `on-primary` text. Use `roundedness.md` (0.375rem) to keep it feeling modern but grounded. Avoid "pill" shapes unless they are secondary chips.
*   **Secondary:** `surface-container-high` background with `on-surface` text. No border.

### Input Fields
*   **Refinement:** Move away from boxed inputs. Use a subtle `surface-container-low` background with a `2px` bottom-only highlight in `primary` during the active state.
*   **Human Touch:** Labels use `label-md` in `on-surface-variant`, positioned with generous 12px padding from the input area.

### Product Cards
*   **Rule:** **No divider lines.** Use `24px` vertical white space from the spacing scale to separate items.
*   **Organic Interaction:** On hover/active states, the card should transition from `surface` to `surface-container-lowest` with a soft ambient shadow.

### Chips (Filters)
*   Use `secondary-container` with `on-secondary-container` text. These should be `roundedness.full` to contrast against the more architectural feel of the primary buttons.

### Additional Component: "The Harvest Drawer"
A bespoke slide-out cart or menu using high-opacity `surface` with a `display-sm` heading. It should feel like opening a drawer in a well-organized pantry, using `surface-container-low` to categorize items without lines.

---

## 6. Do's and Don'ts

### Do
*   **DO** use whitespace as a functional tool. If a screen feels cluttered, increase the padding, don't add a border.
*   **DO** use `surface-dim` for "sold out" or inactive states to maintain the earthy, muted tone.
*   **DO** allow images to break the container slightly (asymmetrical layout) to create a "humanized" feel.

### Don't
*   **DON'T** use 100% black (#000000). Always use `on-surface` (#2f3331) for text to keep the "raw/natural" aesthetic.
*   **DON'T** use standard Material Design drop shadows. They are too aggressive for this system’s "soft minimalism."
*   **DON'T** use high-saturation "sale" reds. Use the muted `error` (#9f403d) for a sophisticated warning or discount indicator.