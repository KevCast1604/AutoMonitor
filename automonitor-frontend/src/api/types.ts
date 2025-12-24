// src/api/types.ts

export type Page<T> = {
  items: T[];
  limit: number;
  offset: number;
  total: number;
};

// Ajusta estos nombres si tu backend devuelve otros campos.
// Lo importante es que estén tipados.
export type EventSummary = {
  id: number;
  created_at: string;
  source: string;
  added: number;
  removed: number;
  updated: number;
};

export type EventDetail = EventSummary & {
  url?: string;
  diff?: {
    added?: unknown[];
    removed?: unknown[];
    updated?: unknown[];
  };
};

export type OverviewMetrics = {
  total_events: number;
  sum_added: number;
  sum_removed: number;
  sum_updated: number;
}