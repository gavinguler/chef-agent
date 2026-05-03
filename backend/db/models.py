import uuid
from datetime import datetime
from sqlalchemy import Column, String, Integer, Float, Boolean, Text, DateTime, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import DeclarativeBase, relationship


class Base(DeclarativeBase):
    pass


class Recipe(Base):
    __tablename__ = "recipes"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    naam = Column(Text, nullable=False)
    beschrijving = Column(Text)
    instructies = Column(Text)
    kcal = Column(Integer)
    eiwit_g = Column(Float)
    vet_g = Column(Float)
    koolhydraten_g = Column(Float)
    categorie = Column(String(50))
    vlees_type = Column(String(50), nullable=True)
    bron = Column(String(50), default="handmatig")
    aangemaakt_op = Column(DateTime, default=datetime.utcnow)

    meal_plan_entries = relationship("MealPlan", back_populates="recipe")

    def __init__(self, **kwargs):
        if 'bron' not in kwargs:
            kwargs['bron'] = "handmatig"
        super().__init__(**kwargs)


class MealPlan(Base):
    __tablename__ = "meal_plans"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    cyclus_week = Column(Integer, nullable=False)
    dag = Column(String(20), nullable=False)
    maaltijd_type = Column(String(20), nullable=False)
    recept_id = Column(UUID(as_uuid=True), ForeignKey("recipes.id"), nullable=True)

    recipe = relationship("Recipe", back_populates="meal_plan_entries")


class ShoppingList(Base):
    __tablename__ = "shopping_lists"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    cyclus_week = Column(Integer, nullable=False)
    product = Column(Text, nullable=False)
    categorie = Column(String(50))
    hoeveelheid = Column(Text)
    winkel = Column(String(50), default="lidl")
    prijs_indicatie = Column(Float, nullable=True)


class FreezerItem(Base):
    __tablename__ = "freezer_items"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    cyclus_week = Column(Integer, nullable=False)
    product = Column(Text, nullable=False)
    hoeveelheid = Column(Text)
    ontdooi_dag = Column(String(20))
    gebruik_dag = Column(String(20))


class NutritionCycle(Base):
    __tablename__ = "nutrition_cycle"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    cyclus_week = Column(Integer, nullable=False, unique=True)
    vlees_type = Column(String(50), nullable=False)
    hoeveelheid_g = Column(Integer, nullable=False)
    gebruikt = Column(Boolean, default=False)

    def __init__(self, **kwargs):
        if 'gebruikt' not in kwargs:
            kwargs['gebruikt'] = False
        super().__init__(**kwargs)
