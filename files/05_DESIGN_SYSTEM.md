# 🎨 05 · Design System — EMS Suite

> **Purpose.** This document is the single source of truth for the *look and feel* of the application. Claude Code must implement these tokens, components, and rules so the result feels **professional, elegant, calm, and smooth** across all 14 roles. Pair this with `04_INFORMATION_ARCHITECTURE.md` (what screens exist) and `06_DATA_MODEL.md` (what data they show).

---

## 0. Aesthetic direction (read first)

This is an **enterprise, multi-role education product** used daily by administrators, teachers, accountants, parents, students, and drivers — many on mobile, many non-technical, some for hours at a time. The correct aesthetic is **refined institutional calm**, not flashy maximalism.

**Design principles**

1. **Clarity over cleverness.** Every screen should be understandable in 3 seconds. Hierarchy, whitespace, and alignment do the work.
2. **Calm, confident, trustworthy.** This software handles children's data, money, and attendance. It must *feel* dependable: restrained color, soft depth, no visual noise.
3. **Smooth, never jarring.** Motion is quick and purposeful (150–250ms). Nothing flashes, bounces gratuitously, or shifts layout unexpectedly.
4. **Consistent, not repetitive.** One DataTable, one FormModal, one set of tokens — reused everywhere so the product feels like one thing, not 14 different apps.
5. **Distinctive, not generic.** Avoid the "default AI dashboard" look: no Inter/Roboto, no purple-gradient-on-white, no flat gray everything. We commit to a specific, ownable identity (below).
6. **Accessible by default.** WCAG 2.1 AA contrast, full keyboard support, visible focus, respects reduced motion, works in Hindi (Devanagari) and English.
7. **Density where it earns it.** Admin tables get a **compact** mode; parent/student screens get a **comfortable**, friendlier rhythm.

**One-line identity:** *A premium, modern school-operations suite — quietly confident indigo, warm marigold highlights, generous space, crisp type.*

---

## 1. Color system

Colors are defined as **HSL CSS variables** so they map cleanly onto shadcn/ui and support light + dark themes by swapping the variable block. Implement in `src/index.css` under `:root` (light) and `.dark` (dark).

### 1.1 Brand palette (the identity)

| Token | Role | Light | Dark |
|---|---|---|---|
| **Ink Indigo** (primary) | Primary actions, active nav, links, focus | `hsl(231 64% 52%)` | `hsl(231 70% 66%)` |
| **Marigold** (accent) | Highlights, toppers, "rank #1", sparing CTAs, badges | `hsl(38 92% 50%)` | `hsl(38 95% 58%)` |
| **Teal** (secondary) | Secondary charts, info accents, "present" | `hsl(178 52% 40%)` | `hsl(178 55% 52%)` |

> Indigo is the workhorse; Marigold is the *spark* used sparingly (≤10% of any screen) for celebration and emphasis; Teal supports data viz. This trio reads "education + energy + growth" and avoids both the cliché pure-blue SaaS and the purple-gradient look.

### 1.2 Semantic colors

| Token | Meaning | Light | Dark |
|---|---|---|---|
| `--success` | Paid, present, approved, online | `hsl(142 64% 38%)` | `hsl(142 60% 48%)` |
| `--warning` | Pending, due soon, half-day | `hsl(38 92% 50%)` | `hsl(38 95% 58%)` |
| `--danger` / `--destructive` | Overdue, absent, delete, errors | `hsl(0 72% 51%)` | `hsl(0 75% 60%)` |
| `--info` | Neutral notices, live tracking | `hsl(206 90% 48%)` | `hsl(206 90% 60%)` |

Each semantic color also has a **soft** background variant for pills/badges (e.g. `--success-soft: hsl(142 64% 38% / 0.12)`).

### 1.3 Neutrals (cool slate ramp)

Use a single slate ramp for text, borders, surfaces. Slightly cool to complement indigo.

