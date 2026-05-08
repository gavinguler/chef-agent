# Chef Agent Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Bouw een persoonlijke voedingsassistent met wekelijkse Telegram berichten, een mobiele React web interface voor receptbeheer, en een hybride AI agent (Ollama + Claude API) die het 8-weeks voedingsschema beheert.

**Architecture:** Modulaire FastAPI monoliet met React frontend. PostgreSQL op `192.168.0.170`. Gedeelde Ollama LXC voor lokale LLM. APScheduler stuurt elke zondag 09:00 een Telegram bericht.

**Tech Stack:** Python 3.12 · FastAPI · SQLAlchemy · Alembic · PostgreSQL · React 18 · Vite · TailwindCSS · python-telegram-bot v21 · APScheduler · Ollama llama3.1:8b · Claude API claude-sonnet-4-6

---

## File Map

```
chef-agent/
├── backend/
│   ├── main.py                  # FastAPI app + lifespan
│   ├── config.py                # Settings via pydantic-settings
│   ├── api/
│   │   ├── __init__.py
│   │   ├── recipes.py           # CRUD recepten
│   │   ├── meal_plans.py        # Weekplanning endpoints
│   │   └── shopping.py          # Boodschappenlijst endpoints
│   ├── scheduler/
│   │   └── weekly_job.py        # APScheduler zondag 09:00
│   ├── ai/
│   │   ├── agent.py             # Hybride router (Ollama vs Claude)
│   │   ├── ollama_client.py     # Ollama HTTP client
│   │   └── claude_client.py     # Anthropic SDK client
│   ├── telegram/
│   │   └── bot.py               # Bot + weekly message formatter
│   └── db/
│       ├── models.py            # SQLAlchemy ORM modellen
│       ├── session.py           # DB sessie + get_db dependency
│       └── seed.py              # Seed voedingsschema v8
├── frontend/
│   ├── src/
│   │   ├── main.jsx
│   │   ├── App.jsx              # Router setup
│   │   ├── api/client.js        # Axios wrapper
│   │   ├── pages/
│   │   │   ├── Home.jsx
│   │   │   ├── Recipes.jsx
│   │   │   └── WeekPlan.jsx
│   │   └── components/
│   │       ├── RecipeCard.jsx
│   │       ├── FreezerBanner.jsx
│   │       └── DayTabs.jsx
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   └── tailwind.config.js
├── tests/
│   ├── conftest.py
│   ├── test_recipes.py
│   ├── test_meal_plans.py
│   └── test_ai_agent.py
├── alembic.ini
├── alembic/
│   ├── env.py
│   └── versions/
├── requirements.txt
├── requirements-dev.txt
├── docker-compose.yml
├── .env.example
└── deploy/
    └── setup.sh
```

---

## Phase 1: Foundation

### Task 1: Project structuur + dependencies

**Files:**
- Create: `requirements.txt`
- Create: `requirements-dev.txt`
- Create: `.env.example`
- Create: `backend/config.py`

- [ ] **Stap 1: Maak requirements.txt**

```
fastapi==0.115.0
uvicorn[standard]==0.30.6
sqlalchemy==2.0.35
alembic==1.13.3
psycopg2-binary==2.9.9
pydantic-settings==2.5.2
python-telegram-bot==21.6
apscheduler==3.10.4
anthropic==0.34.2
httpx==0.27.2
python-dotenv==1.0.1
```

- [ ] **Stap 2: Maak requirements-dev.txt**

```
pytest==8.3.3
pytest-asyncio==0.24.0
httpx==0.27.2
factory-boy==3.3.1
```

- [ ] **Stap 3: Maak .env.example**

```env
DATABASE_URL=postgresql://chef_agent:changeme@localhost:5432/chef_agent
TEST_DATABASE_URL=postgresql://chef_agent:changeme@localhost:5432/chef_agent_test
TELEGRAM_BOT_TOKEN=your_bot_token_here
TELEGRAM_CHAT_ID=your_chat_id_here
ANTHROPIC_API_KEY=your_anthropic_key_here
OLLAMA_BASE_URL=http://localhost:11434
```

- [ ] **Stap 4: Maak backend/config.py**

```python
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    database_url: str
    test_database_url: str = ""
    telegram_bot_token: str = ""
    telegram_chat_id: str = ""
    anthropic_api_key: str = ""
    ollama_base_url: str = "http://localhost:11434"

    class Config:
        env_file = ".env"

settings = Settings()
```

- [ ] **Stap 5: Installeer dependencies**

```bash
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt -r requirements-dev.txt
```

- [ ] **Stap 6: Commit**

```bash
git init
echo ".venv/\n.env\n__pycache__/\n*.pyc\n.superpowers/" > .gitignore
git add requirements.txt requirements-dev.txt .env.example backend/config.py .gitignore
git commit -m "feat: project foundation — dependencies en config"
```

---

### Task 2: Database modellen

**Files:**
- Create: `backend/db/__init__.py`
- Create: `backend/db/models.py`

- [ ] **Stap 1: Schrijf de falende test**

Maak `tests/test_models.py`:

```python
from backend.db.models import Recipe, MealPlan, ShoppingList, FreezerItem, NutritionCycle
import uuid

def test_recipe_has_required_fields():
    r = Recipe(
        naam="Bolognese",
        categorie="diner",
        kcal=650,
        eiwit_g=48.0,
        vet_g=22.0,
        koolhydraten_g=55.0,
    )
    assert r.naam == "Bolognese"
    assert r.bron == "handmatig"

def test_meal_plan_links_recipe():
    recipe_id = uuid.uuid4()
    mp = MealPlan(cyclus_week=1, dag="maandag", maaltijd_type="diner", recept_id=recipe_id)
    assert mp.cyclus_week == 1

def test_nutrition_cycle_has_8_weeks():
    nc = NutritionCycle(cyclus_week=1, vlees_type="gehakt", hoeveelheid_g=450)
    assert nc.gebruikt == False
```

- [ ] **Stap 2: Run test — verwacht ImportError**

```bash
pytest tests/test_models.py -v
```
Verwacht: `ImportError: cannot import name 'Recipe'`

- [ ] **Stap 3: Maak backend/db/models.py**

```python
import uuid
from datetime import datetime
from sqlalchemy import Column, String, Integer, Float, Boolean, Text, DateTime, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import DeclarativeBase, relationship


class Base(DeclarativeBase):
    pass


class Recipe(Base):
    __tablename__ = "recipes"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    naam = Column(Text, nullable=False)
    beschrijving = Column(Text)
    instructies = Column(Text)
    kcal = Column(Integer)
    eiwit_g = Column(Float)
    vet_g = Column(Float)
    koolhydraten_g = Column(Float)
    categorie = Column(String(50))
    vlees_type = Column(String(50), nullable=True)
    bron = Column(String(50), default="handmatig")
    aangemaakt_op = Column(DateTime, default=datetime.utcnow)

    meal_plan_entries = relationship("MealPlan", back_populates="recipe")


class MealPlan(Base):
    __tablename__ = "meal_plans"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    cyclus_week = Column(Integer, nullable=False)
    dag = Column(String(20), nullable=False)
    maaltijd_type = Column(String(20), nullable=False)
    recept_id = Column(UUID(as_uuid=True), ForeignKey("recipes.id"), nullable=True)

    recipe = relationship("Recipe", back_populates="meal_plan_entries")


class ShoppingList(Base):
    __tablename__ = "shopping_lists"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    cyclus_week = Column(Integer, nullable=False)
    product = Column(Text, nullable=False)
    categorie = Column(String(50))
    hoeveelheid = Column(Text)
    winkel = Column(String(50), default="lidl")
    prijs_indicatie = Column(Float, nullable=True)


class FreezerItem(Base):
    __tablename__ = "freezer_items"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    cyclus_week = Column(Integer, nullable=False)
    product = Column(Text, nullable=False)
    hoeveelheid = Column(Text)
    ontdooi_dag = Column(String(20))
    gebruik_dag = Column(String(20))


class NutritionCycle(Base):
    __tablename__ = "nutrition_cycle"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    cyclus_week = Column(Integer, nullable=False, unique=True)
    vlees_type = Column(String(50), nullable=False)
    hoeveelheid_g = Column(Integer, nullable=False)
    gebruikt = Column(Boolean, default=False)
```

- [ ] **Stap 4: Maak backend/db/\_\_init\_\_.py** (leeg bestand)

- [ ] **Stap 5: Run tests — verwacht PASS**

```bash
pytest tests/test_models.py -v
```
Verwacht: `3 passed`

- [ ] **Stap 6: Commit**

```bash
git add backend/db/models.py backend/db/__init__.py tests/test_models.py
git commit -m "feat: SQLAlchemy database modellen"
```

---

### Task 3: Database sessie + Alembic migraties

**Files:**
- Create: `backend/db/session.py`
- Create: `alembic.ini`
- Create: `alembic/env.py`

- [ ] **Stap 1: Maak backend/db/session.py**

```python
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from backend.config import settings

engine = create_engine(settings.database_url)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
```

- [ ] **Stap 2: Initialiseer Alembic**

```bash
alembic init alembic
```

- [ ] **Stap 3: Update alembic/env.py — voeg modellen toe**

Vervang de bestaande `target_metadata = None` regel en voeg imports toe:

```python
import os
import sys
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from backend.db.models import Base
from backend.config import settings

# ... bestaande code ...
target_metadata = Base.metadata

# In run_migrations_online(), vervang connectable:
connectable = create_engine(settings.database_url)
```

- [ ] **Stap 4: Maak eerste migratie**

```bash
alembic revision --autogenerate -m "initial schema"
```
Verwacht: `Generating alembic/versions/xxxx_initial_schema.py`

- [ ] **Stap 5: Maak test database + run migratie**

Zorg dat Docker Compose draait (zie Task 4), dan:
```bash
alembic upgrade head
```
Verwacht: `Running upgrade -> xxxx, initial schema`

- [ ] **Stap 6: Commit**

```bash
git add backend/db/session.py alembic.ini alembic/
git commit -m "feat: database sessie + Alembic migraties"
```

---

### Task 4: Docker Compose lokale ontwikkelomgeving

**Files:**
- Create: `docker-compose.yml`
- Create: `Makefile`

- [ ] **Stap 1: Maak docker-compose.yml**

```yaml
version: "3.9"

services:
  postgres:
    image: postgres:16-alpine
    environment:
      POSTGRES_USER: chef_agent
      POSTGRES_PASSWORD: changeme
      POSTGRES_DB: chef_agent
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./docker/init.sql:/docker-entrypoint-initdb.d/init.sql

  ollama:
    image: ollama/ollama:latest
    ports:
      - "11434:11434"
    volumes:
      - ollama_data:/root/.ollama

volumes:
  postgres_data:
  ollama_data:
```

- [ ] **Stap 2: Maak docker/init.sql voor test database**

