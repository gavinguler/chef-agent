# Chef Agent Frontend Redesign

**Date:** 2026-05-16
**Status:** Approved
**Scope:** Full visual + UX overhaul of all frontend pages — iOS native look on mobile, macOS Tahoe-style on desktop.

---

## Context

The current frontend uses generic Tailwind gray + emoji icons. The design handoff in `design_handoff/` specifies two reference directions; the chosen direction is **iOS native (mobile) + macOS sidebar (desktop)**, both sharing brand green `#1f7a4d` and SF Pro system font. Design references: `design_handoff/screens-ios.jsx`, `design_handoff/screens-desktop.jsx`, `design_handoff/design_handoff_chef_agent/README.md`.

---

## Design Tokens

Applied to `frontend/tailwind.config.js`:

| Token | Value | Usage |
|---|---|---|
| `brand` | `#1f7a4d` | Primary tint: buttons, active nav, filled icons |
| `brandSoft` | `rgba(31,122,77,0.12)` | Tinted chip backgrounds |
| `bg` | `#f2f2f7` | Page background (iOS systemGroupedBackground) |
| `surface` | `#ffffff` | Cards, grouped list containers |
| `ink` | `#000000` | Primary text |
| `ink2` | `rgba(60,60,67,0.6)` | Secondary text, detail values |
| `ink3` | `rgba(60,60,67,0.3)` | Tertiary text, muted icons, separators |
| `sep` | `rgba(60,60,67,0.12)` | Row separators (0.5px) |
| `fill` | `rgba(120,120,128,0.16)` | Search field bg, segmented control bg, ghost buttons |

**Font:** `-apple-system, BlinkMacSystemFont, "SF Pro Text", system-ui, sans-serif` set as `fontFamily.sans`. Renders as SF Pro on Apple devices, falls back to system-ui everywhere else. No external font load needed.

**Desktop breakpoint:** `lg` (1024px). Below = iOS mobile. Above = macOS sidebar layout.

---

## Architecture

### Approach: Component-first

Build shared primitives first, then assemble pages. All state/API logic lives in page components and is shared between mobile and desktop layout branches.

```
frontend/src/
  components/
    IOSPrimitives.jsx      # All mobile iOS atoms
    DesktopShell.jsx       # Desktop sidebar + toolbar scaffold
    ProteinRing.jsx        # SVG donut ring (shared)
    ThinBar.jsx            # Progress bar (shared)
    RecipeCard.jsx         # (existing, update styling)
    DayTabs.jsx            # (existing, remove — replaced)
    FreezerBanner.jsx      # (existing, keep + restyle)
  pages/
    Home.jsx               # rebuilt
    Recipes.jsx            # rebuilt
    WeekPlan.jsx           # rebuilt
    RecipeDetail.jsx       # rebuilt
    Shopping.jsx           # NEW
    Settings.jsx           # rebuilt
  App.jsx                  # add /boodschappen/:week route + update nav
```

### Responsive pattern

Each page uses a single component with two layout branches:

```jsx
export default function SomePage() {
  // All state + data fetching here (shared)
  return (
    <>
      <div className="lg:hidden">   {/* iOS mobile layout */}
        ...
      </div>
      <div className="hidden lg:block">  {/* macOS desktop layout */}
        ...
      </div>
    </>
  );
}
```

---

## Shared Components

### `IOSPrimitives.jsx`

Exports:

