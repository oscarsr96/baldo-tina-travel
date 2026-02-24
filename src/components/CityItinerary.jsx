import { useState } from "react";
import { buildItinerary } from "../utils/itineraryBuilder";

const TYPE_ICONS = {
  cultura: "🎨",
  gastronomia: "🍷",
  naturaleza: "🌳",
  nocturna: "🌙",
  animado: "🎉",
  tranquilo: "🌿",
};

const TYPE_LABELS = {
  cultura: "Cultura",
  gastronomia: "Gastronomía",
  naturaleza: "Naturaleza",
  nocturna: "Vida nocturna",
  animado: "Animado",
  tranquilo: "Tranquilo",
};

function TipDisplay({ comment }) {
  if (!comment) return null;
  return (
    <div className="mt-2 bg-accent/5 border-l-2 border-accent rounded-r-lg px-3 py-2">
      <p className="text-xs italic text-text leading-relaxed">"{comment}"</p>
      <p className="text-[10px] text-accent font-semibold mt-1 text-right">— Baldo & Tina</p>
    </div>
  );
}

function TipEditor({ comment, commentKey, onSaveComment }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(comment || "");

  if (!editing) {
    return (
      <button
        onClick={() => { setDraft(comment || ""); setEditing(true); }}
        className="mt-2 text-[11px] text-accent hover:text-accent/80 cursor-pointer flex items-center gap-1"
      >
        {comment ? "✏️ Editar tip" : "💬 Añadir tip personal"}
      </button>
    );
  }

  return (
    <div className="mt-2 space-y-2">
      <textarea
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        rows={2}
        className="w-full bg-input border border-border rounded-lg px-3 py-2 text-xs text-text focus:outline-none focus:border-accent transition-colors resize-none"
        placeholder="Ej: Pedir el cacio e pepe sí o sí..."
        autoFocus
      />
      <div className="flex gap-2">
        <button
          onClick={() => { onSaveComment(commentKey, draft.trim()); setEditing(false); }}
          className="text-[11px] bg-accent hover:bg-accent/90 text-white px-3 py-1 rounded-lg font-semibold cursor-pointer transition-colors"
        >
          Guardar
        </button>
        <button
          onClick={() => setEditing(false)}
          className="text-[11px] text-muted hover:text-text px-3 py-1 cursor-pointer transition-colors"
        >
          Cancelar
        </button>
      </div>
    </div>
  );
}

function ItemTip({ comment, commentKey, isAdmin, onSaveComment }) {
  return (
    <>
      <TipDisplay comment={comment} />
      {isAdmin && <TipEditor comment={comment} commentKey={commentKey} onSaveComment={onSaveComment} />}
    </>
  );
}

function ActivityCard({ activity, fallbackLabel, comment, commentKey, isAdmin, onSaveComment }) {
  if (!activity) {
    return (
      <div className="bg-input/50 border border-border rounded-lg p-4 text-center text-muted text-sm italic">
        Tiempo libre para explorar
      </div>
    );
  }

  const icon = TYPE_ICONS[activity.type] || "📍";
  const label = TYPE_LABELS[activity.type] || activity.type;

  return (
    <div className="bg-card border border-border rounded-lg overflow-hidden flex flex-col sm:flex-row">
      {/* Foto */}
      {activity.photo ? (
        <div className="sm:w-[40%] h-36 sm:h-auto relative flex-shrink-0">
          <img
            src={activity.photo}
            alt={activity.name}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        </div>
      ) : (
        <div className="sm:w-[40%] h-36 sm:h-auto bg-gradient-to-br from-accent/20 to-accent/5 flex items-center justify-center flex-shrink-0">
          <span className="text-3xl opacity-60">{icon}</span>
        </div>
      )}
      {/* Texto */}
      <div className="p-3 sm:p-4 flex flex-col justify-center flex-1 min-w-0">
        <h6 className="text-sm font-bold text-text leading-tight">{activity.name}</h6>
        {activity.description && (
          <p className="text-xs text-muted mt-1 leading-relaxed">{activity.description}</p>
        )}
        <div className="flex flex-wrap gap-2 mt-2">
          {activity.duration && (
            <span className="text-[11px] px-2 py-0.5 bg-input rounded-full text-muted">
              {activity.duration}
            </span>
          )}
          <span className="text-[11px] px-2 py-0.5 bg-accent/10 text-accent rounded-full">
            {icon} {label}
          </span>
        </div>
        <ItemTip comment={comment} commentKey={commentKey} isAdmin={isAdmin} onSaveComment={onSaveComment} />
      </div>
    </div>
  );
}

