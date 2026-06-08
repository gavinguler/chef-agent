# Implementatieplan: Recipe Delete, Voorraad Pagina, AI Weekplan Generator + Templates

**Spec:** `docs/superpowers/specs/2026-06-08-recipe-crud-weekplan-voorraad-design.md`  
**Datum:** 2026-06-08

---

## Phase 0: Documentation Discovery (DONE)

Patterns vastgesteld via codebase-analyse:

### Allowed APIs & Patterns

| Doel | Bestand | Regels | Patroon |
|------|---------|--------|---------|
| Router registreren | `backend/main.py` | 52-56 | `app.include_router(module.router, prefix="/api/...", tags=[...])` |
| DB upsert | `backend/api/meal_plans.py` | 111-144 | Query first → update or create → `db.commit()` |
| Claude Haiku call | `backend/ai/claude_client.py` | 48-61 | `await _client.messages.create(model="claude-haiku-4-5-20251001", max_tokens=N, messages=[...])` → `.content[0].text.strip()` |
| JSON defensief parsen | `backend/ai/claude_client.py` | 39-45 | `raw.find("{")` / `raw.rfind("}")` + `json.loads()` + warning log on failure |
| API client functie | `frontend/src/api/client.js` | 7-35 | `api.get(url).then((r) => r.data)` of `api.post(url, data).then((r) => r.data)` |
| Tab bar item | `frontend/src/components/IOSPrimitives.jsx` | 133-169 | Object toevoegen aan `TAB_ITEMS` array |
| Desktop nav item | `frontend/src/components/DesktopShell.jsx` | 53-143 | Object toevoegen aan `NAV_ITEMS` array |
| IOSRow actie-knop | `frontend/src/pages/RecipeDetail.jsx` | 368-399 | `onClick={loading ? undefined : handler}`, `detail={loading ? "…" : undefined}` |
| Async handler | `frontend/src/pages/RecipeDetail.jsx` | 180-186 | `setLoading(true)` → try/finally → state update |

### Anti-patterns
- Geen `window.alert()` voor errors — gebruik inline foutmelding in de UI
- Geen `db.flush()` zonder `db.commit()` daarna
- Geen `axios.get()` direct — altijd via de `api` instance uit `client.js`
- Nooit Claude Sonnet gebruiken voor simpele generatie — Haiku is voldoende

---

## Phase 1: Database model + Bonnetjes client uitbreiden

**Doel:** Fundament leggen voor templates en directe stock-operaties.

### Taken

**1.1 — `WeekPlanTemplate` model toevoegen**

Bestand: `backend/db/models.py`

Voeg onderaan toe (na `NutritionCycle`):
```python
import json as _json

class WeekPlanTemplate(Base):
    __tablename__ = "week_plan_templates"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    naam = Column(Text, nullable=False)
    slots = Column(Text, nullable=False)  # JSON string: [{dag, maaltijd_type, recept_id, recept_naam}]
    aangemaakt_op = Column(DateTime, default=datetime.utcnow)
```

Gebruik `Text` (niet JSONB) zodat het werkt zonder PostgreSQL JSON operators — serialize/deserialize in de API laag met `json.loads` / `json.dumps`.

**1.2 — Database migratie uitvoeren**

Voer op de productie-database uit (PostgreSQL op `192.168.0.170:5432`, database `chef_agent`):
```sql
CREATE TABLE week_plan_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    naam TEXT NOT NULL,
    slots TEXT NOT NULL,
    aangemaakt_op TIMESTAMP DEFAULT now()
);
```

Geen Alembic — directe SQL via `psql` of het `db_execute` MCP tool.

**1.3 — Bonnetjes client uitbreiden**

Bestand: `backend/bonnetjes/client.py`

Twee nieuwe functies toevoegen (zelfde patroon als `lookup_prices`):

