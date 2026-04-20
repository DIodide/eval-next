# EVAL Gaming — Brand Kit

---

## Brand Identity

**Style:** Modern Cyberpunk Esports
**Tone:** Premium, competitive, tech-forward
**Theme:** Dark-first with glass panels and cyan accents

---

## Logo Assets

| Variant | File | Usage |
|---------|------|-------|
| White | `/public/eval/logos/eLOGO_white.png` | Primary — dark backgrounds |
| Black | `/public/eval/logos/eLOGO_black.png` | Light backgrounds |
| Rainbow | `/public/eval/logos/rainbow_eval.png` | Feature callouts, marketing |
| Emblem | `/public/eval/logos/emblem.png` | Compact mark, favicons |
| Rainbow Star | `/public/eval/logos/rainbow_star.png` | Decorative accent |

---

## Color Palette

### Primary Brand Colors

| Name | Hex | RGB | Usage |
|------|-----|-----|-------|
| **Eval Cyan** | `#06b6d4` | 6, 182, 212 | Primary actions, links, accents, glows |
| **Eval Purple** | `#8b5cf6` | 139, 92, 246 | Secondary accent, gradients |
| **Eval Orange** | `#f59e0b` | 245, 158, 11 | Tertiary accent, CTAs, warnings |

### Background & Surface Colors

| Name | Hex | Usage |
|------|-----|-------|
| **Background** | `#0a0a0f` | Page background |
| **Surface** | `#0f0f1a` | Cards, sidebar, elevated surfaces |
| **Surface Elevated** | `#1e1e2e` | Secondary containers, hover states |
| **Muted** | `#2a2a3a` | Disabled states, subtle fills |

### Text Colors

| Name | Hex/Value | Usage |
|------|-----------|-------|
| **Primary Text** | `#ffffff` | Headings, body text |
| **Muted Text** | `#a1a1aa` | Secondary text, descriptions |
| **On Primary** | `#000000` | Text on cyan/orange buttons |

### Semantic Colors

| Name | Hex | Usage |
|------|-----|-------|
| **Success** | `#10b981` | Positive states, confirmations |
| **Error** | `#ef4444` | Destructive actions, errors |
| **Warning** | `#f59e0b` | Caution states |
| **Info** | `#06b6d4` | Informational states |

### Border & Divider

| Name | Value | Usage |
|------|-------|-------|
| **Border** | `rgba(255, 255, 255, 0.1)` | Card borders, dividers |
| **Border Hover** | `rgba(6, 182, 212, 0.3)` | Hover state borders |
| **Focus Ring** | `#06b6d4` | Keyboard focus indicators |

---

## Typography

### Font Stack

| Role | Font Family | Weights | Usage |
|------|-------------|---------|-------|
| **Display** | Rajdhani | 300–700 | Default body, UI text, headings |
| **Body** | Inter | 300–900 | Buttons, labels, detailed text |
| **Accent** | Orbitron | 400–900 | Special headings, hero sections |

All fonts sourced from Google Fonts, subset: Latin.

### Type Scale

| Style | Size | Weight | Extras |
|-------|------|--------|--------|
| Hero heading | — | 900 | Gradient text (white → cyan → purple), animated |
| Section heading | — | 800 | Uppercase, letter-spacing `0.05em` |
| Button text | — | 700 | Uppercase, letter-spacing `0.05em` |
| Body / Premium | 1rem | 500 | Line-height `1.6` |
| Small | 0.75rem | 400 | Labels, metadata |

---

## Gradients

### Primary Gradients

**Hero Text Gradient**
```
background: linear-gradient(135deg, #ffffff, #06b6d4, #8b5cf6)
```
Animated with `background-size: 200% 200%`, 3s cycle.

**Rainbow Accent** (borders, nav underline, scrollbar)
```
background: linear-gradient(90deg, #06b6d4, #8b5cf6, #f59e0b)
```

**Card Surface**
```
background: linear-gradient(135deg, rgba(15, 15, 26, 0.9), rgba(30, 30, 46, 0.8))
```

**Primary CTA (Cyan)**
```
background: linear-gradient(135deg, #06b6d4, #0891b2)
```

