from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
import httpx

from backend.db.session import get_db
from backend.db.models import IngredientProductMapping
from backend.config import settings

router = APIRouter()


class MappingIn(BaseModel):
    ingredient_name: str
    bonnetjes_product_id: int
    bonnetjes_product_name: str


class MappingOut(BaseModel):
    ingredient_name: str
    bonnetjes_product_id: int
    bonnetjes_product_name: str

    model_config = {"from_attributes": True}


@router.get("", response_model=list[MappingOut])
def list_mappings(db: Session = Depends(get_db)):
    return db.query(IngredientProductMapping).order_by(IngredientProductMapping.ingredient_name).all()


@router.put("", response_model=MappingOut)
def upsert_mapping(body: MappingIn, db: Session = Depends(get_db)):
    mapping = db.query(IngredientProductMapping).filter(
        IngredientProductMapping.ingredient_name == body.ingredient_name
    ).first()
    if mapping:
        mapping.bonnetjes_product_id = body.bonnetjes_product_id
        mapping.bonnetjes_product_name = body.bonnetjes_product_name
    else:
        mapping = IngredientProductMapping(**body.model_dump())
        db.add(mapping)
    db.commit()
    db.refresh(mapping)
    return mapping


@router.delete("/{ingredient_name}", status_code=204)
def delete_mapping(ingredient_name: str, db: Session = Depends(get_db)):
    mapping = db.query(IngredientProductMapping).filter(
        IngredientProductMapping.ingredient_name == ingredient_name
    ).first()
    if not mapping:
        raise HTTPException(status_code=404, detail="Koppeling niet gevonden")
    db.delete(mapping)
    db.commit()


@router.get("/bonnetjes-search")
async def bonnetjes_search(q: str = ""):
    if not settings.bonnetjes_url:
        return {"items": []}
    try:
        async with httpx.AsyncClient(timeout=8.0) as client:
            resp = await client.get(
                f"{settings.bonnetjes_url}/api/products",
                params={"search": q, "limit": 20},
            )
            resp.raise_for_status()
            data = resp.json()
            return {"items": data.get("items", [])}
    except Exception:
        return {"items": []}
