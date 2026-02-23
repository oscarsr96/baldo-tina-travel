import { useState, useRef } from "react";
import TripForm from "./components/TripForm";
import RouteCard from "./components/RouteCard";
import { generateRoutes } from "./utils/routeGenerator";

export default function App() {
  const [routes, setRoutes] = useState(null);
  const [formData, setFormData] = useState(null);
  const resultsRef = useRef(null);

  const handleSubmit = (data) => {
    const generated = generateRoutes(data);
    setRoutes(generated);
    setFormData(data);
    setTimeout(() => {
      resultsRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  };

  const handleReset = () => {
    setRoutes(null);
    setFormData(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-bg">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-[900px] mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-accent">Baldo & Tina Travel</h1>
            <p className="text-xs text-muted">Simulador de Rutas Europeas</p>
          </div>
          {routes && (
            <button
              onClick={handleReset}
              className="text-sm text-muted hover:text-accent transition-colors cursor-pointer"
            >
              ← Nueva simulación
            </button>
          )}
        </div>
      </header>

      {/* Main */}
      <main className="max-w-[900px] mx-auto px-4 py-8">
        {/* Formulario */}
        <div className="bg-card border border-border rounded-xl p-6 mb-8">
          <TripForm onSubmit={handleSubmit} />
        </div>

        {/* Resultados */}
        {routes && formData && (
          <div ref={resultsRef} className="space-y-6">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-text">
                Propuestas para <span className="text-accent">{formData.clientName}</span>
              </h2>
              <p className="text-muted text-sm mt-1">
                {formData.travelers} viajero{formData.travelers > 1 ? "s" : ""} · {formData.totalDays} días ·
                Presupuesto: €{formData.budget.toLocaleString()}/persona
              </p>
            </div>

            {routes.map((route) => (
              <RouteCard key={route.tier} route={route} formData={formData} />
            ))}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-border mt-12 py-6 text-center text-xs text-muted">
        Baldo & Tina Travel · Simulador de rutas · Los precios son orientativos
      </footer>
    </div>
  );
}