```sql
CREATE DATABASE chef_agent_test;
GRANT ALL PRIVILEGES ON DATABASE chef_agent_test TO chef_agent;
```

- [ ] **Stap 3: Maak Makefile**

```makefile
.PHONY: up down migrate seed test dev

up:
	docker compose up -d

down:
	docker compose down

migrate:
	alembic upgrade head

seed:
	python -m backend.db.seed

test:
	pytest tests/ -v

dev:
	uvicorn backend.main:app --reload --port 8000

pull-model:
	docker compose exec ollama ollama pull llama3.1:8b
```

- [ ] **Stap 4: Start Docker Compose + pull Ollama model**

```bash
make up
# Wacht ~10s op postgres
make pull-model
# Dit duurt 5-10 min — model is 4.7GB
```

- [ ] **Stap 5: Run Alembic migratie**

```bash
make migrate
```
Verwacht: `Running upgrade -> xxxx, initial schema`

- [ ] **Stap 6: Commit**

```bash
git add docker-compose.yml docker/init.sql Makefile
git commit -m "feat: Docker Compose lokale dev omgeving"
```

---

## Phase 2: Backend API

### Task 5: FastAPI app skeleton + tests conftest

**Files:**
- Create: `backend/main.py`
- Create: `backend/api/__init__.py`
- Create: `tests/conftest.py`

- [ ] **Stap 1: Maak tests/conftest.py**

```python
import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from backend.db.models import Base
from backend.db.session import get_db
from backend.main import app
from backend.config import settings

TEST_URL = settings.test_database_url or settings.database_url.replace(
    "/chef_agent", "/chef_agent_test"
)

@pytest.fixture(scope="session")
def engine():
    eng = create_engine(TEST_URL)
    Base.metadata.create_all(eng)
    yield eng
    Base.metadata.drop_all(eng)

@pytest.fixture
def db(engine):
    TestSession = sessionmaker(bind=engine)
    session = TestSession()
    yield session
    session.rollback()
    session.close()

@pytest.fixture
def client(db):
    def override_get_db():
        yield db
    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as c:
        yield c
    app.dependency_overrides.clear()
```

- [ ] **Stap 2: Schrijf health check test**

Maak `tests/test_health.py`:

```python
def test_health(client):
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json() == {"status": "ok"}
```

- [ ] **Stap 3: Run test — verwacht FAIL**

```bash
pytest tests/test_health.py -v
```
Verwacht: `ImportError: cannot import name 'app'`

- [ ] **Stap 4: Maak backend/main.py**

```python
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backend.api import recipes, meal_plans, shopping


@asynccontextmanager
async def lifespan(app: FastAPI):
    yield


app = FastAPI(title="Chef Agent", version="1.0.0", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(recipes.router, prefix="/api/recipes", tags=["recipes"])
app.include_router(meal_plans.router, prefix="/api/meal-plans", tags=["meal-plans"])
app.include_router(shopping.router, prefix="/api/shopping", tags=["shopping"])


@app.get("/health")
def health():
    return {"status": "ok"}
```

- [ ] **Stap 5: Maak lege routers (zodat imports werken)**

Maak `backend/api/__init__.py` (leeg).

Maak `backend/api/recipes.py`, `backend/api/meal_plans.py`, `backend/api/shopping.py` elk met:

```python
from fastapi import APIRouter
router = APIRouter()
```

- [ ] **Stap 6: Run test — verwacht PASS**

```bash
pytest tests/test_health.py -v
```
Verwacht: `1 passed`

- [ ] **Stap 7: Commit**

```bash
git add backend/main.py backend/api/ tests/
git commit -m "feat: FastAPI skeleton + test infrastructure"
```

---

### Task 6: Recipes API

**Files:**
- Modify: `backend/api/recipes.py`
- Create: `tests/test_recipes.py`

- [ ] **Stap 1: Schrijf falende tests**

Maak `tests/test_recipes.py`:

```python
import pytest

def test_list_recipes_empty(client):
    response = client.get("/api/recipes")
    assert response.status_code == 200
    assert response.json() == []

def test_create_recipe(client):
    payload = {
        "naam": "Bolognese",
        "categorie": "diner",
        "kcal": 650,
        "eiwit_g": 48.0,
        "vet_g": 22.0,
        "koolhydraten_g": 55.0,
        "vlees_type": "gehakt",
    }
    response = client.post("/api/recipes", json=payload)
    assert response.status_code == 201
    data = response.json()
    assert data["naam"] == "Bolognese"
    assert "id" in data

def test_get_recipe(client):
    create = client.post("/api/recipes", json={
        "naam": "Omelet", "categorie": "ontbijt",
        "kcal": 300, "eiwit_g": 22.0, "vet_g": 18.0, "koolhydraten_g": 5.0,
    })
    recipe_id = create.json()["id"]
    response = client.get(f"/api/recipes/{recipe_id}")
    assert response.status_code == 200
    assert response.json()["naam"] == "Omelet"

def test_delete_recipe(client):
    create = client.post("/api/recipes", json={
        "naam": "Te verwijderen", "categorie": "snack",
        "kcal": 100, "eiwit_g": 5.0, "vet_g": 3.0, "koolhydraten_g": 10.0,
    })
    recipe_id = create.json()["id"]
    response = client.delete(f"/api/recipes/{recipe_id}")
    assert response.status_code == 204
    response = client.get(f"/api/recipes/{recipe_id}")
    assert response.status_code == 404

def test_search_recipes(client):
    client.post("/api/recipes", json={
        "naam": "Tonijn wrap", "categorie": "lunch",
        "kcal": 420, "eiwit_g": 32.0, "vet_g": 12.0, "koolhydraten_g": 38.0,
    })
    response = client.get("/api/recipes?search=tonijn")
    assert response.status_code == 200
    assert len(response.json()) >= 1
    assert response.json()[0]["naam"] == "Tonijn wrap"
```

- [ ] **Stap 2: Run tests — verwacht FAIL**

```bash
pytest tests/test_recipes.py -v
```
Verwacht: `4 failed` (routes bestaan niet)

- [ ] **Stap 3: Implementeer backend/api/recipes.py**

```python
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import or_
from pydantic import BaseModel
from typing import Optional
import uuid

from backend.db.session import get_db
from backend.db.models import Recipe

router = APIRouter()


class RecipeIn(BaseModel):
    naam: str
    beschrijving: Optional[str] = None
    instructies: Optional[str] = None
    kcal: Optional[int] = None
    eiwit_g: Optional[float] = None
    vet_g: Optional[float] = None
    koolhydraten_g: Optional[float] = None
    categorie: Optional[str] = None
    vlees_type: Optional[str] = None
    bron: str = "handmatig"


class RecipeOut(BaseModel):
    id: uuid.UUID
    naam: str
    beschrijving: Optional[str]
    instructies: Optional[str]
    kcal: Optional[int]
    eiwit_g: Optional[float]
    vet_g: Optional[float]
    koolhydraten_g: Optional[float]
    categorie: Optional[str]
    vlees_type: Optional[str]
    bron: str

    class Config:
        from_attributes = True


@router.get("", response_model=list[RecipeOut])
def list_recipes(search: Optional[str] = Query(None), db: Session = Depends(get_db)):
    q = db.query(Recipe)
    if search:
        q = q.filter(Recipe.naam.ilike(f"%{search}%"))
    return q.all()


@router.post("", response_model=RecipeOut, status_code=201)
def create_recipe(recipe: RecipeIn, db: Session = Depends(get_db)):
    db_recipe = Recipe(**recipe.model_dump())
    db.add(db_recipe)
    db.commit()
    db.refresh(db_recipe)
    return db_recipe


@router.get("/{recipe_id}", response_model=RecipeOut)
def get_recipe(recipe_id: uuid.UUID, db: Session = Depends(get_db)):
    recipe = db.query(Recipe).filter(Recipe.id == recipe_id).first()
    if not recipe:
        raise HTTPException(status_code=404, detail="Recept niet gevonden")
    return recipe


@router.put("/{recipe_id}", response_model=RecipeOut)
def update_recipe(recipe_id: uuid.UUID, recipe: RecipeIn, db: Session = Depends(get_db)):
    db_recipe = db.query(Recipe).filter(Recipe.id == recipe_id).first()
    if not db_recipe:
        raise HTTPException(status_code=404, detail="Recept niet gevonden")
    for key, value in recipe.model_dump(exclude_unset=True).items():
        setattr(db_recipe, key, value)
    db.commit()
    db.refresh(db_recipe)
    return db_recipe


@router.delete("/{recipe_id}", status_code=204)
def delete_recipe(recipe_id: uuid.UUID, db: Session = Depends(get_db)):
    db_recipe = db.query(Recipe).filter(Recipe.id == recipe_id).first()
    if not db_recipe:
        raise HTTPException(status_code=404, detail="Recept niet gevonden")
    db.delete(db_recipe)
    db.commit()
```

- [ ] **Stap 4: Run tests — verwacht PASS**

```bash
pytest tests/test_recipes.py -v
```
Verwacht: `4 passed`

- [ ] **Stap 5: Commit**

```bash
git add backend/api/recipes.py tests/test_recipes.py
git commit -m "feat: recipes CRUD API"
```

---

### Task 7: Meal Plans API

**Files:**
- Modify: `backend/api/meal_plans.py`
- Create: `tests/test_meal_plans.py`

- [ ] **Stap 1: Schrijf falende tests**

Maak `tests/test_meal_plans.py`:

```python
def test_get_week_plan_empty(client):
    response = client.get("/api/meal-plans/week/1")
    assert response.status_code == 200
    data = response.json()
    assert "week" in data
    assert data["week"] == 1

def test_set_meal_in_week(client):
    recipe = client.post("/api/recipes", json={
        "naam": "Bolognese", "categorie": "diner",
        "kcal": 650, "eiwit_g": 48.0, "vet_g": 22.0, "koolhydraten_g": 55.0,
    }).json()
    response = client.put("/api/meal-plans/week/1/dag/maandag/maaltijd/diner", json={
        "recept_id": recipe["id"]
    })
    assert response.status_code == 200

def test_week_plan_returns_daily_totals(client):
    response = client.get("/api/meal-plans/week/1")
    assert response.status_code == 200
    data = response.json()
    assert "dagen" in data
```

- [ ] **Stap 2: Run tests — verwacht FAIL**

```bash
pytest tests/test_meal_plans.py -v
```

- [ ] **Stap 3: Implementeer backend/api/meal_plans.py**

