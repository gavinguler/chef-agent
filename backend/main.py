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
