import asyncio
from datetime import datetime
from sqlalchemy.orm import Session
from backend.db.session import SessionLocal
from backend.db.models import MealPlan, NutritionCycle
from backend.telegram.bot import send_daily_message, send_shopping_reminder
from backend.scheduler.weekly_job import get_current_cycle_week, build_week_data

DAYS_NL = ["maandag", "dinsdag", "woensdag", "donderdag", "vrijdag", "zaterdag", "zondag"]


def get_today_nl() -> str:
    # weekday(): 0=monday
    return DAYS_NL[datetime.now().weekday()]


def run_daily_job():
    db = SessionLocal()
    try:
        cyclus_week = get_current_cycle_week()
        dag = get_today_nl()
        week_data = build_week_data(db, cyclus_week)
        dag_data = next((d for d in week_data["dagen"] if d["dag"] == dag), None)
        if dag_data:
            asyncio.run(send_daily_message(dag_data, cyclus_week))
            print(f"Dagelijks bericht verstuurd voor {dag}, cyclus week {cyclus_week}")
    finally:
        db.close()


def run_shopping_job():
    db = SessionLocal()
    try:
        cyclus_week = get_current_cycle_week()
        week_data = build_week_data(db, cyclus_week)
        asyncio.run(send_shopping_reminder(week_data))
        print(f"Boodschappenherinnering verstuurd, cyclus week {cyclus_week}")
    finally:
        db.close()