```python
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional
import uuid

from backend.db.session import get_db
from backend.db.models import MealPlan, Recipe

router = APIRouter()

DAYS = ["maandag", "dinsdag", "woensdag", "donderdag", "vrijdag", "zaterdag", "zondag"]
MEAL_TYPES = ["ontbijt", "lunch", "diner"]


class SetMealIn(BaseModel):
    recept_id: Optional[uuid.UUID] = None


class MealOut(BaseModel):
    maaltijd_type: str
    recept_id: Optional[uuid.UUID]
    naam: Optional[str]
    kcal: Optional[int]
    eiwit_g: Optional[float]

    class Config:
        from_attributes = True


class DayPlan(BaseModel):
    dag: str
    maaltijden: list[MealOut]
    totaal_eiwit_g: float
    totaal_kcal: int


class WeekPlan(BaseModel):
    week: int
    dagen: list[DayPlan]


@router.get("/week/{week_num}", response_model=WeekPlan)
def get_week_plan(week_num: int, db: Session = Depends(get_db)):
    if not 1 <= week_num <= 8:
        raise HTTPException(status_code=400, detail="Week moet tussen 1 en 8 zijn")

    dagen = []
    for dag in DAYS:
        maaltijden = []
        totaal_eiwit = 0.0
        totaal_kcal = 0
        for meal_type in MEAL_TYPES:
            entry = (
                db.query(MealPlan)
                .filter(
                    MealPlan.cyclus_week == week_num,
                    MealPlan.dag == dag,
                    MealPlan.maaltijd_type == meal_type,
                )
                .first()
            )
            if entry and entry.recipe:
                maaltijden.append(MealOut(
                    maaltijd_type=meal_type,
                    recept_id=entry.recept_id,
                    naam=entry.recipe.naam,
                    kcal=entry.recipe.kcal,
                    eiwit_g=entry.recipe.eiwit_g,
                ))
                totaal_eiwit += entry.recipe.eiwit_g or 0
                totaal_kcal += entry.recipe.kcal or 0
            else:
                maaltijden.append(MealOut(
                    maaltijd_type=meal_type,
                    recept_id=None,
                    naam=None,
                    kcal=None,
                    eiwit_g=None,
                ))
        dagen.append(DayPlan(
            dag=dag,
            maaltijden=maaltijden,
            totaal_eiwit_g=totaal_eiwit,
            totaal_kcal=totaal_kcal,
        ))
    return WeekPlan(week=week_num, dagen=dagen)


@router.put("/week/{week_num}/dag/{dag}/maaltijd/{meal_type}")
def set_meal(
    week_num: int,
    dag: str,
    meal_type: str,
    payload: SetMealIn,
    db: Session = Depends(get_db),
):
    if dag not in DAYS:
        raise HTTPException(status_code=400, detail=f"Dag moet een van {DAYS} zijn")
    if meal_type not in MEAL_TYPES:
        raise HTTPException(status_code=400, detail=f"Maaltijdtype moet een van {MEAL_TYPES} zijn")

    entry = (
        db.query(MealPlan)
        .filter(
            MealPlan.cyclus_week == week_num,
            MealPlan.dag == dag,
            MealPlan.maaltijd_type == meal_type,
        )
        .first()
    )
    if entry:
        entry.recept_id = payload.recept_id
    else:
        entry = MealPlan(
            cyclus_week=week_num,
            dag=dag,
            maaltijd_type=meal_type,
            recept_id=payload.recept_id,
        )
        db.add(entry)
    db.commit()
    return {"status": "ok"}
```

- [ ] **Stap 4: Run tests — verwacht PASS**

```bash
pytest tests/test_meal_plans.py -v
```
Verwacht: `3 passed`

- [ ] **Stap 5: Commit**

```bash
git add backend/api/meal_plans.py tests/test_meal_plans.py
git commit -m "feat: meal plans API"
```

---

### Task 8: Shopping List API

**Files:**
- Modify: `backend/api/shopping.py`

- [ ] **Stap 1: Schrijf falende test**

Voeg toe aan `tests/test_recipes.py` (onderaan):

```python
def test_get_shopping_list(client):
    response = client.get("/api/shopping/week/1")
    assert response.status_code == 200
    data = response.json()
    assert "week" in data
    assert "items" in data

def test_add_shopping_item(client):
    response = client.post("/api/shopping/week/1/items", json={
        "product": "Kwark 500g",
        "categorie": "zuivel",
        "hoeveelheid": "7 pakken",
        "winkel": "lidl",
    })
    assert response.status_code == 201
```

- [ ] **Stap 2: Run tests — verwacht FAIL**

```bash
pytest tests/test_recipes.py::test_get_shopping_list tests/test_recipes.py::test_add_shopping_item -v
```

- [ ] **Stap 3: Implementeer backend/api/shopping.py**

```python
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional
import uuid

from backend.db.session import get_db
from backend.db.models import ShoppingList

router = APIRouter()


class ShoppingItemIn(BaseModel):
    product: str
    categorie: Optional[str] = None
    hoeveelheid: Optional[str] = None
    winkel: str = "lidl"
    prijs_indicatie: Optional[float] = None


class ShoppingItemOut(BaseModel):
    id: uuid.UUID
    product: str
    categorie: Optional[str]
    hoeveelheid: Optional[str]
    winkel: str
    prijs_indicatie: Optional[float]

    class Config:
        from_attributes = True


class ShoppingListOut(BaseModel):
    week: int
    items: list[ShoppingItemOut]


@router.get("/week/{week_num}", response_model=ShoppingListOut)
def get_shopping_list(week_num: int, db: Session = Depends(get_db)):
    items = db.query(ShoppingList).filter(ShoppingList.cyclus_week == week_num).all()
    return ShoppingListOut(week=week_num, items=items)


@router.post("/week/{week_num}/items", response_model=ShoppingItemOut, status_code=201)
def add_item(week_num: int, item: ShoppingItemIn, db: Session = Depends(get_db)):
    db_item = ShoppingList(cyclus_week=week_num, **item.model_dump())
    db.add(db_item)
    db.commit()
    db.refresh(db_item)
    return db_item


@router.delete("/week/{week_num}/items/{item_id}", status_code=204)
def delete_item(week_num: int, item_id: uuid.UUID, db: Session = Depends(get_db)):
    item = db.query(ShoppingList).filter(
        ShoppingList.id == item_id,
        ShoppingList.cyclus_week == week_num,
    ).first()
    if not item:
        raise HTTPException(status_code=404, detail="Item niet gevonden")
    db.delete(item)
    db.commit()
```

- [ ] **Stap 4: Run alle tests**

```bash
pytest tests/ -v
```
Verwacht: alle tests groen

- [ ] **Stap 5: Start dev server en test handmatig**

```bash
make dev
# Open http://localhost:8000/docs
# Test via Swagger UI: maak een recept aan, bekijk het
```

- [ ] **Stap 6: Commit**

```bash
git add backend/api/shopping.py
git commit -m "feat: shopping list API — Phase 2 backend complete"
```

---

## Phase 3: Seed Data

### Task 9: Voedingsschema v8 importeren

**Files:**
- Create: `backend/db/seed.py`

- [ ] **Stap 1: Maak backend/db/seed.py met voedingsschema v8**

