import { useState } from 'react'
import { ChevronDown, ChevronRight, TrendingUp, AlertTriangle } from 'lucide-react'
import { NumericInput } from '@/components/ui/numeric-input'
import { Label } from '@/components/ui/label'
import { formatCurrency, formatNumber } from '@/lib/utils'

const SEGMENTOS = [
  'Habitacional popular',
  'Habitacional medio',
  'Habitacional residencial',
  'Habitacional residencial plus',
  'Comercial corredor',
  'Comercial centro',
  'Industrial',
  'Terreno urbano',
]

const RANGO_TIPICO   = { min: 0.75, max: 1.25 }
const RANGO_ABSOLUTO = { min: 0.50, max: 1.50 }

export function FactorComercializacion({ valorFisico, value, onChange }) {
  const [abierto, setAbierto] = useState(!!value?.activo)

  const activo      = value?.activo ?? false
  const factor      = parseFloat(value?.factor) || 1.0
  const segmento    = value?.segmento ?? ''
  const justificacion = value?.justificacion ?? ''

  const fueraAbsoluto = factor < RANGO_ABSOLUTO.min || factor > RANGO_ABSOLUTO.max
  const fueraTipico   = !fueraAbsoluto && (factor < RANGO_TIPICO.min || factor > RANGO_TIPICO.max)
  const valorMercado  = activo && valorFisico && !fueraAbsoluto ? valorFisico * factor : null

  const handle = (field, val) => onChange({ activo: true, ...(value ?? {}), [field]: val })

  const handleToggle = (checked) => {
    onChange({ activo: checked, factor: value?.factor ?? '1.0000', segmento: value?.segmento ?? '', justificacion: value?.justificacion ?? '' })
    if (checked) setAbierto(true)
  }

  return (
    <div className={`rounded-md border transition-colors ${activo ? 'border-emerald-300 bg-emerald-50/40' : 'border-gray-200 bg-white'}`}>
      <button
        type="button"
        className="w-full flex items-center gap-3 p-3 text-left"
        onClick={() => setAbierto(a => !a)}
      >
        <TrendingUp className={`h-4 w-4 shrink-0 ${activo ? 'text-emerald-600' : 'text-gray-400'}`} />
        <span className={`text-sm font-medium flex-1 ${activo ? 'text-emerald-800' : 'text-gray-600'}`}>
          Factor de Comercialización
        </span>
        <label
          className="flex items-center gap-2 cursor-pointer"
          onClick={e => e.stopPropagation()}
        >
          <input
            type="checkbox"
            checked={activo}
            onChange={e => handleToggle(e.target.checked)}
            className="h-4 w-4 rounded border-gray-300 accent-emerald-600"
          />
          <span className={`text-xs ${activo ? 'text-emerald-700 font-medium' : 'text-gray-400'}`}>
            {activo ? 'Activo' : 'Inactivo'}
          </span>
        </label>
        {abierto
          ? <ChevronDown className="h-4 w-4 text-gray-400 shrink-0" />
          : <ChevronRight className="h-4 w-4 text-gray-400 shrink-0" />
        }
      </button>

      {abierto && (
        <div className="px-3 pb-3 space-y-3 border-t border-gray-100">
          <p className="text-xs text-gray-500 pt-2">
            Ajusta el valor físico al valor de mercado estimado multiplicando por un factor observado
            en pares de venta de la misma microzona y segmento (Vm / Vf).
          </p>

          {/* Sugerencia estadística — placeholder hasta módulo suelo */}
          <div className="rounded-md bg-gray-50 border border-gray-200 p-3">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Sugerencia estadística</p>
            <p className="text-xs text-gray-400 italic">
              Sin datos estadísticos disponibles para esta microzona.
              Ingresa el factor manualmente y justifica la fuente.
            </p>
          </div>

          {/* Segmento */}
          <div className="space-y-1">
            <Label htmlFor="fc-segmento">
              Segmento de mercado <span className="text-gray-400 font-normal">(opcional)</span>
            </Label>
            <select
              id="fc-segmento"
              value={segmento}
              onChange={e => handle('segmento', e.target.value)}
              className="w-full h-9 rounded-md border border-gray-200 px-3 text-sm focus:outline-none focus:border-emerald-400"
            >
              <option value="">— Seleccionar segmento —</option>
              {SEGMENTOS.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>

          {/* Factor */}
          <div className="space-y-1">
            <Label htmlFor="fc-factor">Factor de Comercialización (fc)</Label>
            <div className="relative">
              <NumericInput
                id="fc-factor"
                value={value?.factor ?? ''}
                onChange={e => handle('factor', e.target.value)}
                placeholder="1.0000"
                className="pr-12"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 pointer-events-none">
                fc
              </span>
            </div>
            {fueraAbsoluto && (
              <div className="flex items-center gap-1.5 text-red-600">
                <AlertTriangle className="h-3 w-3 shrink-0" />
                <p className="text-xs">Fuera del rango permitido (0.50 – 1.50). Verifica el valor.</p>
              </div>
            )}
            {fueraTipico && (
              <div className="flex items-center gap-1.5 text-amber-600">
                <AlertTriangle className="h-3 w-3 shrink-0" />
                <p className="text-xs">Fuera del rango típico (0.75 – 1.25). Justifica en el campo siguiente.</p>
              </div>
            )}
            {!fueraAbsoluto && !fueraTipico && factor !== 1.0 && (
              <p className="text-xs text-emerald-600">Factor dentro del rango típico.</p>
            )}
          </div>

          {/* Justificación */}
          <div className="space-y-1">
            <Label htmlFor="fc-justificacion">
              Justificación <span className="text-red-500">*</span>
            </Label>
            <textarea
              id="fc-justificacion"
              value={justificacion}
              onChange={e => handle('justificacion', e.target.value)}
              placeholder="Describe la fuente y criterio de selección (p. ej. análisis de 6 pares de venta en la colonia, periodo ene–mar 2025, fc promedio 0.92)."
              rows={3}
              className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:border-emerald-400 resize-none"
            />
            {activo && !justificacion.trim() && (
              <p className="text-xs text-red-500">La justificación es obligatoria al usar el factor de comercialización.</p>
            )}
          </div>

          {/* Resultado */}
          {valorMercado !== null && (
            <div className="bg-emerald-600 text-white rounded-md p-4">
              <p className="text-sm text-emerald-100">Valor de mercado estimado</p>
              <p className="text-2xl font-bold mt-1">{formatCurrency(valorMercado)}</p>
              <p className="text-xs text-emerald-200 mt-1">
                {formatCurrency(valorFisico)} × fc {formatNumber(factor, 4)}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
