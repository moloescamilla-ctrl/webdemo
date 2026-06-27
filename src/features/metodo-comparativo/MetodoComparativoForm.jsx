import { useState, useMemo } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { NumericInput } from '@/components/ui/numeric-input'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { formatCurrency, formatNumber } from '@/lib/utils'
import { PlusCircle, Trash2, TrendingUp, Info, Loader2, ClipboardList } from 'lucide-react'
import { calcularMetodoComparativo, calcFactorSuperficie } from './calculosComparativo'

let _cid = 1
const cuid = () => _cid++

const FUENTES = [
  'Inmuebles24', 'Lamudi', 'Metros Cúbicos', 'Vivanuncios',
  'easybroker', 'Oferta directa', 'Escritura pública', 'Otro',
]

const emptyCaptura = {
  descripcion: '',
  superficie: '',
  precioTotal: '',
  fuente: '',
  fecha: '',
  notas: '',
}

const newComp = (override = {}) => ({
  id: cuid(),
  descripcion: '',
  superficie: '',
  precioTotal: '',
  factorZona: '1.00',
  factorSuperficie: '1.00',
  factorEdad: '1.00',
  factorConservacion: '1.00',
  fuente: '',
  fecha: '',
  ...override,
})

const n = (v) => parseFloat(v) || 0

function factorColor(f) {
  if (!f || Math.abs(f - 1) < 0.001) return 'text-gray-500'
  return f > 1 ? 'text-green-600' : 'text-orange-500'
}

const inlineNum = 'bg-transparent border-0 shadow-none focus:outline-none focus:ring-0 text-gray-800 placeholder-gray-300 h-auto py-0 rounded-none'