```python
"""
Seed script — importeert het voedingsschema v8 (8-weeks cyclus) in de database.
Draai eenmalig na database setup: python -m backend.db.seed
"""
from backend.db.session import SessionLocal
from backend.db.models import Recipe, MealPlan, ShoppingList, FreezerItem, NutritionCycle


RECIPES = [
    # Ontbijt
    {"naam": "Havermout met kwark en bessen", "categorie": "ontbijt", "kcal": 420, "eiwit_g": 32.0, "vet_g": 8.0, "koolhydraten_g": 52.0},
    {"naam": "Kwark bowl met noten en banaan", "categorie": "ontbijt", "kcal": 380, "eiwit_g": 28.0, "vet_g": 12.0, "koolhydraten_g": 40.0},
    {"naam": "Omelet met feta en spinazie", "categorie": "ontbijt", "kcal": 340, "eiwit_g": 26.0, "vet_g": 22.0, "koolhydraten_g": 6.0},
    {"naam": "Griekse yoghurt met muesli en fruit", "categorie": "ontbijt", "kcal": 360, "eiwit_g": 22.0, "vet_g": 8.0, "koolhydraten_g": 48.0},
    # Lunch
    {"naam": "Tonijn wrap met groente", "categorie": "lunch", "kcal": 420, "eiwit_g": 32.0, "vet_g": 12.0, "koolhydraten_g": 38.0},
    {"naam": "Feta salade met volkorenbrood", "categorie": "lunch", "kcal": 380, "eiwit_g": 22.0, "vet_g": 18.0, "koolhydraten_g": 32.0},
    {"naam": "Kwark met wraps (kantoor)", "categorie": "lunch", "kcal": 350, "eiwit_g": 28.0, "vet_g": 8.0, "koolhydraten_g": 38.0},
    {"naam": "Kipfilet salade", "categorie": "lunch", "kcal": 340, "eiwit_g": 36.0, "vet_g": 10.0, "koolhydraten_g": 20.0},
    # Diner
    {"naam": "Gehakt bolognese met volkorenpasta", "categorie": "diner", "kcal": 650, "eiwit_g": 48.0, "vet_g": 22.0, "koolhydraten_g": 55.0, "vlees_type": "gehakt"},
    {"naam": "Gehakt wokschotel met rijst", "categorie": "diner", "kcal": 620, "eiwit_g": 44.0, "vet_g": 18.0, "koolhydraten_g": 58.0, "vlees_type": "gehakt"},
    {"naam": "Riblap stoof met zoete aardappel", "categorie": "diner", "kcal": 680, "eiwit_g": 52.0, "vet_g": 24.0, "koolhydraten_g": 48.0, "vlees_type": "riblap"},
    {"naam": "Slow roast rosbief met aardappelen", "categorie": "diner", "kcal": 720, "eiwit_g": 64.0, "vet_g": 28.0, "koolhydraten_g": 42.0, "vlees_type": "rosbief"},
    {"naam": "Ribeye met gegrilde groente", "categorie": "diner", "kcal": 680, "eiwit_g": 52.0, "vet_g": 38.0, "koolhydraten_g": 18.0, "vlees_type": "ribeye"},
    {"naam": "Entrecote met zoete aardappel", "categorie": "diner", "kcal": 660, "eiwit_g": 52.0, "vet_g": 32.0, "koolhydraten_g": 40.0, "vlees_type": "entrecote"},
    {"naam": "Kogelbiefstuk met wokgroente", "categorie": "diner", "kcal": 580, "eiwit_g": 48.0, "vet_g": 22.0, "koolhydraten_g": 32.0, "vlees_type": "kogelbiefstuk"},
    {"naam": "Ossenhaas met aardappelgratin", "categorie": "diner", "kcal": 720, "eiwit_g": 58.0, "vet_g": 32.0, "koolhydraten_g": 44.0, "vlees_type": "ossenhaas"},
    {"naam": "Tartaar met salade en brood", "categorie": "diner", "kcal": 520, "eiwit_g": 44.0, "vet_g": 18.0, "koolhydraten_g": 38.0, "vlees_type": "tartaar"},
    {"naam": "Worstjes met stamppot boerenkool", "categorie": "diner", "kcal": 640, "eiwit_g": 38.0, "vet_g": 28.0, "koolhydraten_g": 52.0, "vlees_type": "worstjes"},
]

NUTRITION_CYCLE = [
    {"cyclus_week": 1, "vlees_type": "gehakt+ribeye+hamburgers", "hoeveelheid_g": 1050},
    {"cyclus_week": 2, "vlees_type": "riblap+biefstuk+worstjes", "hoeveelheid_g": 1350},
    {"cyclus_week": 3, "vlees_type": "rosbief+hamburgers+entrecote", "hoeveelheid_g": 1150},
    {"cyclus_week": 4, "vlees_type": "gehakt+kogelbiefstuk+worstjes", "hoeveelheid_g": 1250},
    {"cyclus_week": 5, "vlees_type": "riblap+gehakt+ribeye+hamburgers", "hoeveelheid_g": 1350},
    {"cyclus_week": 6, "vlees_type": "entrecote+ossenhaas+gehakt", "hoeveelheid_g": 1150},
    {"cyclus_week": 7, "vlees_type": "gehakt+hamburgers+worstjes", "hoeveelheid_g": 1050},
    {"cyclus_week": 8, "vlees_type": "tartaar+magere_lap", "hoeveelheid_g": 800},
]

SHOPPING_BASE_WEEK = [
    # Zuivel & ei
    {"product": "Milbona magere kwark 500g", "categorie": "zuivel", "hoeveelheid": "7 pakken", "winkel": "lidl", "prijs_indicatie": 11.20},
    {"product": "Griekse yoghurt 1kg", "categorie": "zuivel", "hoeveelheid": "2 pakken", "winkel": "lidl", "prijs_indicatie": 5.00},
    {"product": "Eieren scharrel 10-pak", "categorie": "zuivel", "hoeveelheid": "3 doosjes", "winkel": "lidl", "prijs_indicatie": 6.60},
    {"product": "Belegen kaas plakjes 200g", "categorie": "zuivel", "hoeveelheid": "1 pak", "winkel": "lidl", "prijs_indicatie": 3.00},
    {"product": "Feta 200g", "categorie": "zuivel", "hoeveelheid": "2 blokken", "winkel": "lidl", "prijs_indicatie": 3.60},
    # Groente
    {"product": "Uien zak 1kg", "categorie": "groente", "hoeveelheid": "1 zak", "winkel": "lidl", "prijs_indicatie": 1.30},
    {"product": "Knoflook bol", "categorie": "groente", "hoeveelheid": "2 bollen", "winkel": "lidl", "prijs_indicatie": 1.00},
    {"product": "Paprika rood/geel", "categorie": "groente", "hoeveelheid": "5 stuks", "winkel": "lidl", "prijs_indicatie": 4.00},
    {"product": "Courgette", "categorie": "groente", "hoeveelheid": "2 stuks", "winkel": "lidl", "prijs_indicatie": 2.00},
    {"product": "Wortel zak 1kg", "categorie": "groente", "hoeveelheid": "1 zak", "winkel": "lidl", "prijs_indicatie": 1.20},
    {"product": "Spinazie diepvries 450g", "categorie": "groente", "hoeveelheid": "2 zakken", "winkel": "lidl", "prijs_indicatie": 3.00},
    {"product": "Cherrytomaten 500g", "categorie": "groente", "hoeveelheid": "1 bakje", "winkel": "lidl", "prijs_indicatie": 1.80},
    # Koolhydraten
    {"product": "Rode aardappel", "categorie": "koolhydraten", "hoeveelheid": "2 kg", "winkel": "lidl", "prijs_indicatie": 3.00},
    {"product": "Zoete aardappel", "categorie": "koolhydraten", "hoeveelheid": "1,5 kg", "winkel": "lidl", "prijs_indicatie": 3.50},
    {"product": "Volkorenbrood", "categorie": "koolhydraten", "hoeveelheid": "2 broden", "winkel": "lidl", "prijs_indicatie": 3.60},
    {"product": "Havermout 1kg", "categorie": "koolhydraten", "hoeveelheid": "1 pak (2 weken)", "winkel": "lidl", "prijs_indicatie": 1.50},
    {"product": "Volkorenwraps", "categorie": "koolhydraten", "hoeveelheid": "1 pak 8 stuks", "winkel": "lidl", "prijs_indicatie": 1.50},
    # Conserven
    {"product": "Tonijn in olijfolie 80g", "categorie": "conserven", "hoeveelheid": "5 blikjes", "winkel": "lidl", "prijs_indicatie": 5.00},
    {"product": "Tomatenpuree 70g", "categorie": "conserven", "hoeveelheid": "2 blikjes", "winkel": "lidl", "prijs_indicatie": 1.20},
]

FREEZER_ITEMS_PER_WEEK = {
    1: [
        {"product": "Gehakt 300g (3 pakjes)", "hoeveelheid": "900g", "ontdooi_dag": "woensdag", "gebruik_dag": "donderdag"},
        {"product": "Ribeye 250g", "hoeveelheid": "250g", "ontdooi_dag": "vrijdag", "gebruik_dag": "zaterdag"},
    ],
    2: [
        {"product": "Riblap 800g", "hoeveelheid": "800g", "ontdooi_dag": "dinsdag", "gebruik_dag": "donderdag"},
        {"product": "Worstjes 4 stuks", "hoeveelheid": "200g", "ontdooi_dag": "vrijdag", "gebruik_dag": "zaterdag"},
    ],
    3: [
        {"product": "Rosbief 700g", "hoeveelheid": "700g", "ontdooi_dag": "vrijdag", "gebruik_dag": "zondag"},
        {"product": "Entrecote 250g", "hoeveelheid": "250g", "ontdooi_dag": "maandag", "gebruik_dag": "dinsdag"},
    ],
    4: [
        {"product": "Gehakt 300g (3 pakjes)", "hoeveelheid": "900g", "ontdooi_dag": "woensdag", "gebruik_dag": "donderdag"},
        {"product": "Kogelbiefstuk 500g", "hoeveelheid": "500g", "ontdooi_dag": "zaterdag", "gebruik_dag": "zondag"},
    ],
    5: [
        {"product": "Riblap 800g", "hoeveelheid": "800g", "ontdooi_dag": "dinsdag", "gebruik_dag": "donderdag"},
        {"product": "Gehakt 300g (2 pakjes)", "hoeveelheid": "600g", "ontdooi_dag": "woensdag", "gebruik_dag": "donderdag"},
    ],
    6: [
        {"product": "Entrecote 250g", "hoeveelheid": "250g", "ontdooi_dag": "maandag", "gebruik_dag": "dinsdag"},
        {"product": "Ossenhaas 400g", "hoeveelheid": "400g", "ontdooi_dag": "zaterdag", "gebruik_dag": "zondag"},
    ],
    7: [
        {"product": "Gehakt 300g (3 pakjes)", "hoeveelheid": "900g", "ontdooi_dag": "woensdag", "gebruik_dag": "donderdag"},
        {"product": "Worstjes 4 stuks", "hoeveelheid": "200g", "ontdooi_dag": "vrijdag", "gebruik_dag": "zaterdag"},
    ],
    8: [
        {"product": "Tartaar 500g", "hoeveelheid": "500g", "ontdooi_dag": "dinsdag", "gebruik_dag": "woensdag"},
        {"product": "Magere lap 300g", "hoeveelheid": "300g", "ontdooi_dag": "vrijdag", "gebruik_dag": "zaterdag"},
    ],
}


def seed():
    db = SessionLocal()
    try:
        if db.query(Recipe).count() > 0:
            print("Database al geseed — overgeslagen.")
            return

        recipe_map = {}
        for r in RECIPES:
            recipe = Recipe(**r)
            db.add(recipe)
            db.flush()
            recipe_map[r["naam"]] = recipe.id

        for nc in NUTRITION_CYCLE:
            db.add(NutritionCycle(**nc))

        for week in range(1, 9):
            for item in SHOPPING_BASE_WEEK:
                db.add(ShoppingList(cyclus_week=week, **item))
            for fi in FREEZER_ITEMS_PER_WEEK.get(week, []):
                db.add(FreezerItem(cyclus_week=week, **fi))

        db.commit()
        print(f"Seed klaar: {len(RECIPES)} recepten, 8 weken schema, boodschappen en vriezer items.")
    finally:
        db.close()


if __name__ == "__main__":
    seed()
```

- [ ] **Stap 2: Run seed script**

```bash
make seed
```
Verwacht: `Seed klaar: 18 recepten, 8 weken schema, boodschappen en vriezer items.`

- [ ] **Stap 3: Verifieer via API**

```bash
curl http://localhost:8000/api/recipes | python3 -m json.tool | head -30
```
Verwacht: JSON array met recepten

- [ ] **Stap 4: Commit**

```bash
git add backend/db/seed.py
git commit -m "feat: seed voedingsschema v8 — 18 recepten + 8-weeks cyclus"
```

---

## Phase 4: Telegram + Scheduler

### Task 10: Telegram bot setup

**Files:**
- Create: `backend/telegram/__init__.py`
- Create: `backend/telegram/bot.py`

- [ ] **Stap 1: Telegram bot aanmaken via BotFather**

Open Telegram → zoek `@BotFather` → `/newbot` → volg instructies.
Kopieer het bot token naar `.env` als `TELEGRAM_BOT_TOKEN`.

Haal je chat ID op: stuur een bericht naar je bot, dan:
```bash
curl "https://api.telegram.org/bot<TOKEN>/getUpdates"
```
Kopieer `result[0].message.chat.id` naar `.env` als `TELEGRAM_CHAT_ID`.

- [ ] **Stap 2: Schrijf falende test voor message formatter**

Maak `tests/test_telegram.py`:

```python
from backend.telegram.bot import format_weekly_message

def test_format_weekly_message_contains_sections():
    week_plan = {
        "week": 1,
        "vlees_thema": "Gehakt week",
        "dagen": [
            {
                "dag": "maandag",
                "maaltijden": [
                    {"maaltijd_type": "ontbijt", "naam": "Havermout", "eiwit_g": 32.0},
                    {"maaltijd_type": "lunch", "naam": "Kwark wrap", "eiwit_g": 28.0},
                    {"maaltijd_type": "diner", "naam": "Bolognese", "eiwit_g": 48.0},
                ],
                "totaal_eiwit_g": 108.0,
                "totaal_kcal": 1620,
            }
        ],
        "shopping": [
            {"product": "Kwark 500g", "categorie": "zuivel", "hoeveelheid": "7 pakken"},
        ],
        "freezer": [
            {"product": "Gehakt 300g", "ontdooi_dag": "woensdag", "gebruik_dag": "donderdag"},
        ],
    }
    msg = format_weekly_message(week_plan)
    assert "👨‍🍳 Chef Agent" in msg
    assert "MAALTIJDPLAN" in msg
    assert "BOODSCHAPPEN" in msg
    assert "VRIEZER" in msg
    assert "maandag" in msg.lower()
```

