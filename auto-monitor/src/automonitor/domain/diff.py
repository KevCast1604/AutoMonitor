from __future__ import annotations

import hashlib
import json
from typing import List, Tuple

from .models import ProductState, ProductSummary

def diff_products(
    old: ProductState,
    new: ProductState,
) -> Tuple[List[ProductSummary], List[ProductSummary], List[ProductSummary]]:
    old_ids = set(old.keys())
    new_ids = set(new.keys())

    added_ids = sorted(new_ids - old_ids)
    removed_ids = sorted(old_ids - new_ids)

    added: List[ProductSummary] = [
        {"id": pid, "title": str(new[pid]["title"]), "price": float(new[pid]["price"])}
        for pid in added_ids
    ]

    removed: List[ProductSummary] = [
        {"id": pid, "title": str(old[pid]["title"]), "price": float(old[pid]["price"])}
        for pid in removed_ids
    ]

    updated: List[ProductSummary] = []
    for pid in sorted(old_ids & new_ids):
        if old[pid] != new[pid]:
            updated.append(
                {"id": pid, "title": str(new[pid]["title"]), "price": float(new[pid]["price"])}
            )

    return added, removed, updated

def compute_state_hash(state: ProductState) -> str:
    normalized = json.dumps(state, sort_keys=True, separators=(",", ":")).encode("utf-8")
    return hashlib.sha256(normalized).hexdigest()
