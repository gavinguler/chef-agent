from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional
import uuid

from backend.db.session import get_db
from backend.db.models import ShoppingList, IngredientProductMapping
from backend.bonnetjes.client import lookup_prices
from backend.config import settings
import httpx

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


@router.post("/week/{week_num}/enrich-prices")
async def enrich_prices(week_num: int, db: Session = Depends(get_db)):
    _validate_week(week_num)
    items = db.query(ShoppingList).filter(ShoppingList.cyclus_week == week_num).all()
    if not items:
        return {"enriched": 0, "total": 0}

    # Load manual mappings: ingredient_name → bonnetjes_product_id
    mappings = {
        m.ingredient_name: m.bonnetjes_product_id
        for m in db.query(IngredientProductMapping).all()
    }

    # Fetch prices for manually mapped products via dedicated endpoint
    mapped_prices: dict[str, float] = {}
    mapped_ids = list({mappings[item.product] for item in items if item.product in mappings})
    if mapped_ids and settings.bonnetjes_url:
        try:
            async with httpx.AsyncClient(timeout=8.0) as client:
                resp = await client.post(
                    f"{settings.bonnetjes_url}/api/products/price-by-ids",
                    json=mapped_ids,
                )
                if resp.status_code == 200:
                    id_to_price: dict[int, float] = resp.json()
                    for item in items:
                        pid = mappings.get(item.product)
                        if pid and pid in id_to_price:
                            mapped_prices[item.product] = id_to_price[pid]
        except Exception:
            pass

    # Fuzzy lookup for unmapped items
    unmapped_names = [item.product for item in items if item.product not in mapped_prices]
    fuzzy_prices = await lookup_prices(unmapped_names) if unmapped_names else {}

    enriched = 0
    for item in items:
        price = mapped_prices.get(item.product) or fuzzy_prices.get(item.product)
        if price is not None:
            item.prijs_indicatie = price
            enriched += 1

    db.commit()
    return {"enriched": enriched, "total": len(items)}
