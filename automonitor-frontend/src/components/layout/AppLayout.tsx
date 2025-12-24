import { NavLink, Outlet } from "react-router-dom";

export default function AppLayout() {
  return (
    <div className="min-h-screen bg-neutral-50 text-neutral-900 dark:bg-[#0a0a0a] dark:text-neutral-50 flex">
      {/* Sidebar con un ancho ligeramente menor y fondo sutil */}
      <aside className="w-60 flex-shrink-0 border-r border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#0a0a0a] sticky top-0 h-screen overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center gap-2 px-2 mb-8">
            <div className="h-6 w-1 bg-blue-600 rounded-full" /> {/* Acento visual */}
            <div>
              <h1 className="text-sm font-bold tracking-tight uppercase">AutoMonitor</h1>
              <p className="text-[10px] text-neutral-500 font-medium">SYSTEM CORE</p>
            </div>
          </div>

          <nav className="space-y-1">
            <MenuLink to="/">
              <DashboardIcon /> Dashboard
            </MenuLink>
            <MenuLink to="/events">
              <EventsIcon /> Events
            </MenuLink>
          </nav>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        {/* Header más limpio y compacto */}
        <header className="h-16 border-b border-neutral-200 dark:border-neutral-800 bg-white/80 dark:bg-[#0a0a0a]/80 backdrop-blur-md sticky top-0 z-10 px-8 flex items-center justify-between">
          <h2 className="text-sm font-medium text-neutral-500 uppercase tracking-widest">Overview</h2>
          
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 px-3 py-1 bg-neutral-100 dark:bg-neutral-900 rounded-full border border-neutral-200 dark:border-neutral-800">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span className="text-[11px] font-mono text-neutral-600 dark:text-neutral-400">
                {import.meta.env.VITE_API_BASE_URL}
              </span>
            </div>
          </div>
        </header>

        {/* Contenedor de contenido con ancho máximo para legibilidad */}
        <main className="p-8 max-w-7xl w-full mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

function MenuLink({ to, children }: { to: string; children: React.ReactNode }) {
  return (
    <NavLink
      to={to}
      end={to === "/"}
      className={({ isActive }) =>
        [
          "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all duration-200",
          isActive
            ? "bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400 font-medium shadow-sm ring-1 ring-blue-700/10 dark:ring-blue-400/20"
            : "text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 hover:bg-neutral-100 dark:hover:bg-neutral-900",
        ].join(" ")
      }
    >
      {children}
    </NavLink>
  );
}

// Iconos minimalistas en SVG (Inline para no añadir dependencias)
const DashboardIcon = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
  </svg>
);

const EventsIcon = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);