| Step | Light use | Hex-ish (light) |
|---|---|---|
| 50 | App background | `hsl(220 33% 98%)` |
| 100 | Subtle fill, hover | `hsl(220 24% 95%)` |
| 200 | Borders, dividers | `hsl(220 18% 90%)` |
| 300 | Disabled border | `hsl(220 14% 83%)` |
| 400 | Placeholder text | `hsl(220 10% 64%)` |
| 500 | Muted text/icons | `hsl(220 9% 46%)` |
| 600 | Secondary text | `hsl(220 12% 36%)` |
| 700 | Body text | `hsl(220 16% 26%)` |
| 800 | Headings | `hsl(220 22% 16%)` |
| 900 | Max contrast | `hsl(222 30% 11%)` |

### 1.4 shadcn/ui variable mapping (paste-ready)

```css
:root {
  --background: 220 33% 98%;
  --foreground: 222 30% 11%;

  --card: 0 0% 100%;
  --card-foreground: 222 30% 11%;
  --popover: 0 0% 100%;
  --popover-foreground: 222 30% 11%;

  --primary: 231 64% 52%;            /* Ink Indigo */
  --primary-foreground: 0 0% 100%;

  --secondary: 220 24% 95%;
  --secondary-foreground: 220 22% 16%;

  --muted: 220 24% 95%;
  --muted-foreground: 220 9% 46%;

  --accent: 38 92% 50%;              /* Marigold */
  --accent-foreground: 222 30% 11%;

  --destructive: 0 72% 51%;
  --destructive-foreground: 0 0% 100%;

  --success: 142 64% 38%;
  --warning: 38 92% 50%;
  --info: 206 90% 48%;

  --border: 220 18% 90%;
  --input: 220 18% 90%;
  --ring: 231 64% 52%;               /* focus = primary */

  --radius: 0.625rem;                /* 10px base */

  /* charts */
  --chart-1: 231 64% 52%;            /* indigo */
  --chart-2: 178 52% 40%;            /* teal */
  --chart-3: 38 92% 50%;             /* marigold */
  --chart-4: 270 50% 58%;            /* violet (4th series) */
  --chart-5: 206 90% 48%;            /* sky */

  /* sidebar (slightly distinct from app bg) */
  --sidebar: 222 30% 11%;            /* deep indigo-slate rail */
  --sidebar-foreground: 220 24% 92%;
  --sidebar-active: 231 64% 60%;
  --sidebar-active-foreground: 0 0% 100%;
}

.dark {
  --background: 222 30% 9%;
  --foreground: 220 24% 94%;

  --card: 222 26% 12%;
  --card-foreground: 220 24% 94%;
  --popover: 222 26% 12%;
  --popover-foreground: 220 24% 94%;

  --primary: 231 70% 66%;
  --primary-foreground: 222 47% 11%;

  --secondary: 222 20% 18%;
  --secondary-foreground: 220 24% 94%;

  --muted: 222 20% 18%;
  --muted-foreground: 220 12% 62%;

  --accent: 38 95% 58%;
  --accent-foreground: 222 47% 11%;

  --destructive: 0 75% 60%;
  --destructive-foreground: 0 0% 100%;

  --success: 142 60% 48%;
  --warning: 38 95% 58%;
  --info: 206 90% 60%;

  --border: 222 16% 22%;
  --input: 222 16% 24%;
  --ring: 231 70% 66%;

  --chart-1: 231 70% 66%;
  --chart-2: 178 55% 52%;
  --chart-3: 38 95% 58%;
  --chart-4: 270 55% 68%;
  --chart-5: 206 90% 64%;

  --sidebar: 224 32% 8%;
  --sidebar-foreground: 220 20% 86%;
  --sidebar-active: 231 70% 66%;
  --sidebar-active-foreground: 222 47% 11%;
}
```

### 1.5 Color usage rules

- **Primary (Indigo)** = the single most important action on a screen, active nav, links, selected states, focus ring. Don't flood a screen with it.
- **Accent (Marigold)** = celebration and rare emphasis only — topper cards, rank #1, "new" flags, the one hero CTA on an empty state. Never for body buttons or large fills.
- **Semantic** = status only (paid/present/approved = success; pending/due = warning; overdue/absent/delete = danger). Status is **always** reinforced with an icon and text, never color alone (accessibility).
- **Neutrals** carry 80%+ of every screen. When in doubt, use slate.
- The **dark sidebar rail** stays dark in both themes (it anchors the app and makes the colorful content area pop).

