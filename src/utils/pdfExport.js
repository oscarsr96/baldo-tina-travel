import jsPDF from "jspdf";
import { buildItinerary } from "./itineraryBuilder";

// Paleta de colores RGB
const C = {
  accent: [196, 149, 106],
  text: [61, 53, 41],
  muted: [155, 147, 133],
  bg: [250, 247, 242],
  green: [124, 182, 142],
  red: [212, 131, 106],
  blue: [123, 170, 196],
  border: [232, 224, 214],
  white: [255, 255, 255],
  dark: [40, 35, 28],
};

// Colores tier para fallback de foto
const TIER_COLORS = {
  budget: [124, 182, 142],
  mid: [123, 170, 196],
  premium: [196, 149, 106],
};

const TIER_LABELS = {
  budget: "Economica",
  mid: "Equilibrada",
  premium: "Premium",
};

const TYPE_ICONS = {
  cultura: "Art.",
  gastronomia: "Gast.",
  naturaleza: "Nat.",
  nocturna: "Noche",
  animado: "Anim.",
  tranquilo: "Relax",
};

const PAGE_W = 210;
const PAGE_H = 297;
const MARGIN = 15;
const CONTENT_W = PAGE_W - MARGIN * 2;
const FOOTER_Y = 285;

// --- Helpers de imagen ---

