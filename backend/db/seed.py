"""
Seed script — importeert het voedingsschema v8 in de database.
Draai eenmalig: python -m backend.db.seed
"""
from backend.db.session import SessionLocal
from backend.db.models import Recipe, MealPlan, ShoppingList, FreezerItem, NutritionCycle


RECIPES = [
    {"naam": "Havermout met kwark en bessen", "categorie": "ontbijt", "kcal": 420, "eiwit_g": 32.0, "vet_g": 8.0, "koolhydraten_g": 52.0},
    {"naam": "Kwark bowl met noten en banaan", "categorie": "ontbijt", "kcal": 380, "eiwit_g": 28.0, "vet_g": 12.0, "koolhydraten_g": 40.0},
    {"naam": "Omelet met feta en spinazie", "categorie": "ontbijt", "kcal": 340, "eiwit_g": 26.0, "vet_g": 22.0, "koolhydraten_g": 6.0},
    {"naam": "Griekse yoghurt met muesli en fruit", "categorie": "ontbijt", "kcal": 360, "eiwit_g": 22.0, "vet_g": 8.0, "koolhydraten_g": 48.0},
    {"naam": "Tonijn wrap met groente", "categorie": "lunch", "kcal": 420, "eiwit_g": 32.0, "vet_g": 12.0, "koolhydraten_g": 38.0},
    {"naam": "Feta salade met volkorenbrood", "categorie": "lunch", "kcal": 380, "eiwit_g": 22.0, "vet_g": 18.0, "koolhydraten_g": 32.0},
    {"naam": "Kwark met wraps (kantoor)", "categorie": "lunch", "kcal": 350, "eiwit_g": 28.0, "vet_g": 8.0, "koolhydraten_g": 38.0},
    {"naam": "Gehakt bolognese met volkorenpasta", "categorie": "diner", "kcal": 650, "eiwit_g": 48.0, "vet_g": 22.0, "koolhydraten_g": 55.0, "vlees_type": "gehakt"},
    {"naam": "Gehakt wokschotel met rijst", "categorie": "diner", "kcal": 620, "eiwit_g": 44.0, "vet_g": 18.0, "koolhydraten_g": 58.0, "vlees_type": "gehakt"},
    {"naam": "Riblap stoof met zoete aardappel", "categorie": "diner", "kcal": 680, "eiwit_g": 52.0, "vet_g": 24.0, "koolhydraten_g": 48.0, "vlees_type": "riblap"},
    {"naam": "Slow roast rosbief met aardappelen", "categorie": "diner", "kcal": 720, "eiwit_g": 64.0, "vet_g": 28.0, "koolhydraten_g": 42.0, "vlees_type": "rosbief"},
    {"naam": "Ribeye met gegrilde groente", "categorie": "diner", "kcal": 680, "eiwit_g": 52.0, "vet_g": 38.0, "koolhydraten_g": 18.0, "vlees_type": "ribeye"},
    {"naam": "Entrecote met zoete aardappel", "categorie": "diner", "kcal": 660, "eiwit_g": 52.0, "vet_g": 32.0, "koolhydraten_g": 40.0, "vlees_type": "entrecote"},
    {"naam": "Kogelbiefstuk met wokgroente", "categorie": "diner", "kcal": 580, "eiwit_g": 48.0, "vet_g": 22.0, "koolhydraten_g": 32.0, "vlees_type": "kogelbiefstuk"},
    {"naam": "Ossenhaas met aardappelgratin", "categorie": "diner", "kcal": 720, "eiwit_g": 58.0, "vet_g": 32.0, "koolhydraten_g": 44.0, "vlees_type": "ossenhaas"},
    {"naam": "Tartaar met salade en brood", "categorie": "diner", "kcal": 520, "eiwit_g": 44.0, "vet_g": 18.0, "koolhydraten_g": 38.0, "vlees_type": "tartaar"},
    {"naam": "Worstjes met stamppot boerenkool", "categorie": "diner", "kcal": 640, "eiwit_g": 38.0, "vet_g": 28.0, "koolhydraten_g": 52.0, "vlees_type": "worstjes"},
    {"naam": "Hamburgers van de BBQ", "categorie": "diner", "kcal": 600, "eiwit_g": 42.0, "vet_g": 30.0, "koolhydraten_g": 30.0, "vlees_type": "hamburgers"},
]

