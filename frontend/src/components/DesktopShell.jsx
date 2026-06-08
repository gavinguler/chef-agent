import { useEffect, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { Home, BookOpen, Calendar, ShoppingCart, Settings, Package } from "lucide-react";
import { getRecipes, getWeekPlan, getShoppingList, getCurrentWeek } from "../api/client";
import { getStoredWeek, setStoredWeek } from "../lib/weekStorage";

// Module-level cache — sidebar data fetched once per browser session
let _weekThemesCache = null;
let _recipeCountCache = null;

function useSidebarData() {
  const [recipeCount, setRecipeCount] = useState(_recipeCountCache ?? 0);
  const [shoppingCount, setShoppingCount] = useState(0);
  const [weekThemes, setWeekThemes] = useState(_weekThemesCache ?? []);
  const [currentWeek, setCurrentWeek] = useState(getStoredWeek());

  useEffect(() => {
    if (!currentWeek) {
      getCurrentWeek().then(w => setCurrentWeek(w)).catch(() => {});
    }

    if (_recipeCountCache === null) {
      getRecipes().then(r => {
        _recipeCountCache = r.length;
        setRecipeCount(r.length);
      }).catch(() => {});
    }

    if (!_weekThemesCache) {
      Promise.all(
        Array.from({ length: 8 }, (_, i) => i + 1).map(w =>
          getWeekPlan(w)
            .then(p => ({ week: w, theme: p?.vlees_thema ?? null }))
            .catch(() => ({ week: w, theme: null }))
        )
      ).then(themes => {
        _weekThemesCache = themes;
        setWeekThemes(themes);
      });
    }
  }, []);

  useEffect(() => {
    if (!currentWeek) return;
    getShoppingList(currentWeek)
      .then(data => setShoppingCount(data?.items?.length ?? 0))
      .catch(() => {});
  }, [currentWeek]);

  return { recipeCount, shoppingCount, weekThemes, currentWeek };
}

const NAV_ITEMS = [
  { id: 'home',     label: 'Vandaag',     to: '/',             Icon: Home,         end: true },
  { id: 'week',     label: 'Weekplan',    to: '/weekplan',     Icon: Calendar },
  { id: 'recipes',  label: 'Recepten',    to: '/recepten',     Icon: BookOpen },
  { id: 'voorraad', label: 'Voorraad',    to: '/voorraad',     Icon: Package },
  { id: 'shopping', label: 'Boodschappen',to: '/boodschappen', Icon: ShoppingCart },
  { id: 'settings', label: 'Instellingen',to: '/instellingen', Icon: Settings },
];

function SidebarDot({ active }) {
  return (
    <span
      className="w-[6px] h-[6px] rounded-full flex-shrink-0"
      style={active
        ? { background: '#1f7a4d' }
        : { border: '1.5px solid rgba(60,60,67,0.2)' }
      }
    />
  );
}

function DesktopSidebar({ recipeCount, shoppingCount, weekThemes, currentWeek }) {
  const navigate = useNavigate();

  function handleWeekClick(w) {
    setStoredWeek(w);
    navigate('/weekplan');
  }

  const weekBadge = currentWeek ? `Week ${currentWeek}` : null;
  const badgeMap = {
    week: weekBadge,
    recipes: recipeCount > 0 ? String(recipeCount) : null,
    shopping: shoppingCount > 0 ? String(shoppingCount) : null,
  };

  const weeksWithThemes = weekThemes.filter(wt => wt.theme);

  return (
    <aside
      className="w-[208px] flex-shrink-0 flex flex-col h-full overflow-y-auto overflow-x-hidden select-none"
      style={{
        background: 'rgba(246,246,246,0.97)',
        borderRight: '0.5px solid rgba(60,60,67,0.12)',
      }}
    >
      {/* App identity */}
      <div className="flex items-center gap-[10px] px-4 pt-5 pb-4">
        <div className="w-[28px] h-[28px] rounded-[7px] bg-brand flex items-center justify-center flex-shrink-0">
          <span className="text-white text-[13px] font-bold leading-none">C</span>
        </div>
        <span className="text-[14px] font-semibold text-ink">Chef Agent</span>
      </div>

      {/* PERSOONLIJK nav */}
      <div className="px-3 mb-1">
        <p className="px-[6px] mb-[6px] text-[10px] font-semibold uppercase tracking-widest text-ink3">
          Persoonlijk
        </p>
        {NAV_ITEMS.map(({ id, label, to, Icon, end }) => (
          <NavLink
            key={id}
            to={to}
            end={end}
            className={({ isActive }) =>
              `flex items-center gap-[9px] px-[8px] py-[6px] rounded-[7px] text-[13px] transition-colors mb-px ${
                isActive ? 'font-medium text-brand' : 'text-ink hover:bg-black/[0.04]'
              }`
            }
            style={({ isActive }) =>
              isActive ? { background: 'rgba(31,122,77,0.1)' } : {}
            }
          >
            {({ isActive }) => (
              <>
                <Icon size={15} strokeWidth={isActive ? 2.2 : 1.8} className="flex-shrink-0" />
                <span className="flex-1 truncate">{label}</span>
                {badgeMap[id] && (
                  <span
                    className="text-[10px] font-semibold px-[6px] py-px rounded-full flex-shrink-0"
                    style={isActive
                      ? { background: '#1f7a4d', color: '#fff' }
                      : { background: 'rgba(120,120,128,0.18)', color: 'rgba(60,60,67,0.6)' }
                    }
                  >
                    {badgeMap[id]}
                  </span>
                )}
              </>
            )}
          </NavLink>
        ))}
      </div>

      {/* Divider */}
      <div className="mx-4 my-3" style={{ height: '0.5px', background: 'rgba(60,60,67,0.1)' }} />

      {/* CYCLUS · 8 WEKEN */}
      {weeksWithThemes.length > 0 && (
        <div className="px-3 flex-1">
          <p className="px-[6px] mb-[6px] text-[10px] font-semibold uppercase tracking-widest text-ink3">
            Cyclus · 8 weken
          </p>
          {weekThemes.map(({ week, theme }) =>
            theme ? (
              <button
                key={week}
                onClick={() => handleWeekClick(week)}
                className="w-full flex items-center gap-[9px] px-[8px] py-[5px] rounded-[7px] text-left transition-colors mb-px hover:bg-black/[0.04]"
                style={week === currentWeek ? { background: 'rgba(31,122,77,0.06)' } : {}}
              >
                <SidebarDot active={week === currentWeek} />
                <span className={`text-[12px] flex-shrink-0 ${week === currentWeek ? 'font-medium text-ink' : 'text-ink2'}`}>
                  Week {week}
                </span>
                <span className="text-[11px] text-ink3 truncate">{theme}</span>
              </button>
            ) : null
          )}
        </div>
      )}

      {/* User footer */}
      <div className="px-4 py-4 mt-auto" style={{ borderTop: '0.5px solid rgba(60,60,67,0.1)' }}>
        <div className="flex items-center gap-[9px]">
          <div className="w-[28px] h-[28px] rounded-full bg-[#3a3a3c] flex items-center justify-center flex-shrink-0">
            <span className="text-white text-[11px] font-bold">G</span>
          </div>
          <div className="min-w-0">
            <p className="text-[12px] font-medium text-ink leading-none">Gavin</p>
            <p className="text-[10px] text-ink3 mt-[2px] truncate">Pro · 8-weken plan</p>
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
          <p className="text-[11px] font-bold text-ink2 uppercase tracking-wider">{title}</p>
          {badge && (
            <span className="text-[10px] font-semibold text-white bg-brand px-[6px] py-px rounded-full">
              {badge}
            </span>
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
      <p className="text-[20px] font-bold text-ink mt-px">{v}</p>
    </div>
  );
}

// Search input for desktop toolbars
export function DesktopSearch({ value, onChange, placeholder = "Zoek…" }) {
  return (
    <div
      className="flex items-center gap-2 h-[30px] rounded-[7px] px-3"
      style={{ background: 'rgba(120,120,128,0.14)' }}
    >
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="rgba(60,60,67,0.5)" strokeWidth="2.5">
        <circle cx="11" cy="11" r="8" />
        <path d="m21 21-4.35-4.35" />
      </svg>
      <input
        className="bg-transparent text-[13px] text-ink outline-none w-[140px] placeholder:text-ink3"
        placeholder={placeholder}
        value={value}
        onChange={e => onChange(e.target.value)}
      />
      {value && (
        <button onClick={() => onChange('')} className="text-ink3 text-[11px]">✕</button>
      )}
    </div>
  );
}

export default function DesktopShell({ windowTitle, title, subtitle, accessory, children }) {
  const sidebarData = useSidebarData();

  return (
    <div className="flex flex-col h-screen bg-bg overflow-hidden">
      {/* Fake macOS window chrome */}
      <div
        className="flex items-center flex-shrink-0 h-[38px] px-4 gap-3"
        style={{
          background: 'rgba(246,246,246,0.98)',
          borderBottom: '0.5px solid rgba(60,60,67,0.1)',
        }}
      >
        <div className="flex items-center gap-[6px]">
          <div className="w-[12px] h-[12px] rounded-full bg-[#ff5f57]" />
          <div className="w-[12px] h-[12px] rounded-full bg-[#febc2e]" />
          <div className="w-[12px] h-[12px] rounded-full bg-[#28c840]" />
        </div>
        {windowTitle && (
          <p className="text-[12px] font-medium text-ink2 ml-1">{windowTitle}</p>
        )}
      </div>

      {/* Brand toolbar */}
      <div
        className="flex items-center justify-center flex-shrink-0 h-[36px]"
        style={{
          background: 'rgba(246,246,246,0.95)',
          backdropFilter: 'blur(20px)',
          borderBottom: '0.5px solid rgba(60,60,67,0.1)',
        }}
      >
        <span className="text-[12px] font-semibold text-ink2">Chef Agent</span>
      </div>

      {/* App body */}
      <div className="flex flex-1 overflow-hidden">
        <DesktopSidebar {...sidebarData} />

        {/* Content column */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Inner page toolbar */}
          <header
            className="flex items-center justify-between px-5 flex-shrink-0"
            style={{
              height: '48px',
              background: 'rgba(255,255,255,0.92)',
              backdropFilter: 'blur(20px)',
              borderBottom: '0.5px solid rgba(60,60,67,0.1)',
            }}
          >
            <div className="flex items-baseline gap-3 min-w-0 flex-1">
              <h1 className="text-[15px] font-semibold text-ink flex-shrink-0">{title}</h1>
              {subtitle && <p className="text-[12px] text-ink2 truncate">{subtitle}</p>}
            </div>
            {accessory && (
              <div className="flex items-center gap-2 flex-shrink-0 ml-3">{accessory}</div>
            )}
          </header>

          {/* Scrollable page content */}
          <main className="flex-1 overflow-y-auto">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
