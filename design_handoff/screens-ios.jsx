// iOS-native direction — true iOS 17/26 feel.
// • SF Pro stack, system gray hierarchy
// • Large title scroll-collapse style
// • Inset grouped lists (white card r:10, separators inset)
// • Brand tint #1f7a4d (forest green that reads native iOS)
// • Glass pill back/action buttons
// • Segmented controls
// • Tab bar (50px) with SF Symbols-style filled icons when active

const IOS = {
  bg: '#f2f2f7',           // iOS systemGroupedBackground
  surface: '#ffffff',
  ink: '#000000',
  ink2: 'rgba(60,60,67,0.6)',   // secondaryLabel
  ink3: 'rgba(60,60,67,0.3)',   // tertiaryLabel
  sep: 'rgba(60,60,67,0.12)',
  fill: 'rgba(120,120,128,0.16)',
  brand: '#1f7a4d',         // chef green
  brandTint: '#1f7a4d',     // text + button tint
  destructive: '#ff3b30',
  font: '-apple-system, BlinkMacSystemFont, "SF Pro Text", "SF Pro", system-ui, sans-serif',
};

// ─── Filled / dual-state SF-Symbols-style icons ─────────────
const SF = {
  HomeF: (p) => <svg width="26" height="26" viewBox="0 0 26 26" {...p}><path d="M13 2.5 2.5 11v10.5A1.5 1.5 0 0 0 4 23h5v-7h8v7h5a1.5 1.5 0 0 0 1.5-1.5V11L13 2.5z" fill="currentColor"/></svg>,
  Home: (p) => <svg width="26" height="26" viewBox="0 0 26 26" fill="none" {...p}><path d="M13 3 3 11.5V22h7v-7h6v7h7V11.5L13 3z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round"/></svg>,
  BookF: (p) => <svg width="26" height="26" viewBox="0 0 26 26" {...p}><path d="M5 4h12a3 3 0 0 1 3 3v15H8a3 3 0 0 1-3-3V4z" fill="currentColor"/><path d="M5 19a3 3 0 0 1 3-3h12" stroke="white" strokeWidth="1.5" fill="none"/></svg>,
  Book: (p) => <svg width="26" height="26" viewBox="0 0 26 26" fill="none" {...p}><path d="M5 4h12a3 3 0 0 1 3 3v15H8a3 3 0 0 1-3-3V4z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round"/><path d="M5 19a3 3 0 0 1 3-3h12" stroke="currentColor" strokeWidth="1.8"/></svg>,
  CalF: (p) => <svg width="26" height="26" viewBox="0 0 26 26" {...p}><rect x="3" y="5" width="20" height="18" rx="3" fill="currentColor"/><rect x="3" y="5" width="20" height="5" rx="3" fill="currentColor" opacity="0.6"/><circle cx="9" cy="15" r="1.4" fill="white"/><circle cx="13" cy="15" r="1.4" fill="white"/><circle cx="17" cy="15" r="1.4" fill="white"/></svg>,
  Cal: (p) => <svg width="26" height="26" viewBox="0 0 26 26" fill="none" {...p}><rect x="3" y="5" width="20" height="18" rx="3" stroke="currentColor" strokeWidth="1.8"/><path d="M3 11h20M8 3v4M18 3v4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/></svg>,
  CartF: (p) => <svg width="26" height="26" viewBox="0 0 26 26" {...p}><path d="M3 4h2.5l2.5 12a2 2 0 0 0 2 1.5h9a2 2 0 0 0 2-1.5L23 8H7" fill="currentColor"/><circle cx="10" cy="22" r="1.8" fill="currentColor"/><circle cx="19" cy="22" r="1.8" fill="currentColor"/></svg>,
  Cart: (p) => <svg width="26" height="26" viewBox="0 0 26 26" fill="none" {...p}><path d="M3 4h2.5l2.5 12a2 2 0 0 0 2 1.5h9a2 2 0 0 0 2-1.5L23 8H7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/><circle cx="10" cy="22" r="1.6" stroke="currentColor" strokeWidth="1.8"/><circle cx="19" cy="22" r="1.6" stroke="currentColor" strokeWidth="1.8"/></svg>,
  GearF: (p) => <svg width="26" height="26" viewBox="0 0 26 26" {...p}><path d="m13 1 1.5 3 3-1 .5 3 3 .5-1 3 3 1.5-3 1.5 1 3-3 .5-.5 3-3-1-1.5 3-1.5-3-3 1-.5-3-3-.5 1-3-3-1.5 3-1.5-1-3 3-.5.5-3 3 1L13 1z" fill="currentColor"/><circle cx="13" cy="13" r="3.5" fill="white"/></svg>,
  Gear: (p) => <svg width="26" height="26" viewBox="0 0 26 26" fill="none" {...p}><circle cx="13" cy="13" r="3" stroke="currentColor" strokeWidth="1.8"/><path d="m13 1 1.5 3 3-1 .5 3 3 .5-1 3 3 1.5-3 1.5 1 3-3 .5-.5 3-3-1-1.5 3-1.5-3-3 1-.5-3-3-.5 1-3-3-1.5 3-1.5-1-3 3-.5.5-3 3 1L13 1z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round"/></svg>,
  Chev: (p) => <svg width="9" height="14" viewBox="0 0 9 14" fill="none" {...p}><path d="M1 1l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  Plus: (p) => <svg width="22" height="22" viewBox="0 0 22 22" fill="none" {...p}><path d="M11 4v14M4 11h14" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round"/></svg>,
  Search: (p) => <svg width="16" height="16" viewBox="0 0 18 18" fill="none" {...p}><circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="2"/><path d="M13 13l4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>,
  Bell: (p) => <svg width="22" height="22" viewBox="0 0 22 22" fill="none" {...p}><path d="M5 8a6 6 0 0 1 12 0c0 6 2 7 2 7H3s2-1 2-7z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round"/><path d="M9 19a2 2 0 0 0 4 0" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/></svg>,
  Sparkle: (p) => <svg width="20" height="20" viewBox="0 0 22 22" fill="currentColor" {...p}><path d="M11 2c.4 4 1.5 5 5.5 5.5-4 .5-5.1 1.5-5.5 5.5-.4-4-1.5-5-5.5-5.5C9.5 7 10.6 6 11 2zM18 13c.3 2.5 1 3 3 3.5-2 .5-2.7 1-3 3.5-.3-2.5-1-3-3-3.5 2-.5 2.7-1 3-3.5z"/></svg>,
  Star: (p) => <svg width="18" height="18" viewBox="0 0 22 22" fill="currentColor" {...p}><path d="m11 1 3 7 7 .8-5.2 4.7 1.5 7L11 16.8 4.7 20.5l1.5-7L1 8.8 8 8l3-7z"/></svg>,
  Flame: (p) => <svg width="20" height="20" viewBox="0 0 22 22" fill="currentColor" {...p}><path d="M11 1c4 4 5 6 5 9a5 5 0 0 1-10 0c0-2 1-3 1-3s0 2 2 2c0-3 2-5 2-8z"/></svg>,
};

