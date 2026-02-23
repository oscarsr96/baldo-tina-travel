# Simulador de Rutas - Especificación Técnica

## Visión General

Aplicación web para una agencia de viajes boutique que organiza viajes desde Argentina a Europa. La administradora (la dueña del negocio) introduce los datos del cliente y el simulador genera 3 propuestas de ruta con diferentes niveles de presupuesto. Luego puede exportar cada propuesta como PDF para enviar al cliente.

---

## Stack Tecnológico Recomendado

- **Frontend**: React (single-file `.jsx` o proyecto Vite)
- **Estilos**: Tailwind CSS o CSS-in-JS
- **PDF**: html2pdf.js, jsPDF o react-pdf
- **Estado**: useState/useReducer (no necesita backend por ahora)
- **Datos**: JSON estático embebido (sin APIs externas en el MVP)

---

## Estructura de la App

### Pantalla 1: Formulario de Entrada (Admin)

La admin completa los datos del cliente:

#### Campos del formulario:

| Campo | Tipo | Validación |
|-------|------|-----------|
| Nombre del cliente | texto | requerido |
| Número de viajeros | número (1-10) | requerido |
| Ciudades a visitar | selector múltiple con orden | mínimo 2 ciudades |
| Días totales del viaje | número (3-30) | requerido |
| Presupuesto por persona (€) | número | requerido |
| Preferencias | multi-select chips | al menos 1 |
| Notas adicionales | textarea | opcional |

#### Selector de ciudades
- Las ciudades se seleccionan con click y se numeran automáticamente (1, 2, 3...) para definir el orden de la ruta
- Se debe poder reordenar con flechas ▲▼
- Mostrar la ruta visual: `Buenos Aires → Madrid → Roma → Londres → Buenos Aires`

#### Opciones de preferencias (chips seleccionables):
- 🌿 Ambiente tranquilo
- 🎉 Ambiente animado
- 🎨 Museos y cultura
- 🍷 Gastronomía
- 🌳 Naturaleza y parques
- 🌙 Vida nocturna

### Pantalla 2: Resultados (3 Rutas)

Se generan 3 propuestas:

1. **Ruta Económica** — Hostales, buses, comida callejera
2. **Ruta Equilibrada** — Hoteles 3★, trenes, restaurantes locales
3. **Ruta Premium** — Hoteles boutique 4★, vuelos internos, experiencias gastronómicas

Cada ruta muestra:
- Resumen con coste total por persona y por grupo
- Indicador visual de si está dentro del presupuesto (verde ✓ / rojo ✗)
- Desglose por ciudad expandible
- Segmentos de transporte entre ciudades
- Zonas recomendadas vs zonas a evitar (según preferencias)

### Pantalla 3: Detalle de Ruta (expandido)

Para cada ruta, al expandir se ve por ciudad:
- Nombre de la ciudad + bandera/emoji del país
- Noches asignadas
- Tipo y coste de alojamiento (por noche y total)
- Coste de comida diario y total
- Transporte local diario y total
- Highlights / qué ver
- Zonas recomendadas según perfil del viajero
- Zonas turísticas a evitar (si prefiere tranquilidad)

### Funcionalidad: Exportar a PDF

Botón por cada ruta para generar un PDF con:
- Logo / cabecera de la agencia (placeholder configurable)
- Nombre del cliente y datos del viaje
- Ruta completa con desglose
- Tabla resumen de costes
- Sección de "Recomendaciones personalizadas" (vacía, para que la admin la rellene manualmente o se añada después)
- Pie de página con datos de contacto (placeholder)

---

## Base de Datos de Ciudades (JSON estático)

### Ciudades incluidas en el MVP:

```
madrid, barcelona, roma, paris, londres, amsterdam, berlin, lisboa, praga, viena
```

### Estructura por ciudad:

```json
{
  "madrid": {
    "name": "Madrid",
    "country": "España",
    "emoji": "🇪🇸",
    "accommodation": {
      "budget": 35,
      "mid": 70,
      "premium": 130
    },
    "dailyFood": {
      "budget": 25,
      "mid": 45,
      "premium": 80
    },
    "localTransport": {
      "budget": 5,
      "mid": 10,
      "premium": 20
    },
    "highlights": [
      "Museo del Prado",
      "Retiro Park",
      "Barrio de las Letras",
      "Mercado de San Miguel"
    ],
    "quietZones": [
      "Malasaña",
      "La Latina",
      "Lavapiés",
      "Chamberí"
    ],
    "touristyZones": [
      "Sol",
      "Gran Vía",
      "Plaza Mayor"
    ]
  }
}
```

