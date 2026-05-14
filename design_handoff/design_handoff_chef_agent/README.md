# Handoff: Chef Agent Redesign

## Overview
Redesign of the Chef Agent app — a Dutch personal-nutrition PWA (8-week meal cycle, Telegram notifs). The original codebase is React + Vite + Tailwind (`frontend/` in `gavinguler/chef-agent`). This handoff covers a full visual + UX refresh of every existing screen plus one new screen (Boodschappen / shopping list), in **two distinct directions** so the team can pick one or mix the strongest pieces.

## About the Design Files
The files in this bundle are **design references created in HTML/JSX** — high-fidelity prototypes showing intended look and behavior, **not production code to copy directly**. They run via in-browser Babel and use a custom design-canvas wrapper to present multiple screens side-by-side.

The task is to **recreate these designs in the existing Chef Agent codebase** (`frontend/`, React 18 + react-router + Tailwind v3, brand color already wired as `theme.extend.colors.brand`). Use Tailwind utilities and existing routing — do not ship the JSX from this bundle as-is.

If the team chooses **one direction**, port that direction's tokens into `tailwind.config.js` and rebuild each page in `frontend/src/pages/`. If they want to A/B test, both directions can live behind a theme flag.

## Fidelity
**High-fidelity.** Final colors, typography, spacing, and component shapes are pinned. Photos in the prototype are striped placeholders — real food photography (or a consistent illustrative style) is required for production; reserve the same aspect ratios and corner radii.

## Two directions

### Direction A — "Stil" (Quiet)
Modern minimal. Off-white canvas, deep forest green ink, line icons (Lucide-style), tight letterspacing on Inter. Cards are flat with hairline borders; emphasis comes from typographic hierarchy and one bold dark CTA. **Recommended primary** if the brand should feel calm and competent.

### Direction B — "Editorial"
Cookbook / food-magazine vibes. Warm cream background, Fraunces serif headlines (with italic emphasis), photography-led, burnt-sienna brand. Cards are softer; the home screen reads like a magazine cover. Recommended if you want the app to feel lush and aspirational.

---

## Design Tokens

### Direction A — Stil

| Token         | Value     | Usage                          |
|---------------|-----------|--------------------------------|
| `bg`          | `#f6f5f1` | App background (off-white)     |
| `surface`     | `#ffffff` | Cards                          |
| `ink`         | `#1a1f1a` | Primary text, dark CTAs        |
| `ink2`        | `#5d655c` | Secondary text                 |
| `ink3`        | `#9aa19a` | Tertiary text, icons-muted     |
| `line`        | `#e7e4dc` | Borders                        |
| `line2`       | `#efece4` | Inner dividers                 |
| `brand`       | `#1f3a2c` | Brand accent (deep forest)     |
| `brandSoft`   | `#e9efe6` | Brand-tint chips               |
| `accent`      | `#c2603a` | Sparkle / AI accent            |

Typography: **Inter** 400/500/600/700. Caps eyebrows: `font-size: 11px`, `letter-spacing: 1.4px`, `text-transform: uppercase`, color `ink3`. H1 page titles: `26px / 600 / -0.6 letter-spacing`.

Radii: cards `14–18px`, chips `6–14px`, buttons `12–999px`, inputs `12px`. Hairline 1px borders throughout — no shadows on cards.

### Direction B — Editorial

| Token         | Value     | Usage                          |
|---------------|-----------|--------------------------------|
| `bg`          | `#f3eee4` | App background (cream)         |
| `surface`     | `#fbf8f1` | Cards / surfaces               |
| `ink`         | `#2a221a` | Primary text                   |
| `ink2`        | `#6b5e4d` | Secondary text                 |
| `ink3`        | `#a89a85` | Tertiary text                  |
| `line`        | `#e6dfd0` | Borders                        |
| `line2`       | `#ece6d8` | Inner dividers                 |
| `brand`       | `#7c3a1f` | Burnt sienna accent            |
| `brandSoft`   | `#f1d7c4` | Brand-tint chips               |

Typography: **Fraunces** (serif) for headlines + key data values; **Inter** for UI / metadata. Italic Fraunces is used as emphasis (e.g. greeting name, "De Editie" hero). Caps eyebrows: `10px / 600 / 1.6–2.5px letter-spacing`.

Radii: cards `16–24px`, chips/pills `999px`. Hero photos can fill width with rounded `0 0 24 24` mask under hero copy.

### Spacing scale (both directions)
4 / 6 / 8 / 10 / 12 / 14 / 16 / 18 / 20 / 22 / 24 / 28 / 32. Outer page padding: A `20px`, B `22px`. Bottom-nav clearance: `100–110px`.

---

## Screens

All screens are mobile-only, designed at **402×874** (iPhone 14/15 logical viewport). Existing routes are preserved.

### 1. Home (`/`)
**Purpose:** Glanceable "what am I eating today" + quick links to recipes/week/shopping.

