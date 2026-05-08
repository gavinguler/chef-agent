from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional
from datetime import date, timedelta
import uuid

from backend.db.session import get_db
from backend.db.models import MealPlan, Recipe, NutritionCycle
from backend.config import settings

router = APIRouter()

DAYS = ["maandag", "dinsdag", "woensdag", "donderdag", "vrijdag", "zaterdag", "zondag"]


def _iso_week_start(year: int, week: int) -> date:
    jan4 = date(year, 1, 4)
    return jan4 + timedelta(days=(week - 1) * 7 - (jan4.isoweekday() - 1))


@router.get("/current-week")
def get_current_week():
    anchor = _iso_week_start(settings.cycle_anchor_year, settings.cycle_anchor_iso_week)
    weeks_since = (date.today() - anchor).days // 7
    return {"week": (weeks_since % 8) + 1}
MEAL_TYPES = ["ontbijt", "lunch", "diner"]


class SetMealIn(BaseModel):
    recept_id: Optional[uuid.UUID] = None


class MealOut(BaseModel):
    maaltijd_type: str
    recept_id: Optional[uuid.UUID] = None
    naam: Optional[str] = None
    kcal: Optional[int] = None
    eiwit_g: Optional[float] = None

    model_config = {"from_attributes": True}


class DayPlan(BaseModel):
    dag: str
    maaltijden: list[MealOut]
    totaal_eiwit_g: float
    totaal_kcal: int


class WeekPlan(BaseModel):
    week: int
    vlees_thema: Optional[str] = None
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
    nutrition = db.query(NutritionCycle).filter(NutritionCycle.cyclus_week == week_num).first()
    vlees_thema = nutrition.vlees_type if nutrition else None
    return WeekPlan(week=week_num, vlees_thema=vlees_thema, dagen=dagen)


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