**Secondary CTA (Orange)**
```
background: linear-gradient(135deg, #f59e0b, #d97706)
```

**Stat Numbers**
```
background: linear-gradient(135deg, #06b6d4, #8b5cf6)
```

---

## Effects

### Glassmorphism
```css
background: rgba(15, 15, 26, 0.8);
backdrop-filter: blur(20px);
border: 1px solid rgba(255, 255, 255, 0.1);
```

### Cyber Glow (Cyan)
```css
box-shadow:
  0 0 20px rgba(6, 182, 212, 0.3),
  0 0 40px rgba(6, 182, 212, 0.2),
  0 0 60px rgba(6, 182, 212, 0.1);
```

### Card Hover Glow
```css
box-shadow:
  0 10px 40px rgba(6, 182, 212, 0.2),
  0 0 0 1px rgba(6, 182, 212, 0.1);
```

### Neon Text Glow
```css
text-shadow:
  0 0 10px rgba(6, 182, 212, 0.5),
  0 0 20px rgba(6, 182, 212, 0.3);
```

---

## Spacing & Sizing

### Border Radius

| Token | Value | Usage |
|-------|-------|-------|
| `--radius-sm` | 8px | Subtle rounding |
| `--radius-md` | 10px | Inputs, small cards |
| `--radius-lg` | 12px | Cards, containers |
| `--radius-xl` | 16px | Modals, large elements |
| Full | 9999px | Pills, avatars, badges |

### Button Sizes

| Size | Height | Padding | Radius |
|------|--------|---------|--------|
| Small | 32px (`h-8`) | `px-3` | `rounded-md` |
| Default | 36px (`h-9`) | `px-4` | `rounded-md` |
| Large | 40px (`h-10`) | `px-6` | `rounded-md` |
| Icon | 36px square | — | `rounded-md` |

---

## Animation

### Keyframe Animations

| Name | Effect | Duration | Easing |
|------|--------|----------|--------|
| Gradient Shift | Background position cycle | 3s | ease-in-out, infinite |
| Pulse Glow | Cyan shadow intensity cycle | 2s | ease-in-out, infinite |
| Float | Vertical bobbing (10px) | 3s | ease-in-out, infinite |
| Rainbow Rotate | Border gradient sweep | 3s | linear, infinite |
| Cursor Blink | Opacity toggle | — | step-based |

### Motion (Framer Motion)

| Property | Value |
|----------|-------|
| Spring stiffness | 100 |
| Spring damping | 10 |
| Exit | `opacity: 0`, `translateY: -40px`, `scale: 2`, `blur: 8px` |

### Transition Defaults
- Duration: `0.3s`
- Easing: `ease` or spring-based
- Hover transforms: `translateY(-2px)` to `translateY(-8px)`

---

## Component Patterns

### Cards
- Dark gradient surface with glass border
- Hover: lift + cyan border + glow shadow
- Optional top accent line (2px gradient) on hover

### Buttons
- **Primary**: Cyan gradient, black text, uppercase, shimmer on hover
- **Secondary**: Orange gradient, black text, uppercase, shimmer on hover
- **Outline**: White border, transparent fill, gradient border on hover
- **Ghost**: No border, subtle hover fill

### Navigation
- Glass background (`rgba(10, 10, 15, 0.9)`, 20px blur)
- Bottom accent line: rainbow gradient (cyan → purple → orange)
- Link hover: animated gradient underline

### Inputs
- Transparent background with subtle border
- Focus: cyan ring (3px width)
- Dark mode fill: `rgba(255, 255, 255, 0.1)`

### Scrollbar
- Track: `#0a0a0f`
- Thumb: gradient (cyan → purple)
- Width: 12px, radius: 8px

---

## Icons

**Library:** Lucide React (`lucide-react`)
**Default size:** 24px
**Style:** Outline/stroke-based, 2px stroke weight

---

## Tech Stack Reference

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 15 |
| CSS | Tailwind CSS v4 |
| Components | Radix UI primitives |
| Animation | Framer Motion |
| Icons | Lucide React |
| Auth Theming | Clerk (dark + neobrutalism) |
| Toasts | Sonner |
