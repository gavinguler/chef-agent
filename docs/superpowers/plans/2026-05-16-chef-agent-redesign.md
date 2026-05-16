# Chef Agent Frontend Redesign — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild all frontend pages with iOS native design on mobile (< 1024px) and macOS Tahoe-style sidebar on desktop (≥ 1024px), using a shared component library.

**Architecture:** Component-first — build shared primitives (IOSPrimitives, DesktopShell, ProteinRing, ThinBar) first, then assemble pages. Each page exports a single component with two layout branches behind `lg:hidden` / `hidden lg:block` breakpoints. All state and data fetching lives at the page level and is shared by both layout branches.

**Tech Stack:** React 18 · Vite · TailwindCSS · lucide-react · react-router-dom

---

## File Map

| Action | File |
|---|---|
| Modify | `frontend/tailwind.config.js` |
| Create | `frontend/src/components/ProteinRing.jsx` |
| Create | `frontend/src/components/ThinBar.jsx` |
| Create | `frontend/src/components/IOSPrimitives.jsx` |
| Create | `frontend/src/components/DesktopShell.jsx` |
| Rebuild | `frontend/src/pages/Home.jsx` |
| Rebuild | `frontend/src/pages/WeekPlan.jsx` |
| Rebuild | `frontend/src/pages/Recipes.jsx` |
| Rebuild | `frontend/src/pages/RecipeDetail.jsx` |
| Rebuild | `frontend/src/pages/Shopping.jsx` |
| Rebuild | `frontend/src/pages/Settings.jsx` |
| Modify | `frontend/src/App.jsx` |

---

## Task 1: Update design tokens + font in tailwind.config.js

**Files:**
- Modify: `frontend/tailwind.config.js`

- [ ] **Step 1: Replace tailwind.config.js**

```js
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        brand:     "#1f7a4d",
        brandSoft: "rgba(31,122,77,0.12)",
        bg:        "#f2f2f7",
        surface:   "#ffffff",
        ink:       "#000000",
        ink2:      "rgba(60,60,67,0.6)",
        ink3:      "rgba(60,60,67,0.3)",
        sep:       "rgba(60,60,67,0.12)",
        fill:      "rgba(120,120,128,0.16)",
      },
      fontFamily: {
        sans: ['-apple-system', 'BlinkMacSystemFont', '"SF Pro Text"', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
```

- [ ] **Step 2: Run dev server and verify background color changes to light gray**

```bash
cd frontend && npm run dev
```

Open `http://localhost:5173` — body background should now be `#f2f2f7` (light iOS gray).

- [ ] **Step 3: Commit**

```bash
git add frontend/tailwind.config.js
git commit -m "style: update design tokens to iOS system palette"
```

---

## Task 2: Create ProteinRing.jsx + ThinBar.jsx

**Files:**
- Create: `frontend/src/components/ProteinRing.jsx`
- Create: `frontend/src/components/ThinBar.jsx`

- [ ] **Step 1: Create ProteinRing.jsx**

`frontend/src/components/ProteinRing.jsx`:
```jsx
export default function ProteinRing({ v = 0, max = 160 }) {
  const r = 26;
  const circumference = 2 * Math.PI * r;
  const pct = Math.min(1, v / max);
  const dash = pct * circumference;

  return (
    <div className="relative w-16 h-16 flex items-center justify-center">
      <svg width="64" height="64" className="-rotate-90">
        <circle cx="32" cy="32" r={r} fill="none" stroke="rgba(120,120,128,0.16)" strokeWidth="6" />
        <circle
          cx="32" cy="32" r={r}
          fill="none"
          stroke="#1f7a4d"
          strokeWidth="6"
          strokeDasharray={`${dash} ${circumference}`}
          strokeLinecap="round"
        />
      </svg>
      <span className="absolute text-[13px] font-bold text-ink">
        {Math.round(pct * 100)}%
      </span>
    </div>
  );
}
```

- [ ] **Step 2: Create ThinBar.jsx**

`frontend/src/components/ThinBar.jsx`:
```jsx
export default function ThinBar({ v = 0, max = 1, label = "", unit = "", color = "#1f7a4d" }) {
  const pct = Math.min(100, Math.round((v / max) * 100));
  return (
    <div className="mb-3">
      <div className="flex justify-between text-[13px] mb-1" style={{ color: 'rgba(60,60,67,0.6)' }}>
        <span>{label}</span>
        <span>{Math.round(v)} / {max} {unit}</span>
      </div>
      <div className="h-1 rounded-full overflow-hidden" style={{ background: 'rgba(120,120,128,0.16)' }}>
        <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: color }} />
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add frontend/src/components/ProteinRing.jsx frontend/src/components/ThinBar.jsx
git commit -m "feat: add ProteinRing and ThinBar shared components"
```

---

## Task 3: Create IOSPrimitives.jsx

**Files:**
- Create: `frontend/src/components/IOSPrimitives.jsx`

- [ ] **Step 1: Create IOSPrimitives.jsx**