### Datos completos de todas las ciudades:

| Ciudad | País | Alojamiento (€/noche) | Comida (€/día) | Transporte local (€/día) |
|--------|------|----------------------|----------------|-------------------------|
| | | budget / mid / premium | budget / mid / premium | budget / mid / premium |
| Madrid | 🇪🇸 España | 35 / 70 / 130 | 25 / 45 / 80 | 5 / 10 / 20 |
| Barcelona | 🇪🇸 España | 38 / 75 / 140 | 25 / 45 / 85 | 5 / 10 / 18 |
| Roma | 🇮🇹 Italia | 40 / 80 / 150 | 22 / 40 / 75 | 5 / 8 / 18 |
| París | 🇫🇷 Francia | 45 / 90 / 170 | 28 / 50 / 90 | 6 / 12 / 22 |
| Londres | 🇬🇧 Reino Unido | 50 / 95 / 180 | 30 / 50 / 90 | 8 / 15 / 25 |
| Ámsterdam | 🇳🇱 Países Bajos | 42 / 85 / 160 | 25 / 45 / 80 | 4 / 8 / 15 |
| Berlín | 🇩🇪 Alemania | 30 / 65 / 130 | 20 / 38 / 70 | 4 / 8 / 15 |
| Lisboa | 🇵🇹 Portugal | 30 / 60 / 120 | 18 / 35 / 65 | 4 / 7 / 14 |
| Praga | 🇨🇿 Rep. Checa | 25 / 55 / 110 | 15 / 30 / 55 | 3 / 6 / 12 |
| Viena | 🇦🇹 Austria | 35 / 70 / 140 | 22 / 40 / 75 | 4 / 8 / 15 |

### Highlights y zonas por ciudad:

#### Madrid
- **Highlights**: Museo del Prado, Retiro Park, Barrio de las Letras, Mercado de San Miguel
- **Zonas tranquilas**: Malasaña, La Latina, Lavapiés, Chamberí
- **Zonas turísticas**: Sol, Gran Vía, Plaza Mayor

#### Barcelona
- **Highlights**: Sagrada Familia, Park Güell, Barrio Gótico, La Barceloneta
- **Zonas tranquilas**: Gràcia, Poble Sec, Sant Antoni, El Born
- **Zonas turísticas**: Las Ramblas, Plaza Catalunya, Barceloneta en verano

#### Roma
- **Highlights**: Coliseo, Vaticano, Trastevere, Panteón
- **Zonas tranquilas**: Trastevere, Testaccio, Monti, Pigneto
- **Zonas turísticas**: Fontana di Trevi, Piazza Navona, Vaticano (colas)

#### París
- **Highlights**: Tour Eiffel, Louvre, Montmartre, Le Marais
- **Zonas tranquilas**: Canal Saint-Martin, Buttes-Chaumont, Belleville, Batignolles
- **Zonas turísticas**: Champs-Élysées, Trocadéro, Notre-Dame zona

#### Londres
- **Highlights**: British Museum, Tower Bridge, Camden, Hyde Park
- **Zonas tranquilas**: Notting Hill, Greenwich, Hampstead, Bermondsey
- **Zonas turísticas**: Piccadilly Circus, Oxford Street, Westminster

#### Ámsterdam
- **Highlights**: Rijksmuseum, Anne Frank Huis, Vondelpark, Jordaan
- **Zonas tranquilas**: Jordaan, De Pijp, Oud-West, Plantage
- **Zonas turísticas**: Red Light District, Dam Square, Leidseplein

#### Berlín
- **Highlights**: Puerta de Brandeburgo, East Side Gallery, Isla de los Museos, Tiergarten
- **Zonas tranquilas**: Kreuzberg, Prenzlauer Berg, Friedrichshain, Neukölln
- **Zonas turísticas**: Checkpoint Charlie, Alexanderplatz

