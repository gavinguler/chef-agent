"""
Seed script — importeert het voedingsschema v8 in de database.
Draai eenmalig: python -m backend.db.seed
Herstart met reset: python -m backend.db.seed --reset
"""
import sys
from backend.db.session import SessionLocal
from backend.db.models import Recipe, MealPlan, ShoppingList, FreezerItem, NutritionCycle


RECIPES = [
    # ONTBIJT
    {"naam": "Griekse yoghurt met muesli en bessen", "categorie": "ontbijt", "kcal": 360, "eiwit_g": 22.0, "vet_g": 8.0, "koolhydraten_g": 48.0},
    {"naam": "Kwark met havermout, banaan en pindakaas", "categorie": "ontbijt", "kcal": 380, "eiwit_g": 30.0, "vet_g": 10.0, "koolhydraten_g": 44.0},
    {"naam": "Kwark met muesli en fruit", "categorie": "ontbijt", "kcal": 360, "eiwit_g": 28.0, "vet_g": 8.0, "koolhydraten_g": 44.0},
    {"naam": "Griekse yoghurt met muesli en frambozen", "categorie": "ontbijt", "kcal": 350, "eiwit_g": 20.0, "vet_g": 8.0, "koolhydraten_g": 46.0},
    {"naam": "Eieren met volkorenbrood en kaas", "categorie": "ontbijt", "kcal": 420, "eiwit_g": 30.0, "vet_g": 22.0, "koolhydraten_g": 28.0},
    {"naam": "Havermout-pannenkoeken", "categorie": "ontbijt", "kcal": 380, "eiwit_g": 22.0, "vet_g": 12.0, "koolhydraten_g": 44.0},

    # LUNCH
    {"naam": "Bolognese (mee)", "categorie": "lunch", "kcal": 380, "eiwit_g": 32.0, "vet_g": 12.0, "koolhydraten_g": 28.0, "vlees_type": "gehakt"},
    {"naam": "Tonijnsalade met brood", "categorie": "lunch", "kcal": 400, "eiwit_g": 38.0, "vet_g": 10.0, "koolhydraten_g": 34.0},
    {"naam": "Couscous salade met feta en eieren", "categorie": "lunch", "kcal": 420, "eiwit_g": 30.0, "vet_g": 16.0, "koolhydraten_g": 40.0},
    {"naam": "Eieren met brood en kaas", "categorie": "lunch", "kcal": 380, "eiwit_g": 26.0, "vet_g": 18.0, "koolhydraten_g": 28.0},
    {"naam": "Linzencurry met rijst (batch)", "categorie": "lunch", "kcal": 420, "eiwit_g": 22.0, "vet_g": 8.0, "koolhydraten_g": 60.0},
    {"naam": "Riblap-stoof (mee)", "categorie": "lunch", "kcal": 360, "eiwit_g": 32.0, "vet_g": 14.0, "koolhydraten_g": 22.0, "vlees_type": "riblap"},
    {"naam": "Wrap met eieren, avocado en groente", "categorie": "lunch", "kcal": 440, "eiwit_g": 28.0, "vet_g": 20.0, "koolhydraten_g": 38.0},
    {"naam": "Bonen-wrap met feta en avocado", "categorie": "lunch", "kcal": 460, "eiwit_g": 26.0, "vet_g": 18.0, "koolhydraten_g": 48.0},
    {"naam": "Kikkererwten-stoof met couscous (batch)", "categorie": "lunch", "kcal": 400, "eiwit_g": 20.0, "vet_g": 10.0, "koolhydraten_g": 54.0},
    {"naam": "Eieren omelet met avocado en brood", "categorie": "lunch", "kcal": 400, "eiwit_g": 24.0, "vet_g": 22.0, "koolhydraten_g": 26.0},
    {"naam": "Rosbief koud met brood en mosterd", "categorie": "lunch", "kcal": 380, "eiwit_g": 36.0, "vet_g": 14.0, "koolhydraten_g": 24.0, "vlees_type": "rosbief"},
    {"naam": "Salade niçoise met tonijn", "categorie": "lunch", "kcal": 420, "eiwit_g": 36.0, "vet_g": 16.0, "koolhydraten_g": 28.0},
    {"naam": "Shakshuka (batch)", "categorie": "lunch", "kcal": 360, "eiwit_g": 22.0, "vet_g": 14.0, "koolhydraten_g": 32.0},
    {"naam": "Wrap met ei, feta en zongedroogde tomaat", "categorie": "lunch", "kcal": 440, "eiwit_g": 26.0, "vet_g": 18.0, "koolhydraten_g": 42.0},
    {"naam": "Chili con carne (mee)", "categorie": "lunch", "kcal": 380, "eiwit_g": 30.0, "vet_g": 12.0, "koolhydraten_g": 36.0, "vlees_type": "gehakt"},
    {"naam": "Caprese met mozzarella en brood", "categorie": "lunch", "kcal": 400, "eiwit_g": 22.0, "vet_g": 20.0, "koolhydraten_g": 30.0},
    {"naam": "Gehaktballetjes (mee)", "categorie": "lunch", "kcal": 380, "eiwit_g": 30.0, "vet_g": 16.0, "koolhydraten_g": 24.0, "vlees_type": "gehakt"},
    {"naam": "Pasta-salade met feta en olijven", "categorie": "lunch", "kcal": 440, "eiwit_g": 20.0, "vet_g": 18.0, "koolhydraten_g": 50.0},
    {"naam": "Rode-linzendahl met rijst (batch)", "categorie": "lunch", "kcal": 420, "eiwit_g": 22.0, "vet_g": 8.0, "koolhydraten_g": 60.0},
    {"naam": "Rundvleescurry (mee)", "categorie": "lunch", "kcal": 360, "eiwit_g": 30.0, "vet_g": 14.0, "koolhydraten_g": 22.0, "vlees_type": "gehakt"},
    {"naam": "Sushi-salade met tonijn en avocado", "categorie": "lunch", "kcal": 400, "eiwit_g": 28.0, "vet_g": 14.0, "koolhydraten_g": 40.0},
    {"naam": "Wrap met ei, avocado en sriracha", "categorie": "lunch", "kcal": 440, "eiwit_g": 28.0, "vet_g": 18.0, "koolhydraten_g": 40.0},
    {"naam": "Picadillo (mee)", "categorie": "lunch", "kcal": 360, "eiwit_g": 30.0, "vet_g": 12.0, "koolhydraten_g": 24.0, "vlees_type": "gehakt"},
    {"naam": "Tartaar met brood", "categorie": "lunch", "kcal": 380, "eiwit_g": 34.0, "vet_g": 16.0, "koolhydraten_g": 26.0, "vlees_type": "tartaar"},

    # SNACK
    {"naam": "Kwark met appel en pindakaas", "categorie": "snack", "kcal": 280, "eiwit_g": 22.0, "vet_g": 8.0, "koolhydraten_g": 28.0},
    {"naam": "Hardgekookte eieren met banaan", "categorie": "snack", "kcal": 240, "eiwit_g": 16.0, "vet_g": 10.0, "koolhydraten_g": 24.0},
    {"naam": "Kwark met banaan en pindakaas", "categorie": "snack", "kcal": 280, "eiwit_g": 22.0, "vet_g": 8.0, "koolhydraten_g": 32.0},
    {"naam": "Appel met gemengde noten", "categorie": "snack", "kcal": 220, "eiwit_g": 6.0, "vet_g": 14.0, "koolhydraten_g": 22.0},
    {"naam": "Kwark met bessen en noten", "categorie": "snack", "kcal": 280, "eiwit_g": 22.0, "vet_g": 10.0, "koolhydraten_g": 24.0},
    {"naam": "Kwark met havermout en banaan", "categorie": "snack", "kcal": 300, "eiwit_g": 24.0, "vet_g": 6.0, "koolhydraten_g": 38.0},

    # DINER
    {"naam": "Bolognese met volkorenpasta", "categorie": "diner", "kcal": 650, "eiwit_g": 48.0, "vet_g": 22.0, "koolhydraten_g": 55.0, "vlees_type": "gehakt"},
    {"naam": "Zalm met couscous en spinazie", "categorie": "diner", "kcal": 580, "eiwit_g": 40.0, "vet_g": 24.0, "koolhydraten_g": 44.0},
    {"naam": "Omelet met feta en spinazie", "categorie": "diner", "kcal": 440, "eiwit_g": 30.0, "vet_g": 28.0, "koolhydraten_g": 14.0},
    {"naam": "Linzencurry met basmatirijst", "categorie": "diner", "kcal": 520, "eiwit_g": 28.0, "vet_g": 12.0, "koolhydraten_g": 68.0},
    {"naam": "Ribeye met rode aardappel en sperziebonen", "categorie": "diner", "kcal": 680, "eiwit_g": 52.0, "vet_g": 38.0, "koolhydraten_g": 44.0, "vlees_type": "ribeye"},
    {"naam": "Kipfilet met couscous en paprika", "categorie": "diner", "kcal": 480, "eiwit_g": 48.0, "vet_g": 12.0, "koolhydraten_g": 42.0},
    {"naam": "Hamburgers met ei en groente", "categorie": "diner", "kcal": 600, "eiwit_g": 42.0, "vet_g": 30.0, "koolhydraten_g": 30.0, "vlees_type": "hamburgers"},
    {"naam": "Riblap-stoof met aardappelpuree", "categorie": "diner", "kcal": 680, "eiwit_g": 52.0, "vet_g": 24.0, "koolhydraten_g": 54.0, "vlees_type": "riblap"},
    {"naam": "Witvis met zilvervliesrijst en groente", "categorie": "diner", "kcal": 480, "eiwit_g": 38.0, "vet_g": 8.0, "koolhydraten_g": 58.0},
    {"naam": "Omelet met champignons en spinazie", "categorie": "diner", "kcal": 420, "eiwit_g": 28.0, "vet_g": 26.0, "koolhydraten_g": 10.0},
    {"naam": "Kikkererwten-stoof met couscous", "categorie": "diner", "kcal": 480, "eiwit_g": 22.0, "vet_g": 10.0, "koolhydraten_g": 68.0},
    {"naam": "Worstjes met rode aardappel", "categorie": "diner", "kcal": 620, "eiwit_g": 34.0, "vet_g": 28.0, "koolhydraten_g": 52.0, "vlees_type": "worstjes"},
    {"naam": "Kipfilet teriyaki met rijst en paksoi", "categorie": "diner", "kcal": 500, "eiwit_g": 48.0, "vet_g": 10.0, "koolhydraten_g": 52.0},
    {"naam": "Biefstuk met champignonsaus en zoete aardappel", "categorie": "diner", "kcal": 640, "eiwit_g": 52.0, "vet_g": 28.0, "koolhydraten_g": 46.0, "vlees_type": "biefstuk"},
    {"naam": "Rosbief warm met jus en rode aardappel", "categorie": "diner", "kcal": 600, "eiwit_g": 52.0, "vet_g": 20.0, "koolhydraten_g": 48.0, "vlees_type": "rosbief"},
    {"naam": "Zalm met pasta en cherrytomaat", "categorie": "diner", "kcal": 580, "eiwit_g": 40.0, "vet_g": 22.0, "koolhydraten_g": 52.0},
    {"naam": "Caprese-omelet met mozzarella en tomaat", "categorie": "diner", "kcal": 480, "eiwit_g": 28.0, "vet_g": 30.0, "koolhydraten_g": 22.0},
    {"naam": "Shakshuka met verse eieren", "categorie": "diner", "kcal": 420, "eiwit_g": 22.0, "vet_g": 14.0, "koolhydraten_g": 46.0},
    {"naam": "Entrecote met gegrilde groente en aardappel", "categorie": "diner", "kcal": 660, "eiwit_g": 52.0, "vet_g": 32.0, "koolhydraten_g": 44.0, "vlees_type": "entrecote"},
    {"naam": "Kipfilet mediterraan met couscous en feta", "categorie": "diner", "kcal": 520, "eiwit_g": 50.0, "vet_g": 14.0, "koolhydraten_g": 44.0},
    {"naam": "Hamburgers met pesto en rucola", "categorie": "diner", "kcal": 600, "eiwit_g": 42.0, "vet_g": 32.0, "koolhydraten_g": 28.0, "vlees_type": "hamburgers"},
    {"naam": "Chili con carne met rijst en avocado", "categorie": "diner", "kcal": 660, "eiwit_g": 46.0, "vet_g": 22.0, "koolhydraten_g": 68.0, "vlees_type": "gehakt"},
    {"naam": "Kogelbiefstuk met zoete aardappel en paksoi", "categorie": "diner", "kcal": 580, "eiwit_g": 48.0, "vet_g": 22.0, "koolhydraten_g": 44.0, "vlees_type": "kogelbiefstuk"},
    {"naam": "Kipfilet tikka masala met rijst", "categorie": "diner", "kcal": 520, "eiwit_g": 50.0, "vet_g": 12.0, "koolhydraten_g": 48.0},
    {"naam": "Gehaktballetjes in tomatensaus met pasta", "categorie": "diner", "kcal": 660, "eiwit_g": 44.0, "vet_g": 24.0, "koolhydraten_g": 62.0, "vlees_type": "gehakt"},
    {"naam": "Zalm met pasta en basilicum", "categorie": "diner", "kcal": 580, "eiwit_g": 40.0, "vet_g": 22.0, "koolhydraten_g": 52.0},
    {"naam": "Rode-linzendahl met basmatirijst", "categorie": "diner", "kcal": 520, "eiwit_g": 26.0, "vet_g": 10.0, "koolhydraten_g": 72.0},
    {"naam": "Ribeye met zoete aardappel en paksoi", "categorie": "diner", "kcal": 660, "eiwit_g": 50.0, "vet_g": 36.0, "koolhydraten_g": 44.0, "vlees_type": "ribeye"},
    {"naam": "Kipfilet met geroosterde groente en feta", "categorie": "diner", "kcal": 500, "eiwit_g": 48.0, "vet_g": 14.0, "koolhydraten_g": 42.0},
    {"naam": "Rundvleescurry met basmatirijst", "categorie": "diner", "kcal": 620, "eiwit_g": 44.0, "vet_g": 22.0, "koolhydraten_g": 62.0, "vlees_type": "gehakt"},
    {"naam": "Zalm honing-soja met jasmijnrijst", "categorie": "diner", "kcal": 560, "eiwit_g": 40.0, "vet_g": 18.0, "koolhydraten_g": 58.0},
    {"naam": "Omelet met paprika en lente-ui", "categorie": "diner", "kcal": 400, "eiwit_g": 24.0, "vet_g": 24.0, "koolhydraten_g": 16.0},
    {"naam": "Ossenhaas met aardappelgratin en boontjes", "categorie": "diner", "kcal": 720, "eiwit_g": 58.0, "vet_g": 32.0, "koolhydraten_g": 48.0, "vlees_type": "ossenhaas"},
    {"naam": "Picadillo met rijst en zwarte bonen", "categorie": "diner", "kcal": 620, "eiwit_g": 44.0, "vet_g": 20.0, "koolhydraten_g": 64.0, "vlees_type": "gehakt"},
    {"naam": "Hamburgers Aziatisch met zoete aardappel", "categorie": "diner", "kcal": 580, "eiwit_g": 40.0, "vet_g": 26.0, "koolhydraten_g": 50.0, "vlees_type": "hamburgers"},
    {"naam": "Tartaar met brood en salade", "categorie": "diner", "kcal": 520, "eiwit_g": 44.0, "vet_g": 18.0, "koolhydraten_g": 38.0, "vlees_type": "tartaar"},
    {"naam": "Magere lap gemarineerd met aardappel", "categorie": "diner", "kcal": 540, "eiwit_g": 48.0, "vet_g": 18.0, "koolhydraten_g": 44.0, "vlees_type": "magere_lap"},
    {"naam": "Resterende worstjes of hamburgers", "categorie": "diner", "kcal": 560, "eiwit_g": 36.0, "vet_g": 28.0, "koolhydraten_g": 40.0},
]

