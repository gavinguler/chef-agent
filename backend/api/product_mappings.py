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


@router.post("/resolve-prices")
async def resolve_prices(ingredient_names: list[str], db: Session = Depends(get_db)):
    """Geeft voor een lijst ingredientnamen de gematchte productprijs terug."""
    if not ingredient_names:
        return {}

    # Exact match first, then substring
    all_mappings = db.query(IngredientProductMapping).all()
    resolved: dict[str, dict] = {}
    for name in ingredient_names:
        lower = name.lower()
        match = next((m for m in all_mappings if m.ingredient_name.lower() == lower), None)
        if not match:
            match = next((m for m in all_mappings if m.ingredient_name.lower() in lower), None)
        if match:
            resolved[name] = {"product_id": match.bonnetjes_product_id, "product_name": match.bonnetjes_product_name}

    if not resolved or not settings.bonnetjes_url:
        return {name: {**info, "price": None} for name, info in resolved.items()}

    product_ids = list({info["product_id"] for info in resolved.values()})
    id_to_price: dict[int, float] = {}
    try:
        async with httpx.AsyncClient(timeout=8.0) as client:
            resp = await client.post(
                f"{settings.bonnetjes_url}/api/products/price-by-ids",
                json=product_ids,
            )
            if resp.status_code == 200:
                id_to_price = {int(k): v for k, v in resp.json().items()}
    except Exception:
        pass

    return {
        name: {**info, "price": id_to_price.get(info["product_id"])}
        for name, info in resolved.items()
    }


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