---

## 2. Typography

**Fonts (Google Fonts, must include Devanagari coverage for Hindi).**

| Use | Font | Notes |
|---|---|---|
| Display / headings (Latin) | **Bricolage Grotesque** | Characterful, warm-geometric; gives the product an ownable voice without being loud. Weights 500–700. |
| UI / body (Latin) | **Plus Jakarta Sans** | Clean, professional, highly legible at small sizes; *not* Inter/Roboto. Weights 400/500/600/700. |
| Hindi / Devanagari (all text) | **Mukta** | Full Devanagari + Latin coverage, geometric match. Applied when `lang="hi"`. Weights 400/500/600/700. |
| Numeric / IDs / receipts / code | **JetBrains Mono** | For SSMID/Roll/Samagra/APAAR IDs, receipt numbers, tabular money. |

```css
--font-display: "Bricolage Grotesque", "Mukta", ui-sans-serif, system-ui, sans-serif;
--font-sans:    "Plus Jakarta Sans", "Mukta", ui-sans-serif, system-ui, sans-serif;
--font-mono:    "JetBrains Mono", ui-monospace, monospace;
```

> **Bilingual rule.** When the app language is Hindi, set `<html lang="hi">` and switch the active font stack so Devanagari renders in **Mukta** (headings included — Bricolage has no Devanagari glyphs). i18next drives this; the body class toggles `font-sans`/`font-hi`.

**Type scale** (1.25 ratio, `rem`):

| Token | Size / line-height | Weight | Use |
|---|---|---|---|
| `text-display` | 36 / 40 | 700 | Page hero (login, welcome) |
| `text-h1` | 28 / 34 | 700 | Page title |
| `text-h2` | 22 / 28 | 600 | Section title |
| `text-h3` | 18 / 24 | 600 | Card title |
| `text-base` | 15 / 22 | 400 | Body (default) |
| `text-sm` | 13.5 / 20 | 400 | Secondary, table cells |
| `text-xs` | 12 / 16 | 500 | Labels, badges, captions |
| `text-mono` | 13 / 20 | 500 | IDs, money, receipt no. |

**Rules:** numbers in tables/finance use `font-variant-numeric: tabular-nums`. Max line length for paragraphs ~70ch. Headings use `--font-display`; everything else `--font-sans`. Avoid ALL-CAPS except tiny labels (with letter-spacing `0.04em`).

---

## 3. Spacing, radius, elevation

**Spacing scale (4px base):** `0, 2, 4, 6, 8, 12, 16, 20, 24, 32, 40, 48, 64`. Use multiples of 4 only. Default gutter between cards = 16–24; page padding = 24 (desktop) / 16 (mobile).

**Radius:** base `--radius: 10px`.
- Inputs/buttons/badges: `radius - 2px` (8px)
- Cards/modals/popovers: `radius` (10px) to `14px`
- Pills/avatars: full (`9999px`)

**Elevation (shadows)** — soft, low-spread, never harsh:

| Token | Use | Value (light) |
|---|---|---|
| `shadow-xs` | Resting cards, inputs | `0 1px 2px hsl(222 30% 11% / 0.05)` |
| `shadow-sm` | Hover cards, dropdown triggers | `0 2px 6px hsl(222 30% 11% / 0.07)` |
| `shadow-md` | Popovers, dropdown menus | `0 6px 18px hsl(222 30% 11% / 0.10)` |
| `shadow-lg` | Modals, dialogs | `0 16px 40px hsl(222 30% 11% / 0.16)` |
| `shadow-focus` | Focus ring | `0 0 0 3px hsl(var(--ring) / 0.35)` |

In dark mode, lower opacity and add a subtle top hairline border (`hsl(0 0% 100% / 0.04)`) instead of relying on shadow for separation.

**Borders:** 1px `--border`. Use borders *or* shadow for separation, rarely both heavily. Dividers inside cards use `--border` at full or 60% opacity.

---

## 4. Layout & responsive

