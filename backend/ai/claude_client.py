import json
import logging
import anthropic
from backend.config import settings

logger = logging.getLogger(__name__)

_client = anthropic.AsyncAnthropic(api_key=settings.anthropic_api_key)

INTEGRATE_PROMPT = """Je bent een voedingsschema expert. Een gebruiker wil een nieuw recept toevoegen aan zijn 8-weeks voedingsschema.

Nieuw recept:
{recept}

Huidig schema (week en dag toewijzingen):
{schema}

Macro targets: 2700-2900 kcal/dag, 160g eiwit/dag, 80g vet/dag, 320-350g koolhydraten/dag.

Integreer het recept op een logische plek in het schema. Geef terug als JSON:
{{"status": "ok", "aanpassingen": [{{"week": <int>, "dag": "<dag>", "maaltijd_type": "<type>", "actie": "vervang|toevoeg"}}], "uitleg": "<kort>"}}

Alleen JSON, geen uitleg."""


async def integrate_recipe_in_schema(recept: dict, huidig_schema: list) -> dict:
    message = await _client.messages.create(
        model="claude-sonnet-4-6",
        max_tokens=1024,
        messages=[{
            "role": "user",
            "content": INTEGRATE_PROMPT.format(
                recept=json.dumps(recept, ensure_ascii=False),
                schema=json.dumps(huidig_schema, ensure_ascii=False),
            )
        }],
    )
    raw = message.content[0].text
    try:
        start = raw.find("{")
        end = raw.rfind("}") + 1
        return json.loads(raw[start:end])
    except (json.JSONDecodeError, ValueError):
        logger.warning("integrate_recipe_in_schema: kon JSON niet parsen: %r", raw)
        return {"status": "error", "aanpassingen": [], "uitleg": "Parse fout"}


async def generate_ingredients_claude(naam: str) -> str:
    message = await _client.messages.create(
        model="claude-haiku-4-5-20251001",
        max_tokens=300,
        messages=[{
            "role": "user",
            "content": (
                f"Geef de ingrediënten voor het recept '{naam}' voor 2 personen. "
                "Geef alleen de ingrediëntenlijst terug, één ingrediënt per regel, "
                "met hoeveelheid en eenheid (bijv. '200g kipfilet'). Geen titels, geen uitleg."
            )
        }],
    )
    return message.content[0].text.strip()


async def suggest_recipe_from_stock(orphaned_products: list[str]) -> dict:
    products_str = ", ".join(orphaned_products)
    message = await _client.messages.create(
        model="claude-haiku-4-5-20251001",
        max_tokens=400,
        messages=[{
            "role": "user",
            "content": (
                f"Maak een receptsuggestie op basis van deze producten die ik op voorraad heb: {products_str}. "
                "Geef terug als JSON: "
                '{"naam": "...", "beschrijving": "...", "ingredienten": "ingrediënt1\\ningredient2\\n..."} '
                "Alleen JSON, geen uitleg."
            )
        }],
    )
    raw = message.content[0].text.strip()
    try:
        start = raw.find("{")
        end = raw.rfind("}") + 1
        return json.loads(raw[start:end])
    except (json.JSONDecodeError, ValueError):
        logger.warning("suggest_recipe_from_stock: kon JSON niet parsen: %r", raw)
        return {"naam": "Recept op basis van voorraad", "beschrijving": "", "ingredienten": "\n".join(orphaned_products)}


async def validate_week_macros(week_data: dict) -> dict:
    message = await _client.messages.create(
        model="claude-sonnet-4-6",
        max_tokens=512,
        messages=[{
            "role": "user",
            "content": f"""Controleer of dit weekplan voldoet aan de macro targets (2700-2900 kcal/dag, 160g eiwit/dag):
{json.dumps(week_data, ensure_ascii=False)}

Geef terug als JSON:
{{"voldoet": true/false, "gemiddeld_eiwit_g": <float>, "gemiddeld_kcal": <int>, "opmerkingen": "<tekst>"}}"""
        }],
    )
    raw = message.content[0].text
    try:
        start = raw.find("{")
        end = raw.rfind("}") + 1
        return json.loads(raw[start:end])
    except (json.JSONDecodeError, ValueError):
        logger.warning("validate_week_macros: kon JSON niet parsen: %r", raw)
        return {"voldoet": None, "gemiddeld_eiwit_g": None, "gemiddeld_kcal": None, "opmerkingen": "Validatie mislukt"}
