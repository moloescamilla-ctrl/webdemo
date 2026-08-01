const CONFIG = {
  en_revision:     { label: 'En revisión',      cls: 'bg-yellow-100 text-yellow-700 border-yellow-200' },
  con_comentarios: { label: 'Con comentarios',  cls: 'bg-orange-100 text-orange-700 border-orange-200' },
  revision_cerrada:{ label: 'Revisión cerrada', cls: 'bg-green-100  text-green-700  border-green-200'  },
}

export function BadgeRevision({ estadoRevision, pendientes = 0, className = '' }) {
  const cfg = CONFIG[estadoRevision]
  if (!cfg) return null
  return (
    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium border ${cfg.cls} ${className}`}>
      {cfg.label}
      {pendientes > 0 && (
        <span className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-orange-500 text-white text-[10px] font-bold leading-none">
          {pendientes}
        </span>
      )}
    </span>
  )
}
