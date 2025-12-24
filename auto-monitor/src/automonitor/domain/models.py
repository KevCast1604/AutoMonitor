from __future__ import annotations

from typing import Any, Dict, TypedDict

class ProductSummary(TypedDict):
    id: str
    title: str
    price: float

ProductState = Dict[str, Dict[str, str | float]]

def extract_products(payload: Dict[str, Any]) -> ProductState:
    products = payload.get("products", [])
    result: ProductState = {}

    for p in products:
        pid = str(p["id"])
        result[pid] = {
            "title": str(p["title"]),
            "price": float(p["price"]),
        }

    return result
