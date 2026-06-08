# Design: Recipe Delete, Voorraad Pagina, AI Weekplan Generator + Templates

**Datum:** 2026-06-08  
**Status:** Goedgekeurd

## Scope

Vier features:
1. **Recipe delete** — delete-knop in de UI (backend bestaat al)
2. **Voorraad pagina** — stock inzien en beheren, gesynchroniseerd met Bonnetjes
3. **AI weekplan generator** — nieuw scherm, hybride score + Ollama/Claude aanpak
4. **Weekplan templates** — opslaan en hergebruiken van gegenereerde weekplannen

---

## 1. Recipe Delete

### Wat
Een "Verwijder recept" knop in `RecipeDetail.jsx`, zowel mobile als desktop.

### Gedrag
- Knop staat onderaan de detailpagina
- Na klikken: een browser `confirm()` dialog om per ongeluk verwijderen te voorkomen
- Bij bevestiging: `DELETE /api/recipes/{id}` aanroepen
- Na succes: navigeer naar `/recepten`
- De bestaande backend koppelt wiki-sync automatisch aan de delete

### Wijzigingen
- `frontend/src/pages/RecipeDetail.jsx` — knop + handler toevoegen
- `frontend/src/api/client.js` — `deleteRecipe` bestaat al

---

## 2. Voorraad Pagina

### Wat
Nieuwe pagina `/voorraad` die de live Bonnetjes-voorraad toont en beheert.

### Route & navigatie
- Route `/voorraad` toevoegen aan `App.jsx`
- Tab-balk item toevoegen in `IOSTabBar` en `DesktopShell` sidebar

### Data
- Haalt voorraad op via nieuw Chef-agent endpoint `GET /api/product-mappings/stock-balances` dat Bonnetjes `GET /api/stock/balances` proxied
- Toont alleen producten met `quantity > 0`
- Realtime: elke page-load herlaadt de balances

### Stock beheer (per product-rij)
De Voorraad pagina werkt met Bonnetjes `product_id` direct (niet via ingrediëntnamen). Bestaande `deduct-stock` en `stock-status` endpoints gebruiken ingrediëntnamen — die zijn niet bruikbaar hier.

Nieuwe directe endpoints in `product_mappings.py`:
- `−` knop → `POST /api/product-mappings/deduct-stock-direct` met `{product_id, quantity: 1}`
- `+` knop → `POST /api/product-mappings/add-stock-direct` met `{product_id, quantity: 1}`

Beide proxyen naar Bonnetjes (`out-by-id` / `in-by-id`), updaten lokale state optimistisch en herbevestigen via herlaad.

### "Wat kun je maken?" sectie
- Toont recepten gerankt op voorraad-dekking: `(gematchte ingrediënten / totaal ingrediënten) * 100%`
- Matching via `IngredientProductMapping` tabel
- Klikken op recept opent `RecipeDetail`

### "Suggereer recept" knop
- Verschijnt als er ≥3 gemapte voorraad-items zijn die in geen enkel bestaand recept voorkomen
- Roept `POST /api/recipes/suggest-from-stock` aan (Claude Haiku)
- Backend stuurt Claude: de ongebruikte voorraad-items als ingrediëntenlijst, vraagt een receptnaam + ingrediëntenlijst terug
- Frontend opent RecipeForm met de gegenereerde data vooringevuld

### Backend wijzigingen
- `backend/bonnetjes/client.py` — `add_stock(product_id, quantity)` en `get_all_balances()` functies
- `backend/api/product_mappings.py` — `GET /stock-balances`, `POST /add-stock-direct`, `POST /deduct-stock-direct` endpoints
- `backend/api/recipes.py` — `POST /suggest-from-stock` endpoint (Claude Haiku)

---

## 3. AI Weekplan Generator

### Route
`/weekplan/genereren` — nieuw scherm, bereikbaar via knop op WeekPlan pagina.

### Stap 1 — Configuratie UI
- Checkboxes per maaltijdtype: ontbijt, lunch, snack, diner, avondsnack
- Per geselecteerd type: optioneel handmatig een recept invullen per dag (zelfde picker als bestaande WeekPlan pagina)
- Handmatig ingevulde slots worden door de AI niet overschreven
- Knop "Genereer met AI"

### Stap 2 — AI-generatie (backend)

Nieuw endpoint `POST /api/meal-plans/generate`:

```
Input:
  - meal_types: list[str]  # geselecteerde types
  - locked_slots: dict     # dag → maaltijdtype → recept_id (handmatig ingevuld)

Output:
  - WeekPlan object (zelfde structuur als GET /week/{n})
```

