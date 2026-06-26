import { Badge } from '@/components/ui/badge'
import { formatCurrency, formatNumber } from '@/lib/utils'
import { CheckCircle2, XCircle, Clock, Eye, Trash2 } from 'lucide-react'

const ESTADO = {
  pendiente:  { Icon: Clock,        color: 'text-yellow-500', variant: 'warning',   label: 'Pendiente' },
  aprobado:   { Icon: CheckCircle2, color: 'text-green-600',  variant: 'success',   label: 'Aprobado' },
  descartado: { Icon: XCircle,      color: 'text-gray-400',   variant: 'secondary', label: 'Descartado' },
}

export function ComparableBuffer({ comparables, onRevisar, onEliminar }) {
  if (!comparables.length) {
    return (
      <p className="text-sm text-gray-400 text-center py-8">
        Aún no hay comparables. Usa Claude for Chrome desde un portal inmobiliario, o pega el texto del anuncio.
      </p>
    )
  }

  return (
    <div className="space-y-2">
      {comparables.map(c => {
        const cfg = ESTADO[c.estado_revision] ?? ESTADO.pendiente
        const { Icon } = cfg
        return (
          <div
            key={c.id}
            className={`border rounded-lg p-3 flex items-center gap-3 transition-opacity ${
              c.estado_revision === 'descartado' ? 'opacity-40' : 'border-gray-200'
            }`}
          >
            <Icon className={`h-4 w-4 shrink-0 ${cfg.color}`} />

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <p className="text-sm font-medium text-gray-800 truncate">
                  {c.titulo_anuncio || [c.colonia, c.municipio].filter(Boolean).join(', ') || 'Sin título'}
                </p>
                {c.fuente_captura === 'chrome' && (
                  <span className="shrink-0 text-[10px] bg-purple-100 text-purple-700 px-1.5 py-0.5 rounded font-medium">
                    Chrome
                  </span>
                )}
              </div>
              <div className="flex items-center gap-3 mt-0.5 flex-wrap">
                {c.precio_total > 0 && (
                  <span className="text-xs text-gray-500">{formatCurrency(c.precio_total)}</span>
                )}
                {c.superficie_total_m2 > 0 && (
                  <span className="text-xs text-gray-500">{formatNumber(c.superficie_total_m2, 0)} m²</span>
                )}
                {c.precio_unitario > 0 && (
                  <span className="text-xs font-semibold text-blue-700">{formatNumber(c.precio_unitario, 0)} $/m²</span>
                )}
              </div>
            </div>

            <Badge variant={cfg.variant} className="text-xs shrink-0">{cfg.label}</Badge>

            <div className="flex items-center gap-0.5 shrink-0">
              {c.estado_revision !== 'descartado' && (
                <button
                  onClick={() => onRevisar(c)}
                  className="p-1.5 text-gray-300 hover:text-blue-600 transition-colors rounded"
                  title="Revisar y editar"
                >
                  <Eye className="h-3.5 w-3.5" />
                </button>
              )}
              <button
                onClick={() => onEliminar(c.id)}
                className="p-1.5 text-gray-300 hover:text-red-500 transition-colors rounded"
                title="Eliminar del buffer"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        )
      })}
    </div>
  )
}
