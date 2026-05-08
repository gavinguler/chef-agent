# Chef Agent — Design Spec
**Datum:** 2026-05-03  
**Versie:** 1.0  
**Status:** Goedgekeurd

---

## Overzicht

Chef Agent is een persoonlijke voedingsassistent voor Gavin (~90 kg, krachttraining + cardio). Het systeem beheert een 8-weeks roulerend voedingsschema gebaseerd op een rundvleespakket van Boer Joep, stuurt wekelijks een Telegram bericht met maaltijdplan + boodschappenlijst, en biedt een mobiele web interface voor receptbeheer. Een hybride AI agent past het schema aan met nieuwe recepten en variaties.

**Budget:** €450–500/maand  
**Macro targets:** 2700–2900 kcal · ~160g eiwit · ~80g vet · ~320–350g koolhydraten  
**Winkels:** Boer Joep (rundvlees, elke ~2 maanden), Lidl (weekboodschappen), Sligro

---

## Architectuur

### Aanpak: Modulaire monoliet

Één FastAPI applicatie met duidelijk gescheiden modules. Één Docker container op Proxmox. React frontend als aparte build (geserveerd via FastAPI of eigen poort).

**Ontwikkeling:** Lokaal op Mac  
**Deployment:** Proxmox LXC container (nieuw aan te maken)

### Systeem diagram

```
┌─────────────────────────────────────────────┐
│         Proxmox LXC — Chef Agent            │
│                                             │
│  ┌─────────┐  ┌──────────┐  ┌───────────┐  │
│  │   API   │  │ Scheduler│  │  AI Agent │  │
│  │ FastAPI │  │APScheduler│  │Ollama +   │  │
│  │ routes  │  │zo 09:00  │  │Claude API │  │
│  └────┬────┘  └────┬─────┘  └─────┬─────┘  │
│       │            │              │         │
│  ┌────▼────────────▼──────────────▼──────┐  │
│  │              db/ module               │  │
│  │         SQLAlchemy ORM                │  │
│  └───────────────────┬───────────────────┘  │
└──────────────────────┼──────────────────────┘
                       │
          ┌────────────▼────────────┐
          │  PostgreSQL             │
          │  192.168.0.170:5432     │
          │  database: chef_agent   │
          └─────────────────────────┘

Externe services:
  - Ollama LXC (nieuw)     llama3.1:8b
  - Claude API             claude-sonnet-4-5
  - Telegram Bot API       python-telegram-bot
  - React frontend         Vite build
```

---

## Tech Stack

| Onderdeel | Technologie |
|-----------|-------------|
| Backend | Python 3.12 · FastAPI · SQLAlchemy · Alembic |
| Frontend | React 18 · Vite · TailwindCSS |
| Database | PostgreSQL op `192.168.0.170` |
| AI lokaal | Ollama `llama3.1:8b` (gedeelde LXC — IP nog te bepalen) |
| AI cloud | Claude API `claude-sonnet-4-5` |
| Telegram | `python-telegram-bot` v21 |
| Scheduler | APScheduler 3.x |
| Lokaal dev | Docker Compose (Mac) |
| Deployment | Proxmox LXC — Python direct (geen Docker in LXC) |

---

## Module structuur

```
chef-agent/
├── backend/
│   ├── main.py                 # FastAPI app entry point
│   ├── api/                    # REST API routes
│   │   ├── recipes.py          # CRUD recepten
│   │   ├── meal_plans.py       # Weekplanning endpoints
│   │   └── shopping.py         # Boodschappenlijst endpoints
│   ├── scheduler/
│   │   └── weekly_job.py       # Zondag 09:00 Telegram bericht
│   ├── ai/
│   │   ├── agent.py            # Hybride agent router
│   │   ├── ollama_client.py    # Lokale LLM calls
│   │   └── claude_client.py    # Claude API calls
│   ├── telegram/
│   │   └── bot.py              # Telegram bot + message formatter
│   └── db/
│       ├── models.py           # SQLAlchemy modellen
│       ├── session.py          # Database sessie
│       └── migrations/         # Alembic migraties
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   │   ├── Home.jsx        # Goedemorgen + vandaag + vriezer
│   │   │   ├── Recipes.jsx     # Recepten browse + zoek
│   │   │   └── WeekPlan.jsx    # Dag-tabs + maaltijddetail
│   │   └── components/
│   └── vite.config.js
├── docker-compose.yml      # Lokale ontwikkeling (Mac)
├── deploy/
│   └── setup.sh            # Proxmox LXC installatie script
└── docs/
```

