import asyncio
from datetime import datetime, date, timedelta
from sqlalchemy.orm import Session
from backend.db.session import SessionLocal
from backend.db.models import MealPlan, ShoppingList, FreezerItem, NutritionCycle
from backend.telegram.bot import send_weekly_message
from backend.config import settings


def get_current_cycle_week() -> int:
    jan4 = date(settings.cycle_anchor_year, 1, 4)
    anchor = jan4 + timedelta(days=(settings.cycle_anchor_iso_week - 1) * 7 - (jan4.isoweekday() - 1))
    weeks_since = (date.today() - anchor).days // 7
    return (weeks_since % 8) + 1


def build_week_data(db: Session, cyclus_week: int) -> dict:
    nc = db.query(NutritionCycle).filter(NutritionCycle.cyclus_week == cyclus_week).first()
    vlees_thema = nc.vlees_type if nc else "Onbekend"

    dag_namen = ["maandag", "dinsdag", "woensdag", "donderdag", "vrijdag", "zaterdag", "zondag"]
    batch_dagen = {"donderdag", "zondag"}
    maaltijd_volgorde = {"ontbijt": 0, "lunch": 1, "snack": 2, "diner": 3, "avondsnack": 4}

    dagen = []
    for dag in dag_namen:
        entries = (
            db.query(MealPlan)
            .filter(MealPlan.cyclus_week == cyclus_week, MealPlan.dag == dag)
            .all()
        )
        entries.sort(key=lambda e: maaltijd_volgorde.get(e.maaltijd_type, 99))
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