- [ ] **Stap 3: Run test — verwacht FAIL**

```bash
pytest tests/test_telegram.py -v
```

- [ ] **Stap 4: Maak backend/telegram/\_\_init\_\_.py** (leeg)

- [ ] **Stap 5: Maak backend/telegram/bot.py**

```python
import asyncio
from typing import Optional
from telegram import Bot
from backend.config import settings

DAG_AFKORTINGEN = {
    "maandag": "Ma",
    "dinsdag": "Di",
    "woensdag": "Wo",
    "donderdag": "Do",
    "vrijdag": "Vr",
    "zaterdag": "Za",
    "zondag": "Zo",
}

CATEGORIE_VOLGORDE = ["zuivel", "groente", "koolhydraten", "fruit", "conserven", "overig"]


def format_weekly_message(week_data: dict) -> str:
    week_num = week_data["week"]
    vlees_thema = week_data.get("vlees_thema", "")
    lines = [
        f"👨‍🍳 *Chef Agent — Week {week_num}* | {vlees_thema}",
        "",
        "📅 *MAALTIJDPLAN*",
        "━━━━━━━━━━━━━━━━━━",
    ]

    for dag_data in week_data["dagen"]:
        dag = dag_data["dag"]
        afk = DAG_AFKORTINGEN.get(dag, dag[:2].capitalize())
        maaltijden = dag_data["maaltijden"]

        namen = [m["naam"] for m in maaltijden if m.get("naam")]
        if not namen:
            lines.append(f"{afk}: —")
            continue

        if dag in ("maandag", "woensdag"):
            lines.append(f"{afk}: {' · '.join(namen)} _(kantoor)_")
        elif dag_data.get("is_batch"):
            lines.append(f"{afk}: 🍳 BATCH — {' · '.join(namen)}")
        else:
            lines.append(f"{afk}: {' · '.join(namen)}")

    lines += ["", "🛒 *BOODSCHAPPEN LIDL*", "━━━━━━━━━━━━━━━━━━"]

    shopping = week_data.get("shopping", [])
    by_cat: dict[str, list] = {}
    for item in shopping:
        cat = item.get("categorie", "overig")
        by_cat.setdefault(cat, []).append(f"{item['product']} {item.get('hoeveelheid', '')}")

    for cat in CATEGORIE_VOLGORDE:
        if cat in by_cat:
            lines.append(f"_{cat.capitalize()}:_ {' · '.join(by_cat[cat])}")
    for cat, items in by_cat.items():
        if cat not in CATEGORIE_VOLGORDE:
            lines.append(f"_{cat.capitalize()}:_ {' · '.join(items)}")

    freezer = week_data.get("freezer", [])
    if freezer:
        lines += ["", "❄️ *VRIEZER*", "━━━━━━━━━━━━━━━━━━"]
        for fi in freezer:
            lines.append(
                f"{fi['ontdooi_dag'].capitalize()}: haal _{fi['product']}_ eruit → gebruik {fi['gebruik_dag']}"
            )

    lines += ["", "💪 _Week target: 160g eiwit/dag · 2700\\-2900 kcal_"]
    return "\n".join(lines)


async def send_weekly_message(week_data: dict) -> None:
    if not settings.telegram_bot_token or not settings.telegram_chat_id:
        print("Telegram niet geconfigureerd — bericht overgeslagen")
        return
    bot = Bot(token=settings.telegram_bot_token)
    message = format_weekly_message(week_data)
    await bot.send_message(
        chat_id=settings.telegram_chat_id,
        text=message,
        parse_mode="MarkdownV2",
    )
```

- [ ] **Stap 6: Run test — verwacht PASS**

```bash
pytest tests/test_telegram.py -v
```
Verwacht: `1 passed`

- [ ] **Stap 7: Commit**

```bash
git add backend/telegram/ tests/test_telegram.py
git commit -m "feat: Telegram message formatter"
```

---

### Task 11: APScheduler wekelijkse job

**Files:**
- Create: `backend/scheduler/__init__.py`
- Create: `backend/scheduler/weekly_job.py`
- Modify: `backend/main.py`

- [ ] **Stap 1: Maak backend/scheduler/\_\_init\_\_.py** (leeg)

- [ ] **Stap 2: Maak backend/scheduler/weekly_job.py**

```python
import asyncio
from datetime import datetime
from sqlalchemy.orm import Session
from backend.db.session import SessionLocal
from backend.db.models import MealPlan, ShoppingList, FreezerItem, NutritionCycle, Recipe
from backend.telegram.bot import send_weekly_message


def get_current_cycle_week() -> int:
    """Bereken welke week (1-8) van de cyclus het is op basis van week van het jaar."""
    week_of_year = datetime.now().isocalendar()[1]
    return ((week_of_year - 1) % 8) + 1


def build_week_data(db: Session, cyclus_week: int) -> dict:
    nc = db.query(NutritionCycle).filter(NutritionCycle.cyclus_week == cyclus_week).first()
    vlees_thema = nc.vlees_type if nc else "Onbekend"

    dagen = []
    dag_namen = ["maandag", "dinsdag", "woensdag", "donderdag", "vrijdag", "zaterdag", "zondag"]
    batch_dagen = {"donderdag", "zondag"}

    for dag in dag_namen:
        entries = (
            db.query(MealPlan)
            .filter(MealPlan.cyclus_week == cyclus_week, MealPlan.dag == dag)
            .all()
        )
        maaltijden = []
        totaal_eiwit = 0.0
        totaal_kcal = 0
        for e in entries:
            if e.recipe:
                maaltijden.append({
                    "maaltijd_type": e.maaltijd_type,
                    "naam": e.recipe.naam,
                    "eiwit_g": e.recipe.eiwit_g or 0,
                })
                totaal_eiwit += e.recipe.eiwit_g or 0
                totaal_kcal += e.recipe.kcal or 0
        dagen.append({
            "dag": dag,
            "maaltijden": maaltijden,
            "totaal_eiwit_g": totaal_eiwit,
            "totaal_kcal": totaal_kcal,
            "is_batch": dag in batch_dagen,
        })

    shopping = db.query(ShoppingList).filter(ShoppingList.cyclus_week == cyclus_week).all()
    freezer = db.query(FreezerItem).filter(FreezerItem.cyclus_week == cyclus_week).all()

    return {
        "week": cyclus_week,
        "vlees_thema": vlees_thema,
        "dagen": dagen,
        "shopping": [
            {"product": s.product, "categorie": s.categorie, "hoeveelheid": s.hoeveelheid}
            for s in shopping
        ],
        "freezer": [
            {"product": f.product, "ontdooi_dag": f.ontdooi_dag, "gebruik_dag": f.gebruik_dag}
            for f in freezer
        ],
    }


def run_weekly_job():
    db = SessionLocal()
    try:
        cyclus_week = get_current_cycle_week()
        week_data = build_week_data(db, cyclus_week)
        asyncio.run(send_weekly_message(week_data))
        print(f"Wekelijks Telegram bericht verstuurd voor cyclus week {cyclus_week}")
    finally:
        db.close()
```

- [ ] **Stap 3: Update backend/main.py — voeg scheduler toe**

```python
from contextlib import asynccontextmanager
from apscheduler.schedulers.background import BackgroundScheduler
from apscheduler.triggers.cron import CronTrigger
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backend.api import recipes, meal_plans, shopping
from backend.scheduler.weekly_job import run_weekly_job

scheduler = BackgroundScheduler()


@asynccontextmanager
async def lifespan(app: FastAPI):
    scheduler.add_job(
        run_weekly_job,
        CronTrigger(day_of_week="sun", hour=9, minute=0),
        id="weekly_telegram",
        replace_existing=True,
    )
    scheduler.start()
    yield
    scheduler.shutdown()


app = FastAPI(title="Chef Agent", version="1.0.0", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(recipes.router, prefix="/api/recipes", tags=["recipes"])
app.include_router(meal_plans.router, prefix="/api/meal-plans", tags=["meal-plans"])
app.include_router(shopping.router, prefix="/api/shopping", tags=["shopping"])


@app.get("/health")
def health():
    return {"status": "ok"}


@app.post("/api/admin/send-weekly-now")
def trigger_weekly_now():
    """Handmatig de weekly job triggeren voor testen."""
    run_weekly_job()
    return {"status": "verzonden"}
```

- [ ] **Stap 4: Test de scheduler handmatig**

Start de dev server, stuur een test bericht:
```bash
make dev &
curl -X POST http://localhost:8000/api/admin/send-weekly-now
```
Verwacht: Telegram bericht ontvangen op je telefoon.

- [ ] **Stap 5: Run alle tests**

```bash
pytest tests/ -v
```
Verwacht: alle groen

- [ ] **Stap 6: Commit**

```bash
git add backend/scheduler/ backend/main.py
git commit -m "feat: APScheduler wekelijkse Telegram job — zondag 09:00"
```

---

## Phase 5: AI Agent

### Task 12: Ollama client

**Files:**
- Create: `backend/ai/__init__.py`
- Create: `backend/ai/ollama_client.py`

- [ ] **Stap 1: Schrijf falende test**

Maak `tests/test_ai_agent.py`:

```python
import pytest
from unittest.mock import patch, AsyncMock
from backend.ai.ollama_client import estimate_macros

@pytest.mark.asyncio
async def test_estimate_macros_returns_dict():
    mock_response = '{"kcal": 650, "eiwit_g": 48.0, "vet_g": 22.0, "koolhydraten_g": 55.0}'
    with patch("backend.ai.ollama_client.httpx.AsyncClient") as mock_client:
        mock_instance = AsyncMock()
        mock_client.return_value.__aenter__.return_value = mock_instance
        mock_instance.post.return_value.json.return_value = {
            "response": mock_response
        }
        result = await estimate_macros("Bolognese", ["450g gehakt", "pasta 200g", "tomatensaus"])
    assert "kcal" in result
    assert "eiwit_g" in result
```

- [ ] **Stap 2: Maak backend/ai/\_\_init\_\_.py** (leeg)

- [ ] **Stap 3: Maak backend/ai/ollama_client.py**

