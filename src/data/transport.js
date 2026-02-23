// Transporte entre ciudades europeas (ida, €/persona)
// { bus, train, flight } — null = no disponible
const routes = {
  "madrid-barcelona":  { bus: 20,   train: 45,   flight: 35 },
  "madrid-roma":       { bus: null,  train: null,  flight: 45 },
  "madrid-paris":      { bus: 50,   train: 90,   flight: 50 },
  "madrid-londres":    { bus: null,  train: null,  flight: 55 },
  "madrid-amsterdam":  { bus: null,  train: null,  flight: 50 },
  "madrid-berlin":     { bus: null,  train: null,  flight: 50 },
  "madrid-lisboa":     { bus: 25,   train: 40,   flight: 35 },
  "madrid-praga":      { bus: null,  train: null,  flight: 50 },
  "madrid-viena":      { bus: null,  train: null,  flight: 50 },
  "barcelona-roma":    { bus: null,  train: null,  flight: 40 },
  "barcelona-paris":   { bus: 40,   train: 70,   flight: 40 },
  "barcelona-londres": { bus: null,  train: null,  flight: 50 },
  "barcelona-amsterdam":{ bus: null, train: null,  flight: 45 },
  "roma-paris":        { bus: null,  train: null,  flight: 50 },
  "roma-londres":      { bus: null,  train: null,  flight: 55 },
  "roma-amsterdam":    { bus: null,  train: null,  flight: 50 },
  "roma-berlin":       { bus: null,  train: null,  flight: 45 },
  "paris-londres":     { bus: 25,   train: 60,   flight: 50 },
  "paris-amsterdam":   { bus: 20,   train: 45,   flight: 45 },
  "paris-berlin":      { bus: 35,   train: 80,   flight: 45 },
  "paris-praga":       { bus: 35,   train: null,  flight: 50 },
  "londres-amsterdam": { bus: 30,   train: 50,   flight: 45 },
  "londres-berlin":    { bus: null,  train: null,  flight: 50 },
  "amsterdam-berlin":  { bus: 20,   train: 40,   flight: 40 },
  "amsterdam-praga":   { bus: 25,   train: null,  flight: 45 },
  "berlin-praga":      { bus: 15,   train: 30,   flight: 40 },
  "berlin-viena":      { bus: 20,   train: 35,   flight: 40 },
  "praga-viena":       { bus: 12,   train: 25,   flight: 40 },
  "lisboa-paris":      { bus: null,  train: null,  flight: 45 },
  "lisboa-londres":    { bus: null,  train: null,  flight: 50 },
};

const DEFAULT_FLIGHT = 55;

// Busca la ruta en ambas direcciones
export function getTransportOptions(cityA, cityB) {
  const key1 = `${cityA}-${cityB}`;
  const key2 = `${cityB}-${cityA}`;
  return routes[key1] || routes[key2] || { bus: null, train: null, flight: DEFAULT_FLIGHT };
}

// Obtiene el coste y modo de transporte según el tier
export function getTransportForTier(cityA, cityB, tier) {
  const options = getTransportOptions(cityA, cityB);

  if (tier === "budget") {
    // Bus si disponible, si no vuelo low-cost
    if (options.bus !== null) return { cost: options.bus, mode: "Bus" };
    return { cost: options.flight ?? DEFAULT_FLIGHT, mode: "Vuelo low-cost" };
  }

  if (tier === "mid") {
    // Tren si disponible, si no vuelo
    if (options.train !== null) return { cost: options.train, mode: "Tren" };
    return { cost: options.flight ?? DEFAULT_FLIGHT, mode: "Vuelo" };
  }

  // premium — siempre vuelo
  return { cost: options.flight ?? DEFAULT_FLIGHT, mode: "Vuelo" };
}
