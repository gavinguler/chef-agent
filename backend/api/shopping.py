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
    categorie: Optional[str] = None
    hoeveelheid: Optional[str] = None
    winkel: str
    prijs_indicatie: Optional[float] = None
    checked: bool = False

    model_config = {"from_attributes": True}


class ShoppingListOut(BaseModel):
    week: int
    items: list[ShoppingItemOut]


def _validate_week(week_num: int):
    if not 1 <= week_num <= 8:
        raise HTTPException(status_code=400, detail="Week moet tussen 1 en 8 zijn")


@router.get("/week/{week_num}", response_model=ShoppingListOut)
def get_shopping_list(week_num: int, db: Session = Depends(get_db)):
    _validate_week(week_num)
    items = db.query(ShoppingList).filter(ShoppingList.cyclus_week == week_num).all()
    return ShoppingListOut(week=week_num, items=items)


@router.post("/week/{week_num}/items", response_model=ShoppingItemOut, status_code=201)
def add_item(week_num: int, item: ShoppingItemIn, db: Session = Depends(get_db)):
    _validate_week(week_num)
    db_item = ShoppingList(cyclus_week=week_num, **item.model_dump())
    db.add(db_item)
    db.commit()
    db.refresh(db_item)
    return db_item


@router.patch("/week/{week_num}/items/{item_id}/check", response_model=ShoppingItemOut)
def toggle_check(week_num: int, item_id: uuid.UUID, db: Session = Depends(get_db)):
    item = db.query(ShoppingList).filter(
        ShoppingList.id == item_id,
        ShoppingList.cyclus_week == week_num,
    ).first()
    if not item:
        raise HTTPException(status_code=404, detail="Item niet gevonden")
    item.checked = not item.checked
    db.commit()
    db.refresh(item)
    return item


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
