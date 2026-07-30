import { useState, useMemo } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { NumericInput } from '@/components/ui/numeric-input'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { formatCurrency, formatNumber } from '@/lib/utils'
import { TrendingUp, Info, Loader2, AlertTriangle, CheckCircle2 } from 'lucide-react'
import { useCostosM2 } from '@/hooks/useCostosM2'
import { calcularMetodoResidual } from './calculosResidual'
import { FormulaPanel } from '@/components/ui/formula-panel'

const n = (v) => parseFloat(v) || 0

const FORMULAS_RESIDUAL = [
  {
    titulo: 'Fórmula base',
    formula: 'F = VM − Ci − Up\n\nF  = Valor residual (terreno o inmueble)\nVM = Valor de mercado producto terminado\nCi = Costo de inversión total\nUp = Utilidad del promotor',
  },
  {
    titulo: 'Costo de Inversión (Ci)',
    formula: 'Ci = Costo Construcción\n   + (proy + perm + gest\n      + com + fin + impr) % × VM',
    nota: 'Los porcentajes se aplican sobre el VM.',
  },
  {
    titulo: 'Utilidad del promotor (Up)',
    formula: 'Up = VM × Utilidad% / 100',
  },
  {
    titulo: 'Valor residual / m² terreno',
    formula: 'F/m² = F / Superficie terreno',
    nota: 'Útil para comparar con valor unitario del suelo.',
  },
]

const CI_COMPONENTES = [
  { key: 'proyecto',         label: 'Proyecto arq. e ingeniería',  defecto: '2' },
  { key: 'permisos',         label: 'Permisos y licencias',        defecto: '1' },
  { key: 'gestion',          label: 'Honorarios de gestión',       defecto: '2' },
  { key: 'comercializacion', label: 'Gastos de comercialización',  defecto: '3' },
  { key: 'financiamiento',   label: 'Gastos de financiamiento',    defecto: '2' },
  { key: 'imprevistos',      label: 'Imprevistos',                 defecto: '4' },
]

