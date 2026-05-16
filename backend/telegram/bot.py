import asyncio
from datetime import date
from telegram import Bot
from backend.config import settings

DAG_AFKORTINGEN = {
    "maandag": "Ma", "dinsdag": "Di", "woensdag": "Wo", "donderdag": "Do",
    "vrijdag": "Vr", "zaterdag": "Za", "zondag": "Zo",
}
KANTOOR_DAGEN = {"maandag", "woensdag"}
CATEGORIE_VOLGORDE = ["zuivel", "groente", "koolhydraten", "fruit", "conserven"]
MEAL_EMOJI = {"ontbijt": "🥣", "lunch": "🥗", "diner": "🍽️", "snack": "🍎", "avondsnack": "🌙"}
MAAND_NL = ["", "jan", "feb", "mrt", "apr", "mei", "jun", "jul", "aug", "sep", "okt", "nov", "dec"]


def format_weekly_message(week_data: dict) -> str:
    week_num = week_data["week"]
    vlees_thema = week_data.get("vlees_thema", "")

    lines = [
        f"👨‍🍳 Chef Agent — Week {week_num} | {vlees_thema}",
        "",
        "📅 MAALTIJDPLAN",
        "━━━━━━━━━━━━━━━━━━",
    ]

    for dag_data in week_data["dagen"]:
        dag = dag_data["dag"]
        afk = DAG_AFKORTINGEN.get(dag, dag[:2].capitalize())
        maaltijden = dag_data.get("maaltijden", [])
        namen = [m["naam"] for m in maaltijden if m.get("naam")]

        if not namen:
            lines.append(f"{afk}: —")
            continue

        suffix = " (kantoor)" if dag in KANTOOR_DAGEN else ""
        batch = " 🍳 BATCH" if dag_data.get("is_batch") else ""
        lines.append(f"{afk}:{batch} {' · '.join(namen)}{suffix}")

    lines += ["", "🛒 BOODSCHAPPEN LIDL", "━━━━━━━━━━━━━━━━━━"]

    shopping = week_data.get("shopping", [])
    by_cat: dict[str, list] = {}
    for item in shopping:
        cat = item.get("categorie", "overig")
        by_cat.setdefault(cat, []).append(
            f"{item['product']} {item.get('hoeveelheid', '')}".strip()
        )

    for cat in CATEGORIE_VOLGORDE:
        if cat in by_cat:
            lines.append(f"{cat.capitalize()}: {' · '.join(by_cat[cat])}")
    for cat, items in by_cat.items():
        if cat not in CATEGORIE_VOLGORDE:
            lines.append(f"{cat.capitalize()}: {' · '.join(items)}")

    freezer = week_data.get("freezer", [])
    if freezer:
        lines += ["", "❄️ VRIEZER", "━━━━━━━━━━━━━━━━━━"]
        for fi in freezer:
            dag_ont = fi["ontdooi_dag"].capitalize()
            lines.append(
                f"{dag_ont}: haal {fi['product']} eruit → gebruik {fi['gebruik_dag']}"
            )

    lines += ["", f"💪 Week target: 160g eiwit/dag · 2700-2900 kcal"]
    return "\n".join(lines)


def format_daily_message(dag_data: dict, cyclus_week: int) -> str:
    dag = dag_data.get("dag", "")
    dag_label = dag.capitalize()
    vandaag = date.today()
    datum = f"{vandaag.day} {MAAND_NL[vandaag.month]}"

    lines = [f"☀️ Goedemorgen! — {dag_label} {datum}", ""]

    maaltijden = dag_data.get("maaltijden", [])
    if maaltijden:
        lines.append("Vandaag eet je:")
        for m in maaltijden:
            emoji = MEAL_EMOJI.get(m.get("maaltijd_type", ""), "🍴")
            lines.append(f"{emoji} {m['naam']}")
        lines.append("")

        totaal_eiwit = dag_data.get("totaal_eiwit_g", 0)
        totaal_kcal = dag_data.get("totaal_kcal", 0)
        if totaal_eiwit or totaal_kcal:
            lines.append(f"💪 {round(totaal_eiwit)}g eiwit · {totaal_kcal} kcal")
    else:
        lines.append("Geen maaltijden ingesteld voor vandaag.")

    return "\n".join(lines)


def format_shopping_reminder(week_data: dict) -> str:
    week_num = week_data.get("week", "?")
    vlees_thema = week_data.get("vlees_thema", "")

    lines = [
        f"🛒 Boodschappen — Week {week_num}{' | ' + vlees_thema if vlees_thema else ''}",
        "",
        "Vergeet niet vandaag boodschappen te doen!",
    ]

    shopping = week_data.get("shopping", [])
    if shopping:
        lines.append("")
        by_cat: dict[str, list] = {}
        for item in shopping:
            cat = item.get("categorie", "overig")
            by_cat.setdefault(cat, []).append(
                f"{item['product']} {item.get('hoeveelheid', '')}".strip()
            )
        for cat in CATEGORIE_VOLGORDE:
            if cat in by_cat:
                lines.append(f"{cat.capitalize()}: {' · '.join(by_cat[cat])}")
        for cat, items in by_cat.items():
            if cat not in CATEGORIE_VOLGORDE:
                lines.append(f"{cat.capitalize()}: {' · '.join(items)}")

    return "\n".join(lines)


async def send_message(text: str) -> None:
    if not settings.telegram_bot_token or not settings.telegram_chat_id:
        print("Telegram niet geconfigureerd — bericht overgeslagen")
        return
    bot = Bot(token=settings.telegram_bot_token)
    await bot.send_message(chat_id=settings.telegram_chat_id, text=text)


async def send_daily_message(dag_data: dict, cyclus_week: int) -> None:
    await send_message(format_daily_message(dag_data, cyclus_week))


async def send_shopping_reminder(week_data: dict) -> None:
    await send_message(format_shopping_reminder(week_data))


async def send_weekly_message(week_data: dict) -> None:
    await send_message(format_weekly_message(week_data))
