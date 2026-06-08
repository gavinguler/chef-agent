from backend.ai.ollama_client import estimate_macros, generate_shopping_list, generate_instructions
from backend.ai.claude_client import integrate_recipe_in_schema, validate_week_macros, generate_ingredients_claude


async def fill_recipe_macros(naam: str, ingredienten: list[str]) -> dict:
    return await estimate_macros(naam, ingredienten)


async def add_recipe_to_schema(recept: dict, huidig_schema: list) -> dict:
    return await integrate_recipe_in_schema(recept, huidig_schema)


async def check_week_macros(week_data: dict) -> dict:
    return await validate_week_macros(week_data)


async def fill_recipe_instructions(naam: str, ingredienten: list[str] | None = None) -> str:
    return await generate_instructions(naam, ingredienten)


async def fill_recipe_ingredients(naam: str) -> str:
    return await generate_ingredients_claude(naam)


async def generate_week_shopping(week_plan: dict) -> list[dict]:
    return await generate_shopping_list(week_plan)


async def generate_week_plan(
    meal_types: list[str],
    locked_slots: dict,
    stock: list[dict],
    recipes: list,
) -> list[dict]:
    """Genereert een weekplan als lijst van {dag, maaltijd_type, recept_id, recept_naam, score}."""
    from backend.ai.ollama_client import select_recipe_for_slot

    DAYS = ["maandag", "dinsdag", "woensdag", "donderdag", "vrijdag", "zaterdag", "zondag"]
    CATEGORY_MAP = {
        "ontbijt": "ontbijt", "lunch": "lunch", "snack": "snack",
        "diner": "diner", "avondsnack": "snack",
    }

    in_stock_names = {
        b["product_name"].lower() for b in stock if b.get("quantity", 0) > 0
    }

    def score_recipe(recipe) -> float:
        lines = [l.strip().lower() for l in (recipe.ingredienten or "").splitlines() if l.strip()]
        if not lines:
            return 0.0
        matches = sum(1 for line in lines if any(name in line for name in in_stock_names))
        return matches / len(lines)

    result = []
    for dag in DAYS:
        for meal_type in meal_types:
            locked = locked_slots.get(dag, {}).get(meal_type)
            if locked:
                result.append({"dag": dag, "maaltijd_type": meal_type, "recept_id": str(locked), "recept_naam": None, "score": 1.0})
                continue

            categorie = CATEGORY_MAP.get(meal_type, meal_type)
            candidates = [
                {"naam": r.naam, "id": str(r.id), "score": score_recipe(r)}
                for r in recipes if r.categorie == categorie
            ]
            candidates.sort(key=lambda x: x["score"], reverse=True)
            top5 = candidates[:5]

            if not top5:
                continue

            chosen_naam = await select_recipe_for_slot(meal_type, top5)
            chosen = next((c for c in top5 if c["naam"] == chosen_naam), top5[0])
            result.append({
                "dag": dag,
                "maaltijd_type": meal_type,
                "recept_id": chosen["id"],
                "recept_naam": chosen["naam"],
                "score": chosen["score"],
            })

    return result