NUTRITION_CYCLE = [
    {"cyclus_week": 1, "vlees_type": "Bolognese & linzencurry", "hoeveelheid_g": 950},
    {"cyclus_week": 2, "vlees_type": "Riblap-stoof & biefstuk", "hoeveelheid_g": 1250},
    {"cyclus_week": 3, "vlees_type": "Rosbief weekend & entrecote", "hoeveelheid_g": 1200},
    {"cyclus_week": 4, "vlees_type": "Chili & kogelbiefstuk", "hoeveelheid_g": 1150},
    {"cyclus_week": 5, "vlees_type": "Gehaktballetjes Italiaans", "hoeveelheid_g": 950},
    {"cyclus_week": 6, "vlees_type": "Rundvleescurry & ossenhaas", "hoeveelheid_g": 1100},
    {"cyclus_week": 7, "vlees_type": "Picadillo & worstjes", "hoeveelheid_g": 850},
    {"cyclus_week": 8, "vlees_type": "Opmaakweek — tartaar & lap", "hoeveelheid_g": 800},
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
    {"product": "Kipfilet 3-ster Beter Leven 500g", "categorie": "vlees", "hoeveelheid": "1 pak", "winkel": "lidl", "prijs_indicatie": 5.50},
]

FREEZER_ITEMS_PER_WEEK = {
    1: [
        {"product": "Gehakt 450g (1.5 pakje, Joep)", "hoeveelheid": "450g", "ontdooi_dag": "donderdag", "gebruik_dag": "zondag"},
        {"product": "Ribeye 250g (Joep)", "hoeveelheid": "250g", "ontdooi_dag": "woensdag", "gebruik_dag": "vrijdag"},
        {"product": "Hamburgers 2 stuks (Joep)", "hoeveelheid": "200g", "ontdooi_dag": "zaterdag", "gebruik_dag": "zondag"},
    ],
    2: [
        {"product": "Riblap 800g (Joep)", "hoeveelheid": "800g", "ontdooi_dag": "donderdag", "gebruik_dag": "zondag"},
        {"product": "Worstjes 4 stuks (Joep)", "hoeveelheid": "200g", "ontdooi_dag": "woensdag", "gebruik_dag": "vrijdag"},
        {"product": "Biefstuk 250g (Joep)", "hoeveelheid": "250g", "ontdooi_dag": "zaterdag", "gebruik_dag": "zondag"},
    ],
    3: [
        {"product": "Rosbief 700g (Joep)", "hoeveelheid": "700g", "ontdooi_dag": "donderdag", "gebruik_dag": "zondag"},
        {"product": "Entrecote 250g (Joep)", "hoeveelheid": "250g", "ontdooi_dag": "woensdag", "gebruik_dag": "vrijdag"},
        {"product": "Hamburgers 2 stuks (Joep)", "hoeveelheid": "200g", "ontdooi_dag": "zaterdag", "gebruik_dag": "zondag"},
    ],
    4: [
        {"product": "Gehakt 450g (1.5 pakje, Joep)", "hoeveelheid": "450g", "ontdooi_dag": "donderdag", "gebruik_dag": "zondag"},
        {"product": "Worstjes 4 stuks (Joep)", "hoeveelheid": "200g", "ontdooi_dag": "woensdag", "gebruik_dag": "vrijdag"},
        {"product": "Kogelbiefstuk 500g (Joep)", "hoeveelheid": "500g", "ontdooi_dag": "zaterdag", "gebruik_dag": "zondag"},
    ],
    5: [
        {"product": "Gehakt 450g (1.5 pakje, Joep)", "hoeveelheid": "450g", "ontdooi_dag": "donderdag", "gebruik_dag": "zondag"},
        {"product": "Ribeye 250g (Joep)", "hoeveelheid": "250g", "ontdooi_dag": "woensdag", "gebruik_dag": "vrijdag"},
        {"product": "Hamburgers 2 stuks (Joep)", "hoeveelheid": "200g", "ontdooi_dag": "zaterdag", "gebruik_dag": "zondag"},
    ],
    6: [
        {"product": "Gehakt 450g (1.5 pakje, Joep)", "hoeveelheid": "450g", "ontdooi_dag": "donderdag", "gebruik_dag": "zondag"},
        {"product": "Entrecote 250g (Joep)", "hoeveelheid": "250g", "ontdooi_dag": "woensdag", "gebruik_dag": "vrijdag"},
        {"product": "Ossenhaas 400g (Joep)", "hoeveelheid": "400g", "ontdooi_dag": "zaterdag", "gebruik_dag": "zondag"},
    ],
    7: [
        {"product": "Gehakt 450g (1.5 pakje, Joep)", "hoeveelheid": "450g", "ontdooi_dag": "donderdag", "gebruik_dag": "zondag"},
        {"product": "Worstjes 4 stuks (Joep)", "hoeveelheid": "200g", "ontdooi_dag": "woensdag", "gebruik_dag": "vrijdag"},
        {"product": "Hamburgers 2 stuks (Joep)", "hoeveelheid": "200g", "ontdooi_dag": "zaterdag", "gebruik_dag": "zondag"},
    ],
    8: [
        {"product": "Tartaar 500g (Joep)", "hoeveelheid": "500g", "ontdooi_dag": "dinsdag", "gebruik_dag": "woensdag"},
        {"product": "Magere lap 300g (Joep)", "hoeveelheid": "300g", "ontdooi_dag": "donderdag", "gebruik_dag": "vrijdag"},
    ],
}

