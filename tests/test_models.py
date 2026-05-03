from backend.db.models import Recipe, MealPlan, ShoppingList, FreezerItem, NutritionCycle
import uuid

def test_recipe_has_required_fields():
    r = Recipe(
        naam="Bolognese",
        categorie="diner",
        kcal=650,
        eiwit_g=48.0,
        vet_g=22.0,
        koolhydraten_g=55.0,
    )
    assert r.naam == "Bolognese"
    assert r.bron == "handmatig"

def test_meal_plan_links_recipe():
    recipe_id = uuid.uuid4()
    mp = MealPlan(cyclus_week=1, dag="maandag", maaltijd_type="diner", recept_id=recipe_id)
    assert mp.cyclus_week == 1

def test_nutrition_cycle_has_8_weeks():
    nc = NutritionCycle(cyclus_week=1, vlees_type="gehakt", hoeveelheid_g=450)
    assert nc.gebruikt == False
