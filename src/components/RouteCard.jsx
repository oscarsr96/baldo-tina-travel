import { useState } from "react";
import RouteDetail from "./RouteDetail";

const TIER_STYLES = {
  budget: { badge: "bg-green/15 text-green border-green", icon: "💰" },
  mid: { badge: "bg-blue/15 text-blue border-blue", icon: "⚖️" },
  premium: { badge: "bg-accent/15 text-accent border-accent", icon: "✨" },
};

const TIER_DESC = {
  budget: "Hostales, buses, comida callejera",
  mid: "Hoteles 3★, trenes, restaurantes locales",
  premium: "Hoteles boutique 4★, vuelos internos, experiencias gastronómicas",
};

export default function RouteCard({ route, formData, adminNotes }) {
  const [expanded, setExpanded] = useState(false);
  const style = TIER_STYLES[route.tier];
  const withinBudget = route.costs.totalPerPerson <= formData.budget;

  return (
    <div className="bg-card border border-border rounded-xl overflow-hidden transition-all">
      {/* Header */}
      <div
        className="p-5 cursor-pointer hover:bg-input/50 transition-colors"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <span className="text-2xl">{style.icon}</span>
              <h3 className="text-xl font-bold text-text">Ruta {route.label}</h3>
              <span className={`px-2 py-0.5 rounded-full border text-xs font-medium ${style.badge}`}>
                {route.tier === "budget" ? "Económica" : route.tier === "mid" ? "Equilibrada" : "Premium"}
              </span>
            </div>
            <p className="text-sm text-muted">{TIER_DESC[route.tier]}</p>
          </div>

          <div className="text-right shrink-0">
            <p className="text-sm text-muted">Por persona</p>
            <p className="text-2xl font-bold text-text">€{route.costs.totalPerPerson.toLocaleString()}</p>
            <p className="text-sm text-muted">
              Grupo: <span className="text-text font-medium">€{route.costs.totalGroup.toLocaleString()}</span>
            </p>
            <div className={`mt-1 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
              withinBudget ? "bg-green/15 text-green" : "bg-red/15 text-red"
            }`}>
              {withinBudget ? "✓ Dentro del presupuesto" : `✗ Excede en €${(route.costs.totalPerPerson - formData.budget).toLocaleString()}`}
            </div>
          </div>
        </div>

        {/* Ruta visual compacta */}
        <div className="mt-3 flex items-center gap-1 flex-wrap text-xs text-muted">
          {route.routeVisual.split(" → ").map((city, i, arr) => (
            <span key={i} className="flex items-center gap-1">
              <span className={city === "Buenos Aires" ? "text-muted" : "text-text font-medium"}>{city}</span>
              {i < arr.length - 1 && <span className="text-accent">→</span>}
            </span>
          ))}
        </div>

        {/* Expand indicator */}
        <div className="flex justify-center mt-3">
          <span className={`text-muted text-sm transition-transform ${expanded ? "rotate-180" : ""}`}>
            ▼
          </span>
        </div>
      </div>

      {/* Expanded content */}
      {expanded && (
        <RouteDetail route={route} formData={formData} adminNotes={adminNotes} preferences={formData.preferences || []} />
      )}
    </div>
  );
}