# Volledig weekplan per week/dag/maaltijdtype — namen moeten exact overeenkomen met RECIPES
_WEEK_MEALS = {
    1: {  # Bolognese & linzencurry
        "maandag":   {"ontbijt": "Griekse yoghurt met muesli en bessen", "lunch": "Bolognese (mee)", "snack": "Kwark met banaan en pindakaas", "diner": "Bolognese met volkorenpasta"},
        "dinsdag":   {"ontbijt": "Kwark met muesli en fruit", "lunch": "Tonijnsalade met brood", "snack": "Hardgekookte eieren met banaan", "diner": "Zalm met couscous en spinazie"},
        "woensdag":  {"ontbijt": "Griekse yoghurt met muesli en bessen", "lunch": "Couscous salade met feta en eieren", "snack": "Kwark met havermout en banaan", "diner": "Omelet met feta en spinazie"},
        "donderdag": {"ontbijt": "Kwark met muesli en fruit", "lunch": "Eieren met brood en kaas", "snack": "Kwark met appel en pindakaas", "diner": "Linzencurry met basmatirijst"},
        "vrijdag":   {"ontbijt": "Griekse yoghurt met muesli en bessen", "lunch": "Linzencurry met rijst (batch)", "snack": "Kwark met banaan en pindakaas", "diner": "Ribeye met rode aardappel en sperziebonen"},
        "zaterdag":  {"ontbijt": "Eieren met volkorenbrood en kaas", "lunch": "Linzencurry met rijst (batch)", "snack": "Appel met gemengde noten", "diner": "Kipfilet met couscous en paprika"},
        "zondag":    {"ontbijt": "Havermout-pannenkoeken", "lunch": "Eieren omelet met avocado en brood", "snack": "Kwark met bessen en noten", "diner": "Hamburgers met ei en groente"},
    },
    2: {  # Riblap-stoof
        "maandag":   {"ontbijt": "Kwark met havermout, banaan en pindakaas", "lunch": "Riblap-stoof (mee)", "snack": "Kwark met appel en pindakaas", "diner": "Riblap-stoof met aardappelpuree"},
        "dinsdag":   {"ontbijt": "Griekse yoghurt met muesli en frambozen", "lunch": "Wrap met eieren, avocado en groente", "snack": "Hardgekookte eieren met banaan", "diner": "Witvis met zilvervliesrijst en groente"},
        "woensdag":  {"ontbijt": "Kwark met havermout, banaan en pindakaas", "lunch": "Riblap-stoof (mee)", "snack": "Kwark met havermout en banaan", "diner": "Omelet met champignons en spinazie"},
        "donderdag": {"ontbijt": "Griekse yoghurt met muesli en frambozen", "lunch": "Bonen-wrap met feta en avocado", "snack": "Kwark met banaan en pindakaas", "diner": "Kikkererwten-stoof met couscous"},
        "vrijdag":   {"ontbijt": "Kwark met havermout, banaan en pindakaas", "lunch": "Kikkererwten-stoof met couscous (batch)", "snack": "Kwark met appel en pindakaas", "diner": "Worstjes met rode aardappel"},
        "zaterdag":  {"ontbijt": "Eieren met volkorenbrood en kaas", "lunch": "Kikkererwten-stoof met couscous (batch)", "snack": "Appel met gemengde noten", "diner": "Kipfilet teriyaki met rijst en paksoi"},
        "zondag":    {"ontbijt": "Havermout-pannenkoeken", "lunch": "Eieren omelet met avocado en brood", "snack": "Kwark met bessen en noten", "diner": "Biefstuk met champignonsaus en zoete aardappel"},
    },
    3: {  # Rosbief weekend & shakshuka
        "maandag":   {"ontbijt": "Griekse yoghurt met muesli en bessen", "lunch": "Rosbief koud met brood en mosterd", "snack": "Kwark met appel en pindakaas", "diner": "Rosbief warm met jus en rode aardappel"},
        "dinsdag":   {"ontbijt": "Kwark met muesli en fruit", "lunch": "Salade niçoise met tonijn", "snack": "Kwark met banaan en pindakaas", "diner": "Zalm met pasta en cherrytomaat"},
        "woensdag":  {"ontbijt": "Griekse yoghurt met muesli en bessen", "lunch": "Rosbief koud met brood en mosterd", "snack": "Kwark met havermout en banaan", "diner": "Caprese-omelet met mozzarella en tomaat"},
        "donderdag": {"ontbijt": "Kwark met muesli en fruit", "lunch": "Wrap met ei, feta en zongedroogde tomaat", "snack": "Kwark met appel en pindakaas", "diner": "Shakshuka met verse eieren"},
        "vrijdag":   {"ontbijt": "Griekse yoghurt met muesli en bessen", "lunch": "Shakshuka (batch)", "snack": "Kwark met banaan en pindakaas", "diner": "Entrecote met gegrilde groente en aardappel"},
        "zaterdag":  {"ontbijt": "Eieren met volkorenbrood en kaas", "lunch": "Shakshuka (batch)", "snack": "Appel met gemengde noten", "diner": "Kipfilet mediterraan met couscous en feta"},
        "zondag":    {"ontbijt": "Havermout-pannenkoeken", "lunch": "Caprese met mozzarella en brood", "snack": "Kwark met bessen en noten", "diner": "Hamburgers met pesto en rucola"},
    },
    4: {  # Chili & kogelbiefstuk
        "maandag":   {"ontbijt": "Kwark met havermout, banaan en pindakaas", "lunch": "Chili con carne (mee)", "snack": "Kwark met appel en pindakaas", "diner": "Chili con carne met rijst en avocado"},
        "dinsdag":   {"ontbijt": "Griekse yoghurt met muesli en frambozen", "lunch": "Wrap met eieren, avocado en groente", "snack": "Hardgekookte eieren met banaan", "diner": "Witvis met zilvervliesrijst en groente"},
        "woensdag":  {"ontbijt": "Kwark met havermout, banaan en pindakaas", "lunch": "Chili con carne (mee)", "snack": "Kwark met havermout en banaan", "diner": "Omelet met champignons en spinazie"},
        "donderdag": {"ontbijt": "Griekse yoghurt met muesli en frambozen", "lunch": "Bonen-wrap met feta en avocado", "snack": "Kwark met banaan en pindakaas", "diner": "Kikkererwten-stoof met couscous"},
        "vrijdag":   {"ontbijt": "Kwark met havermout, banaan en pindakaas", "lunch": "Kikkererwten-stoof met couscous (batch)", "snack": "Kwark met appel en pindakaas", "diner": "Worstjes met rode aardappel"},
        "zaterdag":  {"ontbijt": "Eieren met volkorenbrood en kaas", "lunch": "Kikkererwten-stoof met couscous (batch)", "snack": "Appel met gemengde noten", "diner": "Kipfilet tikka masala met rijst"},
        "zondag":    {"ontbijt": "Havermout-pannenkoeken", "lunch": "Eieren omelet met avocado en brood", "snack": "Kwark met bessen en noten", "diner": "Kogelbiefstuk met zoete aardappel en paksoi"},
    },
    5: {  # Gehaktballetjes Italiaans
        "maandag":   {"ontbijt": "Griekse yoghurt met muesli en bessen", "lunch": "Gehaktballetjes (mee)", "snack": "Kwark met appel en pindakaas", "diner": "Gehaktballetjes in tomatensaus met pasta"},
        "dinsdag":   {"ontbijt": "Kwark met muesli en fruit", "lunch": "Salade niçoise met tonijn", "snack": "Hardgekookte eieren met banaan", "diner": "Zalm met pasta en basilicum"},
        "woensdag":  {"ontbijt": "Griekse yoghurt met muesli en bessen", "lunch": "Gehaktballetjes (mee)", "snack": "Kwark met havermout en banaan", "diner": "Caprese-omelet met mozzarella en tomaat"},
        "donderdag": {"ontbijt": "Kwark met muesli en fruit", "lunch": "Eieren met brood en kaas", "snack": "Kwark met appel en pindakaas", "diner": "Rode-linzendahl met basmatirijst"},
        "vrijdag":   {"ontbijt": "Griekse yoghurt met muesli en bessen", "lunch": "Rode-linzendahl met rijst (batch)", "snack": "Kwark met banaan en pindakaas", "diner": "Ribeye met zoete aardappel en paksoi"},
        "zaterdag":  {"ontbijt": "Eieren met volkorenbrood en kaas", "lunch": "Rode-linzendahl met rijst (batch)", "snack": "Appel met gemengde noten", "diner": "Kipfilet met geroosterde groente en feta"},
        "zondag":    {"ontbijt": "Havermout-pannenkoeken", "lunch": "Eieren omelet met avocado en brood", "snack": "Kwark met bessen en noten", "diner": "Hamburgers met ei en groente"},
    },
    6: {  # Rundvleescurry & ossenhaas
        "maandag":   {"ontbijt": "Kwark met havermout, banaan en pindakaas", "lunch": "Rundvleescurry (mee)", "snack": "Kwark met appel en pindakaas", "diner": "Rundvleescurry met basmatirijst"},
        "dinsdag":   {"ontbijt": "Griekse yoghurt met muesli en frambozen", "lunch": "Sushi-salade met tonijn en avocado", "snack": "Hardgekookte eieren met banaan", "diner": "Zalm honing-soja met jasmijnrijst"},
        "woensdag":  {"ontbijt": "Kwark met havermout, banaan en pindakaas", "lunch": "Rundvleescurry (mee)", "snack": "Kwark met havermout en banaan", "diner": "Omelet met paprika en lente-ui"},
        "donderdag": {"ontbijt": "Griekse yoghurt met muesli en frambozen", "lunch": "Wrap met ei, avocado en sriracha", "snack": "Kwark met banaan en pindakaas", "diner": "Shakshuka met verse eieren"},
        "vrijdag":   {"ontbijt": "Kwark met havermout, banaan en pindakaas", "lunch": "Shakshuka (batch)", "snack": "Kwark met appel en pindakaas", "diner": "Entrecote met gegrilde groente en aardappel"},
        "zaterdag":  {"ontbijt": "Eieren met volkorenbrood en kaas", "lunch": "Shakshuka (batch)", "snack": "Appel met gemengde noten", "diner": "Kipfilet mediterraan met couscous en feta"},
        "zondag":    {"ontbijt": "Havermout-pannenkoeken", "lunch": "Caprese met mozzarella en brood", "snack": "Kwark met bessen en noten", "diner": "Ossenhaas met aardappelgratin en boontjes"},
    },
    7: {  # Picadillo & worstjes
        "maandag":   {"ontbijt": "Kwark met havermout, banaan en pindakaas", "lunch": "Picadillo (mee)", "snack": "Kwark met appel en pindakaas", "diner": "Picadillo met rijst en zwarte bonen"},
        "dinsdag":   {"ontbijt": "Griekse yoghurt met muesli en frambozen", "lunch": "Sushi-salade met tonijn en avocado", "snack": "Hardgekookte eieren met banaan", "diner": "Zalm honing-soja met jasmijnrijst"},
        "woensdag":  {"ontbijt": "Kwark met havermout, banaan en pindakaas", "lunch": "Picadillo (mee)", "snack": "Kwark met havermout en banaan", "diner": "Omelet met paprika en lente-ui"},
        "donderdag": {"ontbijt": "Griekse yoghurt met muesli en frambozen", "lunch": "Wrap met ei, avocado en sriracha", "snack": "Kwark met banaan en pindakaas", "diner": "Rode-linzendahl met basmatirijst"},
        "vrijdag":   {"ontbijt": "Kwark met havermout, banaan en pindakaas", "lunch": "Rode-linzendahl met rijst (batch)", "snack": "Kwark met appel en pindakaas", "diner": "Worstjes met rode aardappel"},
        "zaterdag":  {"ontbijt": "Eieren met volkorenbrood en kaas", "lunch": "Rode-linzendahl met rijst (batch)", "snack": "Appel met gemengde noten", "diner": "Kipfilet tikka masala met rijst"},
        "zondag":    {"ontbijt": "Havermout-pannenkoeken", "lunch": "Eieren omelet met avocado en brood", "snack": "Kwark met bessen en noten", "diner": "Hamburgers Aziatisch met zoete aardappel"},
    },
    8: {  # Opmaakweek
        "maandag":   {"ontbijt": "Kwark met havermout, banaan en pindakaas", "lunch": "Pasta-salade met feta en olijven", "snack": "Kwark met appel en pindakaas", "diner": "Omelet met feta en spinazie"},
        "dinsdag":   {"ontbijt": "Kwark met muesli en fruit", "lunch": "Tonijnsalade met brood", "snack": "Hardgekookte eieren met banaan", "diner": "Zalm met pasta en cherrytomaat"},
        "woensdag":  {"ontbijt": "Kwark met havermout, banaan en pindakaas", "lunch": "Tartaar met brood", "snack": "Kwark met havermout en banaan", "diner": "Tartaar met brood en salade"},
        "donderdag": {"ontbijt": "Kwark met muesli en fruit", "lunch": "Eieren met brood en kaas", "snack": "Kwark met banaan en pindakaas", "diner": "Linzencurry met basmatirijst"},
        "vrijdag":   {"ontbijt": "Kwark met havermout, banaan en pindakaas", "lunch": "Linzencurry met rijst (batch)", "snack": "Kwark met appel en pindakaas", "diner": "Magere lap gemarineerd met aardappel"},
        "zaterdag":  {"ontbijt": "Eieren met volkorenbrood en kaas", "lunch": "Linzencurry met rijst (batch)", "snack": "Appel met gemengde noten", "diner": "Kipfilet met couscous en paprika"},
        "zondag":    {"ontbijt": "Havermout-pannenkoeken", "lunch": "Eieren omelet met avocado en brood", "snack": "Kwark met bessen en noten", "diner": "Resterende worstjes of hamburgers"},
    },
}

