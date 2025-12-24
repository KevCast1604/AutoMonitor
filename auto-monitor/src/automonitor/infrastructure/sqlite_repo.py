from __future__ import annotations
import sqlite3
from typing import Optional, TypedDict, List, Dict, Any, Tuple
import json

class EventRow(TypedDict):
    id: int
    hash: str
    state_json: str
    created_at: str

def init_db(db_path: str) -> None:
    with sqlite3.connect(db_path) as conn:
        conn.execute("""CREATE TABLE IF NOT EXISTS monitor_state (
                     id INTEGER PRIMARY KEY CHECK (id = 1),
                     last_hash TEXT NOT NULL,
                     updated_at TEXT NOT NULL
                     )""");

        conn.execute("""CREATE TABLE IF NOT EXISTS events(
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    hash TEXT NOT NULL,
                    state_json TEXT NOT NULL,
                    created_at TEXT NOT NULL
                    )""");


def list_events(db_path: str, limit: int = 50, offset: int = 0) -> List[EventRow]:
    with sqlite3.connect(db_path) as conn:
        conn.row_factory = sqlite3.Row
        rows = conn.execute("""SELECT id, hash, state_json, created_at FROM events
                            ORDER BY id DESC
                            LIMIT ? OFFSET ?
                            """, (limit, offset)).fetchall();
        return [dict(r) for r in rows] #type: ignore[return-value]
    
def get_event_by_id(db_path: str, event_id: int) -> Optional[EventRow]:
    with sqlite3.connect(db_path) as conn:
        conn.row_factory = sqlite3.Row
        row = conn.execute("""SELECT id, hash, state_json, created_at 
                           FROM events
                           WHERE id = ?
                           """, (event_id,)).fetchone();
        return dict(row) if row else None  # type: ignore[return-value]
    
def get_previous_event(db_path: str, event_id: int) -> Optional[EventRow]:
    with sqlite3.connect(db_path) as conn:
        conn.row_factory = sqlite3.Row
        row = conn.execute("""
                            SELECT id, hash, state_json, created_at
                            FROM events 
                            WHERE id < ?
                            ORDER BY id DESC
                            LIMIT 1
                            """, (event_id,)).fetchone();
        return dict(row) if row else None  # type: ignore[return-value]
                           

def get_latest_event(db_path: str) -> Optional[EventRow]:
    with sqlite3.connect(db_path) as conn:
        conn.row_factory = sqlite3.Row
        row = conn.execute("""
                            SELECT id, hash, state_json, created_at
                            FROM events 
                            ORDER BY id DESC
                            LIMIT 1
                            """).fetchone();
        return dict(row) if row else None  # type: ignore[return-value]

def insert_event(db_path: str, state_hash: str, state_json: str, created_at_iso: str) -> None:
    with sqlite3.connect(db_path) as conn:
        conn.execute("INSERT INTO events (hash, state_json, created_at) VALUES (?, ?, ?)",
                     (state_hash, state_json, created_at_iso)
                    );

        
def get_last_hash(db_path: str) -> Optional[str]:
    with sqlite3.connect(db_path) as conn:
        row = conn.execute("SELECT last_hash FROM monitor_state WHERE id = 1").fetchone();
        return row[0] if row else None;

def upsert_hash(db_path: str, new_hash: str, updated_at_iso: str) -> None:
    with sqlite3.connect(db_path) as conn:
        conn.execute("""INSERT INTO monitor_state (id, last_hash, updated_at)
                     VALUES (1, ?, ?)
                     ON CONFLICT(id) DO UPDATE SET
                        last_hash=excluded.last_hash,
                        updated_at=excluded.updated_at""",
                     (new_hash, updated_at_iso)
                    );

def get_last_state_json(db_path: str) -> Optional[str]:
    with sqlite3.connect(db_path) as conn:
        row = conn.execute("""SELECT state_json FROM events
                            ORDER BY id DESC LIMIT 1""").fetchone();
        return row[0] if row else None;


def count_events(db_path: str) -> int:
    with sqlite3.connect(db_path) as conn:
        row = conn.execute("SELECT COUNT(*) FROM events").fetchone();
        return row[0] if row else 0;


def _as_dict(value: Any) -> Dict[str, Any]:
    return value if isinstance(value, dict) else {}

def _loads_state(s: Any) -> Dict[str, Any]:
    if not isinstance(s, str) or not s:
        return {}
    try: 
        return _as_dict(json.loads(s))
    except Exception:
        return {}
    
def _diff_counts(prev: Dict[str, Any], curr: Dict[str, Any]) -> Tuple[int, int, int]:
    prev_keys = set(prev.keys())
    curr_keys = set(curr.keys())
    
    added_keys = curr_keys - prev_keys
    removed_keys = prev_keys - curr_keys
    common_keys = prev_keys & curr_keys
    
    updated = 0
    for k in common_keys:
        if prev.get(k) != curr.get(k):
            updated += 1
    return (len(added_keys), len(removed_keys), updated)
        
   
def get_overview_metrics(db_path: str) -> dict:
    con = sqlite3.connect(db_path)
    con.row_factory = sqlite3.Row
    cur = con.cursor()

    rows = cur.execute("""
        SELECT id, state_json
        FROM events
        ORDER BY id ASC
    """).fetchall()

    con.close()

    total_events = len(rows)
    sum_added = 0
    sum_removed = 0
    sum_updated = 0

    prev_state: Dict[str, Any] | None = None

    for r in rows:
        curr_state = _loads_state(r["state_json"])

        if prev_state is None:
            # primer evento: no tiene "prev", puedes contarlo como added = len(curr)
            # o 0. Yo recomiendo contarlo como "baseline" y dejarlo en 0.
            prev_state = curr_state
            continue

        a, rm, up = _diff_counts(prev_state, curr_state)
        sum_added += a
        sum_removed += rm
        sum_updated += up
        prev_state = curr_state

    return {
        "total_events": total_events,
        "sum_added": sum_added,
        "sum_removed": sum_removed,
        "sum_updated": sum_updated,
    }