window.SF = SF;

// ─── Reusable iOS primitives (built locally to control styling tightly) ──

function IOSLargeHeader({ title, accessory, onBack }) {
  return (
    <div style={{ padding: '0 16px 8px' }}>
      {onBack && (
        <button style={{
          background: 'none', border: 'none', padding: 0, margin: '0 0 4px',
          color: IOS.brand, fontFamily: IOS.font, fontSize: 17,
          display: 'flex', alignItems: 'center', gap: 4,
        }}>
          <SF.Chev style={{ transform: 'rotate(180deg)' }}/> Terug
        </button>
      )}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <h1 style={{
          margin: 0, fontFamily: IOS.font, fontSize: 34, fontWeight: 700,
          letterSpacing: 0.4, lineHeight: '41px', color: IOS.ink,
        }}>{title}</h1>
        {accessory}
      </div>
    </div>
  );
}

function IOSSearchField({ placeholder = 'Zoek' }) {
  return (
    <div style={{ padding: '0 16px 8px' }}>
      <div style={{
        display: 'flex', alignItems: 'center', gap: 6,
        height: 36, padding: '0 10px',
        background: IOS.fill, borderRadius: 10,
        fontFamily: IOS.font, fontSize: 17, color: IOS.ink2,
      }}>
        <SF.Search style={{ color: IOS.ink2 }}/>
        <span>{placeholder}</span>
      </div>
    </div>
  );
}

