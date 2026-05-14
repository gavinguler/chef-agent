// Direction B — "Editorial" — warm cream, serif headlines, photo-led
const B = {
  bg: '#f3eee4',
  surface: '#fbf8f1',
  ink: '#2a221a',
  ink2: '#6b5e4d',
  ink3: '#a89a85',
  line: '#e6dfd0',
  line2: '#ece6d8',
  brand: '#7c3a1f',     // burnt sienna
  brandSoft: '#f1d7c4',
  good: '#3d6b3a',
  serif: '"Fraunces","Cormorant Garamond",Georgia,serif',
  sans: '"Inter",-apple-system,system-ui,sans-serif',
};

const bChip = {
  display: 'inline-flex', alignItems: 'center', gap: 4,
  padding: '3px 9px', borderRadius: 999,
  fontFamily: B.sans, fontSize: 10, fontWeight: 600, letterSpacing: 1,
  textTransform: 'uppercase',
  background: B.brandSoft, color: B.brand,
};

function BHome() {
  return (
    <div style={{ background: B.bg, minHeight: APP_H, fontFamily: B.sans, color: B.ink, paddingBottom: 110 }}>
      <div style={{ height: 54 }}/>
      <div style={{ padding: '14px 22px 0' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <p style={{ margin: 0, fontFamily: B.sans, fontSize: 11, letterSpacing: 1.6, textTransform: 'uppercase', color: B.ink3 }}>Donderdag · 8 mei</p>
          <Icons.Bell size={18} stroke={B.ink2}/>
        </div>
        <h1 style={{ margin: '8px 0 0', fontFamily: B.serif, fontSize: 36, fontWeight: 400, letterSpacing: -0.8, lineHeight: 1.05 }}>
          Goedemiddag,<br/><em style={{ fontStyle: 'italic', color: B.brand }}>Gavin.</em>
        </h1>
        <p style={{ margin: '12px 0 0', fontSize: 13, color: B.ink2 }}>{WEEK_THEME}</p>
      </div>

      {/* Hero recipe */}
      <div style={{ padding: '22px 22px 0' }}>
        <div style={{ position: 'relative', borderRadius: 18, overflow: 'hidden' }}>
          <PhotoPlaceholder h={280} radius={0} label="hero · vanavond" tone="warm"/>
          <div style={{ position: 'absolute', top: 14, left: 14 }}>
            <span style={bChip}>Vanavond · diner</span>
          </div>
          <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '40px 16px 16px',
            background: 'linear-gradient(transparent, rgba(0,0,0,0.65))', color: '#fff' }}>
            <h2 style={{ margin: 0, fontFamily: B.serif, fontSize: 26, fontWeight: 400, letterSpacing: -0.4, lineHeight: 1.1 }}>{TODAY_DINER.naam}</h2>
            <div style={{ display: 'flex', gap: 14, marginTop: 8, fontSize: 12, opacity: 0.9 }}>
              <span>{TODAY_DINER.kcal} kcal</span><span>·</span>
              <span>{TODAY_DINER.eiwit}g eiwit</span><span>·</span>
              <span>{TODAY_DINER.tijd} min</span>
            </div>
          </div>
        </div>
      </div>

      {/* Week strip */}
      <div style={{ padding: '24px 22px 0' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 12 }}>
          <h3 style={{ margin: 0, fontFamily: B.serif, fontSize: 20, fontWeight: 400, letterSpacing: -0.3 }}>Deze week</h3>
          <a style={{ fontSize: 12, color: B.brand, fontWeight: 500 }}>Volledig plan →</a>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          {WEEK_DAYS.map((d, i) => {
            const today = i === 3;
            return (
              <div key={d} style={{
                flex: 1, padding: '10px 0 12px', borderRadius: 100,
                background: today ? B.brand : 'transparent',
                color: today ? '#fff' : B.ink,
                border: today ? 'none' : `1px solid ${B.line}`,
                textAlign: 'center', fontFamily: B.sans,
              }}>
                <p style={{ margin: 0, fontSize: 9, letterSpacing: 0.8, opacity: today ? 0.8 : 0.5, textTransform: 'uppercase' }}>{d}</p>
                <p style={{ margin: '2px 0 0', fontSize: 14, fontWeight: 600 }}>{5 + i}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Picks */}
      <div style={{ padding: '24px 22px 0' }}>
        <h3 style={{ margin: '0 0 12px', fontFamily: B.serif, fontSize: 20, fontWeight: 400, letterSpacing: -0.3 }}>Komende dagen</h3>
        <div style={{ display: 'flex', gap: 12, overflowX: 'auto' }}>
          {SAMPLE_RECIPES.slice(0, 3).map((r, i) => (
            <div key={r.id} style={{ width: 160, flexShrink: 0 }}>
              <PhotoPlaceholder w={160} h={120} radius={12} label="" tone="warm"/>
              <p style={{ margin: '8px 0 2px', fontFamily: B.sans, fontSize: 10, letterSpacing: 0.8, textTransform: 'uppercase', color: B.ink3 }}>{['vrijdag','zaterdag','zondag'][i]}</p>
              <p style={{ margin: 0, fontFamily: B.serif, fontSize: 15, lineHeight: 1.2 }}>{r.naam}</p>
            </div>
          ))}
        </div>
      </div>

      <BNav active="home"/>
    </div>
  );
}

function BNav({ active }) {
  const items = [
    { k: 'home', I: Icons.Home, label: 'Vandaag' },
    { k: 'recepten', I: Icons.Book, label: 'Recepten' },
    { k: 'week', I: Icons.Calendar, label: 'Week' },
    { k: 'inst', I: Icons.Settings, label: 'Profiel' },
  ];
  return (
    <div style={{
      position: 'absolute', bottom: 0, left: 0, right: 0,
      background: 'rgba(243,238,228,0.95)',
      backdropFilter: 'blur(20px)',
      borderTop: `1px solid ${B.line}`,
      paddingBottom: 28, paddingTop: 8,
      display: 'flex',
    }}>
      {items.map(it => {
        const on = it.k === active;
        return (
          <div key={it.k} style={{
            flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3,
            color: on ? B.brand : B.ink3, fontFamily: B.sans,
          }}>
            <it.I size={22} sw={on ? 2 : 1.6}/>
            <span style={{ fontSize: 10, fontWeight: on ? 600 : 500, letterSpacing: 0.2 }}>{it.label}</span>
          </div>
        );
      })}
    </div>
  );
}

function BRecipes() {
  return (
    <div style={{ background: B.bg, minHeight: APP_H, fontFamily: B.sans, color: B.ink, paddingBottom: 110 }}>
      <div style={{ height: 54 }}/>
      <div style={{ padding: '14px 22px 12px' }}>
        <p style={{ margin: 0, fontSize: 11, letterSpacing: 1.6, textTransform: 'uppercase', color: B.ink3 }}>Bibliotheek</p>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 4 }}>
          <h1 style={{ margin: 0, fontFamily: B.serif, fontSize: 30, fontWeight: 400, letterSpacing: -0.6 }}>Recepten</h1>
          <button style={{ height: 36, padding: '0 14px', borderRadius: 18, background: B.brand, color: '#fff', border: 'none', fontFamily: B.sans, fontSize: 12, fontWeight: 600, letterSpacing: 0.4, display: 'flex', alignItems: 'center', gap: 5 }}>
            <Icons.Plus size={15}/> Nieuw
          </button>
        </div>
      </div>

      <div style={{ padding: '0 22px 14px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px', background: B.surface, borderRadius: 999, border: `1px solid ${B.line}` }}>
          <Icons.Search size={16} stroke={B.ink3}/>
          <span style={{ fontSize: 13, color: B.ink3 }}>Zoek titel of ingrediënt...</span>
        </div>
      </div>

      <div style={{ padding: '0 22px 14px', display: 'flex', gap: 6, overflowX: 'auto' }}>
        {[['Alle', true], ['Diner'], ['Ontbijt'], ['Lunch'], ['Veggie'], ['Snel'], ['Eiwitrijk']].map(([l, on]) => (
          <span key={l} style={{
            padding: '6px 12px', borderRadius: 999, fontSize: 12, fontWeight: 500, whiteSpace: 'nowrap',
            background: on ? B.ink : 'transparent',
            color: on ? B.bg : B.ink2,
            border: on ? 'none' : `1px solid ${B.line}`,
          }}>{l}</span>
        ))}
      </div>

      {/* Magazine grid */}
      <div style={{ padding: '0 22px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
        {SAMPLE_RECIPES.map(r => (
          <div key={r.id}>
            <PhotoPlaceholder h={150} radius={12} label="" tone="warm"/>
            <p style={{ margin: '8px 0 2px', fontSize: 10, letterSpacing: 0.8, textTransform: 'uppercase', color: B.ink3 }}>{r.cat}</p>
            <p style={{ margin: 0, fontFamily: B.serif, fontSize: 15, lineHeight: 1.2, letterSpacing: -0.2 }}>{r.naam}</p>
            <p style={{ margin: '4px 0 0', fontSize: 11, color: B.ink2 }}>{r.eiwit}g · {r.kcal} kcal · {r.tijd}m</p>
          </div>
        ))}
      </div>

      <BNav active="recepten"/>
    </div>
  );
}

function BWeek() {
  return (
    <div style={{ background: B.bg, minHeight: APP_H, fontFamily: B.sans, color: B.ink, paddingBottom: 110 }}>
      <div style={{ height: 54 }}/>
      <div style={{ padding: '14px 22px 0' }}>
        <p style={{ margin: 0, fontSize: 11, letterSpacing: 1.6, textTransform: 'uppercase', color: B.ink3 }}>Cyclus</p>
        <h1 style={{ margin: '4px 0 0', fontFamily: B.serif, fontSize: 30, fontWeight: 400, letterSpacing: -0.6 }}>Week 3</h1>
        <p style={{ margin: '6px 0 0', fontSize: 13, color: B.ink2, fontStyle: 'italic', fontFamily: B.serif }}>{WEEK_THEME}</p>
      </div>

      <div style={{ padding: '16px 22px 0', display: 'flex', gap: 5 }}>
        {[1,2,3,4,5,6,7,8].map(w => {
          const a = w === 3;
          return (
            <div key={w} style={{
              flex: 1, height: 32, borderRadius: 999, display: 'grid', placeItems: 'center',
              background: a ? B.brand : 'transparent',
              color: a ? '#fff' : B.ink3,
              border: a ? 'none' : `1px solid ${B.line}`,
              fontSize: 11, fontWeight: 600,
            }}>{w}</div>
          );
        })}
      </div>

      <div style={{ padding: '24px 22px 0' }}>
        {WEEK_PLAN.map((d, i) => {
          const today = i === 3;
          return (
            <div key={d.dag} style={{
              display: 'flex', gap: 14, paddingBottom: 16, marginBottom: 16,
              borderBottom: `1px solid ${B.line}`,
            }}>
              <div style={{ width: 50, flexShrink: 0 }}>
                <p style={{ margin: 0, fontFamily: B.serif, fontSize: 22, fontWeight: 400, color: today ? B.brand : B.ink, lineHeight: 1 }}>{['5','6','7','8','9','10','11'][i]}</p>
                <p style={{ margin: '2px 0 0', fontSize: 10, letterSpacing: 1, textTransform: 'uppercase', color: today ? B.brand : B.ink3, fontWeight: today ? 600 : 500 }}>{d.dag}</p>
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ margin: 0, fontSize: 10, letterSpacing: 1, textTransform: 'uppercase', color: B.ink3 }}>diner</p>
                <p style={{ margin: '2px 0 4px', fontFamily: B.serif, fontSize: 17, lineHeight: 1.15, letterSpacing: -0.2 }}>{d.diner}</p>
                <p style={{ margin: 0, fontSize: 11, color: B.ink2 }}>{d.eiwit}g eiwit</p>
              </div>
              <PhotoPlaceholder w={64} h={64} radius={10} label="" tone="warm"/>
            </div>
          );
        })}
      </div>

      <BNav active="week"/>
    </div>
  );
}

function BDetail() {
  return (
    <div style={{ background: B.bg, minHeight: APP_H, fontFamily: B.sans, color: B.ink, paddingBottom: 110 }}>
      <PhotoPlaceholder h={420} label="hero · citroenkip" tone="warm" radius={0}/>
      <div style={{ position: 'absolute', top: 56, left: 16, width: 38, height: 38, borderRadius: 19, background: 'rgba(251,248,241,0.92)', backdropFilter: 'blur(10px)', display: 'grid', placeItems: 'center', color: B.ink }}>
        <Icons.ChevronL size={18}/>
      </div>

      <div style={{ marginTop: -40, position: 'relative', background: B.bg, borderRadius: '24px 24px 0 0', padding: '24px 22px 0' }}>
        <span style={bChip}>diner · 35 min</span>
        <h1 style={{ margin: '12px 0 6px', fontFamily: B.serif, fontSize: 30, fontWeight: 400, letterSpacing: -0.6, lineHeight: 1.1 }}>Citroenkip met couscous</h1>
        <p style={{ margin: 0, fontFamily: B.serif, fontStyle: 'italic', fontSize: 14, color: B.ink2, lineHeight: 1.4 }}>
          Heldere mediterrane smaken — citroen, munt, een vleugje knoflook. Klaar in een half uur.
        </p>

        {/* Macros — minimal row */}
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 22, padding: '14px 0', borderTop: `1px solid ${B.line}`, borderBottom: `1px solid ${B.line}` }}>
          {[
            ['612', 'kcal'], ['48g', 'eiwit'], ['18g', 'vet'], ['62g', 'koolhydraten'],
          ].map(([v, l]) => (
            <div key={l} style={{ textAlign: 'center' }}>
              <p style={{ margin: 0, fontFamily: B.serif, fontSize: 18, fontWeight: 500 }}>{v}</p>
              <p style={{ margin: '2px 0 0', fontSize: 9, letterSpacing: 1, textTransform: 'uppercase', color: B.ink3 }}>{l}</p>
            </div>
          ))}
        </div>

        <p style={{ margin: '24px 0 12px', fontSize: 11, letterSpacing: 1.6, textTransform: 'uppercase', color: B.ink3 }}>Wat je nodig hebt</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {[
            ['400 g', 'kipfilet'],
            ['200 g', 'couscous'],
            ['1', 'biologische citroen'],
            ['2 el', 'olijfolie'],
            ['handje', 'verse munt'],
          ].map(([q, i]) => (
            <div key={i} style={{ display: 'flex', alignItems: 'baseline', gap: 12, paddingBottom: 8, borderBottom: `1px dotted ${B.line}` }}>
              <span style={{ width: 64, fontSize: 12, color: B.ink3, fontVariantNumeric: 'tabular-nums' }}>{q}</span>
              <span style={{ flex: 1, fontFamily: B.serif, fontSize: 15 }}>{i}</span>
            </div>
          ))}
        </div>

        <button style={{
          width: '100%', marginTop: 18, padding: '12px 14px', borderRadius: 999,
          background: B.brand, border: 'none', color: '#fff',
          fontFamily: B.sans, fontSize: 13, fontWeight: 600, letterSpacing: 0.4,
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
        }}>
          <Icons.Cart size={15}/> Voeg toe aan boodschappen
        </button>
      </div>
    </div>
  );
}

