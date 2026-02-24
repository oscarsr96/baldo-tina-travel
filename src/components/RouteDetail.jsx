import { useState } from "react";
import CityItinerary from "./CityItinerary";
import { exportRoutePDF } from "../utils/pdfExport";

export default function RouteDetail({ route, formData, adminNotes, preferences = [], itemComments = {}, onSaveItemComment }) {
  const [selectedCityId, setSelectedCityId] = useState(route.cityDetails[0]?.cityId || null);

  const selectedCity = route.cityDetails.find((c) => c.cityId === selectedCityId);

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

      {/* Selector de ciudades */}
      <div className="p-5 space-y-4">
        <h4 className="text-sm font-semibold text-muted uppercase tracking-wider">Detalle por ciudad</h4>

        {/* Fila de cards de ciudades */}
        <div className={`grid gap-3 ${
          route.cityDetails.length === 1 ? "grid-cols-1" :
          route.cityDetails.length === 2 ? "grid-cols-2" :
          route.cityDetails.length === 3 ? "grid-cols-3" :
          "grid-cols-2 sm:grid-cols-4"
        }`}>
          {route.cityDetails.map((city) => {
            const isSelected = selectedCityId === city.cityId;
            return (
              <div
                key={city.cityId}
                onClick={() => setSelectedCityId(city.cityId)}
                className={`relative rounded-xl overflow-hidden cursor-pointer transition-all ${
                  isSelected
                    ? "ring-2 ring-accent shadow-md"
                    : "border border-border hover:border-accent/50 opacity-75 hover:opacity-100"
                }`}
              >
                {/* Mini hero */}
                <div className="h-20 sm:h-24 relative">
                  {city.photo ? (
                    <img
                      src={city.photo}
                      alt={city.name}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-accent/20 to-accent/5" />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-2">
                    <p className="text-white font-bold text-sm leading-tight drop-shadow">
                      {city.emoji} {city.name}
                    </p>
                    <p className="text-white/70 text-[11px]">
                      {city.nights} noche{city.nights > 1 ? "s" : ""} · €{city.subtotal}
                    </p>
                  </div>
                </div>

                {/* Indicador de seleccionado */}
                {isSelected && (
                  <div className="absolute top-1.5 right-1.5 w-5 h-5 bg-accent rounded-full flex items-center justify-center">
                    <span className="text-white text-[10px] font-bold">✓</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Itinerario de la ciudad seleccionada */}
        {selectedCity && (
          <div key={selectedCityId} className="animate-slide-in-right">
            <CityItinerary city={selectedCity} tier={route.tier} preferences={preferences} itemComments={itemComments} onSaveItemComment={onSaveItemComment} />
          </div>
        )}
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
          onClick={() => exportRoutePDF(route, formData, adminNotes, itemComments)}
          className="w-full bg-accent hover:bg-accent/90 text-white font-semibold py-3 rounded-lg transition-colors cursor-pointer"
        >
          📄 Exportar PDF — Ruta {route.label}
        </button>
      </div>
    </div>
  );
}