```python
async def get_all_balances() -> list[dict]:
    """Haal alle voorraadbalansen op van Bonnetjes. Returns [{product_id, product_name, quantity, ...}]."""
    if not settings.bonnetjes_url:
        return []
    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            resp = await client.get(f"{settings.bonnetjes_url}/api/stock/balances")
            resp.raise_for_status()
            return resp.json()
    except Exception as e:
        logger.warning("Bonnetjes get_all_balances failed: %s", e)
        return []


async def add_stock(product_id: int, quantity: float = 1.0) -> bool:
    """Voeg voorraad toe aan een product in Bonnetjes."""
    if not settings.bonnetjes_url:
        return False
    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            resp = await client.post(
                f"{settings.bonnetjes_url}/api/stock/in-by-id",
                json={"product_id": product_id, "quantity": quantity},
            )
            resp.raise_for_status()
            return True
    except Exception as e:
        logger.warning("Bonnetjes add_stock failed: %s", e)
        return False
```

### Verificatie
- `grep -n "WeekPlanTemplate" backend/db/models.py` → vindt de klasse
- `grep -n "get_all_balances\|add_stock" backend/bonnetjes/client.py` → vindt beide functies
- Handmatig: `psql` op 192.168.0.170 → `\d week_plan_templates` → tabel bestaat

---

## Phase 2: Recipe delete in UI

**Doel:** Delete-knop toevoegen aan RecipeDetail, mobile + desktop.

### Taken

**2.1 — Handler toevoegen aan RecipeDetail.jsx**

Bestand: `frontend/src/pages/RecipeDetail.jsx`

1. `deleteRecipe` importeren uit `../api/client` (bestaat al in client.js, regel 13-14)
2. State toevoegen: `const [deleting, setDeleting] = useState(false)`
3. Handler toevoegen (zelfde patroon als `handleDeductStock` op regel 189-196):
```javascript
async function handleDelete() {
  if (!window.confirm(`Recept "${recipe.naam}" definitief verwijderen?`)) return;
  setDeleting(true);
  try {
    await deleteRecipe(recipe.id);
    navigate('/recepten');
  } finally {
    setDeleting(false);
  }
}
```
4. Knop toevoegen onderaan de mobile-sectie (na de AI-groep) en de desktop-sectie — rode destructieve stijl:
```jsx
<div className="px-4 mt-4 mb-2">
  <button
    onClick={deleting ? undefined : handleDelete}
    disabled={deleting}
    className="w-full flex items-center justify-center gap-2 py-[11px] rounded-[12px] text-[15px] font-semibold disabled:opacity-50"
    style={{ background: 'rgba(255,59,48,0.1)', color: '#ff3b30' }}
  >
    <Trash2 size={16} />
    {deleting ? "Verwijderen…" : "Verwijder recept"}
  </button>
</div>
```
5. `Trash2` importeren uit `lucide-react` (toevoegen aan bestaande import-regel)

### Verificatie
- Open een recept in de browser → scroll naar onderen → "Verwijder recept" knop zichtbaar
- Klik → confirm dialog → accepteer → navigeert naar `/recepten`
- Recept verdwenen uit de lijst

---

## Phase 3: Voorraad backend endpoints

**Doel:** Chef-agent endpoints voor stock-balances ophalen, toevoegen en aftrekken op product_id.

### Taken

**3.1 — Nieuwe endpoints aan product_mappings.py toevoegen**

Bestand: `backend/api/product_mappings.py`

Voeg toe (gebruik `get_all_balances` en bestaande `deduct_stock` patronen):

```python
from backend.bonnetjes.client import lookup_prices, get_all_balances, add_stock as bonnetjes_add_stock

@router.get("/stock-balances")
async def stock_balances():
    """Alle Bonnetjes voorraadbalansen ophalen (qty > 0 filtering in frontend)."""
    return await get_all_balances()


class StockDirectIn(BaseModel):
    product_id: int
    quantity: float = 1.0


@router.post("/add-stock-direct")
async def add_stock_direct(body: StockDirectIn):
    ok = await bonnetjes_add_stock(body.product_id, body.quantity)
    if not ok:
        raise HTTPException(status_code=502, detail="Bonnetjes niet bereikbaar")
    return {"status": "ok"}


@router.post("/deduct-stock-direct")
async def deduct_stock_direct(body: StockDirectIn):
    if not settings.bonnetjes_url:
        raise HTTPException(status_code=503, detail="Bonnetjes niet geconfigureerd")
    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            resp = await client.post(
                f"{settings.bonnetjes_url}/api/stock/out-by-id",
                json={"product_id": body.product_id, "quantity": body.quantity},
            )
            resp.raise_for_status()
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"Bonnetjes fout: {e}")
    return {"status": "ok"}
```

