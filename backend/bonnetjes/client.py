import logging
import httpx
from backend.config import settings

logger = logging.getLogger(__name__)


async def get_all_balances() -> list[dict]:
    """Haal alle voorraadbalansen op van Bonnetjes."""
    if not settings.bonnetjes_url:
        return []
    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            resp = await client.get(f"{settings.bonnetjes_url}/api/stock/balances")
            resp.raise_for_status()
            return resp.json()
    except Exception as e:
        logger.warning("Bonnetjes get_all_balances failed: %s", e)
        return []


async def add_stock(product_id: int, quantity: float = 1.0) -> bool:
    """Voeg voorraad toe aan een product in Bonnetjes."""
    if not settings.bonnetjes_url:
        return False
    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            resp = await client.post(
                f"{settings.bonnetjes_url}/api/stock/in-by-id",
                json={"product_id": product_id, "quantity": quantity},
            )
            resp.raise_for_status()
            return True
    except Exception as e:
        logger.warning("Bonnetjes add_stock failed: %s", e)
        return False


async def lookup_prices(product_names: list[str]) -> dict[str, float]:
    """Batch price lookup via Bonnetjes app. Returns {product_name: latest_price}."""
    if not settings.bonnetjes_url or not product_names:
        return {}
    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            resp = await client.post(
                f"{settings.bonnetjes_url}/api/products/price-lookup",
                json=product_names,
            )
            resp.raise_for_status()
            return resp.json()
    except Exception as e:
        logger.warning("Bonnetjes price lookup failed: %s", e)
        return {}