- **`IOSStatusBar`** — 54px top spacer for safe area
- **`IOSLargeHeader({ title, onBack, accessory })`** — 34px/700 large title, optional back chevron (brand color), optional right accessory
- **`IOSGroupHeader({ children })`** — uppercase 13px section label, `ink2` color, 16px left padding
- **`IOSGroup({ children, footer })`** — white rounded-10 container with `overflow-hidden`; optional footer string below
- **`IOSRow({ icon, iconBg, title, sub, detail, accessory, last, destructive })`** — 44px min-height row. Icon: 29×29 rounded-7 colored tile. Title: 17px/400. Sub: 13px ink2. Detail: 17px ink2. Inset 0.5px separator unless `last`. Red title if `destructive`.
- **`IOSToggle({ on, onChange })`** — 51×31, green (#34c759 iOS green) when on, `fill` when off. 27px white thumb with shadow. 200ms transition.
- **`IOSSearchField({ placeholder, value, onChange })`** — 36px height, `fill` bg, rounded-10, search icon
- **`IOSSegmented({ items, value, onChange })`** — `fill` bg container, white pill for active item with shadow
- **`IOSTabBar({ active })`** — fixed bottom, `paddingBottom: 30px` (safe area), blur backdrop. 5 items: Vandaag (Home), Recepten (BookOpen), Week (Calendar), Lijst (ShoppingCart), Instellingen (Settings). Active = brand color + filled icon variant. Uses `lucide-react` icons.

### `DesktopShell.jsx`

Exports:

- **`DesktopSidebar({ active })`** — 220px, blurred (`backdrop-blur-xl`) with `bg-sidebar`. Logo tile (28×28 green rounded-7 "C"), nav section with 5 items (Vandaag, Weekplan, Recepten, Boodschappen, Instellingen), week cycle section (weeks 1–8 with current highlighted), user footer (avatar initial + name). Active row: `rgba(0,0,0,0.06)` bg, brand text + icon.
- **`DesktopShell({ active, title, subtitle, accessory, children })`** — flex row: `DesktopSidebar` + main column (toolbar + scroll area). Toolbar: 52px, blurred white, title + subtitle + search field (220px, `fill` bg, `⌘K` hint) + accessory slot.
- **`Panel({ title, badge, children })`** — white rounded-12 card, 16px padding, 13px/700 title.
- **`Stat({ label, v })`** — uppercase 11px label + 17px/700 value.

### `ProteinRing.jsx`

SVG donut, 64×64. Props: `v` (current), `max`. Stroke: 6px, track = `fill` color, fill = `brand`. Centered percentage label 13px/700. Used on Home (mobile + desktop).

### `ThinBar.jsx`

Props: `v`, `max`, `label`, `unit`, `color` (default `brand`). 4px height, `fill` track, colored fill. Label left + `v / max unit` right in 13px ink2. Used on Home + desktop detail.

---

## Pages

### Home (`/`)

**Data:** `getCurrentWeek()` → cycle week. `getWeekPlan(week)` → full week plan. Derive: today's day name, today's meals, diner recipe.

**Mobile layout:**
1. `IOSStatusBar`
2. `IOSLargeHeader` title="Vandaag" + bell icon accessory (lucide `Bell`, 34×34 glass button)
3. Subtitle: `{thema} · week {n} · dag {d} van 7` in ink2 15px
4. Hero card — white rounded-14, photo placeholder (170px, uses `recipe.image_url` if set), brand-tinted eyebrow pill "DINER · {vlees}", recipe name 22px/700, kcal + eiwit row, two buttons: `btnFilled` "Recept openen" → navigate to detail, `btnTinted` + cart icon "Boodschap"
5. `IOSGroupHeader` "Vandaag"
6. `IOSGroup` containing `ProteinRing` + `ThinBar` for kcal — values from today's meal totals
7. `IOSGroupHeader` "Deze week"
8. 7-day strip: flex row of rounded-10 tiles, today = brand bg + white text
9. `IOSGroupHeader` "Komende dagen"
10. `IOSGroup` with next 3 days as `IOSRow`s
11. `IOSTabBar` active="home"

**Desktop layout:**
- `DesktopShell` title="Vandaag" subtitle="{dag} · week {n} · {thema}"
- Two-column grid (`1fr 320px`):
  - Left: hero card (320px photo + content area with recipe name, meta, 4 stat tiles, 3 buttons), week strip (7-column grid with photo + day + recipe name), recent recipes (4-column grid)
  - Right: `Panel` Macro's (ProteinRing + 3 ThinBars), `Panel` Vriezer (from freezer items), AI card (purple gradient)

### Recepten (`/recepten`)

**Data:** existing `getRecipes()`. Local state: search string (300ms debounce), active filter.

**Mobile:**
1. `IOSLargeHeader` "Recepten" + plus button
2. `IOSSearchField`
3. `IOSSegmented` items=["Alle", "Diner", "Lunch", "Veggie"]
4. `IOSGroupHeader` "{n} gerechten"
5. `IOSGroup` — list rows: 48×48 photo rounded-8, name 17px, `{cat} · {eiwit}g eiwit · {kcal} kcal` sub, chevron

**Desktop:**
- `DesktopShell` + left filter sidebar (220px) with checkbox filter groups (Categorie, Eiwitbron, Voorbereiding)
- Main: chip filter bar + auto-fill grid (`minmax(200px,1fr)`), each card: photo 130px, category eyebrow, name, meta

### WeekPlan (`/weekplan`)

**Data:** existing week selection logic + `getWeekPlan()`. Keep `weekStorage.js` override.

**Mobile:**
1. `IOSLargeHeader` "Week {n}"
2. Subtitle: thema + ink2
3. 8-pill week selector (flex, each `flex:1`, height 36, rounded-8, brand bg when active)
4. `IOSGroupHeader` "Maaltijden deze week"
5. `IOSGroup` — 7 rows, each: day-tag icon tile (brand if today, gray otherwise), diner recipe name, eiwit sub, chevron. Tap → navigate to detail.
6. `IOSGroupHeader` "Boodschappen"
7. `IOSGroup` — single row, cart icon tile (green), "Boodschappenlijst week {n}", "{count} items · ~€{est}", chevron → `/boodschappen/{n}`
8. `IOSTabBar` active="week"

**Desktop:**
- `DesktopShell` with week selector + prev/next buttons + shopping list button in toolbar accessory
- 3×7 grid (rows: Ontbijt, Lunch, Diner; cols: Ma–Zo). Each cell: white rounded-8 card with photo 56px + recipe name + eiwit. Today column: brand-soft bg + brand ring on cells.
- Week totals bar below grid.

### RecipeDetail (`/recepten/:id`)

**Data:** existing `getRecipe(id)`. AI macro estimation kept as-is.

**Mobile:**
1. 320px hero photo (full width, `image_url` or placeholder), floating back button (34×34 glass) + star button top-right
2. Body below photo: brand eyebrow `{cat} · {thema}`, h1 28px/700, "2 porties · {tijd} min"
3. `IOSGroupHeader` "Macro's" → `IOSGroup` with 4 rows (Calorieën, Eiwit, Vet, Koolhydraten) — detail value right-aligned
4. `IOSGroupHeader` "Ingrediënten" → `IOSGroup` rows: quantity (ink2, right-aligned in 64px), ingredient name
5. `IOSGroupHeader` "Bereiding" → `IOSGroup` with free text block
6. AI row: `IOSGroup` single row, purple icon tile (Sparkles), "Macro's opnieuw schatten met AI", chevron

**Desktop:**
- `DesktopShell` breadcrumb title, Edit + "Plan vanavond" buttons in accessory
- Left (1fr): 320px rounded-12 hero, description text, numbered steps list
- Right (360px): `Panel` Macro's (2×2 Stat grid + AI button), `Panel` Ingrediënten (quantity + name rows with 0.5px separators), `Panel` Gepland (day tile + date)

### Shopping (`/boodschappen/:week`) — NEW

**Data:** `getShoppingList(week)` from `api/client.js`. Local state: `Set<string>` of checked item IDs persisted to `localStorage` key `shopping-checked-{week}`.

**Mobile:**
1. `IOSLargeHeader` "Boodschappen" + back button + "Deel" accessory
2. Subtitle: "Week {n} · {total} items · ~€{est}"
3. 4px progress bar (checked/total), "X van Y" label
4. Per category: `IOSGroupHeader` + `IOSGroup` with check rows:
   - 24×24 circle: brand-filled with white checkmark when done, `ink3` border when not
   - 60px quantity column (ink2)
   - Item name (line-through + 0.45 opacity when checked)
   - Tap toggles checked state + updates localStorage

**Desktop:**
- `DesktopShell` + same content, slightly wider layout

### Settings (`/instellingen`)

**Data:** existing notification settings API.

**Mobile:**
1. `IOSLargeHeader` "Instellingen"
2. `IOSGroupHeader` "Cyclus" → `IOSGroup`: Huidige week (detail), Startdatum (detail)
3. `IOSGroupHeader` "Telegram" → `IOSGroup`: Verbonden row (Telegram icon tile, blue bg), Dagelijks bericht toggle + sub, Boodschappen toggle + sub, Vriezer-reminder toggle + sub
4. `IOSGroupHeader` "Voorkeuren" → `IOSGroup`: Eiwit-doel, Calorie-budget, Dieet — all with chevron + detail value
5. `IOSTabBar` active="inst"

**Desktop:** Same `DesktopShell` wrapper around same group structure.

---

## New Route

`App.jsx` adds:
```jsx
<Route path="/boodschappen/:week" element={<Shopping />} />
```

Tab bar and desktop sidebar both link to `/boodschappen/{currentWeek}`.

---

## Icons

Install `lucide-react` (already a dep or add it). Replace all emoji nav icons. Icons used:

`Home, BookOpen, Calendar, ShoppingCart, Settings` — tab bar / sidebar nav
`Bell` — home header
`ChevronRight, ChevronLeft` — rows, back button
`Plus` — recipes header
`Search` — search fields
`Sparkles` — AI button (accent purple `#af52de`)
`Snowflake` — freezer items
`Check` — shopping list checkmark

---

## Implementation Order

1. `tailwind.config.js` — token update + font
2. Install / verify `lucide-react`
3. `ProteinRing.jsx` + `ThinBar.jsx` (tiny, self-contained)
4. `IOSPrimitives.jsx` (all mobile atoms in one file)
5. `DesktopShell.jsx` (sidebar + shell + Panel + Stat)
6. `Home.jsx`
7. `WeekPlan.jsx`
8. `Recipes.jsx`
9. `RecipeDetail.jsx`
10. `Shopping.jsx` (new)
11. `Settings.jsx`
12. `App.jsx` — new route + nav update
