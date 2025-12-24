from __future__ import annotations;
import json;
from typing import List, TypedDict;

from ..domain.models import ProductState, ProductSummary
from ..domain.diff import diff_products
from ..infrastructure.sqlite_repo import list_events, get_event_by_id, get_previous_event, get_latest_event, count_events, get_overview_metrics, EventRow

class EventSummary(TypedDict):
    id: int
    hash: str
    created_at: str

class EventDetail(TypedDict):
    id: int
    hash: str
    created_at: str
    added: List[ProductSummary]
    removed: List[ProductSummary]
    updated: List[ProductSummary]
    state: ProductState

class PagedEvents(TypedDict):
    items: List[EventSummary]
    total_count: int
    limit: int
    offset: int

def list_event_summaries(db_path: str, limit: int = 50, offset: int = 0) -> List[EventSummary]:
    rows = list_events(db_path, limit = limit, offset = offset);
    return [{
        "id": r["id"],
        "hash": r["hash"],
        "created_at": r["created_at"]
    } for r in rows ];

# CANTIDAD TOTAL DE EVENTS, SIN IMPORTAR LIMIT O OFFSET
def list_event_summaries_paged(db_path: str, limit: int = 50, offset: int = 0) -> PagedEvents:
    rows = list_events(db_path, limit = limit, offset = offset);
    items: List[EventSummary] = [{
        "id": r["id"],
        "hash": r["hash"],
        "created_at": r["created_at"]
    } for r in rows ];
    total = count_events(db_path);
    return {
        "items": items,
        "total_count": total,
        "limit": limit,
        "offset": offset
    }

def get_event_detail(db_path: str, event_id: int) -> EventDetail | None:
    row = get_event_by_id(db_path, event_id);
    if not row:
        return None;

    # Estado actual
    current_state: ProductState = json.loads(row["state_json"]);

    # Estado previo para diff completo con limit = 8 (Telegram)
    prev_row = get_previous_event(db_path, event_id);
    previous_state: ProductState = json.loads(prev_row["state_json"]) if prev_row else {};

    added, removed, updated = diff_products(previous_state, current_state);

    return {
        "id": row["id"],
        "hash": row["hash"],
        "created_at": row["created_at"],
        "added": added,
        "removed": removed,
        "updated": updated,
        "state": current_state
    }

def get_latest_event_detail(db_path: str) -> EventDetail | None:
    row = get_latest_event(db_path);
    if not row:
        return None;
    return get_event_detail(db_path, row["id"]);

def get_metrics(db_path: str) -> dict:
    return get_overview_metrics(db_path);
