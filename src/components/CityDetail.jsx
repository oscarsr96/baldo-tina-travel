export default function CityDetail({ city }) {
  return (
    <div className="bg-input/50 border border-border rounded-lg p-4">
      <div className="flex items-center justify-between mb-3">
        <h5 className="text-base font-bold text-text">
          {city.emoji} {city.name}
          <span className="text-muted font-normal text-sm ml-2">
            {city.nights} noche{city.nights > 1 ? "s" : ""}
          </span>
        </h5>
        <span className="text-accent font-bold">€{city.subtotal}</span>
      </div>

      <div className="grid grid-cols-3 gap-3 text-sm mb-3">
        <div className="bg-card rounded-lg p-2.5">
          <p className="text-muted text-xs mb-1">Alojamiento</p>
          <p className="text-text font-medium">{city.accommodation.type}</p>
          <p className="text-muted text-xs">€{city.accommodation.perNight}/noche</p>
          <p className="text-accent font-semibold text-xs">Total: €{city.accommodation.total}</p>
        </div>
        <div className="bg-card rounded-lg p-2.5">
          <p className="text-muted text-xs mb-1">Comida</p>
          <p className="text-muted text-xs">€{city.food.perDay}/día</p>
          <p className="text-accent font-semibold text-xs">Total: €{city.food.total}</p>
        </div>
        <div className="bg-card rounded-lg p-2.5">
          <p className="text-muted text-xs mb-1">Transporte local</p>
          <p className="text-muted text-xs">€{city.localTransport.perDay}/día</p>
          <p className="text-accent font-semibold text-xs">Total: €{city.localTransport.total}</p>
        </div>
      </div>

      {/* Highlights */}
      <div className="mb-2">
        <p className="text-xs font-semibold text-muted uppercase tracking-wider mb-1">Qué ver</p>
        <div className="flex flex-wrap gap-1">
          {city.highlights.map((h) => (
            <span key={h} className="px-2 py-0.5 bg-accent/10 text-accent text-xs rounded-full">
              {h}
            </span>
          ))}
        </div>
      </div>

      {/* Zonas recomendadas */}
      {city.recommendedZones.length > 0 && (
        <div className="mb-2">
          <p className="text-xs font-semibold text-green uppercase tracking-wider mb-1">Zonas recomendadas</p>
          <div className="flex flex-wrap gap-1">
            {city.recommendedZones.map((z) => (
              <span key={z} className="px-2 py-0.5 bg-green/10 text-green text-xs rounded-full">
                {z}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Zonas a evitar */}
      {city.avoidZones.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-red uppercase tracking-wider mb-1">Zonas turísticas a evitar</p>
          <div className="flex flex-wrap gap-1">
            {city.avoidZones.map((z) => (
              <span key={z} className="px-2 py-0.5 bg-red/10 text-red text-xs rounded-full">
                {z}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
