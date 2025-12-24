import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { apiGet } from "../api/client";
import type { EventSummary, Page } from "../api/types";
import { normalizePage } from "../api/normalize";

export default function Events() {
  const [page, setPage] = useState<Page<EventSummary> | null>(null);
  const [loading, setLoading] = useState(true);

  const [limit] = useState(50);
  const [offset, setOffset] = useState(0);

  useEffect(() => {
    setLoading(true);
    apiGet<unknown>(`/events?limit=${limit}&offset=${offset}`)
      .then((raw) => setPage(normalizePage(raw)))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [limit, offset]);

  if (loading) return (
    <div className="flex items-center justify-center min-h-[400px]">
      <p className="text-sm text-neutral-500 animate-pulse font-medium">Loading history...</p>
    </div>
  );

  if (!page) return <p className="text-center py-10">Error loading events.</p>;

  const start = page.total === 0 ? 0 : offset + 1;
  const end = Math.min(offset + page.items.length, page.total);

  const canPrev = offset > 0;
  const canNext = offset + limit < page.total;

  return (
    <div className="space-y-6">
      {/* Header Seccional */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">Event History</h1>
          <p className="text-sm text-neutral-500 mt-1">
            Viewing <span className="font-medium text-neutral-900 dark:text-neutral-200">{start}—{end}</span> of {page.total} detected changes
          </p>
        </div>

        {/* Paginación Superior */}
        <div className="flex items-center gap-2">
          <PaginationButton 
            onClick={() => setOffset((o) => Math.max(0, o - limit))} 
            disabled={!canPrev}
          >
            <ChevronLeftIcon /> Previous
          </PaginationButton>
          <PaginationButton 
            onClick={() => setOffset((o) => o + limit)} 
            disabled={!canNext}
          >
            Next <ChevronRightIcon />
          </PaginationButton>
        </div>
      </div>

      {/* Contenedor de Tabla */}
      <div className="bg-white dark:bg-[#0a0a0a] rounded-xl border border-neutral-200 dark:border-neutral-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left border-collapse">
            <thead>
              <tr className="bg-neutral-50/50 dark:bg-neutral-900/20 text-neutral-500 border-b border-neutral-200 dark:border-neutral-800">
                <th className="px-6 py-3 font-medium uppercase text-[11px] tracking-wider">ID</th>
                <th className="px-6 py-3 font-medium uppercase text-[11px] tracking-wider text-right">Date Detected</th>
                <th className="px-6 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
              {page.items.map((e) => (
                <tr key={e.id} className="hover:bg-neutral-50/50 dark:hover:bg-neutral-900/40 transition-colors group">
                  <td className="px-6 py-4 font-mono text-xs text-neutral-400">#{e.id}</td>
                  <td className="px-6 py-4 text-right text-neutral-500 tabular-nums">
                    {e.created_at || "N/A"}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <Link 
                      className="inline-flex items-center gap-1 text-blue-600 dark:text-blue-400 font-medium hover:underline opacity-0 group-hover:opacity-100 transition-opacity" 
                      to={`/events/${e.id}`}
                    >
                      View Full Details
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function PaginationButton({ children, onClick, disabled }: { children: React.ReactNode, onClick: () => void, disabled: boolean }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-white dark:bg-[#0a0a0a] border border-neutral-200 dark:border-neutral-800 rounded-lg shadow-sm hover:bg-neutral-50 dark:hover:bg-neutral-900 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
    >
      {children}
    </button>
  );
}

const ChevronLeftIcon = () => (
  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path d="M15 19l-7-7 7-7" /></svg>
);

const ChevronRightIcon = () => (
  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path d="M9 5l7 7-7 7" /></svg>
);