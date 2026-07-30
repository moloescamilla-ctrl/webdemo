import { useState, useMemo } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { NumericInput } from '@/components/ui/numeric-input'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { formatCurrency, formatNumber } from '@/lib/utils'
import { TrendingUp, Info, Loader2 } from 'lucide-react'
import {
  calcularRNA,
  calcularTCComponentes,
  calcularVCDirecta,
  calcularVCComponentes,
} from './calculosRentas'
import { ComparablesRentaForm } from './ComparablesRentaForm'

const n = (v) => parseFloat(v) || 0

function RadioGroup({ name, label, value, onChange, options }) {
  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      <div className="flex flex-wrap gap-5">
        {options.map(opt => (
          <label key={opt.value} className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name={name}
              value={opt.value}
              checked={value === opt.value}
              onChange={() => onChange(opt.value)}
              className="accent-blue-600"
            />
            <span className="text-sm text-gray-700">{opt.label}</span>
          </label>
        ))}
      </div>
    </div>
  )
}

function FilaResumen({ label, sublabel, value, highlight }) {
  return (
    <div className={`flex items-center justify-between py-1.5 border-b border-gray-100 last:border-0 ${highlight ? 'font-semibold' : ''}`}>
      <div>
        <span className={`text-sm ${highlight ? 'text-gray-800' : 'text-gray-600'}`}>{label}</span>
        {sublabel && <p className="text-xs text-gray-400">{sublabel}</p>}
      </div>
      <span className={`font-mono text-sm ${highlight ? 'text-blue-800 text-base' : 'text-gray-800'}`}>
        {value ?? '—'}
      </span>
    </div>
  )
}

const TC_COMPONENTES = [
  { key: 'tcTLR',  label: 'Tasa libre de riesgo (i)' },
  { key: 'tcPRI',  label: 'Prima de riesgo inmueble (r)' },
  { key: 'tcIliq', label: 'Prima de iliquidez (iliq)' },
  { key: 'tcDep',  label: 'Depreciación (d)' },
  { key: 'tcGNR',  label: 'Gastos no recuperables (g)' },
]