```python
import json
import httpx
from backend.config import settings

MACRO_PROMPT = """Schat de macronutriënten voor dit recept en geef een JSON terug (enkel JSON, geen uitleg):
Recept: {naam}
Ingrediënten: {ingredienten}

Geef terug als JSON:
{{"kcal": <int>, "eiwit_g": <float>, "vet_g": <float>, "koolhydraten_g": <float>}}"""


async def ollama_chat(prompt: str, model: str = "llama3.1:8b") -> str:
    async with httpx.AsyncClient(timeout=60.0) as client:
        response = await client.post(
            f"{settings.ollama_base_url}/api/generate",
            json={"model": model, "prompt": prompt, "stream": False},
        )
        response.raise_for_status()
        return response.json()["response"]


async def estimate_macros(naam: str, ingredienten: list[str]) -> dict:
    prompt = MACRO_PROMPT.format(naam=naam, ingredienten=", ".join(ingredienten))
    raw = await ollama_chat(prompt)
    try:
        start = raw.find("{")
        end = raw.rfind("}") + 1
        return json.loads(raw[start:end])
    except (json.JSONDecodeError, ValueError):
        return {"kcal": None, "eiwit_g": None, "vet_g": None, "koolhydraten_g": None}


async def generate_shopping_list(week_plan: dict) -> list[dict]:
    """Genereer een boodschappenlijst op basis van het weekplan."""
    recepten = []
    for dag in week_plan.get("dagen", []):
        for m in dag.get("maaltijden", []):
            if m.get("naam"):
                recepten.append(m["naam"])

    prompt = f"""Maak een boodschappenlijst voor deze maaltijden deze week:
{chr(10).join(f'- {r}' for r in recepten)}

Geef terug als JSON array:
[{{"product": "...", "categorie": "zuivel|groente|koolhydraten|conserven|overig", "hoeveelheid": "..."}}]
Alleen JSON, geen uitleg."""

    raw = await ollama_chat(prompt)
    try:
        start = raw.find("[")
        end = raw.rfind("]") + 1
        return json.loads(raw[start:end])
    except (json.JSONDecodeError, ValueError):
        return []
```

- [ ] **Stap 4: Run test**

```bash
pytest tests/test_ai_agent.py::test_estimate_macros_returns_dict -v
```
Verwacht: `1 passed`

- [ ] **Stap 5: Commit**

```bash
git add backend/ai/__init__.py backend/ai/ollama_client.py tests/test_ai_agent.py
git commit -m "feat: Ollama client voor macro-schatting en boodschappenlijst"
```

---

### Task 13: Claude client + hybride agent router

**Files:**
- Create: `backend/ai/claude_client.py`
- Create: `backend/ai/agent.py`
- Modify: `backend/api/recipes.py`

- [ ] **Stap 1: Schrijf falende test voor Claude client**

Voeg toe aan `tests/test_ai_agent.py`:

```python
from unittest.mock import patch, MagicMock
from backend.ai.claude_client import integrate_recipe_in_schema

@pytest.mark.asyncio
async def test_integrate_recipe_calls_claude():
    with patch("backend.ai.claude_client.anthropic.Anthropic") as mock_anthropic:
        mock_client = MagicMock()
        mock_anthropic.return_value = mock_client
        mock_client.messages.create.return_value.content = [
            MagicMock(text='{"status": "ok", "aanpassingen": []}')
        ]
        result = await integrate_recipe_in_schema(
            recept={"naam": "Nieuw recept", "categorie": "diner", "kcal": 600, "eiwit_g": 45.0},
            huidig_schema=[]
        )
    assert "status" in result
```

- [ ] **Stap 2: Maak backend/ai/claude_client.py**

```python
import json
import anthropic
from backend.config import settings

INTEGRATE_PROMPT = """Je bent een voedingsschema expert. Een gebruiker wil een nieuw recept toevoegen aan zijn 8-weeks voedingsschema.

Nieuw recept:
{recept}

Huidig schema (week en dag toewijzingen):
{schema}

Macro targets: 2700-2900 kcal/dag, 160g eiwit/dag, 80g vet/dag, 320-350g koolhydraten/dag.

Integreer het recept op een logische plek in het schema. Geef terug als JSON:
{{"status": "ok", "aanpassingen": [{{"week": <int>, "dag": "<dag>", "maaltijd_type": "<type>", "actie": "vervang|toevoeg"}}], "uitleg": "<kort>"}}

Alleen JSON, geen uitleg."""


async def integrate_recipe_in_schema(recept: dict, huidig_schema: list) -> dict:
    client = anthropic.Anthropic(api_key=settings.anthropic_api_key)
    message = client.messages.create(
        model="claude-sonnet-4-6",
        max_tokens=1024,
        messages=[{
            "role": "user",
            "content": INTEGRATE_PROMPT.format(
                recept=json.dumps(recept, ensure_ascii=False),
                schema=json.dumps(huidig_schema, ensure_ascii=False),
            )
        }],
    )
    raw = message.content[0].text
    try:
        start = raw.find("{")
        end = raw.rfind("}") + 1
        return json.loads(raw[start:end])
    except (json.JSONDecodeError, ValueError):
        return {"status": "error", "aanpassingen": [], "uitleg": "Parse fout"}


async def validate_week_macros(week_data: dict) -> dict:
    """Valideer de macro's van een week tegen de targets."""
    client = anthropic.Anthropic(api_key=settings.anthropic_api_key)
    message = client.messages.create(
        model="claude-sonnet-4-6",
        max_tokens=512,
        messages=[{
            "role": "user",
            "content": f"""Controleer of dit weekplan voldoet aan de macro targets (2700-2900 kcal/dag, 160g eiwit/dag):
{json.dumps(week_data, ensure_ascii=False)}

Geef terug als JSON:
{{"voldoet": true/false, "gemiddeld_eiwit_g": <float>, "gemiddeld_kcal": <int>, "opmerkingen": "<tekst>"}}"""
        }],
    )
    raw = message.content[0].text
    try:
        start = raw.find("{")
        end = raw.rfind("}") + 1
        return json.loads(raw[start:end])
    except (json.JSONDecodeError, ValueError):
        return {"voldoet": None, "opmerkingen": "Validatie mislukt"}
```

- [ ] **Stap 3: Maak backend/ai/agent.py — hybride router**

```python
from backend.ai.ollama_client import estimate_macros, generate_shopping_list
from backend.ai.claude_client import integrate_recipe_in_schema, validate_week_macros


async def fill_recipe_macros(naam: str, ingredienten: list[str]) -> dict:
    """Ollama: snel macro's schatten voor nieuw recept."""
    return await estimate_macros(naam, ingredienten)


async def add_recipe_to_schema(recept: dict, huidig_schema: list) -> dict:
    """Claude API: recept integreren in 8-weeks schema + valideren."""
    integratie = await integrate_recipe_in_schema(recept, huidig_schema)
    return integratie


async def check_week_macros(week_data: dict) -> dict:
    """Claude API: week macro's valideren tegen targets."""
    return await validate_week_macros(week_data)


async def generate_week_shopping(week_plan: dict) -> list[dict]:
    """Ollama: boodschappenlijst genereren op basis van weekplan."""
    return await generate_shopping_list(week_plan)
```

- [ ] **Stap 4: Voeg AI endpoint toe aan recipes.py**

Voeg onderaan `backend/api/recipes.py` toe:

```python
from pydantic import BaseModel as PydanticBaseModel
from backend.ai.agent import fill_recipe_macros

class AiFillMacrosIn(PydanticBaseModel):
    naam: str
    ingredienten: list[str]

@router.post("/ai-fill-macros")
async def ai_fill_macros(payload: AiFillMacrosIn):
    """Ollama schat macro's voor een recept op basis van naam + ingrediënten."""
    result = await fill_recipe_macros(payload.naam, payload.ingredienten)
    return result
```

- [ ] **Stap 5: Run alle tests**

```bash
pytest tests/ -v
```
Verwacht: alle groen

- [ ] **Stap 6: Commit**

```bash
git add backend/ai/claude_client.py backend/ai/agent.py tests/test_ai_agent.py
git commit -m "feat: Claude client + hybride AI agent router"
```

---

## Phase 6: Frontend

### Task 14: React + Vite + TailwindCSS setup

**Files:**
- Create: `frontend/package.json`
- Create: `frontend/vite.config.js`
- Create: `frontend/tailwind.config.js`
- Create: `frontend/src/main.jsx`
- Create: `frontend/src/App.jsx`
- Create: `frontend/src/api/client.js`

- [ ] **Stap 1: Initialiseer React project**

```bash
cd frontend
npm create vite@latest . -- --template react
npm install
npm install -D tailwindcss postcss autoprefixer
npm install react-router-dom axios
npx tailwindcss init -p
```

- [ ] **Stap 2: Update tailwind.config.js**

```js
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        brand: "#16a34a",
      },
    },
  },
  plugins: [],
};
```

- [ ] **Stap 3: Update frontend/src/index.css**

```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

- [ ] **Stap 4: Maak frontend/src/api/client.js**

```js
import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:8000",
});

export const getRecipes = (search = "") =>
  api.get(`/api/recipes${search ? `?search=${search}` : ""}`).then((r) => r.data);

export const createRecipe = (data) =>
  api.post("/api/recipes", data).then((r) => r.data);

export const deleteRecipe = (id) =>
  api.delete(`/api/recipes/${id}`);

export const getWeekPlan = (week) =>
  api.get(`/api/meal-plans/week/${week}`).then((r) => r.data);

export const getShoppingList = (week) =>
  api.get(`/api/shopping/week/${week}`).then((r) => r.data);

export const aiFillMacros = (naam, ingredienten) =>
  api.post("/api/recipes/ai-fill-macros", { naam, ingredienten }).then((r) => r.data);
```

- [ ] **Stap 5: Maak frontend/src/App.jsx**

```jsx
import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import Home from "./pages/Home";
import Recipes from "./pages/Recipes";
import WeekPlan from "./pages/WeekPlan";

export default function App() {
  return (
    <BrowserRouter>
      <div className="max-w-md mx-auto min-h-screen bg-gray-50">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/recepten" element={<Recipes />} />
          <Route path="/weekplan" element={<WeekPlan />} />
        </Routes>
        <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md bg-white border-t border-gray-200 flex">
          <Link to="/" className="flex-1 py-3 text-center text-xs text-gray-500 hover:text-brand flex flex-col items-center gap-0.5">
            <span className="text-lg">🏠</span>Home
          </Link>
          <Link to="/recepten" className="flex-1 py-3 text-center text-xs text-gray-500 hover:text-brand flex flex-col items-center gap-0.5">
            <span className="text-lg">📖</span>Recepten
          </Link>
          <Link to="/weekplan" className="flex-1 py-3 text-center text-xs text-gray-500 hover:text-brand flex flex-col items-center gap-0.5">
            <span className="text-lg">📅</span>Week
          </Link>
        </nav>
      </div>
    </BrowserRouter>
  );
}
```

- [ ] **Stap 6: Start frontend dev server**

```bash
cd frontend && npm run dev
```
Verwacht: `http://localhost:5173` — lege app met bottom nav

- [ ] **Stap 7: Commit**

```bash
cd ..
git add frontend/
git commit -m "feat: React + Vite + TailwindCSS frontend setup"
```

---

### Task 15: Home pagina

**Files:**
- Create: `frontend/src/pages/Home.jsx`
- Create: `frontend/src/components/FreezerBanner.jsx`