function IOSSegmented({ items, value }) {
  return (
    <div style={{ padding: '0 16px 12px' }}>
      <div style={{
        display: 'flex', padding: 2, background: IOS.fill, borderRadius: 9,
      }}>
        {items.map((it, i) => {
          const on = it === value;
          return (
            <div key={it} style={{
              flex: 1, padding: '6px 8px', borderRadius: 7,
              background: on ? '#fff' : 'transparent',
              boxShadow: on ? '0 3px 8px rgba(0,0,0,0.04), 0 0 0 0.5px rgba(0,0,0,0.04)' : 'none',
              fontFamily: IOS.font, fontSize: 13, fontWeight: on ? 600 : 500,
              color: IOS.ink, textAlign: 'center',
            }}>{it}</div>
          );
        })}
      </div>
    </div>
  );
}

function IOSGroupHeader({ children }) {
  return (
    <p style={{
      margin: '24px 16px 6px', fontFamily: IOS.font,
      fontSize: 13, fontWeight: 400, letterSpacing: -0.08,
      color: IOS.ink2, textTransform: 'uppercase',
      paddingLeft: 16,
    }}>{children}</p>
  );
}

function IOSGroup({ children, footer }) {
  return (
    <>
      <div style={{
        margin: '0 16px', background: IOS.surface, borderRadius: 10,
        overflow: 'hidden',
      }}>{children}</div>
      {footer && (
        <p style={{ margin: '6px 32px 0', fontSize: 13, color: IOS.ink2, fontFamily: IOS.font }}>
          {footer}
        </p>
      )}
    </>
  );
}

function IOSRow({ icon, iconBg, title, detail, accessory, sub, last, destructive }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', minHeight: 44,
      padding: '8px 16px', position: 'relative',
      fontFamily: IOS.font,
    }}>
      {icon && (
        <div style={{
          width: 29, height: 29, borderRadius: 7, background: iconBg || IOS.brand,
          color: '#fff', display: 'grid', placeItems: 'center', marginRight: 14,
          flexShrink: 0,
        }}>{icon}</div>
      )}
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{
          margin: 0, fontSize: 17, color: destructive ? IOS.destructive : IOS.ink,
          fontWeight: 400, letterSpacing: -0.43,
          whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
        }}>{title}</p>
        {sub && <p style={{ margin: '2px 0 0', fontSize: 13, color: IOS.ink2 }}>{sub}</p>}
      </div>
      {detail && <span style={{ fontSize: 17, color: IOS.ink2, marginRight: accessory ? 6 : 0 }}>{detail}</span>}
      {accessory}
      {!last && (
        <div style={{
          position: 'absolute', bottom: 0, right: 0,
          left: icon ? 59 : 16, height: 0.5, background: IOS.sep,
        }}/>
      )}
    </div>
  );
}

function IOSToggle({ on }) {
  return (
    <div style={{
      width: 51, height: 31, borderRadius: 16, position: 'relative',
      background: on ? '#34c759' : 'rgba(120,120,128,0.16)',
      transition: 'background .2s',
    }}>
      <div style={{
        position: 'absolute', top: 2, left: on ? 22 : 2,
        width: 27, height: 27, borderRadius: 14, background: '#fff',
        boxShadow: '0 3px 8px rgba(0,0,0,0.15), 0 1px 1px rgba(0,0,0,0.06)',
      }}/>
    </div>
  );
}

// ─── Tab bar ───
function IOSTab({ active }) {
  const items = [
    { k: 'home',  label: 'Vandaag',     I: SF.Home,  IF: SF.HomeF  },
    { k: 'rec',   label: 'Recepten',    I: SF.Book,  IF: SF.BookF  },
    { k: 'week',  label: 'Week',        I: SF.Cal,   IF: SF.CalF   },
    { k: 'shop',  label: 'Lijst',       I: SF.Cart,  IF: SF.CartF  },
    { k: 'inst',  label: 'Instellingen',I: SF.Gear,  IF: SF.GearF  },
  ];
  return (
    <div style={{
      position: 'absolute', left: 0, right: 0, bottom: 0,
      paddingTop: 8, paddingBottom: 30,
      background: 'rgba(249,249,249,0.92)',
      backdropFilter: 'blur(30px) saturate(180%)',
      WebkitBackdropFilter: 'blur(30px) saturate(180%)',
      borderTop: '0.5px solid rgba(0,0,0,0.18)',
      display: 'flex',
    }}>
      {items.map(it => {
        const on = it.k === active;
        const Ico = on ? it.IF : it.I;
        return (
          <div key={it.k} style={{
            flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2,
            color: on ? IOS.brand : IOS.ink2,
          }}>
            <Ico/>
            <span style={{ fontFamily: IOS.font, fontSize: 10, fontWeight: 500, letterSpacing: 0.1 }}>{it.label}</span>
          </div>
        );
      })}
    </div>
  );
}

