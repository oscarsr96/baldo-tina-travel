const STATUS_MAP = {
  pendiente: { label: "Pendiente", classes: "bg-blue/15 text-blue border-blue" },
  en_proceso: { label: "En proceso", classes: "bg-accent/15 text-accent border-accent" },
  propuestas_listas: { label: "Propuestas listas", classes: "bg-green/15 text-green border-green" },
  archivado: { label: "Archivado", classes: "bg-muted/15 text-muted border-muted" },
};

export default function StatusBadge({ status }) {
  const info = STATUS_MAP[status] || STATUS_MAP.pendiente;
  return (
    <span className={`inline-flex px-2.5 py-0.5 rounded-full border text-xs font-medium ${info.classes}`}>
      {info.label}
    </span>
  );
}
