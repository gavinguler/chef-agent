from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
import httpx

from backend.db.session import get_db
from backend.db.models import IngredientProductMapping
from backend.config import settings
from backend.bonnetjes.client import get_all_balances, add_stock as bonnetjes_add_stock

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


@router.post("/stock-status")
async def stock_status(ingredient_names: list[str], db: Session = Depends(get_db)):
    """Geeft voor een lijst ingredientnamen de huidige voorraad terug via Bonnetjes."""
    if not ingredient_names or not settings.bonnetjes_url:
        return {}

    all_mappings = db.query(IngredientProductMapping).all()
    resolved: dict[str, dict] = {}
    for name in ingredient_names:
        lower = name.lower()
        match = next((m for m in all_mappings if m.ingredient_name.lower() == lower), None)
        if not match:
            match = next((m for m in all_mappings if m.ingredient_name.lower() in lower), None)
        if match:
            resolved[name] = {
                "product_id": match.bonnetjes_product_id,
                "product_name": match.bonnetjes_product_name,
            }

    if not resolved:
        return {}

    product_ids = {info["product_id"] for info in resolved.values()}
    balances: dict[int, float] = {}
    try:
        async with httpx.AsyncClient(timeout=8.0) as client:
            resp = await client.get(f"{settings.bonnetjes_url}/api/stock/balances")
            if resp.status_code == 200:
                for b in resp.json():
                    if b["product_id"] in product_ids:
                        balances[b["product_id"]] = b["quantity"]
    except Exception:
        pass

    return {
        name: {**info, "quantity": balances.get(info["product_id"], 0.0)}
        for name, info in resolved.items()
    }


@router.post("/deduct-stock")
async def deduct_stock(ingredient_names: list[str], db: Session = Depends(get_db)):
    """Trek 1 stuk per gematchte ingrediënt af uit de Bonnetjes voorraad."""
    if not ingredient_names or not settings.bonnetjes_url:
        return {"deducted": 0, "skipped": len(ingredient_names)}

    all_mappings = db.query(IngredientProductMapping).all()
    deducted = 0
    skipped = 0
    async with httpx.AsyncClient(timeout=8.0) as client:
        for name in ingredient_names:
            lower = name.lower()
            match = next((m for m in all_mappings if m.ingredient_name.lower() == lower), None)
            if not match:
                match = next((m for m in all_mappings if m.ingredient_name.lower() in lower), None)
            if not match:
                skipped += 1
                continue
            try:
                resp = await client.post(
                    f"{settings.bonnetjes_url}/api/stock/out-by-id",
                    json={"product_id": match.bonnetjes_product_id, "quantity": 1.0},
                )
                if resp.status_code == 200:
                    deducted += 1
                else:
                    skipped += 1
            except Exception:
                skipped += 1

    return {"deducted": deducted, "skipped": skipped}


@router.get("/stock-balances")
async def stock_balances():
    """Alle Bonnetjes voorraadbalansen ophalen."""
    return await get_all_balances()


class StockDirectIn(BaseModel):
    product_id: int
    quantity: float = 1.0


@router.post("/add-stock-direct")
async def add_stock_direct(body: StockDirectIn):
    ok = await bonnetjes_add_stock(body.product_id, body.quantity)
    if not ok:
        raise HTTPException(status_code=502, detail="Bonnetjes niet bereikbaar")
    return {"status": "ok"}


@router.post("/deduct-stock-direct")
async def deduct_stock_direct(body: StockDirectIn):
    if not settings.bonnetjes_url:
        raise HTTPException(status_code=503, detail="Bonnetjes niet geconfigureerd")
    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            resp = await client.post(
                f"{settings.bonnetjes_url}/api/stock/out-by-id",
                json={"product_id": body.product_id, "quantity": body.quantity},
            )
            resp.raise_for_status()
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"Bonnetjes fout: {e}")
    return {"status": "ok"}


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