**3.2 — "Suggereer recept" endpoint toevoegen aan recipes.py**

Bestand: `backend/api/recipes.py`

Voeg toe na de bestaande fill-endpoints:

```python
@router.post("/suggest-from-stock")
async def suggest_from_stock(db: Session = Depends(get_db)):
    """
    Geeft een Claude-gegenereerd receptvoorstel op basis van voorraad-items
    die in geen enkel bestaand recept voorkomen.
    """
    from backend.bonnetjes.client import get_all_balances
    from backend.ai.claude_client import suggest_recipe_from_stock as _suggest

    balances = await get_all_balances()
    in_stock_ids = {b["product_id"] for b in balances if b.get("quantity", 0) > 0}

    # Vind gemapte voorraad-items
    mappings = db.query(IngredientProductMapping).filter(
        IngredientProductMapping.bonnetjes_product_id.in_(in_stock_ids)
    ).all()

    if not mappings:
        raise HTTPException(status_code=404, detail="Geen gemapte voorraad gevonden")

    # Vind welke items in geen enkel recept zitten
    all_recipes = db.query(Recipe).filter(Recipe.ingredienten != None).all()
    used_ingredients = set()
    for recipe in all_recipes:
        for line in (recipe.ingredienten or "").splitlines():
            used_ingredients.add(line.strip().lower())

    orphaned = [
        m.bonnetjes_product_name for m in mappings
        if not any(m.bonnetjes_product_name.lower() in ing for ing in used_ingredients)
    ]

    if len(orphaned) < 3:
        raise HTTPException(status_code=404, detail="Niet genoeg ongebruikte voorraad voor suggestie")

    result = await _suggest(orphaned)
    return result  # {"naam": "...", "ingredienten": "...", "beschrijving": "..."}
```

**3.3 — `suggest_recipe_from_stock` functie toevoegen aan claude_client.py**

Bestand: `backend/ai/claude_client.py`

Patroon: zelfde als `generate_ingredients_claude` (regels 48-61):

```python
async def suggest_recipe_from_stock(orphaned_products: list[str]) -> dict:
    products_str = ", ".join(orphaned_products)
    message = await _client.messages.create(
        model="claude-haiku-4-5-20251001",
        max_tokens=400,
        messages=[{
            "role": "user",
            "content": (
                f"Maak een receptsuggestie op basis van deze producten die ik op voorraad heb: {products_str}. "
                "Geef terug als JSON: "
                '{"naam": "...", "beschrijving": "...", "ingredienten": "ingrediënt1\\ningredient2\\n..."}'
                " Alleen JSON, geen uitleg."
            )
        }],
    )
    raw = message.content[0].text.strip()
    try:
        start = raw.find("{")
        end = raw.rfind("}") + 1
        return json.loads(raw[start:end])
    except (json.JSONDecodeError, ValueError):
        logger.warning("suggest_recipe_from_stock: kon JSON niet parsen: %r", raw)
        return {"naam": "Recept op basis van voorraad", "beschrijving": "", "ingredienten": "\n".join(orphaned_products)}
```

### Verificatie
- `curl http://localhost:8000/api/product-mappings/stock-balances` → lijst van producten
- `grep -n "stock-balances\|add-stock-direct\|deduct-stock-direct" backend/api/product_mappings.py` → drie endpoints
- `grep -n "suggest_recipe_from_stock" backend/ai/claude_client.py` → functie aanwezig

---

## Phase 4: Voorraad frontend pagina

**Doel:** Nieuwe `/voorraad` pagina met stock-lijst, +/- knoppen, receptmatching en suggestie.

### Taken

