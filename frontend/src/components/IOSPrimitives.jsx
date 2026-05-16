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
