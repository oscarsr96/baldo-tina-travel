import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../../lib/supabase";
import { useAuth } from "../auth/AuthContext";
import StatusBadge from "../../components/ui/StatusBadge";

export default function ClientDashboard() {
  const { user } = useAuth();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    supabase
      .from("trip_requests")
      .select("*")
      .eq("client_id", user.id)
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        setRequests(data || []);
        setLoading(false);
      });
  }, [user]);

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-text">Mis Solicitudes</h2>
        <Link
          to="/nueva-solicitud"
          className="bg-accent hover:bg-accent/90 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors"
        >
          + Nueva solicitud
        </Link>
      </div>

      {requests.length === 0 ? (
        <div className="bg-card border border-border rounded-xl p-12 text-center">
          <p className="text-4xl mb-3">✈️</p>
          <p className="text-lg font-semibold text-text mb-1">No tenés solicitudes aún</p>
          <p className="text-sm text-muted mb-6">
            Contanos tu viaje soñado y te preparamos propuestas personalizadas.
          </p>
          <Link
            to="/nueva-solicitud"
            className="inline-block bg-accent hover:bg-accent/90 text-white font-semibold px-6 py-3 rounded-lg transition-colors"
          >
            Crear mi primera solicitud
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {requests.map((req) => (
            <Link
              key={req.id}
              to={`/solicitud/${req.id}`}
              className="block bg-card border border-border rounded-xl p-5 hover:border-accent/50 transition-colors"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <StatusBadge status={req.status} />
                    <span className="text-xs text-muted">
                      {new Date(req.created_at).toLocaleDateString("es-AR", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </span>
                  </div>
                  <p className="text-sm text-text font-medium">
                    {req.selected_cities.map((c) => c.name).join(" → ")}
                  </p>
                  <p className="text-xs text-muted mt-1">
                    {req.travelers} viajero{req.travelers > 1 ? "s" : ""} · {req.total_days} días · €{req.budget}/persona
                  </p>
                </div>
                <span className="text-muted text-sm">→</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