export function MetodoRentasForm({ onGuardar, guardando, submitLabel, initialValues = null }) {
  const iv = initialValues ?? {}

  const [variante, setVariante] = useState(iv.variante ?? 'directa')
  const [modoRNA, setModoRNA] = useState(iv.modo_rna ?? 'directo')
  const [modoTC, setModoTC] = useState(iv.modo_tc ?? 'componentes')

  const [rentaBruta, setRentaBruta] = useState(String(iv.renta_mensual_bruta ?? ''))
  const [vacanciaPct, setVacanciaPct] = useState(String(iv.vacancia_pct ?? '5'))
  const [gastosPct, setGastosPct] = useState(String(iv.gastos_operacion_pct ?? '15'))
  const [comparablesData, setComparablesData] = useState(null)

  const [tcGlobal, setTcGlobal] = useState(String(iv.tc_global ?? ''))
  const [tc, setTc] = useState({
    tcTLR:  String(iv.tc_tasa_libre_riesgo        ?? ''),
    tcPRI:  String(iv.tc_prima_riesgo_inmueble    ?? ''),
    tcIliq: String(iv.tc_prima_iliquidez          ?? ''),
    tcDep:  String(iv.tc_depreciacion             ?? ''),
    tcGNR:  String(iv.tc_gastos_no_recuperables   ?? ''),
  })
  const setTcField = (key, val) => setTc(prev => ({ ...prev, [key]: val }))

  const [propTierra, setPropTierra] = useState(String(iv.proporcion_tierra_pct ?? ''))
  const [fechaTasa, setFechaTasa] = useState(iv.fecha_tasa_referencia ?? '')
  const [fuenteTasa, setFuenteTasa] = useState(iv.fuente_tasa_referencia ?? '')
  const [notas, setNotas] = useState(iv.notas_valuador ?? '')

  const usandoComponentesTC = variante === 'componentes' || modoTC === 'componentes'

  const rentaMensualEfectiva = modoRNA === 'comparables'
    ? (comparablesData?.rentaMensualSujeto ?? null)
    : (n(rentaBruta) || null)

  const rnaResult = useMemo(() => {
    if (!rentaMensualEfectiva || rentaMensualEfectiva <= 0) return null
    return calcularRNA({
      rentaMensualBruta: rentaMensualEfectiva,
      vacanciaPct: n(vacanciaPct),
      gastosOperacionPct: n(gastosPct),
    })
  }, [rentaMensualEfectiva, vacanciaPct, gastosPct])

  const tcEfectivoPct = useMemo(() => {
    if (usandoComponentesTC) {
      const suma = n(tc.tcTLR) + n(tc.tcPRI) + n(tc.tcIliq) + n(tc.tcDep) + n(tc.tcGNR)
      if (!suma) return null
      return calcularTCComponentes({
        tasaLibreRiesgo:     n(tc.tcTLR),
        primaRiesgoInmueble: n(tc.tcPRI),
        primaIliquidez:      n(tc.tcIliq),
        depreciacion:        n(tc.tcDep),
        gastosNoRecuperables: n(tc.tcGNR),
      })
    }
    return n(tcGlobal) || null
  }, [usandoComponentesTC, tcGlobal, tc])

  const vcResult = useMemo(() => {
    if (!rnaResult?.rna) return null
    if (variante === 'directa') {
      return calcularVCDirecta({ rna: rnaResult.rna, tcPct: tcEfectivoPct })
    }
    if (!n(propTierra)) return null
    return calcularVCComponentes({
      rna: rnaResult.rna,
      proporcionTierraPct: n(propTierra),
      tasaLibreRiesgo:      n(tc.tcTLR),
      primaRiesgoInmueble:  n(tc.tcPRI),
      primaIliquidez:       n(tc.tcIliq),
      depreciacion:         n(tc.tcDep),
      gastosNoRecuperables: n(tc.tcGNR),
    })
  }, [variante, rnaResult, tcEfectivoPct, propTierra, tc])

  const tieneResultado = rnaResult != null && vcResult != null

  const handleGuardar = () => {
    if (!onGuardar) return
    const modoTCEfectivo = variante === 'componentes' ? 'componentes' : modoTC
    onGuardar({
      variante,
      modoRNA,
      modoTC: modoTCEfectivo,
      rentaMensualBruta: modoRNA === 'directo' ? (n(rentaBruta) || null) : (comparablesData?.rentaMensualSujeto ?? null),
      vacanciaPct: n(vacanciaPct),
      gastosOperacionPct: n(gastosPct),
      comparablesRenta: modoRNA === 'comparables' ? (comparablesData?.comparables ?? null) : null,
      tcGlobal: (variante === 'directa' && modoTC === 'directo') ? (n(tcGlobal) || null) : null,
      tcTasaLibreRiesgo:      usandoComponentesTC ? (n(tc.tcTLR)  || null) : null,
      tcPrimaRiesgoInmueble:  usandoComponentesTC ? (n(tc.tcPRI)  || null) : null,
      tcPrimaIliquidez:       usandoComponentesTC ? (n(tc.tcIliq) || null) : null,
      tcDepreciacion:          usandoComponentesTC ? (n(tc.tcDep)  || null) : null,
      tcGastosNoRecuperables:  usandoComponentesTC ? (n(tc.tcGNR)  || null) : null,
      proporcionTierraPct: variante === 'componentes' ? (n(propTierra) || null) : null,
      rna: rnaResult?.rna ?? null,
      valorCapitalizacion: variante === 'directa' ? (vcResult ?? null) : (vcResult?.valorTotal ?? null),
      valorTierraCapitalizacion:        variante === 'componentes' ? (vcResult?.valorTierra ?? null) : null,
      valorConstruccionCapitalizacion:  variante === 'componentes' ? (vcResult?.valorConstruccion ?? null) : null,
      fechaTasaReferencia: fechaTasa || null,
      fuenteTasaReferencia: fuenteTasa || null,
      notasValuador: notas || null,
    })
  }

  return (
    <div className="space-y-5">

      {/* ── Configuración ── */}
      <Card>
        <CardHeader><CardTitle>Configuración del método</CardTitle></CardHeader>
        <CardContent className="space-y-5">
          <RadioGroup
            name="variante"
            label="Variante de capitalización"
            value={variante}
            onChange={setVariante}
            options={[
              { value: 'directa',      label: 'Capitalización directa (VC = RNA / TC)' },
              { value: 'componentes',  label: 'Por componentes tierra / construcción' },
            ]}
          />
          <RadioGroup
            name="modoRNA"
            label="Determinación de la Renta Neta Anual"
            value={modoRNA}
            onChange={setModoRNA}
            options={[
              { value: 'directo',      label: 'Renta mensual conocida' },
              { value: 'comparables',  label: 'Homologación de rentas comparables' },
            ]}
          />
        </CardContent>
      </Card>

      {/* ── RNA ── */}
      <Card>
        <CardHeader>
          <CardTitle>Renta Neta Anual (RNA)</CardTitle>
          <p className="text-xs text-gray-400">RNA = (RBA × (1 − vacancia%)) × (1 − gastos%)</p>
        </CardHeader>
        <CardContent className="space-y-4">
          {modoRNA === 'directo' ? (
            <div className="space-y-1 max-w-xs">
              <Label>Renta mensual bruta</Label>
              <div className="relative">
                <NumericInput
                  value={rentaBruta}
                  onChange={e => setRentaBruta(e.target.value)}
                  placeholder="0"
                  className="pr-14"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 pointer-events-none">$/mes</span>
              </div>
            </div>
          ) : (
            <ComparablesRentaForm
              initialComparables={iv.comparables_renta ?? []}
              onChange={setComparablesData}
            />
          )}

          <div className="grid grid-cols-2 gap-4 max-w-sm pt-1">
            <div className="space-y-1">
              <Label>Vacancia</Label>
              <div className="relative">
                <NumericInput
                  value={vacanciaPct}
                  onChange={e => setVacanciaPct(e.target.value)}
                  placeholder="5"
                  className="pr-6"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 pointer-events-none">%</span>
              </div>
            </div>
            <div className="space-y-1">
              <Label>Gastos de operación</Label>
              <div className="relative">
                <NumericInput
                  value={gastosPct}
                  onChange={e => setGastosPct(e.target.value)}
                  placeholder="15"
                  className="pr-6"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 pointer-events-none">%</span>
              </div>
            </div>
          </div>

          {rnaResult && (
            <div className="bg-gray-50 rounded-md px-4 py-3 space-y-0.5">
              <FilaResumen label="Renta Bruta Anual (RBA)" value={formatCurrency(rnaResult.rba)} />
              <FilaResumen label="Pérdida por vacancia" sublabel={`${vacanciaPct}%`} value={`− ${formatCurrency(rnaResult.perdidaVacancia)}`} />
              <FilaResumen label="Renta Efectiva Anual (REA)" value={formatCurrency(rnaResult.rea)} />
              <FilaResumen label="Gastos de operación" sublabel={`${gastosPct}%`} value={`− ${formatCurrency(rnaResult.gastosOperacionPesos)}`} />
              <FilaResumen label="RNA" value={formatCurrency(rnaResult.rna)} highlight />
            </div>
          )}
        </CardContent>
      </Card>

      {/* ── TC ── */}
      <Card>
        <CardHeader><CardTitle>Tasa de Capitalización (TC)</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          {variante === 'directa' && (
            <RadioGroup
              name="modoTC"
              label="Determinación de la TC"
              value={modoTC}
              onChange={setModoTC}
              options={[
                { value: 'directo',     label: 'Tasa global directa' },
                { value: 'componentes', label: 'Construcción por componentes' },
              ]}
            />
          )}

          {variante === 'componentes' && (
            <div className="space-y-1 max-w-xs">
              <Label>Proporción de tierra sobre el valor total</Label>
              <div className="relative">
                <NumericInput
                  value={propTierra}
                  onChange={e => setPropTierra(e.target.value)}
                  placeholder="30"
                  className="pr-6"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 pointer-events-none">%</span>
              </div>
              <p className="text-xs text-gray-400">TC tierra = i + r + iliq &nbsp;·&nbsp; TC construcción = i + r + iliq + d + g</p>
            </div>
          )}

          {modoTC === 'directo' && variante === 'directa' ? (
            <div className="space-y-1 max-w-xs">
              <Label>Tasa de capitalización</Label>
              <div className="relative">
                <NumericInput
                  value={tcGlobal}
                  onChange={e => setTcGlobal(e.target.value)}
                  placeholder="0.00"
                  className="pr-6"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 pointer-events-none">%</span>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {TC_COMPONENTES.map(({ key, label }) => (
                <div key={key} className="space-y-1">
                  <Label className="text-xs leading-tight">{label}</Label>
                  <div className="relative">
                    <NumericInput
                      value={tc[key]}
                      onChange={e => setTcField(key, e.target.value)}
                      placeholder="0.00"
                      className="pr-6 text-sm"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 pointer-events-none">%</span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {usandoComponentesTC && tcEfectivoPct !== null && (
            <div className="flex flex-wrap gap-6 bg-blue-50 rounded-md px-4 py-2 text-sm">
              <span className="text-gray-600">
                TC construcción: <span className="font-mono font-semibold text-blue-800">{tcEfectivoPct} %</span>
              </span>
              {variante === 'componentes' && n(propTierra) > 0 && (
                <span className="text-gray-600">
                  TC tierra: <span className="font-mono font-semibold text-blue-700">
                    {(n(tc.tcTLR) + n(tc.tcPRI) + n(tc.tcIliq)).toFixed(4)} %
                  </span>
                </span>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* ── Trazabilidad ── */}
      <Card>
        <CardHeader><CardTitle>Trazabilidad</CardTitle></CardHeader>
        <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1">
            <Label>Fecha de la tasa de referencia</Label>
            <Input type="date" value={fechaTasa} onChange={e => setFechaTasa(e.target.value)} />
          </div>
          <div className="space-y-1">
            <Label>Fuente de la tasa</Label>
            <Input value={fuenteTasa} onChange={e => setFuenteTasa(e.target.value)} placeholder="BANXICO, CFE, reporte de mercado..." />
          </div>
          <div className="sm:col-span-2 space-y-1">
            <Label>Notas del valuador</Label>
            <textarea
              value={notas}
              onChange={e => setNotas(e.target.value)}
              rows={3}
              placeholder="Observaciones, supuestos y limitantes del método..."
              className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 resize-y"
            />
          </div>
        </CardContent>
      </Card>

      {/* ── Resultado ── */}
      <Card className="sticky top-6">
        <CardHeader>
          <div className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-green-600" />
            <CardTitle>Resultado — Capitalización de Rentas</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {!tieneResultado ? (
            <div className="flex items-start gap-2 p-3 bg-gray-50 rounded-md text-sm text-gray-500">
              <Info className="h-4 w-4 mt-0.5 shrink-0" />
              Completa la renta mensual y la tasa de capitalización para ver el resultado.
            </div>
          ) : (
            <>
              {variante === 'directa' && (
                <div className="bg-green-600 text-white rounded-md p-4">
                  <p className="text-sm text-green-100">Valor por Capitalización de Rentas</p>
                  <p className="text-2xl font-bold mt-1">{formatCurrency(vcResult)}</p>
                  <p className="text-xs text-green-200 mt-1">
                    RNA {formatCurrency(rnaResult.rna)} ÷ TC {tcEfectivoPct ?? tcGlobal}%
                  </p>
                </div>
              )}

              {variante === 'componentes' && vcResult && (
                <div className="space-y-2">
                  <div className="rounded-md border border-gray-200 overflow-hidden">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                          <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">Componente</th>
                          <th className="px-3 py-2 text-right text-xs font-medium text-gray-500">TC</th>
                          <th className="px-3 py-2 text-right text-xs font-medium text-gray-500">RNA asignada</th>
                          <th className="px-3 py-2 text-right text-xs font-medium text-gray-500">Valor</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        <tr>
                          <td className="px-3 py-2 text-gray-700">Tierra ({propTierra}%)</td>
                          <td className="px-3 py-2 text-right font-mono text-xs">{vcResult.tcTierra}%</td>
                          <td className="px-3 py-2 text-right font-mono text-xs">{formatCurrency(rnaResult.rna * n(propTierra) / 100)}</td>
                          <td className="px-3 py-2 text-right font-mono text-sm font-semibold">{formatCurrency(vcResult.valorTierra)}</td>
                        </tr>
                        <tr>
                          <td className="px-3 py-2 text-gray-700">Construcción ({(100 - n(propTierra)).toFixed(0)}%)</td>
                          <td className="px-3 py-2 text-right font-mono text-xs">{vcResult.tcConstruccion}%</td>
                          <td className="px-3 py-2 text-right font-mono text-xs">{formatCurrency(rnaResult.rna * (1 - n(propTierra) / 100))}</td>
                          <td className="px-3 py-2 text-right font-mono text-sm font-semibold">{formatCurrency(vcResult.valorConstruccion)}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                  <div className="bg-green-600 text-white rounded-md p-4">
                    <p className="text-sm text-green-100">Valor total por Capitalización de Rentas</p>
                    <p className="text-2xl font-bold mt-1">{formatCurrency(vcResult.valorTotal)}</p>
                    <p className="text-xs text-green-200 mt-1">
                      {formatNumber(n(propTierra), 0)}% tierra + {formatNumber(100 - n(propTierra), 0)}% construcción
                    </p>
                  </div>
                </div>
              )}

              {onGuardar && (
                <Button
                  className="w-full"
                  onClick={handleGuardar}
                  disabled={guardando}
                >
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