- [ ] **Stap 1: Maak frontend/src/components/FreezerBanner.jsx**

```jsx
export default function FreezerBanner({ items }) {
  if (!items || items.length === 0) return null;
  return (
    <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 mb-3">
      <p className="text-amber-800 text-xs font-semibold mb-1">❄️ Vriezer reminder</p>
      {items.map((item, i) => (
        <p key={i} className="text-amber-700 text-sm">
          {item.ontdooi_dag?.charAt(0).toUpperCase() + item.ontdooi_dag?.slice(1)}: haal{" "}
          <span className="font-medium">{item.product}</span> eruit → gebruik {item.gebruik_dag}
        </p>
      ))}
    </div>
  );
}
```

- [ ] **Stap 2: Maak frontend/src/pages/Home.jsx**

```jsx
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getWeekPlan, getShoppingList } from "../api/client";
import FreezerBanner from "../components/FreezerBanner";

const CYCLE_START_ISO_WEEK = 1;

function getCurrentCycleWeek() {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 1);
  const weekOfYear = Math.ceil(((now - start) / 86400000 + start.getDay() + 1) / 7);
  return ((weekOfYear - 1) % 8) + 1;
}

const GREET = () => {
  const h = new Date().getHours();
  if (h < 12) return "Goedemorgen";
  if (h < 18) return "Goedemiddag";
  return "Goedenavond";
};

const DAG_NL = ["zondag", "maandag", "dinsdag", "woensdag", "donderdag", "vrijdag", "zaterdag"];

export default function Home() {
  const [weekPlan, setWeekPlan] = useState(null);
  const [freezerItems, setFreezerItems] = useState([]);
  const navigate = useNavigate();
  const cycleWeek = getCurrentCycleWeek();
  const vandaag = DAG_NL[new Date().getDay()];

  useEffect(() => {
    getWeekPlan(cycleWeek).then(setWeekPlan).catch(console.error);
  }, [cycleWeek]);

  useEffect(() => {
    getShoppingList(cycleWeek)
      .then((data) => {/* freezer komt via apart endpoint in v2 */})
      .catch(console.error);
  }, [cycleWeek]);

  const vandaagPlan = weekPlan?.dagen?.find((d) => d.dag === vandaag);
  const diner = vandaagPlan?.maaltijden?.find((m) => m.maaltijd_type === "diner");

  return (
    <div className="p-4 pb-20">
      <div className="mb-4">
        <h1 className="text-xl font-bold text-gray-900">{GREET()} 👋</h1>
        <p className="text-gray-500 text-sm">Week {cycleWeek} · {weekPlan ? weekPlan.vlees_thema || "" : "laden..."}</p>
      </div>

      {diner && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-3 mb-3">
          <p className="text-gray-400 text-xs font-semibold uppercase mb-1">
            Vandaag · {vandaag.charAt(0).toUpperCase() + vandaag.slice(1)}
          </p>
          <p className="font-semibold text-gray-900">🍽️ {diner.naam}</p>
          <div className="flex gap-2 mt-2">
            {diner.eiwit_g && (
              <span className="bg-green-50 text-green-700 text-xs font-semibold px-2 py-0.5 rounded-md">
                {Math.round(diner.eiwit_g)}g eiwit
              </span>
            )}
            {diner.kcal && (
              <span className="bg-blue-50 text-blue-700 text-xs font-semibold px-2 py-0.5 rounded-md">
                {diner.kcal} kcal
              </span>
            )}
          </div>
        </div>
      )}

      <FreezerBanner items={freezerItems} />

      <div className="grid grid-cols-2 gap-3">
        <Link to="/weekplan" className="bg-white border border-gray-200 rounded-xl p-3 text-center shadow-sm active:bg-gray-50">
          <div className="text-2xl mb-1">🛒</div>
          <p className="text-gray-700 text-sm font-semibold">Boodschappen</p>
        </Link>
        <Link to="/recepten" className="bg-white border border-gray-200 rounded-xl p-3 text-center shadow-sm active:bg-gray-50">
          <div className="text-2xl mb-1">📖</div>
          <p className="text-gray-700 text-sm font-semibold">Recepten</p>
        </Link>
        <Link to="/weekplan" className="bg-white border border-gray-200 rounded-xl p-3 text-center shadow-sm active:bg-gray-50">
          <div className="text-2xl mb-1">📅</div>
          <p className="text-gray-700 text-sm font-semibold">Week plan</p>
        </Link>
        <Link to="/recepten?new=1" className="bg-brand rounded-xl p-3 text-center active:opacity-90">
          <div className="text-2xl mb-1">➕</div>
          <p className="text-white text-sm font-bold">Nieuw recept</p>
        </Link>
      </div>
    </div>
  );
}
```

- [ ] **Stap 3: Verifieer in browser**

```
http://localhost:5173
```
Controleer: begroeting zichtbaar, snelknoppen werken, navigatie werkt.

- [ ] **Stap 4: Commit**

```bash
git add frontend/src/pages/Home.jsx frontend/src/components/FreezerBanner.jsx
git commit -m "feat: Home pagina met dagkaart en snelknoppen"
```

---

### Task 16: Recepten pagina

**Files:**
- Create: `frontend/src/pages/Recipes.jsx`
- Create: `frontend/src/components/RecipeCard.jsx`

- [ ] **Stap 1: Maak frontend/src/components/RecipeCard.jsx**

```jsx
const CATEGORY_EMOJI = {
  ontbijt: "🥣",
  lunch: "🥗",
  diner: "🍽️",
  snack: "🍎",
};

export default function RecipeCard({ recipe, onDelete }) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-3 flex items-center gap-3 shadow-sm">
      <span className="text-2xl">{CATEGORY_EMOJI[recipe.categorie] || "🍴"}</span>
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-gray-900 text-sm truncate">{recipe.naam}</p>
        <p className="text-gray-400 text-xs">
          {recipe.vlees_type && `${recipe.vlees_type} · `}
          {recipe.eiwit_g && `${Math.round(recipe.eiwit_g)}g eiwit`}
          {recipe.kcal && ` · ${recipe.kcal} kcal`}
        </p>
      </div>
      {onDelete && (
        <button
          onClick={() => onDelete(recipe.id)}
          className="text-gray-300 hover:text-red-400 text-lg px-1"
          aria-label="Verwijder recept"
        >
          ×
        </button>
      )}
    </div>
  );
}
```

- [ ] **Stap 2: Maak frontend/src/pages/Recipes.jsx**

```jsx
import { useEffect, useState, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import { getRecipes, createRecipe, deleteRecipe, aiFillMacros } from "../api/client";
import RecipeCard from "../components/RecipeCard";

export default function Recipes() {
  const [recipes, setRecipes] = useState([]);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ naam: "", ingredienten: "", categorie: "diner" });
  const [macros, setMacros] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searchParams] = useSearchParams();

  useEffect(() => {
    if (searchParams.get("new") === "1") setShowForm(true);
  }, [searchParams]);

  useEffect(() => {
    getRecipes(search).then(setRecipes).catch(console.error);
  }, [search]);

  const handleAiFill = async () => {
    if (!formData.naam || !formData.ingredienten) return;
    setLoading(true);
    try {
      const result = await aiFillMacros(
        formData.naam,
        formData.ingredienten.split("\n").filter(Boolean)
      );
      setMacros(result);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    const payload = {
      naam: formData.naam,
      categorie: formData.categorie,
      ...macros,
    };
    await createRecipe(payload);
    setFormData({ naam: "", ingredienten: "", categorie: "diner" });
    setMacros(null);
    setShowForm(false);
    getRecipes(search).then(setRecipes);
  };

  const handleDelete = async (id) => {
    if (!confirm("Recept verwijderen?")) return;
    await deleteRecipe(id);
    setRecipes((r) => r.filter((x) => x.id !== id));
  };

  return (
    <div className="p-4 pb-20">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-bold text-gray-900">Recepten</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-brand text-white text-sm font-semibold px-3 py-1.5 rounded-lg"
        >
          {showForm ? "Annuleer" : "➕ Nieuw"}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleCreate} className="bg-white border border-gray-200 rounded-xl p-4 mb-4 shadow-sm">
          <p className="font-semibold text-gray-800 mb-3">Nieuw recept</p>
          <input
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm mb-2 focus:outline-none focus:ring-2 focus:ring-brand"
            placeholder="Naam recept"
            value={formData.naam}
            onChange={(e) => setFormData({ ...formData, naam: e.target.value })}
            required
          />
          <select
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm mb-2"
            value={formData.categorie}
            onChange={(e) => setFormData({ ...formData, categorie: e.target.value })}
          >
            <option value="ontbijt">Ontbijt</option>
            <option value="lunch">Lunch</option>
            <option value="diner">Diner</option>
            <option value="snack">Snack</option>
          </select>
          <textarea
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm mb-2 h-20 resize-none focus:outline-none focus:ring-2 focus:ring-brand"
            placeholder={"Ingrediënten (één per regel)\nbijv:\n450g gehakt\n200g pasta"}
            value={formData.ingredienten}
            onChange={(e) => setFormData({ ...formData, ingredienten: e.target.value })}
          />
          {macros && (
            <div className="flex gap-2 mb-3 flex-wrap">
              <span className="bg-green-50 text-green-700 text-xs font-semibold px-2 py-1 rounded-md">
                Eiwit: {macros.eiwit_g}g
              </span>
              <span className="bg-blue-50 text-blue-700 text-xs font-semibold px-2 py-1 rounded-md">
                {macros.kcal} kcal
              </span>
              <span className="bg-orange-50 text-orange-700 text-xs font-semibold px-2 py-1 rounded-md">
                Vet: {macros.vet_g}g
              </span>
              <span className="bg-purple-50 text-purple-700 text-xs font-semibold px-2 py-1 rounded-md">
                KH: {macros.koolhydraten_g}g
              </span>
            </div>
          )}
          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleAiFill}
              disabled={loading}
              className="flex-1 border border-gray-200 text-gray-700 text-sm font-medium py-2 rounded-lg disabled:opacity-50"
            >
              {loading ? "AI bezig..." : "🤖 Macro's schatten"}
            </button>
            <button
              type="submit"
              className="flex-1 bg-brand text-white text-sm font-semibold py-2 rounded-lg"
            >
              Opslaan
            </button>
          </div>
        </form>
      )}

      <div className="bg-white border border-gray-200 rounded-xl px-3 py-2 flex items-center gap-2 mb-4 shadow-sm">
        <span className="text-gray-400">🔍</span>
        <input
          className="flex-1 text-sm text-gray-700 focus:outline-none"
          placeholder="Zoek recept..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="flex flex-col gap-2">
        {recipes.length === 0 && (
          <p className="text-center text-gray-400 text-sm py-8">Geen recepten gevonden</p>
        )}
        {recipes.map((r) => (
          <RecipeCard key={r.id} recipe={r} onDelete={handleDelete} />
        ))}
      </div>
    </div>
  );
}
```