async function fetchImageAsBase64(url, timeout = 3000) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeout);
  try {
    const resp = await fetch(url, { signal: controller.signal });
    if (!resp.ok) throw new Error(resp.status);
    const blob = await resp.blob();
    return await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

// Reduce Unsplash URL para PDF (600px, q60)
function reducedUrl(url) {
  if (!url) return null;
  if (url.includes("unsplash.com")) {
    return url.replace(/w=\d+/, "w=600").replace(/q=\d+/, "q=60");
  }
  return url;
}

async function preloadAllImages(route) {
  const promises = {};

  // Logo
  promises.logo = fetchImageAsBase64("/logo.jpeg", 3000);

  // Fotos de ciudad
  route.cityDetails.forEach((city) => {
    if (city.photo) {
      promises[`city_${city.cityId}`] = fetchImageAsBase64(reducedUrl(city.photo), 3000);
    }
  });

  const keys = Object.keys(promises);
  const results = await Promise.allSettled(Object.values(promises));

  const images = {};
  keys.forEach((key, i) => {
    const r = results[i];
    images[key] = r.status === "fulfilled" ? r.value : null;
  });
  return images;
}

// --- PDF Export ---

export async function exportRoutePDF(route, formData, adminNotes = "", itemComments = {}) {
  const images = await preloadAllImages(route);
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  let y = 0;
  let pageNum = 1;

  // --- Utilidades ---
  const setColor = (c) => doc.setTextColor(...c);
  const setFill = (c) => doc.setFillColor(...c);
  const font = (style, size) => {
    doc.setFont("helvetica", style);
    doc.setFontSize(size);
  };

  const drawFooter = () => {
    doc.setDrawColor(...C.border);
    doc.line(MARGIN, FOOTER_Y - 3, MARGIN + CONTENT_W, FOOTER_Y - 3);
    font("normal", 7);
    setColor([180, 175, 168]);
    doc.text("Baldo & Tina Travel  |  Tu proxima aventura europea", PAGE_W / 2, FOOTER_Y, { align: "center" });
    doc.text(`Pagina ${pageNum}`, PAGE_W / 2, FOOTER_Y + 4, { align: "center" });
  };

  const addPage = () => {
    drawFooter();
    doc.addPage();
    pageNum++;
    y = MARGIN;
  };

  const checkPageBreak = (needed = 30) => {
    if (y + needed > FOOTER_Y - 8) {
      addPage();
      return true;
    }
    return false;
  };

  // Dibuja bloque de tip personal
  const drawTipBlock = (tipText) => {
    if (!tipText) return;
    checkPageBreak(18);

    const tipW = CONTENT_W - 12;
    font("italic", 8);
    const lines = doc.splitTextToSize(`"${tipText}"`, tipW - 8);
    const boxH = lines.length * 3.5 + 8;

    // Fondo suave
    setFill([252, 249, 245]);
    doc.roundedRect(MARGIN + 6, y, tipW, boxH, 1.5, 1.5, "F");

    // Borde izquierdo accent
    setFill(C.accent);
    doc.rect(MARGIN + 6, y, 1.2, boxH, "F");

    // Texto
    setColor(C.text);
    doc.text(lines, MARGIN + 12, y + 5);

    // Firma
    font("bold", 7);
    setColor(C.accent);
    doc.text("-- Baldo & Tina", MARGIN + tipW + 6 - 4, y + boxH - 2.5, { align: "right" });

    y += boxH + 3;
  };

  // ============================================================
  // PAGINA 1: PORTADA
  // ============================================================

  // Barra accent superior
  setFill(C.accent);
  doc.rect(0, 0, PAGE_W, 8, "F");

  // Logo
  y = 22;
  if (images.logo) {
    try {
      doc.addImage(images.logo, "JPEG", PAGE_W / 2 - 15, y, 30, 40);
      y += 46;
    } catch {
      y += 5;
    }
  } else {
    y += 5;
  }

  // Titulo
  font("bold", 20);
  setColor(C.text);
  doc.text("BALDO & TINA TRAVEL", PAGE_W / 2, y, { align: "center" });
  y += 7;
  font("normal", 11);
  setColor(C.muted);
  doc.text("Tu proxima aventura europea", PAGE_W / 2, y, { align: "center" });
  y += 5;

  // Linea accent
  setFill(C.accent);
  doc.rect(PAGE_W / 2 - 25, y, 50, 0.6, "F");
  y += 10;

  // Propuesta para...
  font("normal", 11);
  setColor(C.muted);
  doc.text("Propuesta personalizada para", PAGE_W / 2, y, { align: "center" });
  y += 8;
  font("bold", 22);
  setColor(C.accent);
  doc.text(formData.clientName.toUpperCase(), PAGE_W / 2, y, { align: "center" });
  y += 14;

  // Badge ruta
  const tierLabel = `RUTA ${TIER_LABELS[route.tier] ? TIER_LABELS[route.tier].toUpperCase() : route.label.toUpperCase()}`;
  const badgeW = doc.getTextWidth(tierLabel) + 16;
  font("bold", 10);
  setFill(C.accent);
  doc.roundedRect(PAGE_W / 2 - badgeW / 2, y, badgeW, 8, 2, 2, "F");
  setColor(C.white);
  doc.text(tierLabel, PAGE_W / 2, y + 5.8, { align: "center" });
  y += 14;

  // Ruta visual
  font("normal", 10);
  setColor(C.text);
  const routeLines = doc.splitTextToSize(route.routeVisual, CONTENT_W - 20);
  doc.text(routeLines, PAGE_W / 2, y, { align: "center" });
  y += routeLines.length * 5 + 8;

  // 4 columnas de datos
  const cols = [
    { label: "Viajeros", value: String(formData.travelers) },
    { label: "Dias", value: String(formData.totalDays) },
    { label: "Presupuesto", value: `EUR${formData.budget}` },
    { label: "Fecha", value: new Date().toLocaleDateString("es-AR", { day: "numeric", month: "short", year: "numeric" }) },
  ];
  const colW = CONTENT_W / 4;
  cols.forEach((col, i) => {
    const cx = MARGIN + colW * i + colW / 2;
    // Fondo
    setFill(C.bg);
    doc.roundedRect(MARGIN + colW * i + 2, y, colW - 4, 18, 2, 2, "F");
    // Valor
    font("bold", 14);
    setColor(C.text);
    doc.text(col.value, cx, y + 8, { align: "center" });
    // Label
    font("normal", 7);
    setColor(C.muted);
    doc.text(col.label, cx, y + 14, { align: "center" });
  });
  y += 26;

  // Preferencias como tags
  if (formData.preferences && formData.preferences.length > 0) {
    font("normal", 8);
    const prefText = formData.preferences.join("  |  ");
    setColor(C.muted);
    doc.text(prefText, PAGE_W / 2, y, { align: "center" });
    y += 10;
  }

  // Precio total grande
  font("bold", 24);
  setColor(C.accent);
  doc.text(`EUR${route.costs.totalPerPerson.toLocaleString()} por persona`, PAGE_W / 2, y, { align: "center" });
  y += 8;
  font("normal", 12);
  setColor(C.muted);
  doc.text(`EUR${route.costs.totalGroup.toLocaleString()} grupo (${formData.travelers} viajero${formData.travelers > 1 ? "s" : ""})`, PAGE_W / 2, y, { align: "center" });
  y += 8;

  // Indicador presupuesto
  const withinBudget = route.costs.totalPerPerson <= formData.budget;
  font("bold", 10);
  if (withinBudget) {
    setColor(C.green);
    doc.text("Dentro del presupuesto", PAGE_W / 2, y, { align: "center" });
  } else {
    setColor(C.red);
    const diff = route.costs.totalPerPerson - formData.budget;
    doc.text(`Excede presupuesto en EUR${diff}`, PAGE_W / 2, y, { align: "center" });
  }

  drawFooter();

  // ============================================================
  // PAGINAS DE CIUDAD
  // ============================================================

  route.cityDetails.forEach((city) => {
    doc.addPage();
    pageNum++;
    y = 0;

    const cityImg = images[`city_${city.cityId}`];
    const heroH = 80;

    // Hero: foto o rectangulo fallback
    if (cityImg) {
      try {
        doc.addImage(cityImg, "JPEG", 0, 0, PAGE_W, heroH);
      } catch {
        setFill(TIER_COLORS[route.tier] || C.accent);
        doc.rect(0, 0, PAGE_W, heroH, "F");
      }
    } else {
      setFill(TIER_COLORS[route.tier] || C.accent);
      doc.rect(0, 0, PAGE_W, heroH, "F");
    }

    // Banda oscura abajo del hero
    doc.setGState(new doc.GState({ opacity: 0.7 }));
    setFill([0, 0, 0]);
    doc.rect(0, heroH - 25, PAGE_W, 25, "F");
    doc.setGState(new doc.GState({ opacity: 1 }));

    // Texto sobre banda
    setColor(C.white);
    font("bold", 18);
    doc.text(`${city.emoji} ${city.name} · ${city.country}`, MARGIN, heroH - 12);
    font("normal", 10);
    doc.text(`${city.nights} noche${city.nights > 1 ? "s" : ""} · Subtotal EUR${city.subtotal}`, MARGIN, heroH - 5);

    y = heroH + 6;

    // 3 columnas de budget
    const budgetCols = [
      { icon: "Aloj.", value: `EUR${city.accommodation.perNight}/n`, detail: city.accommodation.type },
      { icon: "Comida", value: `EUR${city.food.perDay}/d`, detail: "" },
      { icon: "Transp.", value: `EUR${city.localTransport.perDay}/d`, detail: "" },
    ];
    const bColW = CONTENT_W / 3;
    budgetCols.forEach((col, i) => {
      const bx = MARGIN + bColW * i;
      setFill(C.bg);
      doc.roundedRect(bx + 1, y, bColW - 2, 14, 1.5, 1.5, "F");
      font("bold", 9);
      setColor(C.text);
      doc.text(`${col.icon} ${col.value}`, bx + bColW / 2, y + 6, { align: "center" });
      if (col.detail) {
        font("normal", 7);
        setColor(C.muted);
        doc.text(col.detail, bx + bColW / 2, y + 11, { align: "center" });
      }
    });
    y += 20;

    // --- Itinerario dia a dia ---
    const preferences = formData.preferences || [];
    const itinerary = buildItinerary(city, city.nights, preferences, route.tier);

    itinerary.forEach((day) => {
      // Header del dia
      checkPageBreak(35);

      // Linea accent + DIA X
      setFill(C.accent);
      doc.rect(MARGIN, y, CONTENT_W, 0.6, "F");
      y += 5;
      font("bold", 13);
      setColor(C.accent);
      doc.text(`DIA ${day.dayNumber}`, MARGIN, y);
      y += 7;

      // -- Manana --
      const renderSection = (label, item, isFood, isEvening) => {
        checkPageBreak(22);

        font("bold", 9);
        setColor(C.muted);
        doc.text(label.toUpperCase(), MARGIN, y);
        y += 5;

        if (!item) {
          font("italic", 9);
          setColor([180, 175, 168]);
          doc.text("Tiempo libre para explorar", MARGIN + 4, y);
          y += 6;
          return;
        }

        // Card de actividad
        const cardX = MARGIN + 2;
        const cardW = CONTENT_W - 4;

        if (isFood) {
          // Restaurante: compacto
          font("bold", 10);
          setColor(C.text);
          doc.text(item.name, cardX, y);
          const nameW = doc.getTextWidth(item.name);
          if (item.zone) {
            font("normal", 8);
            setColor(C.accent);
            doc.text(` · ${item.zone}`, cardX + nameW + 1, y);
          }
          y += 4;
          if (item.description) {
            font("normal", 8);
            setColor(C.muted);
            const descLines = doc.splitTextToSize(item.description, cardW - 4);
            doc.text(descLines, cardX, y);
            y += descLines.length * 3.5 + 1;
          }
          y += 2;
        } else if (isEvening) {
          // Noche
          font("bold", 10);
          setColor(C.text);
          doc.text(item.name, cardX, y);
          y += 4;
          if (item.description) {
            font("normal", 8);
            setColor(C.muted);
            const descLines = doc.splitTextToSize(item.description, cardW - 4);
            doc.text(descLines, cardX, y);
            y += descLines.length * 3.5 + 1;
          }
          y += 2;
        } else {
          // Actividad normal
          // Nombre + duracion + tipo
          font("bold", 11);
          setColor(C.text);
          const nameText = item.name;
          doc.text(nameText, cardX, y);
          const nw = doc.getTextWidth(nameText);

          font("normal", 8);
          setColor(C.muted);
          const meta = [item.duration, TYPE_ICONS[item.type]].filter(Boolean).join(" · ");
          if (meta) doc.text(`  ${meta}`, cardX + nw + 1, y);
          y += 4.5;

          // Descripcion
          if (item.description) {
            font("normal", 9);
            setColor([120, 115, 105]);
            const descLines = doc.splitTextToSize(item.description, cardW - 4);
            doc.text(descLines, cardX, y);
            y += descLines.length * 4 + 1;
          }

          // Tip personal
          const tipKey = `${city.cityId}:${item.name}`;
          const tip = itemComments[tipKey];
          if (tip) {
            drawTipBlock(tip);
          }

          y += 2;
        }

        // Tips para comida y noche tambien
        if (isFood || isEvening) {
          const tipKey = `${city.cityId}:${item.name}`;
          const tip = itemComments[tipKey];
          if (tip) drawTipBlock(tip);
        }
      };

      renderSection("Manana", day.morning, false, false);
      renderSection("Almuerzo", day.lunch, true, false);
      renderSection("Tarde", day.afternoon, false, false);
      renderSection("Noche", day.evening, false, true);

      y += 3;
    });

    // Zonas recomendadas / evitar
    checkPageBreak(15);
    if (city.recommendedZones && city.recommendedZones.length > 0) {
      font("bold", 8);
      setColor(C.green);
      doc.text("Zonas: ", MARGIN, y);
      font("normal", 8);
      setColor(C.muted);
      doc.text(city.recommendedZones.join(", "), MARGIN + 16, y);
      y += 5;
    }
    if (city.avoidZones && city.avoidZones.length > 0) {
      font("bold", 8);
      setColor(C.red);
      doc.text("Evitar: ", MARGIN, y);
      font("normal", 8);
      setColor(C.muted);
      doc.text(city.avoidZones.join(", "), MARGIN + 16, y);
      y += 5;
    }

    drawFooter();
  });

  // ============================================================
  // ULTIMA PAGINA: RESUMEN DE COSTES + NOTAS
  // ============================================================

  doc.addPage();
  pageNum++;
  y = MARGIN;

  // Header
  setFill(C.accent);
  doc.roundedRect(MARGIN, y, CONTENT_W, 10, 2, 2, "F");
  font("bold", 12);
  setColor(C.white);
  doc.text("RESUMEN DE COSTES", MARGIN + 4, y + 7);
  y += 16;

  // Tabla de costes
  const costRows = [
    ["Vuelos intercontinentales", `EUR${route.costs.flights}`],
    ["Transporte entre ciudades", `EUR${route.costs.interCityTransport}`],
    ["Transporte local", `EUR${route.costs.localTransport}`],
    ["Alojamiento", `EUR${route.costs.accommodation}`],
    ["Comida", `EUR${route.costs.food}`],
  ];

  costRows.forEach(([label, value], i) => {
    // Fila alternada
    if (i % 2 === 0) {
      setFill(C.bg);
      doc.rect(MARGIN, y - 4, CONTENT_W, 8, "F");
    }
    font("normal", 10);
    setColor(C.text);
    doc.text(label, MARGIN + 4, y);
    doc.text(value, MARGIN + CONTENT_W - 4, y, { align: "right" });
    y += 8;
  });

  // Separador
  doc.setDrawColor(...C.border);
  doc.line(MARGIN, y - 2, MARGIN + CONTENT_W, y - 2);
  y += 4;

  // Total por persona
  font("bold", 12);
  setColor(C.text);
  doc.text("TOTAL por persona", MARGIN + 4, y);
  doc.text(`EUR${route.costs.totalPerPerson.toLocaleString()}`, MARGIN + CONTENT_W - 4, y, { align: "right" });
  y += 10;

  // Total grupo (badge accent)
  setFill(C.accent);
  doc.roundedRect(MARGIN + 10, y, CONTENT_W - 20, 14, 3, 3, "F");
  font("bold", 13);
  setColor(C.white);
  doc.text(
    `TOTAL GRUPO (${formData.travelers})  —  EUR${route.costs.totalGroup.toLocaleString()}`,
    PAGE_W / 2,
    y + 9.5,
    { align: "center" }
  );
  y += 20;

  // Indicador presupuesto
  font("bold", 10);
  if (withinBudget) {
    setColor(C.green);
    doc.text("Dentro del presupuesto", MARGIN + 4, y);
  } else {
    setColor(C.red);
    const diff = route.costs.totalPerPerson - formData.budget;
    doc.text(`Excede presupuesto en EUR${diff}/persona`, MARGIN + 4, y);
  }
  y += 15;

  // Recomendaciones personales
  if (adminNotes && adminNotes.trim()) {
    checkPageBreak(30);
    font("bold", 11);
    setColor(C.text);
    doc.text("Recomendaciones personales", MARGIN, y);
    y += 6;

    // Caja con borde izquierdo accent
    const noteLines = doc.splitTextToSize(adminNotes, CONTENT_W - 14);
    const noteH = Math.max(15, noteLines.length * 4.5 + 10);
    setFill([252, 249, 245]);
    doc.roundedRect(MARGIN, y, CONTENT_W, noteH, 2, 2, "F");
    setFill(C.accent);
    doc.rect(MARGIN, y, 1.5, noteH, "F");

    font("normal", 9);
    setColor(C.text);
    doc.text(noteLines, MARGIN + 6, y + 6);
    y += noteH + 8;
  }

  // Notas del cliente
  if (formData.notes && formData.notes.trim()) {
    checkPageBreak(25);
    font("bold", 11);
    setColor(C.text);
    doc.text("Notas del cliente", MARGIN, y);
    y += 6;

    const noteLines = doc.splitTextToSize(formData.notes, CONTENT_W - 14);
    const noteH = Math.max(12, noteLines.length * 4.5 + 8);
    setFill(C.bg);
    doc.roundedRect(MARGIN, y, CONTENT_W, noteH, 2, 2, "F");
    setFill(C.border);
    doc.rect(MARGIN, y, 1.5, noteH, "F");

    font("normal", 9);
    setColor(C.muted);
    doc.text(noteLines, MARGIN + 6, y + 6);
    y += noteH + 8;
  }

  // Disclaimer
  y = Math.max(y, FOOTER_Y - 20);
  font("italic", 7);
  setColor([180, 175, 168]);
  doc.text("Este presupuesto es orientativo y puede variar segun disponibilidad y temporada.", PAGE_W / 2, y, { align: "center" });

  drawFooter();

  // Descargar
  const fileName = `Ruta_${route.label}_${formData.clientName.replace(/\s+/g, "_")}.pdf`;
  doc.save(fileName);
}
