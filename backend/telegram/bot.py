import asyncio
from telegram import Bot
from backend.config import settings

DAG_AFKORTINGEN = {
    "maandag": "Ma", "dinsdag": "Di", "woensdag": "Wo", "donderdag": "Do",
    "vrijdag": "Vr", "zaterdag": "Za", "zondag": "Zo",
}
KANTOOR_DAGEN = {"maandag", "woensdag"}
CATEGORIE_VOLGORDE = ["zuivel", "groente", "koolhydraten", "fruit", "conserven"]


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


async def send_weekly_message(week_data: dict) -> None:
    if not settings.telegram_bot_token or not settings.telegram_chat_id:
        print("Telegram niet geconfigureerd — bericht overgeslagen")
        return
    bot = Bot(token=settings.telegram_bot_token)
    message = format_weekly_message(week_data)
    await bot.send_message(
        chat_id=settings.telegram_chat_id,
        text=message,
    )
