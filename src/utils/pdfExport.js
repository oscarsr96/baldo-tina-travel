import jsPDF from "jspdf";

const COLORS = {
  accent: [196, 149, 106],
  text: [61, 53, 41],
  muted: [155, 147, 133],
  bg: [250, 247, 242],
  card: [255, 255, 255],
  green: [124, 182, 142],
  red: [212, 131, 106],
};

export function exportRoutePDF(route, formData, adminNotes = '', itemComments = {}) {
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const pageWidth = 210;
  const margin = 20;
  const contentWidth = pageWidth - margin * 2;
  let y = margin;

  const addPage = () => {
    doc.addPage();
    y = margin;
  };

  const checkPageBreak = (needed = 30) => {
    if (y + needed > 275) addPage();
  };

  // --- Cabecera ---
  doc.setFillColor(...COLORS.accent);
  doc.rect(0, 0, pageWidth, 35, "F");

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(20);
  doc.setFont("helvetica", "bold");
  doc.text("Baldo & Tina Travel", margin, 16);
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text("Tu próxima aventura europea", margin, 24);

  y = 45;

  // --- Datos del cliente ---
  doc.setTextColor(...COLORS.text);
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text(`Propuesta de viaje para: ${formData.clientName}`, margin, y);
  y += 8;

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(80, 80, 80);
  const today = new Date().toLocaleDateString("es-AR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  doc.text(`Fecha: ${today}    |    Viajeros: ${formData.travelers}    |    Días: ${formData.totalDays}`, margin, y);
  y += 5;
  doc.text(`Preferencias: ${formData.preferences.join(", ")}`, margin, y);
  y += 10;

  // --- Tipo de ruta ---
  doc.setFillColor(...COLORS.accent);
  doc.roundedRect(margin, y, contentWidth, 10, 2, 2, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text(`RUTA ${route.label.toUpperCase()}`, margin + 4, y + 7);
  y += 16;

  // --- Itinerario ---
  doc.setTextColor(...COLORS.text);
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.text("Itinerario:", margin, y);
  y += 5;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);

  // Ruta visual (puede ser larga, dividir si es necesario)
  const routeLines = doc.splitTextToSize(route.routeVisual, contentWidth);
  doc.text(routeLines, margin, y);
  y += routeLines.length * 5 + 5;

  // Vuelo ida
  doc.setTextColor(100, 100, 100);
  doc.text(`✈ Buenos Aires → ${route.flightIn.city}: €${route.flightIn.cost}/persona`, margin, y);
  y += 5;

  // Segmentos entre ciudades
  route.segments.forEach((seg) => {
    doc.text(`${seg.mode === "Vuelo" || seg.mode === "Vuelo low-cost" ? "✈" : seg.mode === "Tren" ? "🚂" : "🚌"} ${seg.from} → ${seg.to}: €${seg.cost}/persona (${seg.mode})`, margin, y);
    y += 5;
  });

  // Vuelo vuelta
  doc.text(`✈ ${route.flightOut.city} → Buenos Aires: €${route.flightOut.cost}/persona`, margin, y);
  y += 10;

  // --- Detalle por ciudad ---
  route.cityDetails.forEach((city) => {
    checkPageBreak(55);

    // Encabezado ciudad
    doc.setFillColor(240, 240, 240);
    doc.roundedRect(margin, y, contentWidth, 8, 1, 1, "F");
    doc.setTextColor(...COLORS.text);
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.text(`${city.emoji} ${city.name} — ${city.nights} noche${city.nights > 1 ? "s" : ""}`, margin + 3, y + 6);
    y += 12;

    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(60, 60, 60);

    doc.text(`Alojamiento: ${city.accommodation.type} — €${city.accommodation.perNight}/noche (Total: €${city.accommodation.total})`, margin + 4, y);
    y += 5;
    doc.text(`Comida: €${city.food.perDay}/día (Total: €${city.food.total})`, margin + 4, y);
    y += 5;
    doc.text(`Transporte local: €${city.localTransport.perDay}/día (Total: €${city.localTransport.total})`, margin + 4, y);
    y += 6;

    doc.setFont("helvetica", "bold");
    doc.text("Qué ver:", margin + 4, y);
    doc.setFont("helvetica", "normal");
    const highlightNames = city.highlights.map((h) => (typeof h === "string" ? h : h.name));
    doc.text(highlightNames.join(", "), margin + 22, y);
    y += 5;

    // Tips de Baldo & Tina para esta ciudad
    const cityTips = Object.entries(itemComments).filter(
      ([key, val]) => key.startsWith(`${city.cityId}:`) && val
    );
    if (cityTips.length > 0) {
      checkPageBreak(cityTips.length * 10 + 5);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(...COLORS.accent);
      doc.text("Tips de Baldo & Tina:", margin + 4, y);
      y += 5;
      doc.setFont("helvetica", "italic");
      doc.setFontSize(8);
      cityTips.forEach(([key, val]) => {
        checkPageBreak(10);
        const itemName = key.split(":")[1];
        const tipLines = doc.splitTextToSize(`${itemName}: "${val}"`, contentWidth - 12);
        doc.text(tipLines, margin + 6, y);
        y += tipLines.length * 4 + 2;
      });
      doc.setFontSize(9);
      doc.setTextColor(60, 60, 60);
    }

    if (city.recommendedZones.length > 0) {
      doc.setFont("helvetica", "bold");
      doc.text("Zonas recomendadas:", margin + 4, y);
      doc.setFont("helvetica", "normal");
      doc.text(city.recommendedZones.join(", "), margin + 45, y);
      y += 5;
    }

    if (city.avoidZones.length > 0) {
      doc.setTextColor(180, 80, 80);
      doc.setFont("helvetica", "bold");
      doc.text("Zonas a evitar:", margin + 4, y);
      doc.setFont("helvetica", "normal");
      doc.text(city.avoidZones.join(", "), margin + 37, y);
      doc.setTextColor(60, 60, 60);
      y += 5;
    }

    y += 5;
  });

  // --- Resumen de costes ---
  checkPageBreak(50);

  doc.setFillColor(...COLORS.accent);
  doc.roundedRect(margin, y, contentWidth, 8, 1, 1, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.text("RESUMEN DE COSTES", margin + 4, y + 6);
  y += 14;

  doc.setTextColor(...COLORS.text);
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");

  const costLines = [
    ["Vuelos intercontinentales:", `€${route.costs.flights}`],
    ["Transporte entre ciudades:", `€${route.costs.interCityTransport}`],
    ["Transporte local:", `€${route.costs.localTransport}`],
    ["Alojamiento:", `€${route.costs.accommodation}`],
    ["Comida:", `€${route.costs.food}`],
  ];

  costLines.forEach(([label, value]) => {
    doc.text(label, margin + 4, y);
    doc.text(value, margin + contentWidth - 4, y, { align: "right" });
    y += 6;
  });

  // Línea separadora
  doc.setDrawColor(200, 200, 200);
  doc.line(margin + 4, y, margin + contentWidth - 4, y);
  y += 6;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.text("TOTAL por persona:", margin + 4, y);
  doc.text(`€${route.costs.totalPerPerson}`, margin + contentWidth - 4, y, { align: "right" });
  y += 7;

  doc.setFontSize(12);
  doc.setTextColor(...COLORS.accent);
  doc.text(`TOTAL grupo (${formData.travelers} persona${formData.travelers > 1 ? "s" : ""}):`, margin + 4, y);
  doc.text(`€${route.costs.totalGroup}`, margin + contentWidth - 4, y, { align: "right" });
  y += 12;

  // Indicador de presupuesto
  const withinBudget = route.costs.totalPerPerson <= formData.budget;
  doc.setFontSize(10);
  if (withinBudget) {
    doc.setTextColor(...COLORS.green);
    doc.text("✓ Dentro del presupuesto", margin + 4, y);
  } else {
    doc.setTextColor(...COLORS.red);
    const diff = route.costs.totalPerPerson - formData.budget;
    doc.text(`✗ Excede el presupuesto en €${diff}/persona`, margin + 4, y);
  }
  y += 15;

  // --- Recomendaciones personalizadas ---
  checkPageBreak(40);

  doc.setTextColor(...COLORS.text);
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.text("Recomendaciones personalizadas", margin, y);
  y += 6;

  if (adminNotes && adminNotes.trim()) {
    doc.setDrawColor(200, 200, 200);
    doc.setFillColor(252, 249, 245);
    const noteLines = doc.splitTextToSize(adminNotes, contentWidth - 8);
    const boxHeight = Math.max(20, noteLines.length * 5 + 10);
    doc.roundedRect(margin, y, contentWidth, boxHeight, 2, 2, "FD");
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...COLORS.text);
    doc.text(noteLines, margin + 4, y + 8);
    y += boxHeight + 10;
  } else {
    doc.setDrawColor(200, 200, 200);
    doc.setFillColor(248, 248, 248);
    doc.roundedRect(margin, y, contentWidth, 30, 2, 2, "FD");
    doc.setFontSize(9);
    doc.setFont("helvetica", "italic");
    doc.setTextColor(160, 160, 160);
    doc.text("Espacio reservado para notas personales de la agencia...", margin + 4, y + 8);
    y += 40;
  }

  // --- Notas del cliente (si las hay) ---
  if (formData.notes && formData.notes.trim()) {
    checkPageBreak(25);
    doc.setTextColor(...COLORS.text);
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.text("Notas del cliente:", margin, y);
    y += 5;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    const noteLines = doc.splitTextToSize(formData.notes, contentWidth);
    doc.text(noteLines, margin, y);
    y += noteLines.length * 4 + 10;
  }

  // --- Pie de página ---
  const footerY = 285;
  doc.setDrawColor(...COLORS.accent);
  doc.line(margin, footerY - 5, margin + contentWidth, footerY - 5);
  doc.setFontSize(8);
  doc.setTextColor(130, 130, 130);
  doc.text("Baldo & Tina Travel  |  contacto@baldotina.com  |  +54 11 XXXX-XXXX", pageWidth / 2, footerY, { align: "center" });
  doc.text("Este presupuesto es orientativo y puede variar según disponibilidad.", pageWidth / 2, footerY + 4, { align: "center" });

  // Descargar
  const fileName = `Ruta_${route.label}_${formData.clientName.replace(/\s+/g, "_")}.pdf`;
  doc.save(fileName);
}
