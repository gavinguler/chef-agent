# Implementatieplan: Handmatig Weekplan + Voedingswaarden per Portie

**Spec:** `docs/superpowers/specs/2026-06-08-manual-weekplan-nutrition-design.md`  
**Datum:** 2026-06-08

---

## Phase 0: Documentation Discovery (DONE)

### Allowed APIs & Patterns

| Doel | Bestand | Regels | Patroon |
|------|---------|--------|---------|
| Mobile meal slot | `frontend/src/pages/WeekPlan.jsx` | 273-284 | `IOSRow` met `onClick={meal.recept_id ? () => navigate(...) : undefined}` |
| Desktop macro display | `frontend/src/pages/RecipeDetail.jsx` | 502-505 | `<Stat label="..." v="..." />` in `<Panel title="Macro's">` |
| Mobile macro display | `frontend/src/pages/RecipeDetail.jsx` | 249-254, 304-309 | `macros` array → `IOSRow` met `detail` prop |
| RecipeIn model | `backend/api/recipes.py` | 23-34 | `Optional[str/int/float] = None` fields |
| RecipeOut model | `backend/api/recipes.py` | 37-51 | Zelfde + `id`, `image_url`, `model_config` |
| Meal slot zetten | `frontend/src/api/client.js` | 115-116 | `setMeal(week, dag, mealType, receptId)` → `PUT /api/meal-plans/week/{n}/dag/{dag}/maaltijd/{type}` |
| Bottom sheet stijl | `frontend/src/pages/WeekPlan.jsx` | template modal | `fixed inset-0 z-50`, `rounded-t-[20px] lg:rounded-[16px]`, `onClick={e => e.stopPropagation()}` |

### Anti-patterns
- Geen directe `axios.get/post` — altijd via `api` instance uit `client.js`
- Geen `db.flush()` zonder commit
- Nooit Claude Sonnet voor simpele generatie
- `porties` default = 1 (niet 2) — bestaande macro-waarden ongewijzigd tonen

---

## Phase 1: Backend — `porties` veld

**Doel:** `porties` kolom toevoegen aan Recipe model en API.

### Taken

**1.1 — `porties` toevoegen aan `backend/db/models.py`**

Bestand: `backend/db/models.py`, klasse `Recipe`

Voeg toe na `image_url`:
```python
porties = Column(Integer, default=1, nullable=False, server_default="1")
```

**1.2 — DB migratie**

Via `db_execute` MCP tool op database `chef_agent`:
```sql
ALTER TABLE recipes ADD COLUMN IF NOT EXISTS porties INTEGER NOT NULL DEFAULT 1;
```

**1.3 — `porties` toevoegen aan `RecipeIn` en `RecipeOut`**

Bestand: `backend/api/recipes.py`

In `RecipeIn` (na `vlees_type`):
```python
porties: int = 1
```

In `RecipeOut` (na `vlees_type`):
```python
porties: int = 1
```

### Verificatie
- `grep -n "porties" backend/db/models.py` → aanwezig
- `grep -n "porties" backend/api/recipes.py` → in beide modellen

---

## Phase 2: Frontend — RecipePicker component

**Doel:** Herbruikbare bottom sheet/modal voor recipe selectie, gebruikt in WeekPlanBuilder én WeekPlan.

### Taken

**2.1 — `frontend/src/components/RecipePicker.jsx` aanmaken**

Props:
```javascript
RecipePicker({ 
  open,           // boolean
  onClose,        // () => void
  onSelect,       // (recipe) => void
  categoryFilter, // string | null — pre-filtert op categorie
  allowClear,     // boolean — toon "Verwijder uit slot" optie
})
```

Structuur (patroon van template modal in `WeekPlan.jsx` template modal):
```jsx
{open && (
  <div className="fixed inset-0 z-50 flex items-end lg:items-center justify-center"
       style={{ background: 'rgba(0,0,0,0.4)' }}
       onClick={onClose}>
    <div className="w-full max-w-md rounded-t-[20px] lg:rounded-[16px] bg-white"
         onClick={e => e.stopPropagation()}>
      {/* header + zoekbalk + lijst */}
    </div>
  </div>
)}
```

Interne state: `search`, `recipes`, `loading`

Data: `getRecipes(search)` bij mount + bij zoekwijziging (300ms debounce)