**4.1 — API calls toevoegen aan client.js**

Bestand: `frontend/src/api/client.js`

Patroon: zelfde als bestaande calls (regel 7-35):

```javascript
export const getStockBalances = () =>
  api.get("/api/product-mappings/stock-balances").then((r) => r.data);

export const addStockDirect = (productId, quantity = 1) =>
  api.post("/api/product-mappings/add-stock-direct", { product_id: productId, quantity }).then((r) => r.data);

export const deductStockDirect = (productId, quantity = 1) =>
  api.post("/api/product-mappings/deduct-stock-direct", { product_id: productId, quantity }).then((r) => r.data);

export const suggestRecipeFromStock = () =>
  api.post("/api/recipes/suggest-from-stock").then((r) => r.data);
```

**4.2 — Voorraad.jsx pagina aanmaken**

Bestand: `frontend/src/pages/Voorraad.jsx` (nieuw)

Structuur volgt `Recipes.jsx` pattern (mobile + desktop via `lg:hidden` / `hidden lg:block`):

- **State:** `balances` (array), `loading`, `suggesting`
- **useEffect:** `getStockBalances()` bij mount → filter `quantity > 0` → sla op in state
- **Per-product rij:** productnaam, hoeveelheid, `−` knop (roept `deductStockDirect` aan → herlaad), `+` knop (roept `addStockDirect` aan → herlaad)
- **"Wat kun je maken?" sectie:** Aparte fetch `getRecipes()` → score elke recept op basis van hoeveel ingrediëntenregels overeenkomen met productnamen in `balances` → sorteer → toon top 10
- **"Suggereer recept" knop:** Alleen zichtbaar als ≥3 producten — `suggestRecipeFromStock()` → navigeer naar `/recepten/nieuw` met state `{prefill: result}` → RecipeForm leest dit uit `location.state`

**4.3 — Route toevoegen aan App.jsx**

Bestand: `frontend/src/App.jsx`

```jsx
import Voorraad from "./pages/Voorraad";
// ...
<Route path="/voorraad" element={<Voorraad />} />
```

**4.4 — Navigatie toevoegen**

Bestand: `frontend/src/components/IOSPrimitives.jsx`, `TAB_ITEMS` array (regel 133-139):
```javascript
{ id: 'voorraad', label: 'Voorraad', to: '/voorraad', Icon: Package },
```
Import `Package` uit `lucide-react` (toevoegen aan import-regel).

Bestand: `frontend/src/components/DesktopShell.jsx`, `NAV_ITEMS` array (regel 53-59):
```javascript
{ id: 'voorraad', label: 'Voorraad', to: '/voorraad', Icon: Package },
```
Import `Package` toevoegen.

**4.5 — RecipeForm voorinvullen vanuit suggestie**

Bestand: `frontend/src/pages/RecipeForm.jsx`

In de `useEffect` die het formulier initialiseert (regel 63-66), voeg toe:
```javascript
import { useLocation } from "react-router-dom";
// ...
const location = useLocation();
useEffect(() => {
  if (location.state?.prefill) {
    setForm(f => ({ ...f, ...toFormValues(location.state.prefill) }));
  }
}, []);
```

### Verificatie
- Navigeer naar `/voorraad` → pagina laadt, toont producten met qty > 0
- Klik `−` op een product → hoeveelheid daalt (of verdwijnt bij 0)
- Klik `+` → hoeveelheid stijgt
- "Wat kun je maken?" sectie toont recepten gerankt
- "Suggereer recept" opent RecipeForm met vooringevulde data

---

## Phase 5: AI Weekplan generator backend

**Doel:** Ollama/Claude hybride endpoint dat een weekplan genereert op basis van voorraad.

### Taken

**5.1 — `select_recipe_for_slot` toevoegen aan ollama_client.py**

Bestand: `backend/ai/ollama_client.py`

Patroon: zelfde als `estimate_macros` (JSON output, defensive parse):

