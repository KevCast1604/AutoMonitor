import { useEffect, useState } from "react";
import { apiGet } from "../api/client";
import type { Page, EventSummary, OverviewMetrics } from "../api/types";
import { normalizePage } from "../api/normalize";
import { Link } from "react-router-dom";

export default function Dashboard() {
  const [page, setPage] = useState<Page<EventSummary> | null>(null);
  const [metrics, setMetrics] = useState<OverviewMetrics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const metricsPromise = apiGet<OverviewMetrics>("/metrics/overview")
      .then(setMetrics)
      .catch(console.error);

    const latestPromise = apiGet<unknown>("/events?limit=10&offset=0")
      .then((raw) => setPage(normalizePage(raw)))
      .catch(console.error);

    Promise.all([metricsPromise, latestPromise]).finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center min-h-[400px]">
      <p className="text-sm text-neutral-500 animate-pulse font-medium">Loading dashboard...</p>
    </div>
  );
  
  if (!metrics || !page) return <p>Could not load dashboard data.</p>;

  return (
    <div className="space-y-8">
      {/* Header del Dashboard */}
      <div>
        <h1 className="text-xl font-semibold tracking-tight">Overview</h1>
        <p className="text-sm text-neutral-500 mt-1">Real-time summary of your monitored sources.</p>
      </div>

      {/* CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Events" value={metrics.total_events} color="blue" />
        <StatCard title="Total Added" value={metrics.sum_added} color="green" />
        <StatCard title="Total Removed" value={metrics.sum_removed} color="red" />
        <StatCard title="Total Updated" value={metrics.sum_updated} color="amber" />
      </div>

      {/* TABLA */}
      <div className="bg-white dark:bg-[#0a0a0a] rounded-xl border border-neutral-200 dark:border-neutral-800 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-neutral-200 dark:border-neutral-800 flex items-center justify-between bg-neutral-50/50 dark:bg-neutral-900/20">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-neutral-500">Latest Events</h2>
          <Link 
            className="text-xs font-medium px-3 py-1.5 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-md hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors" 
            to="/events"
          >
            See All Events
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left border-collapse">
            <thead>
              <tr className="text-neutral-500 border-b border-neutral-100 dark:border-neutral-800">
                <th className="px-6 py-3 font-bold">ID</th>
                <th className="px-6 py-3 font-bold text-center">Date</th>
                <th className="px-6 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
              {page.items.map((e) => (
                <tr key={e.id} className="hover:bg-neutral-50/50 dark:hover:bg-neutral-900/40 transition-colors group">
                  <td className="px-6 py-4 font-mono text-xs text-neutral-500">#{e.id}</td>
                  <td className="px-6 py-4 text-right text-neutral-500 tabular-nums">
                    {e.created_at || "-"}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <Link 
                      className="text-blue-600 dark:text-blue-400 font-medium opacity-0 group-hover:opacity-100 transition-opacity" 
                      to={`/events/${e.id}`}
                    >
                      View details →
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {page.total > page.items.length && (
          <div className="px-6 py-3 bg-neutral-50/30 dark:bg-neutral-900/10 border-t border-neutral-200 dark:border-neutral-800">
            <p className="text-[11px] text-neutral-400 font-medium italic">
              Displaying the latest {page.items.length} of {page.total} total events.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({ title, value, color }: { title: string; value: number; color: 'blue' | 'green' | 'red' | 'amber' }) {
  const colors = {
    blue: "text-blue-600 dark:text-blue-400 bg-blue-500/5 border-blue-200/50 dark:border-blue-500/10",
    green: "text-green-600 dark:text-green-400 bg-green-500/5 border-green-200/50 dark:border-green-500/10",
    red: "text-red-600 dark:text-red-400 bg-red-500/5 border-red-200/50 dark:border-red-500/10",
    amber: "text-amber-600 dark:text-amber-400 bg-amber-500/5 border-amber-200/50 dark:border-amber-500/10",
  };

  return (
    <div className={`rounded-xl border p-5 bg-white dark:bg-[#0a0a0a] shadow-sm transition-all hover:shadow-md`}>
      <p className="text-[11px] font-bold uppercase tracking-wider text-neutral-400">{title}</p>
      <div className="flex items-baseline gap-2 mt-2">
        <p className="text-3xl font-semibold tracking-tight tabular-nums">{value}</p>
        <div className={`h-1.5 w-1.5 rounded-full ${colors[color].split(' ')[0]}`} />
      </div>
    </div>
  );
}