export function MetodoResidualForm({
  onGuardar,
  guardando,
  submitLabel,
  initialValues = null,
  superficieTerrenoDefecto = null,
  costoM2Defecto = null,
  vmSugerido = null,
}) {
  const iv = initialValues ?? {}
  const { costos, porFuente, cargando: cargandoCostos } = useCostosM2()

  const [casoUso, setCasoUso] = useState(iv.caso_uso ?? 'terreno')
  const [descripcion, setDescripcion] = useState(iv.descripcion_proyecto ?? '')

  const [vmTotal, setVmTotal] = useState(String(iv.vm_total ?? ''))
  const [vmFuente, setVmFuente] = useState(iv.vm_fuente ?? '')
  const [vmSugeridoVisible] = useState(
    !iv.vm_total && vmSugerido ? vmSugerido : null
  )

  const [supProyecto, setSupProyecto] = useState(String(iv.superficie_proyecto_m2 ?? ''))
  const [supTerreno, setSupTerreno] = useState(
    String(iv.superficie_terreno_m2 ?? superficieTerrenoDefecto ?? '')
  )

  const [costoM2, setCostoM2] = useState(
    String(iv.costo_construccion_m2 ?? costoM2Defecto ?? '')
  )
  const [costoSeleccionado, setCostoSeleccionado] = useState(null)

  const [pcts, setPcts] = useState({
    proyecto:         String(iv.proyecto_pct         ?? '2'),
    permisos:         String(iv.permisos_pct         ?? '1'),
    gestion:          String(iv.gestion_pct          ?? '2'),
    comercializacion: String(iv.comercializacion_pct ?? '3'),
    financiamiento:   String(iv.financiamiento_pct   ?? '2'),
    imprevistos:      String(iv.imprevistos_pct      ?? '4'),
  })
  const setPct = (key, val) => setPcts(prev => ({ ...prev, [key]: val }))

  const [utilidadPct, setUtilidadPct] = useState(String(iv.utilidad_pct ?? '15'))
  const [notas, setNotas] = useState(iv.notas_valuador ?? '')

  const handleSeleccionCosto = (costoId) => {
    if (!costoId) { setCostoSeleccionado(null); return }
    const costo = costos.find(c => c.id === costoId)
    if (!costo) return
    setCostoSeleccionado(costo)
    setCostoM2(String(costo.precio_m2))
  }

  const resultado = useMemo(() => calcularMetodoResidual({
    vmTotal:               n(vmTotal),
    superficieProyectoM2:  n(supProyecto),
    costoConstuccionM2:    n(costoM2),
    superficieTerrenoM2:   n(supTerreno),
    proyectoPct:           n(pcts.proyecto),
    permisosPct:           n(pcts.permisos),
    gestionPct:            n(pcts.gestion),
    comercializacionPct:   n(pcts.comercializacion),
    financiamientoPct:     n(pcts.financiamiento),
    imprevistoPct:         n(pcts.imprevistos),
    utilidadPct:           n(utilidadPct),
  }), [vmTotal, supProyecto, costoM2, supTerreno, pcts, utilidadPct])

  const handleGuardar = () => {
    if (!onGuardar || !resultado) return
    onGuardar({
      casoUso,
      descripcionProyecto:       descripcion || null,
      vmTotal:                   n(vmTotal),
      vmFuente:                  vmFuente || null,
      superficieProyectoM2:      n(supProyecto) || null,
      superficieTerrenoM2:       n(supTerreno)  || null,
      costoConstuccionM2:        n(costoM2)     || null,
      costoConstuccionTotal:     resultado.costoConstuccionTotal,
      proyectoPct:               n(pcts.proyecto),
      permisosPct:               n(pcts.permisos),
      gestionPct:                n(pcts.gestion),
      comercializacionPct:       n(pcts.comercializacion),
      financiamientoPct:         n(pcts.financiamiento),
      imprevistoPct:             n(pcts.imprevistos),
      ciTotal:                   resultado.ciTotal,
      utilidadPct:               n(utilidadPct),
      utilidadPesos:             resultado.utilidadPesos,
      valorResidual:             resultado.valorResidual,
      valorResidualM2Terreno:    resultado.valorResidualM2Terreno,
      notasValuador:             notas || null,
    })
  }

  const costoConstuccionTotal = n(supProyecto) * n(costoM2)

  return (
    <div className="space-y-5">

      <FormulaPanel grupos={FORMULAS_RESIDUAL} />

      {/* ── Caso de uso ── */}
      <Card>
        <CardHeader><CardTitle>Identificación del caso</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1.5">
            <Label>Caso de uso</Label>
            <div className="flex gap-1 bg-gray-100 rounded-lg p-1 w-fit">
              {[
                { val: 'terreno',      label: 'Terreno a desarrollar' },
                { val: 'remodelacion', label: 'Inmueble a remodelar' },
              ].map(opt => (
                <button
                  key={opt.val}
                  type="button"
                  onClick={() => setCasoUso(opt.val)}
                  className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${
                    casoUso === opt.val
                      ? 'bg-white shadow-sm text-gray-900'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
            <p className="text-xs text-gray-400">
              {casoUso === 'terreno'
                ? 'F es el valor máximo que un desarrollador pagaría hoy por el suelo.'
                : 'F es el valor actual del inmueble en su estado actual, antes de la remodelación.'}
            </p>
          </div>
          <div className="space-y-1">
            <Label>Descripción del proyecto</Label>
            <textarea
              value={descripcion}
              onChange={e => setDescripcion(e.target.value)}
              rows={2}
              placeholder={casoUso === 'terreno'
                ? 'Ej: 5 casas de interés social, 70 m² c/u, zona habitacional...'
                : 'Ej: Reconversión de bodega a local comercial, 200 m², zona comercial...'}
              className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 resize-y"
            />
          </div>
        </CardContent>
      </Card>

      {/* ── Valor de Mercado ── */}
      <Card>
        <CardHeader>
          <CardTitle>Valor de Mercado del producto terminado (VM)</CardTitle>
          <p className="text-xs text-gray-400">
            Precio de venta estimado {casoUso === 'terreno' ? 'del inmueble construido' : 'del inmueble ya remodelado'}, basado en investigación de mercado.
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          {vmSugeridoVisible && (
            <div className="flex items-start gap-2 p-3 bg-blue-50 border border-blue-200 rounded-md text-sm text-blue-800">
              <Info className="h-4 w-4 mt-0.5 shrink-0 text-blue-600" />
              <span>
                Sugerencia: el Método Comparativo de este expediente estimó{' '}
                <strong>{formatCurrency(vmSugeridoVisible)}</strong>.
                Úsalo como punto de partida o ajusta según el producto terminado.
              </span>
            </div>
          )}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label>VM total</Label>
              <div className="relative">
                <NumericInput
                  value={vmTotal}
                  onChange={e => setVmTotal(e.target.value)}
                  placeholder="0"
                  className="pr-2"
                />
              </div>
              {vmSugeridoVisible && !vmTotal && (
                <button
                  type="button"
                  onClick={() => setVmTotal(String(vmSugeridoVisible))}
                  className="text-xs text-blue-600 hover:underline"
                >
                  Usar valor comparativo ({formatCurrency(vmSugeridoVisible)})
                </button>
              )}
            </div>
            <div className="space-y-1">
              <Label>Fuente del VM</Label>
              <Input
                value={vmFuente}
                onChange={e => setVmFuente(e.target.value)}
                placeholder="Investigación de mercado, Método Comparativo..."
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ── Superficie y Costo de Construcción ── */}
      <Card>
        <CardHeader>
          <CardTitle>
            {casoUso === 'terreno' ? 'Proyecto y Costo de Construcción' : 'Superficie y Costo de Remodelación'}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label>Superficie a {casoUso === 'terreno' ? 'construir' : 'remodelar'}</Label>
              <div className="relative">
                <NumericInput
                  value={supProyecto}
                  onChange={e => setSupProyecto(e.target.value)}
                  placeholder="0"
                  className="pr-10"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 pointer-events-none">m²</span>
              </div>
            </div>
            <div className="space-y-1">
              <Label>Superficie del terreno</Label>
              <div className="relative">
                <NumericInput
                  value={supTerreno}
                  onChange={e => setSupTerreno(e.target.value)}
                  placeholder="0"
                  className="pr-10"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 pointer-events-none">m²</span>
              </div>
              {superficieTerrenoDefecto && !iv.superficie_terreno_m2 && (
                <p className="text-xs text-green-600">Precargado desde Terreno</p>
              )}
            </div>
          </div>

          {!cargandoCostos && costos.length > 0 && (
            <div className="space-y-1">
              <Label>Tipo de construcción (tabulador de costos)</Label>
              <select
                value={costoSeleccionado?.id ?? ''}
                onChange={e => handleSeleccionCosto(e.target.value)}
                className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white"
              >
                <option value="">— Seleccionar del tabulador (opcional) —</option>
                {Object.entries(porFuente).map(([fuente, lista]) => (
                  <optgroup key={fuente} label={fuente}>
                    {lista.map(c => (
                      <option key={c.id} value={c.id}>
                        {c.descripcion} — ${formatNumber(c.precio_m2, 0)}/m²
                      </option>
                    ))}
                  </optgroup>
                ))}
              </select>
            </div>
          )}

          <div className="space-y-1 max-w-xs">
            <Label>Costo de {casoUso === 'terreno' ? 'construcción' : 'remodelación'} por m²</Label>
            <div className="relative">
              <NumericInput
                value={costoM2}
                onChange={e => setCostoM2(e.target.value)}
                placeholder="0"
                className="pr-14"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 pointer-events-none">$/m²</span>
            </div>
            {costoM2Defecto && !iv.costo_construccion_m2 && (
              <p className="text-xs text-green-600">
                Ref. Método Físico: ${formatNumber(costoM2Defecto, 0)}/m²
              </p>
            )}
          </div>

          {costoConstuccionTotal > 0 && (
            <div className="bg-gray-50 rounded-md px-4 py-2 text-sm text-gray-600">
              Costo {casoUso === 'terreno' ? 'construcción' : 'remodelación'} total:{' '}
              <strong className="text-gray-900">{formatCurrency(costoConstuccionTotal)}</strong>
              <span className="text-gray-400 ml-2">({formatNumber(n(supProyecto), 0)} m² × ${formatNumber(n(costoM2), 0)}/m²)</span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* ── Costo de Inversión (Ci) ── */}
      <Card>
        <CardHeader>
          <CardTitle>Costo de Inversión (Ci)</CardTitle>
          <p className="text-xs text-gray-400">Los porcentajes se aplican sobre el VM. Ajusta según el proyecto.</p>
        </CardHeader>
        <CardContent className="p-0">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-y border-gray-200">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Componente</th>
                <th className="px-3 py-2 text-center text-xs font-medium text-gray-500 w-24">% sobre VM</th>
                <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 w-36">Monto ($)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              <tr className="bg-blue-50/40">
                <td className="px-4 py-2.5 text-sm text-gray-700 font-medium">
                  Costo de {casoUso === 'terreno' ? 'construcción' : 'remodelación'}
                </td>
                <td className="px-3 py-2.5 text-center text-xs text-gray-400">
                  {supProyecto && costoM2 ? `${formatNumber(n(costoM2), 0)} $/m²` : '—'}
                </td>
                <td className="px-4 py-2.5 text-right font-mono text-sm font-semibold text-gray-800">
                  {costoConstuccionTotal > 0 ? formatCurrency(costoConstuccionTotal) : '—'}
                </td>
              </tr>
              {CI_COMPONENTES.map(({ key, label }) => {
                const monto = n(vmTotal) * (n(pcts[key]) / 100)
                return (
                  <tr key={key}>
                    <td className="px-4 py-2.5 text-sm text-gray-600">{label}</td>
                    <td className="px-3 py-2.5">
                      <div className="flex items-center justify-center gap-1">
                        <input
                          type="number"
                          step="0.1"
                          min="0"
                          value={pcts[key]}
                          onChange={e => setPct(key, e.target.value)}
                          className="w-14 text-center text-sm border border-gray-200 rounded px-1.5 py-1 focus:outline-none focus:ring-2 focus:ring-blue-400"
                        />
                        <span className="text-xs text-gray-400">%</span>
                      </div>
                    </td>
                    <td className="px-4 py-2.5 text-right font-mono text-sm text-gray-700">
                      {n(vmTotal) > 0 ? formatCurrency(monto) : '—'}
                    </td>
                  </tr>
                )
              })}
            </tbody>
            {resultado && (
              <tfoot className="border-t-2 border-gray-300 bg-gray-100">
                <tr>
                  <td className="px-4 py-2.5 text-sm font-bold text-gray-800" colSpan={2}>Ci Total</td>
                  <td className="px-4 py-2.5 text-right font-mono text-sm font-bold text-gray-900">
                    {formatCurrency(resultado.ciTotal)}
                  </td>
                </tr>
              </tfoot>
            )}
          </table>
        </CardContent>
      </Card>

      {/* ── Utilidad del promotor ── */}
      <Card>
        <CardHeader><CardTitle>Utilidad del promotor (Up)</CardTitle></CardHeader>
        <CardContent>
          <div className="flex items-end gap-4">
            <div className="space-y-1 max-w-xs">
              <Label>Porcentaje sobre VM</Label>
              <div className="relative">
                <NumericInput
                  value={utilidadPct}
                  onChange={e => setUtilidadPct(e.target.value)}
                  placeholder="15"
                  className="pr-6"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 pointer-events-none">%</span>
              </div>
            </div>
            {resultado && (
              <p className="pb-1 text-sm text-gray-600">
                = <strong className="text-gray-900">{formatCurrency(resultado.utilidadPesos)}</strong>
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* ── Notas ── */}
      <Card>
        <CardHeader><CardTitle>Notas del valuador</CardTitle></CardHeader>
        <CardContent>
          <textarea
            value={notas}
            onChange={e => setNotas(e.target.value)}
            rows={3}
            placeholder="Justificación de los parámetros usados, fuentes, supuestos y limitantes del método..."
            className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 resize-y"
          />
        </CardContent>
      </Card>

      {/* ── Resultado ── */}
      <Card className="sticky top-6">
        <CardHeader>
          <div className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-green-600" />
            <CardTitle>Resultado — Método Residual Estático</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {!resultado ? (
            <div className="flex items-start gap-2 p-3 bg-gray-50 rounded-md text-sm text-gray-500">
              <Info className="h-4 w-4 mt-0.5 shrink-0" />
              Ingresa el Valor de Mercado para calcular el valor residual.
            </div>
          ) : (
            <>
              {/* Desglose VM − Ci − Up */}
              <div className="bg-gray-50 rounded-md px-4 py-3 space-y-0.5">
                {[
                  { label: 'Valor de mercado (VM)',   valor: resultado.ciTotal + resultado.utilidadPesos + resultado.valorResidual, mono: false },
                  { label: 'Costo de inversión (Ci)', valor: -resultado.ciTotal,       negative: true },
                  { label: 'Utilidad del promotor (Up)', valor: -resultado.utilidadPesos, negative: true },
                ].map(({ label, valor, negative }) => (
                  <div key={label} className="flex items-center justify-between py-1 border-b border-gray-200 last:border-0">
                    <span className="text-sm text-gray-600">{label}</span>
                    <span className={`font-mono text-sm ${negative ? 'text-red-600' : 'text-gray-800'}`}>
                      {negative ? '− ' : ''}{formatCurrency(Math.abs(valor))}
                    </span>
                  </div>
                ))}
              </div>

              {/* Indicador de viabilidad */}
              {resultado.esViable ? (
                <div className="bg-green-600 text-white rounded-md p-4">
                  <div className="flex items-center gap-2 mb-1">
                    <CheckCircle2 className="h-4 w-4 text-green-200" />
                    <p className="text-sm text-green-100 font-medium">Proyecto viable</p>
                  </div>
                  <p className="text-2xl font-bold">{formatCurrency(resultado.valorResidual)}</p>
                  <p className="text-xs text-green-200 mt-1">
                    Un desarrollador puede pagar hasta este monto y aún obtener la utilidad esperada del {utilidadPct}%.
                  </p>
                  {resultado.valorResidualM2Terreno !== null && (
                    <p className="text-sm text-green-100 mt-2 font-medium">
                      {formatCurrency(resultado.valorResidualM2Terreno)}/m² de terreno
                    </p>
                  )}
                </div>
              ) : resultado.valorResidual === 0 ? (
                <div className="bg-amber-500 text-white rounded-md p-4">
                  <div className="flex items-center gap-2 mb-1">
                    <AlertTriangle className="h-4 w-4 text-amber-100" />
                    <p className="text-sm text-amber-100 font-medium">Límite de viabilidad</p>
                  </div>
                  <p className="text-2xl font-bold">{formatCurrency(0)}</p>
                  <p className="text-xs text-amber-100 mt-1">
                    El proyecto está en el límite. Cualquier incremento en costos lo haría no rentable.
                  </p>
                </div>
              ) : (
                <div className="bg-red-600 text-white rounded-md p-4">
                  <div className="flex items-center gap-2 mb-1">
                    <AlertTriangle className="h-4 w-4 text-red-200" />
                    <p className="text-sm text-red-100 font-medium">Proyecto no viable</p>
                  </div>
                  <p className="text-2xl font-bold">{formatCurrency(resultado.valorResidual)}</p>
                  <p className="text-xs text-red-200 mt-1">
                    Los costos de inversión y la utilidad superan el VM. Revisa VM, Ci o Up, o considera un uso diferente.
                  </p>
                </div>
              )}

              {onGuardar && (
                <Button className="w-full" onClick={handleGuardar} disabled={guardando}>
                  {guardando
                    ? <><Loader2 className="h-4 w-4 animate-spin" /> Guardando...</>
                    : (submitLabel ?? 'Guardar resultado en expediente')
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
