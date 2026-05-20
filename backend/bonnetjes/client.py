import logging
import httpx
from backend.config import settings

logger = logging.getLogger(__name__)


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