// ─── Helper for SF-style glyph in a colored square ───
const IconTile = (g, bg) => <div style={{ width: 18, height: 18, color: '#fff' }}>{g}</div>;

// ──────────────────────────────────────────────────────────
// HOME — Today
// ──────────────────────────────────────────────────────────
function IOSHome() {
  return (
    <div style={{ background: IOS.bg, minHeight: APP_H, fontFamily: IOS.font, paddingBottom: 90, color: IOS.ink }}>
      <div style={{ height: 54 }}/>
      <IOSLargeHeader title="Vandaag" accessory={
        <div style={{ display: 'flex', gap: 8, marginBottom: 4 }}>
          <button style={glassBtn}><SF.Bell style={{ color: IOS.brand }}/></button>
        </div>
      }/>
      <p style={{ margin: '0 16px 16px', fontSize: 15, color: IOS.ink2 }}>Mediterraans · week 3 · dag 4</p>

      {/* Today hero card */}
      <div style={{ margin: '0 16px' }}>
        <div style={{ background: IOS.surface, borderRadius: 14, overflow: 'hidden' }}>
          <div style={{ position: 'relative' }}>
            <PhotoPlaceholder h={170} radius={0} label="vanavond"/>
            <div style={{ position: 'absolute', top: 12, left: 12, display: 'flex', gap: 6 }}>
              <span style={tagPill('#fff','rgba(0,0,0,0.55)')}>VANAVOND</span>
              <span style={tagPill('#fff','rgba(0,0,0,0.55)')}>35 MIN</span>
            </div>
          </div>
          <div style={{ padding: '14px 16px 16px' }}>
            <p style={{ margin: 0, fontSize: 13, color: IOS.brand, fontWeight: 600, letterSpacing: 0.2 }}>DINER · KIP</p>
            <p style={{ margin: '4px 0 12px', fontSize: 22, fontWeight: 700, letterSpacing: 0.2 }}>{TODAY_DINER.naam}</p>
            <div style={{ display: 'flex', gap: 18, fontSize: 15, color: IOS.ink2 }}>
              <span><strong style={{ color: IOS.ink, fontWeight: 600 }}>{TODAY_DINER.kcal}</strong> kcal</span>
              <span><strong style={{ color: IOS.ink, fontWeight: 600 }}>{TODAY_DINER.eiwit}g</strong> eiwit</span>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8, padding: '0 14px 14px' }}>
            <button style={btnFilled}>Recept openen</button>
            <button style={btnTinted}><SF.Cart style={{ color: IOS.brand, width: 18, height: 18 }}/> Boodschap</button>
          </div>
        </div>
      </div>

      {/* Macros — ring + bars */}
      <IOSGroupHeader>Vandaag</IOSGroupHeader>
      <IOSGroup>
        <div style={{ padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 16 }}>
          <ProteinRing v={104} max={140}/>
          <div style={{ flex: 1 }}>
            <p style={{ margin: 0, fontSize: 13, color: IOS.ink2 }}>Eiwit-doel</p>
            <p style={{ margin: '2px 0 8px', fontSize: 22, fontWeight: 700 }}>104 / 140 <span style={{ fontSize: 13, color: IOS.ink2, fontWeight: 500 }}>g</span></p>
            <ThinBar v={1488} max={2200} label="Calorieën" unit="kcal"/>
          </div>
        </div>
      </IOSGroup>

      {/* This week strip */}
      <IOSGroupHeader>Deze week</IOSGroupHeader>
      <div style={{ margin: '0 16px', display: 'flex', gap: 6 }}>
        {WEEK_DAYS.map((d, i) => {
          const today = i === 3;
          return (
            <div key={d} style={{
              flex: 1, padding: '10px 0 12px', borderRadius: 10,
              background: today ? IOS.brand : IOS.surface,
              color: today ? '#fff' : IOS.ink, textAlign: 'center',
              fontFamily: IOS.font,
            }}>
              <p style={{ margin: 0, fontSize: 11, opacity: today ? 0.8 : 0.5, fontWeight: 600, letterSpacing: 0.4, textTransform: 'uppercase' }}>{d}</p>
              <p style={{ margin: '2px 0 0', fontSize: 17, fontWeight: 600 }}>{5 + i}</p>
            </div>
          );
        })}
      </div>

      <IOSGroupHeader>Komende dagen</IOSGroupHeader>
      <IOSGroup>
        <IOSRow
          icon={<SF.Cart style={{ color: '#fff', width: 18, height: 18 }}/>} iconBg="#34c759"
          title="Vrijdag · Zalmfilet" sub="42g eiwit · 580 kcal"
          accessory={<SF.Chev style={{ color: IOS.ink3 }}/>}
        />
        <IOSRow
          icon={<SF.Sparkle style={{ color: '#fff', width: 18, height: 18 }}/>} iconBg="#af52de"
          title="Zaterdag · Tofu-curry" sub="32g eiwit · 510 kcal"
          accessory={<SF.Chev style={{ color: IOS.ink3 }}/>}
        />
        <IOSRow
          icon={<SF.Flame style={{ color: '#fff', width: 18, height: 18 }}/>} iconBg="#ff9500"
          title="Zondag · Biefstuk" sub="52g eiwit · 690 kcal"
          accessory={<SF.Chev style={{ color: IOS.ink3 }}/>}
          last
        />
      </IOSGroup>

      <IOSTab active="home"/>
    </div>
  );
}

