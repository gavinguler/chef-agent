# Plan: Voorraadintegratie Chef Agent ↔ Bonnetjes

**Datum:** 2026-06-01  
**Doel:** Toon per ingrediënt in recepten of het op voorraad is (via Bonnetjes), en laat de gebruiker voorraad aftrekken vanuit Chef Agent.

## Bronnen / bestaande patronen

| Bestand | Wat het biedt |
|---------|--------------|
| `Bonnetjes app/app/main.py:788-803` | `POST /api/stock/add` — patroon voor voorraad mutatie met product_id |
| `Bonnetjes app/app/main.py:886-902` | `GET /api/stock/balances` — retourneert `[{product_id, product_name, quantity}]` |
| `Bonnetjes app/app/main.py:571-630` | `_record_stock_movement()` — interne helper, aanroepen via endpoints |
| `backend/api/product_mappings.py:60-95` | `resolve-prices` — exact+substring matching logica ingredient → product_id |
| `backend/db/models.py:87-93` | `IngredientProductMapping` — `ingredient_name (PK)` → `bonnetjes_product_id, bonnetjes_product_name` |
| `backend/bonnetjes/client.py` | Bonnetjes HTTP client patroon (httpx, timeout=10s) |

---

## Fase 1 — Bonnetjes: nieuw `POST /api/stock/out-by-id` endpoint

**Bestand:** `Bonnetjes app/app/main.py`  
**Na:** regel 803 (na `stock_add`)

### Wat te implementeren

Kopieer het patroon van `stock_add` (regel 776–803) maar met `movement_type="out"` en source `"chef-agent"`:

```python
class StockOutByIdIn(BaseModel):
    product_id: int
    quantity: float = 1.0

    @field_validator("quantity")
    @classmethod
    def quantity_must_be_positive(cls, v: float) -> float:
        if v <= 0:
            raise ValueError("quantity must be > 0")
        return v


@app.post("/api/stock/out-by-id")
def stock_out_by_id(body: StockOutByIdIn, db: Session = Depends(get_db)):
    product = db.query(Product).filter(Product.id == body.product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product niet gevonden.")
    _, balance = _record_stock_movement(
        db,
        product=product,
        movement_type="out",
        quantity=body.quantity,
        barcode=product.barcode or "",
        source="chef-agent",
        idempotency_key=None,
    )
    db.commit()
    return {"product_id": product.id, "product_name": product.name, "current_stock": round(balance.quantity, 3)}
```

### Verificatie
- `curl -X POST http://192.168.0.61:8000/api/stock/out-by-id -H "Content-Type: application/json" -d '{"product_id": <known_id>, "quantity": 1}'` → HTTP 200
- `GET /api/stock/balances` toont verlaagde hoeveelheid
- `quantity: 0` → HTTP 422

---

## Fase 2 — Chef Agent backend: stock-status + deduct endpoints

**Bestand:** `backend/api/product_mappings.py`

### 2a — `POST /api/product-mappings/stock-status`

Accepteert een lijst ingrediëntnamen, retourneert voor elk gematchte ingrediënt de huidige voorraad.  
Hergebruik de resolve-logica uit `resolve-prices` (regels 60–95).

```python
@router.post("/stock-status")
async def stock_status(ingredient_names: list[str], db: Session = Depends(get_db)):
    """Geeft voor een lijst ingredientnamen de huidige voorraad terug via Bonnetjes."""
    if not ingredient_names or not settings.bonnetjes_url:
        return {}

    all_mappings = db.query(IngredientProductMapping).all()
    resolved: dict[str, dict] = {}
    for name in ingredient_names:
        lower = name.lower()
        match = next((m for m in all_mappings if m.ingredient_name.lower() == lower), None)
        if not match:
            match = next((m for m in all_mappings if m.ingredient_name.lower() in lower), None)
        if match:
            resolved[name] = {
                "product_id": match.bonnetjes_product_id,
                "product_name": match.bonnetjes_product_name,
            }

    if not resolved:
        return {}

    # Haal alle balansen op en filter op bekende product_ids
    product_ids = {info["product_id"] for info in resolved.values()}
    balances: dict[int, float] = {}
    try:
        async with httpx.AsyncClient(timeout=8.0) as client:
            resp = await client.get(f"{settings.bonnetjes_url}/api/stock/balances")
            if resp.status_code == 200:
                for b in resp.json():
                    if b["product_id"] in product_ids:
                        balances[b["product_id"]] = b["quantity"]
    except Exception:
        pass

    return {
        name: {**info, "quantity": balances.get(info["product_id"], 0.0)}
        for name, info in resolved.items()
    }
```

### 2b — `POST /api/product-mappings/deduct-stock`

Accepteert een lijst ingrediëntnamen, trekt 1 stuk af per gematchte ingrediënt.