`frontend/src/components/IOSPrimitives.jsx`:
```jsx
import { Link, NavLink } from "react-router-dom";
import { ChevronLeft, ChevronRight, Home, BookOpen, Calendar, ShoppingCart, Settings } from "lucide-react";

export function IOSStatusBar() {
  return <div className="h-[54px]" />;
}

export function IOSLargeHeader({ title, onBack, accessory }) {
  return (
    <div className="px-4 pt-2 pb-3">
      {onBack && (
        <button onClick={onBack} className="flex items-center gap-1 text-brand text-[17px] mb-1">
          <ChevronLeft size={22} />
          Terug
        </button>
      )}
      <div className="flex items-end justify-between">
        <h1 className="text-[34px] font-bold text-ink leading-tight">{title}</h1>
        {accessory && <div className="pb-1">{accessory}</div>}
      </div>
    </div>
  );
}

export function IOSGroupHeader({ children }) {
  return (
    <p className="px-4 pt-5 pb-1 text-[13px] uppercase text-ink2 tracking-wide">
      {children}
    </p>
  );
}

export function IOSGroup({ children, footer }) {
  return (
    <div className="mx-4">
      <div className="bg-surface rounded-[10px] overflow-hidden">
        {children}
      </div>
      {footer && <p className="text-[13px] text-ink2 px-4 pt-2">{footer}</p>}
    </div>
  );
}

export function IOSRow({ icon, iconBg, title, sub, detail, accessory, last, destructive, onClick }) {
  const content = (
    <>
      {icon && (
        <div
          className="w-[29px] h-[29px] rounded-[7px] flex items-center justify-center flex-shrink-0"
          style={{ background: iconBg || '#c7c7cc' }}
        >
          {icon}
        </div>
      )}
      <div className="flex-1 min-w-0">
        <p className={`text-[17px] leading-snug ${destructive ? 'text-red-500' : 'text-ink'}`}>{title}</p>
        {sub && <p className="text-[13px] text-ink2 mt-px leading-snug">{sub}</p>}
      </div>
      {detail && <span className="text-[17px] text-ink2 flex-shrink-0 ml-2">{detail}</span>}
      {accessory && <div className="flex-shrink-0 ml-2">{accessory}</div>}
      {onClick && !accessory && <ChevronRight size={18} className="text-ink3 flex-shrink-0 ml-2" />}
    </>
  );

  const cls = `flex items-center gap-3 px-4 py-[11px] min-h-[44px] bg-surface ${onClick ? 'active:bg-gray-50 cursor-pointer' : ''} ${!last ? 'border-b' : ''} border-sep`;

  return onClick
    ? <div onClick={onClick} className={cls}>{content}</div>
    : <div className={cls}>{content}</div>;
}

export function IOSToggle({ on, onChange }) {
  return (
    <button
      role="switch"
      aria-checked={on}
      onClick={() => onChange(!on)}
      className="relative flex-shrink-0 w-[51px] h-[31px] rounded-full transition-colors duration-200"
      style={{ background: on ? '#34c759' : 'rgba(120,120,128,0.16)' }}
    >
      <span
        className="absolute top-[2px] w-[27px] h-[27px] rounded-full bg-white transition-transform duration-200"
        style={{
          transform: on ? 'translateX(22px)' : 'translateX(2px)',
          boxShadow: '0 2px 6px rgba(0,0,0,0.2)',
        }}
      />
    </button>
  );
}

export function IOSSearchField({ placeholder, value, onChange }) {
  return (
    <div className="mx-4 mb-2">
      <div className="flex items-center gap-2 h-[36px] rounded-[10px] px-3 fill-bg" style={{ background: 'rgba(120,120,128,0.16)' }}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="rgba(60,60,67,0.6)" strokeWidth="2.5">
          <circle cx="11" cy="11" r="8" />
          <path d="m21 21-4.35-4.35" />
        </svg>
        <input
          className="flex-1 bg-transparent text-[15px] text-ink outline-none"
          placeholder={placeholder}
          style={{ '::placeholder': { color: 'rgba(60,60,67,0.3)' } }}
          value={value}
          onChange={e => onChange(e.target.value)}
        />
        {value && (
          <button onClick={() => onChange('')} className="text-ink3 text-[15px] leading-none">✕</button>
        )}
      </div>
    </div>
  );
}

export function IOSSegmented({ items, value, onChange }) {
  return (
    <div className="mx-4 mb-3">
      <div className="flex p-[2px] rounded-[9px]" style={{ background: 'rgba(120,120,128,0.16)' }}>
        {items.map(item => (
          <button
            key={item}
            onClick={() => onChange(item)}
            className={`flex-1 text-[13px] font-medium py-[6px] rounded-[7px] transition-all ${value === item ? 'bg-white text-ink shadow-sm' : 'text-ink2'}`}
          >
            {item}
          </button>
        ))}
      </div>
    </div>
  );
}

const TAB_ITEMS = [
  { id: 'home',     label: 'Vandaag',      to: '/',            Icon: Home,         end: true },
  { id: 'recipes',  label: 'Recepten',     to: '/recepten',    Icon: BookOpen },
  { id: 'week',     label: 'Week',         to: '/weekplan',    Icon: Calendar },
  { id: 'shopping', label: 'Lijst',        to: '/boodschappen', Icon: ShoppingCart },
  { id: 'settings', label: 'Instellingen', to: '/instellingen', Icon: Settings },
];

export function IOSTabBar() {
  return (
    <div
      className="fixed bottom-0 left-0 right-0 lg:hidden z-50"
      style={{
        paddingBottom: 'env(safe-area-inset-bottom, 16px)',
        background: 'rgba(249,249,249,0.94)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderTop: '0.5px solid rgba(60,60,67,0.12)',
      }}
    >
      <nav className="flex pt-2">
        {TAB_ITEMS.map(({ id, label, to, Icon, end }) => (
          <NavLink
            key={id}
            to={to}
            end={end}
            className={({ isActive }) =>
              `flex-1 flex flex-col items-center gap-[3px] pb-2 ${isActive ? 'text-brand' : 'text-ink3'}`
            }
          >
            {({ isActive }) => (
              <>
                <Icon size={22} strokeWidth={isActive ? 2.2 : 1.6} />
                <span style={{ fontSize: 10, fontWeight: isActive ? 600 : 500 }}>{label}</span>
              </>
            )}
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
```

- [ ] **Step 2: Verify no import errors by running dev server and checking console**

```bash
cd frontend && npm run dev
```

No red console errors expected. The components aren't used yet so nothing visual to check.

- [ ] **Step 3: Commit**

```bash
git add frontend/src/components/IOSPrimitives.jsx
git commit -m "feat: add IOSPrimitives shared component library"
```

---

## Task 4: Create DesktopShell.jsx

**Files:**
- Create: `frontend/src/components/DesktopShell.jsx`

- [ ] **Step 1: Create DesktopShell.jsx**

`frontend/src/components/DesktopShell.jsx`:
```jsx
import { NavLink } from "react-router-dom";
import { Home, BookOpen, Calendar, ShoppingCart, Settings } from "lucide-react";

const NAV_ITEMS = [
  { id: 'home',     label: 'Vandaag',       to: '/',             Icon: Home,         end: true },
  { id: 'week',     label: 'Weekplan',       to: '/weekplan',     Icon: Calendar },
  { id: 'recipes',  label: 'Recepten',       to: '/recepten',     Icon: BookOpen },
  { id: 'shopping', label: 'Boodschappen',   to: '/boodschappen', Icon: ShoppingCart },
  { id: 'settings', label: 'Instellingen',   to: '/instellingen', Icon: Settings },
];

export function DesktopSidebar() {
  return (
    <aside
      className="w-[220px] flex-shrink-0 flex flex-col h-screen sticky top-0"
      style={{
        background: 'rgba(246,246,246,0.85)',
        backdropFilter: 'blur(30px)',
        WebkitBackdropFilter: 'blur(30px)',
        borderRight: '0.5px solid rgba(60,60,67,0.12)',
      }}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 pt-8 pb-5">
        <div className="w-7 h-7 rounded-[7px] bg-brand flex items-center justify-center">
          <span className="text-white text-[15px] font-bold">C</span>
        </div>
        <span className="text-[15px] font-semibold text-ink">Chef Agent</span>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 space-y-px">
        {NAV_ITEMS.map(({ id, label, to, Icon, end }) => (
          <NavLink
            key={id}
            to={to}
            end={end}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-[7px] rounded-[8px] text-[14px] transition-colors ${
                isActive ? 'bg-black/[0.06] text-brand font-medium' : 'text-ink hover:bg-black/[0.03]'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <Icon size={18} strokeWidth={isActive ? 2.2 : 1.6} />
                {label}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      <div className="px-5 py-5 border-t border-sep">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-brand flex items-center justify-center">
            <span className="text-white text-[13px] font-bold">G</span>
          </div>
          <div>
            <p className="text-[13px] font-medium text-ink leading-none">Gavin</p>
            <p className="text-[11px] text-ink2 mt-[2px]">Chef Agent</p>
          </div>
        </div>
      </div>
    </aside>
  );
}

export function Panel({ title, badge, children }) {
  return (
    <div className="bg-surface rounded-[12px] p-4">
      {title && (
        <div className="flex items-center gap-2 mb-3">
          <p className="text-[13px] font-bold text-ink uppercase tracking-wide">{title}</p>
          {badge && (
            <span className="text-[11px] font-semibold text-white bg-brand px-2 py-px rounded-full">{badge}</span>
          )}
        </div>
      )}
      {children}
    </div>
  );
}

export function Stat({ label, v }) {
  return (
    <div>
      <p className="text-[11px] font-semibold uppercase tracking-wide text-ink2">{label}</p>
      <p className="text-[17px] font-bold text-ink mt-px">{v}</p>
    </div>
  );
}

export default function DesktopShell({ title, subtitle, accessory, children }) {
  return (
    <div className="flex min-h-screen bg-bg">
      <DesktopSidebar />

      <div className="flex-1 flex flex-col min-h-screen overflow-hidden">
        {/* Toolbar */}
        <header
          className="h-[52px] flex items-center justify-between px-6 flex-shrink-0 sticky top-0 z-10"
          style={{
            background: 'rgba(255,255,255,0.85)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            borderBottom: '0.5px solid rgba(60,60,67,0.12)',
          }}
        >
          <div className="flex items-baseline gap-3">
            <h1 className="text-[17px] font-semibold text-ink">{title}</h1>
            {subtitle && <p className="text-[13px] text-ink2">{subtitle}</p>}
          </div>
          {accessory && <div className="flex items-center gap-3">{accessory}</div>}
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Verify no import errors**

```bash
cd frontend && npm run dev
```

No red console errors.

- [ ] **Step 3: Commit**

```bash
git add frontend/src/components/DesktopShell.jsx
git commit -m "feat: add DesktopShell sidebar + layout components"
```

---

## Task 5: Rebuild Home.jsx

**Files:**
- Modify: `frontend/src/pages/Home.jsx`

- [ ] **Step 1: Replace Home.jsx**

`frontend/src/pages/Home.jsx`:
```jsx
import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Bell, ShoppingCart, ChevronRight, Snowflake } from "lucide-react";
import { getWeekPlan, getCurrentWeek } from "../api/client";
import { getStoredWeek } from "../lib/weekStorage";
import {
  IOSStatusBar, IOSLargeHeader, IOSGroupHeader, IOSGroup, IOSRow, IOSTabBar,
} from "../components/IOSPrimitives";
import DesktopShell, { Panel, Stat } from "../components/DesktopShell";
import ProteinRing from "../components/ProteinRing";
import ThinBar from "../components/ThinBar";

