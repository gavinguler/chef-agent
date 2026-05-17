// Desktop — macOS Tahoe-style Chef Agent
// 1280×820 window, sidebar nav + main content
// iOS-aligned: SF Pro, same green brand, large titles, inset grouped lists carried over

const D = {
  bg: '#f5f5f7',           // window content bg (light gray)
  panel: '#ffffff',
  sidebar: 'rgba(246,246,248,0.85)',
  ink: '#000000',
  ink2: 'rgba(60,60,67,0.6)',
  ink3: 'rgba(60,60,67,0.3)',
  sep: 'rgba(60,60,67,0.12)',
  fill: 'rgba(120,120,128,0.12)',
  brand: '#1f7a4d',
  brandSoft: 'rgba(31,122,77,0.12)',
  font: '-apple-system, BlinkMacSystemFont, "SF Pro Text", "SF Pro", system-ui, sans-serif',
};

function DesktopSidebar({ active }) {
  const items = [
    { k: 'home',   I: SF.HomeF,  label: 'Vandaag',     count: '' },
    { k: 'week',   I: SF.CalF,   label: 'Weekplan',    count: 'Week 3' },
    { k: 'rec',    I: SF.BookF,  label: 'Recepten',    count: '47' },
    { k: 'shop',   I: SF.CartF,  label: 'Boodschappen',count: '23' },
    { k: 'inst',   I: SF.GearF,  label: 'Instellingen',count: '' },
  ];
  return (
    <div style={{
      width: 220, padding: '8px 8px',
      background: D.sidebar, backdropFilter: 'blur(40px)',
      display: 'flex', flexDirection: 'column', gap: 1,
      fontFamily: D.font, borderRight: '0.5px solid rgba(0,0,0,0.06)',
    }}>
      {/* sidebar header */}
      <div style={{ padding: '16px 10px 8px', display: 'flex', alignItems: 'center', gap: 8 }}>
        <div style={{
          width: 28, height: 28, borderRadius: 7, background: D.brand,
          color: '#fff', display: 'grid', placeItems: 'center',
          fontFamily: D.font, fontSize: 14, fontWeight: 700,
        }}>C</div>
        <p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: D.ink }}>Chef Agent</p>
      </div>

      <p style={{ margin: '8px 10px 4px', fontSize: 11, fontWeight: 600, color: D.ink2, letterSpacing: 0.4, textTransform: 'uppercase' }}>Persoonlijk</p>
      {items.map(it => {
        const on = it.k === active;
        return (
          <div key={it.k} style={{
            display: 'flex', alignItems: 'center', gap: 8,
            padding: '5px 10px', borderRadius: 6,
            background: on ? 'rgba(0,0,0,0.06)' : 'transparent',
            color: on ? D.brand : D.ink,
            fontFamily: D.font, fontSize: 13, fontWeight: on ? 600 : 500,
          }}>
            <div style={{ color: on ? D.brand : D.ink2, width: 18, height: 18, display: 'grid', placeItems: 'center' }}>
              {React.cloneElement(<it.I/>, { style: { width: 18, height: 18 } })}
            </div>
            <span style={{ flex: 1 }}>{it.label}</span>
            {it.count && <span style={{ fontSize: 12, color: D.ink2, fontWeight: 500 }}>{it.count}</span>}
          </div>
        );
      })}

      <p style={{ margin: '20px 10px 4px', fontSize: 11, fontWeight: 600, color: D.ink2, letterSpacing: 0.4, textTransform: 'uppercase' }}>Cyclus · 8 weken</p>
      {[
        ['Week 1', 'Aziatisch'],
        ['Week 2', 'Comfort food'],
        ['Week 3', 'Mediterraans', true],
        ['Week 4', 'Mexicaans'],
        ['Week 5', 'BBQ & grill'],
      ].map(([w, t, cur]) => (
        <div key={w} style={{
          display: 'flex', alignItems: 'center', gap: 8,
          padding: '4px 10px', borderRadius: 6,
          fontFamily: D.font, fontSize: 12,
          color: cur ? D.ink : D.ink2,
          background: cur ? 'rgba(0,0,0,0.04)' : 'transparent',
          fontWeight: cur ? 600 : 500,
        }}>
          <span style={{ width: 6, height: 6, borderRadius: 3, background: cur ? D.brand : D.ink3 }}/>
          <span style={{ flex: 1 }}>{w}</span>
          <span style={{ fontSize: 11, color: D.ink2 }}>{t}</span>
        </div>
      ))}

      {/* bottom — user */}
      <div style={{ flex: 1 }}/>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 10px' }}>
        <div style={{ width: 28, height: 28, borderRadius: 14, background: D.brand, color: '#fff', display: 'grid', placeItems: 'center', fontFamily: D.font, fontSize: 13, fontWeight: 700 }}>G</div>
        <div style={{ flex: 1 }}>
          <p style={{ margin: 0, fontSize: 13, fontWeight: 600 }}>Gavin</p>
          <p style={{ margin: 0, fontSize: 11, color: D.ink2 }}>Pro · 8-weken plan</p>
        </div>
      </div>
    </div>
  );
}

