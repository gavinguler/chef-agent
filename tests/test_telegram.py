from backend.telegram.bot import format_weekly_message

def test_format_weekly_message_contains_sections():
    week_data = {
        "week": 1,
        "vlees_thema": "Gehakt week",
        "dagen": [
            {
                "dag": "maandag",
                "maaltijden": [
                    {"maaltijd_type": "ontbijt", "naam": "Havermout", "eiwit_g": 32.0},
                    {"maaltijd_type": "lunch", "naam": "Kwark wrap", "eiwit_g": 28.0},
                    {"maaltijd_type": "diner", "naam": "Bolognese", "eiwit_g": 48.0},
                ],
                "totaal_eiwit_g": 108.0,
                "totaal_kcal": 1620,
                "is_batch": False,
            }
        ],
        "shopping": [
            {"product": "Kwark 500g", "categorie": "zuivel", "hoeveelheid": "7 pakken"},
        ],
        "freezer": [
            {"product": "Gehakt 300g", "ontdooi_dag": "woensdag", "gebruik_dag": "donderdag"},
        ],
    }
    msg = format_weekly_message(week_data)
    assert "Chef Agent" in msg
    assert "MAALTIJDPLAN" in msg
    assert "BOODSCHAPPEN" in msg
    assert "VRIEZER" in msg
    assert "maandag" in msg.lower() or "Ma" in msg

def test_format_message_kantoor_dagen():
    week_data = {
        "week": 2,
        "vlees_thema": "Riblap week",
        "dagen": [
            {"dag": "maandag", "maaltijden": [
                {"maaltijd_type": "ontbijt", "naam": "Kwark", "eiwit_g": 28.0},
                {"maaltijd_type": "lunch", "naam": "Wrap", "eiwit_g": 20.0},
                {"maaltijd_type": "diner", "naam": "Pasta", "eiwit_g": 40.0},
            ], "totaal_eiwit_g": 88.0, "totaal_kcal": 1400, "is_batch": False},
        ],
        "shopping": [],
        "freezer": [],
    }
    msg = format_weekly_message(week_data)
    assert "kantoor" in msg.lower()
