import asyncio
import base64
import logging
import re

import httpx

from backend.config import settings

logger = logging.getLogger(__name__)

WIKI_REPO = "gavinguler/LLM-wiki"
WIKI_BRANCH = "main"
WIKI_FOLDER = "Gavin/recepten"


def _slug(naam: str) -> str:
    s = naam.lower()
    s = re.sub(r"[àáâãäå]", "a", s)
    s = re.sub(r"[èéêë]", "e", s)
    s = re.sub(r"[ìíîï]", "i", s)
    s = re.sub(r"[òóôõö]", "o", s)
    s = re.sub(r"[ùúûü]", "u", s)
    s = re.sub(r"[^\w\s-]", "", s)
    s = re.sub(r"\s+", "-", s.strip())
    return s


def _to_markdown(recipe) -> str:
    lines = [f"# {recipe.naam}", ""]

    meta = []
    if recipe.categorie:
        meta.append(f"**Categorie:** {recipe.categorie.capitalize()}")
    if recipe.vlees_type:
        meta.append(f"**Vlees:** {recipe.vlees_type}")
    if meta:
        lines += [" · ".join(meta), ""]

    macros = []
    if recipe.kcal:
        macros.append(f"{recipe.kcal} kcal")
    if recipe.eiwit_g:
        macros.append(f"{recipe.eiwit_g:.0f}g eiwit")
    if recipe.vet_g:
        macros.append(f"{recipe.vet_g:.0f}g vet")
    if recipe.koolhydraten_g:
        macros.append(f"{recipe.koolhydraten_g:.0f}g KH")
    if macros:
        lines += [f"**Macro's:** {' · '.join(macros)}", ""]

    if recipe.beschrijving:
        lines += ["## Beschrijving", recipe.beschrijving, ""]

    if recipe.instructies:
        lines += ["## Bereiding", recipe.instructies, ""]

    return "\n".join(lines)


def _headers() -> dict:
    return {
        "Authorization": f"Bearer {settings.github_token}",
        "Accept": "application/vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28",
    }


async def sync_recipe_to_wiki(recipe) -> None:
    if not settings.github_token:
        return
    path = f"{WIKI_FOLDER}/{_slug(recipe.naam)}.md"
    url = f"https://api.github.com/repos/{WIKI_REPO}/contents/{path}"
    content_b64 = base64.b64encode(_to_markdown(recipe).encode()).decode()
    try:
        async with httpx.AsyncClient(timeout=10) as client:
            get_resp = await client.get(url, headers=_headers())
            sha = get_resp.json().get("sha") if get_resp.status_code == 200 else None
            payload: dict = {
                "message": f"sync: recept '{recipe.naam}'",
                "content": content_b64,
                "branch": WIKI_BRANCH,
            }
            if sha:
                payload["sha"] = sha
            resp = await client.put(url, json=payload, headers=_headers())
            if resp.status_code not in (200, 201):
                logger.warning("Wiki sync mislukt voor '%s': %s", recipe.naam, resp.text)
    except Exception:
        logger.exception("Wiki sync fout voor '%s'", recipe.naam)


async def delete_recipe_from_wiki(naam: str) -> None:
    if not settings.github_token:
        return
    path = f"{WIKI_FOLDER}/{_slug(naam)}.md"
    url = f"https://api.github.com/repos/{WIKI_REPO}/contents/{path}"
    try:
        async with httpx.AsyncClient(timeout=10) as client:
            get_resp = await client.get(url, headers=_headers())
            if get_resp.status_code != 200:
                return
            sha = get_resp.json().get("sha")
            resp = await client.delete(url, json={
                "message": f"sync: verwijder recept '{naam}'",
                "sha": sha,
                "branch": WIKI_BRANCH,
            }, headers=_headers())
            if resp.status_code != 200:
                logger.warning("Wiki delete mislukt voor '%s': %s", naam, resp.text)
    except Exception:
        logger.exception("Wiki delete fout voor '%s'", naam)


async def sync_all_recipes_to_wiki(recipes: list) -> int:
    if not settings.github_token:
        return 0
    await asyncio.gather(*[sync_recipe_to_wiki(r) for r in recipes])
    return len(recipes)