---

## Database schema

### `recipes`
| Kolom | Type | Omschrijving |
|-------|------|--------------|
| id | UUID | Primary key |
| naam | TEXT | Receptnaam |
| beschrijving | TEXT | Korte omschrijving |
| instructies | TEXT | Bereidingswijze |
| kcal | INT | Per portie |
| eiwit_g | FLOAT | Gram eiwit per portie |
| vet_g | FLOAT | Gram vet per portie |
| koolhydraten_g | FLOAT | Gram koolhydraten per portie |
| categorie | TEXT | ontbijt / lunch / diner / snack |
| vlees_type | TEXT | gehakt / rosbief / etc. (nullable) |
| bron | TEXT | handmatig / ai_gegenereerd |
| aangemaakt_op | TIMESTAMP | |

### `meal_plans`
| Kolom | Type | Omschrijving |
|-------|------|--------------|
| id | UUID | Primary key |
| cyclus_week | INT | Week 1–8 in 8-weeks cyclus |
| dag | TEXT | maandag t/m zondag |
| maaltijd_type | TEXT | ontbijt / lunch / diner |
| recept_id | UUID | FK → recipes |

### `shopping_lists`
| Kolom | Type | Omschrijving |
|-------|------|--------------|
| id | UUID | Primary key |
| cyclus_week | INT | Week 1–8 |
| product | TEXT | Productnaam |
| categorie | TEXT | zuivel / groente / vlees / etc. |
| hoeveelheid | TEXT | Bijv. "7 pakken" |
| winkel | TEXT | lidl / sligro / boer_joep |
| prijs_indicatie | FLOAT | Nullable, later via bonnetjes app |

### `freezer_items`
| Kolom | Type | Omschrijving |
|-------|------|--------------|
| id | UUID | Primary key |
| cyclus_week | INT | Week 1–8 |
| product | TEXT | Bijv. "gehakt 300g" |
| hoeveelheid | TEXT | |
| ontdooi_dag | TEXT | Dag van ontdooien (bijv. "woensdag") |
| gebruik_dag | TEXT | Dag van gebruik (bijv. "donderdag") |

### `nutrition_cycle`
| Kolom | Type | Omschrijving |
|-------|------|--------------|
| id | UUID | Primary key |
| cyclus_week | INT | Week 1–8 |
| vlees_type | TEXT | gehakt / rosbief / ossenhaas / etc. |
| hoeveelheid_g | INT | Gram uit Boer Joep pakket |
| gebruikt | BOOL | Afgevinkt na gebruik |

---

## Web Interface