// ─── Desktop main content scaffold ───
function DesktopShell({ active, title, accessory, subtitle, children }) {
  return (
    <div style={{ display: 'flex', height: '100%', fontFamily: D.font, background: D.bg }}>
      <DesktopSidebar active={active}/>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        {/* Toolbar */}
        <div style={{
          height: 52, padding: '0 24px',
          display: 'flex', alignItems: 'center', gap: 16,
          borderBottom: '0.5px solid rgba(0,0,0,0.08)',
          background: 'rgba(255,255,255,0.7)', backdropFilter: 'blur(30px)',
        }}>
          <div style={{ flex: 1 }}>
            <p style={{ margin: 0, fontSize: 15, fontWeight: 700, color: D.ink }}>{title}</p>
            {subtitle && <p style={{ margin: '1px 0 0', fontSize: 12, color: D.ink2 }}>{subtitle}</p>}
          </div>
          {/* Search */}
          <div style={{
            width: 220, height: 28, borderRadius: 6,
            background: D.fill, display: 'flex', alignItems: 'center', gap: 5,
            padding: '0 8px', fontSize: 13, color: D.ink2,
          }}>
            <SF.Search/>
            <span>Zoek...</span>
            <span style={{ marginLeft: 'auto', fontSize: 11, color: D.ink3 }}>⌘K</span>
          </div>
          {accessory}
        </div>
        {/* Scroll area */}
        <div style={{ flex: 1, overflow: 'auto' }}>{children}</div>
      </div>
    </div>
  );
}