NUTRITION_CYCLE = [
    {"cyclus_week": 1, "vlees_type": "gehakt+ribeye+hamburgers", "hoeveelheid_g": 1050},
    {"cyclus_week": 2, "vlees_type": "riblap+biefstuk+worstjes", "hoeveelheid_g": 1350},
    {"cyclus_week": 3, "vlees_type": "rosbief+hamburgers+entrecote", "hoeveelheid_g": 1150},
    {"cyclus_week": 4, "vlees_type": "gehakt+kogelbiefstuk+worstjes", "hoeveelheid_g": 1250},
    {"cyclus_week": 5, "vlees_type": "riblap+gehakt+ribeye+hamburgers", "hoeveelheid_g": 1350},
    {"cyclus_week": 6, "vlees_type": "entrecote+ossenhaas+gehakt", "hoeveelheid_g": 1150},
    {"cyclus_week": 7, "vlees_type": "gehakt+hamburgers+worstjes", "hoeveelheid_g": 1050},
    {"cyclus_week": 8, "vlees_type": "tartaar+magere_lap", "hoeveelheid_g": 800},
]

SHOPPING_BASE_WEEK = [
    {"product": "Milbona magere kwark 500g", "categorie": "zuivel", "hoeveelheid": "7 pakken", "winkel": "lidl", "prijs_indicatie": 11.20},
    {"product": "Griekse yoghurt 1kg", "categorie": "zuivel", "hoeveelheid": "2 pakken", "winkel": "lidl", "prijs_indicatie": 5.00},
    {"product": "Eieren scharrel 10-pak", "categorie": "zuivel", "hoeveelheid": "3 doosjes", "winkel": "lidl", "prijs_indicatie": 6.60},
    {"product": "Belegen kaas plakjes 200g", "categorie": "zuivel", "hoeveelheid": "1 pak", "winkel": "lidl", "prijs_indicatie": 3.00},
    {"product": "Feta 200g", "categorie": "zuivel", "hoeveelheid": "2 blokken", "winkel": "lidl", "prijs_indicatie": 3.60},
    {"product": "Uien zak 1kg", "categorie": "groente", "hoeveelheid": "1 zak", "winkel": "lidl", "prijs_indicatie": 1.30},
    {"product": "Knoflook bol", "categorie": "groente", "hoeveelheid": "2 bollen", "winkel": "lidl", "prijs_indicatie": 1.00},
    {"product": "Paprika rood/geel", "categorie": "groente", "hoeveelheid": "5 stuks", "winkel": "lidl", "prijs_indicatie": 4.00},
    {"product": "Courgette", "categorie": "groente", "hoeveelheid": "2 stuks", "winkel": "lidl", "prijs_indicatie": 2.00},
    {"product": "Wortel zak 1kg", "categorie": "groente", "hoeveelheid": "1 zak", "winkel": "lidl", "prijs_indicatie": 1.20},
    {"product": "Spinazie diepvries 450g", "categorie": "groente", "hoeveelheid": "2 zakken", "winkel": "lidl", "prijs_indicatie": 3.00},
    {"product": "Cherrytomaten 500g", "categorie": "groente", "hoeveelheid": "1 bakje", "winkel": "lidl", "prijs_indicatie": 1.80},
    {"product": "Rode aardappel 2kg", "categorie": "koolhydraten", "hoeveelheid": "2 kg", "winkel": "lidl", "prijs_indicatie": 3.00},
    {"product": "Zoete aardappel", "categorie": "koolhydraten", "hoeveelheid": "1.5 kg", "winkel": "lidl", "prijs_indicatie": 3.50},
    {"product": "Volkorenbrood", "categorie": "koolhydraten", "hoeveelheid": "2 broden", "winkel": "lidl", "prijs_indicatie": 3.60},
    {"product": "Havermout 1kg", "categorie": "koolhydraten", "hoeveelheid": "1 pak (2 weken)", "winkel": "lidl", "prijs_indicatie": 1.50},
    {"product": "Volkorenwraps", "categorie": "koolhydraten", "hoeveelheid": "1 pak 8 stuks", "winkel": "lidl", "prijs_indicatie": 1.50},
    {"product": "Tonijn in olijfolie 80g", "categorie": "conserven", "hoeveelheid": "5 blikjes", "winkel": "lidl", "prijs_indicatie": 5.00},
    {"product": "Tomatenpuree 70g", "categorie": "conserven", "hoeveelheid": "2 blikjes", "winkel": "lidl", "prijs_indicatie": 1.20},
]