#### Lisboa
- **Highlights**: Torre de Belém, Alfama, Barrio Alto, Pastéis de Belém
- **Zonas tranquilas**: Alfama (mañanas), Príncipe Real, Estrela, Graça
- **Zonas turísticas**: Praça do Comércio, Rua Augusta, Belém (fines de semana)

#### Praga
- **Highlights**: Puente de Carlos, Castillo de Praga, Plaza de la Ciudad Vieja, Malá Strana
- **Zonas tranquilas**: Vinohrady, Žižkov, Letná, Karlín
- **Zonas turísticas**: Puente de Carlos (mediodía), Plaza del Reloj, Calle Karlova

#### Viena
- **Highlights**: Palacio de Schönbrunn, Ópera Estatal, MuseumsQuartier, Naschmarkt
- **Zonas tranquilas**: Neubau (7° distrito), Josefstadt, Spittelberg, Freihausviertel
- **Zonas turísticas**: Stephansplatz, Graben, Kärntner Straße

---

## Vuelos Buenos Aires ↔ Europa (ida, €/persona)

| Destino | Budget | Mid | Premium |
|---------|--------|-----|---------|
| Madrid | 380 | 550 | 850 |
| Barcelona | 400 | 580 | 880 |
| Roma | 420 | 600 | 900 |
| París | 410 | 590 | 890 |
| Londres | 430 | 620 | 950 |
| Ámsterdam | 420 | 600 | 900 |
| Berlín | 410 | 580 | 870 |
| Lisboa | 370 | 540 | 830 |
| Praga | 430 | 610 | 910 |
| Viena | 420 | 600 | 890 |

## Transporte entre ciudades europeas (ida, €/persona)

Formato: bus / tren / vuelo. `null` = no disponible esa opción.

| Ruta | Bus | Tren | Vuelo |
|------|-----|------|-------|
| Madrid ↔ Barcelona | 20 | 45 | 35 |
| Madrid ↔ Roma | — | — | 45 |
| Madrid ↔ París | 50 | 90 | 50 |
| Madrid ↔ Londres | — | — | 55 |
| Madrid ↔ Ámsterdam | — | — | 50 |
| Madrid ↔ Berlín | — | — | 50 |
| Madrid ↔ Lisboa | 25 | 40 | 35 |
| Madrid ↔ Praga | — | — | 50 |
| Madrid ↔ Viena | — | — | 50 |
| Barcelona ↔ Roma | — | — | 40 |
| Barcelona ↔ París | 40 | 70 | 40 |
| Barcelona ↔ Londres | — | — | 50 |
| Barcelona ↔ Ámsterdam | — | — | 45 |
| Roma ↔ París | — | — | 50 |
| Roma ↔ Londres | — | — | 55 |
| Roma ↔ Ámsterdam | — | — | 50 |
| Roma ↔ Berlín | — | — | 45 |
| París ↔ Londres | 25 | 60 | 50 |
| París ↔ Ámsterdam | 20 | 45 | 45 |
| París ↔ Berlín | 35 | 80 | 45 |
| París ↔ Praga | 35 | — | 50 |
| Londres ↔ Ámsterdam | 30 | 50 | 45 |
| Londres ↔ Berlín | — | — | 50 |
| Ámsterdam ↔ Berlín | 20 | 40 | 40 |
| Ámsterdam ↔ Praga | 25 | — | 45 |
| Berlín ↔ Praga | 15 | 30 | 40 |
| Berlín ↔ Viena | 20 | 35 | 40 |
| Praga ↔ Viena | 12 | 25 | 40 |
| Lisboa ↔ París | — | — | 45 |
| Lisboa ↔ Londres | — | — | 50 |

Para rutas no listadas, usar €55 (vuelo low-cost por defecto).

---

## Lógica de Generación de Rutas

### Distribución de días
Los días totales se reparten entre las ciudades seleccionadas:
```
base = floor(totalDays / numCities)
remainder = totalDays % numCities
// Los primeros 'remainder' ciudades reciben 1 día extra
```

### Modo de transporte por tier
| Tier | Transporte entre ciudades |
|------|--------------------------|
| Budget | Bus (si disponible, si no vuelo low-cost) |
| Mid | Tren (si disponible, si no vuelo) |
| Premium | Vuelo siempre |

