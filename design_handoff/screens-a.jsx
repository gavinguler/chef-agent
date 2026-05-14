// Direction A — "Stil" (Quiet)
// Modern minimal · off-white #f6f5f1 · deep green ink · line icons · tight type
// Inter for UI, slight letterspacing on caps.

const A = {
  bg: '#f6f5f1',
  surface: '#ffffff',
  ink: '#1a1f1a',
  ink2: '#5d655c',
  ink3: '#9aa19a',
  line: '#e7e4dc',
  line2: '#efece4',
  brand: '#1f3a2c',     // deep forest
  brandSoft: '#e9efe6',
  accent: '#c2603a',    // terracotta accent
  good: '#2f6b46',
  font: '"Inter", "InterVariable", -apple-system, system-ui, sans-serif',
};

const aPill = {
  display: 'inline-flex', alignItems: 'center', gap: 4,
  padding: '3px 8px', borderRadius: 6,
  fontSize: 11, fontWeight: 500, letterSpacing: 0.2,
  background: A.brandSoft, color: A.brand,
};

// ─── A · Home ───────────────────────────────────────────────
function AHome() {
  return (
    <div style={{ background: A.bg, minHeight: APP_H, fontFamily: A.font, color: A.ink, paddingBottom: 100 }}>
      {/* status bar spacer */}
      <div style={{ height: 54 }}/>

      {/* Header */}
      <div style={{ padding: '14px 20px 18px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <p style={{ margin: 0, fontSize: 11, letterSpacing: 1.4, textTransform: 'uppercase', color: A.ink3 }}>Donderdag · 8 mei</p>
            <h1 style={{ margin: '4px 0 0', fontSize: 26, fontWeight: 600, letterSpacing: -0.6, lineHeight: 1.15 }}>Goedemiddag, Gavin.</h1>
          </div>
          <button style={{ width: 38, height: 38, borderRadius: 19, border: `1px solid ${A.line}`, background: A.surface, display: 'grid', placeItems: 'center', color: A.ink2 }}>
            <Icons.Bell size={18}/>
          </button>
        </div>
        <p style={{ margin: '14px 0 0', fontSize: 13, color: A.ink2 }}>{WEEK_THEME} · dag 4 van 7</p>
      </div>

      {/* Today card */}
      <div style={{ padding: '0 20px' }}>
        <div style={{ background: A.surface, borderRadius: 18, border: `1px solid ${A.line}`, overflow: 'hidden' }}>
          <PhotoPlaceholder h={150} label="diner · citroenkip" tone="warm" radius={0}/>
          <div style={{ padding: '14px 16px 16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, letterSpacing: 1.2, textTransform: 'uppercase', color: A.ink3 }}>
              <Icons.Dot size={8}/> Vanavond · diner
            </div>
            <p style={{ margin: '8px 0 12px', fontSize: 19, fontWeight: 600, letterSpacing: -0.3 }}>{TODAY_DINER.naam}</p>
            <div style={{ display: 'flex', gap: 16, fontSize: 12, color: A.ink2 }}>
              <span><strong style={{ color: A.ink, fontSize: 14, fontWeight: 600 }}>{TODAY_DINER.kcal}</strong> kcal</span>
              <span><strong style={{ color: A.ink, fontSize: 14, fontWeight: 600 }}>{TODAY_DINER.eiwit}g</strong> eiwit</span>
              <span><strong style={{ color: A.ink, fontSize: 14, fontWeight: 600 }}>{TODAY_DINER.tijd}</strong> min</span>
            </div>
          </div>
          <div style={{ display: 'flex', borderTop: `1px solid ${A.line}` }}>
            <button style={{ flex: 1, padding: '13px 0', background: 'none', border: 'none', borderRight: `1px solid ${A.line}`, fontFamily: A.font, fontSize: 13, color: A.ink, fontWeight: 500 }}>Recept openen</button>
            <button style={{ flex: 1, padding: '13px 0', background: 'none', border: 'none', fontFamily: A.font, fontSize: 13, color: A.ink2, fontWeight: 500, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
              <Icons.Cart size={15}/> Boodschap
            </button>
          </div>
        </div>
      </div>

      {/* Macro day-progress */}
      <div style={{ padding: '20px 20px 0' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 10 }}>
          <p style={{ margin: 0, fontSize: 13, fontWeight: 600 }}>Vandaag in cijfers</p>
          <p style={{ margin: 0, fontSize: 12, color: A.ink3 }}>3 van 3 maaltijden</p>
        </div>
        <MacroBar label="Eiwit" v={104} max={140} unit="g" tone={A.brand}/>
        <MacroBar label="Calorieën" v={1488} max={2200} unit="kcal" tone={A.ink2}/>
      </div>

      {/* Week strip */}
      <div style={{ padding: '24px 20px 0' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 12 }}>
          <p style={{ margin: 0, fontSize: 13, fontWeight: 600 }}>Deze week</p>
          <a style={{ fontSize: 12, color: A.ink2 }}>Volledig plan →</a>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          {WEEK_DAYS.map((d, i) => {
            const today = i === 3;
            return (
              <div key={d} style={{
                flex: 1, padding: '10px 0 12px', borderRadius: 12,
                background: today ? A.brand : A.surface,
                color: today ? '#fff' : A.ink,
                border: today ? 'none' : `1px solid ${A.line}`,
                textAlign: 'center',
              }}>
                <p style={{ margin: 0, fontSize: 10, letterSpacing: 0.8, opacity: today ? 0.7 : 0.5, textTransform: 'uppercase' }}>{d}</p>
                <p style={{ margin: '2px 0 0', fontSize: 14, fontWeight: 600 }}>{5 + i}</p>
              </div>
            );
          })}
        </div>
      </div>

      <ANav active="home"/>
    </div>
  );
}

function MacroBar({ label, v, max, unit, tone }) {
  const pct = Math.min(100, (v / max) * 100);
  return (
    <div style={{ marginBottom: 10 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 5 }}>
        <span style={{ color: A.ink2 }}>{label}</span>
        <span><strong>{v}</strong><span style={{ color: A.ink3 }}> / {max} {unit}</span></span>
      </div>
      <div style={{ height: 4, background: A.line2, borderRadius: 2, overflow: 'hidden' }}>
        <div style={{ width: `${pct}%`, height: '100%', background: tone, borderRadius: 2 }}/>
      </div>
    </div>
  );
}

// ─── A · Bottom Nav ─────────────────────────────────────────
function ANav({ active }) {
  const items = [
    { k: 'home', I: Icons.Home, label: 'Home' },
    { k: 'recepten', I: Icons.Book, label: 'Recepten' },
    { k: 'week', I: Icons.Calendar, label: 'Week' },
    { k: 'inst', I: Icons.Settings, label: 'Instellingen' },
  ];
  return (
    <div style={{
      position: 'absolute', bottom: 0, left: 0, right: 0,
      background: 'rgba(246,245,241,0.92)',
      backdropFilter: 'blur(20px)',
      borderTop: `1px solid ${A.line}`,
      paddingBottom: 28, paddingTop: 8,
      display: 'flex',
    }}>
      {items.map(it => {
        const on = it.k === active;
        return (
          <div key={it.k} style={{
            flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3,
            color: on ? A.brand : A.ink3,
          }}>
            <it.I size={22} sw={on ? 2 : 1.6}/>
            <span style={{ fontSize: 10, fontWeight: on ? 600 : 500, letterSpacing: 0.2 }}>{it.label}</span>
          </div>
        );
      })}
    </div>
  );
}

// ─── A · Recepten list ──────────────────────────────────────
function ARecipes() {
  return (
    <div style={{ background: A.bg, minHeight: APP_H, fontFamily: A.font, color: A.ink, paddingBottom: 100 }}>
      <div style={{ height: 54 }}/>
      <div style={{ padding: '14px 20px 12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1 style={{ margin: 0, fontSize: 26, fontWeight: 600, letterSpacing: -0.6 }}>Recepten</h1>
        <button style={{ height: 36, padding: '0 14px', borderRadius: 18, background: A.ink, color: '#fff', border: 'none', fontFamily: A.font, fontSize: 13, fontWeight: 500, display: 'flex', alignItems: 'center', gap: 5 }}>
          <Icons.Plus size={16}/> Nieuw
        </button>
      </div>

      {/* Search */}
      <div style={{ padding: '0 20px 12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px', background: A.surface, borderRadius: 12, border: `1px solid ${A.line}` }}>
          <Icons.Search size={16} stroke={A.ink3}/>
          <span style={{ fontSize: 14, color: A.ink3 }}>Zoek recept...</span>
        </div>
      </div>

      {/* Filter chips */}
      <div style={{ padding: '0 20px 16px', display: 'flex', gap: 6, flexWrap: 'wrap' }}>
        {[['Alle', true], ['Diner'], ['Lunch'], ['Ontbijt'], ['Veggie']].map(([l, on]) => (
          <span key={l} style={{
            padding: '5px 12px', borderRadius: 14, fontSize: 12, fontWeight: 500,
            background: on ? A.ink : A.surface,
            color: on ? '#fff' : A.ink2,
            border: on ? 'none' : `1px solid ${A.line}`,
          }}>{l}</span>
        ))}
      </div>

      {/* List */}
      <div style={{ padding: '0 20px', display: 'flex', flexDirection: 'column', gap: 10 }}>
        {SAMPLE_RECIPES.map(r => (
          <div key={r.id} style={{ background: A.surface, borderRadius: 14, border: `1px solid ${A.line}`, padding: 10, display: 'flex', gap: 12, alignItems: 'center' }}>
            <div style={{ width: 64, height: 64, flexShrink: 0 }}>
              <PhotoPlaceholder w={64} h={64} radius={10} label="" tone="warm"/>
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ margin: 0, fontSize: 11, color: A.ink3, letterSpacing: 0.6, textTransform: 'uppercase' }}>{r.cat}</p>
              <p style={{ margin: '2px 0 5px', fontSize: 14, fontWeight: 600, letterSpacing: -0.2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{r.naam}</p>
              <div style={{ display: 'flex', gap: 10, fontSize: 11, color: A.ink2 }}>
                <span>{r.eiwit}g eiwit</span>
                <span>·</span>
                <span>{r.kcal} kcal</span>
                <span>·</span>
                <span>{r.tijd} min</span>
              </div>
            </div>
            <Icons.Chevron size={16} stroke={A.ink3}/>
          </div>
        ))}
      </div>

      <ANav active="recepten"/>
    </div>
  );
}

// ─── A · Weekplan ───────────────────────────────────────────
function AWeek() {
  return (
    <div style={{ background: A.bg, minHeight: APP_H, fontFamily: A.font, color: A.ink, paddingBottom: 100 }}>
      <div style={{ height: 54 }}/>
      <div style={{ padding: '14px 20px 4px' }}>
        <p style={{ margin: 0, fontSize: 11, letterSpacing: 1.4, textTransform: 'uppercase', color: A.ink3 }}>8-weken cyclus</p>
        <h1 style={{ margin: '4px 0 0', fontSize: 26, fontWeight: 600, letterSpacing: -0.6 }}>Weekplan</h1>
      </div>

      {/* Week selector */}
      <div style={{ padding: '14px 20px 0', display: 'flex', gap: 6 }}>
        {[1,2,3,4,5,6,7,8].map(w => {
          const active = w === 3;
          return (
            <div key={w} style={{
              flex: 1, height: 36, borderRadius: 9, display: 'grid', placeItems: 'center',
              background: active ? A.brand : A.surface,
              color: active ? '#fff' : A.ink2,
              border: active ? 'none' : `1px solid ${A.line}`,
              fontSize: 12, fontWeight: 600,
            }}>{w}</div>
          );
        })}
      </div>
      <p style={{ margin: '10px 20px 0', fontSize: 12, color: A.ink2 }}>{WEEK_THEME}</p>

      {/* Day list */}
      <div style={{ padding: '20px 20px 0', display: 'flex', flexDirection: 'column', gap: 10 }}>
        {WEEK_PLAN.map((d, i) => {
          const today = i === 3;
          return (
            <div key={d.dag} style={{
              background: today ? A.surface : 'transparent',
              border: today ? `1px solid ${A.brand}` : `1px solid ${A.line}`,
              borderRadius: 14, padding: '12px 14px',
              display: 'flex', alignItems: 'center', gap: 14,
            }}>
              <div style={{
                width: 38, height: 38, borderRadius: 10,
                background: today ? A.brand : A.brandSoft,
                color: today ? '#fff' : A.brand,
                display: 'grid', placeItems: 'center',
                fontSize: 11, fontWeight: 600, letterSpacing: 0.4,
              }}>{d.dag.toUpperCase()}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ margin: 0, fontSize: 14, fontWeight: 500, letterSpacing: -0.2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{d.diner}</p>
                <p style={{ margin: '2px 0 0', fontSize: 11, color: A.ink3 }}>diner · {d.eiwit}g eiwit</p>
              </div>
              {today && <span style={{ ...aPill, background: A.brand, color: '#fff' }}>vandaag</span>}
              <Icons.Chevron size={15} stroke={A.ink3}/>
            </div>
          );
        })}
      </div>

      {/* Shopping CTA */}
      <div style={{ padding: '20px 20px 0' }}>
        <div style={{ background: A.ink, color: '#fff', borderRadius: 14, padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 12 }}>
          <Icons.Cart size={20}/>
          <div style={{ flex: 1 }}>
            <p style={{ margin: 0, fontSize: 13, fontWeight: 600 }}>Boodschappenlijst</p>
            <p style={{ margin: '2px 0 0', fontSize: 11, opacity: 0.6 }}>23 items · €38 geschat</p>
          </div>
          <Icons.ArrowR size={18}/>
        </div>
      </div>

      <ANav active="week"/>
    </div>
  );
}

// ─── A · Recipe Detail ──────────────────────────────────────
function ADetail() {
  return (
    <div style={{ background: A.bg, minHeight: APP_H, fontFamily: A.font, color: A.ink, paddingBottom: 110 }}>
      <PhotoPlaceholder h={300} label="hero · citroenkip met couscous" tone="warm" radius={0}/>
      {/* glass back */}
      <div style={{ position: 'absolute', top: 56, left: 16, width: 38, height: 38, borderRadius: 19, background: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(10px)', display: 'grid', placeItems: 'center', color: A.ink }}>
        <Icons.ChevronL size={18}/>
      </div>
      <div style={{ position: 'absolute', top: 56, right: 16, display: 'flex', gap: 8 }}>
        <div style={{ width: 38, height: 38, borderRadius: 19, background: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(10px)', display: 'grid', placeItems: 'center', color: A.ink }}>
          <Icons.Pencil size={16}/>
        </div>
        <div style={{ width: 38, height: 38, borderRadius: 19, background: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(10px)', display: 'grid', placeItems: 'center', color: A.ink }}>
          <Icons.More size={18}/>
        </div>
      </div>

      <div style={{ padding: '24px 20px 0' }}>
        <span style={aPill}>diner · kip</span>
        <h1 style={{ margin: '10px 0 6px', fontSize: 26, fontWeight: 600, letterSpacing: -0.6, lineHeight: 1.15 }}>Citroenkip met couscous</h1>
        <p style={{ margin: 0, fontSize: 13, color: A.ink2 }}>Mediterraans · 35 min · 2 porties</p>

        {/* Macros grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8, marginTop: 18 }}>
          {[
            ['612', 'kcal'],
            ['48g', 'eiwit'],
            ['18g', 'vet'],
            ['62g', 'KH'],
          ].map(([v, l]) => (
            <div key={l} style={{ background: A.surface, border: `1px solid ${A.line}`, borderRadius: 12, padding: '10px 0', textAlign: 'center' }}>
              <p style={{ margin: 0, fontSize: 16, fontWeight: 600, letterSpacing: -0.3 }}>{v}</p>
              <p style={{ margin: '2px 0 0', fontSize: 10, color: A.ink3, letterSpacing: 0.6, textTransform: 'uppercase' }}>{l}</p>
            </div>
          ))}
        </div>

        {/* Ingredients */}
        <p style={{ margin: '24px 0 10px', fontSize: 11, letterSpacing: 1.4, textTransform: 'uppercase', color: A.ink3 }}>Ingrediënten</p>
        <div style={{ background: A.surface, border: `1px solid ${A.line}`, borderRadius: 14 }}>
          {[
            ['400 g', 'kipfilet'],
            ['200 g', 'couscous'],
            ['1', 'biologische citroen'],
            ['2 el', 'olijfolie'],
            ['handje', 'verse munt'],
          ].map(([q, i], idx, arr) => (
            <div key={i} style={{
              display: 'flex', padding: '11px 14px',
              borderBottom: idx < arr.length - 1 ? `1px solid ${A.line2}` : 'none',
              fontSize: 13,
            }}>
              <span style={{ width: 64, color: A.ink3 }}>{q}</span>
              <span style={{ flex: 1 }}>{i}</span>
            </div>
          ))}
        </div>

        {/* AI macros button */}
        <button style={{
          width: '100%', marginTop: 12, padding: '11px 14px', borderRadius: 12,
          background: A.surface, border: `1px solid ${A.line}`, color: A.ink2,
          fontFamily: A.font, fontSize: 13, fontWeight: 500,
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
        }}>
          <Icons.Sparkle size={15} stroke={A.accent}/> Macro's opnieuw schatten
        </button>
      </div>

      {/* Sticky CTA */}
      <div style={{
        position: 'absolute', bottom: 28, left: 16, right: 16,
        background: A.ink, color: '#fff', borderRadius: 14, padding: '14px 16px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        boxShadow: '0 12px 32px rgba(0,0,0,0.18)',
      }}>
        <span style={{ fontSize: 14, fontWeight: 600 }}>Plan voor donderdag</span>
        <Icons.ArrowR size={18}/>
      </div>
    </div>
  );
}

// ─── A · Settings ───────────────────────────────────────────
function ASettings() {
  return (
    <div style={{ background: A.bg, minHeight: APP_H, fontFamily: A.font, color: A.ink, paddingBottom: 100 }}>
      <div style={{ height: 54 }}/>
      <div style={{ padding: '14px 20px 4px' }}>
        <h1 style={{ margin: 0, fontSize: 26, fontWeight: 600, letterSpacing: -0.6 }}>Instellingen</h1>
        <p style={{ margin: '4px 0 0', fontSize: 13, color: A.ink2 }}>Configureer je Chef Agent</p>
      </div>

      {/* Cycle */}
      <SectionA title="Huidige cyclus week">
        <p style={{ margin: '0 0 12px', fontSize: 12, color: A.ink2 }}>Auto: week 3 · handmatig nog niet ingesteld</p>
        <div style={{ display: 'flex', gap: 6 }}>
          {[1,2,3,4,5,6,7,8].map(w => {
            const active = w === 3;
            return (
              <div key={w} style={{
                flex: 1, height: 34, borderRadius: 8, display: 'grid', placeItems: 'center',
                background: active ? A.brand : 'transparent',
                color: active ? '#fff' : A.ink2,
                border: active ? 'none' : `1px solid ${A.line}`,
                fontSize: 12, fontWeight: 600,
              }}>W{w}</div>
            );
          })}
        </div>
      </SectionA>

      {/* Notifications */}
      <SectionA title="Telegram">
        <RowA label="Dagelijks ochtendberichtje" sub="07:30 · wat je vandaag eet" on/>
        <RowA label="Boodschappenherinnering" sub="Zaterdag 10:00 · 23 items"/>
        <RowA label="Vriezer-reminder" sub="Avond voor je nodig hebt" on/>
      </SectionA>

      <SectionA title="Voorkeuren">
        <RowA label="Eiwit-doel" sub="140 g per dag" chev/>
        <RowA label="Calorie-budget" sub="2200 kcal per dag" chev/>
        <RowA label="Dieet" sub="Geen restricties" chev/>
      </SectionA>

      <ANav active="inst"/>
    </div>
  );
}

function SectionA({ title, children }) {
  return (
    <div style={{ padding: '20px 20px 0' }}>
      <p style={{ margin: '0 0 10px', fontSize: 11, letterSpacing: 1.4, textTransform: 'uppercase', color: A.ink3 }}>{title}</p>
      <div style={{ background: A.surface, border: `1px solid ${A.line}`, borderRadius: 14, padding: 14 }}>
        {children}
      </div>
    </div>
  );
}
function RowA({ label, sub, on, chev }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderBottom: `1px solid ${A.line2}` }}>
      <div style={{ flex: 1 }}>
        <p style={{ margin: 0, fontSize: 13, fontWeight: 500 }}>{label}</p>
        {sub && <p style={{ margin: '2px 0 0', fontSize: 11, color: A.ink3 }}>{sub}</p>}
      </div>
      {on !== undefined && (
        <div style={{ width: 36, height: 22, borderRadius: 11, background: on ? A.brand : A.line, position: 'relative' }}>
          <div style={{ position: 'absolute', top: 2, left: on ? 16 : 2, width: 18, height: 18, borderRadius: 9, background: '#fff', boxShadow: '0 1px 3px rgba(0,0,0,0.18)' }}/>
        </div>
      )}
      {chev && <Icons.Chevron size={15} stroke={A.ink3}/>}
    </div>
  );
}

// ─── A · Shopping list (NEW screen) ─────────────────────────
function AShopping() {
  const groups = [
    { cat: 'Vlees & vis', items: [['400 g', 'kipfilet', true], ['250 g', 'zalmfilet'], ['300 g', 'biefstuk']] },
    { cat: 'Groente', items: [['1 krop', 'broccoli', true], ['1 bos', 'verse munt'], ['2', 'paprika']] },
    { cat: 'Pantry', items: [['200 g', 'couscous'], ['1 pot', 'tomaten passata', true]] },
  ];
  return (
    <div style={{ background: A.bg, minHeight: APP_H, fontFamily: A.font, color: A.ink, paddingBottom: 100 }}>
      <div style={{ height: 54 }}/>
      <div style={{ padding: '14px 20px 4px', display: 'flex', alignItems: 'center', gap: 12 }}>
        <Icons.ChevronL size={20}/>
        <div style={{ flex: 1 }}>
          <p style={{ margin: 0, fontSize: 11, letterSpacing: 1.4, textTransform: 'uppercase', color: A.ink3 }}>Week 3 · 23 items</p>
          <h1 style={{ margin: '2px 0 0', fontSize: 22, fontWeight: 600, letterSpacing: -0.5 }}>Boodschappen</h1>
        </div>
        <span style={{ ...aPill, background: A.brandSoft, color: A.brand }}>~ €38</span>
      </div>

      {/* Progress */}
      <div style={{ padding: '14px 20px 0' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: A.ink2, marginBottom: 6 }}>
          <span>3 van 23</span><span>13%</span>
        </div>
        <div style={{ height: 4, background: A.line2, borderRadius: 2, overflow: 'hidden' }}>
          <div style={{ width: '13%', height: '100%', background: A.brand }}/>
        </div>
      </div>

      {groups.map(g => (
        <div key={g.cat} style={{ padding: '20px 20px 0' }}>
          <p style={{ margin: '0 0 8px', fontSize: 11, letterSpacing: 1.4, textTransform: 'uppercase', color: A.ink3 }}>{g.cat}</p>
          <div style={{ background: A.surface, border: `1px solid ${A.line}`, borderRadius: 14, overflow: 'hidden' }}>
            {g.items.map(([q, i, done], idx, arr) => (
              <div key={i} style={{
                display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px',
                borderBottom: idx < arr.length - 1 ? `1px solid ${A.line2}` : 'none',
                opacity: done ? 0.45 : 1,
              }}>
                <div style={{
                  width: 20, height: 20, borderRadius: 6,
                  border: done ? 'none' : `1.5px solid ${A.line}`,
                  background: done ? A.brand : 'transparent',
                  display: 'grid', placeItems: 'center', color: '#fff',
                }}>
                  {done && <Icons.Check size={12}/>}
                </div>
                <span style={{ width: 56, fontSize: 12, color: A.ink3 }}>{q}</span>
                <span style={{ flex: 1, fontSize: 14, textDecoration: done ? 'line-through' : 'none' }}>{i}</span>
              </div>
            ))}
          </div>
        </div>
      ))}
      <ANav active="week"/>
    </div>
  );
}

window.AHome = AHome;
window.ARecipes = ARecipes;
window.AWeek = AWeek;
window.ADetail = ADetail;
window.ASettings = ASettings;
window.AShopping = AShopping;
