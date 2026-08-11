import { formatCurrency } from '@/lib/utils'
import { Loader2, MapPin, CheckCircle, AlertCircle, XCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'

function Fila({ label, valor }) {
  if (valor == null || valor === '') return null
  return (
    <div className="flex justify-between gap-3 text-xs py-1 border-b border-gray-100 last:border-0">
      <span className="text-gray-500 shrink-0">{label}</span>
      <span className="font-medium text-gray-800 text-right">{valor}</span>
    </div>
  )
}

function BadgeConfiabilidad({ nivel }) {
  const map = {
    alta:         { cls: 'bg-green-100 text-green-700',  txt: 'Alta (n≥6)'  },
    media:        { cls: 'bg-amber-100 text-amber-700',  txt: 'Media (3–5)' },
    baja:         { cls: 'bg-red-100 text-red-700',      txt: 'Baja (<3)'   },
    insuficiente: { cls: 'bg-gray-100 text-gray-500',    txt: 'Sin datos'   },
  }
  const { cls, txt } = map[nivel] ?? map.insuficiente
  return <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${cls}`}>{txt}</span>
}

function Placeholder({ lat, lng }) {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center px-6 py-10 text-gray-400">
      <MapPin className="h-10 w-10 mb-3 text-gray-200" />
      <p className="text-sm font-medium text-gray-500">Haz clic en el mapa</p>
      <p className="text-xs mt-1">
        {lat != null ? `${lat.toFixed(5)}, ${lng.toFixed(5)}` : 'para consultar la zonificación'}
      </p>
    </div>
  )
}

export function PanelZona({ resultado, consultando, coordenadas }) {
  if (consultando) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-6 w-6 animate-spin text-[#1B2D4E]" />
      </div>
    )
  }

  if (!resultado) return <Placeholder />

  const { municipio, microzona, zona, valor_suelo, mensaje } = resultado

  if (mensaje) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center px-6 py-10">
        <XCircle className="h-8 w-8 text-gray-300 mb-3" />
        <p className="text-sm text-gray-500">{mensaje}</p>
        {coordenadas && (
          <p className="text-xs text-gray-400 mt-2 font-mono">
            {coordenadas.lat.toFixed(6)}, {coordenadas.lng.toFixed(6)}
          </p>
        )}
      </div>
    )
  }

  return (
    <div className="overflow-y-auto h-full p-4 space-y-4">
      {/* Cabecera */}
      <div>
        <div className="flex items-start justify-between gap-2">
          <div>
            {zona?.clave && (
              <span className="text-xs font-mono bg-[#1B2D4E] text-white px-2 py-0.5 rounded">
                {zona.clave}
              </span>
            )}
            {zona?.descripcion && (
              <p className="text-sm font-semibold text-gray-800 mt-1">{zona.descripcion}</p>
            )}
            {zona?.categoria && (
              <p className="text-xs text-gray-500 capitalize">{zona.categoria}</p>
            )}
          </div>
          {zona?.verificado != null && (
            zona.verificado
              ? <CheckCircle className="h-4 w-4 text-green-500 shrink-0 mt-1" />
              : <AlertCircle className="h-4 w-4 text-amber-400 shrink-0 mt-1" title="Parámetros pendientes de verificación (Anexo I)" />
          )}
        </div>
        {microzona && (
          <p className="text-xs text-[#1B2D4E] mt-1">
            Microzona: <strong>{microzona.nombre}</strong>
          </p>
        )}
        {municipio && (
          <p className="text-xs text-gray-400">{municipio.nombre}, {municipio.estado}</p>
        )}
        {coordenadas && (
          <p className="text-xs font-mono text-gray-300 mt-0.5">
            {coordenadas.lat.toFixed(6)}, {coordenadas.lng.toFixed(6)}
          </p>
        )}
      </div>

      {/* Parámetros normativos */}
      {zona && (
        <div>
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">
            Parámetros PMDU
            {!zona.verificado && (
              <span className="ml-1 text-amber-500 normal-case font-normal">
                — pendiente Anexo I
              </span>
            )}
          </p>
          <div className="rounded-md border border-gray-100 divide-y divide-gray-100 bg-gray-50/50">
            <div className="px-3 py-1">
              <Fila label="COS"           valor={zona.cos} />
              <Fila label="CUS"           valor={zona.cus} />
              <Fila label="CPS"           valor={zona.cps} />
              <Fila label="Niveles máx."  valor={zona.niveles_max} />
              <Fila label="Altura máx."   valor={zona.altura_max_m != null ? `${zona.altura_max_m} m` : null} />
              <Fila label="Lote mínimo"   valor={zona.lote_minimo_m2 != null ? `${zona.lote_minimo_m2} m²` : null} />
              <Fila label="Densidad"
                valor={
                  zona.densidad_min != null || zona.densidad_max != null
                    ? [zona.densidad_min && `>${zona.densidad_min}`, zona.densidad_max && `≤${zona.densidad_max}`]
                        .filter(Boolean).join(' ') + ' viv/ha'
                    : null
                }
              />
              {zona.mezcla_usm_pct != null && (
                <Fila label="Mezcla C/S–Hab." valor={`${zona.mezcla_usm_pct}% / ${zona.mezcla_hab_pct}%`} />
              )}
            </div>
          </div>
          {zona.restricciones && (
            <p className="text-xs text-gray-400 mt-1 italic">{zona.restricciones}</p>
          )}
        </div>
      )}

      {/* Valor de suelo */}
      {valor_suelo && (
        <div>
          <div className="flex items-center justify-between mb-1">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
              Mercado de suelo {valor_suelo.corte ? `· ${valor_suelo.corte}` : ''}
            </p>
            <BadgeConfiabilidad nivel={valor_suelo.confiabilidad} />
          </div>

          {valor_suelo.valor_recomendado ? (
            <div className="rounded-md bg-[#1B2D4E] text-white p-3">
              <p className="text-xs text-blue-300 mb-0.5">Valor recomendado VT-V</p>
              <p className="text-xl font-bold">
                {formatCurrency(valor_suelo.valor_recomendado)}/m²
              </p>
              {valor_suelo.rango_inf != null && (
                <p className="text-xs text-blue-200 mt-1">
                  Rango P25–P75: {formatCurrency(valor_suelo.rango_inf)} – {formatCurrency(valor_suelo.rango_sup)}/m²
                </p>
              )}
              {valor_suelo.n_comparables > 0 && (
                <p className="text-xs text-blue-300 mt-0.5">
                  {valor_suelo.n_comparables} comparables
                </p>
              )}
            </div>
          ) : (
            <div className="rounded-md border border-dashed border-gray-200 p-3 text-center">
              <p className="text-xs text-gray-400">
                Sin comparables de terreno registrados
                {valor_suelo.corte ? ` para el corte ${valor_suelo.corte}` : ''}.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