**Algoritme:**
1. Haal live voorraad op van Bonnetjes (`GET /api/stock/balances`)
2. Bereken voor elk recept een **voorraad-score**: aantal ingrediënten in `IngredientProductMapping` met qty > 0 gedeeld door totaal aantal ingrediënten
3. Voor elk leeg slot (dag × maaltijdtype):
   a. Neem top-5 recepten op score voor dat categorie-type. Mapping: `diner`→diner, `lunch`→lunch, `ontbijt`→ontbijt, `snack`→snack, `avondsnack`→snack
   b. Bouw een korte Ollama-prompt: receptnamen + scores, vraag beste keuze als JSON `{"recept": "naam"}`
   c. Als Ollama faalt of ongeldige JSON geeft → kies automatisch het hoogst scorende recept (geen Claude call voor selectie, want top-1 is al goed genoeg)
   d. Als Ollama structureel onbeschikbaar is → Claude Haiku fallback voor de hele generate-aanvraag
4. Retourneer voorgesteld weekplan (nog niet opgeslagen in DB)

**AI routing:**
- Ollama (`llama3.1:8b`) voor slot-selectie: korte prompt, goede kans op succes
- Als Ollama binnen 30s geen geldige response geeft → Claude Haiku
- Nieuwe functie in `backend/ai/agent.py`: `generate_week_plan(meal_types, locked_slots, stock, recipes)`

### Stap 3 — Review UI
- Toont het voorstel per dag, per slot: receptnaam + voorraad-score badge (bijv. "5/8 in huis")
- Gebruiker kan individuele slots nog wisselen via dezelfde picker
- Twee akties:
  - **"Toepassen op week X"** → schrijft naar `meal_plans` tabel voor de huidige cyclus-week
  - **"Opslaan als template"** → vraagt naam, slaat op in `week_plan_templates`

---

## 4. Weekplan Templates

### Database
Nieuwe tabel `week_plan_templates`:

```sql
id          UUID PRIMARY KEY
naam        TEXT NOT NULL
slots       JSONB NOT NULL  -- [{dag, maaltijd_type, recept_id, recept_naam}]
aangemaakt_op TIMESTAMP
```

### Backend endpoints
- `GET /api/templates` — lijst van alle templates (id, naam, aangemaakt_op, aantal slots)
- `POST /api/templates` — opslaan van een weekplan als template
- `DELETE /api/templates/{id}` — verwijder template
- `POST /api/templates/{id}/apply?week={n}` — schrijf slots naar `meal_plans` voor week n (overschrijft bestaande slots voor die week)

### Frontend — WeekPlan pagina
- "Genereer weekplan" knop → navigeert naar `/weekplan/genereren`
- "Laad template" knop → toont een modal/sheet met lijst van opgeslagen templates, klik laadt het toe op de huidige week (met confirm als slots al gevuld zijn)

---

## Technische afhankelijkheden

| Feature | Vereist wijziging Bonnetjes app |
|---|---|
| Voorraad aftrekken | Nee (bestaat al) |
| Voorraad toevoegen | Ja — nieuw `POST /api/stock/in-by-id` endpoint in Bonnetjes |
| Overige features | Nee |

De Bonnetjes app draait op dezelfde VM (LXC 111, 192.168.0.61) en deployed via GitHub push naar master.

---

## Wijzigingen overzicht

### Backend (nieuw/gewijzigd)
- `backend/db/models.py` — `WeekPlanTemplate` model toevoegen
- `backend/api/recipes.py` — `POST /suggest-from-stock` endpoint
- `backend/api/product_mappings.py` — `POST /add-stock` endpoint
- `backend/api/meal_plans.py` — `POST /generate` endpoint
- `backend/api/templates.py` — nieuw bestand, CRUD voor templates
- `backend/ai/agent.py` — `generate_week_plan()` functie
- `backend/ai/ollama_client.py` — `select_recipe_for_slot()` functie
- `backend/bonnetjes/client.py` — `add_stock()` functie
- `backend/main.py` — templates router registreren

### Frontend (nieuw/gewijzigd)
- `frontend/src/pages/RecipeDetail.jsx` — delete knop
- `frontend/src/pages/Voorraad.jsx` — nieuw
- `frontend/src/pages/WeekPlanGenerator.jsx` — nieuw
- `frontend/src/App.jsx` — routes voor `/voorraad` en `/weekplan/genereren`
- `frontend/src/components/IOSPrimitives.jsx` — voorraad tab-item
- `frontend/src/components/DesktopShell.jsx` — voorraad nav-item
- `frontend/src/api/client.js` — nieuwe API calls

### Bonnetjes app (apart deployen)
- Nieuw endpoint `POST /api/stock/in-by-id`