// ──────────────────────────────────────────────────────────
// DESKTOP HOME — Dashboard
// ──────────────────────────────────────────────────────────
function DTopHome() {
  return (
    <DesktopShell
      active="home"
      title="Vandaag"
      subtitle="Donderdag 8 mei · Week 3 · Mediterraans"
      accessory={
        <button style={{
          height: 28, padding: '0 12px', borderRadius: 6,
          background: D.brand, color: '#fff', border: 'none',
          fontFamily: D.font, fontSize: 13, fontWeight: 600,
          display: 'flex', alignItems: 'center', gap: 5,
        }}><SF.Plus style={{ width: 14, height: 14 }}/> Nieuw recept</button>
      }
    >
      <div style={{ padding: 24, display: 'grid', gridTemplateColumns: '1fr 320px', gap: 20 }}>
        {/* LEFT */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Tonight hero */}
          <div style={{ background: D.panel, borderRadius: 14, overflow: 'hidden', boxShadow: '0 1px 2px rgba(0,0,0,0.04), 0 8px 24px rgba(0,0,0,0.04)', display: 'flex' }}>
            <div style={{ width: 320, flexShrink: 0 }}>
              <PhotoPlaceholder w="100%" h={260} radius={0} label="vanavond"/>
            </div>
            <div style={{ flex: 1, padding: 22, display: 'flex', flexDirection: 'column' }}>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, alignSelf: 'flex-start', padding: '4px 10px', borderRadius: 4, background: D.brandSoft, color: D.brand, fontSize: 11, fontWeight: 700, letterSpacing: 0.6, textTransform: 'uppercase' }}>
                Vanavond · diner
              </span>
              <h2 style={{ margin: '12px 0 6px', fontSize: 28, fontWeight: 700, letterSpacing: 0.2 }}>{TODAY_DINER.naam}</h2>
              <p style={{ margin: 0, fontSize: 14, color: D.ink2 }}>2 porties · 35 min · Mediterraans</p>
              <div style={{ display: 'flex', gap: 16, marginTop: 16 }}>
                <Stat label="Calorieën" v="612 kcal"/>
                <Stat label="Eiwit" v="48 g"/>
                <Stat label="Vet" v="18 g"/>
                <Stat label="KH" v="62 g"/>
              </div>
              <div style={{ flex: 1 }}/>
              <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
                <button style={{ ...btn, background: D.brand, color: '#fff' }}>Recept openen</button>
                <button style={{ ...btn, background: D.brandSoft, color: D.brand }}><SF.Cart style={{ width: 14, height: 14 }}/> Voeg toe aan boodschappen</button>
                <button style={{ ...btn, background: D.fill, color: D.ink }}>Vervang</button>
              </div>
            </div>
          </div>

          {/* Week strip */}
          <div>
            <SectionHeading title="Deze week" sub="8 – 14 mei"/>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 10, marginTop: 12 }}>
              {WEEK_PLAN.map((d, i) => {
                const today = i === 3;
                return (
                  <div key={d.dag} style={{
                    background: today ? D.brand : D.panel,
                    color: today ? '#fff' : D.ink,
                    borderRadius: 12, overflow: 'hidden',
                    boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
                  }}>
                    <PhotoPlaceholder w="100%" h={84} radius={0} label="" tone="warm"/>
                    <div style={{ padding: '8px 10px 12px' }}>
                      <p style={{ margin: 0, fontSize: 10, fontWeight: 700, letterSpacing: 0.6, textTransform: 'uppercase', opacity: today ? 0.85 : 0.5 }}>
                        {d.dag.toUpperCase()} · {5+i} mei
                      </p>
                      <p style={{ margin: '4px 0 0', fontSize: 12, fontWeight: 600, lineHeight: 1.25, height: 30, overflow: 'hidden' }}>{d.diner}</p>
                      <p style={{ margin: '4px 0 0', fontSize: 11, opacity: today ? 0.8 : 0.6 }}>{d.eiwit}g</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Recent recipes */}
          <div>
            <SectionHeading title="Recent toegevoegd" sub="Recepten van afgelopen 30 dagen"/>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginTop: 12 }}>
              {SAMPLE_RECIPES.slice(0, 4).map(r => (
                <div key={r.id} style={{ background: D.panel, borderRadius: 10, overflow: 'hidden', boxShadow: '0 1px 2px rgba(0,0,0,0.04)' }}>
                  <PhotoPlaceholder w="100%" h={100} radius={0} label="" tone="warm"/>
                  <div style={{ padding: 10 }}>
                    <p style={{ margin: 0, fontSize: 10, color: D.brand, fontWeight: 700, letterSpacing: 0.4, textTransform: 'uppercase' }}>{r.cat}</p>
                    <p style={{ margin: '2px 0 4px', fontSize: 13, fontWeight: 600, lineHeight: 1.2 }}>{r.naam}</p>
                    <p style={{ margin: 0, fontSize: 11, color: D.ink2 }}>{r.eiwit}g · {r.kcal}kcal</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT inspector */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Macros */}
          <Panel title="Macro's vandaag">
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '4px 0 10px' }}>
              <ProteinRing v={104} max={140}/>
              <div style={{ flex: 1 }}>
                <p style={{ margin: 0, fontSize: 22, fontWeight: 700, letterSpacing: 0.2 }}>104<span style={{ fontSize: 13, color: D.ink2, fontWeight: 500 }}> / 140 g</span></p>
                <p style={{ margin: '2px 0 0', fontSize: 12, color: D.ink2 }}>Eiwit-doel · 74% behaald</p>
              </div>
            </div>
            <ThinBar v={1488} max={2200} label="Calorieën" unit="kcal"/>
            <div style={{ height: 10 }}/>
            <ThinBar v={82} max={120} label="Vet" unit="g"/>
            <div style={{ height: 10 }}/>
            <ThinBar v={184} max={250} label="Koolhydraten" unit="g"/>
          </Panel>

          {/* Streak */}
          <Panel title="Streak">
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
              <SF.Flame style={{ color: '#ff9500' }}/>
              <p style={{ margin: 0, fontSize: 28, fontWeight: 700 }}>12</p>
              <p style={{ margin: 0, fontSize: 13, color: D.ink2 }}>dagen op plan</p>
            </div>
            <div style={{ display: 'flex', gap: 3, marginTop: 10 }}>
              {Array.from({ length: 21 }).map((_, i) => (
                <div key={i} style={{
                  flex: 1, height: 22, borderRadius: 3,
                  background: i < 12 ? D.brand : (i === 12 ? D.brandSoft : D.fill),
                }}/>
              ))}
            </div>
          </Panel>

          {/* Vriezer reminder */}
          <Panel title="Vriezer" badge="Morgen">
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: '4px 0 0' }}>
              <div style={{ width: 32, height: 32, borderRadius: 8, background: '#e3f2fd', display: 'grid', placeItems: 'center', color: '#0a84ff', fontSize: 16 }}>❄</div>
              <div>
                <p style={{ margin: 0, fontSize: 13, fontWeight: 600 }}>Haal zalm uit de vriezer</p>
                <p style={{ margin: '2px 0 0', fontSize: 12, color: D.ink2 }}>Vanavond voor het diner van vrijdag (zalmfilet)</p>
              </div>
            </div>
          </Panel>

          {/* Quick AI */}
          <div style={{
            background: 'linear-gradient(135deg, #af52de, #5856d6)',
            borderRadius: 12, padding: 14, color: '#fff',
            display: 'flex', alignItems: 'center', gap: 12,
          }}>
            <SF.Sparkle/>
            <div style={{ flex: 1 }}>
              <p style={{ margin: 0, fontSize: 13, fontWeight: 600 }}>AI: stel een diner voor</p>
              <p style={{ margin: '2px 0 0', fontSize: 11, opacity: 0.85 }}>Op basis van wat in je vriezer ligt</p>
            </div>
            <SF.Chev/>
          </div>
        </div>
      </div>
    </DesktopShell>
  );
}

