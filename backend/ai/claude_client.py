import json
import logging
import anthropic
from backend.config import settings

logger = logging.getLogger(__name__)

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
    client = anthropic.AsyncAnthropic(api_key=settings.anthropic_api_key)
    message = await client.messages.create(
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


async def validate_week_macros(week_data: dict) -> dict:
    client = anthropic.AsyncAnthropic(api_key=settings.anthropic_api_key)
    message = await client.messages.create(
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
        return {"voldoet": None, "opmerkingen": "Validatie mislukt"}