```python
SELECT_SLOT_PROMPT = """Kies het beste recept voor {meal_type} op basis van deze opties (gesorteerd op voorraad-score):
{options}

Geef terug als JSON: {{"recept": "<exacte naam uit de lijst>"}}
Alleen JSON, geen uitleg."""


async def select_recipe_for_slot(meal_type: str, candidates: list[dict]) -> str | None:
    """Kies via Ollama het beste recept voor een slot. Returns receptnaam of None bij falen."""
    options = "\n".join(
        f"- {c['naam']} (score: {c['score']:.0%})" for c in candidates
    )
    prompt = SELECT_SLOT_PROMPT.format(meal_type=meal_type, options=options)
    try:
        raw = await ollama_chat(prompt)
        start = raw.find("{")
        end = raw.rfind("}") + 1
        data = json.loads(raw[start:end])
        return data.get("recept")
    except Exception:
        logger.warning("select_recipe_for_slot: Ollama keuze mislukt, val terug op top-1")
        return None
```

**5.2 — `generate_week_plan` toevoegen aan agent.py**

Bestand: `backend/ai/agent.py`

```python
async def generate_week_plan(
    meal_types: list[str],
    locked_slots: dict,  # {dag: {meal_type: recept_id}}
    stock: list[dict],   # Bonnetjes balances
    recipes: list,       # Recipe ORM objecten
) -> list[dict]:
    """
    Genereert een weekplan als lijst van {dag, maaltijd_type, recept_id, recept_naam, score}.
    Locked slots worden niet overschreven.
    """
    from backend.ai.ollama_client import select_recipe_for_slot

    DAYS = ["maandag", "dinsdag", "woensdag", "donderdag", "vrijdag", "zaterdag", "zondag"]
    CATEGORY_MAP = {
        "ontbijt": "ontbijt", "lunch": "lunch", "snack": "snack",
        "diner": "diner", "avondsnack": "snack",
    }

    in_stock_names = {
        b["product_name"].lower() for b in stock if b.get("quantity", 0) > 0
    }

    def score_recipe(recipe) -> float:
        lines = [l.strip().lower() for l in (recipe.ingredienten or "").splitlines() if l.strip()]
        if not lines:
            return 0.0
        matches = sum(1 for line in lines if any(name in line for name in in_stock_names))
        return matches / len(lines)

    result = []
    for dag in DAYS:
        for meal_type in meal_types:
            locked = locked_slots.get(dag, {}).get(meal_type)
            if locked:
                result.append({"dag": dag, "maaltijd_type": meal_type, "recept_id": str(locked), "recept_naam": None, "score": 1.0})
                continue

            categorie = CATEGORY_MAP.get(meal_type, meal_type)
            candidates = [
                {"naam": r.naam, "id": str(r.id), "score": score_recipe(r)}
                for r in recipes if r.categorie == categorie
            ]
            candidates.sort(key=lambda x: x["score"], reverse=True)
            top5 = candidates[:5]

            if not top5:
                continue

            chosen_naam = await select_recipe_for_slot(meal_type, top5)
            chosen = next((c for c in top5 if c["naam"] == chosen_naam), top5[0])
            result.append({
                "dag": dag,
                "maaltijd_type": meal_type,
                "recept_id": chosen["id"],
                "recept_naam": chosen["naam"],
                "score": chosen["score"],
            })

    return result
```

**5.3 — `POST /api/meal-plans/generate` endpoint**

Bestand: `backend/api/meal_plans.py`

```python
class GenerateWeekPlanIn(BaseModel):
    meal_types: list[str]
    locked_slots: dict = {}  # {dag: {meal_type: recept_id_str}}


@router.post("/generate")
async def generate_week_plan(payload: GenerateWeekPlanIn, db: Session = Depends(get_db)):
    from backend.ai.agent import generate_week_plan as _generate
    from backend.bonnetjes.client import get_all_balances

    stock = await get_all_balances()
    recipes = db.query(Recipe).filter(Recipe.ingredienten != None).all()

    slots = await _generate(
        meal_types=payload.meal_types,
        locked_slots=payload.locked_slots,
        stock=stock,
        recipes=recipes,
    )

    # Verrijk met recept-details
    recipe_map = {str(r.id): r for r in recipes}
    for slot in slots:
        rid = slot.get("recept_id")
        if rid and rid in recipe_map:
            r = recipe_map[rid]
            slot["recept_naam"] = r.naam
            slot["kcal"] = r.kcal
            slot["eiwit_g"] = r.eiwit_g
            slot["image_url"] = r.image_url

    return {"slots": slots}
```

