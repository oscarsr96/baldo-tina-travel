import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../../lib/supabase";
import StatusBadge from "../../components/ui/StatusBadge";

const STATUS_OPTIONS = ["todas", "pendiente", "en_proceso", "propuestas_listas", "archivado"];

export default function AdminDashboard() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("todas");

  useEffect(() => {
    const fetchRequests = async () => {
      const { data } = await supabase
        .from("trip_requests")
        .select("*, profiles(full_name, phone)")
        .order("created_at", { ascending: false });
      setRequests(data || []);
      setLoading(false);
    };
    fetchRequests();
  }, []);

  const filtered =
    filter === "todas"
      ? requests
      : requests.filter((r) => r.status === filter);

  // Stats
  const stats = {
    total: requests.length,
    pendientes: requests.filter((r) => r.status === "pendiente").length,
    enProceso: requests.filter((r) => r.status === "en_proceso").length,
    listas: requests.filter((r) => r.status === "propuestas_listas").length,
    presupuestoMedio: requests.length
      ? Math.round(requests.reduce((sum, r) => sum + Number(r.budget), 0) / requests.length)
      : 0,
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-2xl font-bold text-text mb-6">Panel de administración</h2>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        {[
          { label: "Total solicitudes", value: stats.total, color: "text-text" },
          { label: "Pendientes", value: stats.pendientes, color: "text-blue" },
          { label: "En proceso", value: stats.enProceso, color: "text-accent" },
          { label: "Presupuesto medio", value: `€${stats.presupuestoMedio}`, color: "text-green" },
        ].map((s) => (
          <div key={s.label} className="bg-card border border-border rounded-xl p-4">
            <p className="text-xs text-muted">{s.label}</p>
            <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Filtros */}
      <div className="flex flex-wrap gap-2 mb-4">
        {STATUS_OPTIONS.map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`px-3 py-1.5 rounded-full border text-xs font-medium transition-colors cursor-pointer ${
              filter === s
                ? "bg-accent/15 border-accent text-accent"
                : "bg-input border-border text-muted hover:border-muted"
            }`}
          >
            {s === "todas" ? "Todas" : s.replace("_", " ")}
            {s !== "todas" && (
              <span className="ml-1 opacity-60">
                ({requests.filter((r) => r.status === s).length})
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Tabla de solicitudes */}
      {filtered.length === 0 ? (
        <div className="bg-card border border-border rounded-xl p-8 text-center">
          <p className="text-muted">No hay solicitudes con este filtro</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((req) => (
            <Link
              key={req.id}
              to={`/admin/solicitud/${req.id}`}
              className="block bg-card border border-border rounded-xl p-4 hover:border-accent/50 transition-colors"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-semibold text-text">
                      {req.profiles?.full_name || "Cliente"}
                    </span>
                    <StatusBadge status={req.status} />
                  </div>
                  <p className="text-sm text-muted">
                    {req.selected_cities.map((c) => c.name).join(" → ")}
                  </p>
                  <p className="text-xs text-muted mt-1">
                    {req.travelers} viajero{req.travelers > 1 ? "s" : ""} · {req.total_days} días · €{req.budget}/persona ·{" "}
                    {new Date(req.created_at).toLocaleDateString("es-AR", {
                      day: "numeric",
                      month: "short",
                    })}
                  </p>
                </div>
                <span className="text-muted">→</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
