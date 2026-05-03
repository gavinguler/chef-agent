from backend.ai.ollama_client import estimate_macros, generate_shopping_list
from backend.ai.claude_client import integrate_recipe_in_schema, validate_week_macros


async def fill_recipe_macros(naam: str, ingredienten: list[str]) -> dict:
    return await estimate_macros(naam, ingredienten)


async def add_recipe_to_schema(recept: dict, huidig_schema: list) -> dict:
    return await integrate_recipe_in_schema(recept, huidig_schema)


async def check_week_macros(week_data: dict) -> dict:
    return await validate_week_macros(week_data)


async def generate_week_shopping(week_plan: dict) -> list[dict]:
    return await generate_shopping_list(week_plan)