**A · Stil layout:**
- Status bar spacer (54px)
- Header: small uppercase eyebrow ("Donderdag · 8 mei"), large H1 greeting, bell-icon glass button (38×38, hairline border)
- Subtitle: `Mediterraans · week 3 · dag 4 van 7`
- **Today card** — full-width, 18px radius:
  - Photo (height 150)
  - Eyebrow: dot + "Vanavond · diner"
  - Recipe name (19/600/-0.3)
  - Meta row: kcal · eiwit · min, with the numbers as bold ink
  - Two-button footer split by hairline: "Recept openen" | "Boodschap" (cart icon)
- **Macros block** — heading + two thin progress bars (4px tall, line2 track, brand fill for protein, ink2 fill for kcal) with `<value> / <max> <unit>` labels
- **Week strip** — 7 equal-flex pills (today filled brand). Eyebrow on each is the day name; number is the date.
- Bottom nav (see Components below)

**B · Editorial layout:**
- Header: eyebrow date, H1 `Goedemiddag,\n<em>Gavin.</em>` (Fraunces 36, italic colored brand)
- Theme line
- **Hero recipe card** — full-bleed photo with brand-soft chip top-left ("Vanavond · diner"), bottom gradient → recipe title in Fraunces 26 + meta row inline-separated by `·`
- **Week strip** — 7 pill-shaped 999-radius items, today filled brand
- **Komende dagen** carousel — horizontally scrollable cards, each `160×120` photo + day eyebrow + Fraunces title

### 2. Recepten (`/recepten`)
**A · Stil:** Page title + dark-ink "Nieuw" pill button. Search input with leaf-icon. Filter chips ([Alle, Diner, Lunch, Ontbijt, Veggie]) — active chip is dark ink, others outlined. List rows: 64×64 photo thumbnail (radius 10), category eyebrow, recipe name (truncate), meta line `eiwit · kcal · min`, chevron right.

**B · Editorial:** Eyebrow "Bibliotheek · 47 gerechten", page title, brand-color "Nieuw" pill. Pill-shape search (999 radius) with serif italic placeholder. Filter as horizontal-scroll chips. Body is a **two-column magazine grid** — each card: photo (150 tall), eyebrow category, Fraunces title (15/lh1.2), tiny meta row.

### 3. Weekplan (`/weekplan`)
**Purpose:** Pick week 1–8 of cycle, see meal plan per day.

**A · Stil:** Eyebrow "8-weken cyclus" + H1 "Weekplan". Week selector: 8 equal pills, active = filled brand, today = brand-soft tint with brand text. Day list as cards with 38×38 day-tag, recipe name + meta, "vandaag" pill on the active day, chevron. Below: ink-color CTA card "Boodschappenlijst · 23 items · €38 geschat" with arrow.

**B · Editorial:** Centered eyebrow + Fraunces 30 "Week 3" headline. Week ribbon = 8 round 32×32 dots. Day list: large Fraunces date number + day-of-week eyebrow on left, eyebrow "diner" + Fraunces recipe title on right, 64×64 round-ish thumbnail.

### 4. Recept detail (`/recepten/:id`)
**Purpose:** Show one recipe, with macros, ingredients, instructions, edit affordance.

**A · Stil:** Hero photo 300 tall, glass back-button + edit + more buttons floating. Below: brand-soft chip, H1, meta line. **Macros 4-up grid** — each tile white card with hairline border, value bold, label uppercase eyebrow. Ingredients in a single grouped card with quantity-column (64px, ink3) + ingredient name. AI-fill button (sparkle icon, terracotta accent stroke). Sticky bottom CTA "Plan voor donderdag" in dark ink.

**B · Editorial:** Hero photo 420 tall. Body floats up over hero with `24px 24px 0 0` corner mask. Centered chip, centered Fraunces 30 H1 (with italic emphasis), centered serif italic intro paragraph. Macros row separated by hairlines top + bottom — each cell: Fraunces value + tiny eyebrow label. Ingredients use **dotted-bottom rows** (1px dotted line) — quantity tabular ink3, name in Fraunces 15. Brand-color rounded-pill primary CTA "Voeg toe aan boodschappen".

### 5. Instellingen (`/instellingen`)
Sections: cyclus week (1–8 picker), Telegram notifs (toggles + time pickers), voorkeuren (eiwit doel / kcal-budget / dieet — chevron-right rows).

**A · Stil:** Section eyebrow + white card with hairline border. Toggles 36×22 — on=brand, off=line. Toggle thumb 18×18 white with subtle shadow.

**B · Editorial:** Profile card up top (avatar with initial in brand background, Fraunces name). Section header: Fraunces 18 + light eyebrow. Rows in surface-color rounded-16 cards, with Fraunces row labels.

### 6. Boodschappen / shopping list (NEW — A direction only)
**Purpose:** Tickable shopping list grouped by category, with progress.

Layout: chevron-back, eyebrow "Week 3 · 23 items", H1, brand-soft `~ €38` chip. Progress row: `3 van 23` + percent + 4px progress bar. Then per category: eyebrow + grouped white card. Each row: 20×20 checkbox (hairline border off, brand-filled with white check on), 56px quantity column, item name (line-through + 0.45 opacity when checked).

This screen does not exist in the original repo — recommend wiring it to `getShoppingList(week)` already present in `api/client.js`.