**App shell** (see IA §1):
- **Sidebar rail** — fixed left, `260px` expanded / `72px` collapsed (icon-only), dark themed, role-specific nav with section groups. Collapsible; remembers state. On mobile it becomes an off-canvas drawer triggered by a hamburger.
- **Topbar** — `64px`, sticky: breadcrumb + global search (⌘K) · language toggle (EN/हिं) · theme toggle · notifications bell (with unread count) · chat · profile menu. School name/logo on the left near the rail.
- **Content area** — max content width `1280px` centered on ultra-wide; `24px` padding; vertical rhythm via `space-y-6`.

**Breakpoints (Tailwind defaults):** `sm 640 · md 768 · lg 1024 · xl 1280 · 2xl 1536`.

**Responsive rules (mobile-first — the PDF wants an app feel):**
- < `lg`: sidebar → drawer; multi-column grids collapse to 1–2 columns; DataTables gain horizontal scroll **or** switch to stacked "card rows" on `< sm`; topbar condenses (search → icon, actions → overflow menu).
- Tap targets ≥ 44×44px on touch. Bottom safe-area padding respected.
- Parent/Student roles are **mobile-first**: their dashboards should look great on a phone before desktop.

**Grid:** 12-col conceptual grid; dashboards use responsive card grids (`grid-cols-1 sm:2 lg:3 xl:4`). Stat cards row first, then charts, then tables/lists.

---

## 5. Core components (specs)

These map 1:1 to the reusable patterns in IA §18. Build each once, theme via tokens, reuse everywhere. Use shadcn/ui (Radix) primitives as the base.

### 5.1 Buttons
- **Variants:** `primary` (indigo fill), `secondary` (slate fill), `outline` (border + transparent), `ghost` (hover fill only), `destructive` (danger fill), `link`. **Accent/marigold** variant exists but is reserved for celebratory CTAs.
- **Sizes:** `sm (32h)`, `default (40h)`, `lg (44h)`, `icon (40²)`.
- States: hover (slightly darker / +shadow-sm), active (scale 0.98), focus (focus ring), disabled (50% + not-allowed), **loading** (spinner + label, button stays same width, disabled). Every async action button has a loading state.
- Icon+label spacing 8px; icons from lucide at 18px (sm) / 20px (default).

