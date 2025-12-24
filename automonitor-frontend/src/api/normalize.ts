import type { EventSummary, Page } from "./types";

type UnknownRecord = Record<string, unknown>;

function toNumber(value: unknown): number {
  if (Array.isArray(value)) return value.length;
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string") {
    const n = Number(value);
    return Number.isFinite(n) ? n : 0;
  }
  return 0;
}

function toString(value: unknown): string {
  if (typeof value === "string") return value;
  if (value == null) return "";
  return String(value);
}

function pick(obj: UnknownRecord, keys: string[]): unknown {
  for (const k of keys) {
    if (k in obj) return obj[k];
  }
  return undefined;
}

// Permite leer rutas tipo "summary.added"
function pickPath(obj: UnknownRecord, paths: string[]): unknown {
  for (const p of paths) {
    const parts = p.split(".");
    let cur: unknown = obj;
    let ok = true;

    for (const part of parts) {
      if (typeof cur !== "object" || cur === null) {
        ok = false;
        break;
      }
      const rec = cur as UnknownRecord;
      if (!(part in rec)) {
        ok = false;
        break;
      }
      cur = rec[part];
    }

    if (ok) return cur;
  }
  return undefined;
}

export function normalizeEvent(raw: UnknownRecord): EventSummary {
  const id = toNumber(pick(raw, ["id", "event_id"]));

  const source = toString(
    pick(raw, ["source", "source_name", "sourceId", "url", "source_url", "endpoint"])
  );

  const created_at = toString(
    pick(raw, ["created_at", "createdAt", "timestamp", "created", "at"])
  );

  const added = toNumber(
    pickPath(raw, ["added", "summary.added", "counts.added", "diff.added", "diff.added_count", "stats.added"])
  );
  const removed = toNumber(
    pickPath(raw, ["removed", "summary.removed", "counts.removed", "diff.removed", "diff.removed_count", "stats.removed"])
  );
  const updated = toNumber(
    pickPath(raw, ["updated", "summary.updated", "counts.updated", "diff.updated", "diff.updated_count", "stats.updated"])
  );

  return { id, source, created_at, added, removed, updated };
}

export function normalizePage(raw: unknown): Page<EventSummary> {
  const rec = (typeof raw === "object" && raw !== null ? (raw as UnknownRecord) : {}) as UnknownRecord;

  const itemsRaw = rec.items;
  const itemsArray: UnknownRecord[] = Array.isArray(itemsRaw)
    ? (itemsRaw.filter((x) => typeof x === "object" && x !== null) as UnknownRecord[])
    : [];

  const items = itemsArray.map(normalizeEvent);

  const limit = typeof rec.limit === "number" ? rec.limit : items.length;
  const offset = typeof rec.offset === "number" ? rec.offset : 0;
  const total =
    typeof rec.total === "number"
      ? rec.total
      : typeof rec.count === "number"
        ? rec.count
        : items.length;

  return { items, limit, offset, total };
}