Filtering: Als `categoryFilter` opgegeven → toon gefilterde resultaten eerst, daarna de rest. Alle recepten doorzoekbaar via zoekbalk.

Lijst: scrollbare lijst met recept-rijen (naam + categorie badge). Bij `allowClear=true`: bovenaan een "Verwijder recept" optie in rood.

**2.2 — `getRecipes` importeren uit `../api/client`**

Geen nieuwe API calls nodig — `getRecipes(search)` bestaat al (client.js regel 7-8).

### Verificatie
- `frontend/src/components/RecipePicker.jsx` bestaat
- Component rendert zonder errors in `/weekplan/samenstellen`

---

## Phase 3: Frontend — WeekPlanBuilder pagina

**Doel:** Nieuw scherm `/weekplan/samenstellen` voor handmatig weekplan samenstellen.

### Taken

**3.1 — `frontend/src/pages/WeekPlanBuilder.jsx` aanmaken**

State:
```javascript
const [slots, setSlots] = useState({});
// slots = { "maandag": { "ontbijt": recipe, "lunch": recipe, ... }, ... }
const [picker, setPicker] = useState(null); 
// picker = { dag, mealType } | null
const [saving, setSaving] = useState(false);
const [templateName, setTemplateName] = useState('');
const [showSaveTemplate, setShowSaveTemplate] = useState(false);
```

Layout: mobile `lg:hidden` / desktop `hidden lg:block` patroon (zie `Voorraad.jsx`).

Per dag een sectie:
- Dag-header (maandag, dinsdag, …)
- 4 slots: ontbijt, lunch, diner, snack
- Per slot: ingevuld → receptnaam + edit-knop; leeg → `+ Voeg toe` knop

Bij klik op slot:
```javascript
setPicker({ dag, mealType })
```

`RecipePicker` onderaan renderen:
```jsx
<RecipePicker
  open={picker !== null}
  onClose={() => setPicker(null)}
  categoryFilter={picker?.mealType}
  allowClear={!!slots[picker?.dag]?.[picker?.mealType]}
  onSelect={(recipe) => {
    if (!recipe) {
      // verwijder
      setSlots(s => ({ ...s, [picker.dag]: { ...s[picker.dag], [picker.mealType]: null } }));
    } else {
      setSlots(s => ({ ...s, [picker.dag]: { ...s[picker.dag], [picker.mealType]: recipe } }));
    }
    setPicker(null);
  }}
/>
```

**Acties onderaan:**

"Toepassen op week X":
```javascript
async function handleApply() {
  const week = await getCurrentWeek();
  const slotsArray = [];
  for (const [dag, meals] of Object.entries(slots)) {
    for (const [mealType, recipe] of Object.entries(meals)) {
      if (recipe) slotsArray.push({ dag, maaltijd_type: mealType, recept_id: recipe.id });
    }
  }
  await applyWeekPlan(week, slotsArray);
  navigate('/weekplan');
}
```

"Opslaan als template" → inline naam-input → `saveTemplate(naam, slotsArray)` (patroon van `WeekPlanGenerator.jsx`).

**3.2 — Route toevoegen aan `App.jsx`**

```jsx
import WeekPlanBuilder from "./pages/WeekPlanBuilder";
// ...
<Route path="/weekplan/samenstellen" element={<WeekPlanBuilder />} />
```

**3.3 — Knop toevoegen op WeekPlan pagina**

Bestand: `frontend/src/pages/WeekPlan.jsx`

In de mobile header accessory (na de bestaande Wand2 knop):
```jsx
<button onClick={() => navigate('/weekplan/samenstellen')}
        className="w-[32px] h-[32px] rounded-full flex items-center justify-center"
        style={{ background: 'rgba(120,120,128,0.14)' }}>
  <LayoutList size={16} className="text-ink2" />
</button>
```

In de desktop accessory (voor "Genereer weekplan"):
```jsx
<button onClick={() => navigate('/weekplan/samenstellen')}
        className="flex items-center gap-1.5 px-3 py-[6px] rounded-[7px] text-[13px] font-semibold"
        style={{ background: 'rgba(120,120,128,0.14)', color: 'rgba(60,60,67,0.7)' }}>
  <LayoutList size={14} /> Stel samen
</button>
```

Import `LayoutList` uit `lucide-react` toevoegen aan WeekPlan.jsx.

