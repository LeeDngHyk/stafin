---
name: Monochrome Precision
colors:
  surface: '#fbf9f9'
  surface-dim: '#dbdad9'
  surface-bright: '#fbf9f9'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f5f3f3'
  surface-container: '#efeded'
  surface-container-high: '#e9e8e7'
  surface-container-highest: '#e3e2e2'
  on-surface: '#1b1c1c'
  on-surface-variant: '#4c4546'
  inverse-surface: '#303031'
  inverse-on-surface: '#f2f0f0'
  outline: '#7e7576'
  outline-variant: '#cfc4c5'
  surface-tint: '#5e5e5e'
  primary: '#000000'
  on-primary: '#ffffff'
  primary-container: '#1b1b1b'
  on-primary-container: '#848484'
  inverse-primary: '#c6c6c6'
  secondary: '#5d5f5f'
  on-secondary: '#ffffff'
  secondary-container: '#dfe0e0'
  on-secondary-container: '#616363'
  tertiary: '#000000'
  on-tertiary: '#ffffff'
  tertiary-container: '#1b1b1b'
  on-tertiary-container: '#848484'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#e2e2e2'
  primary-fixed-dim: '#c6c6c6'
  on-primary-fixed: '#1b1b1b'
  on-primary-fixed-variant: '#474747'
  secondary-fixed: '#e2e2e2'
  secondary-fixed-dim: '#c6c6c7'
  on-secondary-fixed: '#1a1c1c'
  on-secondary-fixed-variant: '#454747'
  tertiary-fixed: '#e2e2e2'
  tertiary-fixed-dim: '#c6c6c6'
  on-tertiary-fixed: '#1b1b1b'
  on-tertiary-fixed-variant: '#474747'
  background: '#fbf9f9'
  on-background: '#1b1c1c'
  surface-variant: '#e3e2e2'
typography:
  display-lg:
    fontFamily: Inter
    fontSize: 48px
    fontWeight: '700'
    lineHeight: 56px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Inter
    fontSize: 32px
    fontWeight: '600'
    lineHeight: 40px
    letterSpacing: -0.01em
  headline-lg-mobile:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
    letterSpacing: -0.01em
  title-md:
    fontFamily: Inter
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  label-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.05em
spacing:
  unit: 8px
  container-max-width: 1200px
  gutter: 24px
  margin-mobile: 20px
  margin-desktop: 40px
  section-gap: 80px
---

## Brand & Style

The design system is rooted in **Minimalism** and **High-Contrast Modernism**. It is designed for a sophisticated user base that values clarity, efficiency, and professional rigor in their financial journey. By stripping away decorative color, the system focuses entirely on content hierarchy and the gravity of investment decision-making.

The emotional response is one of **absolute clarity and objectivity**. The "Investment Propensity Diagnosis" flow is treated with the seriousness of a diagnostic report, using expansive whitespace to reduce cognitive load and sharp architectural lines to evoke stability and precision.

**Key Stylistic Pillars:**
- **Reductionist Aesthetic:** If an element does not serve a functional or hierarchical purpose, it is removed.
- **Architectural Layout:** Relying on a strict grid and varying stroke weights to create structure rather than fills.
- **Editorial Pace:** Using large, bold headlines and generous margins to make the diagnosis feel like a premium publication.

## Colors

This design system utilizes a **strictly monochromatic palette**. The absence of color eliminates emotional bias during the investment diagnosis process, reinforcing a "data-first" mindset.

- **Deep Black (#000000):** Used for primary typography, primary action buttons, and structural borders. It represents authority and finality.
- **Absolute White (#FFFFFF):** The primary background color. It provides the "breathable" whitespace necessary for a minimal aesthetic.
- **Grayscales:** 
    - *High-Mid Gray (#737373):* Used for secondary labels and hints.
    - *Light Gray (#E5E5E5):* Reserved for thin 1px borders and dividers.
    - *Surface Gray (#F5F5F5):* Used for secondary interactive states or subtle grouping containers.

## Typography

The typography is powered by **Inter**, chosen for its tall x-height and exceptional legibility in technical contexts. The hierarchy relies on extreme scale contrasts rather than color.

- **Display & Headlines:** Use heavy weights (600-700) with slight negative letter spacing to create a dense, "newsprint" impact for investment results and section headers.
- **Labels:** Small caps or uppercase transformations are used for metadata and category labels to distinguish them from flowable body text without needing color.
- **Reading Experience:** Line heights are kept generous (1.5x for body) to ensure the diagnosis questions are easy to scan and digest.

## Layout & Spacing

The layout follows a **Fixed Grid** philosophy for desktop to maintain an editorial feel, while transitioning to a **Fluid Grid** for mobile devices.

- **The 8px Rhythm:** All spacing (padding, margins, gaps) must be a multiple of 8px to maintain mathematical harmony.
- **Verticality:** Given the step-by-step nature of the "Investment Propensity Diagnosis," the layout emphasizes a center-aligned vertical stack. Large gaps (80px+) are used between distinct logical sections to create a sense of progression.
- **Safe Zones:** Content is inset with generous margins (40px on desktop) to ensure the UI never feels crowded, even when dense data is presented.

## Elevation & Depth

This design system rejects traditional shadows in favor of **Tonal Layers and Thin Borders**. Depth is communicated through structural stacking rather than light source metaphors.

- **Low-Contrast Outlines:** Instead of shadows, 1px solid borders (`#E5E5E5` or `#000000`) define the boundaries of cards and inputs.
- **Layering:** High-priority elements (like the current question in a flow) may use a solid black border, while background elements use light gray borders or subtle `#F5F5F5` fills.
- **Zero Elevation:** Surfaces are strictly flat. There are no blurs, glows, or gradients. If a modal is required, it is signaled by a solid black overlay at 10% opacity or a sharp, heavy 2px border.

## Shapes

The shape language is **Sharp (0px)**. Every element—from buttons and input fields to large container cards—features hard 90-degree corners. 

This geometric rigidity reinforces the professional, "no-nonsense" character of the financial diagnosis tool. It draws inspiration from brutalist architecture and high-end fashion editorial layouts. In rare cases where a softer distinction is needed (e.g., secondary chips), a maximum of 2px rounding may be applied, but the default is always sharp.

## Components

### Buttons
- **Primary:** Solid Black background with White text. Sharp corners. No shadow.
- **Secondary:** White background with a 1px Black border. Black text.
- **Ghost:** No border or fill. Bold, underlined text for "Skip" or "Back" actions.

### Input Fields & Selection
- **Text Inputs:** 1px Light Gray bottom border only (editorial style) or a full sharp box. Black text.
- **Radio/Checkboxes:** Custom sharp-edged squares. Selected state is a solid Black fill with a White checkmark/dot.
- **Diagnosis Chips:** For "Investment Interests," use sharp-edged boxes. Unselected: 1px Gray border. Selected: Solid Black background with White text.

### Cards
- **Diagnosis Result Card:** Solid White background with a 1px Black border. Use a heavy top-border (4px) to denote a "Report" header style.
- **Progress Bars:** A thin 2px light gray track with a solid black progress indicator. No rounded ends.

### Lists
- Clean, 1px horizontal dividers between items. Use high-contrast headings for list categories.