### Tipos de alojamiento por tier
| Tier | Alojamiento |
|------|------------|
| Budget | Hostal / Airbnb compartido |
| Mid | Hotel 3★ céntrico |
| Premium | Hotel boutique 4★ |

### Cálculo de costes por persona
```
coste_ciudad = (alojamiento_noche × noches) + (comida_día × noches) + (transporte_local × noches)
coste_transporte = vuelo_ida_BsAs + sum(transporte_entre_ciudades) + vuelo_vuelta_BsAs
total_por_persona = sum(coste_ciudad) + coste_transporte
```

### Zonas recomendadas
- Si el viajero prefiere "tranquilo" → mostrar `quietZones`, marcar `touristyZones` como "a evitar"
- Si prefiere "animado" → mezclar ambas
- Por defecto → mostrar highlights + quietZones principales

---

## Diseño UI

### Estética recomendada
- **Tema oscuro** con acentos cálidos (coral/terracota: `#E8996A`)
- Tipografía limpia (DM Sans, Outfit, o similar)
- Cards con bordes suaves y sombras sutiles
- Indicadores de color para presupuesto:
  - Verde (`#6BCB8B`) = dentro del presupuesto
  - Rojo (`#E87070`) = excede presupuesto
  - Azul (`#6BA3E8`) = tier medio
- Animaciones suaves al expandir/colapsar secciones

### Paleta de colores sugerida
```
Background:     #0F1117
Cards:          #1A1D27
Accent:         #E8996A
Green:          #6BCB8B
Red:            #E87070
Blue:           #6BA3E8
Text:           #E8E6E1
Text muted:     #8B8D97
Border:         #2A2D3A
Input bg:       #14161E
```

### Layout
- Una sola columna centrada, max-width ~900px
- Formulario arriba → resultados abajo
- Las 3 rutas se muestran como cards colapsables
- Cada card tiene un botón "Exportar PDF"

---

## Estructura del PDF exportado

```
┌─────────────────────────────────────────┐
│  [LOGO PLACEHOLDER]                     │
│  Nombre de la agencia                   │
│─────────────────────────────────────────│
│  Propuesta de viaje para: [CLIENTE]     │
│  Fecha: [fecha generación]              │
│  Viajeros: [N]  |  Días: [N]           │
│─────────────────────────────────────────│
│  RUTA: [Económica/Equilibrada/Premium]  │
│                                         │
│  Itinerario:                            │
│  Buenos Aires → Madrid (vuelo) → ...    │
│                                         │
│  ── Madrid (3 noches) ──                │
│  Alojamiento: Hostal — €35/noche        │
│  Comida: €25/día                        │
│  Transporte local: €5/día               │
│  Qué ver: Prado, Retiro...             │
│  Zonas recomendadas: Malasaña, La Latina│
│                                         │
│  ── Roma (4 noches) ──                  │
│  ...                                    │
│                                         │
│  ═══ RESUMEN DE COSTES ═══             │
│  Transporte total: €XXX                 │
│  Alojamiento total: €XXX               │
│  Comida total: €XXX                     │
│  ─────────────────────                  │
│  TOTAL por persona: €XXXX               │
│  TOTAL grupo (N pers.): €XXXX          │
│                                         │
│  ── Recomendaciones personalizadas ──   │
│  [Espacio en blanco para que la admin   │
│   añada sus notas personales]           │
│                                         │
│─────────────────────────────────────────│
│  Contacto: [placeholder]                │
│  Email: [placeholder]  | Tel: [placeholder]
└─────────────────────────────────────────┘
```

---

## Próximas iteraciones (fuera del MVP)

- **Integración con Amadeus API** para precios reales de vuelos
- **Integración con Booking Affiliate API** para precios de alojamiento
- **Login de admin** con contraseña
- **Base de datos** para guardar propuestas generadas
- **Campo de notas personalizadas** editable antes de exportar PDF
- **Envío directo por email** del PDF al cliente
- **Más ciudades** (Florencia, Sevilla, Edimburgo, Dubrovnik, etc.)
- **Estacionalidad** — ajustar precios según temporada alta/baja
- **Multi-moneda** — mostrar equivalente en ARS/USD