### Verificatie
- Navigeer naar `/weekplan/samenstellen` → pagina laadt met 7 dagen × 4 slots
- Klik op leeg slot → RecipePicker opent
- Selecteer recept → slot ingevuld
- "Toepassen op week X" → weekplan bijgewerkt

---

## Phase 4: Frontend — WeekPlan direct bewerkbaar

**Doel:** Edit-icoontje + `+` knop per slot in WeekPlan.jsx, zodat recepten direct wisselbaar zijn.

### Taken

**4.1 — State en handler toevoegen aan `WeekPlan.jsx`**

State (na bestaande state):
```javascript
const [editSlot, setEditSlot] = useState(null);
// { dag, mealType, hasRecipe }
```

Handler:
```javascript
async function handleSlotSelect(recipe) {
  const { dag, mealType } = editSlot;
  await setMeal(selectedWeek, dag, mealType, recipe?.id || null);
  const data = await getWeekPlan(selectedWeek);
  setWeekPlan(data);
  setEditSlot(null);
}
```

Import `setMeal` uit `../api/client` (bestaat al, regel 115-116).

**4.2 — Mobile slot rendering aanpassen (WeekPlan.jsx, regels 273-284)**

Huidig patroon:
```jsx
<IOSRow
  title={meal.naam}
  sub={MEAL_LABEL[type] + ...}
  onClick={meal.recept_id ? () => navigate(...) : undefined}
/>
```

Uitbreiden — edit-knop rechts van elke slot-rij:
```jsx
<div className="flex items-center">
  <div className="flex-1" onClick={meal.recept_id ? () => navigate(`/recepten/${meal.recept_id}`) : undefined}>
    <IOSRow title={meal.naam || `+ ${MEAL_LABEL[type]}`} sub={...} last={j === dayMeals.length - 1} />
  </div>
  <button
    onClick={() => setEditSlot({ dag: dag.dag, mealType: type, hasRecipe: !!meal.recept_id })}
    className="p-2 flex-shrink-0"
  >
    <Pencil size={13} className="text-ink3" />
  </button>
</div>
```

**4.3 — Desktop slot rendering aanpassen**

Zelfde patroon: edit-knop naast elke cel in het desktop grid.

**4.4 — RecipePicker integreren in WeekPlan.jsx**

Onderaan de return, voor de template modal:
```jsx
<RecipePicker
  open={editSlot !== null}
  onClose={() => setEditSlot(null)}
  categoryFilter={editSlot?.mealType}
  allowClear={editSlot?.hasRecipe}
  onSelect={handleSlotSelect}
/>
```

Import `RecipePicker` uit `../components/RecipePicker`.
Import `Pencil` uit `lucide-react` (bestaat al in RecipeDetail, maar controleer WeekPlan imports).

### Verificatie
- WeekPlan pagina → potlood-icoontje zichtbaar naast elke maaltijd
- Klik → RecipePicker opent
- Selecteer recept → slot bijgewerkt zonder pagina-reload
- Lege slots tonen `+` tekst

---

## Phase 5: Frontend — Voedingswaarden per portie

**Doel:** Macro's prominent tonen per portie in RecipeDetail, RecipeForm porties-veld, en Recipes.jsx badges.

### Taken

**5.1 — RecipeDetail.jsx: per-portie berekening**

Bestand: `frontend/src/pages/RecipeDetail.jsx`

De bestaande `macros` array (regels 249-254) aanpassen om `porties` te verwerken:
```javascript
const p = recipe.porties || 1;
const macros = [
  { label: "Calorieën", value: recipe.kcal ? `${Math.round(recipe.kcal / p)} kcal` : "—" },
  { label: "Eiwit",     value: recipe.eiwit_g ? `${Math.round(recipe.eiwit_g / p)}g` : "—" },
  { label: "Vet",       value: recipe.vet_g ? `${Math.round(recipe.vet_g / p)}g` : "—" },
  { label: "Koolhydraten", value: recipe.koolhydraten_g ? `${Math.round(recipe.koolhydraten_g / p)}g` : "—" },
];
```

**5.2 — RecipeDetail.jsx mobile: prominente macro-kaartjes**