function LunchCard({ spot, comment, commentKey, isAdmin, onSaveComment }) {
  if (!spot) return null;
  return (
    <div className="bg-card border border-border rounded-lg p-3">
      <div className="flex items-center gap-3">
        <span className="text-xl">🍽️</span>
        <div className="min-w-0">
          <p className="text-sm font-semibold text-text">{spot.name}</p>
          <p className="text-xs text-muted">
            {spot.description}
            {spot.zone && <span className="ml-1 text-accent">· {spot.zone}</span>}
          </p>
        </div>
      </div>
      <ItemTip comment={comment} commentKey={commentKey} isAdmin={isAdmin} onSaveComment={onSaveComment} />
    </div>
  );
}

function EveningCard({ idea, comment, commentKey, isAdmin, onSaveComment }) {
  if (!idea) return null;
  const icon = TYPE_ICONS[idea.type] || "🌙";
  return (
    <div className="bg-card border border-border rounded-lg p-3">
      <div className="flex items-center gap-3">
        <span className="text-xl">{icon}</span>
        <div className="min-w-0">
          <p className="text-sm font-semibold text-text">{idea.name}</p>
          <p className="text-xs text-muted">{idea.description}</p>
        </div>
      </div>
      <ItemTip comment={comment} commentKey={commentKey} isAdmin={isAdmin} onSaveComment={onSaveComment} />
    </div>
  );
}