const DAG_NL    = ["zondag","maandag","dinsdag","woensdag","donderdag","vrijdag","zaterdag"];
const DAG_SHORT = ["Zo","Ma","Di","Wo","Do","Vr","Za"];
const DAG_SHORT_NL = ["zo","ma","di","wo","do","vr","za"];

function usePlan() {
  const [cycleWeek, setCycleWeek] = useState(null);
  const [weekPlan, setWeekPlan] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = getStoredWeek();
    if (stored) setCycleWeek(stored);
    else getCurrentWeek().then(setCycleWeek);
  }, []);

  useEffect(() => {
    if (!cycleWeek) return;
    setLoading(true);
    getWeekPlan(cycleWeek).then(setWeekPlan).finally(() => setLoading(false));
  }, [cycleWeek]);

  return { cycleWeek, weekPlan, loading };
}

export default function Home() {
  const navigate = useNavigate();
  const { cycleWeek, weekPlan, loading } = usePlan();

  const now = new Date();
  const todayNl = DAG_NL[now.getDay()];

  const weekDates = useMemo(() => {
    const d = new Date(now);
    const dow = d.getDay() === 0 ? 6 : d.getDay() - 1;
    d.setDate(d.getDate() - dow);
    return Array.from({ length: 7 }, (_, i) => {
      const dd = new Date(d);
      dd.setDate(d.getDate() + i);
      return {
        short: DAG_SHORT_NL[dd.getDay()],
        date: dd.getDate(),
        isToday: dd.toDateString() === now.toDateString(),
        dayNl: DAG_NL[dd.getDay()],
      };
    });
  }, []);

  const dagData = weekPlan?.dagen?.find(d => d.dag === todayNl);
  const maaltijden = dagData?.maaltijden ?? [];
  const diner = maaltijden.find(m => m.maaltijd_type === "diner");
  const eiwit = dagData?.totaal_eiwit_g ?? 0;
  const kcal = dagData?.totaal_kcal ?? 0;
  const thema = weekPlan?.vlees_thema ?? "";

  const nextDays = weekDates.filter(d => !d.isToday).slice(0, 3).map(d => {
    const dag = weekPlan?.dagen?.find(x => x.dag === d.dayNl);
    const dinr = dag?.maaltijden?.find(m => m.maaltijd_type === "diner");
    return { ...d, diner: dinr };
  });

  return (
    <>
      {/* ── Mobile ── */}
      <div className="lg:hidden min-h-screen bg-bg pb-[100px]">
        <IOSStatusBar />
        <IOSLargeHeader
          title="Vandaag"
          accessory={
            <button className="w-[34px] h-[34px] rounded-full flex items-center justify-center" style={{ background: 'rgba(120,120,128,0.16)' }}>
              <Bell size={18} className="text-ink" />
            </button>
          }
        />

        {/* Subtitle */}
        <p className="px-4 mb-4 text-[15px] text-ink2">
          {thema ? `${thema} · ` : ""}week {cycleWeek}
        </p>

        {/* Hero card */}
        {diner && (
          <div className="mx-4 mb-6 bg-surface rounded-[14px] overflow-hidden shadow-sm">
            <div className="h-[170px] bg-fill flex items-center justify-center">
              {diner.image_url
                ? <img src={diner.image_url} alt={diner.naam} className="w-full h-full object-cover" />
                : <span className="text-4xl">🍽️</span>
              }
            </div>
            <div className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-[11px] font-bold uppercase tracking-wide px-2 py-[2px] rounded-full text-brand" style={{ background: 'rgba(31,122,77,0.12)' }}>
                  DINER
                </span>
              </div>
              <h2 className="text-[22px] font-bold text-ink mb-2">{diner.naam}</h2>
              <p className="text-[13px] text-ink2 mb-4">
                {diner.eiwit_g ? `${Math.round(diner.eiwit_g)}g eiwit` : ""}{diner.kcal ? ` · ${diner.kcal} kcal` : ""}
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => navigate(`/recepten/${diner.recept_id}`)}
                  className="flex-1 py-[10px] rounded-[10px] bg-brand text-white text-[15px] font-semibold"
                >
                  Recept openen
                </button>
                <button
                  onClick={() => navigate(`/boodschappen/${cycleWeek}`)}
                  className="px-4 py-[10px] rounded-[10px] text-brand text-[15px] font-semibold flex items-center gap-1"
                  style={{ background: 'rgba(31,122,77,0.12)' }}
                >
                  <ShoppingCart size={16} />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Macro's */}
        <IOSGroupHeader>Vandaag</IOSGroupHeader>
        <IOSGroup>
          <div className="p-4 flex items-start gap-4">
            <ProteinRing v={eiwit} max={160} />
            <div className="flex-1">
              <ThinBar v={kcal} max={2700} label="Calorieën" unit="kcal" />
              <ThinBar v={eiwit} max={160} label="Eiwit" unit="g" />
            </div>
          </div>
        </IOSGroup>

        {/* Week strip */}
        <IOSGroupHeader>Deze week</IOSGroupHeader>
        <div className="mx-4 flex gap-[6px]">
          {weekDates.map((d) => (
            <div
              key={d.dayNl}
              className="flex-1 flex flex-col items-center py-2 rounded-[10px] text-[12px] font-medium"
              style={d.isToday
                ? { background: '#1f7a4d', color: '#fff' }
                : { background: 'rgba(120,120,128,0.16)', color: 'rgba(60,60,67,0.6)' }
              }
            >
              <span className="uppercase text-[10px] tracking-wide">{d.short}</span>
              <span className="font-bold text-[15px] mt-px">{d.date}</span>
            </div>
          ))}
        </div>

        {/* Komende dagen */}
        <IOSGroupHeader>Komende dagen</IOSGroupHeader>
        <IOSGroup>
          {nextDays.map((d, i) => (
            <IOSRow
              key={d.dayNl}
              title={d.diner?.naam ?? "Niet ingesteld"}
              sub={d.short.toUpperCase() + " · " + (d.diner?.eiwit_g ? `${Math.round(d.diner.eiwit_g)}g eiwit` : "")}
              last={i === nextDays.length - 1}
              onClick={d.diner?.recept_id ? () => navigate(`/recepten/${d.diner.recept_id}`) : undefined}
            />
          ))}
        </IOSGroup>

        <IOSTabBar />
      </div>

      {/* ── Desktop ── */}
      <div className="hidden lg:block">
        <DesktopShell
          title="Vandaag"
          subtitle={`${thema ? thema + ' · ' : ''}week ${cycleWeek}`}
        >
          {loading ? (
            <div className="animate-pulse bg-surface rounded-[12px] h-64" />
          ) : (
            <div className="grid gap-6" style={{ gridTemplateColumns: '1fr 320px' }}>
              {/* Left */}
              <div className="space-y-6">
                {/* Hero */}
                {diner && (
                  <div className="bg-surface rounded-[12px] overflow-hidden shadow-sm flex">
                    <div className="w-[320px] flex-shrink-0 bg-fill flex items-center justify-center">
                      {diner.image_url
                        ? <img src={diner.image_url} alt={diner.naam} className="w-full h-full object-cover" />
                        : <span className="text-5xl">🍽️</span>
                      }
                    </div>
                    <div className="p-6 flex flex-col justify-between">
                      <div>
                        <span className="text-[11px] font-bold uppercase tracking-wide text-brand px-2 py-px rounded-full" style={{ background: 'rgba(31,122,77,0.12)' }}>
                          DINER
                        </span>
                        <h2 className="text-[22px] font-bold text-ink mt-2 mb-1">{diner.naam}</h2>
                        <p className="text-[14px] text-ink2">{diner.eiwit_g ? `${Math.round(diner.eiwit_g)}g eiwit` : ""}{diner.kcal ? ` · ${diner.kcal} kcal` : ""}</p>
                      </div>
                      <div className="flex gap-3 mt-4">
                        <button
                          onClick={() => navigate(`/recepten/${diner.recept_id}`)}
                          className="px-4 py-2 rounded-[8px] bg-brand text-white text-[14px] font-semibold"
                        >
                          Recept openen
                        </button>
                        <button
                          onClick={() => navigate(`/boodschappen/${cycleWeek}`)}
                          className="px-4 py-2 rounded-[8px] text-brand text-[14px] font-semibold flex items-center gap-2"
                          style={{ background: 'rgba(31,122,77,0.12)' }}
                        >
                          <ShoppingCart size={16} />
                          Boodschappen
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Week strip */}
                <div className="grid grid-cols-7 gap-3">
                  {weekDates.map(d => {
                    const dag = weekPlan?.dagen?.find(x => x.dag === d.dayNl);
                    const dinr = dag?.maaltijden?.find(m => m.maaltijd_type === "diner");
                    return (
                      <div
                        key={d.dayNl}
                        className="bg-surface rounded-[10px] p-3 text-center cursor-pointer"
                        style={d.isToday ? { outline: '2px solid #1f7a4d', background: 'rgba(31,122,77,0.06)' } : {}}
                        onClick={() => dinr?.recept_id && navigate(`/recepten/${dinr.recept_id}`)}
                      >
                        <p className="text-[11px] font-semibold uppercase text-ink2">{d.short}</p>
                        <p className="text-[17px] font-bold text-ink">{d.date}</p>
                        {dinr && <p className="text-[11px] text-ink2 mt-1 leading-tight">{dinr.naam}</p>}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Right */}
              <div className="space-y-4">
                <Panel title="Macro's">
                  <div className="flex items-center gap-4 mb-4">
                    <ProteinRing v={eiwit} max={160} />
                    <div className="flex-1">
                      <Stat label="Eiwit" v={`${Math.round(eiwit)}g`} />
                    </div>
                  </div>
                  <ThinBar v={kcal} max={2700} label="Calorieën" unit="kcal" />
                  <ThinBar v={eiwit} max={160} label="Eiwit" unit="g" />
                </Panel>
              </div>
            </div>
          )}
        </DesktopShell>
      </div>
    </>
  );
}
```

- [ ] **Step 2: Open browser and verify**

```bash
cd frontend && npm run dev
```

- Mobile (< 1024px): large "Vandaag" title, hero dinner card, macro ring, week strip, tab bar at bottom
- Desktop (≥ 1024px): sidebar with nav, toolbar, two-column layout

- [ ] **Step 3: Commit**

```bash
git add frontend/src/pages/Home.jsx
git commit -m "feat: rebuild Home page with iOS mobile + macOS desktop layouts"
```

---

## Task 6: Rebuild WeekPlan.jsx

**Files:**
- Modify: `frontend/src/pages/WeekPlan.jsx`

- [ ] **Step 1: Replace WeekPlan.jsx**

`frontend/src/pages/WeekPlan.jsx`:
```jsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ShoppingCart } from "lucide-react";
import { getWeekPlan, getCurrentWeek } from "../api/client";
import { getStoredWeek } from "../lib/weekStorage";
import {
  IOSStatusBar, IOSLargeHeader, IOSGroupHeader, IOSGroup, IOSRow, IOSTabBar,
} from "../components/IOSPrimitives";
import DesktopShell from "../components/DesktopShell";

const DAYS_NL  = ["maandag","dinsdag","woensdag","donderdag","vrijdag","zaterdag","zondag"];
const DAYS_SHORT = ["Ma","Di","Wo","Do","Vr","Za","Zo"];
const MEAL_TYPES = ["ontbijt","lunch","snack","diner","avondsnack"];
const MEAL_LABEL = { ontbijt:"Ontbijt", lunch:"Lunch", snack:"Snack", diner:"Diner", avondsnack:"Avondsnack" };

export default function WeekPlan() {
  const navigate = useNavigate();
  const [cycleWeek, setCycleWeek] = useState(null);
  const [selectedWeek, setSelectedWeek] = useState(null);
  const [weekPlan, setWeekPlan] = useState(null);
  const [loading, setLoading] = useState(true);

  const todayIndex = new Date().getDay();
  const todayNl = DAYS_NL[todayIndex === 0 ? 6 : todayIndex - 1];

  useEffect(() => {
    const stored = getStoredWeek();
    if (stored) { setCycleWeek(stored); setSelectedWeek(stored); }
    else getCurrentWeek().then(w => { setCycleWeek(w); setSelectedWeek(w); });
  }, []);

  useEffect(() => {
    if (!selectedWeek) return;
    setLoading(true);
    getWeekPlan(selectedWeek)
      .then(setWeekPlan)
      .finally(() => setLoading(false));
  }, [selectedWeek]);

  const shoppingCount = weekPlan?.dagen?.reduce(
    (acc, d) => acc + (d.maaltijden?.length ?? 0), 0
  ) ?? 0;

  return (
    <>
      {/* ── Mobile ── */}
      <div className="lg:hidden min-h-screen bg-bg pb-[100px]">
        <IOSStatusBar />
        <IOSLargeHeader title={`Week ${selectedWeek ?? ""}`} />
        {weekPlan?.vlees_thema && (
          <p className="px-4 mb-3 text-[15px] text-ink2">{weekPlan.vlees_thema}</p>
        )}

        {/* Week selector */}
        <div className="px-4 mb-4 flex gap-[6px] flex-wrap">
          {Array.from({ length: 8 }, (_, i) => i + 1).map(w => (
            <button
              key={w}
              onClick={() => setSelectedWeek(w)}
              className="flex-1 min-w-[36px] h-[36px] rounded-[8px] text-[14px] font-semibold transition-colors"
              style={
                selectedWeek === w
                  ? { background: '#1f7a4d', color: '#fff' }
                  : w === cycleWeek
                  ? { background: 'rgba(31,122,77,0.12)', color: '#1f7a4d' }
                  : { background: 'rgba(120,120,128,0.16)', color: 'rgba(60,60,67,0.6)' }
              }
            >
              {w}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="mx-4 animate-pulse bg-surface rounded-[10px] h-40" />
        ) : (
          <>
            <IOSGroupHeader>Maaltijden deze week</IOSGroupHeader>
            <IOSGroup>
              {DAYS_NL.map((day, i) => {
                const dagData = weekPlan?.dagen?.find(d => d.dag === day);
                const diner = dagData?.maaltijden?.find(m => m.maaltijd_type === "diner");
                const isToday = day === todayNl;
                return (
                  <IOSRow
                    key={day}
                    icon={
                      <span className="text-[12px] font-bold text-white">{DAYS_SHORT[i]}</span>
                    }
                    iconBg={isToday ? '#1f7a4d' : 'rgba(120,120,128,0.3)'}
                    title={diner?.naam ?? "Niet ingesteld"}
                    sub={diner?.eiwit_g ? `${Math.round(diner.eiwit_g)}g eiwit` : ""}
                    last={i === 6}
                    onClick={diner?.recept_id ? () => navigate(`/recepten/${diner.recept_id}`) : undefined}
                  />
                );
              })}
            </IOSGroup>

            <IOSGroupHeader>Boodschappen</IOSGroupHeader>
            <IOSGroup>
              <IOSRow
                icon={<ShoppingCart size={16} className="text-white" />}
                iconBg="#1f7a4d"
                title={`Boodschappenlijst week ${selectedWeek}`}
                sub={`${shoppingCount} items`}
                last
                onClick={() => navigate(`/boodschappen/${selectedWeek}`)}
              />
            </IOSGroup>
          </>
        )}

        <IOSTabBar />
      </div>

      {/* ── Desktop ── */}
      <div className="hidden lg:block">
        <DesktopShell
          title={`Weekplan — Week ${selectedWeek ?? ""}`}
          subtitle={weekPlan?.vlees_thema}
          accessory={
            <div className="flex items-center gap-3">
              <div className="flex gap-1">
                {Array.from({ length: 8 }, (_, i) => i + 1).map(w => (
                  <button
                    key={w}
                    onClick={() => setSelectedWeek(w)}
                    className="w-8 h-8 rounded-[6px] text-[13px] font-semibold transition-colors"
                    style={
                      selectedWeek === w
                        ? { background: '#1f7a4d', color: '#fff' }
                        : { background: 'rgba(120,120,128,0.16)', color: 'rgba(60,60,67,0.6)' }
                    }
                  >
                    {w}
                  </button>
                ))}
              </div>
              <button
                onClick={() => navigate(`/boodschappen/${selectedWeek}`)}
                className="flex items-center gap-2 px-4 py-2 rounded-[8px] bg-brand text-white text-[14px] font-semibold"
              >
                <ShoppingCart size={16} />
                Boodschappenlijst
              </button>
            </div>
          }
        >
          {loading ? (
            <div className="animate-pulse bg-surface rounded-[12px] h-64" />
          ) : (
            <div>
              {/* 3×7 meal grid */}
              <div className="grid gap-3 mb-6" style={{ gridTemplateColumns: `120px repeat(7, 1fr)` }}>
                {/* Header row */}
                <div />
                {DAYS_NL.map((day, i) => {
                  const isToday = day === todayNl;
                  return (
                    <div key={day} className="text-center pb-2">
                      <p className="text-[12px] font-semibold uppercase text-ink2">{DAYS_SHORT[i]}</p>
                      {isToday && <div className="w-1.5 h-1.5 rounded-full bg-brand mx-auto mt-1" />}
                    </div>
                  );
                })}

                {/* Meal rows */}
                {["diner"].map(mealType => (
                  <>
                    <div key={`label-${mealType}`} className="flex items-center">
                      <p className="text-[13px] font-semibold text-ink2">{MEAL_LABEL[mealType]}</p>
                    </div>
                    {DAYS_NL.map((day, i) => {
                      const dagData = weekPlan?.dagen?.find(d => d.dag === day);
                      const maaltijd = dagData?.maaltijden?.find(m => m.maaltijd_type === mealType);
                      const isToday = day === todayNl;
                      return (
                        <div
                          key={`${mealType}-${day}`}
                          onClick={() => maaltijd?.recept_id && navigate(`/recepten/${maaltijd.recept_id}`)}
                          className={`bg-surface rounded-[8px] p-3 ${maaltijd?.recept_id ? 'cursor-pointer hover:shadow-sm' : ''}`}
                          style={isToday ? { background: 'rgba(31,122,77,0.06)', outline: '1.5px solid rgba(31,122,77,0.3)' } : {}}
                        >
                          {maaltijd
                            ? <>
                                <p className="text-[13px] font-medium text-ink leading-snug">{maaltijd.naam}</p>
                                {maaltijd.eiwit_g && <p className="text-[11px] text-ink2 mt-1">{Math.round(maaltijd.eiwit_g)}g eiwit</p>}
                              </>
                            : <p className="text-[12px] text-ink3 italic">—</p>
                          }
                        </div>
                      );
                    })}
                  </>
                ))}
              </div>
            </div>
          )}
        </DesktopShell>
      </div>
    </>
  );
}
```

- [ ] **Step 2: Verify in browser**

- Mobile: week number pills, 7-day meal list rows, shopping row
- Desktop: sidebar + week selector in toolbar + day-column grid

- [ ] **Step 3: Commit**

```bash
git add frontend/src/pages/WeekPlan.jsx
git commit -m "feat: rebuild WeekPlan with iOS mobile + macOS desktop layouts"
```

---

## Task 7: Rebuild Recipes.jsx

**Files:**
- Modify: `frontend/src/pages/Recipes.jsx`

- [ ] **Step 1: Replace Recipes.jsx**

`frontend/src/pages/Recipes.jsx`:
```jsx
import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, ChevronRight } from "lucide-react";
import { getRecipes } from "../api/client";
import {
  IOSStatusBar, IOSLargeHeader, IOSGroupHeader, IOSGroup, IOSRow,
  IOSSearchField, IOSSegmented, IOSTabBar,
} from "../components/IOSPrimitives";
import DesktopShell from "../components/DesktopShell";

const FILTERS = ["Alle", "Diner", "Lunch", "Veggie"];

function useRecipes() {
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    getRecipes().then(setRecipes).finally(() => setLoading(false));
  }, []);
  return { recipes, loading };
}

export default function Recipes() {
  const navigate = useNavigate();
  const { recipes, loading } = useRecipes();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("Alle");
  const [debounced, setDebounced] = useState("");

  useEffect(() => {
    const t = setTimeout(() => setDebounced(search), 300);
    return () => clearTimeout(t);
  }, [search]);

  const filtered = useMemo(() => {
    return recipes.filter(r => {
      const matchSearch = !debounced || r.naam?.toLowerCase().includes(debounced.toLowerCase());
      const matchFilter = filter === "Alle"
        || (filter === "Diner" && r.categorie === "diner")
        || (filter === "Lunch" && r.categorie === "lunch")
        || (filter === "Veggie" && r.is_vegetarisch);
      return matchSearch && matchFilter;
    });
  }, [recipes, debounced, filter]);

  return (
    <>
      {/* ── Mobile ── */}
      <div className="lg:hidden min-h-screen bg-bg pb-[100px]">
        <IOSStatusBar />
        <IOSLargeHeader
          title="Recepten"
          accessory={
            <button className="w-[32px] h-[32px] rounded-full bg-brand flex items-center justify-center">
              <Plus size={20} className="text-white" />
            </button>
          }
        />

        <IOSSearchField placeholder="Zoek recepten..." value={search} onChange={setSearch} />
        <IOSSegmented items={FILTERS} value={filter} onChange={setFilter} />

        <IOSGroupHeader>{filtered.length} gerechten</IOSGroupHeader>
        <IOSGroup>
          {loading ? (
            <div className="h-32 animate-pulse" />
          ) : filtered.map((r, i) => (
            <IOSRow
              key={r.id}
              icon={
                r.image_url
                  ? <img src={r.image_url} alt={r.naam} className="w-full h-full object-cover rounded-[7px]" />
                  : <span className="text-[16px]">🍽️</span>
              }
              iconBg={r.image_url ? "transparent" : "#e5e5ea"}
              title={r.naam}
              sub={`${r.categorie ?? ""} · ${r.eiwit_g ? Math.round(r.eiwit_g) + "g eiwit" : ""} · ${r.kcal ? r.kcal + " kcal" : ""}`}
              last={i === filtered.length - 1}
              onClick={() => navigate(`/recepten/${r.id}`)}
            />
          ))}
        </IOSGroup>

        <IOSTabBar />
      </div>

      {/* ── Desktop ── */}
      <div className="hidden lg:block">
        <DesktopShell
          title="Recepten"
          subtitle={`${filtered.length} gerechten`}
          accessory={
            <button className="flex items-center gap-2 px-4 py-2 rounded-[8px] bg-brand text-white text-[14px] font-semibold">
              <Plus size={16} />
              Nieuw recept
            </button>
          }
        >
          {/* Filter bar */}
          <div className="flex items-center gap-3 mb-6">
            <div className="flex gap-2">
              {FILTERS.map(f => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className="px-3 py-[6px] rounded-full text-[13px] font-medium transition-colors"
                  style={filter === f
                    ? { background: '#1f7a4d', color: '#fff' }
                    : { background: 'rgba(120,120,128,0.16)', color: 'rgba(60,60,67,0.6)' }
                  }
                >
                  {f}
                </button>
              ))}
            </div>
          </div>

          {/* Grid */}
          {loading ? (
            <div className="animate-pulse bg-surface rounded-[12px] h-64" />
          ) : (
            <div className="grid gap-4" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))' }}>
              {filtered.map(r => (
                <div
                  key={r.id}
                  onClick={() => navigate(`/recepten/${r.id}`)}
                  className="bg-surface rounded-[12px] overflow-hidden cursor-pointer hover:shadow-md transition-shadow"
                >
                  <div className="h-[130px] bg-fill flex items-center justify-center">
                    {r.image_url
                      ? <img src={r.image_url} alt={r.naam} className="w-full h-full object-cover" />
                      : <span className="text-4xl">🍽️</span>
                    }
                  </div>
                  <div className="p-3">
                    <p className="text-[11px] font-bold uppercase tracking-wide text-ink2">{r.categorie}</p>
                    <p className="text-[15px] font-semibold text-ink mt-1 leading-snug">{r.naam}</p>
                    <p className="text-[12px] text-ink2 mt-1">
                      {r.eiwit_g ? `${Math.round(r.eiwit_g)}g eiwit` : ""}
                      {r.kcal ? ` · ${r.kcal} kcal` : ""}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </DesktopShell>
      </div>
    </>
  );
}
```

- [ ] **Step 2: Verify in browser**

- Mobile: search + segmented filter + list rows with recipe name + macros
- Desktop: chip filters + auto-fill card grid

- [ ] **Step 3: Commit**

```bash
git add frontend/src/pages/Recipes.jsx
git commit -m "feat: rebuild Recipes with iOS mobile + macOS desktop layouts"
```

---

## Task 8: Rebuild RecipeDetail.jsx

**Files:**
- Modify: `frontend/src/pages/RecipeDetail.jsx`

- [ ] **Step 1: Replace RecipeDetail.jsx**

`frontend/src/pages/RecipeDetail.jsx`:
```jsx
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Star, Sparkles } from "lucide-react";
import { getRecipe, aiFillMacros } from "../api/client";
import {
  IOSStatusBar, IOSLargeHeader, IOSGroupHeader, IOSGroup, IOSRow, IOSTabBar,
} from "../components/IOSPrimitives";
import DesktopShell, { Panel, Stat } from "../components/DesktopShell";

export default function RecipeDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [recipe, setRecipe] = useState(null);
  const [loading, setLoading] = useState(true);
  const [aiLoading, setAiLoading] = useState(false);

  useEffect(() => {
    getRecipe(id).then(setRecipe).finally(() => setLoading(false));
  }, [id]);

  async function handleAiFill() {
    if (!recipe) return;
    setAiLoading(true);
    try {
      const result = await aiFillMacros(recipe.naam, recipe.ingredienten);
      setRecipe(r => ({ ...r, ...result }));
    } finally {
      setAiLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-brand border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!recipe) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center">
        <p className="text-ink2">Recept niet gevonden</p>
      </div>
    );
  }

  const macros = [
    { label: "Calorieën", value: recipe.kcal ? `${recipe.kcal} kcal` : "—" },
    { label: "Eiwit",     value: recipe.eiwit_g ? `${Math.round(recipe.eiwit_g)}g` : "—" },
    { label: "Vet",       value: recipe.vet_g ? `${Math.round(recipe.vet_g)}g` : "—" },
    { label: "Koolhydraten", value: recipe.koolhydraten_g ? `${Math.round(recipe.koolhydraten_g)}g` : "—" },
  ];

  const ingredienten = typeof recipe.ingredienten === "string"
    ? recipe.ingredienten.split("\n").filter(Boolean)
    : Array.isArray(recipe.ingredienten) ? recipe.ingredienten : [];

  const bereidingSteps = typeof recipe.bereiding === "string"
    ? recipe.bereiding.split("\n").filter(Boolean)
    : [];

  return (
    <>
      {/* ── Mobile ── */}
      <div className="lg:hidden min-h-screen bg-bg pb-[100px]">
        <IOSStatusBar />

        {/* Hero photo */}
        <div className="relative h-[320px] bg-fill flex items-center justify-center">
          {recipe.image_url
            ? <img src={recipe.image_url} alt={recipe.naam} className="w-full h-full object-cover" />
            : <span className="text-6xl">🍽️</span>
          }
          <button
            onClick={() => navigate(-1)}
            className="absolute top-4 left-4 w-[34px] h-[34px] rounded-full flex items-center justify-center"
            style={{ background: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(10px)' }}
          >
            <span className="text-brand text-[18px]">‹</span>
          </button>
          <button
            className="absolute top-4 right-4 w-[34px] h-[34px] rounded-full flex items-center justify-center"
            style={{ background: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(10px)' }}
          >
            <Star size={18} className="text-ink" />
          </button>
        </div>

        {/* Body */}
        <div className="pt-4">
          <div className="px-4 mb-4">
            <p className="text-[13px] font-bold uppercase tracking-wide text-brand mb-1">
              {recipe.categorie} {recipe.vlees_thema ? `· ${recipe.vlees_thema}` : ""}
            </p>
            <h1 className="text-[28px] font-bold text-ink leading-tight mb-1">{recipe.naam}</h1>
            <p className="text-[15px] text-ink2">
              2 porties{recipe.bereidingstijd_min ? ` · ${recipe.bereidingstijd_min} min` : ""}
            </p>
          </div>

          <IOSGroupHeader>Macro's</IOSGroupHeader>
          <IOSGroup>
            {macros.map((m, i) => (
              <IOSRow key={m.label} title={m.label} detail={m.value} last={i === macros.length - 1} />
            ))}
          </IOSGroup>

          <IOSGroupHeader>Ingrediënten</IOSGroupHeader>
          <IOSGroup>
            {ingredienten.map((ing, i) => (
              <IOSRow key={i} title={ing} last={i === ingredienten.length - 1} />
            ))}
          </IOSGroup>

          {bereidingSteps.length > 0 && (
            <>
              <IOSGroupHeader>Bereiding</IOSGroupHeader>
              <IOSGroup>
                <div className="p-4">
                  {bereidingSteps.map((step, i) => (
                    <p key={i} className="text-[15px] text-ink leading-relaxed mb-2">{step}</p>
                  ))}
                </div>
              </IOSGroup>
            </>
          )}

          <IOSGroupHeader>AI</IOSGroupHeader>
          <IOSGroup>
            <IOSRow
              icon={<Sparkles size={16} className="text-white" />}
              iconBg="#af52de"
              title="Macro's opnieuw schatten met AI"
              last
              onClick={aiLoading ? undefined : handleAiFill}
              detail={aiLoading ? "…" : undefined}
            />
          </IOSGroup>
        </div>

        <IOSTabBar />
      </div>

      {/* ── Desktop ── */}
      <div className="hidden lg:block">
        <DesktopShell
          title={recipe.naam}
          subtitle={recipe.categorie}
          accessory={
            <div className="flex gap-3">
              <button
                onClick={handleAiFill}
                disabled={aiLoading}
                className="flex items-center gap-2 px-4 py-2 rounded-[8px] text-[14px] font-semibold text-white"
                style={{ background: '#af52de' }}
              >
                <Sparkles size={16} />
                {aiLoading ? "Bezig…" : "AI Macro's"}
              </button>
            </div>
          }
        >
          <div className="grid gap-6" style={{ gridTemplateColumns: '1fr 360px' }}>
            {/* Left */}
            <div className="space-y-6">
              {recipe.image_url && (
                <div className="rounded-[12px] overflow-hidden h-[320px]">
                  <img src={recipe.image_url} alt={recipe.naam} className="w-full h-full object-cover" />
                </div>
              )}
              {bereidingSteps.length > 0 && (
                <div className="bg-surface rounded-[12px] p-6">
                  <p className="text-[13px] font-bold uppercase tracking-wide text-ink2 mb-4">Bereiding</p>
                  <ol className="space-y-3">
                    {bereidingSteps.map((step, i) => (
                      <li key={i} className="flex gap-3">
                        <span className="w-6 h-6 rounded-full bg-brand text-white text-[12px] font-bold flex items-center justify-center flex-shrink-0 mt-px">
                          {i + 1}
                        </span>
                        <p className="text-[15px] text-ink leading-relaxed">{step}</p>
                      </li>
                    ))}
                  </ol>
                </div>
              )}
            </div>

            {/* Right */}
            <div className="space-y-4">
              <Panel title="Macro's">
                <div className="grid grid-cols-2 gap-4">
                  {macros.map(m => <Stat key={m.label} label={m.label} v={m.value} />)}
                </div>
              </Panel>
              <Panel title="Ingrediënten">
                {ingredienten.map((ing, i) => (
                  <div key={i} className={`py-[10px] text-[14px] text-ink ${i < ingredienten.length - 1 ? 'border-b border-sep' : ''}`}>
                    {ing}
                  </div>
                ))}
              </Panel>
            </div>
          </div>
        </DesktopShell>
      </div>
    </>
  );
}
```

- [ ] **Step 2: Navigate to a recipe and verify**

- Mobile: full-width hero photo, glass back button, macro rows, ingredient rows
- Desktop: sidebar, left photo + numbered steps, right panels for macros + ingredients

- [ ] **Step 3: Commit**

```bash
git add frontend/src/pages/RecipeDetail.jsx
git commit -m "feat: rebuild RecipeDetail with iOS mobile + macOS desktop layouts"
```

---

## Task 9: Rebuild Shopping.jsx

**Files:**
- Modify: `frontend/src/pages/Shopping.jsx`

- [ ] **Step 1: Replace Shopping.jsx**

`frontend/src/pages/Shopping.jsx`:
```jsx
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getCurrentWeek, getShoppingList } from "../api/client";
import { getStoredWeek } from "../lib/weekStorage";
import { IOSStatusBar, IOSLargeHeader, IOSGroupHeader, IOSTabBar } from "../components/IOSPrimitives";
import DesktopShell from "../components/DesktopShell";

function useShoppingData(week) {
  const [list, setList] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!week) return;
    setLoading(true);
    getShoppingList(week).then(setList).finally(() => setLoading(false));
  }, [week]);

  return { list, loading };
}

export default function Shopping() {
  const { week: paramWeek } = useParams();
  const navigate = useNavigate();
  const [week, setWeek] = useState(null);

  useEffect(() => {
    if (paramWeek) {
      setWeek(Number(paramWeek));
    } else {
      const stored = getStoredWeek();
      if (stored) setWeek(stored);
      else getCurrentWeek().then(setWeek);
    }
  }, [paramWeek]);

  const { list, loading } = useShoppingData(week);

  const storageKey = `shopping-checked-${week}`;
  const [checked, setChecked] = useState(() => {
    try { return new Set(JSON.parse(localStorage.getItem(storageKey) ?? "[]")); }
    catch { return new Set(); }
  });

  useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify([...checked]));
  }, [checked, storageKey]);

  function toggle(id) {
    setChecked(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  const categories = list?.categories ?? list?.boodschappen_per_categorie ?? [];
  const allItems = categories.flatMap(cat =>
    (cat.items ?? cat.boodschappen ?? []).map(item => item.id ?? `${cat.naam}-${item.naam}`)
  );
  const totalItems = allItems.length;
  const checkedCount = allItems.filter(id => checked.has(id)).length;
  const progress = totalItems > 0 ? checkedCount / totalItems : 0;

  const ShoppingContent = () => (
    <>
      {/* Progress */}
      <div className="px-4 mb-4">
        <div className="flex justify-between text-[13px] text-ink2 mb-2">
          <span>{checkedCount} van {totalItems}</span>
          <span>{Math.round(progress * 100)}%</span>
        </div>
        <div className="h-1 rounded-full overflow-hidden" style={{ background: 'rgba(120,120,128,0.16)' }}>
          <div
            className="h-full rounded-full transition-all"
            style={{ width: `${progress * 100}%`, background: '#1f7a4d' }}
          />
        </div>
      </div>

      {/* Categories */}
      {categories.map(cat => {
        const items = cat.items ?? cat.boodschappen ?? [];
        return (
          <div key={cat.naam} className="mb-2">
            <IOSGroupHeader>{cat.naam}</IOSGroupHeader>
            <div className="mx-4 bg-surface rounded-[10px] overflow-hidden">
              {items.map((item, i) => {
                const itemId = item.id ?? `${cat.naam}-${item.naam}`;
                const isDone = checked.has(itemId);
                return (
                  <div
                    key={itemId}
                    onClick={() => toggle(itemId)}
                    className={`flex items-center gap-3 px-4 py-[11px] min-h-[44px] cursor-pointer active:bg-gray-50 ${i < items.length - 1 ? 'border-b border-sep' : ''}`}
                  >
                    {/* Checkbox */}
                    <div
                      className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 border-2 transition-colors"
                      style={isDone
                        ? { background: '#1f7a4d', borderColor: '#1f7a4d' }
                        : { borderColor: 'rgba(60,60,67,0.3)' }
                      }
                    >
                      {isDone && (
                        <svg width="12" height="10" viewBox="0 0 12 10" fill="none">
                          <path d="M1 5l3 3 7-7" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      )}
                    </div>

                    {/* Quantity */}
                    {item.hoeveelheid && (
                      <span className="w-[60px] flex-shrink-0 text-[14px] text-ink2">{item.hoeveelheid}</span>
                    )}

                    {/* Name */}
                    <span
                      className="flex-1 text-[17px] text-ink transition-opacity"
                      style={isDone ? { textDecoration: 'line-through', opacity: 0.45 } : {}}
                    >
                      {item.naam}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </>
  );

  return (
    <>
      {/* ── Mobile ── */}
      <div className="lg:hidden min-h-screen bg-bg pb-[100px]">
        <IOSStatusBar />
        <IOSLargeHeader
          title="Boodschappen"
          onBack={() => navigate(-1)}
          accessory={
            <button className="text-brand text-[17px]">Deel</button>
          }
        />
        <p className="px-4 mb-3 text-[15px] text-ink2">Week {week} · {totalItems} items</p>

        {loading ? (
          <div className="mx-4 animate-pulse bg-surface rounded-[10px] h-40" />
        ) : (
          <ShoppingContent />
        )}

        <IOSTabBar />
      </div>

      {/* ── Desktop ── */}
      <div className="hidden lg:block">
        <DesktopShell
          title="Boodschappen"
          subtitle={`Week ${week} · ${checkedCount} van ${totalItems} afgevinkt`}
        >
          {loading ? (
            <div className="animate-pulse bg-surface rounded-[12px] h-64" />
          ) : (
            <div className="max-w-2xl">
              <ShoppingContent />
            </div>
          )}
        </DesktopShell>
      </div>
    </>
  );
}
```

- [ ] **Step 2: Navigate to `/boodschappen` and verify**

- Shopping list loads, items toggle checked state with green fill + strikethrough
- Progress bar updates as items are checked
- State persists after page refresh (localStorage)

- [ ] **Step 3: Commit**

```bash
git add frontend/src/pages/Shopping.jsx
git commit -m "feat: rebuild Shopping with iOS mobile + macOS desktop layouts"
```

---

## Task 10: Rebuild Settings.jsx

**Files:**
- Modify: `frontend/src/pages/Settings.jsx`

- [ ] **Step 1: Replace Settings.jsx**

`frontend/src/pages/Settings.jsx`:
```jsx
import { useEffect, useState } from "react";
import { MessageCircle } from "lucide-react";
import { getNotificationSettings, updateNotificationSettings, testDailyMessage, testShoppingReminder } from "../api/client";
import { getCurrentWeek } from "../api/client";
import { getStoredWeek } from "../lib/weekStorage";
import {
  IOSStatusBar, IOSLargeHeader, IOSGroupHeader, IOSGroup, IOSRow, IOSToggle, IOSTabBar,
} from "../components/IOSPrimitives";
import DesktopShell from "../components/DesktopShell";

export default function Settings() {
  const [settings, setSettings] = useState(null);
  const [cycleWeek, setCycleWeek] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    getNotificationSettings().then(setSettings);
    const stored = getStoredWeek();
    if (stored) setCycleWeek(stored);
    else getCurrentWeek().then(setCycleWeek);
  }, []);

  async function toggle(field) {
    if (!settings) return;
    const next = { ...settings, [field]: !settings[field] };
    setSettings(next);
    setSaving(true);
    await updateNotificationSettings(next).finally(() => setSaving(false));
  }

  const SettingsContent = () => (
    <>
      <IOSGroupHeader>Cyclus</IOSGroupHeader>
      <IOSGroup>
        <IOSRow title="Huidige week" detail={cycleWeek ? `Week ${cycleWeek}` : "—"} />
        <IOSRow title="Startdatum" detail="Week 18, 2026" last />
      </IOSGroup>

      <IOSGroupHeader>Telegram</IOSGroupHeader>
      <IOSGroup>
        <IOSRow
          icon={<MessageCircle size={16} className="text-white" />}
          iconBg="#0088cc"
          title="Verbonden"
          sub="Telegram bot actief"
        />
        <IOSRow
          title="Dagelijks bericht"
          sub="Elke ochtend om 08:00"
          last={false}
          accessory={
            settings && <IOSToggle on={settings.daily_message_enabled ?? false} onChange={() => toggle("daily_message_enabled")} />
          }
        />
        <IOSRow
          title="Boodschappen herinnering"
          sub="Zondagochtend"
          accessory={
            settings && <IOSToggle on={settings.shopping_reminder_enabled ?? false} onChange={() => toggle("shopping_reminder_enabled")} />
          }
        />
        <IOSRow
          title="Vriezer herinnering"
          sub="Wekelijks"
          last
          accessory={
            settings && <IOSToggle on={settings.freezer_reminder_enabled ?? false} onChange={() => toggle("freezer_reminder_enabled")} />
          }
        />
      </IOSGroup>

      <IOSGroupHeader>Testen</IOSGroupHeader>
      <IOSGroup>
        <IOSRow
          title="Stuur dagelijks testbericht"
          onClick={testDailyMessage}
        />
        <IOSRow
          title="Stuur boodschappen testbericht"
          last
          onClick={testShoppingReminder}
        />
      </IOSGroup>
    </>
  );

  return (
    <>
      {/* ── Mobile ── */}
      <div className="lg:hidden min-h-screen bg-bg pb-[100px]">
        <IOSStatusBar />
        <IOSLargeHeader title="Instellingen" />
        <SettingsContent />
        <IOSTabBar />
      </div>

      {/* ── Desktop ── */}
      <div className="hidden lg:block">
        <DesktopShell title="Instellingen">
          <div className="max-w-2xl">
            <SettingsContent />
          </div>
        </DesktopShell>
      </div>
    </>
  );
}
```

- [ ] **Step 2: Navigate to `/instellingen` and verify**

- Mobile: grouped settings rows, toggles work
- Desktop: sidebar + same content in max-w-2xl container

- [ ] **Step 3: Commit**

```bash
git add frontend/src/pages/Settings.jsx
git commit -m "feat: rebuild Settings with iOS mobile + macOS desktop layouts"
```

---

## Task 11: Update App.jsx — remove conflicting nav, add responsive layout

**Files:**
- Modify: `frontend/src/App.jsx`

- [ ] **Step 1: Replace App.jsx**

The old App.jsx wraps everything in `max-w-[402px] mx-auto` and adds a fixed tab bar. The new design handles layout inside each page (IOSTabBar for mobile, DesktopShell sidebar for desktop). App.jsx now just handles routing.

`frontend/src/App.jsx`:
```jsx
import { BrowserRouter, Routes, Route } from "react-router-dom";
import HomePage from "./pages/Home";
import Recipes from "./pages/Recipes";
import WeekPlan from "./pages/WeekPlan";
import RecipeDetail from "./pages/RecipeDetail";
import SettingsPage from "./pages/Settings";
import Shopping from "./pages/Shopping";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/recepten" element={<Recipes />} />
        <Route path="/recepten/:id" element={<RecipeDetail />} />
        <Route path="/weekplan" element={<WeekPlan />} />
        <Route path="/instellingen" element={<SettingsPage />} />
        <Route path="/boodschappen" element={<Shopping />} />
        <Route path="/boodschappen/:week" element={<Shopping />} />
      </Routes>
    </BrowserRouter>
  );
}
```

- [ ] **Step 2: Check index.html has `bg-bg` on body or let Tailwind handle it**

Open `frontend/index.html` — confirm `<body>` has no conflicting background color. If it has `class="bg-white"` remove it.

- [ ] **Step 3: Full smoke test in browser at mobile and desktop sizes**

```bash
cd frontend && npm run dev
```

Check each route at 390px (iPhone) and 1280px (desktop):
- `/` — Home loads, hero card visible
- `/recepten` — Recipe list with search
- `/recepten/:id` — Recipe detail with back button
- `/weekplan` — Week selector + day rows
- `/boodschappen` — Shopping list
- `/instellingen` — Settings toggles

- [ ] **Step 4: Commit**

```bash
git add frontend/src/App.jsx
git commit -m "feat: simplify App.jsx — routing only, layout handled per-page"
```

---

## Task 12: Deploy

- [ ] **Step 1: Push to master**

```bash
git push origin master
```

This triggers the self-hosted GitHub Actions runner on LXC 224 (label `chef-agent`) which builds and creates a release in Octopus Deploy.

- [ ] **Step 2: Deploy via Octopus MCP**

After the GitHub Actions release is created (~2 min), deploy it:

```
Use octopus_deploy_release MCP tool:
  project: Chef Agent
  environment: Production
```

- [ ] **Step 3: Verify on production**

Open the production URL, verify mobile and desktop layouts at both breakpoints.