_DAYS_ORDER = ["maandag", "dinsdag", "woensdag", "donderdag", "vrijdag", "zaterdag", "zondag"]
_MEAL_TYPES = ["ontbijt", "lunch", "snack", "diner"]


def seed():
    db = SessionLocal()
    try:
        _seed_recipes(db)
        _seed_meal_plans(db)
    finally:
        db.close()


def force_reseed():
    db = SessionLocal()
    try:
        print("Verwijderen oude data...")
        db.query(MealPlan).delete()
        db.query(Recipe).delete()
        db.query(NutritionCycle).delete()
        db.query(ShoppingList).delete()
        db.query(FreezerItem).delete()
        db.commit()
        print("Oude data verwijderd.")
        _seed_recipes(db)
        _seed_meal_plans(db)
    finally:
        db.close()


def _seed_recipes(db):
    if db.query(Recipe).count() > 0:
        print("Recepten al aanwezig — overgeslagen.")
        return

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
    print(f"Recepten geseed: {len(RECIPES)} recepten, {len(NUTRITION_CYCLE)} weken.")


def _seed_meal_plans(db):
    if db.query(MealPlan).count() > 0:
        print("Maaltijdplannen al aanwezig — overgeslagen.")
        return

    recipes = {r.naam: r for r in db.query(Recipe).all()}
    missing = []
    count = 0

    for week, days in _WEEK_MEALS.items():
        for dag in _DAYS_ORDER:
            meals = days.get(dag, {})
            for meal_type in _MEAL_TYPES:
                naam = meals.get(meal_type)
                if not naam:
                    continue
                if naam not in recipes:
                    missing.append(f"W{week} {dag} {meal_type}: '{naam}'")
                    continue
                db.add(MealPlan(
                    cyclus_week=week,
                    dag=dag,
                    maaltijd_type=meal_type,
                    recept_id=recipes[naam].id,
                ))
                count += 1

    db.commit()
    if missing:
        print(f"WAARSCHUWING: {len(missing)} ontbrekende recepten:")
        for m in missing:
            print(f"  {m}")
    print(f"Maaltijdplannen geseed: {count} entries voor 8 weken.")


if __name__ == "__main__":
    if "--reset" in sys.argv:
        force_reseed()
    else:
        seed()
