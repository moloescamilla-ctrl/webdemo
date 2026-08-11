import { useSuelo } from '@/hooks/useSuelo'
import { Button } from '@/components/ui/button'
import { formatCurrency } from '@/lib/utils'
import { MapPin, Loader2, ChevronDown, ChevronUp, Check } from 'lucide-react'
import { useState } from 'react'

function BadgeConfiabilidad({ nivel }) {
  const estilos = {
    alta:         'bg-green-100 text-green-800',
    media:        'bg-amber-100 text-amber-800',
    baja:         'bg-red-100 text-red-700',
    insuficiente: 'bg-gray-100 text-gray-500',
  }
  const etiquetas = {
    alta: 'Alta (n≥6)', media: 'Media (3–5)', baja: 'Baja (<3)', insuficiente: 'Sin datos',
  }
  const cls = estilos[nivel] ?? estilos.insuficiente
  return (
    <span className={`text-xs font-medium px-1.5 py-0.5 rounded-full ${cls}`}>
      {etiquetas[nivel] ?? nivel}
    </span>
  )
}

function FilaParam({ label, valor }) {
  if (valor == null) return null
  return (
    <div className="flex justify-between text-xs py-0.5">
      <span className="text-gray-500">{label}</span>
      <span className="font-medium text-gray-700">{valor}</span>
    </div>
  )
}

export function ConsultarSuelo({ latitud, longitud, onAplicarValor }) {
  const { consultarSuelo, consultando, resultado, error, resetResultado } = useSuelo()
  const [abierto, setAbierto] = useState(false)
  const [aplicado, setAplicado] = useState(false)

  const tieneCoords = latitud != null && longitud != null
    && String(latitud).trim() !== '' && String(longitud).trim() !== ''

  async function handleConsultar() {
    const res = await consultarSuelo(latitud, longitud)
    if (res) setAbierto(true)
  }

  function handleAplicar(valorM2) {
    onAplicarValor(valorM2)
    setAplicado(true)
    setTimeout(() => setAplicado(false), 2000)
  }

  const zona       = resultado?.zona
  const valorSuelo = resultado?.valor_suelo
  const microzona  = resultado?.microzona
  const mensaje    = resultado?.mensaje

  return (
    <div className="rounded-lg border border-dashed border-[#1B2D4E]/30 bg-[#1B2D4E]/[0.02] p-3">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 min-w-0">
          <MapPin className="h-4 w-4 text-[#1B2D4E] shrink-0" />
          <div className="min-w-0">
            <p className="text-xs font-semibold text-[#1B2D4E]">Valor de suelo MVGS</p>
            {!tieneCoords && (
              <p className="text-xs text-gray-400">
                Captura latitud y longitud del predio para consultar
              </p>
            )}
            {tieneCoords && !resultado && !error && (
              <p className="text-xs text-gray-400">
                {latitud}, {longitud}
              </p>
            )}
            {error && (
              <p className="text-xs text-red-600 truncate">{error}</p>
            )}
            {resultado && mensaje && (
              <p className="text-xs text-amber-600">{mensaje}</p>
            )}
            {resultado && zona && (
              <p className="text-xs text-gray-600">
                <span className="font-medium text-[#1B2D4E]">{zona.clave}</span>
                {zona.descripcion ? ` — ${zona.descripcion}` : ''}
                {microzona ? ` · ${microzona.nombre}` : ''}
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {resultado && zona && (
            <button
              type="button"
              onClick={() => setAbierto(o => !o)}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              {abierto ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </button>
          )}
          <Button
            type="button"
            size="sm"
            variant="outline"
            disabled={!tieneCoords || consultando}
            onClick={handleConsultar}
            className="text-xs h-7 border-[#1B2D4E]/40 text-[#1B2D4E] hover:bg-[#1B2D4E]/5"
          >
            {consultando
              ? <><Loader2 className="h-3 w-3 animate-spin mr-1" />Consultando…</>
              : resultado ? 'Actualizar' : 'Consultar'
            }
          </Button>
        </div>
      </div>

      {abierto && resultado && zona && (
        <div className="mt-3 pt-3 border-t border-gray-200 space-y-3">
          {/* Parámetros normativos */}
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
              Parámetros PMDU
              {!zona.verificado && (
                <span className="ml-2 text-amber-600 normal-case font-normal">
                  (pendiente verificación Anexo I)
                </span>
              )}
            </p>
            <div className="divide-y divide-gray-100">
              <FilaParam label="Categoría"       valor={zona.categoria} />
              <FilaParam label="COS"             valor={zona.cos} />
              <FilaParam label="CUS"             valor={zona.cus} />
              <FilaParam label="CPS"             valor={zona.cps} />
              <FilaParam label="Lote mínimo"     valor={zona.lote_minimo_m2 != null ? `${zona.lote_minimo_m2} m²` : null} />
              <FilaParam label="Niveles máx."    valor={zona.niveles_max} />
              <FilaParam label="Altura máx."     valor={zona.altura_max_m != null ? `${zona.altura_max_m} m` : null} />
              <FilaParam label="Densidad"
                valor={
                  zona.densidad_min != null || zona.densidad_max != null
                    ? [zona.densidad_min && `>${zona.densidad_min}`, zona.densidad_max && `≤${zona.densidad_max}`]
                        .filter(Boolean).join(' ') + ' viv/ha'
                    : null
                }
              />
              {zona.mezcla_usm_pct != null && (
                <FilaParam label="Mezcla C/S / Hab."
                  valor={`${zona.mezcla_usm_pct}% / ${zona.mezcla_hab_pct}%`} />
              )}
            </div>
            {zona.restricciones && (
              <p className="text-xs text-gray-400 mt-1 italic">{zona.restricciones}</p>
            )}
          </div>

          {/* Estadística de valor de suelo */}
          {valorSuelo && (
            <div>
              <div className="flex items-center justify-between mb-1">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  Mercado de suelo — {valorSuelo.corte ?? '—'}
                </p>
                <BadgeConfiabilidad nivel={valorSuelo.confiabilidad} />
              </div>

              {valorSuelo.valor_recomendado ? (
                <>
                  <div className="divide-y divide-gray-100">
                    <FilaParam label="Valor recomendado" valor={formatCurrency(valorSuelo.valor_recomendado) + '/m²'} />
                    <FilaParam label="Mediana"           valor={valorSuelo.mediana ? formatCurrency(valorSuelo.mediana) + '/m²' : null} />
                    <FilaParam label="Rango P25–P75"
                      valor={
                        valorSuelo.rango_inf != null && valorSuelo.rango_sup != null
                          ? `${formatCurrency(valorSuelo.rango_inf)} – ${formatCurrency(valorSuelo.rango_sup)}/m²`
                          : null
                      }
                    />
                    <FilaParam label="Comparables"       valor={`${valorSuelo.n_comparables} registros`} />
                  </div>
                  <Button
                    type="button"
                    size="sm"
                    className="w-full mt-2 h-8 text-xs bg-[#1B2D4E] hover:bg-[#2A4A7F]"
                    onClick={() => handleAplicar(valorSuelo.valor_recomendado)}
                  >
                    {aplicado
                      ? <><Check className="h-3.5 w-3.5 mr-1" />Aplicado</>
                      : `Usar ${formatCurrency(valorSuelo.valor_recomendado)}/m² como valor unitario`
                    }
                  </Button>
                </>
              ) : (
                <p className="text-xs text-gray-400 text-center py-2">
                  Sin comparables de terreno en esta microzona para el corte {valorSuelo.corte ?? 'actual'}.
                </p>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