function BSettings() {
  return (
    <div style={{ background: B.bg, minHeight: APP_H, fontFamily: B.sans, color: B.ink, paddingBottom: 110 }}>
      <div style={{ height: 54 }}/>
      <div style={{ padding: '14px 22px 0' }}>
        <p style={{ margin: 0, fontSize: 11, letterSpacing: 1.6, textTransform: 'uppercase', color: B.ink3 }}>Profiel</p>
        <h1 style={{ margin: '4px 0 0', fontFamily: B.serif, fontSize: 30, fontWeight: 400, letterSpacing: -0.6 }}>Instellingen</h1>
      </div>

      <div style={{ padding: '20px 22px 0' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px', background: B.surface, borderRadius: 16, border: `1px solid ${B.line}` }}>
          <div style={{ width: 48, height: 48, borderRadius: 24, background: B.brand, color: '#fff', display: 'grid', placeItems: 'center', fontFamily: B.serif, fontSize: 20 }}>G</div>
          <div style={{ flex: 1 }}>
            <p style={{ margin: 0, fontFamily: B.serif, fontSize: 17 }}>Gavin</p>
            <p style={{ margin: '2px 0 0', fontSize: 12, color: B.ink2 }}>Week 3 · cyclus loopt sinds 14 apr</p>
          </div>
        </div>
      </div>

      <SectionB title="Telegram berichten">
        <RowB label="Dagelijks ochtendberichtje" sub="07:30" on/>
        <RowB label="Boodschappenherinnering" sub="Zaterdag 10:00"/>
        <RowB label="Vriezer-reminder" sub="Avond ervoor" on/>
      </SectionB>

      <SectionB title="Doelen">
        <RowB label="Eiwit-doel" sub="140 g per dag" chev/>
        <RowB label="Calorie-budget" sub="2200 kcal" chev/>
        <RowB label="Dieet" sub="Geen restricties" chev/>
      </SectionB>

      <BNav active="inst"/>
    </div>
  );
}

function SectionB({ title, children }) {
  return (
    <div style={{ padding: '24px 22px 0' }}>
      <p style={{ margin: '0 0 10px', fontSize: 11, letterSpacing: 1.6, textTransform: 'uppercase', color: B.ink3 }}>{title}</p>
      <div style={{ background: B.surface, border: `1px solid ${B.line}`, borderRadius: 16, padding: '4px 14px' }}>
        {children}
      </div>
    </div>
  );
}
function RowB({ label, sub, on, chev }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 0', borderBottom: `1px solid ${B.line2}` }}>
      <div style={{ flex: 1 }}>
        <p style={{ margin: 0, fontFamily: B.serif, fontSize: 15 }}>{label}</p>
        {sub && <p style={{ margin: '2px 0 0', fontSize: 11, color: B.ink3 }}>{sub}</p>}
      </div>
      {on !== undefined && (
        <div style={{ width: 36, height: 22, borderRadius: 11, background: on ? B.brand : B.line, position: 'relative' }}>
          <div style={{ position: 'absolute', top: 2, left: on ? 16 : 2, width: 18, height: 18, borderRadius: 9, background: '#fff', boxShadow: '0 1px 3px rgba(0,0,0,0.18)' }}/>
        </div>
      )}
      {chev && <Icons.Chevron size={15} stroke={B.ink3}/>}
    </div>
  );
}

window.BHome = BHome;
window.BRecipes = BRecipes;
window.BWeek = BWeek;
window.BDetail = BDetail;
window.BSettings = BSettings;