Vervang de huidige `IOSGroupHeader + IOSGroup` macro-weergave (regels 304-309) door prominente kaartjes direct na de header-sectie:
```jsx
{(recipe.kcal || recipe.eiwit_g) && (
  <>
    <IOSGroupHeader>Voedingswaarden <span className="text-ink3 font-normal normal-case">per portie</span></IOSGroupHeader>
    <IOSGroup>
      <div className="grid grid-cols-2">
        {macros.map(({ label, value }, i) => (
          <div
            key={label}
            className="px-4 py-[13px]"
            style={{
              borderRight: i % 2 === 0 ? '0.5px solid rgba(60,60,67,0.1)' : 'none',
              borderBottom: i < 2 ? '0.5px solid rgba(60,60,67,0.1)' : 'none',
            }}
          >
            <p className="text-[11px] text-ink2 uppercase tracking-wide mb-1">{label}</p>
            <p className="text-[22px] font-bold text-ink">{value}</p>
          </div>
        ))}
      </div>
    </IOSGroup>
  </>
)}
```

**5.3 — RecipeDetail.jsx desktop: per-portie label aan Stat**

De bestaande Panel (regels 502-505) krijgt een subtitle:
```jsx
<Panel title="Macro's" subtitle="per portie">
  <div className="grid grid-cols-2 gap-4 mb-4">
    {macros.map(m => <Stat key={m.label} label={m.label} v={m.value} />)}
  </div>
```

Controleer of `Panel` een `subtitle` prop accepteert in `DesktopShell.jsx` — zo niet, voeg toe als `<p className="text-[11px] text-ink2 mb-3">{subtitle}</p>` in Panel.

**5.4 — RecipeForm.jsx: porties veld**

Bestand: `frontend/src/pages/RecipeForm.jsx`

In `EMPTY` object (regel 13):
```javascript
porties: 1,
```

In `toFormValues` (regel 18):
```javascript
porties: r.porties ?? 1,
```

In `toPayload` (regel 33):
```javascript
porties: form.porties !== "" ? Number(form.porties) : 1,
```

Veld toevoegen in `FormFields` (na Vlees type sectie):
```jsx
<IOSGroupHeader>Porties</IOSGroupHeader>
<IOSGroup footer="Aantal porties dat dit recept maakt.">
  <div className="px-4 py-[11px]">
    <input
      type="number"
      inputMode="numeric"
      min="1"
      className={inputCls}
      placeholder="1"
      value={form.porties}
      onChange={e => set("porties", e.target.value)}
    />
  </div>
</IOSGroup>
```

**5.5 — Recipes.jsx: per-portie in badges**

Bestand: `frontend/src/pages/Recipes.jsx`

In de sub-tekst van `IOSRow` (regel 112) en desktop kaartjes (regel 201):
```jsx
// Huidig:
r.eiwit_g ? `${Math.round(r.eiwit_g)}g eiwit` : null
// Nieuw:
r.eiwit_g ? `${Math.round(r.eiwit_g / (r.porties || 1))}g eiwit` : null

// Huidig:
r.kcal ? `${r.kcal} kcal` : null
// Nieuw:
r.kcal ? `${Math.round(r.kcal / (r.porties || 1))} kcal` : null
```

### Verificatie
- RecipeDetail toont macro's als grote kaartjes met "per portie" label
- Recept met porties=2 toont gehalveerde waarden
- RecipeForm heeft een "Porties" veld
- Recipes.jsx badges tonen per-portie waarden

---

## Phase 6: Eindverificatie

### Checklist

**WeekPlanBuilder:**
- [ ] `/weekplan/samenstellen` laadt met 7 dagen × 4 slots
- [ ] RecipePicker opent bij klik op slot
- [ ] Recept selecteren vult slot in
- [ ] "Toepassen op week X" werkt
- [ ] "Opslaan als template" werkt

**WeekPlan direct bewerkbaar:**
- [ ] Potlood-icoontje naast elk slot op WeekPlan pagina
- [ ] Klik → RecipePicker opent correct gefilterd
- [ ] Slot bijgewerkt zonder page reload

**Voedingswaarden:**
- [ ] RecipeDetail mobile: grote macro kaartjes met "per portie"
- [ ] RecipeDetail desktop: Stat components met "per portie"
- [ ] RecipeForm: porties veld aanwezig
- [ ] Recipes.jsx badges tonen per-portie waarden

**Anti-patterns check:**
- [ ] `grep -rn "axios\.get\|axios\.post" frontend/src` → 0 hits
- [ ] `grep -rn "db\.flush()" backend/` → 0 hits
