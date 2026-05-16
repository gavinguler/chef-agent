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
