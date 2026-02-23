import CityDetail from "./CityDetail";
import { exportRoutePDF } from "../utils/pdfExport";

export default function RouteDetail({ route, formData, adminNotes }) {
  return (
    <div className="border-t border-border">
      {/* Transporte */}
      <div className="p-5 bg-input/30">
        <h4 className="text-sm font-semibold text-muted uppercase tracking-wider mb-3">Transporte</h4>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted">✈ Buenos Aires → {route.flightIn.city}</span>
            <span className="text-text">€{route.flightIn.cost}</span>
          </div>
          {route.segments.map((seg, i) => (
            <div key={i} className="flex justify-between">
              <span className="text-muted">
                {seg.mode === "Bus" ? "🚌" : seg.mode === "Tren" ? "🚂" : "✈"}{" "}
                {seg.from} → {seg.to}
                <span className="text-muted/60 ml-1">({seg.mode})</span>
              </span>
              <span className="text-text">€{seg.cost}</span>
            </div>
          ))}
          <div className="flex justify-between">
            <span className="text-muted">✈ {route.flightOut.city} → Buenos Aires</span>
            <span className="text-text">€{route.flightOut.cost}</span>
          </div>
        </div>
      </div>

      {/* Ciudades */}
      <div className="p-5 space-y-4">
        <h4 className="text-sm font-semibold text-muted uppercase tracking-wider">Detalle por ciudad</h4>
        {route.cityDetails.map((city) => (
          <CityDetail key={city.cityId} city={city} tier={route.tier} />
        ))}
      </div>

      {/* Resumen de costes */}
      <div className="p-5 bg-input/30 border-t border-border">
        <h4 className="text-sm font-semibold text-muted uppercase tracking-wider mb-3">Resumen de costes (por persona)</h4>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted">Vuelos intercontinentales</span>
            <span className="text-text">€{route.costs.flights}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted">Transporte entre ciudades</span>
            <span className="text-text">€{route.costs.interCityTransport}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted">Transporte local</span>
            <span className="text-text">€{route.costs.localTransport}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted">Alojamiento</span>
            <span className="text-text">€{route.costs.accommodation}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted">Comida</span>
            <span className="text-text">€{route.costs.food}</span>
          </div>
          <div className="border-t border-border pt-2 mt-2 flex justify-between font-bold text-base">
            <span className="text-text">Total por persona</span>
            <span className="text-accent">€{route.costs.totalPerPerson.toLocaleString()}</span>
          </div>
          <div className="flex justify-between font-bold text-base">
            <span className="text-text">Total grupo ({formData.travelers})</span>
            <span className="text-accent">€{route.costs.totalGroup.toLocaleString()}</span>
          </div>
        </div>
      </div>

      {/* Botón PDF */}
      <div className="p-5 border-t border-border">
        <button
          onClick={() => exportRoutePDF(route, formData, adminNotes)}
          className="w-full bg-accent hover:bg-accent/90 text-white font-semibold py-3 rounded-lg transition-colors cursor-pointer"
        >
          📄 Exportar PDF — Ruta {route.label}
        </button>
      </div>
    </div>
  );
}
