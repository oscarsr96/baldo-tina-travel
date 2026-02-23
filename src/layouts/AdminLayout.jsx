import { Link, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../features/auth/AuthContext";

const NAV_ITEMS = [
  { to: "/admin", label: "Dashboard", icon: "📊" },
  { to: "/admin/solicitudes", label: "Solicitudes", icon: "📋" },
];

export default function AdminLayout() {
  const { profile, signOut } = useAuth();
  const location = useLocation();

  return (
    <div className="min-h-screen bg-bg">
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-[1200px] mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link to="/admin">
              <h1 className="text-lg font-bold text-accent">Baldo & Tina Travel</h1>
            </Link>
            <span className="text-xs bg-accent/15 text-accent px-2 py-0.5 rounded-full font-medium">
              Admin
            </span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted hidden sm:inline">
              {profile?.full_name || "Admin"}
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

      <div className="max-w-[1200px] mx-auto px-4 py-6 flex gap-6">
        {/* Sidebar */}
        <nav className="w-52 shrink-0 hidden md:block">
          <div className="bg-card border border-border rounded-xl p-3 space-y-1 sticky top-20">
            {NAV_ITEMS.map((item) => {
              const active =
                item.to === "/admin"
                  ? location.pathname === "/admin"
                  : location.pathname.startsWith(item.to);
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

        {/* Content */}
        <main className="flex-1 min-w-0">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