### 5.2 Inputs & forms (react-hook-form + zod)
- Field = label (top, `text-xs` 600) + control + helper/error line (reserved height so layout doesn't jump).
- Controls: text, textarea, select (Radix), combobox/searchable-select, multiselect (chips), date picker (calendar popover), time picker, number, file dropzone (drag + click, shows size limit & accepted types), switch, checkbox, radio group, OTP/PIN input, slider (for ratings 1–5).
- Validation: inline on blur + on submit; error text in `--danger`, field border danger, `aria-invalid`, error announced to screen readers. Success/typed states subtle.
- **Dynamic fields:** forms render extra fields from config (admission/student/sports/timetable) — supports text/number/date/select/file types added at runtime.
- File dropzone shows: accepted formats (audio/video/PDF/JPG), max size, progress bar, thumbnail/file chip, remove. Over-limit → inline error.

### 5.3 DataTable (TanStack Table) — the workhorse
- Toolbar: title + count · global search · column filters (faceted) · density toggle (comfortable/compact) · column visibility · **Export menu** (Excel/PDF/Print) · primary "Add" button.
- Body: zebra-free with hairline row dividers; sticky header; sortable headers (arrow indicator); row hover highlight; **row selection** checkboxes → bulk action bar slides in (Delete / Export / Notify / Download docs / Promote / etc.).
- Row actions: trailing "⋯" menu (View / Edit / Delete / Print / role-specific). Primary cell links to detail.
- States: loading = skeleton rows; empty = EmptyState; error = inline retry. Pagination footer (page size 10/25/50, range text). Mobile: switch to stacked card rows below `sm`.
- Money/number columns right-aligned, `tabular-nums`, mono for IDs.

### 5.4 FormModal / Dialog
- Radix Dialog, `shadow-lg`, max-width by content (sm 480 / md 600 / lg 760), scroll-locked body, header (title + close), scrollable content, sticky footer (Cancel + primary). Opens with 150ms fade + 8px rise; focus moves to first field; ESC + overlay click close (with unsaved-changes guard on dirty forms). Fully keyboard operable.

### 5.5 PinDialog → ConfirmDialog (delete flow)
- Step 1 **PinDialog**: masked PIN input (4–6 digits), shake + error on wrong PIN. Step 2 **ConfirmDialog**: states the item, warns it moves to Recycle Bin (15-day restore), Cancel + **Delete** (destructive). On success: toast with **Undo** action + "View in Recycle Bin" link. This is the *only* delete path anywhere in the app.

### 5.6 Status & identity atoms
- **StatusPill:** soft-bg + dot + label (e.g. ● Present / ● Pending / ● Overdue). Color + icon + text always.
- **StatCard:** label, big value (`text-h1`, tabular), delta chip (▲/▼ vs last period in success/danger), small sparkline optional, icon in tinted square. Click → relevant list.
- **RoleBadge:** colored chip per role for admin views.
- **Avatar:** photo or initials on tinted bg; sizes 24/32/40/64; stack with overflow "+N".
- **EmptyState:** friendly icon, one-line explanation, primary action (e.g. "Add your first student"). Never a blank screen.
- **Skeletons:** shimmer blocks matching final layout for every async region.

### 5.7 Navigation atoms
- **Sidebar item:** icon + label + optional badge; active = indigo left-accent bar + tinted bg + bold; section group headers in muted caps; collapsible groups; collapsed rail shows icon + tooltip.
- **Breadcrumb:** Home / Section / Page; last is current (non-link).
- **Tabs:** underline style for in-page sections (profile sub-pages, dashboards); pill style for filters.
- **Command palette (⌘K):** fuzzy search across permitted nav + entities; recent + quick actions.

### 5.8 Feedback
- **Toasts** (sonner): top-right (bottom on mobile), success/info/warning/error, icon + message + optional action (Undo/View); auto-dismiss 4s (errors persist until dismissed). Never use `alert()`.
- **Inline alerts/banners:** for page-level notices (e.g. "Demo data — changes are saved locally").
- **Progress:** linear for uploads/exports; spinners for buttons; **never** block the whole screen unless truly modal.

### 5.9 Domain-specific surfaces
- **Notification Composer:** audience picker (one / group / role / all / class-wise / member-wise) + channel chips (WhatsApp/SMS/Email/Push) + message + template insert + preview → Send → appended to sent log with status pills.
- **Chat:** WhatsApp-style — conversation list + thread; bubbles (mine = indigo, theirs = slate); group creation sheet with member list + **Select All**; attachments; unread badges; presence dots. (Real-time simulated.)
- **TemplatePicker:** card grid of templates (Mark Sheet / Admit Card / ID Card) with live thumbnail; select → applies before print/download.
- **Document/Print view:** A4-styled page (Mark Sheet with %+grade, Admit Card, ID Card, Timetable, Receipt, TC) rendered from selected template; "Print" + "Download PDF" (jsPDF). Print CSS hides app chrome.
- **Live Map (transport):** react-leaflet; animated bus marker along route, speed readout, geofence + **speed-limit alert** (e.g. >80km/h turns danger), stop pins, ETA. Simulated movement.
- **Syllabus Reader:** book viewer with page-by-page nav + jump-to-page input + thumbnails rail; supports image/PDF pages.
- **Calendar:** month grid with holiday chips (preloaded), events, exam dates; role-scoped.
- **Top-3 slider / Topper card:** marigold-accented hero on home (students/teachers) with auto-rotating top-3.
- **Live Video room:** placeholder video surface + participant list + mute/camera/share/leave controls + recipient scope label.
- **Charts (Recharts):** use `--chart-1..5`; rounded bars, soft grid (`--border`), tooltips themed to popover; legends as chips; donuts for attendance/fee splits; lines for trends; always have an empty/loading state.

---

## 6. Iconography & imagery
- **Icons:** lucide-react only, consistent stroke (1.75), sizes 16/18/20/24. One icon vocabulary across the app (e.g. attendance = `CalendarCheck`, fees = `Wallet`, transport = `Bus`, library = `BookOpen`, marks = `GraduationCap`). Every nav item and status has an icon.
- **Illustrations:** light, optional, for empty states/login — simple line/geometric style in brand hues; never clashing stock art.
- **Avatars/photos:** rounded; fallback to initials on tinted bg.
- **Logo area:** school logo + name top-left; placeholder mark if none.

---

## 7. Motion & micro-interactions
- **Library:** Framer Motion (React). Keep it subtle and fast.
- **Durations:** 120–160ms (micro: hover, toggles), 180–240ms (modals, drawers, route transitions). Easing: `cubic-bezier(0.2, 0.8, 0.2, 1)` (ease-out-ish).
- **Page load:** one tasteful staggered reveal of cards (`stagger 40ms`, fade + 8px rise) — once per route, not on every re-render.
- **Patterns:** modal = fade + rise; drawer = slide; toast = slide+fade; row delete = collapse/fade; tab change = quick crossfade of panel; number stat = count-up on first paint (respecting reduced motion); active nav = animated left-accent bar.
- **Restraint:** no parallax, no bouncing, no long/looping animations, no motion that delays input. Skeletons shimmer gently.
- **Reduced motion:** honor `prefers-reduced-motion: reduce` → disable transforms/count-ups, keep instant state changes.

---

## 8. Accessibility (WCAG 2.1 AA — required)
- **Contrast:** body text ≥ 4.5:1, large text/UI ≥ 3:1. Verify indigo/marigold on their foregrounds. Never convey status by color alone — pair with icon + text.
- **Keyboard:** every interactive element reachable and operable by keyboard in logical order; visible focus ring (`shadow-focus`) on all of them; no keyboard traps. Modals/menus follow Radix focus management (focus trap + return focus on close).
- **Screen readers:** semantic HTML + ARIA where needed; labels for all inputs; `aria-live` for toasts and async results; table headers associated; icon-only buttons have `aria-label`.
- **Targets:** ≥ 44px on touch; adequate spacing between actions.
- **Forms:** errors programmatically linked (`aria-describedby`), announced, and not color-only.
- **Language:** correct `lang` attribute (en/hi) so screen readers and fonts switch; full Devanagari rendering.
- **Motion/again:** respect reduced-motion. **Theme:** both light and dark meet contrast.

---

## 9. Density & role tone
- **Admin / Accountant / Principal / Librarian / Examiner / Lab / Teacher:** information-dense, **compact** table density default, more data per view, keyboard-friendly.
- **Parent / Student:** **comfortable** density, larger touch targets, friendlier cards, more whitespace, gentle use of marigold for highlights (toppers, achievements). Mobile-first.
- **Driver:** big tap targets, high-contrast trip controls, minimal text — usable at a glance.

---

## 10. Do / Don't

**Do**
- Reuse the shared components; theme only via tokens.
- Keep one primary action per screen; lead the eye.
- Use whitespace and alignment before adding borders/shadows.
- Always provide loading, empty, and error states.
- Keep money/IDs in mono + tabular figures.
- Test every screen in light, dark, English, Hindi, and mobile width.

**Don't**
- Don't use Inter/Roboto/Arial or purple-on-white gradients.
- Don't rely on color alone for meaning.
- Don't ship a dead/placeholder button (see the "no dead ends" rule).
- Don't over-animate or shift layout during load.
- Don't mix multiple radii/shadow styles ad hoc.
- Don't crowd parent/student views the way admin views are packed.

---

## 11. Definition of Done (visual)
A screen is visually "done" when: it uses only design-system tokens/components; looks correct in **light + dark** and **EN + हिं**; is usable and tidy from `360px` to `1536px`; every state (default/hover/focus/active/disabled/loading/empty/error) is handled; contrast and keyboard checks pass; motion is subtle and respects reduced-motion; and it feels consistent with the rest of the app. **No dead ends.**

---

*Next: `06_DATA_MODEL.md` — the entities, fields, relationships, and seed strategy that make all of the above clickable and real.*