### Verificatie
- `grep -n "select_recipe_for_slot" backend/ai/ollama_client.py` → functie aanwezig
- `grep -n "generate_week_plan" backend/ai/agent.py` → functie aanwezig
- `grep -n "generate" backend/api/meal_plans.py` → endpoint aanwezig
- POST naar `/api/meal-plans/generate` met `{"meal_types": ["diner"]}` → retourneert slots

---

## Phase 6: AI Weekplan generator frontend

**Doel:** Nieuw `/weekplan/genereren` scherm met 3-stappen UI.

### Taken

**6.1 — API calls toevoegen aan client.js**

```javascript
export const generateWeekPlan = (mealTypes, lockedSlots = {}) =>
  api.post("/api/meal-plans/generate", { meal_types: mealTypes, locked_slots: lockedSlots }).then((r) => r.data);

export const applyWeekPlan = (week, slots) =>
  api.post(`/api/meal-plans/apply?week=${week}`, { slots }).then((r) => r.data);
```

**6.2 — `POST /api/meal-plans/apply` endpoint toevoegen**

Bestand: `backend/api/meal_plans.py`

```python
class ApplyWeekPlanIn(BaseModel):
    slots: list[dict]  # [{dag, maaltijd_type, recept_id}]


@router.post("/apply")
def apply_week_plan(week: int, payload: ApplyWeekPlanIn, db: Session = Depends(get_db)):
    for slot in payload.slots:
        if not slot.get("recept_id"):
            continue
        entry = db.query(MealPlan).filter(
            MealPlan.cyclus_week == week,
            MealPlan.dag == slot["dag"],
            MealPlan.maaltijd_type == slot["maaltijd_type"],
        ).first()
        if entry:
            entry.recept_id = uuid.UUID(slot["recept_id"])
        else:
            db.add(MealPlan(
                cyclus_week=week,
                dag=slot["dag"],
                maaltijd_type=slot["maaltijd_type"],
                recept_id=uuid.UUID(slot["recept_id"]),
            ))
    db.commit()
    return {"status": "ok", "applied": len(payload.slots)}
```

**6.3 — WeekPlanGenerator.jsx aanmaken**

Bestand: `frontend/src/pages/WeekPlanGenerator.jsx` (nieuw)

Drie stappen als state machine (`step: "config" | "loading" | "review"`):

**Stap "config":**
- Checkboxes voor `["ontbijt", "lunch", "snack", "diner", "avondsnack"]`
- Knop "Genereer met AI" → zet `step = "loading"`, roept `generateWeekPlan(selectedTypes)` aan

**Stap "loading":**
- Spinner + tekst "AI is bezig met plannen…"

**Stap "review":**
- Per dag een kolom met de gegenereerde slots
- Per slot: receptnaam + voorraad-score badge (`Math.round(score * 100)%`)
- Knop "Toepassen op week X" → `applyWeekPlan(currentWeek, slots)` → navigeer naar `/weekplan`
- Knop "Opslaan als template" → toont input voor naam → `saveTemplate(naam, slots)` → bevestiging

**6.4 — Route + toegangsknop toevoegen**

Bestand: `frontend/src/App.jsx`:
```jsx
import WeekPlanGenerator from "./pages/WeekPlanGenerator";
// ...
<Route path="/weekplan/genereren" element={<WeekPlanGenerator />} />
```

Bestand: `frontend/src/pages/WeekPlan.jsx` — knop toevoegen in de header-accessory:
```jsx
<button onClick={() => navigate('/weekplan/genereren')} ...>
  <Wand2 size={14} /> Genereer weekplan
</button>
```