const glassBtn = {
  width: 34, height: 34, borderRadius: 17,
  background: 'rgba(120,120,128,0.16)',
  border: 'none', display: 'grid', placeItems: 'center',
};
const tagPill = (color, bg) => ({
  fontFamily: IOS.font, fontSize: 10, fontWeight: 700, letterSpacing: 0.6,
  padding: '4px 8px', borderRadius: 4, color, background: bg, backdropFilter: 'blur(10px)',
});
const btnFilled = {
  flex: 1, padding: '10px 14px', borderRadius: 10,
  background: IOS.brand, color: '#fff', border: 'none',
  fontFamily: IOS.font, fontSize: 15, fontWeight: 600,
};
const btnTinted = {
  flex: 1, padding: '10px 14px', borderRadius: 10,
  background: 'rgba(31,122,77,0.12)', color: IOS.brand, border: 'none',
  fontFamily: IOS.font, fontSize: 15, fontWeight: 600,
  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5,
};

function ProteinRing({ v, max }) {
  const pct = v / max;
  const C = 2 * Math.PI * 26;
  return (
    <div style={{ position: 'relative', width: 64, height: 64 }}>
      <svg width="64" height="64" viewBox="0 0 64 64">
        <circle cx="32" cy="32" r="26" stroke="rgba(120,120,128,0.16)" strokeWidth="6" fill="none"/>
        <circle cx="32" cy="32" r="26" stroke={IOS.brand} strokeWidth="6" fill="none"
          strokeDasharray={`${pct * C} ${C}`} strokeLinecap="round"
          transform="rotate(-90 32 32)"/>
      </svg>
      <div style={{
        position: 'absolute', inset: 0, display: 'grid', placeItems: 'center',
        fontFamily: IOS.font, fontSize: 13, fontWeight: 700,
      }}>{Math.round(pct * 100)}%</div>
    </div>
  );
}
function ThinBar({ v, max, label, unit }) {
  const pct = Math.min(100, (v/max)*100);
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: IOS.ink2 }}>
        <span>{label}</span>
        <span><strong style={{ color: IOS.ink }}>{v}</strong> / {max} {unit}</span>
      </div>
      <div style={{ height: 4, background: 'rgba(120,120,128,0.16)', borderRadius: 2, marginTop: 4 }}>
        <div style={{ width: pct+'%', height: '100%', background: IOS.brand, borderRadius: 2 }}/>
      </div>
    </div>
  );
}

