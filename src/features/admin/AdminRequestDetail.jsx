import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { toast } from "sonner";
import { supabase } from "../../lib/supabase";
import { useAuth } from "../auth/AuthContext";
import { generateRoutes } from "../../utils/routeGenerator";
import { cities } from "../../data/cities";
import StatusBadge from "../../components/ui/StatusBadge";
import ProposalGrid from "../../components/ProposalGrid";
import Modal from "../../components/ui/Modal";

const STATUS_FLOW = ["pendiente", "en_proceso", "propuestas_listas", "archivado"];

export default function AdminRequestDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const [request, setRequest] = useState(null);
  const [client, setClient] = useState(null);
  const [proposals, setProposals] = useState([]);
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [noteText, setNoteText] = useState("");
  const [editModal, setEditModal] = useState(null); // proposal id for editing admin_notes

  const fetchAll = async () => {
    const [reqRes, propRes, notesRes] = await Promise.all([
      supabase.from("trip_requests").select("*, profiles(full_name, phone)").eq("id", id).single(),
      supabase.from("proposals").select("*").eq("request_id", id).order("created_at"),
      supabase.from("admin_notes").select("*, profiles(full_name)").eq("request_id", id).order("created_at"),
    ]);
    setRequest(reqRes.data);
    setClient(reqRes.data?.profiles);
    setProposals(propRes.data || []);
    setNotes(notesRes.data || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchAll();
  }, [id]);

  const changeStatus = async (newStatus) => {
    await supabase.from("trip_requests").update({ status: newStatus }).eq("id", id);
    setRequest((prev) => ({ ...prev, status: newStatus }));
    toast.success(`Estado cambiado a "${newStatus.replace("_", " ")}"`);
  };

  const handleGenerate = async () => {
    if (!request) return;
    setGenerating(true);

    // Reconstruir selectedCities con datos completos del catálogo
    const selectedCities = request.selected_cities.map((c) => cities[c.id] || c);

    const formData = {
      clientName: client?.full_name || "Cliente",
      travelers: request.travelers,
      selectedCities,
      totalDays: request.total_days,
      budget: Number(request.budget),
      preferences: request.preferences,
      notes: request.notes || "",
    };

    const routes = generateRoutes(formData);

    // Insertar 3 proposals
    const inserts = routes.map((route) => ({
      request_id: id,
      tier: route.tier,
      route_data: route,
      form_data: formData,
      admin_notes: null,
      is_visible: false,
    }));

    const { error } = await supabase.from("proposals").insert(inserts);
    setGenerating(false);

    if (error) {
      toast.error("Error al generar propuestas");
      return;
    }

    // Cambiar status a en_proceso si estaba pendiente
    if (request.status === "pendiente") {
      await changeStatus("en_proceso");
    }

    toast.success("3 propuestas generadas");
    fetchAll();
  };

  const toggleVisibility = async (propId, current) => {
    await supabase.from("proposals").update({ is_visible: !current }).eq("id", propId);
    setProposals((prev) =>
      prev.map((p) => (p.id === propId ? { ...p, is_visible: !current } : p))
    );
    toast.success(!current ? "Propuesta visible para el cliente" : "Propuesta oculta");
  };

  const saveProposalNotes = async (propId, text) => {
    await supabase.from("proposals").update({ admin_notes: text || null }).eq("id", propId);
    setProposals((prev) =>
      prev.map((p) => (p.id === propId ? { ...p, admin_notes: text || null } : p))
    );
    setEditModal(null);
    toast.success("Notas guardadas");
  };

  const addNote = async () => {
    if (!noteText.trim()) return;
    const { error } = await supabase.from("admin_notes").insert({
      request_id: id,
      author_id: user.id,
      content: noteText.trim(),
    });
    if (!error) {
      setNoteText("");
      fetchAll();
      toast.success("Nota añadida");
    }
  };

  const saveItemComment = async (propId, key, text) => {
    const prop = proposals.find((p) => p.id === propId);
    const current = prop?.item_comments || {};
    const updated = { ...current };
    if (text) {
      updated[key] = text;
    } else {
      delete updated[key];
    }
    const { error } = await supabase
      .from("proposals")
      .update({ item_comments: updated })
      .eq("id", propId);
    if (error) {
      toast.error("Error al guardar tip");
      return;
    }
    setProposals((prev) =>
      prev.map((p) => (p.id === propId ? { ...p, item_comments: updated } : p))
    );
    toast.success("Tip guardado");
  };

  const deleteProposals = async () => {
    if (!confirm("¿Eliminar todas las propuestas de esta solicitud?")) return;
    await supabase.from("proposals").delete().eq("request_id", id);
    setProposals([]);
    toast.success("Propuestas eliminadas");
  };

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
      </div>
    );
  }

  const editingProposal = editModal ? proposals.find((p) => p.id === editModal) : null;

  return (
    <div>
      <Link to="/admin/solicitudes" className="text-sm text-muted hover:text-accent transition-colors mb-4 inline-block">
        ← Volver a solicitudes
      </Link>

      {/* Datos del cliente + solicitud */}
      <div className="bg-card border border-border rounded-xl p-6 mb-6">
        <div className="flex items-start justify-between gap-4 mb-4">
          <div>
            <h2 className="text-xl font-bold text-text">{client?.full_name || "Cliente"}</h2>
            {client?.phone && <p className="text-sm text-muted">{client.phone}</p>}
          </div>
          <StatusBadge status={request.status} />
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm mb-4">
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

        <div className="mb-3">
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
          <div className="mb-3">
            <p className="text-sm text-muted mb-1">Preferencias</p>
            <div className="flex flex-wrap gap-1">
              {request.preferences.map((p) => (
                <span key={p} className="text-xs bg-accent/10 text-accent px-2 py-0.5 rounded-full">{p}</span>
              ))}
            </div>
          </div>
        )}

        {request.notes && (
          <div>
            <p className="text-sm text-muted mb-1">Notas del cliente</p>
            <p className="text-sm text-text bg-input/50 rounded-lg p-3">{request.notes}</p>
          </div>
        )}
      </div>

      {/* Acciones del admin */}
      <div className="bg-card border border-border rounded-xl p-5 mb-6">
        <h3 className="text-sm font-semibold text-muted uppercase tracking-wider mb-3">Acciones</h3>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={handleGenerate}
            disabled={generating}
            className="bg-accent hover:bg-accent/90 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors cursor-pointer disabled:opacity-50"
          >
            {generating ? "Generando..." : proposals.length > 0 ? "Regenerar propuestas" : "Generar propuestas"}
          </button>

          {proposals.length > 0 && request.status !== "propuestas_listas" && (
            <button
              onClick={() => changeStatus("propuestas_listas")}
              className="bg-green hover:bg-green/90 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors cursor-pointer"
            >
              Marcar como listas
            </button>
          )}

          {request.status !== "archivado" && (
            <button
              onClick={() => changeStatus("archivado")}
              className="bg-muted/20 hover:bg-muted/30 text-muted text-sm font-semibold px-4 py-2 rounded-lg transition-colors cursor-pointer"
            >
              Archivar
            </button>
          )}

          {proposals.length > 0 && (
            <button
              onClick={deleteProposals}
              className="bg-red/10 hover:bg-red/20 text-red text-sm font-semibold px-4 py-2 rounded-lg transition-colors cursor-pointer"
            >
              Eliminar propuestas
            </button>
          )}
        </div>
      </div>

      {/* Propuestas generadas */}
      {proposals.length > 0 && (
        <div className="mb-6">
          <h3 className="text-lg font-bold text-text mb-4">Propuestas ({proposals.length})</h3>
          <ProposalGrid
            proposals={proposals}
            adminControls
            onToggleVisibility={toggleVisibility}
            onEditNotes={(propId) => setEditModal(propId)}
            onSaveItemComment={saveItemComment}
          />
        </div>
      )}

      {/* Notas internas */}
      <div className="bg-card border border-border rounded-xl p-5">
        <h3 className="text-sm font-semibold text-muted uppercase tracking-wider mb-3">Notas internas</h3>
        {notes.length > 0 && (
          <div className="space-y-3 mb-4">
            {notes.map((note) => (
              <div key={note.id} className="bg-input/50 rounded-lg p-3">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-semibold text-text">
                    {note.profiles?.full_name || "Admin"}
                  </span>
                  <span className="text-xs text-muted">
                    {new Date(note.created_at).toLocaleString("es-AR", {
                      day: "numeric",
                      month: "short",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
                <p className="text-sm text-text">{note.content}</p>
              </div>
            ))}
          </div>
        )}
        <div className="flex gap-2">
          <input
            type="text"
            value={noteText}
            onChange={(e) => setNoteText(e.target.value)}
            placeholder="Escribir nota interna..."
            className="flex-1 bg-input border border-border rounded-lg px-4 py-2 text-sm text-text focus:outline-none focus:border-accent transition-colors"
            onKeyDown={(e) => e.key === "Enter" && addNote()}
          />
          <button
            onClick={addNote}
            disabled={!noteText.trim()}
            className="bg-accent hover:bg-accent/90 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors cursor-pointer disabled:opacity-50"
          >
            Añadir
          </button>
        </div>
      </div>

      {/* Modal para editar notas de propuesta */}
      <Modal
        open={!!editModal}
        onClose={() => setEditModal(null)}
        title="Notas para el cliente"
      >
        {editingProposal && (
          <EditProposalNotes
            initial={editingProposal.admin_notes || ""}
            onSave={(text) => saveProposalNotes(editModal, text)}
          />
        )}
      </Modal>
    </div>
  );
}

function EditProposalNotes({ initial, onSave }) {
  const [text, setText] = useState(initial);
  return (
    <div className="space-y-4">
      <p className="text-sm text-muted">
        Esta nota será visible para el cliente junto a la propuesta.
      </p>
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={4}
        className="w-full bg-input border border-border rounded-lg px-4 py-2.5 text-text text-sm focus:outline-none focus:border-accent transition-colors resize-none"
        placeholder="Ej: Recomendamos esta opción por la cercanía a zonas gastronómicas..."
      />
      <div className="flex justify-end gap-2">
        <button
          onClick={() => onSave(text)}
          className="bg-accent hover:bg-accent/90 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors cursor-pointer"
        >
          Guardar
        </button>
      </div>
    </div>
  );
}