FREEZER_ITEMS_PER_WEEK = {
    1: [
        {"product": "Gehakt 300g (3 pakjes)", "hoeveelheid": "900g", "ontdooi_dag": "woensdag", "gebruik_dag": "donderdag"},
        {"product": "Ribeye 250g", "hoeveelheid": "250g", "ontdooi_dag": "vrijdag", "gebruik_dag": "zaterdag"},
    ],
    2: [
        {"product": "Riblap 800g", "hoeveelheid": "800g", "ontdooi_dag": "dinsdag", "gebruik_dag": "donderdag"},
        {"product": "Worstjes 4 stuks", "hoeveelheid": "200g", "ontdooi_dag": "vrijdag", "gebruik_dag": "zaterdag"},
    ],
    3: [
        {"product": "Rosbief 700g", "hoeveelheid": "700g", "ontdooi_dag": "vrijdag", "gebruik_dag": "zondag"},
        {"product": "Entrecote 250g", "hoeveelheid": "250g", "ontdooi_dag": "maandag", "gebruik_dag": "dinsdag"},
    ],
    4: [
        {"product": "Gehakt 300g (3 pakjes)", "hoeveelheid": "900g", "ontdooi_dag": "woensdag", "gebruik_dag": "donderdag"},
        {"product": "Kogelbiefstuk 500g", "hoeveelheid": "500g", "ontdooi_dag": "zaterdag", "gebruik_dag": "zondag"},
    ],
    5: [
        {"product": "Riblap 800g", "hoeveelheid": "800g", "ontdooi_dag": "dinsdag", "gebruik_dag": "donderdag"},
        {"product": "Gehakt 300g (2 pakjes)", "hoeveelheid": "600g", "ontdooi_dag": "woensdag", "gebruik_dag": "donderdag"},
    ],
    6: [
        {"product": "Entrecote 250g", "hoeveelheid": "250g", "ontdooi_dag": "maandag", "gebruik_dag": "dinsdag"},
        {"product": "Ossenhaas 400g", "hoeveelheid": "400g", "ontdooi_dag": "zaterdag", "gebruik_dag": "zondag"},
    ],
    7: [
        {"product": "Gehakt 300g (3 pakjes)", "hoeveelheid": "900g", "ontdooi_dag": "woensdag", "gebruik_dag": "donderdag"},
        {"product": "Worstjes 4 stuks", "hoeveelheid": "200g", "ontdooi_dag": "vrijdag", "gebruik_dag": "zaterdag"},
    ],
    8: [
        {"product": "Tartaar 500g", "hoeveelheid": "500g", "ontdooi_dag": "dinsdag", "gebruik_dag": "woensdag"},
        {"product": "Magere lap 300g", "hoeveelheid": "300g", "ontdooi_dag": "vrijdag", "gebruik_dag": "zaterdag"},
    ],
}


_DAYS = ["maandag", "dinsdag", "woensdag", "donderdag", "vrijdag", "zaterdag", "zondag"]

_BREAKFAST = [
    "Havermout met kwark en bessen",
    "Kwark bowl met noten en banaan",
    "Omelet met feta en spinazie",
    "Griekse yoghurt met muesli en fruit",
]

_LUNCH = [
    "Tonijn wrap met groente",
    "Kwark met wraps (kantoor)",
    "Feta salade met volkorenbrood",
]

