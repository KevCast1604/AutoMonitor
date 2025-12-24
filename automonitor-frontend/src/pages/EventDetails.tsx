import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { apiGet } from "../api/client";
import { normalizeEvent } from "../api/normalize";
import type { EventSummary } from "../api/types";

type UnknownRecord = Record<string, unknown>;

export default function EventDetails() {
  const { id } = useParams<{ id: string }>();
  const [raw, setRaw] = useState<UnknownRecord | null>(null);
  const [event, setEvent] = useState<EventSummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;

    const eventId = Number(id);
    if (!Number.isFinite(eventId)) {
      setLoading(false);
      return;
    }

    apiGet<unknown>(`/events/${eventId}`)
      .then((data) => {
        const rec = (typeof data === "object" && data !== null) ? (data as UnknownRecord) : null;
        setRaw(rec);
        if (rec) setEvent(normalizeEvent(rec));
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return (
    <div className="flex items-center justify-center min-h-[400px]">
      <p className="text-sm text-neutral-500 animate-pulse font-medium">Loading event details...</p>
    </div>
  );

  if (!raw || !event) return <p className="text-center py-10">Event not found.</p>;

  return (
    <div className="space-y-6">
      {/* Top Bar / Navigation */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link 
            to="/events" 
            className="p-2 hover:bg-neutral-100 dark:hover:bg-neutral-900 rounded-full transition-colors"
            title="Go back"
          >
            <BackIcon />
          </Link>
          <div>
            <h1 className="text-xl font-bold tracking-tight">Event Details</h1>
            <p className="text-xs font-mono text-neutral-500">ID: #{event.id} • {event.created_at || "Unknown date"}</p>
          </div>
        </div>

        <div className="hidden sm:block text-[11px] font-bold uppercase tracking-[0.2em] text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-500/10 px-3 py-1 rounded-full border border-blue-100 dark:border-blue-500/20">
          Live Analysis
        </div>
      </div>

      <hr className="border-neutral-200 dark:border-neutral-800" />

      {/* KPI GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <DetailStat label="Lines Added" value={event.added} color="green" />
        <DetailStat label="Lines Removed" value={event.removed} color="red" />
        <DetailStat label="Lines Updated" value={event.updated} color="amber" />
      </div>

      {/* JSON VIEWER */}
      <div className="bg-[#0d1117] dark:bg-[#010409] rounded-xl border border-neutral-800 shadow-xl overflow-hidden">
        <div className="px-4 py-2 border-b border-neutral-800 bg-neutral-900/50 flex items-center justify-between">
          <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest">Raw Payload (JSON)</span>
          <div className="flex gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-neutral-800" />
            <div className="w-2.5 h-2.5 rounded-full bg-neutral-800" />
          </div>
        </div>
        <div className="p-6">
          <pre className="text-[13px] leading-relaxed text-blue-300/90 font-mono overflow-auto whitespace-pre-wrap max-h-[500px] scrollbar-thin scrollbar-thumb-neutral-800">
            {JSON.stringify(raw, null, 2)}
          </pre>
        </div>
      </div>
    </div>
  );
}

function DetailStat({ label, value, color }: { label: string; value: number; color: 'green' | 'red' | 'amber' }) {
  const colorMap = {
    green: "text-green-600 dark:text-green-500",
    red: "text-red-600 dark:text-red-500",
    amber: "text-amber-600 dark:text-amber-500",
  };

  return (
    <div className="bg-white dark:bg-[#0a0a0a] border border-neutral-200 dark:border-neutral-800 rounded-xl p-5 shadow-sm">
      <p className="text-[10px] font-bold uppercase tracking-widest text-neutral-400 mb-1">{label}</p>
      <p className={`text-3xl font-semibold tabular-nums ${colorMap[color]}`}>{value}</p>
    </div>
  );
}

const BackIcon = () => (
  <svg className="w-5 h-5 text-neutral-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
  </svg>
);