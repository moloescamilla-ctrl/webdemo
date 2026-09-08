import { useState, useMemo } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { NumericInput } from '@/components/ui/numeric-input'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { formatCurrency, formatNumber } from '@/lib/utils'
import { PlusCircle, Trash2, Check, ChevronDown, ChevronUp } from 'lucide-react'
import { calcularComparativosTerreno, calcFactorSuperficieTerreno } from './calculosComparativosTerreno'

const FUENTES = [
  'Inmuebles24', 'Lamudi', 'Metros Cúbicos', 'Vivanuncios',
  'Oferta directa', 'Escritura pública / RPP', 'Otro',
]

let _cid = 100
const cuid = () => _cid++

const newComp = (override = {}) => ({
  id: cuid(),
  descripcion: '',
  superficie: '',
  precioTotal: '',
  factorZona: '1.00',
  factorSuperficie: '1.00',
  factorForma: '1.00',
  factorFrente: '1.00',
  factorServicios: '1.00',
  factorNegociacion: '0.90',
  fuente: '',
  fecha: '',
  ...override,
})

const n = (v) => parseFloat(v) || 0

function factorColor(f) {
  const fv = parseFloat(f) || 1
  if (Math.abs(fv - 1) < 0.005) return 'text-gray-500'
  return fv > 1 ? 'text-green-600' : 'text-orange-500'
}

const inlineNum = 'bg-transparent border-0 shadow-none focus:outline-none focus:ring-0 text-gray-800 placeholder-gray-300 h-auto py-0 rounded-none w-full text-right text-xs'
const inlineTxt = 'bg-transparent border-0 shadow-none focus:outline-none focus:ring-0 text-gray-800 placeholder-gray-300 h-auto py-0 rounded-none w-full text-xs'

const FACTORES = [
  { key: 'factorZona',        label: 'F.Zona'  },
  { key: 'factorSuperficie',  label: 'F.Sup'   },
  { key: 'factorForma',       label: 'F.Forma' },
  { key: 'factorFrente',      label: 'F.Frente'},
  { key: 'factorServicios',   label: 'F.Serv'  },
  { key: 'factorNegociacion', label: 'F.Neg'   },
]

