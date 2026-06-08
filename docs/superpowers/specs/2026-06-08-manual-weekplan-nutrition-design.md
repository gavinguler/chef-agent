# Design: Handmatig Weekplan + Voedingswaarden per Portie

**Datum:** 2026-06-08  
**Status:** Goedgekeurd

## Scope

Twee features:
1. **Handmatig weekplan samenstellen** — nieuw scherm per dag ontbijt/lunch/diner/snack invullen met recepten, opslaan als template of toepassen op een week. WeekPlan pagina ook direct bewerkbaar.
2. **Voedingswaarden per portie** — `porties` veld aan Recipe, macro's gedeeld door porties in alle weergaven.

---

## 1. Handmatig Weekplan Samenstellen

### Route
`/weekplan/samenstellen` — bereikbaar via een "Stel samen" knop op de WeekPlan pagina naast de bestaande "Genereer weekplan" knop.

### Scherm structuur
Per dag (maandag t/m zondag) vier vaste slots:
- Ontbijt
- Lunch
- Diner
- Snack (optioneel — zelfde behandeling als de anderen)

Elk slot toont:
- Ingevuld: receptnaam + categorie, met edit-icoontje
- Leeg: `+ Voeg toe` knop

### Recipe picker (bottom sheet / modal)
Bij klik op een slot (leeg of ingevuld):
- Sheet schuift omhoog (mobile) of modal opent (desktop)
- Zoekbalk bovenaan
- Receptenlijst gefilterd op categorie passend bij het slot:
  - `ontbijt` → categorie ontbijt
  - `lunch` → categorie lunch
  - `diner` → categorie diner
  - `snack` → categorie snack
- Overige categorieën ook doorzoekbaar via de zoekbalk
- Bij ingevuld slot: extra "Verwijder uit slot" optie bovenaan
- Klik op recept → slot ingevuld, sheet sluit

### Acties onderaan het scherm
- **"Toepassen op week X"** → schrijft naar `meal_plans` tabel voor de huidige cyclus-week (zelfde als bestaand `POST /api/meal-plans/apply`)
- **"Opslaan als template"** → naam invullen → `POST /api/templates` (zelfde als bestaand template-systeem)

### WeekPlan pagina aanpassingen
- Elk ingevuld slot krijgt een klein edit-icoontje (pencil) → opent dezelfde recipe picker sheet voor dat specifieke slot
- Lege slots tonen een `+` knop → opent picker
- Bestaande "Laad template" en "Genereer weekplan" knoppen blijven

### Backend
Geen nieuwe endpoints nodig — gebruikt bestaande:
- `GET /api/recipes` voor receptenlijst in de picker
- `POST /api/meal-plans/apply` voor toepassen op week
- `POST /api/templates` voor opslaan als template
- `PUT /api/meal-plans/week/{n}/dag/{dag}/maaltijd/{type}` voor directe slot-edit op WeekPlan pagina

### Frontend nieuwe bestanden
- `frontend/src/pages/WeekPlanBuilder.jsx` — nieuw scherm
- `frontend/src/components/RecipePicker.jsx` — herbruikbare picker sheet/modal (gebruikt in WeekPlanBuilder én WeekPlan)

### Frontend gewijzigde bestanden
- `frontend/src/pages/WeekPlan.jsx` — edit-icoontje + `+` knop per slot, RecipePicker integreren
- `frontend/src/App.jsx` — route `/weekplan/samenstellen`
- `frontend/src/components/IOSPrimitives.jsx` — geen wijziging nodig
- `frontend/src/components/DesktopShell.jsx` — geen wijziging nodig

---

## 2. Voedingswaarden per Portie

### Database
Nieuw veld aan `recipes` tabel:
```sql
ALTER TABLE recipes ADD COLUMN porties INTEGER NOT NULL DEFAULT 1;
```

Default 1: bestaande waarden worden ongewijzigd getoond (per portie = de opgeslagen waarde).

### Berekening
In de frontend: `weergavewaarde = Math.round(opgeslagenwaarde / porties)`

### RecipeDetail — mobile
Macro's als vier prominente kaartjes direct onder de header (vóór de ingrediënten):
```
┌──────────┬──────────┐
│ 650 kcal │ 45g      │
│          │ eiwit    │
├──────────┼──────────┤
│ 28g      │ 62g      │
│ vet      │ koolhyd. │
└──────────┴──────────┘
per portie
```
Huidige macro-groep in de IOSGroup blijft als detail, maar de prominente kaartjes zijn de primaire weergave.

### RecipeDetail — desktop
De bestaande `Stat` componenten in het Macro's Panel krijgen een "per portie" onderschrift en tonen `waarde / porties`.

### RecipeList (Recipes.jsx)
De kcal + eiwit badges in de kaartjes en rijen tonen ook `waarde / porties`.

### RecipeForm
Nieuw veld "Porties" (number input, min 1, default 1) toevoegen in het formulier. Backend `RecipeIn` Pydantic model uitbreiden met `porties: int = 1`.

### Backend
- `backend/db/models.py` — `porties = Column(Integer, default=1)` aan `Recipe`
- `backend/api/recipes.py` — `porties` toevoegen aan `RecipeIn` en `RecipeOut`
- DB migratie: `ALTER TABLE recipes ADD COLUMN porties INTEGER NOT NULL DEFAULT 1`

---

## Wijzigingen overzicht

### Backend
- `backend/db/models.py` — `porties` veld aan `Recipe`
- `backend/api/recipes.py` — `porties` in `RecipeIn` + `RecipeOut`

### Frontend (nieuw)
- `frontend/src/pages/WeekPlanBuilder.jsx`
- `frontend/src/components/RecipePicker.jsx`

### Frontend (gewijzigd)
- `frontend/src/pages/WeekPlan.jsx` — slot-edit + picker integratie
- `frontend/src/pages/RecipeDetail.jsx` — prominente macro kaartjes, per-portie berekening
- `frontend/src/pages/RecipeForm.jsx` — porties veld
- `frontend/src/pages/Recipes.jsx` — per-portie in badges
- `frontend/src/App.jsx` — nieuwe route
