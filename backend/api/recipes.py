from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException, Query
import httpx
import random
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional
import uuid

from backend.db.session import get_db
from backend.db.models import Recipe
from backend.ai.agent import fill_recipe_macros as _fill_recipe_macros
from backend.config import settings
from backend.services.wiki_sync import (
    delete_recipe_from_wiki,
    sync_all_recipes_to_wiki,
    sync_recipe_to_wiki,
)

router = APIRouter()


class RecipeIn(BaseModel):
    naam: str
    beschrijving: Optional[str] = None
    instructies: Optional[str] = None
    kcal: Optional[int] = None
    eiwit_g: Optional[float] = None
    vet_g: Optional[float] = None
    koolhydraten_g: Optional[float] = None
    categorie: Optional[str] = None
    vlees_type: Optional[str] = None
    bron: str = "handmatig"


class RecipeOut(BaseModel):
    id: uuid.UUID
    naam: str
    beschrijving: Optional[str] = None
    instructies: Optional[str] = None
    kcal: Optional[int] = None
    eiwit_g: Optional[float] = None
    vet_g: Optional[float] = None
    koolhydraten_g: Optional[float] = None
    categorie: Optional[str] = None
    vlees_type: Optional[str] = None
    bron: str
    image_url: Optional[str] = None

    model_config = {"from_attributes": True}


@router.get("", response_model=list[RecipeOut])
def list_recipes(search: Optional[str] = Query(None), db: Session = Depends(get_db)):
    q = db.query(Recipe)
    if search:
        q = q.filter(Recipe.naam.ilike(f"%{search}%"))
    return q.all()


@router.post("", response_model=RecipeOut, status_code=201)
def create_recipe(recipe: RecipeIn, background_tasks: BackgroundTasks, db: Session = Depends(get_db)):
    db_recipe = Recipe(**recipe.model_dump())
    db.add(db_recipe)
    db.commit()
    db.refresh(db_recipe)
    background_tasks.add_task(sync_recipe_to_wiki, db_recipe)
    return db_recipe


@router.get("/{recipe_id}", response_model=RecipeOut)
def get_recipe(recipe_id: uuid.UUID, db: Session = Depends(get_db)):
    recipe = db.query(Recipe).filter(Recipe.id == recipe_id).first()
    if not recipe:
        raise HTTPException(status_code=404, detail="Recept niet gevonden")
    return recipe


@router.put("/{recipe_id}", response_model=RecipeOut)
def update_recipe(recipe_id: uuid.UUID, recipe: RecipeIn, background_tasks: BackgroundTasks, db: Session = Depends(get_db)):
    db_recipe = db.query(Recipe).filter(Recipe.id == recipe_id).first()
    if not db_recipe:
        raise HTTPException(status_code=404, detail="Recept niet gevonden")
    for key, value in recipe.model_dump(exclude_unset=True).items():
        setattr(db_recipe, key, value)
    db.commit()
    db.refresh(db_recipe)
    background_tasks.add_task(sync_recipe_to_wiki, db_recipe)
    return db_recipe


@router.delete("/{recipe_id}", status_code=204)
def delete_recipe(recipe_id: uuid.UUID, background_tasks: BackgroundTasks, db: Session = Depends(get_db)):
    db_recipe = db.query(Recipe).filter(Recipe.id == recipe_id).first()
    if not db_recipe:
        raise HTTPException(status_code=404, detail="Recept niet gevonden")
    naam = db_recipe.naam
    db.delete(db_recipe)
    db.commit()
    background_tasks.add_task(delete_recipe_from_wiki, naam)


def _build_unsplash_query(naam: str) -> str:
    naam_lower = naam.lower()
    for word in ["airfryer", "batch", "(batch)", "italiaans", "mediterraans",
                 "zo-batch", "slow roast", "lidl 3-ster", "vers", "(joep)",
                 "joep", "uit zo", "uit di", "laatste portie"]:
        naam_lower = naam_lower.replace(word, "").strip()
    return f"{naam_lower} food meal"


@router.post("/{recipe_id}/refresh-image", response_model=RecipeOut)
async def refresh_image(recipe_id: uuid.UUID, db: Session = Depends(get_db)):
    recipe = db.query(Recipe).filter(Recipe.id == recipe_id).first()
    if not recipe:
        raise HTTPException(status_code=404, detail="Recept niet gevonden")
    if not settings.unsplash_access_key:
        raise HTTPException(status_code=503, detail="Unsplash API key niet geconfigureerd")

    query = _build_unsplash_query(recipe.naam)
    current_url = recipe.image_url
    try:
        async with httpx.AsyncClient(timeout=10) as client:
            resp = await client.get(
                "https://api.unsplash.com/search/photos",
                params={"query": query, "per_page": 10, "orientation": "landscape", "content_filter": "high"},
                headers={"Authorization": f"Client-ID {settings.unsplash_access_key}", "Accept-Version": "v1"},
            )
            resp.raise_for_status()
            results = resp.json().get("results", [])
            urls = [r["urls"]["regular"] for r in results if r["urls"]["regular"] != current_url]
            if not urls:
                urls = [r["urls"]["regular"] for r in results]
            if urls:
                recipe.image_url = random.choice(urls)
                db.commit()
                db.refresh(recipe)
    except httpx.HTTPStatusError as e:
        if e.response.status_code == 403:
            raise HTTPException(status_code=429, detail="Unsplash limiet bereikt, probeer later opnieuw")
        raise HTTPException(status_code=502, detail=f"Unsplash fout: {e}")
    except httpx.HTTPError as e:
        raise HTTPException(status_code=502, detail=f"Unsplash fout: {e}")
    return recipe


class AiFillMacrosIn(BaseModel):
    naam: str
    ingredienten: list[str]


@router.post("/ai-fill-macros")
async def ai_fill_macros(payload: AiFillMacrosIn):
    try:
        return await _fill_recipe_macros(payload.naam, payload.ingredienten)
    except (httpx.HTTPError, httpx.ConnectError):
        raise HTTPException(status_code=503, detail="AI service niet beschikbaar")
