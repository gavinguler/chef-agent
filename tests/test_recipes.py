def test_list_recipes_empty(client):
    response = client.get("/api/recipes")
    assert response.status_code == 200
    assert response.json() == []

def test_create_recipe(client):
    payload = {
        "naam": "Bolognese",
        "categorie": "diner",
        "kcal": 650,
        "eiwit_g": 48.0,
        "vet_g": 22.0,
        "koolhydraten_g": 55.0,
        "vlees_type": "gehakt",
    }
    response = client.post("/api/recipes", json=payload)
    assert response.status_code == 201
    data = response.json()
    assert data["naam"] == "Bolognese"
    assert "id" in data

def test_get_recipe(client):
    create = client.post("/api/recipes", json={
        "naam": "Omelet", "categorie": "ontbijt",
        "kcal": 300, "eiwit_g": 22.0, "vet_g": 18.0, "koolhydraten_g": 5.0,
    })
    recipe_id = create.json()["id"]
    response = client.get(f"/api/recipes/{recipe_id}")
    assert response.status_code == 200
    assert response.json()["naam"] == "Omelet"

def test_delete_recipe(client):
    create = client.post("/api/recipes", json={
        "naam": "Te verwijderen", "categorie": "snack",
        "kcal": 100, "eiwit_g": 5.0, "vet_g": 3.0, "koolhydraten_g": 10.0,
    })
    recipe_id = create.json()["id"]
    response = client.delete(f"/api/recipes/{recipe_id}")
    assert response.status_code == 204
    response = client.get(f"/api/recipes/{recipe_id}")
    assert response.status_code == 404

def test_search_recipes(client):
    client.post("/api/recipes", json={
        "naam": "Tonijn wrap", "categorie": "lunch",
        "kcal": 420, "eiwit_g": 32.0, "vet_g": 12.0, "koolhydraten_g": 38.0,
    })
    response = client.get("/api/recipes?search=tonijn")
    assert response.status_code == 200
    assert len(response.json()) >= 1