_WEEK_DINNERS = {
    1: ["Gehakt bolognese met volkorenpasta", "Gehakt wokschotel met rijst", "Gehakt bolognese met volkorenpasta", "Gehakt wokschotel met rijst", "Gehakt bolognese met volkorenpasta", "Ribeye met gegrilde groente", "Hamburgers van de BBQ"],
    2: ["Riblap stoof met zoete aardappel", "Riblap stoof met zoete aardappel", "Kogelbiefstuk met wokgroente", "Riblap stoof met zoete aardappel", "Kogelbiefstuk met wokgroente", "Worstjes met stamppot boerenkool", "Worstjes met stamppot boerenkool"],
    3: ["Entrecote met zoete aardappel", "Entrecote met zoete aardappel", "Hamburgers van de BBQ", "Hamburgers van de BBQ", "Hamburgers van de BBQ", "Slow roast rosbief met aardappelen", "Slow roast rosbief met aardappelen"],
    4: ["Gehakt bolognese met volkorenpasta", "Gehakt wokschotel met rijst", "Gehakt bolognese met volkorenpasta", "Kogelbiefstuk met wokgroente", "Gehakt wokschotel met rijst", "Kogelbiefstuk met wokgroente", "Worstjes met stamppot boerenkool"],
    5: ["Riblap stoof met zoete aardappel", "Gehakt bolognese met volkorenpasta", "Riblap stoof met zoete aardappel", "Gehakt wokschotel met rijst", "Ribeye met gegrilde groente", "Hamburgers van de BBQ", "Ribeye met gegrilde groente"],
    6: ["Entrecote met zoete aardappel", "Entrecote met zoete aardappel", "Ossenhaas met aardappelgratin", "Gehakt bolognese met volkorenpasta", "Gehakt wokschotel met rijst", "Ossenhaas met aardappelgratin", "Ossenhaas met aardappelgratin"],
    7: ["Gehakt bolognese met volkorenpasta", "Gehakt wokschotel met rijst", "Hamburgers van de BBQ", "Gehakt bolognese met volkorenpasta", "Worstjes met stamppot boerenkool", "Hamburgers van de BBQ", "Worstjes met stamppot boerenkool"],
    8: ["Tartaar met salade en brood", "Tartaar met salade en brood", "Tartaar met salade en brood", "Tartaar met salade en brood", "Tartaar met salade en brood", "Tartaar met salade en brood", "Tartaar met salade en brood"],
}


def seed():
    db = SessionLocal()
    try:
        if db.query(Recipe).count() > 0:
            print("Database al geseed — overgeslagen.")
        else:
            for r in RECIPES:
                db.add(Recipe(**r))

            for nc in NUTRITION_CYCLE:
                db.add(NutritionCycle(**nc))

            for week in range(1, 9):
                for item in SHOPPING_BASE_WEEK:
                    db.add(ShoppingList(cyclus_week=week, **item))
                for fi in FREEZER_ITEMS_PER_WEEK.get(week, []):
                    db.add(FreezerItem(cyclus_week=week, **fi))

            db.commit()
            print(f"Seed klaar: {len(RECIPES)} recepten, 8 weken schema.")

        if db.query(MealPlan).count() > 0:
            print("Maaltijdplannen al geseed — overgeslagen.")
        else:
            recipes = {r.naam: r for r in db.query(Recipe).all()}
            count = 0
            for week in range(1, 9):
                for day_idx, dag in enumerate(_DAYS):
                    breakfast_naam = _BREAKFAST[((week - 1) * 7 + day_idx) % len(_BREAKFAST)]
                    lunch_naam = _LUNCH[((week - 1) * 7 + day_idx) % len(_LUNCH)]
                    dinner_naam = _WEEK_DINNERS.get(week, [])[day_idx] if day_idx < len(_WEEK_DINNERS.get(week, [])) else None

                    for maaltijd_type, naam in [("ontbijt", breakfast_naam), ("lunch", lunch_naam), ("diner", dinner_naam)]:
                        if naam and naam in recipes:
                            db.add(MealPlan(cyclus_week=week, dag=dag, maaltijd_type=maaltijd_type, recept_id=recipes[naam].id))
                            count += 1

            db.commit()
            print(f"Maaltijdplannen geseed: {count} entries voor 8 weken.")
    finally:
        db.close()


if __name__ == "__main__":
    seed()
