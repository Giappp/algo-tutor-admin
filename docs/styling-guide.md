# Design System & Styling Guide

This document covers the visual design system for the AlgoTutor Admin project, including color tokens, typography, animations, and component styling patterns.

---

## Color System

### Color Palette

The project uses **OKLCH color space** for perceptually uniform colors, which ensures colors look consistent across different screens and hue ranges. All colors are defined as CSS custom properties in `src/app/globals.css`.

#### Core Palette (Light Mode)

| Token | OKLCH Value | Usage |
|-------|-------------|-------|
| `--background` | `oklch(0.985 0.002 285)` | Page background |
| `--foreground` | `oklch(0.145 0.003 285)` | Primary text |
| `--primary` | `oklch(0.55 0.22 272)` | **Indigo/Purple** — primary actions, links, accents |
| `--secondary` | `oklch(0.96 0.003 285)` | Secondary surfaces |
| `--muted` | `oklch(0.96 0.003 285)` | Muted backgrounds |
| `--accent` | `oklch(0.96 0.003 285)` | Accent surfaces |
| `--destructive` | `oklch(0.55 0.22 27)` | Destructive/error actions |
| `--border` | `oklch(0.91 0.003 285)` | Borders |
| `--ring` | `oklch(0.55 0.22 272)` | Focus rings |

#### Chart Palette (Semantic Accent Colors)

These colors are used throughout the learning path detail page for visual variety. Each color maps to a specific semantic meaning:

| Token | OKLCH Value | Light Appearance | Usage |
|-------|-------------|-----------------|-------|
| `--chart-1` | `oklch(0.55 0.22 272)` | **Purple/Indigo** | Topics, primary actions, stat cards |
| `--chart-2` | `oklch(0.6 0.18 285)` | **Violet** | Topics, secondary accents |
| `--chart-3` | `oklch(0.65 0.2 290)` | **Blue** | Topics, stat cards |
| `--chart-4` | `oklch(0.55 0.15 25)` | **Orange/Amber** | Warnings, publish actions |
| `--chart-5` | `oklch(0.5 0.2 350)` | **Pink/Magenta** | Topics, stat cards |

### Dark Mode

Dark mode is toggled via the `.dark` class on the `<html>` element. The primary shift is that `--background` goes from near-white to dark (`oklch(0.145)`) and `--foreground` inverts to near-white. The chart colors become slightly lighter and more saturated to maintain contrast on dark backgrounds.

---

## Typography

### Font Stack

```css
--font-sans: Plus Jakarta Sans   /* Body text, UI elements */
--font-heading: Sora             /* Headings (h1-h6), bold labels */
--font-mono: ui-monospace        /* Code, technical content */
```

### Type Scale

| Element | Font | Size | Weight | Line Height |
|---------|------|------|--------|-------------|
| h1 | heading | 2rem | 700 | 2.5rem |
| h2 | heading | 1.5rem | 600 | 2rem |
| h3 | heading | 1.25rem | 600 | 1.75rem |
| h4 | heading | 1.125rem | 600 | 1.5rem |
| Body | sans | base | 400 | 1.65 |
| Small | sans | 0.875rem | — | — |
| Tiny | sans | 0.75rem | — | — |

### Gradient Text

Use the `.text-gradient-primary` utility for large headings to add visual impact:

```html
<h1 class="text-gradient-primary">Learning Path Name</h1>
```

The gradient flows from `--chart-1` (purple) through `--chart-2` (violet).

---

## Border Radius System

Defined with a base of `--radius: 0.65rem` and scaled up/down:

| Token | Multiplier | Approx. Value |
|-------|-----------|--------------|
| `--radius-sm` | x0.6 | 0.39rem |
| `--radius-md` | x0.8 | 0.52rem |
| `--radius` | base | 0.65rem |
| `--radius-lg` | x1 | 0.65rem |
| `--radius-xl` | x1.4 | 0.91rem |
| `--radius-2xl` | x1.8 | 1.17rem |
| `--radius-3xl` | x2.2 | 1.43rem |
| `--radius-4xl` | x2.6 | 1.69rem |