### Verificatie
- Navigeer naar `/weekplan` → "Genereer weekplan" knop zichtbaar
- Klik → `/weekplan/genereren` laadt config scherm
- Selecteer meal types → "Genereer met AI" → loading state → review met scores
- "Toepassen op week X" → navigeert naar `/weekplan`, slots ingevuld

---

## Phase 7: Templates backend

**Doel:** CRUD endpoints voor weekplan templates.

### Taken

**7.1 — `backend/api/templates.py` aanmaken**

```python
import json
import uuid
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional

from backend.db.session import get_db
from backend.db.models import WeekPlanTemplate, MealPlan

router = APIRouter()


class TemplateIn(BaseModel):
    naam: str
    slots: list[dict]  # [{dag, maaltijd_type, recept_id, recept_naam}]


class TemplateOut(BaseModel):
    id: uuid.UUID
    naam: str
    slot_count: int
    aangemaakt_op: Optional[str] = None

    model_config = {"from_attributes": True}


@router.get("", response_model=list[TemplateOut])
def list_templates(db: Session = Depends(get_db)):
    templates = db.query(WeekPlanTemplate).order_by(WeekPlanTemplate.aangemaakt_op.desc()).all()
    return [
        TemplateOut(
            id=t.id,
            naam=t.naam,
            slot_count=len(json.loads(t.slots)),
            aangemaakt_op=t.aangemaakt_op.isoformat() if t.aangemaakt_op else None,
        )
        for t in templates
    ]


@router.post("", status_code=201)
def create_template(body: TemplateIn, db: Session = Depends(get_db)):
    t = WeekPlanTemplate(naam=body.naam, slots=json.dumps(body.slots))
    db.add(t)
    db.commit()
    db.refresh(t)
    return {"id": str(t.id), "naam": t.naam}


@router.delete("/{template_id}", status_code=204)
def delete_template(template_id: uuid.UUID, db: Session = Depends(get_db)):
    t = db.query(WeekPlanTemplate).filter(WeekPlanTemplate.id == template_id).first()
    if not t:
        raise HTTPException(status_code=404, detail="Template niet gevonden")
    db.delete(t)
    db.commit()


@router.post("/{template_id}/apply")
def apply_template(template_id: uuid.UUID, week: int, db: Session = Depends(get_db)):
    t = db.query(WeekPlanTemplate).filter(WeekPlanTemplate.id == template_id).first()
    if not t:
        raise HTTPException(status_code=404, detail="Template niet gevonden")

    slots = json.loads(t.slots)
    for slot in slots:
        if not slot.get("recept_id"):
            continue
        entry = db.query(MealPlan).filter(
            MealPlan.cyclus_week == week,
            MealPlan.dag == slot["dag"],
            MealPlan.maaltijd_type == slot["maaltijd_type"],
        ).first()
        if entry:
            entry.recept_id = uuid.UUID(slot["recept_id"])
        else:
            db.add(MealPlan(
                cyclus_week=week,
                dag=slot["dag"],
                maaltijd_type=slot["maaltijd_type"],
                recept_id=uuid.UUID(slot["recept_id"]),
            ))
    db.commit()
    return {"status": "ok", "applied": len(slots)}
```

**7.2 — Router registreren in main.py**

Bestand: `backend/main.py`

```python
from backend.api import templates
# ...
app.include_router(templates.router, prefix="/api/templates", tags=["templates"])
```

### Verificatie
- `grep -n "templates" backend/main.py` → router geregistreerd
- `curl http://localhost:8000/api/templates` → lege lijst `[]`
- POST + GET + DELETE cyclus handmatig testen

---

## Phase 8: Templates frontend

**Doel:** "Opslaan als template" in WeekPlanGenerator + "Laad template" in WeekPlan.

### Taken

**8.1 — API calls toevoegen aan client.js**

```javascript
export const getTemplates = () =>
  api.get("/api/templates").then((r) => r.data);

export const saveTemplate = (naam, slots) =>
  api.post("/api/templates", { naam, slots }).then((r) => r.data);

export const deleteTemplate = (id) =>
  api.delete(`/api/templates/${id}`);

export const applyTemplate = (id, week) =>
  api.post(`/api/templates/${id}/apply?week=${week}`).then((r) => r.data);
```

