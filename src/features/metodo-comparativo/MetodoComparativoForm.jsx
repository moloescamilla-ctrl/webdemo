import { useState, useMemo } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { NumericInput } from '@/components/ui/numeric-input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { formatCurrency, formatNumber } from '@/lib/utils'
import { PlusCircle, Trash2, TrendingUp, Info, Loader2 } from 'lucide-react'
import { calcularMetodoComparativo, calcFactorSuperficie } from './calculosComparativo'

let _cid = 1
const cuid = () => _cid++

const newComp = () => ({
  id: cuid(),
  descripcion: '',
  superficie: '',
  precioTotal: '',
  factorZona: '1.00',
  factorSuperficie: '1.00',
  factorEdad: '1.00',
  factorConservacion: '1.00',
})

const n = (v) => parseFloat(v) || 0

function factorColor(f) {
  if (!f || Math.abs(f - 1) < 0.001) return 'text-gray-500'
  return f > 1 ? 'text-green-600' : 'text-orange-500'
}

const inlineNum = 'bg-transparent border-0 shadow-none focus:outline-none focus:ring-0 text-gray-800 placeholder-gray-300 h-auto py-0 rounded-none'

export function MetodoComparativoForm({ onGuardar, guardando, superficieInicial = '', initialValues = null }) {
  const [supSujeto, setSupSujeto] = useState(
    initialValues ? String(initialValues.superficieSujeto || '') : String(superficieInicial || '')
  )
  const [comps, setComps] = useState(() => {
    if (initialValues?.comparables?.length) {
      return initialValues.comparables.map(c => ({ ...c, id: cuid() }))
    }
    return [newComp(), newComp(), newComp()]
  })

  const updateSupSujeto = (val) => {
    setSupSujeto(val)
    const sup = parseFloat(val) || 0
    if (sup > 0) {
      setComps(prev => prev.map(c => ({
        ...c,
        factorSuperficie: calcFactorSuperficie(sup, n(c.superficie)).toFixed(4),
      })))
    }
  }

  const updateComp = (id, field, val) => {
    setComps(prev => prev.map(c => {
      if (c.id !== id) return c
      const updated = { ...c, [field]: val }
      if (field === 'superficie') {
        const sup = parseFloat(supSujeto) || 0
        if (sup > 0) {
          updated.factorSuperficie = calcFactorSuperficie(sup, parseFloat(val) || 0).toFixed(4)
        }
      }
      return updated
    }))
  }

  const parsedComps = comps.map(c => ({
    ...c,
    superficie: n(c.superficie),
    precioTotal: n(c.precioTotal),
    factorZona: n(c.factorZona) || 1,
    factorSuperficie: n(c.factorSuperficie) || 1,
    factorEdad: n(c.factorEdad) || 1,
    factorConservacion: n(c.factorConservacion) || 1,
  }))

  const resultado = useMemo(
    () => calcularMetodoComparativo(parsedComps, n(supSujeto)),
    [comps, supSujeto]
  )

  return (
    <div className="space-y-5">
      <Card>
        <CardHeader><CardTitle>Datos del Sujeto</CardTitle></CardHeader>
        <CardContent>
          <div className="max-w-xs space-y-1">
            <Label htmlFor="supSujeto">Superficie a comparar</Label>
            <div className="relative">
              <NumericInput
                id="supSujeto"
                value={supSujeto}
                onChange={e => updateSupSujeto(e.target.value)}
                className="pr-10"
                placeholder="0"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 pointer-events-none">m²</span>
            </div>
            <p className="text-xs text-gray-400">
              Construcción para inmuebles edificados · Terreno para lotes
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Inmuebles Comparables</CardTitle>
            <button
              type="button"
              onClick={() => setComps(p => [...p, newComp()])}
              className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800"
            >
              <PlusCircle className="h-3.5 w-3.5" />
              Agregar comparable
            </button>
          </div>
          <p className="text-xs text-gray-400">
            Mínimo 3 comparables. Factor &gt; 1 = sujeto superior al comparable en ese atributo.
          </p>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[820px]">
              <thead className="bg-gray-50 border-y border-gray-200">
                <tr>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">Descripción</th>
                  <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 w-28">Sup m²</th>
                  <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 w-32">Precio total $</th>
                  <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 w-24 bg-gray-100">$/m²</th>
                  <th className="px-2 py-2 text-center text-xs font-medium text-gray-500 w-16">F.Zona</th>
                  <th className="px-2 py-2 text-center text-xs font-medium text-gray-500 w-16">F.Sup</th>
                  <th className="px-2 py-2 text-center text-xs font-medium text-gray-500 w-16">F.Edad</th>
                  <th className="px-2 py-2 text-center text-xs font-medium text-gray-500 w-16">F.Cons</th>
                  <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 w-20 bg-gray-100">F.Total</th>
                  <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 w-28 bg-blue-50">$/m² Homo</th>
                  <th className="w-8" />
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {comps.map((comp, idx) => {
                  const sup = n(comp.superficie)
                  const precio = n(comp.precioTotal)
                  const precioM2 = sup > 0 && precio > 0 ? precio / sup : null
                  const fz = n(comp.factorZona) || 1
                  const fs = n(comp.factorSuperficie) || 1
                  const fe = n(comp.factorEdad) || 1
                  const fc = n(comp.factorConservacion) || 1
                  const factorTotal = fz * fs * fe * fc
                  const precioHomo = precioM2 ? precioM2 * factorTotal : null
                  return (
                    <tr key={comp.id} className="hover:bg-gray-50">
                      <td className="px-3 py-2">
                        <input
                          type="text"
                          placeholder={`Comparable ${idx + 1}`}
                          value={comp.descripcion}
                          onChange={e => updateComp(comp.id, 'descripcion', e.target.value)}
                          className="w-full text-sm bg-transparent border-0 focus:outline-none text-gray-800 placeholder-gray-300"
                        />
                      </td>
                      <td className="px-3 py-2">
                        <NumericInput
                          value={comp.superficie}
                          onChange={e => updateComp(comp.id, 'superficie', e.target.value)}
                          placeholder="0"
                          className={`w-full text-right text-sm ${inlineNum}`}
                        />
                      </td>
                      <td className="px-3 py-2">
                        <NumericInput
                          value={comp.precioTotal}
                          onChange={e => updateComp(comp.id, 'precioTotal', e.target.value)}
                          placeholder="0"
                          className={`w-full text-right text-sm ${inlineNum}`}
                        />
                      </td>
                      <td className="px-3 py-2 bg-gray-50 text-right font-mono text-xs text-gray-500">
                        {precioM2 ? formatNumber(precioM2, 2) : '—'}
                      </td>
                      {[
                        ['factorZona', fz],
                        ['factorSuperficie', fs],
                        ['factorEdad', fe],
                        ['factorConservacion', fc],
                      ].map(([field, val]) => (
                        <td key={field} className="px-2 py-2">
                          <input
                            type="number" step="0.01" min="0.01" placeholder="1.00"
                            value={comp[field]}
                            onChange={e => updateComp(comp.id, field, e.target.value)}
                            className={`w-14 text-center text-sm bg-transparent border-0 focus:outline-none placeholder-gray-300 ${factorColor(val)}`}
                          />
                        </td>
                      ))}
                      <td className="px-3 py-2 bg-gray-50 text-right font-mono text-xs font-semibold text-gray-700">
                        {factorTotal.toFixed(4)}
                      </td>
                      <td className="px-3 py-2 bg-blue-50 text-right font-mono text-xs font-semibold text-blue-700">
                        {precioHomo ? formatNumber(precioHomo, 2) : '—'}
                      </td>
                      <td className="px-2 py-2">
                        {comps.length > 3 && (
                          <button
                            type="button"
                            onClick={() => setComps(p => p.filter(c => c.id !== comp.id))}
                            className="text-gray-300 hover:text-red-400 transition-colors"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <Card className="sticky top-6">
        <CardHeader>
          <div className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-green-600" />
            <CardTitle>Resultado — Método Comparativo</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {!resultado ? (
            <div className="flex items-start gap-2 p-3 bg-gray-50 rounded-md text-sm text-gray-500">
              <Info className="h-4 w-4 mt-0.5 shrink-0" />
              Completa la superficie del sujeto y al menos un comparable con precio para ver el resultado.
            </div>
          ) : (
            <>
              <div className="bg-gray-50 rounded-md overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">Comparable</th>
                      <th className="px-3 py-2 text-right text-xs font-medium text-gray-500">F.Total</th>
                      <th className="px-3 py-2 text-right text-xs font-medium text-gray-500">$/m² Homo</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {resultado.comparables
                      .filter(c => c.precioM2Homologado > 0)
                      .map((c, i) => (
                        <tr key={c.id}>
                          <td className="px-3 py-1.5 text-gray-600 text-sm">{c.descripcion || `Comparable ${i + 1}`}</td>
                          <td className="px-3 py-1.5 text-right font-mono text-xs text-gray-500">{c.factorTotal.toFixed(4)}</td>
                          <td className="px-3 py-1.5 text-right font-mono text-xs font-semibold text-blue-700">{formatNumber(c.precioM2Homologado, 2)}</td>
                        </tr>
                      ))}
                  </tbody>
                  <tfoot className="border-t border-gray-300 bg-gray-100">
                    <tr>
                      <td className="px-3 py-2 text-xs font-semibold text-gray-600" colSpan={2}>
                        Valor unitario ponderado ({resultado.nComparables} comparables)
                      </td>
                      <td className="px-3 py-2 text-right font-mono text-sm font-bold text-blue-800">
                        {formatNumber(resultado.valorUnitarioPonderado, 2)}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>

              <div className="bg-green-600 text-white rounded-md p-4">
                <p className="text-sm text-green-100">Valor comparativo total del inmueble</p>
                <p className="text-2xl font-bold mt-1">{formatCurrency(resultado.valorComparativoTotal)}</p>
                <p className="text-xs text-green-200 mt-1">
                  {formatNumber(resultado.valorUnitarioPonderado, 2)} $/m² × {formatNumber(n(supSujeto), 2)} m²
                </p>
              </div>

              {onGuardar && (
                <Button
                  className="w-full"
                  onClick={() => onGuardar(resultado, n(supSujeto))}
                  disabled={guardando}
                >
                  {guardando
                    ? <><Loader2 className="h-4 w-4 animate-spin" /> Guardando...</>
                    : 'Guardar resultado en expediente'
                  }
                </Button>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