**Usage conventions:**
- Small elements (badges, icons): `--radius-lg` (~`rounded-xl`)
- Cards and containers: `--radius-xl` to `--radius-2xl` (`rounded-2xl`)
- Large containers: `--radius-3xl` to `--radius-4xl`

---

## Animations

### Page-Level Entrance Animation

Use `.stagger-children` on a container to animate child elements in sequence. Children animate with `opacity: 0 → 1` and `translateY(10px → 0)` over 400ms with 75ms delays per child (up to 9 children).

```tsx
<div className="flex flex-col gap-3 stagger-children">
    {items.map(item => <ItemCard key={item.id} {...item} />)}
</div>
```

### Component Animations

| Animation | Purpose | Duration | Easing |
|-----------|---------|----------|--------|
| `fadeInUp` | Page/element entrance | 400ms | ease-out |
| `subtle-pulse` | Status indicators | 2s | ease-in-out |
| `gradient-shift` | Ambient background glow | 4s | ease-in-out |
| `float` | Decorative floating elements | 3s | ease-in-out |
| `accordion-expand` | Accordion open/close | 250ms | ease-out |
| `glow-pulse` | Icon hover glow effect | 2.5s | ease-in-out |
| `published-pulse` | Published dot animation | 2s | ease-in-out |

### Card Hover Effect

Use `.card-lift` for cards that should elevate on hover:

```html
<div className="rounded-2xl border bg-card card-lift">
```

This applies `translateY(-2px)` and enhanced shadow on hover.

---

## Component Styling Patterns

### Stat Cards

Each stat card uses a unique chart color for its accent strip and icon. The pattern:

1. **Left accent strip**: 4px vertical bar using `bg-gradient-to-b` from chart color to a transparent variant
2. **Icon circle**: 44px rounded square with chart color background at 10% opacity, chart color text, and chart color border
3. **Value**: Extra-large (`text-2xl`) heading font in bold

```tsx
<div className="relative flex items-center gap-3 p-4 rounded-2xl border bg-card card-lift">
    <div className="absolute left-0 top-3 bottom-3 w-1 rounded-full bg-gradient-to-b from-chart-1 to-chart-1/40" />
    <div className="shrink-0 flex items-center justify-center size-11 rounded-xl border bg-chart-1/10 text-chart-1 border-chart-1/20">
        <Icon className="size-5" />
    </div>
    <div>
        <p className="text-xs text-muted-foreground font-medium">{label}</p>
        <p className="text-2xl font-heading font-bold text-foreground tabular-nums">{value}</p>
    </div>
</div>
```

### Topic Accordion Color Coding

Topics alternate between 2 accent colors based on their `orderIndex` for subtle visual distinction without overwhelming the UI:

```tsx
const TOPIC_COLORS = [
    { bg: "bg-chart-1/10", text: "text-chart-1", border: "border-chart-1/20", strip: "from-chart-1" },
    { bg: "bg-chart-3/10", text: "text-chart-3", border: "border-chart-3/20", strip: "from-chart-3" },
];

function getTopicColor(orderIndex: number) {
    return TOPIC_COLORS[orderIndex % TOPIC_COLORS.length];
}
```

Color is applied minimally — only to the order index badge and action buttons. The expanded section uses neutral borders and background to keep focus on lesson content.

### Lesson Type Color Coding

Lessons are visually distinguished by type using fixed color assignments:

| Type | Color | Hue | Usage |
|------|-------|-----|-------|
| THEORY | Blue | 265 | Theory lesson badges |
| QUIZ | Amber | 40 | Quiz lesson badges |
| CODING | Emerald | 170 | Coding lesson badges |

### Difficulty Badges

| Difficulty | Color | Usage |
|------------|-------|-------|
| EASY | Emerald | Beginner content |
| MEDIUM | Amber | Intermediate content |
| HARD | Red | Advanced content |