- [ ] **Stap 3: Test in browser**

```
http://localhost:5173/recepten
```
Controleer: recepten laden, zoeken werkt, formulier opent, AI macro's knop zichtbaar.

- [ ] **Stap 4: Commit**

```bash
git add frontend/src/pages/Recipes.jsx frontend/src/components/RecipeCard.jsx
git commit -m "feat: Recepten pagina met zoeken en nieuw recept formulier"
```

---

### Task 17: Weekplanning pagina

**Files:**
- Create: `frontend/src/pages/WeekPlan.jsx`
- Create: `frontend/src/components/DayTabs.jsx`

- [ ] **Stap 1: Maak frontend/src/components/DayTabs.jsx**

```jsx
const DAYS = ["maandag", "dinsdag", "woensdag", "donderdag", "vrijdag", "zaterdag", "zondag"];
const SHORT = ["Ma", "Di", "Wo", "Do", "Vr", "Za", "Zo"];

export default function DayTabs({ selected, onChange, completedDays = [] }) {
  const todayIndex = new Date().getDay();
  const todayCycleIndex = todayIndex === 0 ? 6 : todayIndex - 1;

  return (
    <div className="flex gap-1.5 overflow-x-auto pb-1 -mx-4 px-4 scrollbar-hide">
      {DAYS.map((day, i) => {
        const isSelected = selected === day;
        const isToday = i === todayCycleIndex;
        return (
          <button
            key={day}
            onClick={() => onChange(day)}
            className={`flex-shrink-0 flex flex-col items-center rounded-xl px-2.5 py-2 min-w-[38px] transition-colors ${
              isSelected
                ? "bg-blue-600 text-white"
                : isToday
                ? "bg-blue-50 text-blue-600 border border-blue-200"
                : "bg-white border border-gray-200 text-gray-600"
            }`}
          >
            <span className="text-xs font-semibold">{SHORT[i]}</span>
            <span className="text-xs">{i + 1}</span>
          </button>
        );
      })}
    </div>
  );
}
```

- [ ] **Stap 2: Maak frontend/src/pages/WeekPlan.jsx**

```jsx
import { useEffect, useState } from "react";
import { getWeekPlan } from "../api/client";
import DayTabs from "../components/DayTabs";

const DAYS = ["maandag", "dinsdag", "woensdag", "donderdag", "vrijdag", "zaterdag", "zondag"];
const MEAL_EMOJI = { ontbijt: "🥣", lunch: "🥗", diner: "🍽️" };
const MEAL_LABELS = { ontbijt: "Ontbijt", lunch: "Lunch", diner: "Diner" };

function getCurrentCycleWeek() {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 1);
  const weekOfYear = Math.ceil(((now - start) / 86400000 + start.getDay() + 1) / 7);
  return ((weekOfYear - 1) % 8) + 1;
}

export default function WeekPlan() {
  const [weekPlan, setWeekPlan] = useState(null);
  const [selectedDay, setSelectedDay] = useState(DAYS[new Date().getDay() === 0 ? 6 : new Date().getDay() - 1]);
  const cycleWeek = getCurrentCycleWeek();

  useEffect(() => {
    getWeekPlan(cycleWeek).then(setWeekPlan).catch(console.error);
  }, [cycleWeek]);

  const dagData = weekPlan?.dagen?.find((d) => d.dag === selectedDay);

  return (
    <div className="p-4 pb-20">
      <div className="mb-4">
        <h1 className="text-xl font-bold text-gray-900">Week {cycleWeek}</h1>
        <p className="text-gray-500 text-sm">{weekPlan?.vlees_thema || "laden..."}</p>
      </div>

      <DayTabs selected={selectedDay} onChange={setSelectedDay} />

      <div className="mt-4">
        {!dagData ? (
          <p className="text-center text-gray-400 text-sm py-8">Laden...</p>
        ) : (
          <>
            <p className="text-blue-600 text-xs font-bold uppercase mb-3">
              {selectedDay.charAt(0).toUpperCase() + selectedDay.slice(1)}
            </p>

            <div className="flex flex-col gap-2 mb-4">
              {["ontbijt", "lunch", "diner"].map((type) => {
                const maaltijd = dagData.maaltijden?.find((m) => m.maaltijd_type === type);
                return (
                  <div key={type} className="bg-white border border-gray-200 rounded-xl p-3 flex items-center gap-3 shadow-sm">
                    <span className="text-xl">{MEAL_EMOJI[type]}</span>
                    <div className="flex-1">
                      <p className="text-gray-400 text-xs font-semibold uppercase">{MEAL_LABELS[type]}</p>
                      <p className="text-gray-800 text-sm font-medium">
                        {maaltijd?.naam || <span className="text-gray-300 italic">Niet ingesteld</span>}
                      </p>
                      {maaltijd?.eiwit_g && (
                        <p className="text-gray-400 text-xs">{Math.round(maaltijd.eiwit_g)}g eiwit</p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {(dagData.totaal_eiwit_g > 0 || dagData.totaal_kcal > 0) && (
              <div className="bg-green-50 border border-green-100 rounded-xl px-4 py-3 flex justify-between items-center">
                <span className="text-green-700 text-sm font-semibold">
                  ✅ {Math.round(dagData.totaal_eiwit_g)}g eiwit
                </span>
                <span className="text-gray-500 text-sm">{dagData.totaal_kcal} kcal</span>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
```

- [ ] **Stap 3: Test in browser**

```
http://localhost:5173/weekplan
```
Controleer: dag-tabs scrollen, klikken op dag toont maaltijden, dagtotalen tonen.

- [ ] **Stap 4: Commit**

```bash
git add frontend/src/pages/WeekPlan.jsx frontend/src/components/DayTabs.jsx
git commit -m "feat: Weekplanning pagina met dag-tabs en maaltijddetail"
```

---

## Phase 7: Deployment

### Task 18: Proxmox deployment script

**Files:**
- Create: `deploy/setup.sh`
- Create: `deploy/chef-agent.service`

- [ ] **Stap 1: Vraag vrij IP op via UniFi MCP**

```
Gebruik de mcp__unifi-homelab__unifi_get_free_ips tool om een vrij IP te krijgen
voor de chef-agent LXC container. Noteer het IP.
```

- [ ] **Stap 2: Maak deploy/chef-agent.service**

```ini
[Unit]
Description=Chef Agent FastAPI
After=network.target

[Service]
Type=simple
User=chef
WorkingDirectory=/opt/chef-agent
Environment=PATH=/opt/chef-agent/.venv/bin
ExecStart=/opt/chef-agent/.venv/bin/uvicorn backend.main:app --host 0.0.0.0 --port 8000
Restart=always
RestartSec=5

[Install]
WantedBy=multi-user.target
```

- [ ] **Stap 3: Maak deploy/setup.sh**

```bash
#!/bin/bash
set -e

echo "=== Chef Agent Proxmox Setup ==="

# Vereisten
apt-get update && apt-get install -y python3.12 python3.12-venv python3-pip git postgresql-client

# Gebruiker aanmaken
useradd -m -s /bin/bash chef || true

# App directory
mkdir -p /opt/chef-agent
cd /opt/chef-agent

# Code clonen (pas REPO_URL aan)
git clone https://github.com/gavinguler/chef-agent.git . || git pull

# Python venv
python3.12 -m venv .venv
.venv/bin/pip install -r requirements.txt

# Environment file
if [ ! -f .env ]; then
  cp .env.example .env
  echo "BELANGRIJK: Vul .env in met echte waarden!"
  echo "  - DATABASE_URL (PostgreSQL op 192.168.0.170)"
  echo "  - TELEGRAM_BOT_TOKEN"
  echo "  - TELEGRAM_CHAT_ID"
  echo "  - ANTHROPIC_API_KEY"
  echo "  - OLLAMA_BASE_URL (ollama LXC IP)"
fi

# Database migraties
.venv/bin/alembic upgrade head

# Seed data (alleen als leeg)
.venv/bin/python -m backend.db.seed

# Systemd service
cp deploy/chef-agent.service /etc/systemd/system/
systemctl daemon-reload
systemctl enable chef-agent
systemctl start chef-agent

echo "=== Setup klaar! ==="
echo "Status: systemctl status chef-agent"
echo "Logs: journalctl -u chef-agent -f"
```

- [ ] **Stap 4: Maak de LXC container aan via Proxmox**

Via Proxmox web UI (`https://192.168.0.197:8006`):
1. Create CT → Debian 12 template
2. Hostname: `chef-agent`, IP: `<vrij IP uit stap 1>/24`, GW: `192.168.0.1`
3. CPU: 2 cores, RAM: 1024MB, Disk: 8GB

- [ ] **Stap 5: Run setup script in LXC**

```bash
# Vanuit Proxmox host:
pct enter <vmid>
# In de container:
bash <(curl -fsSL https://raw.githubusercontent.com/gavinguler/chef-agent/main/deploy/setup.sh)
```

- [ ] **Stap 6: Configureer Nginx Proxy Manager**

Via `http://192.168.0.132:81`:
1. Add Proxy Host → `chef.<jouw-domein>` → Forward naar `<chef-agent-ip>:8000`
2. Voeg ook frontend toe: `chef-ui.<jouw-domein>` → `<chef-agent-ip>:5173`

- [ ] **Stap 7: Update wiki met nieuw container IP**

```
Gebruik mcp__llm-wiki__propose_note om de chef-agent container toe te voegen
aan infrastructure/proxmox.md met het nieuwe IP.
```

- [ ] **Stap 8: Commit**

```bash
git add deploy/
git commit -m "feat: Proxmox deployment script en systemd service"
git tag v1.0.0
git push origin main --tags
```

---

## Self-Review Checklist

**Spec coverage:**
- ✅ Wekelijks Telegram bericht (zondag 09:00) — Task 11
- ✅ Boodschappenlijst in Telegram — Task 10
- ✅ Vriezer reminders in Telegram — Task 10
- ✅ Web interface recepten bekijken — Task 16
- ✅ Recepten toevoegen via web — Task 16
- ✅ AI vult macro's in — Task 12 + 16
- ✅ Hybride AI (Ollama + Claude) — Task 12 + 13
- ✅ PostgreSQL op 192.168.0.170 — Task 3 + 4
- ✅ React + TailwindCSS mobiel-first — Task 14-17
- ✅ Weekplanning dag-tabs — Task 17
- ✅ Proxmox deployment — Task 18
- ✅ Seed voedingsschema v8 — Task 9

**Type consistency:**
- `RecipeOut.eiwit_g` gebruikt door `RecipeCard` als `recipe.eiwit_g` ✅
- `WeekPlan.dagen[].maaltijden[].eiwit_g` gebruikt door `WeekPlan.jsx` ✅
- `ShoppingItemOut` structuur consistent tussen API en `client.js` ✅