```python
@router.post("/deduct-stock")
async def deduct_stock(ingredient_names: list[str], db: Session = Depends(get_db)):
    """Trek voorraad af in Bonnetjes voor de gegeven ingrediënten (1 stuk per ingrediënt)."""
    if not ingredient_names or not settings.bonnetjes_url:
        return {"deducted": 0, "skipped": len(ingredient_names)}

    all_mappings = db.query(IngredientProductMapping).all()
    deducted = 0
    skipped = 0
    async with httpx.AsyncClient(timeout=8.0) as client:
        for name in ingredient_names:
            lower = name.lower()
            match = next((m for m in all_mappings if m.ingredient_name.lower() == lower), None)
            if not match:
                match = next((m for m in all_mappings if m.ingredient_name.lower() in lower), None)
            if not match:
                skipped += 1
                continue
            try:
                resp = await client.post(
                    f"{settings.bonnetjes_url}/api/stock/out-by-id",
                    json={"product_id": match.bonnetjes_product_id, "quantity": 1.0},
                )
                if resp.status_code == 200:
                    deducted += 1
                else:
                    skipped += 1
            except Exception:
                skipped += 1

    return {"deducted": deducted, "skipped": skipped}
```

### Verificatie
- `POST /api/product-mappings/stock-status` met bekende ingrediënt → retourneert `{ingredient: {product_id, product_name, quantity}}`
- `POST /api/product-mappings/deduct-stock` → Bonnetjes balance daalt met 1

---

## Fase 3 — Chef Agent frontend: API client

**Bestand:** `frontend/src/api/client.js`

Voeg toe aan het einde:

```javascript
export const getStockStatus = (ingredientNames) =>
  api.post("/api/product-mappings/stock-status", ingredientNames).then((r) => r.data);

export const deductStock = (ingredientNames) =>
  api.post("/api/product-mappings/deduct-stock", ingredientNames).then((r) => r.data);
```

### Verificatie
- `grep -n "getStockStatus\|deductStock" frontend/src/api/client.js` → 2 regels

---

## Fase 4 — Chef Agent frontend: RecipeDetail UI

**Bestand:** `frontend/src/pages/RecipeDetail.jsx`

### State en effect toevoegen

Na de bestaande `ingredientPrices` state:
```javascript
const [stockStatus, setStockStatus] = useState({});
const [deducting, setDeducting] = useState(false);
```

Stock-status ophalen nadat ingrediënten beschikbaar zijn (na bestaand price-resolution effect):
```javascript
useEffect(() => {
  if (!recipe?.ingredienten) return;
  const lines = recipe.ingredienten.split("\n").map(l => l.trim()).filter(Boolean);
  if (!lines.length) return;
  getStockStatus(lines).then(setStockStatus).catch(() => {});
}, [recipe?.ingredienten, mappings]);
```

### Gebruik-handler
```javascript
async function handleDeductStock() {
  if (!recipe?.ingredienten) return;
  setDeducting(true);
  const lines = recipe.ingredienten.split("\n").map(l => l.trim()).filter(Boolean);
  try {
    await deductStock(lines);
    const updated = await getStockStatus(lines);
    setStockStatus(updated);
  } finally {
    setDeducting(false);
  }
}
```

### Per-ingredient badge (inline in de bestaande ingredient-map)

Voor elke ingredient-regel `ing`:
```javascript
const status = stockStatus[ing];
const hasBadge = status !== undefined;
const inStock = hasBadge && status.quantity > 0;
// Toon naast de ingredientnaam:
{hasBadge && (
  <span style={{
    fontSize: 10, fontWeight: 600,
    color: inStock ? '#1f7a4d' : '#dc2626',
    background: inStock ? 'rgba(31,122,77,0.1)' : 'rgba(220,38,38,0.08)',
    borderRadius: 4, padding: '1px 5px', marginLeft: 6,
  }}>
    {inStock ? `✓ ${status.quantity}x` : '✗ mis'}
  </span>
)}
```

### "Gebruik alles" knop

In het ingrediëntenpaneel (desktop én mobile), naast de bestaande AI-genereer knop:
```javascript
{Object.keys(stockStatus).length > 0 && (
  <button onClick={handleDeductStock} disabled={deducting}
    style={{ /* zelfde stijl als bestaande knoppen maar blauw/grijs */ }}>
    {deducting ? "Bezig…" : "Gebruik alles"}
  </button>
)}
```

### Verificatie
- Open een recept met gemapte ingrediënten → groene/rode badges zichtbaar
- "Gebruik alles" klikken → Bonnetjes balance daalt, badges updaten naar rood
- Recept zonder mappings → geen badges, "Gebruik alles" knop niet zichtbaar
- `grep -n "stockStatus\|deductStock\|getStockStatus" frontend/src/pages/RecipeDetail.jsx`

---

## Anti-patronen

- Gebruik `GET /api/stock/balances` (batch), nooit losse calls per product
- Geen barcode nodig in Fase 1 — `product.barcode or ""` is correct, `_normalize_barcode` wordt niet aangeroepen in `_record_stock_movement`
- Ingredients splitten op `"\n"`, niet op komma — dat is het opgeslagen formaat
- Hoeveelheid altijd `1.0` aftrekken, niet parsen uit ingredienttekst
