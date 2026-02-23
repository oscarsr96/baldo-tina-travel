import { Link } from "react-router-dom";
import { cityList } from "../../data/cities";

const STEPS = [
  {
    icon: "📝",
    title: "Contanos tu viaje",
    desc: "Elegí tus ciudades, días y presupuesto. Nosotros hacemos el resto.",
  },
  {
    icon: "✨",
    title: "Recibí propuestas",
    desc: "Nuestro equipo diseña 3 rutas personalizadas: económica, equilibrada y premium.",
  },
  {
    icon: "✈️",
    title: "Viajá tranquilo",
    desc: "Descargá tu itinerario en PDF y disfrutá de tu aventura europea.",
  },
];

export default function LandingPage() {
  return (
    <div>
      {/* Hero */}
      <section className="py-20 px-4 text-center">
        <div className="max-w-[700px] mx-auto">
          <h2 className="text-4xl sm:text-5xl font-bold text-text leading-tight mb-4">
            Tu aventura europea,{" "}
            <span className="text-accent">diseñada a medida</span>
          </h2>
          <p className="text-lg text-muted mb-8 max-w-[500px] mx-auto">
            Planificamos tu ruta perfecta por Europa. Vos elegís las ciudades,
            nosotros armamos las propuestas.
          </p>
          <Link
            to="/registro"
            className="inline-block bg-accent hover:bg-accent/90 text-white font-semibold px-8 py-4 rounded-xl text-lg transition-colors"
          >
            Empezar ahora
          </Link>
        </div>
      </section>

      {/* Cómo funciona */}
      <section className="py-16 px-4 bg-card border-y border-border">
        <div className="max-w-[900px] mx-auto">
          <h3 className="text-2xl font-bold text-text text-center mb-10">
            Cómo funciona
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {STEPS.map((step, i) => (
              <div key={i} className="text-center">
                <div className="text-4xl mb-3">{step.icon}</div>
                <div className="text-xs text-accent font-semibold mb-1">
                  Paso {i + 1}
                </div>
                <h4 className="text-lg font-bold text-text mb-2">
                  {step.title}
                </h4>
                <p className="text-sm text-muted">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Ciudades */}
      <section className="py-16 px-4">
        <div className="max-w-[900px] mx-auto">
          <h3 className="text-2xl font-bold text-text text-center mb-2">
            Ciudades disponibles
          </h3>
          <p className="text-muted text-center text-sm mb-8">
            Elegí entre 10 destinos europeos increíbles
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
            {cityList.map((city) => (
              <div
                key={city.id}
                className="bg-card border border-border rounded-xl p-4 text-center hover:border-accent/50 transition-colors"
              >
                <span className="text-3xl block mb-2">{city.emoji}</span>
                <p className="font-semibold text-text text-sm">{city.name}</p>
                <p className="text-xs text-muted">{city.country}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA final */}
      <section className="py-16 px-4 bg-accent/5">
        <div className="max-w-[600px] mx-auto text-center">
          <h3 className="text-2xl font-bold text-text mb-3">
            ¿Listo para planificar tu viaje?
          </h3>
          <p className="text-muted mb-6">
            Creá tu cuenta gratis y envianos tu primera solicitud de viaje.
          </p>
          <Link
            to="/registro"
            className="inline-block bg-accent hover:bg-accent/90 text-white font-semibold px-8 py-4 rounded-xl text-lg transition-colors"
          >
            Crear cuenta gratis
          </Link>
        </div>
      </section>
    </div>
  );
}
