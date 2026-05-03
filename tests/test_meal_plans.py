def test_get_week_plan_empty(client):
    response = client.get("/api/meal-plans/week/1")
    assert response.status_code == 200
    data = response.json()
    assert data["week"] == 1
    assert len(data["dagen"]) == 7

def test_set_meal_in_week(client):
    recipe = client.post("/api/recipes", json={
        "naam": "Bolognese test", "categorie": "diner",
        "kcal": 650, "eiwit_g": 48.0, "vet_g": 22.0, "koolhydraten_g": 55.0,
    }).json()
    response = client.put("/api/meal-plans/week/1/dag/maandag/maaltijd/diner", json={
        "recept_id": recipe["id"]
    })
    assert response.status_code == 200

def test_week_plan_returns_7_days(client):
    response = client.get("/api/meal-plans/week/1")
    assert response.status_code == 200
    data = response.json()
    assert "dagen" in data
    assert len(data["dagen"]) == 7