export function MetodoComparativoForm({ onGuardar, guardando, superficieInicial = '', initialValues = null, comparablesImportados = null }) {
  const [supSujeto, setSupSujeto] = useState(
    initialValues ? String(initialValues.superficieSujeto || '') : String(superficieInicial || '')
  )
  const [comps, setComps] = useState(() => {
    const existing = initialValues?.comparables?.length
      ? initialValues.comparables.map(c => ({ ...c, id: cuid() }))
      : []
    const imported = comparablesImportados?.length
      ? comparablesImportados.map(c => newComp({
          descripcion: c.titulo_anuncio || [c.colonia, c.municipio].filter(Boolean).join(', ') || '',
          superficie: c.superficie_total_m2 ? String(c.superficie_total_m2) : '',
          precioTotal: c.precio_total ? String(c.precio_total) : '',
          fuente: c.portal || '',
        }))
      : []
    if (existing.length || imported.length) return [...existing, ...imported]
    return [newComp(), newComp(), newComp()]
  })
  const [captura, setCaptura] = useState(emptyCaptura)
  const [capturaError, setCapturaError] = useState(null)

  // ── Superficie del sujeto ────────────────────────────────────────────────
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

  // ── Tabla de homologación ────────────────────────────────────────────────
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

  // ── Captura de comparable ────────────────────────────────────────────────
  const handleCaptura = (e) => {
    const { name, value } = e.target
    setCaptura(prev => ({ ...prev, [name]: value }))
    if (capturaError) setCapturaError(null)
  }

  const agregarDesdeCaptura = () => {
    if (!captura.descripcion.trim()) { setCapturaError('Agrega una descripción o dirección.'); return }
    if (!captura.superficie)         { setCapturaError('Ingresa la superficie del comparable.'); return }
    if (!captura.precioTotal)        { setCapturaError('Ingresa el precio total del comparable.'); return }

    const sup = parseFloat(captura.superficie) || 0
    const supS = parseFloat(supSujeto) || 0
    const fs = supS > 0 && sup > 0 ? calcFactorSuperficie(supS, sup).toFixed(4) : '1.00'

    setComps(prev => [...prev, newComp({
      descripcion: captura.descripcion.trim(),
      superficie:  captura.superficie,
      precioTotal: captura.precioTotal,
      factorSuperficie: fs,
      fuente: captura.fuente,
      fecha:  captura.fecha,
    })])
    setCaptura(emptyCaptura)
    setCapturaError(null)
  }

  // ── Cálculo ──────────────────────────────────────────────────────────────
  const parsedComps = comps.map(c => ({
    ...c,
    superficie:        n(c.superficie),
    precioTotal:       n(c.precioTotal),
    factorZona:        n(c.factorZona) || 1,
    factorSuperficie:  n(c.factorSuperficie) || 1,
    factorEdad:        n(c.factorEdad) || 1,
    factorConservacion: n(c.factorConservacion) || 1,
  }))

  const resultado = useMemo(
    () => calcularMetodoComparativo(parsedComps, n(supSujeto)),
    [comps, supSujeto]
  )

  return (
    <div className="space-y-5">

      {/* ── Superficie del sujeto ── */}
      <Card>
        <CardHeader><CardTitle>Inmueble Sujeto</CardTitle></CardHeader>
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
            <p className="text-xs text-gray-400">Construcción para inmuebles edificados · Terreno para lotes</p>
          </div>
        </CardContent>
      </Card>

      {/* ── Captura de comparable ── */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <ClipboardList className="h-4 w-4 text-blue-600" />
            <CardTitle>Captura de comparable</CardTitle>
          </div>
          <p className="text-xs text-gray-400">Registra los datos de la fuente; al confirmar se agrega a la tabla de homologación.</p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2 space-y-1">
              <Label>Descripción / Dirección</Label>
              <Input
                name="descripcion"
                value={captura.descripcion}
                onChange={handleCaptura}
                placeholder="Av. Reforma 123 Col. Centro, casa 3 rec."
              />
            </div>
            <div className="space-y-1">
              <Label>Superficie</Label>
              <div className="relative">
                <NumericInput
                  name="superficie"
                  value={captura.superficie}
                  onChange={e => handleCaptura({ target: { name: 'superficie', value: e.target.value } })}
                  placeholder="0"
                  className="pr-10"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 pointer-events-none">m²</span>
              </div>
            </div>
            <div className="space-y-1">
              <Label>Precio total</Label>
              <div className="relative">
                <NumericInput
                  name="precioTotal"
                  value={captura.precioTotal}
                  onChange={e => handleCaptura({ target: { name: 'precioTotal', value: e.target.value } })}
                  placeholder="0"
                  className="pr-2"
                />
              </div>
            </div>
            <div className="space-y-1">
              <Label>Fuente</Label>
              <Select name="fuente" value={captura.fuente} onChange={handleCaptura}>
                <option value="">— Seleccionar —</option>
                {FUENTES.map(f => <option key={f} value={f}>{f}</option>)}
              </Select>
            </div>
            <div className="space-y-1">
              <Label>Fecha de información</Label>
              <Input name="fecha" type="date" value={captura.fecha} onChange={handleCaptura} />
            </div>
            <div className="sm:col-span-2 space-y-1">
              <Label>Notas <span className="text-gray-400 font-normal">(opcional)</span></Label>
              <Input
                name="notas"
                value={captura.notas}
                onChange={handleCaptura}
                placeholder="Observaciones sobre el comparable: estado, negociación, etc."
              />
            </div>
          </div>

          {capturaError && (
            <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded px-3 py-2">{capturaError}</p>
          )}

          {captura.superficie && captura.precioTotal && (
            <div className="text-xs text-gray-500 bg-gray-50 rounded px-3 py-2 flex gap-6">
              <span>
                $/m²: <strong className="text-gray-800">{formatNumber(n(captura.precioTotal) / n(captura.superficie), 2)}</strong>
              </span>
              {supSujeto && (
                <span>
                  F.Sup auto: <strong className="text-blue-700">
                    {calcFactorSuperficie(n(supSujeto), n(captura.superficie)).toFixed(4)}
                  </strong>
                </span>
              )}
            </div>
          )}

          <div className="flex justify-end">
            <button
              type="button"
              onClick={agregarDesdeCaptura}
              className="flex items-center gap-1.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-md transition-colors"
            >
              <PlusCircle className="h-4 w-4" />
              Agregar a tabla de homologación
            </button>
          </div>
        </CardContent>
      </Card>

      {/* ── Tabla de homologación ── */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Tabla de homologación</CardTitle>
            <button
              type="button"
              onClick={() => setComps(p => [...p, newComp()])}
              className="flex items-center gap-1 text-xs text-gray-400 hover:text-blue-600 transition-colors"
            >
              <PlusCircle className="h-3.5 w-3.5" />
              Fila vacía
            </button>
          </div>
          <p className="text-xs text-gray-400">
            Factor &gt; 1 = el sujeto es superior al comparable en ese atributo.
          </p>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[860px]">
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
                      <td className="px-3 py-2 max-w-[200px]">
                        <input
                          type="text"
                          placeholder={`Comparable ${idx + 1}`}
                          value={comp.descripcion}
                          onChange={e => updateComp(comp.id, 'descripcion', e.target.value)}
                          className="w-full text-sm bg-transparent border-0 focus:outline-none text-gray-800 placeholder-gray-300"
                        />
                        {(comp.fuente || comp.fecha) && (
                          <p className="text-[10px] text-gray-400 mt-0.5 leading-tight">
                            {[comp.fuente, comp.fecha].filter(Boolean).join(' · ')}
                          </p>
                        )}
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
                        {comps.length > 1 && (
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

      {/* ── Resultado ── */}
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
