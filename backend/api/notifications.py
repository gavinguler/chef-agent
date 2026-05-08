import asyncio
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session
from typing import Optional

from backend.db.session import get_db
from backend.db.models import NotificationSettings
from backend.scheduler.manager import reschedule_notification_jobs

router = APIRouter()

DAYS_NL = ["maandag", "dinsdag", "woensdag", "donderdag", "vrijdag", "zaterdag", "zondag"]


def _get_or_create(db: Session) -> NotificationSettings:
    row = db.query(NotificationSettings).filter(NotificationSettings.id == 1).first()
    if not row:
        row = NotificationSettings(id=1)
        db.add(row)
        db.commit()
        db.refresh(row)
    return row


class NotificationSettingsOut(BaseModel):
    daily_enabled: bool
    daily_hour: int
    daily_minute: int
    shopping_enabled: bool
    shopping_days: list[str]
    shopping_hour: int
    shopping_minute: int

    model_config = {"from_attributes": True}


class NotificationSettingsIn(BaseModel):
    daily_enabled: bool
    daily_hour: int
    daily_minute: int
    shopping_enabled: bool
    shopping_days: list[str]
    shopping_hour: int
    shopping_minute: int


def _row_to_out(row: NotificationSettings) -> NotificationSettingsOut:
    days = [d.strip() for d in (row.shopping_days or "").split(",") if d.strip()]
    return NotificationSettingsOut(
        daily_enabled=row.daily_enabled,
        daily_hour=row.daily_hour,
        daily_minute=row.daily_minute,
        shopping_enabled=row.shopping_enabled,
        shopping_days=days,
        shopping_hour=row.shopping_hour,
        shopping_minute=row.shopping_minute,
    )


@router.get("/settings", response_model=NotificationSettingsOut)
def get_settings(db: Session = Depends(get_db)):
    return _row_to_out(_get_or_create(db))


@router.put("/settings", response_model=NotificationSettingsOut)
def update_settings(payload: NotificationSettingsIn, db: Session = Depends(get_db)):
    if not 0 <= payload.daily_hour <= 23 or not 0 <= payload.daily_minute <= 59:
        raise HTTPException(status_code=400, detail="Ongeldig tijdstip")
    invalid = [d for d in payload.shopping_days if d not in DAYS_NL]
    if invalid:
        raise HTTPException(status_code=400, detail=f"Ongeldige dagen: {invalid}")

    row = _get_or_create(db)
    row.daily_enabled = payload.daily_enabled
    row.daily_hour = payload.daily_hour
    row.daily_minute = payload.daily_minute
    row.shopping_enabled = payload.shopping_enabled
    row.shopping_days = ",".join(payload.shopping_days)
    row.shopping_hour = payload.shopping_hour
    row.shopping_minute = payload.shopping_minute
    db.commit()
    db.refresh(row)
    reschedule_notification_jobs(row)
    return _row_to_out(row)


@router.post("/test-daily")
def test_daily(db: Session = Depends(get_db)):
    from backend.scheduler.daily_job import run_daily_job
    run_daily_job()
    return {"status": "verstuurd"}


@router.post("/test-shopping")
def test_shopping(db: Session = Depends(get_db)):
    from backend.scheduler.daily_job import run_shopping_job
    run_shopping_job()
    return {"status": "verstuurd"}
