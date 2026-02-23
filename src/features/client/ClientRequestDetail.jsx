import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "../../lib/supabase";
import StatusBadge from "../../components/ui/StatusBadge";
import ProposalGrid from "../../components/ProposalGrid";

export default function ClientRequestDetail() {
  const { id } = useParams();
  const [request, setRequest] = useState(null);
  const [proposals, setProposals] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    const [reqRes, propRes] = await Promise.all([
      supabase.from("trip_requests").select("*").eq("id", id).single(),
      supabase
        .from("proposals")
        .select("*")
        .eq("request_id", id)
        .eq("is_visible", true)
        .order("created_at"),
    ]);
    setRequest(reqRes.data);
    setProposals(propRes.data || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchData();

    // Realtime: escuchar cambios en propuestas y en la solicitud
    const channel = supabase
      .channel(`request-${id}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "proposals", filter: `request_id=eq.${id}` },
        () => fetchData()
      )
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "trip_requests", filter: `id=eq.${id}` },
        (payload) => setRequest(payload.new)
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [id]);

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!request) {
    return (
      <div className="text-center py-20">
        <p className="text-muted">Solicitud no encontrada</p>
        <Link to="/dashboard" className="text-accent text-sm hover:underline">
          Volver al dashboard
        </Link>
      </div>
    );
  }

  return (
    <div>
      <Link to="/dashboard" className="text-sm text-muted hover:text-accent transition-colors mb-4 inline-block">
        ← Volver a mis solicitudes
      </Link>

      {/* Datos de la solicitud */}
      <div className="bg-card border border-border rounded-xl p-6 mb-6">
        <div className="flex items-center gap-3 mb-4">
          <h2 className="text-xl font-bold text-text">Solicitud de viaje</h2>
          <StatusBadge status={request.status} />
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
          <div>
            <p className="text-muted">Viajeros</p>
            <p className="font-medium text-text">{request.travelers}</p>
          </div>
          <div>
            <p className="text-muted">Días</p>
            <p className="font-medium text-text">{request.total_days}</p>
          </div>
          <div>
            <p className="text-muted">Presupuesto</p>
            <p className="font-medium text-text">€{request.budget}/persona</p>
          </div>
          <div>
            <p className="text-muted">Fecha</p>
            <p className="font-medium text-text">
              {new Date(request.created_at).toLocaleDateString("es-AR")}
            </p>
          </div>
        </div>

        <div className="mt-4">
          <p className="text-sm text-muted mb-1">Ruta solicitada</p>
          <div className="flex flex-wrap items-center gap-1 text-sm">
            <span className="text-muted">Buenos Aires</span>
            {request.selected_cities.map((city) => (
              <span key={city.id} className="flex items-center gap-1">
                <span className="text-accent">→</span>
                <span className="font-medium">{city.emoji} {city.name}</span>
              </span>
            ))}
            <span className="text-accent">→</span>
            <span className="text-muted">Buenos Aires</span>
          </div>
        </div>

        {request.preferences?.length > 0 && (
          <div className="mt-3">
            <p className="text-sm text-muted mb-1">Preferencias</p>
            <div className="flex flex-wrap gap-1">
              {request.preferences.map((p) => (
                <span key={p} className="text-xs bg-accent/10 text-accent px-2 py-0.5 rounded-full">
                  {p}
                </span>
              ))}
            </div>
          </div>
        )}

        {request.notes && (
          <div className="mt-3">
            <p className="text-sm text-muted mb-1">Notas</p>
            <p className="text-sm text-text">{request.notes}</p>
          </div>
        )}
      </div>

      {/* Propuestas */}
      {proposals.length > 0 ? (
        <div>
          <h3 className="text-lg font-bold text-text mb-4">Tus propuestas personalizadas</h3>
          <ProposalGrid proposals={proposals} />
        </div>
      ) : (
        <div className="bg-card border border-border rounded-xl p-8 text-center">
          {request.status === "propuestas_listas" ? (
            <p className="text-muted">Cargando propuestas...</p>
          ) : (
            <>
              <p className="text-3xl mb-2">⏳</p>
              <p className="text-text font-medium">Estamos trabajando en tus propuestas</p>
              <p className="text-sm text-muted mt-1">
                Te notificaremos cuando estén listas. Esta página se actualiza automáticamente.
              </p>
            </>
          )}
        </div>
      )}
    </div>
  );
}
