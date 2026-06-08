import json
import uuid
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional

from backend.db.session import get_db
from backend.db.models import WeekPlanTemplate, MealPlan

router = APIRouter()


class TemplateIn(BaseModel):
    naam: str
    slots: list[dict]


class TemplateOut(BaseModel):
    id: uuid.UUID
    naam: str
    slot_count: int
    aangemaakt_op: Optional[str] = None


@router.get("", response_model=list[TemplateOut])
def list_templates(db: Session = Depends(get_db)):
    templates = db.query(WeekPlanTemplate).order_by(WeekPlanTemplate.aangemaakt_op.desc()).all()
    return [
        TemplateOut(
            id=t.id,
            naam=t.naam,
            slot_count=len(json.loads(t.slots)),
            aangemaakt_op=t.aangemaakt_op.isoformat() if t.aangemaakt_op else None,
        )
        for t in templates
    ]


@router.post("", status_code=201)
def create_template(body: TemplateIn, db: Session = Depends(get_db)):
    t = WeekPlanTemplate(naam=body.naam, slots=json.dumps(body.slots))
    db.add(t)
    db.commit()
    db.refresh(t)
    return {"id": str(t.id), "naam": t.naam}


@router.delete("/{template_id}", status_code=204)
def delete_template(template_id: uuid.UUID, db: Session = Depends(get_db)):
    t = db.query(WeekPlanTemplate).filter(WeekPlanTemplate.id == template_id).first()
    if not t:
        raise HTTPException(status_code=404, detail="Template niet gevonden")
    db.delete(t)
    db.commit()


@router.post("/{template_id}/apply")
def apply_template(template_id: uuid.UUID, week: int, db: Session = Depends(get_db)):
    t = db.query(WeekPlanTemplate).filter(WeekPlanTemplate.id == template_id).first()
    if not t:
        raise HTTPException(status_code=404, detail="Template niet gevonden")

    slots = json.loads(t.slots)
    for slot in slots:
        if not slot.get("recept_id"):
            continue
        entry = db.query(MealPlan).filter(
            MealPlan.cyclus_week == week,
            MealPlan.dag == slot["dag"],
            MealPlan.maaltijd_type == slot["maaltijd_type"],
        ).first()
        if entry:
            entry.recept_id = uuid.UUID(slot["recept_id"])
        else:
            db.add(MealPlan(
                cyclus_week=week,
                dag=slot["dag"],
                maaltijd_type=slot["maaltijd_type"],
                recept_id=uuid.UUID(slot["recept_id"]),
            ))
    db.commit()
    return {"status": "ok", "applied": len(slots)}
