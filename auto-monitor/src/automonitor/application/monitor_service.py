from __future__ import annotations

import json
from datetime import datetime, timezone
from typing import Optional

from ..domain.models import ProductState, extract_products
from ..domain.diff import diff_products, compute_state_hash
from ..infrastructure.http_fetcher import fetch_json
from ..infrastructure.sqlite_repo import (
    init_db,
    get_last_state_json,
    upsert_hash,
    insert_event,
)

def run_monitor(source_url: str, db_path: str) -> dict:
    init_db(db_path)

    payload = fetch_json(source_url)
    current_state = extract_products(payload)

    prev_state_json: Optional[str] = get_last_state_json(db_path)
    previous_state: ProductState = json.loads(prev_state_json) if prev_state_json else {}

    added, removed, updated = diff_products(previous_state, current_state)
    changed = bool(added or removed or updated)

    result = {
        "changed": changed,
        "added": added,
        "removed": removed,
        "updated": updated,
    }

    if changed:
        now_iso = datetime.now(timezone.utc).isoformat()
        current_hash = compute_state_hash(current_state)
        state_json = json.dumps(current_state, sort_keys=True, separators=(",", ":"))

        upsert_hash(db_path, current_hash, now_iso)
        insert_event(db_path, current_hash, state_json, now_iso)

    return result
