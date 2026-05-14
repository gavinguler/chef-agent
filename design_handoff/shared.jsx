// ─── Direction A: "Stil" — modern minimal, deep green, off-white, line icons ───
// Direction B: "Editorial" — warm cream, serif headlines, photo-led
// Both share these screen primitives.

const APP_W = 402, APP_H = 874;

// Shared placeholder image — subtly striped SVG with a label
const PhotoPlaceholder = ({ w = '100%', h = 120, label = 'food shot', tone = 'warm', radius = 14 }) => {
  const palettes = {
    warm: ['#e9e2d3', '#d9cfb8'],
    cool: ['#dde1e3', '#c8cfd2'],
    deep: ['#2a2f2a', '#1d211d'],
  };
  const [a, b] = palettes[tone] || palettes.warm;
  const id = 'stripe-' + Math.random().toString(36).slice(2, 7);
  return (
    <div style={{ width: w, height: h, borderRadius: radius, overflow: 'hidden', position: 'relative' }}>
      <svg width="100%" height="100%" preserveAspectRatio="none" viewBox="0 0 200 100">
        <defs>
          <pattern id={id} width="8" height="8" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
            <rect width="8" height="8" fill={a}/>
            <rect width="4" height="8" fill={b}/>
          </pattern>
        </defs>
        <rect width="200" height="100" fill={`url(#${id})`}/>
      </svg>
      <span style={{
        position: 'absolute', left: 10, bottom: 8,
        fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
        fontSize: 9, color: tone === 'deep' ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.45)',
        letterSpacing: 0.5,
      }}>{label}</span>
    </div>
  );
};

window.PhotoPlaceholder = PhotoPlaceholder;
window.APP_W = APP_W;
window.APP_H = APP_H;

// Shared sample data
const WEEK_THEME = 'Mediterraans · week 3';
const TODAY_DINER = { naam: 'Citroenkip met couscous', kcal: 612, eiwit: 48, tijd: 35, vlees: 'kip' };
const SAMPLE_RECIPES = [
  { id: 1, naam: 'Citroenkip met couscous', cat: 'diner', kcal: 612, eiwit: 48, vlees: 'kip', tijd: 35 },
  { id: 2, naam: 'Zalmfilet, broccoli & rijst', cat: 'diner', kcal: 580, eiwit: 42, vlees: 'vis', tijd: 25 },
  { id: 3, naam: 'Tofu-curry met spinazie', cat: 'diner', kcal: 510, eiwit: 32, vlees: 'veggie', tijd: 30 },
  { id: 4, naam: 'Skyr-bowl, blauwe bessen', cat: 'ontbijt', kcal: 320, eiwit: 28, vlees: '—', tijd: 5 },
  { id: 5, naam: 'Linzensoep met feta', cat: 'lunch', kcal: 410, eiwit: 24, vlees: 'veggie', tijd: 20 },
  { id: 6, naam: 'Biefstuk, aardappel, sla', cat: 'diner', kcal: 690, eiwit: 52, vlees: 'rund', tijd: 30 },
];
const WEEK_DAYS = ['Ma', 'Di', 'Wo', 'Do', 'Vr', 'Za', 'Zo'];
const WEEK_PLAN = [
  { dag: 'Ma', diner: 'Citroenkip met couscous', eiwit: 48 },
  { dag: 'Di', diner: 'Zalmfilet, broccoli', eiwit: 42 },
  { dag: 'Wo', diner: 'Tofu-curry, spinazie', eiwit: 32 },
  { dag: 'Do', diner: 'Pasta bolognese', eiwit: 38 },
  { dag: 'Vr', diner: 'Biefstuk, aardappel', eiwit: 52 },
  { dag: 'Za', diner: 'Pizza huisgemaakt', eiwit: 28 },
  { dag: 'Zo', diner: 'Geroosterde groenten', eiwit: 22 },
];

window.SAMPLE_RECIPES = SAMPLE_RECIPES;
window.WEEK_PLAN = WEEK_PLAN;
window.WEEK_DAYS = WEEK_DAYS;
window.WEEK_THEME = WEEK_THEME;
window.TODAY_DINER = TODAY_DINER;