export default function CityItinerary({ city, tier, preferences = [], itemComments = {}, onSaveItemComment }) {
  const isAdmin = !!onSaveItemComment;
  const getComment = (itemName) => itemComments[`${city.cityId}:${itemName}`] || "";
  const getKey = (itemName) => `${city.cityId}:${itemName}`;
  const [currentDay, setCurrentDay] = useState(0);
  const [slideDir, setSlideDir] = useState(null);

  const itinerary = buildItinerary(city, city.nights, preferences, tier);
  const totalDays = itinerary.length;
  const day = itinerary[currentDay];

  const goToDay = (index) => {
    if (index === currentDay || index < 0 || index >= totalDays) return;
    setSlideDir(index > currentDay ? "right" : "left");
    setCurrentDay(index);
    // Limpiar dirección tras animación
    setTimeout(() => setSlideDir(null), 300);
  };

  // Nombre del highlight (backward compat)
  const highlightName = (h) => (typeof h === "string" ? h : h.name);

  return (
    <div className="bg-input/50 border border-border rounded-lg overflow-hidden">
      {/* Hero Image */}
      <div className="relative h-48 sm:h-60 overflow-hidden">
        {city.photo ? (
          <img
            src={city.photo}
            alt={city.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-accent/30 to-accent/10" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-5">
          <h5 className="text-white font-bold text-lg sm:text-xl drop-shadow-lg">
            {city.emoji} {city.name} · {city.country}
          </h5>
          <p className="text-white/80 text-sm mt-0.5">
            {city.nights} noche{city.nights > 1 ? "s" : ""} · Subtotal{" "}
            <span className="text-white font-semibold">€{city.subtotal}</span>
          </p>
        </div>
      </div>

      {/* Day Navigation */}
      {totalDays > 1 && (
        <div className="flex items-center gap-2 px-4 py-3 bg-card border-b border-border">
          <button
            onClick={() => goToDay(currentDay - 1)}
            disabled={currentDay === 0}
            className="w-8 h-8 rounded-full bg-input border border-border flex items-center justify-center text-muted hover:text-accent hover:border-accent transition-colors disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
          >
            ◀
          </button>
          <div className="flex gap-1.5 flex-1 justify-center flex-wrap">
            {itinerary.map((_, i) => (
              <button
                key={i}
                onClick={() => goToDay(i)}
                className={`px-3 py-1 rounded-full text-xs font-semibold transition-colors cursor-pointer ${
                  i === currentDay
                    ? "bg-accent text-white"
                    : "bg-input text-muted hover:text-accent border border-border"
                }`}
              >
                Día {i + 1}
              </button>
            ))}
          </div>
          <button
            onClick={() => goToDay(currentDay + 1)}
            disabled={currentDay === totalDays - 1}
            className="w-8 h-8 rounded-full bg-input border border-border flex items-center justify-center text-muted hover:text-accent hover:border-accent transition-colors disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
          >
            ▶
          </button>
        </div>
      )}

      {/* Day Content */}
      <div
        key={currentDay}
        className={`p-4 sm:p-5 space-y-4 ${
          slideDir === "right"
            ? "animate-slide-in-right"
            : slideDir === "left"
            ? "animate-slide-in-left"
            : ""
        }`}
      >
        {/* Mañana */}
        <div>
          <p className="text-xs font-semibold text-muted uppercase tracking-wider mb-2">
            ☀️ Mañana
          </p>
          <ActivityCard
            activity={day.morning}
            fallbackLabel="Mañana libre"
            comment={day.morning ? getComment(day.morning.name) : ""}
            commentKey={day.morning ? getKey(day.morning.name) : ""}
            isAdmin={isAdmin}
            onSaveComment={onSaveItemComment}
          />
        </div>

        {/* Almuerzo */}
        {day.lunch && (
          <div>
            <p className="text-xs font-semibold text-muted uppercase tracking-wider mb-2">
              🍽️ Almuerzo
            </p>
            <LunchCard
              spot={day.lunch}
              comment={getComment(day.lunch.name)}
              commentKey={getKey(day.lunch.name)}
              isAdmin={isAdmin}
              onSaveComment={onSaveItemComment}
            />
          </div>
        )}

        {/* Tarde */}
        <div>
          <p className="text-xs font-semibold text-muted uppercase tracking-wider mb-2">
            🌤️ Tarde
          </p>
          <ActivityCard
            activity={day.afternoon}
            fallbackLabel="Tarde libre"
            comment={day.afternoon ? getComment(day.afternoon.name) : ""}
            commentKey={day.afternoon ? getKey(day.afternoon.name) : ""}
            isAdmin={isAdmin}
            onSaveComment={onSaveItemComment}
          />
        </div>

        {/* Noche */}
        {day.evening && (
          <div>
            <p className="text-xs font-semibold text-muted uppercase tracking-wider mb-2">
              🌙 Noche
            </p>
            <EveningCard
              idea={day.evening}
              comment={getComment(day.evening.name)}
              commentKey={getKey(day.evening.name)}
              isAdmin={isAdmin}
              onSaveComment={onSaveItemComment}
            />
          </div>
        )}
      </div>

      {/* Footer: costes y zonas */}
      <div className="px-4 sm:px-5 pb-4 sm:pb-5 space-y-3">
        {/* Presupuesto día */}
        <div className="bg-card border border-border rounded-lg p-3 text-xs">
          <p className="font-semibold text-muted uppercase tracking-wider mb-1.5">
            💰 Presupuesto diario
          </p>
          <div className="flex flex-wrap gap-x-4 gap-y-1 text-muted">
            <span>
              Alojamiento{" "}
              <span className="text-text font-medium">€{city.accommodation.perNight}</span>
            </span>
            <span>
              Comida <span className="text-text font-medium">€{city.food.perDay}</span>
            </span>
            <span>
              Transporte{" "}
              <span className="text-text font-medium">€{city.localTransport.perDay}</span>
            </span>
          </div>
        </div>

        {/* Zonas */}
        <div className="flex flex-wrap gap-3 text-xs">
          {city.recommendedZones?.length > 0 && (
            <div>
              <span className="text-green font-semibold">📍 Zonas: </span>
              <span className="text-muted">{city.recommendedZones.join(", ")}</span>
            </div>
          )}
          {city.avoidZones?.length > 0 && (
            <div>
              <span className="text-red font-semibold">⚠️ Evitar: </span>
              <span className="text-muted">{city.avoidZones.join(", ")}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
