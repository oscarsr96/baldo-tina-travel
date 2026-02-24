import { cities } from "../data/cities";

// Normaliza highlights: si son strings (datos legacy), los convierte a objetos
function normalizeHighlight(h, index) {
  if (typeof h === "string") {
    return {
      name: h,
      photo: null,
      description: "",
      duration: "2h",
      type: "cultura",
      timeOfDay: index % 2 === 0 ? "morning" : "afternoon",
    };
  }
  return h;
}

// Puntúa un highlight según las preferencias del usuario
function scoreHighlight(highlight, preferences) {
  let score = 1;
  if (preferences.includes(highlight.type)) score += 2;
  return score;
}

// Distribuye items en N buckets con round-robin
function distribute(items, buckets) {
  const result = Array.from({ length: buckets }, () => []);
  items.forEach((item, i) => {
    result[i % buckets].push(item);
  });
  return result;
}

// Filtra foodSpots por tier (priceRange)
function filterFoodByTier(foodSpots, tier) {
  const tierPriority = {
    budget: ["budget", "mid"],
    mid: ["mid", "budget", "premium"],
    premium: ["premium", "mid"],
  };
  const priorities = tierPriority[tier] || ["mid", "budget", "premium"];

  // Ordena por prioridad del tier
  return [...foodSpots].sort((a, b) => {
    const aIdx = priorities.indexOf(a.priceRange);
    const bIdx = priorities.indexOf(b.priceRange);
    return (aIdx === -1 ? 99 : aIdx) - (bIdx === -1 ? 99 : bIdx);
  });
}

/**
 * Genera un itinerario día a día para una ciudad.
 *
 * @param {object} cityData - Datos de la ciudad (del route generator o directos)
 * @param {number} nights - Número de noches en la ciudad
 * @param {string[]} preferences - IDs de preferencias del usuario
 * @param {string} tier - "budget" | "mid" | "premium"
 * @returns {object[]} Array de días con morning, afternoon, lunch, evening
 */
export function buildItinerary(cityData, nights, preferences = [], tier = "mid") {
  const days = Math.max(1, nights);

  // Normalizar highlights
  const rawHighlights = cityData.highlights || [];
  const highlights = rawHighlights.map(normalizeHighlight);

  // Obtener foodSpots y eveningIdeas (fallback al catálogo de cities.js)
  const catalogCity = cities[cityData.cityId] || {};
  const foodSpots = cityData.foodSpots?.length
    ? cityData.foodSpots
    : catalogCity.foodSpots || [];
  const eveningIdeas = cityData.eveningIdeas?.length
    ? cityData.eveningIdeas
    : catalogCity.eveningIdeas || [];

  // Puntuar y ordenar highlights por afinidad
  const scored = highlights
    .map((h) => ({ ...h, _score: scoreHighlight(h, preferences) }))
    .sort((a, b) => b._score - a._score);

  // Separar por timeOfDay
  const morningPool = scored.filter((h) => h.timeOfDay === "morning" || h.timeOfDay === "any");
  const afternoonPool = scored.filter((h) => h.timeOfDay === "afternoon" || h.timeOfDay === "any");

  // Distribuir entre días
  const morningDist = distribute(morningPool, days);
  const afternoonDist = distribute(afternoonPool, days);

  // Filtrar y distribuir food
  const sortedFood = filterFoodByTier(foodSpots, tier);
  const foodDist = distribute(sortedFood, days);

  // Distribuir eveningIdeas priorizando las que coinciden con preferencias
  const sortedEvening = [...eveningIdeas].sort((a, b) => {
    const aMatch = preferences.includes(a.type) ? 0 : 1;
    const bMatch = preferences.includes(b.type) ? 0 : 1;
    return aMatch - bMatch;
  });
  const eveningDist = distribute(sortedEvening, days);

  // Construir días
  const itinerary = [];
  for (let d = 0; d < days; d++) {
    // Seleccionar actividad principal de mañana (la de mayor score)
    const morningActivities = morningDist[d] || [];
    const afternoonActivities = afternoonDist[d] || [];

    // Si un slot queda vacío, mover del otro
    const morning = morningActivities[0] || afternoonActivities[1] || null;
    const afternoon = afternoonActivities[0] || morningActivities[1] || null;

    itinerary.push({
      dayNumber: d + 1,
      morning,
      afternoon,
      lunch: foodDist[d]?.[0] || null,
      evening: eveningDist[d]?.[0] || null,
    });
  }

  return itinerary;
}
