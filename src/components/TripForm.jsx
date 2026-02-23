import { useState } from "react";
import { cityList } from "../data/cities";

const PREFERENCES = [
  { id: "tranquilo", label: "🌿 Ambiente tranquilo" },
  { id: "animado", label: "🎉 Ambiente animado" },
  { id: "cultura", label: "🎨 Museos y cultura" },
  { id: "gastronomia", label: "🍷 Gastronomía" },
  { id: "naturaleza", label: "🌳 Naturaleza y parques" },
  { id: "nocturna", label: "🌙 Vida nocturna" },
];

/**
 * mode:
 *   "client"  — sin clientName, para que el cliente envíe su solicitud
 *   "admin"   — con clientName, para que el admin genere propuestas (modo original)
 *
 * initialData: valores pre-cargados (para edición admin)
 */
export default function TripForm({ onSubmit, mode = "admin", initialData, submitLabel }) {
  const [clientName, setClientName] = useState(initialData?.clientName || "");
  const [travelers, setTravelers] = useState(initialData?.travelers || 2);
  const [selectedCities, setSelectedCities] = useState(initialData?.selectedCities || []);
  const [totalDays, setTotalDays] = useState(initialData?.totalDays || 10);
  const [budget, setBudget] = useState(initialData?.budget || 2000);
  const [preferences, setPreferences] = useState(initialData?.preferences || []);
  const [notes, setNotes] = useState(initialData?.notes || "");
  const [errors, setErrors] = useState({});

  const toggleCity = (city) => {
    setSelectedCities((prev) => {
      const exists = prev.find((c) => c.id === city.id);
      if (exists) return prev.filter((c) => c.id !== city.id);
      return [...prev, city];
    });
  };

  const moveCity = (index, direction) => {
    setSelectedCities((prev) => {
      const next = [...prev];
      const newIndex = index + direction;
      if (newIndex < 0 || newIndex >= next.length) return prev;
      [next[index], next[newIndex]] = [next[newIndex], next[index]];
      return next;
    });
  };

  const togglePreference = (id) => {
    setPreferences((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]
    );
  };

  const validate = () => {
    const e = {};
    if (mode === "admin" && !clientName.trim()) e.clientName = "Requerido";
    if (travelers < 1 || travelers > 10) e.travelers = "Entre 1 y 10";
    if (selectedCities.length < 2) e.cities = "Mínimo 2 ciudades";
    if (totalDays < 3 || totalDays > 30) e.totalDays = "Entre 3 y 30 días";
    if (!budget || budget <= 0) e.budget = "Requerido";
    if (preferences.length < 1) e.preferences = "Al menos 1 preferencia";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;
    const data = { travelers, selectedCities, totalDays, budget, preferences, notes };
    if (mode === "admin") data.clientName = clientName;
    onSubmit(data);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <h2 className="text-2xl font-bold text-accent">
        {mode === "client" ? "Tu viaje soñado" : "Datos del viaje"}
      </h2>

      {/* Nombre del cliente — solo en modo admin */}
      {mode === "admin" && (
        <div>
          <label className="block text-sm font-medium text-muted mb-1">Nombre del cliente</label>
          <input
            type="text"
            value={clientName}
            onChange={(e) => setClientName(e.target.value)}
            className="w-full bg-input border border-border rounded-lg px-4 py-2.5 text-text focus:outline-none focus:border-accent transition-colors"
            placeholder="Ej: María González"
          />
          {errors.clientName && <p className="text-red text-xs mt-1">{errors.clientName}</p>}
        </div>
      )}

      {/* Viajeros y Días en fila */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-muted mb-1">Viajeros</label>
          <input
            type="number"
            min={1}
            max={10}
            value={travelers}
            onChange={(e) => setTravelers(Number(e.target.value))}
            className="w-full bg-input border border-border rounded-lg px-4 py-2.5 text-text focus:outline-none focus:border-accent transition-colors"
          />
          {errors.travelers && <p className="text-red text-xs mt-1">{errors.travelers}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-muted mb-1">Días totales</label>
          <input
            type="number"
            min={3}
            max={30}
            value={totalDays}
            onChange={(e) => setTotalDays(Number(e.target.value))}
            className="w-full bg-input border border-border rounded-lg px-4 py-2.5 text-text focus:outline-none focus:border-accent transition-colors"
          />
          {errors.totalDays && <p className="text-red text-xs mt-1">{errors.totalDays}</p>}
        </div>
      </div>

      {/* Presupuesto */}
      <div>
        <label className="block text-sm font-medium text-muted mb-1">Presupuesto por persona (€)</label>
        <input
          type="number"
          min={1}
          value={budget}
          onChange={(e) => setBudget(Number(e.target.value))}
          className="w-full bg-input border border-border rounded-lg px-4 py-2.5 text-text focus:outline-none focus:border-accent transition-colors"
          placeholder="2000"
        />
        {errors.budget && <p className="text-red text-xs mt-1">{errors.budget}</p>}
      </div>

      {/* Selector de ciudades */}
      <div>
        <label className="block text-sm font-medium text-muted mb-2">Ciudades a visitar (click para seleccionar, se numeran en orden)</label>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
          {cityList.map((city) => {
            const index = selectedCities.findIndex((c) => c.id === city.id);
            const isSelected = index !== -1;
            return (
              <button
                key={city.id}
                type="button"
                onClick={() => toggleCity(city)}
                className={`relative flex items-center gap-2 px-3 py-2.5 rounded-lg border text-sm font-medium transition-all cursor-pointer ${
                  isSelected
                    ? "bg-accent/15 border-accent text-accent"
                    : "bg-input border-border text-text hover:border-muted"
                }`}
              >
                {isSelected && (
                  <span className="absolute -top-2 -left-2 w-5 h-5 rounded-full bg-accent text-white text-xs flex items-center justify-center font-bold">
                    {index + 1}
                  </span>
                )}
                <span>{city.emoji}</span>
                <span>{city.name}</span>
              </button>
            );
          })}
        </div>
        {errors.cities && <p className="text-red text-xs mt-1">{errors.cities}</p>}
      </div>

      {/* Orden de la ruta */}
      {selectedCities.length >= 2 && (
        <div className="bg-card border border-border rounded-lg p-4">
          <p className="text-sm text-muted mb-2">Orden de la ruta (usa las flechas para reordenar):</p>
          <div className="flex flex-wrap items-center gap-1 mb-3">
            <span className="text-sm text-muted">Buenos Aires</span>
            {selectedCities.map((city) => (
              <span key={city.id} className="flex items-center gap-1">
                <span className="text-accent">→</span>
                <span className="text-sm font-medium">{city.emoji} {city.name}</span>
              </span>
            ))}
            <span className="text-accent">→</span>
            <span className="text-sm text-muted">Buenos Aires</span>
          </div>
          <div className="space-y-1">
            {selectedCities.map((city, i) => (
              <div key={city.id} className="flex items-center gap-2 text-sm">
                <span className="w-5 h-5 rounded-full bg-accent text-white text-xs flex items-center justify-center font-bold">
                  {i + 1}
                </span>
                <span>{city.emoji} {city.name}</span>
                <div className="flex gap-1 ml-auto">
                  <button
                    type="button"
                    onClick={() => moveCity(i, -1)}
                    disabled={i === 0}
                    className="w-6 h-6 rounded bg-input border border-border text-xs disabled:opacity-30 hover:border-accent transition-colors cursor-pointer"
                  >
                    ▲
                  </button>
                  <button
                    type="button"
                    onClick={() => moveCity(i, 1)}
                    disabled={i === selectedCities.length - 1}
                    className="w-6 h-6 rounded bg-input border border-border text-xs disabled:opacity-30 hover:border-accent transition-colors cursor-pointer"
                  >
                    ▼
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Preferencias */}
      <div>
        <label className="block text-sm font-medium text-muted mb-2">Preferencias</label>
        <div className="flex flex-wrap gap-2">
          {PREFERENCES.map((pref) => (
            <button
              key={pref.id}
              type="button"
              onClick={() => togglePreference(pref.id)}
              className={`px-3 py-2 rounded-full border text-sm transition-all cursor-pointer ${
                preferences.includes(pref.id)
                  ? "bg-accent/15 border-accent text-accent"
                  : "bg-input border-border text-muted hover:border-muted"
              }`}
            >
              {pref.label}
            </button>
          ))}
        </div>
        {errors.preferences && <p className="text-red text-xs mt-1">{errors.preferences}</p>}
      </div>

      {/* Notas */}
      <div>
        <label className="block text-sm font-medium text-muted mb-1">
          {mode === "client" ? "Notas adicionales" : "Notas adicionales"}
        </label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={3}
          className="w-full bg-input border border-border rounded-lg px-4 py-2.5 text-text focus:outline-none focus:border-accent transition-colors resize-none"
          placeholder={
            mode === "client"
              ? "Ej: Viajamos con niños pequeños, preferimos hoteles céntricos..."
              : "Ej: El cliente prefiere no caminar mucho, viaja con niños pequeños..."
          }
        />
      </div>

      {/* Submit */}
      <button
        type="submit"
        className="w-full bg-accent hover:bg-accent/90 text-white font-semibold py-3 rounded-lg transition-colors text-lg cursor-pointer"
      >
        {submitLabel || (mode === "client" ? "Enviar Solicitud" : "Generar Propuestas de Ruta")}
      </button>
    </form>
  );
}
