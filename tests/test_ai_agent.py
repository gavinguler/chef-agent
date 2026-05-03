import pytest
from unittest.mock import patch, AsyncMock, MagicMock
from backend.ai.ollama_client import estimate_macros
from backend.ai.claude_client import integrate_recipe_in_schema

@pytest.mark.asyncio
async def test_estimate_macros_returns_dict():
    mock_response = '{"kcal": 650, "eiwit_g": 48.0, "vet_g": 22.0, "koolhydraten_g": 55.0}'
    with patch("backend.ai.ollama_client.httpx.AsyncClient") as mock_client:
        mock_instance = AsyncMock()
        mock_client.return_value.__aenter__.return_value = mock_instance
        # httpx response methods (raise_for_status, json) are synchronous
        http_response = MagicMock()
        http_response.json.return_value = {"response": mock_response}
        mock_instance.post.return_value = http_response
        result = await estimate_macros("Bolognese", ["450g gehakt", "pasta 200g", "tomatensaus"])
    assert result["kcal"] == 650
    assert result["eiwit_g"] == 48.0
    assert result["vet_g"] == 22.0
    assert result["koolhydraten_g"] == 55.0


@pytest.mark.asyncio
async def test_integrate_recipe_calls_claude():
    with patch("backend.ai.claude_client._client") as mock_client:
        mock_client.messages.create = AsyncMock(return_value=MagicMock(
            content=[MagicMock(text='{"status": "ok", "aanpassingen": []}')]
        ))
        result = await integrate_recipe_in_schema(
            recept={"naam": "Nieuw recept", "categorie": "diner", "kcal": 600, "eiwit_g": 45.0},
            huidig_schema=[]
        )
    assert result["status"] == "ok"
    assert "aanpassingen" in result