**8.2 — "Opslaan als template" flow in WeekPlanGenerator.jsx**

In de review-stap, bij klik op "Opslaan als template":
1. Toon een inline tekstveld voor de naam
2. Bij bevestigen: roep `saveTemplate(naam, slots)` aan
3. Toon korte bevestiging "Template opgeslagen!"

**8.3 — "Laad template" in WeekPlan.jsx**

Bestand: `frontend/src/pages/WeekPlan.jsx`

1. Knop "Laad template" toevoegen naast "Genereer weekplan"
2. State `showTemplates: boolean` + `templates: []`
3. Bij open: `getTemplates()` → toon modal/sheet met lijst
4. Per template: naam, datum, slot-count + "Laden" knop
5. Bij "Laden": `window.confirm()` als huidige week al gevuld is → `applyTemplate(id, currentWeek)` → herlaad weekplan

### Verificatie
- WeekPlanGenerator review-stap → "Opslaan als template" → naam invullen → bevestigen
- WeekPlan pagina → "Laad template" → lijst zichtbaar met opgeslagen template
- Template laden → weekplan bijgewerkt

---

## Phase 9: Bonnetjes app uitbreiden

**Doel:** `POST /api/stock/in-by-id` endpoint toevoegen in de Bonnetjes app.

> **Let op:** De Bonnetjes app zit in een **aparte GitHub repo** en draait op LXC 111 (192.168.0.61). Deploy via git push naar master. De source is niet aanwezig in dit project — wijzig via de Bonnetjes repo.

### Taak

Voeg in de Bonnetjes app een endpoint toe vergelijkbaar met het bestaande `POST /api/stock/out-by-id`:

```
POST /api/stock/in-by-id
Body: { "product_id": 123, "quantity": 1.0 }
Gedrag: verhoogt de voorraad van product_id met quantity
Response: { "status": "ok" }
```

Het exacte implementatiepatroon hangt af van de Bonnetjes app stack — volg het patroon van het bestaande `out-by-id` endpoint.

### Verificatie
- `curl -X POST http://192.168.0.61:<port>/api/stock/in-by-id -d '{"product_id": X, "quantity": 1}'` → `{"status": "ok"}`
- Bonnetjes app toont verhoogde voorraad voor het product

---

## Phase 10: Eindverificatie

### Checklist

**Recipe delete:**
- [ ] Delete-knop zichtbaar in RecipeDetail (mobile + desktop)
- [ ] Confirm dialog verschijnt
- [ ] Na bevestiging: recept verwijderd, navigeert naar `/recepten`

**Voorraad pagina:**
- [ ] `/voorraad` laadt en toont producten met qty > 0
- [ ] `−` knop trekt af, `+` knop voegt toe, beide in sync met Bonnetjes
- [ ] "Wat kun je maken?" toont recepten gerankt
- [ ] "Suggereer recept" verschijnt bij ≥3 ongebruikte voorraad-items
- [ ] Suggestie opent RecipeForm met vooringevulde data

**AI Weekplan generator:**
- [ ] `/weekplan/genereren` bereikbaar via WeekPlan pagina
- [ ] Meal types selecteerbaar, handmatige slots mogelijk
- [ ] Genereer → loading → review met voorraad-scores
- [ ] "Toepassen op week X" schrijft naar DB, weekplan bijgewerkt
- [ ] "Opslaan als template" slaat op met naam

**Templates:**
- [ ] Templates opgeslagen en terug te vinden via "Laad template"
- [ ] Template laden overschrijft de huidige week (met confirm)

**Anti-patterns check:**
- [ ] `grep -rn "axios.get\|axios.post" frontend/src` → geen directe axios calls (altijd via `api` instance)
- [ ] `grep -rn "db.flush()" backend/` → geen losse flush zonder commit
- [ ] `grep -rn "claude-sonnet\|claude-opus" backend/ai/claude_client.py` → Haiku voor generatie, Sonnet alleen voor schema-integratie