### Decorative Background Patterns

Three decorative effects are available:

1. **Noise overlay** (`.noise-overlay`): SVG turbulence noise at low opacity for texture
2. **Dot pattern** (`.dot-pattern`): Radial gradient dots at 24px intervals
3. **Gradient radial blobs** (inline): Positioned absolutely for ambient color effects

```html
<div class="relative overflow-hidden rounded-2xl border">
    <div class="absolute inset-0 noise-overlay" />
    <div class="absolute inset-0 dot-pattern opacity-40" />
    <div class="absolute inset-0 bg-[radial-gradient(ellipse_at_0%_0%,oklch(0.55_0.22_272/0.12)_0%,transparent_60%)]" />
    <!-- Content -->
</div>
```

---

## Gradient Text Utilities

Three gradient text variants are available in `globals.css`:

| Class | Gradient |
|-------|---------|
| `.text-gradient` | Purple → Violet → Pink |
| `.text-gradient-primary` | Purple → Light Purple |
| `.text-gradient-destructive` | Red → Light Red |

Usage:

```html
<h1 class="text-2xl font-heading font-bold text-gradient-primary">Title</h1>
```

---

## Accessibility

### Focus Rings

Custom focus rings use the primary color with 50% opacity:

```css
*:focus-visible {
    outline: 2px solid oklch(0.55 0.22 272 / 0.5);
    outline-offset: 2px;
}
```

### Selection Colors

Text selection uses primary color with 20% opacity in light mode and 30% in dark mode.

### Color Contrast

The OKLCH color space ensures that all text/background combinations meet WCAG AA contrast requirements. The `--muted-foreground` (`oklch(0.5 0.01 285)`) provides a readable 4.5:1 contrast ratio against `--background`.

---

## Image Upload Component

The `ImageUpload` component (`src/components/ui/image-upload.tsx`) provides a drag-and-drop file upload UI backed by the upload API.

### Usage

```tsx
import {ImageUpload} from "@/components/ui/image-upload";

<ImageUpload
    value={thumbnailUrl}
    onChange={(url) => setValue("thumbnailUrl", url, {shouldValidate: true})}
    onRemove={() => setValue("thumbnailUrl", "", {shouldValidate: true})}
    disabled={isPending}
    aspectRatio="video"
/>
```

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `value` | `string` | — | Current image URL |
| `onChange` | `(url: string) => void` | required | Called with the uploaded URL |
| `onRemove` | `() => void` | — | Called when user clicks remove |
| `disabled` | `boolean` | `false` | Disable interactions |
| `aspectRatio` | `"video" \| "square" \| "portrait"` | `"video"` | Aspect ratio of the drop zone |
| `className` | `string` | — | Additional CSS classes |

### Validation

- Accepted types: JPEG, PNG, WebP, GIF
- Max file size: 5MB

### States

- **Empty**: Dashed border drop zone with upload icon and instructions
- **Dragging**: Blue border highlight and tinted background
- **Uploading**: Spinner with "Uploading..." text
- **Uploaded**: Image preview with hover overlay (Change / Remove buttons)
- **Error**: Red border on drop zone with error message below

---

## File Structure

```
src/
  api/
    core/
      http.ts              # HTTP helpers including postForm for multipart
    services/
      upload-services.ts   # uploadService.uploadImage()
  app/
    globals.css            # All CSS custom properties, animations, utilities
    dashboard/
      learning-paths/
        [id]/page.tsx     # Learning path detail page
        create/page.tsx   # Create learning path page
  components/
    ui/
      image-upload.tsx     # Image upload component
    learning-path/detail/
      learning-path-detail-header.tsx
      learning-path-stats-grid.tsx
      learning-path-topics-tab.tsx
      learning-path-settings-tab.tsx
      topic-accordion-item.tsx
      lesson-list-item.tsx
    learning-path/
      learning-path-form.tsx
      preview-card.tsx
```
