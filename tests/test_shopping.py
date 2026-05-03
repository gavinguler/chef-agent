def test_get_shopping_list_empty(client):
    response = client.get("/api/shopping/week/1")
    assert response.status_code == 200
    data = response.json()
    assert data["week"] == 1
    assert data["items"] == []

def test_add_shopping_item(client):
    response = client.post("/api/shopping/week/1/items", json={
        "product": "Kwark 500g",
        "categorie": "zuivel",
        "hoeveelheid": "7 pakken",
        "winkel": "lidl",
    })
    assert response.status_code == 201
    data = response.json()
    assert data["product"] == "Kwark 500g"
    assert "id" in data

def test_delete_shopping_item(client):
    create = client.post("/api/shopping/week/2/items", json={
        "product": "Te verwijderen item",
        "categorie": "overig",
        "hoeveelheid": "1x",
        "winkel": "lidl",
    })
    item_id = create.json()["id"]
    response = client.delete(f"/api/shopping/week/2/items/{item_id}")
    assert response.status_code == 204
