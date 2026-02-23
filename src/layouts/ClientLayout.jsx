import { Link, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../features/auth/AuthContext";

const NAV_ITEMS = [
  { to: "/dashboard", label: "Mis Solicitudes", icon: "📋" },
  { to: "/nueva-solicitud", label: "Nueva Solicitud", icon: "✈️" },
  { to: "/perfil", label: "Mi Perfil", icon: "👤" },
];

export default function ClientLayout() {
  const { profile, signOut } = useAuth();
  const location = useLocation();

  return (
    <div className="min-h-screen bg-bg">
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-[1100px] mx-auto px-4 py-3 flex items-center justify-between">
          <Link to="/dashboard">
            <h1 className="text-lg font-bold text-accent">Baldo & Tina Travel</h1>
          </Link>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted hidden sm:inline">
              Hola, {profile?.full_name?.split(" ")[0] || "Cliente"}
            </span>
            <button
              onClick={signOut}
              className="text-sm text-muted hover:text-red transition-colors cursor-pointer"
            >
              Cerrar sesión
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-[1100px] mx-auto px-4 py-6 flex gap-6">
        {/* Sidebar */}
        <nav className="w-56 shrink-0 hidden md:block">
          <div className="bg-card border border-border rounded-xl p-3 space-y-1 sticky top-20">
            {NAV_ITEMS.map((item) => {
              const active = location.pathname === item.to;
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={`flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    active
                      ? "bg-accent/10 text-accent"
                      : "text-muted hover:text-text hover:bg-input/50"
                  }`}
                >
                  <span>{item.icon}</span>
                  {item.label}
                </Link>
              );
            })}
          </div>
        </nav>

        {/* Mobile nav */}
        <div className="md:hidden fixed bottom-0 left-0 right-0 bg-card border-t border-border z-10 px-2 py-2 flex justify-around">
          {NAV_ITEMS.map((item) => {
            const active = location.pathname === item.to;
            return (
              <Link
                key={item.to}
                to={item.to}
                className={`flex flex-col items-center gap-0.5 text-xs ${
                  active ? "text-accent" : "text-muted"
                }`}
              >
                <span className="text-lg">{item.icon}</span>
                <span>{item.label.split(" ").slice(-1)}</span>
              </Link>
            );
          })}
        </div>

        {/* Content */}
        <main className="flex-1 min-w-0">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
