from contextlib import asynccontextmanager
from pathlib import Path
from apscheduler.triggers.cron import CronTrigger
from fastapi import Depends, FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from backend.api import recipes, meal_plans, shopping, notifications
from backend.db.models import Recipe, NotificationSettings
from backend.db.session import get_db, SessionLocal
from backend.scheduler.manager import scheduler, reschedule_notification_jobs
from backend.scheduler.weekly_job import run_weekly_job
from backend.services.wiki_sync import sync_all_recipes_to_wiki

FRONTEND_DIST = Path(__file__).parent.parent / "frontend" / "dist"


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Wekelijks Telegram bericht (zondag 09:00)
    scheduler.add_job(
        run_weekly_job,
        CronTrigger(day_of_week="sun", hour=9, minute=0),
        id="weekly_telegram",
        replace_existing=True,
    )
    # Dagelijkse + boodschappen jobs op basis van DB-instellingen
    db = SessionLocal()
    try:
        row = db.query(NotificationSettings).filter(NotificationSettings.id == 1).first()
        if row:
            reschedule_notification_jobs(row)
    finally:
        db.close()

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
app.include_router(notifications.router, prefix="/api/notifications", tags=["notifications"])


@app.get("/health")
def health():
    return {"status": "ok"}


@app.post("/api/admin/send-weekly-now")
def trigger_weekly_now():
    run_weekly_job()
    return {"status": "verzonden"}


@app.post("/api/admin/sync-wiki")
async def sync_wiki(db: Session = Depends(get_db)):
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
