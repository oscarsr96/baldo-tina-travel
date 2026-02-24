import { cities } from "../data/cities";
import { buenosAiresFlights } from "../data/flights";
import { getTransportForTier } from "../data/transport";

const TIER_LABELS = {
  budget: "Económica",
  mid: "Equilibrada",
  premium: "Premium",
};

const ACCOMMODATION_LABELS = {
  budget: "Hostal / Airbnb compartido",
  mid: "Hotel 3★ céntrico",
  premium: "Hotel boutique 4★",
};

// Reparte los días entre las ciudades
function distributeDays(totalDays, numCities) {
  const base = Math.floor(totalDays / numCities);
  const remainder = totalDays % numCities;
  return Array.from({ length: numCities }, (_, i) => base + (i < remainder ? 1 : 0));
}

// Determina zonas recomendadas según preferencias
function getZoneRecommendations(city, preferences) {
  const prefersQuiet = preferences.includes("tranquilo");
  const prefersLively = preferences.includes("animado");

  if (prefersQuiet) {
    return {
      recommended: city.quietZones,
      avoid: city.touristyZones,
    };
  }

  if (prefersLively) {
    return {
      recommended: [...city.quietZones.slice(0, 2), ...city.touristyZones],
      avoid: [],
    };
  }

  // Por defecto: highlights + zonas tranquilas principales
  return {
    recommended: city.quietZones.slice(0, 3),
    avoid: city.touristyZones.slice(0, 2),
  };
}

// Genera una ruta para un tier específico
function generateRoute(tier, selectedCityIds, totalDays, preferences, travelers) {
  const numCities = selectedCityIds.length;
  const daysPerCity = distributeDays(totalDays, numCities);

  // Primera ciudad = entrada, última = salida
  const firstCityId = selectedCityIds[0];
  const lastCityId = selectedCityIds[selectedCityIds.length - 1];

  // Vuelo ida BsAs → primera ciudad
  const flightIn = buenosAiresFlights[firstCityId]?.[tier] ?? 450;
  // Vuelo vuelta última ciudad → BsAs
  const flightOut = buenosAiresFlights[lastCityId]?.[tier] ?? 450;

  // Segmentos de transporte entre ciudades
  const segments = [];
  for (let i = 0; i < numCities - 1; i++) {
    const from = selectedCityIds[i];
    const to = selectedCityIds[i + 1];
    const transport = getTransportForTier(from, to, tier);
    segments.push({
      from: cities[from].name,
      to: cities[to].name,
      mode: transport.mode,
      cost: transport.cost,
    });
  }

  // Detalle por ciudad
  const cityDetails = selectedCityIds.map((cityId, i) => {
    const city = cities[cityId];
    const nights = daysPerCity[i];
    const accCostPerNight = city.accommodation[tier];
    const foodCostPerDay = city.dailyFood[tier];
    const transportCostPerDay = city.localTransport[tier];
    const zones = getZoneRecommendations(city, preferences);

    return {
      cityId,
      name: city.name,
      emoji: city.emoji,
      country: city.country,
      photo: city.photo || null,
      nights,
      accommodation: {
        type: ACCOMMODATION_LABELS[tier],
        perNight: accCostPerNight,
        total: accCostPerNight * nights,
      },
      food: {
        perDay: foodCostPerDay,
        total: foodCostPerDay * nights,
      },
      localTransport: {
        perDay: transportCostPerDay,
        total: transportCostPerDay * nights,
      },
      highlights: city.highlights,
      foodSpots: city.foodSpots || [],
      eveningIdeas: city.eveningIdeas || [],
      recommendedZones: zones.recommended,
      avoidZones: zones.avoid,
      subtotal: (accCostPerNight + foodCostPerDay + transportCostPerDay) * nights,
    };
  });

  // Totales
  const totalAccommodation = cityDetails.reduce((s, c) => s + c.accommodation.total, 0);
  const totalFood = cityDetails.reduce((s, c) => s + c.food.total, 0);
  const totalLocalTransport = cityDetails.reduce((s, c) => s + c.localTransport.total, 0);
  const totalInterCityTransport = segments.reduce((s, seg) => s + seg.cost, 0);
  const totalTransport = flightIn + flightOut + totalInterCityTransport + totalLocalTransport;
  const totalPerPerson = totalAccommodation + totalFood + totalTransport;
  const totalGroup = totalPerPerson * travelers;

  // Ruta visual
  const routeVisual = [
    "Buenos Aires",
    ...selectedCityIds.map((id) => cities[id].name),
    "Buenos Aires",
  ].join(" → ");

  return {
    tier,
    label: TIER_LABELS[tier],
    routeVisual,
    flightIn: { city: cities[firstCityId].name, cost: flightIn },
    flightOut: { city: cities[lastCityId].name, cost: flightOut },
    segments,
    cityDetails,
    costs: {
      accommodation: totalAccommodation,
      food: totalFood,
      localTransport: totalLocalTransport,
      interCityTransport: totalInterCityTransport,
      flights: flightIn + flightOut,
      totalPerPerson,
      totalGroup,
    },
  };
}

// Genera las 3 rutas
export function generateRoutes(formData) {
  const { selectedCities, totalDays, preferences, travelers } = formData;
  const cityIds = selectedCities.map((c) => c.id);

  return ["budget", "mid", "premium"].map((tier) =>
    generateRoute(tier, cityIds, totalDays, preferences, travelers)
  );
}