### Design
- **Stijl:** Light · clean · iOS-achtig · TailwindCSS
- **Mobiel-first:** primair op telefoon gebruikt
- **Kleur:** wit achtergrond · subtiele kaarten met border + shadow · groen accent (#16a34a)

### Scherm 1 — Home
- Goedemorgen begroeting + huidige week/dag
- Kaart met de maaltijd van vandaag (diner) + macros badge
- Vriezer reminder banner (geel) indien van toepassing
- 4 snelknoppen: Boodschappen · Recepten · Weekplan · Nieuw recept

### Scherm 2 — Recepten
- Zoekbalk bovenaan
- Receptkaarten: emoji + naam + vlees type + eiwit per portie
- Nieuw recept toevoegen knop (groen)
- Bij toevoegen: AI vult macro's automatisch in via Ollama

### Scherm 3 — Weekplanning
- Week nummer + datumrange + vlees-thema
- Dag-tabs (Ma t/m Zo) horizontaal scrollbaar bovenaan
- Geselecteerde dag: 3 maaltijden (ontbijt/lunch/diner) met emoji + naam + eiwit
- Dagtotaal balk onderaan: totaal eiwit + kcal

---

## Telegram Bot

### Bericht timing
**Zondag 09:00** — wekelijks automatisch bericht (niet maandag/woensdag: kantoordagen)

### Bericht formaat
```
👨‍🍳 Chef Agent — Week [X] | [Vlees thema]

📅 MAALTIJDPLAN
━━━━━━━━━━━━━━━━━━
Ma: Kwark bowl + Wraps (kantoor)
Di: [ontbijt] · [lunch] · [diner]
Wo: Kwark bowl + Wraps (kantoor)
Do: 🍳 BATCH — [recept]
Vr: [ontbijt] · [lunch] · [diner]
Za: [ontbijt] · [lunch] · [diner]
Zo: 🍳 BATCH — [recept]

🛒 BOODSCHAPPEN LIDL
━━━━━━━━━━━━━━━━━━
Zuivel: kwark 7x · yoghurt 2x · eieren 30st
Groente: paprika 5x · courgette 2x · ...
Koolhydraten: brood 2x · havermout · ...
Overig: tonijn 5x · olijven · ...

❄️ VRIEZER
━━━━━━━━━━━━━━━━━━
Woensdag: haal [product] eruit → gebruik donderdag
[verdere reminders...]

💪 Week target: 160g eiwit/dag · 2700-2900 kcal
```

---

## AI Agent

### Routing logica
```
Taak → Ollama (snel, gratis):
  - Boodschappenlijst genereren op basis van weekplan
  - Vriezer planning berekenen
  - Macro's schatten bij nieuw recept
  - Kleine receptvariaties ("maak bolognese zonder pasta")

Taak → Claude API (slim, complex):
  - Nieuw recept volledig integreren in 8-weeks schema
  - Schema herbalanceren na toevoegen/verwijderen recept
  - Macro's valideren tegen dagelijkse targets
  - Boodschappenbudget checken (€450-500/maand)
```

### Recept toevoegen flow
1. Gebruiker voert naam + ingrediënten in via web
2. Ollama schat macro's in
3. Claude API integreert recept in 8-weeks schema
4. Claude valideert week-totalen tegen macro targets
5. Schema opgeslagen in database

---

## Deployment

### Proxmox setup
- Nieuwe LXC container: `chef-agent` (IP nog te bepalen via UniFi/wiki)
- Nieuwe LXC container: `ollama` — **gedeelde service** voor alle homelab projecten (Chef Agent, Hermes Agent, toekomstige agents)
- PostgreSQL: bestaande container `192.168.0.170` — nieuwe database `chef_agent`
- Nginx Proxy Manager (`192.168.0.132`): reverse proxy voor web interface
- Lokale dev: Docker Compose op Mac met lokale PostgreSQL + Ollama

### Environment variabelen
```env
DATABASE_URL=postgresql://chef_agent:***@192.168.0.170:5432/chef_agent
TELEGRAM_BOT_TOKEN=***
ANTHROPIC_API_KEY=***
OLLAMA_BASE_URL=http://[ollama-ip]:11434
```

---

## Toekomstige uitbreidingen (buiten scope v1)

| Feature | Afhankelijkheid |
|---------|----------------|
| Authelia authenticatie | Authelia setup op homelab |
| Bonnetjes app koppeling | `192.168.0.215:8000` REST API |
| Budget tracking dashboard | Bonnetjes app + prijsdata |

---

## Niet in scope (v1)

- Gebruikersbeheer / meerdere gebruikers
- Mobiele app (native iOS/Android)
- Automatisch boodschappen bestellen
- Calorieën tracking integratie
