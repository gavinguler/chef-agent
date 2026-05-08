from contextlib import asynccontextmanager
from pathlib import Path
from apscheduler.schedulers.background import BackgroundScheduler
from apscheduler.triggers.cron import CronTrigger
from fastapi import Depends, FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from backend.api import recipes, meal_plans, shopping
from backend.db.models import Recipe
from backend.db.session import get_db
from backend.scheduler.weekly_job import run_weekly_job
from backend.services.wiki_sync import sync_all_recipes_to_wiki

FRONTEND_DIST = Path(__file__).parent.parent / "frontend" / "dist"

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
    run_weekly_job()
    return {"status": "verzonden"}


@app.post("/api/admin/sync-wiki")
async def sync_wiki(db: Session = Depends(get_db)):
    """Synchroniseer alle recepten naar de LLM wiki (eenmalig / op verzoek)."""
    all_recipes = db.query(Recipe).all()
    count = await sync_all_recipes_to_wiki(all_recipes)
    return {"synced": count}


@app.get("/{full_path:path}")
async def serve_frontend(full_path: str):
    file = FRONTEND_DIST / full_path
    if file.is_file():
        return FileResponse(file)
    index = FRONTEND_DIST / "index.html"
    if index.exists():
        return FileResponse(index)
    return {"detail": "Frontend niet gebouwd"}
