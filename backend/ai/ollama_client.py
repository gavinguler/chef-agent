import json
import httpx
from backend.config import settings

MACRO_PROMPT = """Schat de macronutriënten voor dit recept en geef een JSON terug (enkel JSON, geen uitleg):
Recept: {naam}
Ingrediënten: {ingredienten}

Geef terug als JSON:
{{"kcal": <int>, "eiwit_g": <float>, "vet_g": <float>, "koolhydraten_g": <float>}}"""


async def ollama_chat(prompt: str, model: str = "llama3.1:8b") -> str:
    async with httpx.AsyncClient(timeout=60.0) as client:
        response = await client.post(
            f"{settings.ollama_base_url}/api/generate",
            json={"model": model, "prompt": prompt, "stream": False},
        )
        response.raise_for_status()
        return response.json()["response"]


async def estimate_macros(naam: str, ingredienten: list[str]) -> dict:
    prompt = MACRO_PROMPT.format(naam=naam, ingredienten=", ".join(ingredienten))
    raw = await ollama_chat(prompt)
    try:
        start = raw.find("{")
        end = raw.rfind("}") + 1
        return json.loads(raw[start:end])
    except (json.JSONDecodeError, ValueError):
        return {"kcal": None, "eiwit_g": None, "vet_g": None, "koolhydraten_g": None}


async def generate_shopping_list(week_plan: dict) -> list[dict]:
    """Genereer een boodschappenlijst op basis van het weekplan."""
    recepten = []
    for dag in week_plan.get("dagen", []):
        for m in dag.get("maaltijden", []):
            if m.get("naam"):
                recepten.append(m["naam"])

    prompt = f"""Maak een boodschappenlijst voor deze maaltijden deze week:
{chr(10).join(f'- {r}' for r in recepten)}

Geef terug als JSON array:
[{{"product": "...", "categorie": "zuivel|groente|koolhydraten|conserven|overig", "hoeveelheid": "..."}}]
Alleen JSON, geen uitleg."""

    raw = await ollama_chat(prompt)
    try:
        start = raw.find("[")
        end = raw.rfind("]") + 1
        return json.loads(raw[start:end])
    except (json.JSONDecodeError, ValueError):
        return []