function Stat({ label, v }) {
  return (
    <div>
      <p style={{ margin: 0, fontSize: 11, color: D.ink2, letterSpacing: 0.3, textTransform: 'uppercase', fontWeight: 600 }}>{label}</p>
      <p style={{ margin: '3px 0 0', fontSize: 17, fontWeight: 700 }}>{v}</p>
    </div>
  );
}
const btn = {
  height: 36, padding: '0 14px', borderRadius: 8, border: 'none',
  fontFamily: D.font, fontSize: 13, fontWeight: 600,
  display: 'inline-flex', alignItems: 'center', gap: 6,
};

function SectionHeading({ title, sub, action }) {
  return (
    <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
      <div>
        <p style={{ margin: 0, fontSize: 17, fontWeight: 700, letterSpacing: 0.2 }}>{title}</p>
        {sub && <p style={{ margin: '2px 0 0', fontSize: 12, color: D.ink2 }}>{sub}</p>}
      </div>
      {action}
    </div>
  );
}
function Panel({ title, badge, children }) {
  return (
    <div style={{ background: D.panel, borderRadius: 12, padding: 16, boxShadow: '0 1px 2px rgba(0,0,0,0.04)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 8 }}>
        <p style={{ margin: 0, fontSize: 13, fontWeight: 700, letterSpacing: 0.2 }}>{title}</p>
        {badge && <span style={{ fontSize: 11, color: D.brand, fontWeight: 600 }}>{badge}</span>}
      </div>
      {children}
    </div>
  );
}

// ──────────────────────────────────────────────────────────
// DESKTOP WEEKPLAN — 7×3 grid
// ──────────────────────────────────────────────────────────
function DTopWeek() {
  const meals = [
    { type: 'ontbijt', label: 'Ontbijt', items: ['Skyr-bowl', 'Skyr-bowl', 'Havermout', 'Skyr-bowl', 'Eieren', 'Pannenkoek', 'Skyr-bowl'] },
    { type: 'lunch',   label: 'Lunch',   items: ['Linzensoep', 'Tonijnsalade', 'Rest van diner', 'Wrap', 'Linzensoep', 'Salade', 'Eieren'] },
    { type: 'diner',   label: 'Diner',   items: WEEK_PLAN.map(d => d.diner) },
  ];
  return (
    <DesktopShell
      active="week"
      title="Weekplan"
      subtitle="Week 3 · 5 – 11 mei · Mediterraans"
      accessory={
        <div style={{ display: 'flex', gap: 8 }}>
          <button style={{ ...btn, background: D.fill, color: D.ink, height: 28, padding: '0 10px' }}>← Vorige</button>
          <button style={{ ...btn, background: D.fill, color: D.ink, height: 28, padding: '0 10px' }}>Volgende →</button>
          <button style={{ ...btn, background: D.brand, color: '#fff', height: 28, padding: '0 12px' }}><SF.Cart style={{ width: 13, height: 13 }}/> Boodschappenlijst</button>
        </div>
      }
    >
      {/* Week selector strip */}
      <div style={{ padding: '16px 24px', display: 'flex', gap: 6, borderBottom: '0.5px solid rgba(0,0,0,0.06)' }}>
        {[1,2,3,4,5,6,7,8].map(w => {
          const a = w === 3;
          return (
            <div key={w} style={{
              flex: '0 1 auto', padding: '6px 18px', borderRadius: 6,
              background: a ? D.brand : D.fill,
              color: a ? '#fff' : D.ink, fontSize: 12, fontWeight: 600,
            }}>Week {w}</div>
          );
        })}
        <div style={{ flex: 1 }}/>
        <span style={{ fontSize: 12, color: D.ink2, alignSelf: 'center' }}>Eiwit deze week: <strong style={{ color: D.ink }}>262 g</strong> · Gem. kcal: <strong style={{ color: D.ink }}>2050</strong></span>
      </div>

      {/* Grid */}
      <div style={{ padding: 24 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '80px repeat(7, 1fr)', gap: 0, background: D.panel, borderRadius: 12, overflow: 'hidden', boxShadow: '0 1px 2px rgba(0,0,0,0.04)' }}>
          {/* Header row */}
          <div style={{ padding: '12px 14px', background: 'rgba(0,0,0,0.02)' }}/>
          {WEEK_DAYS.map((d, i) => {
            const today = i === 3;
            return (
              <div key={d} style={{ padding: '12px 14px', background: today ? D.brandSoft : 'rgba(0,0,0,0.02)', borderBottom: '0.5px solid rgba(0,0,0,0.08)' }}>
                <p style={{ margin: 0, fontSize: 11, fontWeight: 700, color: today ? D.brand : D.ink2, letterSpacing: 0.6, textTransform: 'uppercase' }}>{d} · {5+i}</p>
                {today && <p style={{ margin: '2px 0 0', fontSize: 10, color: D.brand, fontWeight: 600 }}>VANDAAG</p>}
              </div>
            );
          })}

          {meals.map((row, ri) => (
            <React.Fragment key={row.type}>
              <div style={{
                padding: '14px 14px', borderTop: '0.5px solid rgba(0,0,0,0.06)',
                fontSize: 11, fontWeight: 700, color: D.ink2, letterSpacing: 0.6, textTransform: 'uppercase',
                background: 'rgba(0,0,0,0.02)',
              }}>{row.label}</div>
              {row.items.map((name, i) => {
                const today = i === 3;
                return (
                  <div key={i} style={{
                    padding: 8, borderTop: '0.5px solid rgba(0,0,0,0.06)',
                    borderLeft: '0.5px solid rgba(0,0,0,0.04)',
                    background: today ? '#fbfdfb' : 'transparent',
                  }}>
                    <div style={{
                      background: '#fff',
                      borderRadius: 8, padding: 8, height: '100%',
                      border: '0.5px solid rgba(0,0,0,0.06)',
                      boxShadow: today ? '0 0 0 1.5px ' + D.brand : 'none',
                    }}>
                      <PhotoPlaceholder w="100%" h={56} radius={5} label="" tone="warm"/>
                      <p style={{ margin: '6px 0 0', fontSize: 12, fontWeight: 600, lineHeight: 1.2, color: D.ink }}>{name}</p>
                      <p style={{ margin: '3px 0 0', fontSize: 10, color: D.ink2 }}>
                        {row.type === 'diner' ? WEEK_PLAN[i].eiwit + 'g eiwit' : '—'}
                      </p>
                    </div>
                  </div>
                );
              })}
            </React.Fragment>
          ))}
        </div>

        {/* Totals row */}
        <div style={{ marginTop: 14, padding: '12px 16px', background: D.panel, borderRadius: 10, display: 'flex', gap: 24, fontSize: 12 }}>
          <span style={{ color: D.ink2 }}>Week-totaal:</span>
          <span><strong>14.350 kcal</strong> <span style={{ color: D.ink2 }}>/ 15.400</span></span>
          <span><strong>262 g</strong> eiwit <span style={{ color: D.ink2 }}>/ 980</span></span>
          <span style={{ color: D.ink2 }}>Vlees-thema: <strong style={{ color: D.ink }}>Mediterraans</strong></span>
          <div style={{ flex: 1 }}/>
          <a style={{ color: D.brand, fontWeight: 600 }}>Genereer week opnieuw met AI →</a>
        </div>
      </div>
    </DesktopShell>
  );
}

// ──────────────────────────────────────────────────────────
// DESKTOP RECEPTEN — grid + sidebar filters
// ──────────────────────────────────────────────────────────
function DTopRecepten() {
  const all = [...SAMPLE_RECIPES, ...SAMPLE_RECIPES, ...SAMPLE_RECIPES.slice(0, 3)];
  return (
    <DesktopShell
      active="rec"
      title="Recepten"
      subtitle="47 gerechten in je bibliotheek"
      accessory={
        <button style={{ ...btn, background: D.brand, color: '#fff', height: 28, padding: '0 12px' }}>
          <SF.Plus style={{ width: 13, height: 13 }}/> Nieuw recept
        </button>
      }
    >
      <div style={{ display: 'flex', height: '100%' }}>
        {/* Filters sidebar */}
        <div style={{ width: 220, padding: '20px 16px', borderRight: '0.5px solid rgba(0,0,0,0.06)', fontFamily: D.font }}>
          <FilterGroup title="Categorie" items={[['Alle', '47', true], ['Diner', '28'], ['Lunch', '11'], ['Ontbijt', '8']]}/>
          <FilterGroup title="Eiwitbron" items={[['Kip'], ['Rund'], ['Vis'], ['Veggie'], ['Plantaardig']]}/>
          <FilterGroup title="Voorbereiding" items={[['< 20 min'], ['< 35 min'], ['Oven-vrij']]}/>
        </div>

        {/* Grid */}
        <div style={{ flex: 1, padding: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 14 }}>
            <div style={{ display: 'flex', gap: 8 }}>
              {['Alle', 'Diner', 'Lunch', 'Veggie', 'Eiwitrijk'].map((l, i) => (
                <span key={l} style={{
                  padding: '5px 12px', borderRadius: 999, fontSize: 12, fontWeight: 600,
                  background: i === 0 ? D.ink : D.fill, color: i === 0 ? '#fff' : D.ink,
                }}>{l}</span>
              ))}
            </div>
            <span style={{ fontSize: 12, color: D.ink2, alignSelf: 'center' }}>Sorteer: <strong style={{ color: D.ink }}>Recent ↓</strong></span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 16 }}>
            {all.map((r, i) => (
              <div key={i} style={{ background: D.panel, borderRadius: 10, overflow: 'hidden', boxShadow: '0 1px 2px rgba(0,0,0,0.04)' }}>
                <PhotoPlaceholder w="100%" h={130} radius={0} label="" tone="warm"/>
                <div style={{ padding: 12 }}>
                  <p style={{ margin: 0, fontSize: 10, color: D.brand, fontWeight: 700, letterSpacing: 0.4, textTransform: 'uppercase' }}>{r.cat}</p>
                  <p style={{ margin: '3px 0 5px', fontSize: 14, fontWeight: 600, lineHeight: 1.2 }}>{r.naam}</p>
                  <p style={{ margin: 0, fontSize: 11, color: D.ink2 }}>{r.eiwit}g eiwit · {r.kcal} kcal · {r.tijd}min</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </DesktopShell>
  );
}

function FilterGroup({ title, items }) {
  return (
    <div style={{ marginBottom: 20 }}>
      <p style={{ margin: '0 0 8px', fontSize: 11, fontWeight: 700, color: D.ink2, letterSpacing: 0.4, textTransform: 'uppercase' }}>{title}</p>
      {items.map(([l, c, on]) => (
        <div key={l} style={{
          display: 'flex', alignItems: 'center', gap: 8,
          padding: '5px 8px', borderRadius: 5,
          background: on ? 'rgba(0,0,0,0.05)' : 'transparent',
          fontSize: 13, color: D.ink, fontWeight: on ? 600 : 500,
        }}>
          <div style={{
            width: 14, height: 14, borderRadius: 3,
            border: on ? 'none' : `1.5px solid ${D.ink3}`,
            background: on ? D.brand : 'transparent',
            display: 'grid', placeItems: 'center', color: '#fff',
          }}>
            {on && <svg width="10" height="10" viewBox="0 0 10 10"><path d="M1.5 5l2 2 5-5" stroke="#fff" strokeWidth="2" fill="none" strokeLinecap="round"/></svg>}
          </div>
          <span style={{ flex: 1 }}>{l}</span>
          {c && <span style={{ fontSize: 11, color: D.ink2 }}>{c}</span>}
        </div>
      ))}
    </div>
  );
}

// ──────────────────────────────────────────────────────────
// DESKTOP DETAIL — split view
// ──────────────────────────────────────────────────────────
function DTopDetail() {
  return (
    <DesktopShell
      active="rec"
      title="Recepten / Citroenkip met couscous"
      accessory={
        <div style={{ display: 'flex', gap: 8 }}>
          <button style={{ ...btn, background: D.fill, color: D.ink, height: 28, padding: '0 10px' }}>Bewerken</button>
          <button style={{ ...btn, background: D.brand, color: '#fff', height: 28, padding: '0 12px' }}>Plan vanavond</button>
        </div>
      }
    >
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: 0, height: '100%' }}>
        {/* Left — content */}
        <div style={{ padding: 24, overflow: 'auto' }}>
          <PhotoPlaceholder w="100%" h={320} radius={12} label="hero · citroenkip"/>

          <div style={{ marginTop: 22 }}>
            <span style={{ fontSize: 11, color: D.brand, fontWeight: 700, letterSpacing: 0.6, textTransform: 'uppercase' }}>Diner · Mediterraans</span>
            <h1 style={{ margin: '6px 0 8px', fontSize: 32, fontWeight: 700, letterSpacing: 0.2 }}>Citroenkip met couscous</h1>
            <p style={{ margin: 0, fontSize: 15, color: D.ink2 }}>Frisse mediterrane traktatie. Geroosterde citroen wordt zacht en zoet — couscous vangt de jus.</p>
          </div>

          <div style={{ marginTop: 28 }}>
            <p style={{ margin: '0 0 10px', fontSize: 13, fontWeight: 700, letterSpacing: 0.4, textTransform: 'uppercase', color: D.ink2 }}>Bereiding</p>
            <ol style={{ margin: 0, padding: 0, listStyle: 'none', fontSize: 15, lineHeight: 1.55 }}>
              {[
                'Verwarm de oven voor op 200°C. Snijd de citroen in dunne plakken.',
                'Marineer de kipfilet met olijfolie, zout en grof gemalen peper.',
                'Bereid de couscous volgens de aanwijzingen op het pak.',
                'Rooster de kip 18–22 minuten in de oven, met de citroenplakken erop.',
                'Hak de munt grof en meng door de couscous. Serveer met de kip.',
              ].map((s, i) => (
                <li key={i} style={{ display: 'flex', gap: 14, marginBottom: 12 }}>
                  <div style={{ width: 28, height: 28, borderRadius: 14, background: D.brandSoft, color: D.brand, display: 'grid', placeItems: 'center', flexShrink: 0, fontSize: 13, fontWeight: 700 }}>{i+1}</div>
                  <p style={{ margin: 0, paddingTop: 2 }}>{s}</p>
                </li>
              ))}
            </ol>
          </div>
        </div>

        {/* Right — inspector */}
        <div style={{ background: D.panel, borderLeft: '0.5px solid rgba(0,0,0,0.06)', padding: 20, overflow: 'auto' }}>
          <Panel title="Macro's">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <Stat label="Calorieën" v="612 kcal"/>
              <Stat label="Eiwit" v="48 g"/>
              <Stat label="Vet" v="18 g"/>
              <Stat label="Koolhydraten" v="62 g"/>
            </div>
            <button style={{ marginTop: 12, ...btn, background: 'linear-gradient(135deg,#af52de,#5856d6)', color: '#fff', width: '100%', justifyContent: 'center' }}>
              <SF.Sparkle style={{ width: 14, height: 14 }}/> Macro's schatten met AI
            </button>
          </Panel>

          <div style={{ height: 16 }}/>

          <Panel title="Ingrediënten" badge="2 porties">
            {[
              ['400 g', 'Kipfilet'],
              ['200 g', 'Couscous'],
              ['1', 'Biologische citroen'],
              ['2 el', 'Olijfolie extra vergine'],
              ['handje', 'Verse munt, grof gehakt'],
              ['snufje', 'Zout & peper'],
            ].map(([q, n], i, arr) => (
              <div key={n} style={{ display: 'flex', padding: '8px 0', borderBottom: i < arr.length - 1 ? '0.5px solid ' + D.sep : 'none' }}>
                <span style={{ width: 64, fontSize: 12, color: D.ink2, fontVariantNumeric: 'tabular-nums' }}>{q}</span>
                <span style={{ flex: 1, fontSize: 13 }}>{n}</span>
              </div>
            ))}
          </Panel>

          <div style={{ height: 16 }}/>

          <Panel title="Gepland">
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ width: 32, height: 32, borderRadius: 8, background: D.brand, color: '#fff', display: 'grid', placeItems: 'center', fontSize: 11, fontWeight: 700 }}>DO</div>
              <div style={{ flex: 1 }}>
                <p style={{ margin: 0, fontSize: 13, fontWeight: 600 }}>Donderdag 8 mei</p>
                <p style={{ margin: 0, fontSize: 11, color: D.ink2 }}>Vanavond · diner</p>
              </div>
              <SF.Chev style={{ color: D.ink3 }}/>
            </div>
          </Panel>
        </div>
      </div>
    </DesktopShell>
  );
}

window.DTopHome = DTopHome;
window.DTopWeek = DTopWeek;
window.DTopRecepten = DTopRecepten;
window.DTopDetail = DTopDetail;
