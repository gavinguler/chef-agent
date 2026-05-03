from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional
import uuid

from backend.db.session import get_db
from backend.db.models import Recipe

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

    model_config = {"from_attributes": True}


@router.get("", response_model=list[RecipeOut])
def list_recipes(search: Optional[str] = Query(None), db: Session = Depends(get_db)):
    q = db.query(Recipe)
    if search:
        q = q.filter(Recipe.naam.ilike(f"%{search}%"))
    return q.all()


@router.post("", response_model=RecipeOut, status_code=201)
def create_recipe(recipe: RecipeIn, db: Session = Depends(get_db)):
    db_recipe = Recipe(**recipe.model_dump())
    db.add(db_recipe)
    db.commit()
    db.refresh(db_recipe)
    return db_recipe


@router.get("/{recipe_id}", response_model=RecipeOut)
def get_recipe(recipe_id: uuid.UUID, db: Session = Depends(get_db)):
    recipe = db.query(Recipe).filter(Recipe.id == recipe_id).first()
    if not recipe:
        raise HTTPException(status_code=404, detail="Recept niet gevonden")
    return recipe


@router.put("/{recipe_id}", response_model=RecipeOut)
def update_recipe(recipe_id: uuid.UUID, recipe: RecipeIn, db: Session = Depends(get_db)):
    db_recipe = db.query(Recipe).filter(Recipe.id == recipe_id).first()
    if not db_recipe:
        raise HTTPException(status_code=404, detail="Recept niet gevonden")
    for key, value in recipe.model_dump(exclude_unset=True).items():
        setattr(db_recipe, key, value)
    db.commit()
    db.refresh(db_recipe)
    return db_recipe


@router.delete("/{recipe_id}", status_code=204)
def delete_recipe(recipe_id: uuid.UUID, db: Session = Depends(get_db)):
    db_recipe = db.query(Recipe).filter(Recipe.id == recipe_id).first()
    if not db_recipe:
        raise HTTPException(status_code=404, detail="Recept niet gevonden")
    db.delete(db_recipe)
    db.commit()