---

## Components

### Bottom nav (both directions, 4 items)
Fixed bottom, 28px safe-area padding. Items: Home, Recepten, Week, Instellingen. Active state shows brand color + heavier stroke. **Icons must be replaced** — the original app uses emoji (🏠📖📅⚙️), the redesigns use Lucide-style line icons. See `icons.jsx` for the inline SVG set used in the prototype; in production use [`lucide-react`](https://lucide.dev) (`Home, BookOpen, Calendar, Settings, Search, Plus, ChevronRight, ChevronLeft, Bell, Sparkles, ShoppingCart, Snowflake, Clock, Flame, Leaf, Pencil, Check, X`).

### Toggle
36×22 rounded full, on-color = brand, off = `line`. Thumb 18×18 white, `top:2 left:{2|16}`, soft shadow `0 1px 3px rgba(0,0,0,.18)`.

### Filter chip
Active: dark ink filled (A) or brand filled (B). Inactive: surface or transparent + 1px line border. 12px font, 500 weight.

### Photo placeholder
Replace with real images. Aspect ratios used in mocks:
- Today/hero card: `~16:9`
- Recipe list thumbnail (A): `1:1` 64px
- Recipe grid card (B): `~4:3`
- Detail hero: A `4:5`, B `~9:11` (taller)
- Week-strip thumbnail (B): `1:1` 64px

---

## Interactions & Behavior

- **Today card → Recipe detail**: tap entire photo or "Recept openen" button. The "Boodschap" footer button adds today's recipe ingredients to the shopping list.
- **Week selector**: tap any week 1–8 to load that week's plan (existing `getWeekPlan` API). Auto-detected current week shown with star/tint; manual override persists via `weekStorage.js`.
- **Recipe list search**: existing 300ms debounce ✅, keep.
- **AI macros button** (`🤖 Macro's schatten`): keep as-is, but in the redesign the icon is a **sparkle** (`Icons.Sparkle`) tinted in the accent color (terracotta in A). Loading copy: "AI bezig…".
- **Shopping list checkboxes** (NEW): toggle item done; persist to localStorage keyed by `week:itemId`. Strikethrough + 0.45 opacity when done.
- **Pull-to-refresh** on Home and Weekplan would be a nice-to-have (not designed).
- **Transitions:** route transitions can use a soft 200ms cross-fade. Toggle thumb animates 200ms ease.

---

## State Management
No changes from existing app. Continue using:
- `react-router-dom` routes as in `App.jsx`
- `weekStorage.js` for week override
- `api/client.js` axios calls
- Local component state for forms

New state for shopping screen: `Set<string>` of checked item IDs in localStorage.

---

## Copy / language
Keep Dutch throughout. Sample strings used in mocks:
- Greeting: "Goedemorgen / Goedemiddag / Goedenavond, <Name>." (existing logic in Home.jsx)
- Theme line: "Mediterraans · week 3"
- Eyebrows: "Vanavond · diner", "Vandaag in cijfers", "Deze week", "Komende dagen"
- Empty state recipes: "Geen recepten gevonden" (existing)
- Save success: "✓ Opgeslagen" (existing) — in A direction, drop the emoji checkmark and use the `Check` line-icon.

---

## Files in this bundle

- `Chef Agent Redesign.html` — entry point. Open in a browser to see all 11 screens on a pannable canvas (drag to pan, scroll to zoom; click any artboard's expand icon to focus).
- `screens-a.jsx` — Direction A screens (`AHome`, `ARecipes`, `AWeek`, `ADetail`, `AShopping`, `ASettings`).
- `screens-b.jsx` — Direction B screens (`BHome`, `BRecipes`, `BWeek`, `BDetail`, `BSettings`).
- `icons.jsx` — Lucide-style inline SVG icon set used in mocks. **Don't ship this — use `lucide-react`** in the real codebase.
- `shared.jsx` — `PhotoPlaceholder` component + sample data (`SAMPLE_RECIPES`, `WEEK_PLAN`, `WEEK_DAYS`, `TODAY_DINER`).
- `ios-frame.jsx` — iPhone bezel scaffold (visualization only, not for production).
- `design-canvas.jsx` — Canvas wrapper (visualization only, not for production).
- `tweaks-panel.jsx` — Live tweaks panel (visualization only).

## Suggested implementation order
1. Pick one direction (A or B) — get sign-off.
2. Update `tailwind.config.js` with the chosen direction's color tokens (extend `colors`, add `backgroundColor.bg`/`surface`, etc.) and Google Fonts (Inter + optionally Fraunces).
3. Replace emoji icons with `lucide-react` everywhere (`App.jsx` nav, `RecipeCard`, `WeekPlan` meal rows, `Home` quick links).
4. Rebuild `Home.jsx` to match the new layout — biggest visible win.
5. Rebuild `WeekPlan.jsx` — week selector + day rows.
6. Rebuild `Recipes.jsx` (list) and `RecipeDetail.jsx` (hero + macros + ingredients).
7. Rebuild `Settings.jsx`.
8. Add new `Shopping.jsx` route under `/boodschappen/:week`.