// ──────────────────────────────────────────────────────────
// RECEPTEN — searchable inset grouped list
// ──────────────────────────────────────────────────────────
function IOSRecepten() {
  return (
    <div style={{ background: IOS.bg, minHeight: APP_H, fontFamily: IOS.font, paddingBottom: 90, color: IOS.ink }}>
      <div style={{ height: 54 }}/>
      <IOSLargeHeader title="Recepten" accessory={
        <button style={{ ...glassBtn, color: IOS.brand }}><SF.Plus/></button>
      }/>
      <IOSSearchField placeholder="Zoek titel of ingrediënt"/>
      <IOSSegmented items={['Alle', 'Diner', 'Lunch', 'Veggie']} value="Alle"/>

      <IOSGroupHeader>47 gerechten · Mediterraans</IOSGroupHeader>
      <IOSGroup>
        {SAMPLE_RECIPES.map((r, i, arr) => (
          <div key={r.id} style={{ display: 'flex', alignItems: 'center', padding: '8px 16px', position: 'relative', minHeight: 64 }}>
            <PhotoPlaceholder w={48} h={48} radius={8} label="" tone="warm"/>
            <div style={{ flex: 1, minWidth: 0, marginLeft: 12 }}>
              <p style={{ margin: 0, fontSize: 17, fontWeight: 500, letterSpacing: -0.4,
                whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{r.naam}</p>
              <p style={{ margin: '2px 0 0', fontSize: 13, color: IOS.ink2 }}>{r.cat} · {r.eiwit}g eiwit · {r.kcal} kcal</p>
            </div>
            <SF.Chev style={{ color: IOS.ink3 }}/>
            {i < arr.length - 1 && <div style={{ position: 'absolute', bottom: 0, left: 76, right: 0, height: 0.5, background: IOS.sep }}/>}
          </div>
        ))}
      </IOSGroup>

      <IOSTab active="rec"/>
    </div>
  );
}

// ──────────────────────────────────────────────────────────
// WEEKPLAN
// ──────────────────────────────────────────────────────────
function IOSWeek() {
  return (
    <div style={{ background: IOS.bg, minHeight: APP_H, fontFamily: IOS.font, paddingBottom: 90, color: IOS.ink }}>
      <div style={{ height: 54 }}/>
      <IOSLargeHeader title="Week 3" accessory={
        <span style={{ fontSize: 15, color: IOS.brand, fontWeight: 500, marginBottom: 8 }}>Bewerken</span>
      }/>
      <p style={{ margin: '0 16px 12px', fontSize: 15, color: IOS.ink2 }}>{WEEK_THEME}</p>

      {/* 8-week segmented scroller */}
      <div style={{ padding: '0 16px 8px' }}>
        <div style={{ display: 'flex', gap: 6 }}>
          {[1,2,3,4,5,6,7,8].map(w => {
            const a = w === 3;
            return (
              <div key={w} style={{
                flex: 1, height: 36, borderRadius: 8, display: 'grid', placeItems: 'center',
                background: a ? IOS.brand : IOS.surface,
                color: a ? '#fff' : IOS.ink, fontSize: 15, fontWeight: 600,
              }}>{w}</div>
            );
          })}
        </div>
      </div>

      <IOSGroupHeader>Maaltijden deze week</IOSGroupHeader>
      <IOSGroup>
        {WEEK_PLAN.map((d, i, arr) => {
          const today = i === 3;
          return (
            <IOSRow
              key={d.dag}
              icon={<span style={{ fontFamily: IOS.font, fontSize: 11, fontWeight: 700, color: '#fff', letterSpacing: 0.4 }}>{d.dag.toUpperCase()}</span>}
              iconBg={today ? IOS.brand : '#8e8e93'}
              title={d.diner}
              sub={`Diner · ${d.eiwit}g eiwit`}
              accessory={<SF.Chev style={{ color: IOS.ink3 }}/>}
              last={i === arr.length - 1}
            />
          );
        })}
      </IOSGroup>

      <IOSGroupHeader>Boodschappen</IOSGroupHeader>
      <IOSGroup footer="Gegenereerd uit de 7 diner-recepten van week 3.">
        <IOSRow icon={<SF.Cart style={{ color: '#fff', width: 18, height: 18 }}/>} iconBg="#34c759"
          title="Boodschappenlijst week 3" sub="23 items · ~ €38"
          accessory={<SF.Chev style={{ color: IOS.ink3 }}/>} last/>
      </IOSGroup>

      <IOSTab active="week"/>
    </div>
  );
}

// ──────────────────────────────────────────────────────────
// RECEPT DETAIL — hero + groups
// ──────────────────────────────────────────────────────────
function IOSDetail() {
  return (
    <div style={{ background: IOS.bg, minHeight: APP_H, fontFamily: IOS.font, paddingBottom: 100, color: IOS.ink }}>
      <div style={{ position: 'relative' }}>
        <PhotoPlaceholder h={320} radius={0} label="hero · citroenkip"/>
        <div style={{ position: 'absolute', top: 56, left: 16, display: 'flex', gap: 8 }}>
          <div style={{ width: 34, height: 34, borderRadius: 17, background: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(20px)', display: 'grid', placeItems: 'center', color: IOS.brand }}>
            <SF.Chev style={{ transform: 'rotate(180deg)', width: 10 }}/>
          </div>
        </div>
        <div style={{ position: 'absolute', top: 56, right: 16, display: 'flex', gap: 8 }}>
          <div style={{ width: 34, height: 34, borderRadius: 17, background: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(20px)', display: 'grid', placeItems: 'center', color: IOS.brand, fontSize: 14, fontWeight: 600 }}>
            <SF.Star/>
          </div>
        </div>
      </div>

      <div style={{ padding: '16px 16px 0' }}>
        <p style={{ margin: 0, fontSize: 13, color: IOS.brand, fontWeight: 600, letterSpacing: 0.4, textTransform: 'uppercase' }}>Diner · Mediterraans</p>
        <h1 style={{ margin: '4px 0 6px', fontSize: 28, fontWeight: 700, letterSpacing: 0.3 }}>Citroenkip met couscous</h1>
        <p style={{ margin: 0, fontSize: 15, color: IOS.ink2 }}>2 porties · 35 min</p>
      </div>

      <IOSGroupHeader>Macro's</IOSGroupHeader>
      <IOSGroup>
        <IOSRow title="Calorieën" detail="612 kcal"/>
        <IOSRow title="Eiwit" detail="48 g"/>
        <IOSRow title="Vet" detail="18 g"/>
        <IOSRow title="Koolhydraten" detail="62 g" last/>
      </IOSGroup>

      <IOSGroupHeader>Ingrediënten</IOSGroupHeader>
      <IOSGroup>
        <IOSRow title="Kipfilet" detail="400 g"/>
        <IOSRow title="Couscous" detail="200 g"/>
        <IOSRow title="Biologische citroen" detail="1"/>
        <IOSRow title="Olijfolie" detail="2 el"/>
        <IOSRow title="Verse munt" detail="handje" last/>
      </IOSGroup>

      <IOSGroupHeader>Bereiding</IOSGroupHeader>
      <IOSGroup>
        <div style={{ padding: '14px 16px', fontSize: 16, lineHeight: 1.45, color: IOS.ink }}>
          <p style={{ margin: '0 0 10px' }}><strong>1.</strong> Verwarm de oven voor op 200°C. Snijd de citroen in dunne plakken.</p>
          <p style={{ margin: '0 0 10px' }}><strong>2.</strong> Marineer de kipfilet met olijfolie, zout en grof gemalen peper.</p>
          <p style={{ margin: 0 }}><strong>3.</strong> Bereid de couscous volgens de aanwijzingen op het pak.</p>
        </div>
      </IOSGroup>

      <IOSGroupHeader>{' '}</IOSGroupHeader>
      <IOSGroup>
        <IOSRow icon={<SF.Sparkle style={{ color: '#fff', width: 18, height: 18 }}/>} iconBg="#af52de"
          title="Macro's opnieuw schatten met AI" accessory={<SF.Chev style={{ color: IOS.ink3 }}/>} last/>
      </IOSGroup>
    </div>
  );
}

// ──────────────────────────────────────────────────────────
// BOODSCHAPPEN — checklist (NEW)
// ──────────────────────────────────────────────────────────
function IOSShopping() {
  const groups = [
    { cat: 'Vlees & vis', items: [['400 g', 'Kipfilet', true], ['250 g', 'Zalmfilet'], ['300 g', 'Biefstuk']] },
    { cat: 'Groente', items: [['1 krop', 'Broccoli', true], ['1 bos', 'Verse munt'], ['2 st', 'Paprika'], ['1 zak', 'Spinazie']] },
    { cat: 'Pantry', items: [['200 g', 'Couscous'], ['1 pot', 'Tomaten passata', true], ['200 g', 'Linzen']] },
  ];
  return (
    <div style={{ background: IOS.bg, minHeight: APP_H, fontFamily: IOS.font, paddingBottom: 90, color: IOS.ink }}>
      <div style={{ height: 54 }}/>
      <IOSLargeHeader title="Boodschappen" accessory={
        <span style={{ fontSize: 15, color: IOS.brand, fontWeight: 500, marginBottom: 8 }}>Deel</span>
      }/>
      <p style={{ margin: '0 16px 12px', fontSize: 15, color: IOS.ink2 }}>Week 3 · 23 items · ~ €38</p>

      <div style={{ margin: '0 16px 16px', height: 4, background: 'rgba(120,120,128,0.16)', borderRadius: 2 }}>
        <div style={{ width: '13%', height: '100%', background: IOS.brand, borderRadius: 2 }}/>
      </div>

      {groups.map(g => (
        <React.Fragment key={g.cat}>
          <IOSGroupHeader>{g.cat}</IOSGroupHeader>
          <IOSGroup>
            {g.items.map(([q, name, done], i, arr) => (
              <div key={name} style={{
                display: 'flex', alignItems: 'center', padding: '0 16px', minHeight: 44,
                position: 'relative',
              }}>
                <div style={{
                  width: 24, height: 24, borderRadius: 12, marginRight: 12,
                  background: done ? IOS.brand : 'transparent',
                  border: done ? 'none' : `1.5px solid ${IOS.ink3}`,
                  display: 'grid', placeItems: 'center',
                }}>
                  {done && <svg width="14" height="14" viewBox="0 0 14 14"><path d="M3 7l3 3 6-6" stroke="#fff" strokeWidth="2.4" fill="none" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                </div>
                <span style={{ width: 60, fontSize: 15, color: IOS.ink2 }}>{q}</span>
                <span style={{ flex: 1, fontSize: 17, color: done ? IOS.ink2 : IOS.ink, textDecoration: done ? 'line-through' : 'none' }}>{name}</span>
                {i < arr.length - 1 && <div style={{ position: 'absolute', bottom: 0, left: 52, right: 0, height: 0.5, background: IOS.sep }}/>}
              </div>
            ))}
          </IOSGroup>
        </React.Fragment>
      ))}

      <IOSTab active="shop"/>
    </div>
  );
}

// ──────────────────────────────────────────────────────────
// INSTELLINGEN — native iOS settings look
// ──────────────────────────────────────────────────────────
function IOSSettings() {
  return (
    <div style={{ background: IOS.bg, minHeight: APP_H, fontFamily: IOS.font, paddingBottom: 90, color: IOS.ink }}>
      <div style={{ height: 54 }}/>
      <IOSLargeHeader title="Instellingen"/>

      <IOSGroupHeader>Cyclus</IOSGroupHeader>
      <IOSGroup footer="Automatisch berekend op basis van je startdatum.">
        <IOSRow title="Huidige week" detail="Week 3" accessory={<SF.Chev style={{ color: IOS.ink3 }}/>}/>
        <IOSRow title="Startdatum" detail="14 apr 2026" accessory={<SF.Chev style={{ color: IOS.ink3 }}/>} last/>
      </IOSGroup>

      <IOSGroupHeader>Telegram</IOSGroupHeader>
      <IOSGroup>
        <IOSRow icon={<svg width="16" height="16" viewBox="0 0 16 16" fill="#fff"><path d="M2 7l12-5-2 12-4-2-2 3-1-4 9-7-10 5z"/></svg>} iconBg="#0a84ff"
          title="Verbonden" detail="@gavinguler"/>
        <IOSRow title="Dagelijks bericht" sub="07:30 · wat je vandaag eet" accessory={<IOSToggle on/>}/>
        <IOSRow title="Boodschappen" sub="Zaterdag 10:00" accessory={<IOSToggle/>}/>
        <IOSRow title="Vriezer-reminder" sub="Avond ervoor" accessory={<IOSToggle on/>} last/>
      </IOSGroup>

      <IOSGroupHeader>Voorkeuren</IOSGroupHeader>
      <IOSGroup>
        <IOSRow title="Eiwit-doel" detail="140 g" accessory={<SF.Chev style={{ color: IOS.ink3 }}/>}/>
        <IOSRow title="Calorie-budget" detail="2200 kcal" accessory={<SF.Chev style={{ color: IOS.ink3 }}/>}/>
        <IOSRow title="Dieet" detail="Geen" accessory={<SF.Chev style={{ color: IOS.ink3 }}/>} last/>
      </IOSGroup>

      <IOSGroupHeader>{' '}</IOSGroupHeader>
      <IOSGroup>
        <IOSRow title="Uitloggen" destructive last/>
      </IOSGroup>

      <IOSTab active="inst"/>
    </div>
  );
}

window.IOSHome = IOSHome;
window.IOSRecepten = IOSRecepten;
window.IOSWeek = IOSWeek;
window.IOSDetail = IOSDetail;
window.IOSShopping = IOSShopping;
window.IOSSettings = IOSSettings;