export function ComparablesTerrenoPanel({ supSujeto, onChange, initialComparables = null, onUsarValor }) {
  const [comps, setComps] = useState(() =>
    initialComparables?.length
      ? initialComparables.map(c => ({ ...c, id: cuid() }))
      : [newComp()]
  )
  const [abierto, setAbierto] = useState(!!(initialComparables?.length))
  const [aplicado, setAplicado] = useState(false)

  const resultado = useMemo(
    () => calcularComparativosTerreno(
      comps.map(c => ({ ...c, superficie: n(c.superficie), precioTotal: n(c.precioTotal), ...Object.fromEntries(FACTORES.map(f => [f.key, n(c[f.key]) || 1])) })),
      n(supSujeto)
    ),
    [comps, supSujeto]
  )

  function update(id, field, value) {
    setComps(prev => {
      const next = prev.map(c => {
        if (c.id !== id) return c
        const updated = { ...c, [field]: value }
        if ((field === 'superficie') && supSujeto) {
          updated.factorSuperficie = calcFactorSuperficieTerreno(n(supSujeto), n(value)).toFixed(4)
        }
        return updated
      })
      onChange?.(next)
      return next
    })
  }

  function addComp() {
    const nuevo = newComp()
    if (supSujeto) {
      nuevo.factorSuperficie = '1.0000'
    }
    setComps(prev => { const next = [...prev, nuevo]; onChange?.(next); return next })
  }

  function removeComp(id) {
    setComps(prev => { const next = prev.filter(c => c.id !== id); onChange?.(next); return next })
  }

  function handleUsarValor() {
    if (!resultado.valorUnitarioPonderado) return
    onUsarValor?.(resultado.valorUnitarioPonderado)
    setAplicado(true)
    setTimeout(() => setAplicado(false), 2000)
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm">Comparables de Terreno</CardTitle>
          <button
            type="button"
            onClick={() => setAbierto(o => !o)}
            className="text-xs text-gray-400 hover:text-gray-600 flex items-center gap-1"
          >
            {abierto ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            {abierto ? 'Ocultar' : 'Mostrar'}
          </button>
        </div>
        <p className="text-xs text-gray-400">
          Homologación para determinar el valor unitario del terreno ($/m²)
        </p>
      </CardHeader>

      {abierto && (
        <CardContent className="space-y-3 pt-0">
          <div className="overflow-x-auto -mx-2">
            <table className="w-full text-xs border-collapse min-w-[700px]">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50/80">
                  <th className="text-left py-1.5 px-2 font-medium text-gray-500 min-w-[160px]">Descripción</th>
                  <th className="text-right py-1.5 px-2 font-medium text-gray-500 w-20">Sup. m²</th>
                  <th className="text-right py-1.5 px-2 font-medium text-gray-500 w-28">Precio total</th>
                  <th className="text-right py-1.5 px-2 font-medium text-gray-500 w-20">$/m²</th>
                  {FACTORES.map(f => (
                    <th key={f.key} className="text-right py-1.5 px-2 font-medium text-gray-500 w-16">{f.label}</th>
                  ))}
                  <th className="text-right py-1.5 px-2 font-medium text-gray-500 w-20">F.Total</th>
                  <th className="text-right py-1.5 px-2 font-medium text-[#1B2D4E] w-24">$/m² Homo</th>
                  <th className="w-6" />
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {comps.map((comp, idx) => {
                  const calc = resultado.comparables[idx] ?? {}
                  return (
                    <tr key={comp.id} className="hover:bg-gray-50/50">
                      <td className="py-1 px-2">
                        <input
                          className={inlineTxt}
                          placeholder={`Comparable ${idx + 1}`}
                          value={comp.descripcion}
                          onChange={e => update(comp.id, 'descripcion', e.target.value)}
                        />
                      </td>
                      <td className="py-1 px-2">
                        <input
                          type="number"
                          className={inlineNum}
                          placeholder="0"
                          value={comp.superficie}
                          onChange={e => update(comp.id, 'superficie', e.target.value)}
                        />
                      </td>
                      <td className="py-1 px-2">
                        <input
                          type="number"
                          className={inlineNum}
                          placeholder="0"
                          value={comp.precioTotal}
                          onChange={e => update(comp.id, 'precioTotal', e.target.value)}
                        />
                      </td>
                      <td className="py-1 px-2 text-right text-gray-500">
                        {calc.precioM2 > 0 ? formatNumber(calc.precioM2) : '—'}
                      </td>
                      {FACTORES.map(f => (
                        <td key={f.key} className="py-1 px-2">
                          <input
                            type="number"
                            step="0.01"
                            className={`${inlineNum} ${factorColor(comp[f.key])}`}
                            value={comp[f.key]}
                            onChange={e => update(comp.id, f.key, e.target.value)}
                          />
                        </td>
                      ))}
                      <td className={`py-1 px-2 text-right font-medium ${factorColor(calc.factorTotal)}`}>
                        {calc.factorTotal ? calc.factorTotal.toFixed(3) : '—'}
                      </td>
                      <td className="py-1 px-2 text-right font-semibold text-[#1B2D4E]">
                        {calc.precioM2Homologado > 0 ? formatNumber(calc.precioM2Homologado) : '—'}
                      </td>
                      <td className="py-1 px-2">
                        <button
                          type="button"
                          onClick={() => removeComp(comp.id)}
                          className="text-gray-300 hover:text-red-400 transition-colors"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
              {resultado.nComparables > 0 && (
                <tfoot>
                  <tr className="border-t-2 border-[#1B2D4E]/20 bg-[#1B2D4E]/[0.03]">
                    <td colSpan={4 + FACTORES.length} className="py-2 px-2 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                      Valor Unitario Ponderado ({resultado.nComparables} comparables)
                    </td>
                    <td />
                    <td className="py-2 px-2 text-right font-bold text-[#1B2D4E] text-sm">
                      {formatCurrency(resultado.valorUnitarioPonderado)}/m²
                    </td>
                    <td />
                  </tr>
                </tfoot>
              )}
            </table>
          </div>

          <div className="flex items-center justify-between gap-3 pt-1">
            <button
              type="button"
              onClick={addComp}
              className="flex items-center gap-1.5 text-xs text-[#1B2D4E] hover:text-[#2A4A7F] transition-colors"
            >
              <PlusCircle className="h-3.5 w-3.5" />
              Agregar comparable
            </button>

            {resultado.valorUnitarioPonderado > 0 && onUsarValor && (
              <Button
                type="button"
                size="sm"
                className="h-8 text-xs bg-[#1B2D4E] hover:bg-[#2A4A7F]"
                onClick={handleUsarValor}
              >
                {aplicado
                  ? <><Check className="h-3.5 w-3.5 mr-1" />Aplicado</>
                  : `Usar ${formatCurrency(resultado.valorUnitarioPonderado)}/m² como VU terreno`
                }
              </Button>
            )}
          </div>

          <div className="rounded-md bg-gray-50 border border-gray-100 px-3 py-2 text-xs text-gray-500 space-y-0.5">
            <p><strong>F.Zona</strong>: ubicación relativa · <strong>F.Sup</strong>: se auto-calcula si captura superficie sujeto · <strong>F.Forma</strong>: regular=1 / irregular&lt;1</p>
            <p><strong>F.Frente</strong>: frente amplio&gt;1 · <strong>F.Serv</strong>: servicios completos=1 · <strong>F.Neg</strong>: oferta vs. venta (típico 0.85–0.95)</p>
          </div>
        </CardContent>
      )}
    </Card>
  )
}
