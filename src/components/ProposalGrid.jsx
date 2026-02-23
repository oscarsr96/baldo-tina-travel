import { useState } from "react";
import RouteDetail from "./RouteDetail";

const TIER_STYLES = {
  budget: { badge: "bg-green/15 text-green border-green", icon: "💰" },
  mid: { badge: "bg-blue/15 text-blue border-blue", icon: "⚖️" },
  premium: { badge: "bg-accent/15 text-accent border-accent", icon: "✨" },
};

const TIER_LABELS = {
  budget: "Económica",
  mid: "Equilibrada",
  premium: "Premium",
};

export default function ProposalGrid({
  proposals,
  adminControls,
  onToggleVisibility,
  onEditNotes,
}) {
  const [selectedId, setSelectedId] = useState(null);

  const selected = proposals.find((p) => p.id === selectedId);

  const handleSelect = (id) => {
    setSelectedId((prev) => (prev === id ? null : id));
  };

  return (
    <div>
      {/* Grid de cards compactas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {proposals.map((prop) => {
          const route = prop.route_data;
          const formData = prop.form_data;
          const style = TIER_STYLES[route.tier];
          const withinBudget = route.costs.totalPerPerson <= formData.budget;
          const isSelected = selectedId === prop.id;

          return (
            <div
              key={prop.id}
              onClick={() => handleSelect(prop.id)}
              className={`bg-card border rounded-xl p-4 cursor-pointer transition-all hover:bg-input/50 ${
                isSelected
                  ? "border-accent bg-accent/5 ring-1 ring-accent/30"
                  : "border-border"
              }`}
            >
              {/* Tier icon + label */}
              <div className="flex items-center gap-2 mb-3">
                <span className="text-2xl">{style.icon}</span>
                <span className={`px-2 py-0.5 rounded-full border text-xs font-medium ${style.badge}`}>
                  {TIER_LABELS[route.tier]}
                </span>
              </div>

              {/* Precio por persona */}
              <div className="mb-1">
                <p className="text-xs text-muted">Por persona</p>
                <p className="text-2xl font-bold text-text">
                  €{route.costs.totalPerPerson.toLocaleString()}
                </p>
              </div>

              {/* Precio grupo */}
              <p className="text-sm text-muted mb-2">
                Grupo: <span className="text-text font-medium">€{route.costs.totalGroup.toLocaleString()}</span>
              </p>

              {/* Budget badge */}
              <div
                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                  withinBudget ? "bg-green/15 text-green" : "bg-red/15 text-red"
                }`}
              >
                {withinBudget
                  ? "✓ Ok"
                  : `✗ +€${(route.costs.totalPerPerson - formData.budget).toLocaleString()}`}
              </div>

              {/* Admin controls */}
              {adminControls && (
                <div className="mt-3 pt-3 border-t border-border flex items-center gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleVisibility(prop.id, prop.is_visible);
                    }}
                    className={`text-xs px-2 py-1 rounded-full border font-medium cursor-pointer transition-colors ${
                      prop.is_visible
                        ? "bg-green/15 border-green text-green"
                        : "bg-input border-border text-muted"
                    }`}
                    title={prop.is_visible ? "Visible para cliente" : "Oculta"}
                  >
                    {prop.is_visible ? "👁" : "👁‍🗨"}
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onEditNotes(prop.id);
                    }}
                    className="text-xs text-accent hover:underline cursor-pointer"
                  >
                    📝 {prop.admin_notes ? "Nota" : "Nota"}
                  </button>
                </div>
              )}

              {/* Admin notes indicator */}
              {prop.admin_notes && (
                <p className="mt-2 text-xs text-accent truncate" title={prop.admin_notes}>
                  💬 {prop.admin_notes}
                </p>
              )}
            </div>
          );
        })}
      </div>

      {/* Panel detalle desplegable */}
      {selected && (
        <div className="mt-4 bg-card border border-accent/30 rounded-xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
          {/* Header del detalle */}
          <div className="p-4 bg-accent/5 border-b border-border flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xl">
                {TIER_STYLES[selected.route_data.tier].icon}
              </span>
              <h4 className="font-bold text-text">
                Ruta {selected.route_data.label} — {TIER_LABELS[selected.route_data.tier]}
              </h4>
            </div>
            <button
              onClick={() => setSelectedId(null)}
              className="text-muted hover:text-text text-sm cursor-pointer"
            >
              ✕ Cerrar
            </button>
          </div>

          {/* Ruta visual */}
          <div className="px-5 pt-4 flex items-center gap-1 flex-wrap text-xs text-muted">
            {selected.route_data.routeVisual.split(" → ").map((city, i, arr) => (
              <span key={i} className="flex items-center gap-1">
                <span className={city === "Buenos Aires" ? "text-muted" : "text-text font-medium"}>
                  {city}
                </span>
                {i < arr.length - 1 && <span className="text-accent">→</span>}
              </span>
            ))}
          </div>

          <RouteDetail
            route={selected.route_data}
            formData={selected.form_data}
            adminNotes={selected.admin_notes}
          />
        </div>
      )}
    </div>
  );
}
