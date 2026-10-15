import { useState, useMemo, useEffect } from 'react'
import { ChecklistInspeccion } from './ChecklistInspeccion'
import { EdadPonderadaInput } from './EdadPonderadaInput'
import { FactorComercializacion } from './FactorComercializacion'
import { ConsultarSuelo } from './ConsultarSuelo'
import { calcularMetodoFisico, calcularTerrenoSolo, calcularHeideckeDesdeChecklist, calcularFactorRoss, calcularRossHeidecke, ESTADOS_HEIDECKE, PARTIDAS_INSPECCION } from './calculosRossHeidecke'
import { ComparablesTerrenoPanel } from './ComparablesTerrenoPanel'
import { useCostosM2 } from '@/hooks/useCostosM2'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { NumericInput } from '@/components/ui/numeric-input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { formatCurrency, formatNumber } from '@/lib/utils'
import { Calculator, Info, Loader2, Plus, X } from 'lucide-react'
import { FormulaPanel } from '@/components/ui/formula-panel'

const FORMULAS_FISICO = [
  {
    titulo: 'Valor de Reposición Nuevo',
    formula: 'VRN = Sup. Construcción (m²)\n      × Costo Rep. Nuevo ($/m²)',
  },
  {
    titulo: 'Factor Ross (a)',
    formula: 'a = Edad / Vida Útil Total',
    nota: 'Representa el desgaste por antigüedad.',
  },
  {
    titulo: 'Coef. Heidecke (C)',
    formula: 'C = determinado por el checklist\nde conservación por partidas.',
    nota: 'Óptimo=0.000 · Pésimo=0.950',
  },
  {
    titulo: 'Factor de Depreciación',
    formula: 'F.Dep = (1 − VR%) × (a + (1 − a) × C)\ndonde VR = valor residual (%)',
  },
  {
    titulo: 'Valor Actual Construcción',
    formula: 'VAC = VRN × (1 − F.Dep)',
  },
  {
    titulo: 'Valor Físico Total',
    formula: 'VFT = VAC\n    + Sup. Terreno × Valor Unitario ($/m²)',
  },
]

const initialEstados = Object.fromEntries(PARTIDAS_INSPECCION.map(p => [p.id, 0]))

const VU_ACCESORIA = 50

const defaultInputs = {
  superficieConstruccion: '',
  superficieTerreno: '',
  costoReposicionM2: '',
  costoReposicionAccesoriaM2: '',
  valorUnitarioTerreno: '',
  edadAnios: '',
  vidaUtilAnios: '60',
  valorResidual: '15',
}

function Campo({ label, name, value, onChange, suffix, hint, hintWarning }) {
  return (
    <div className="space-y-1">
      <Label htmlFor={name}>{label}</Label>
      <div className="relative">
        <NumericInput
          id={name}
          name={name}
          value={value}
          onChange={onChange}
          className={suffix ? 'pr-12' : ''}
          placeholder="0"
        />
        {suffix && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 pointer-events-none">
            {suffix}
          </span>
        )}
      </div>
      {hint && <p className="text-xs text-gray-400">{hint}</p>}
      {hintWarning && <p className="text-xs text-amber-600">{hintWarning}</p>}
    </div>
  )
}

export function MetodoFisicoForm({ onGuardar, guardando, submitLabel = 'Guardar resultado en expediente', initialValues = null, latitud = null, longitud = null }) {
  const [tieneConstruccion, setTieneConstruccion] = useState(initialValues?.tieneConstruccion ?? true)
  const [inputs, setInputs] = useState(initialValues?.inputs ?? defaultInputs)
  const [factorData, setFactorData] = useState(initialValues?.factorData ?? null)
  const [estadosChecklist, setEstadosChecklist] = useState(() => {
    if (initialValues?.estadosRaw) {
      return Object.fromEntries(PARTIDAS_INSPECCION.map(p => [p.id, initialValues.estadosRaw[p.id] ?? 0]))
    }
    return initialEstados
  })
  const [estadoManual, setEstadoManual] = useState(null)
  const [accesoriaData, setAccesoriaData] = useState({ edadAccesoria: 0, superficieAccesoria: 0 })
  const [comparablesTerreno, setComparablesTerreno] = useState(initialValues?.comparablesTerreno ?? null)
  const [partidasConstruccion, setPartidasConstruccion] = useState(initialValues?.partidasConstruccion ?? [])

  const { costos, porFuente, cargando: cargandoCostos } = useCostosM2()
  const [costoSeleccionado, setCostoSeleccionado] = useState(null)
  const [costoManual, setCostoManual] = useState(false)

  const vrnPartidas = useMemo(() => {
    if (!partidasConstruccion.length) return null
    const v = partidasConstruccion.reduce((s, p) => {
      return s + (parseFloat(p.superficie) || 0) * (parseFloat(p.costoM2) || 0)
    }, 0)
    return v > 0 ? v : null
  }, [partidasConstruccion])

  const supTotalPartidas = useMemo(() => {
    if (!partidasConstruccion.length) return 0
    return partidasConstruccion.reduce((s, p) => s + (parseFloat(p.superficie) || 0), 0)
  }, [partidasConstruccion])

  useEffect(() => {
    if (partidasConstruccion.length > 0 && supTotalPartidas > 0) {
      setInputs(prev => ({ ...prev, superficieConstruccion: String(supTotalPartidas) }))
    }
  }, [supTotalPartidas, partidasConstruccion.length])

  const agregarPartida = () => {
    setPartidasConstruccion(prev => [...prev, { id: crypto.randomUUID(), nombre: '', tabuladorId: '', clave: '', tipo: '', descripcion: '', costoM2: '', superficie: '' }])
  }

  const eliminarPartida = (id) => {
    setPartidasConstruccion(prev => prev.filter(p => p.id !== id))
  }

  const handlePartidaTabulador = (id, costoId) => {
    if (!costoId) {
      setPartidasConstruccion(prev => prev.map(p => p.id === id ? { ...p, tabuladorId: '', clave: '', tipo: '', descripcion: '', costoM2: '' } : p))
      return
    }
    const c = costos.find(x => x.id === costoId)
    if (!c) return
    setPartidasConstruccion(prev => prev.map(p => p.id === id
      ? { ...p, tabuladorId: costoId, clave: c.clave, tipo: c.tipo, descripcion: c.descripcion, costoM2: String(c.precio_m2) }
      : p
    ))
  }

  const handlePartidaCampo = (id, campo, valor) => {
    setPartidasConstruccion(prev => prev.map(p => p.id === id ? { ...p, [campo]: valor } : p))
  }

  const handleInput = (e) => setInputs(prev => ({ ...prev, [e.target.name]: e.target.value }))

  const handleSeleccionTipo = (costoId) => {
    if (!costoId) { setCostoSeleccionado(null); return }
    const costo = costos.find(c => c.id === costoId)
    if (!costo) return
    setCostoSeleccionado(costo)
    setCostoManual(false)
    setInputs(prev => ({ ...prev, costoReposicionM2: String(costo.precio_m2) }))
  }

  const handleCostoInput = (e) => {
    setCostoManual(true)
    setInputs(prev => ({ ...prev, costoReposicionM2: e.target.value }))
  }
  const handleChecklist = (id, val) => setEstadosChecklist(prev => ({ ...prev, [id]: val }))

  const { coeficienteC, estadoHeidecke, puntaje } = useMemo(
    () => calcularHeideckeDesdeChecklist(estadosChecklist),
    [estadosChecklist]
  )

  const estadoFinal = estadoManual !== null
    ? ESTADOS_HEIDECKE.find(e => e.id === estadoManual)
    : estadoHeidecke

  const resultado = useMemo(() => {
    const n = (v) => parseFloat(v) || 0
    const st = n(inputs.superficieTerreno)
    const vt = n(inputs.valorUnitarioTerreno)
    if (!st || !vt) return null

    if (!tieneConstruccion) {
      return calcularTerrenoSolo({ superficieTerreno: st, valorUnitarioTerreno: vt })
    }

    const sc = n(inputs.superficieConstruccion)
    const cr = n(inputs.costoReposicionM2)
    const edad = n(inputs.edadAnios)
    const vu = n(inputs.vidaUtilAnios)
    const vr = n(inputs.valorResidual) / 100
    const tieneVRN = vrnPartidas ? (supTotalPartidas > 0 && vrnPartidas > 0) : (sc > 0 && cr > 0)
    if (!tieneVRN || !vu) return null
    return calcularMetodoFisico({
      superficieConstruccion: vrnPartidas ? supTotalPartidas : sc,
      superficieTerreno: st,
      costoReposicionM2: cr,
      valorUnitarioTerreno: vt,
      edadAnios: edad,
      vidaUtilAnios: vu,
      valorResidual: vr,
      coeficienteC: estadoFinal?.c ?? coeficienteC,
      vrnMultiTipo: vrnPartidas ?? undefined,
    })
  }, [inputs, estadoFinal, coeficienteC, tieneConstruccion, vrnPartidas, supTotalPartidas])

  const resultadoAccesoria = useMemo(() => {
    if (!accesoriaData.superficieAccesoria) return null
    const cr_acc = parseFloat(inputs.costoReposicionAccesoriaM2) || 0
    if (!cr_acc) return null
    const vr = (parseFloat(inputs.valorResidual) || 15) / 100
    const vr_acc = accesoriaData.superficieAccesoria * cr_acc
    const A_acc = calcularFactorRoss(accesoriaData.edadAccesoria, VU_ACCESORIA)
    const C = estadoFinal?.c ?? coeficienteC
    const { va, depreciacion, porcentajeDepreciacion } = calcularRossHeidecke(vr_acc, vr, A_acc, C)
    return { valorReposicionNuevo: vr_acc, factorA: A_acc, depreciacion, porcentajeDepreciacion, valorActualAccesoria: va }
  }, [accesoriaData, inputs.costoReposicionAccesoriaM2, inputs.valorResidual, estadoFinal, coeficienteC])

  const handleGuardar = () => {
    if (!resultado || !onGuardar) return
    const accVA = resultadoAccesoria?.valorActualAccesoria ?? 0
    const valorFisicoFinal = resultado.valorFisicoTotal + accVA
    const resultadoFinal = { ...resultado, valorFisicoTotal: valorFisicoFinal }
    const inputsConCosto = {
      ...inputs,
      costo_m2_fuente:    !vrnPartidas ? (costoSeleccionado?.fuente ?? null) : null,
      costo_m2_clave:     !vrnPartidas ? (costoSeleccionado?.clave ?? null) : null,
      costo_m2_tipo:      !vrnPartidas ? (costoSeleccionado?.tipo ?? null) : null,
      costo_m2_tabulador: !vrnPartidas && costoSeleccionado ? Number(costoSeleccionado.precio_m2) : null,
      costo_m2_ajustado:  !vrnPartidas && costoManual && !!costoSeleccionado,
      comparablesTerreno: comparablesTerreno ?? null,
      partidasConstruccion: partidasConstruccion.length ? partidasConstruccion : null,
    }
    const fc = factorData?.activo && factorData?.factor
      ? { ...factorData, valorMercado: valorFisicoFinal * (parseFloat(factorData.factor) || 1) }
      : null
    if (!tieneConstruccion) {
      onGuardar(resultadoFinal, { tieneConstruccion: false }, inputsConCosto, fc)
      return
    }
    const inspeccion = {
      tieneConstruccion: true,
      estados: estadosChecklist,
      puntaje,
      estadoHeidecke,
      coeficienteC,
      estadoManualNombre: estadoManual !== null ? estadoFinal?.nombre : null,
      coeficienteCManual: estadoManual !== null ? estadoFinal?.c : null,
      coeficienteCAdoptado: estadoFinal?.c ?? coeficienteC,
    }
    onGuardar(resultadoFinal, inspeccion, inputsConCosto, fc)
  }

  return (
    <div className="space-y-5">
    <FormulaPanel grupos={FORMULAS_FISICO} />
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="space-y-5">
        <Card>
          <CardHeader><CardTitle>Datos del Inmueble</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <label className="flex items-center gap-3 p-3 bg-gray-50 rounded-md cursor-pointer select-none">
              <input
                type="checkbox"
                checked={tieneConstruccion}
                onChange={e => setTieneConstruccion(e.target.checked)}
                className="h-4 w-4 rounded border-gray-300 accent-blue-600"
              />
              <span className="text-sm font-medium text-gray-700">El inmueble tiene construcción</span>
            </label>

            <div className="grid grid-cols-2 gap-4">
              {tieneConstruccion ? (
                <>
                  {partidasConstruccion.length > 0 ? (
                    <div className="col-span-2 space-y-1">
                      <Label>Superficie construcción</Label>
                      <div className="relative">
                        <input
                          readOnly
                          value={supTotalPartidas > 0 ? supTotalPartidas.toFixed(2) : '0'}
                          className="w-full h-9 rounded-md border border-gray-200 bg-gray-50 px-3 pr-12 text-sm text-gray-500 cursor-not-allowed"
                        />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 pointer-events-none">m²</span>
                      </div>
                      <p className="text-xs text-gray-400">Calculado de la tabla de tipos</p>
                    </div>
                  ) : (
                    <Campo label="Superficie construcción" name="superficieConstruccion" value={inputs.superficieConstruccion} onChange={handleInput} suffix="m²" />
                  )}

                  {/* Tipos de construcción para Valor de Reposición */}
                  <div className="col-span-2 space-y-2">
                    <div className="flex items-center justify-between">
                      <Label>Tipos de construcción — Valor de Reposición</Label>
                      <button
                        type="button"
                        onClick={agregarPartida}
                        className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 font-medium"
                      >
                        <Plus className="h-3 w-3" /> Agregar tipo
                      </button>
                    </div>

                    {partidasConstruccion.length > 0 ? (
                      <div className="border border-gray-200 rounded-md overflow-hidden">
                        <table className="w-full text-xs">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="px-2 py-1.5 text-left font-medium text-gray-500">Nombre / uso</th>
                              <th className="px-2 py-1.5 text-left font-medium text-gray-500">Tipo / tabulador</th>
                              <th className="px-2 py-1.5 text-right font-medium text-gray-500">Sup m²</th>
                              <th className="px-2 py-1.5 text-right font-medium text-gray-500">$/m²</th>
                              <th className="px-2 py-1.5 text-right font-medium text-gray-500">VRN parcial</th>
                              <th className="w-5"></th>
                            </tr>
                          </thead>
                          <tbody>
                            {partidasConstruccion.map(partida => {
                              const vrnFila = (parseFloat(partida.superficie) || 0) * (parseFloat(partida.costoM2) || 0)
                              return (
                                <tr key={partida.id} className="border-t border-gray-100">
                                  <td className="px-2 py-1">
                                    <input
                                      type="text"
                                      value={partida.nombre}
                                      onChange={e => handlePartidaCampo(partida.id, 'nombre', e.target.value)}
                                      className="w-28 h-7 rounded border border-gray-200 px-1 text-xs focus:outline-none focus:border-blue-400"
                                      placeholder="Ej. Oficina"
                                    />
                                  </td>
                                  <td className="px-2 py-1">
                                    {cargandoCostos ? (
                                      <span className="text-gray-400">Cargando…</span>
                                    ) : (
                                      <select
                                        value={partida.tabuladorId}
                                        onChange={e => handlePartidaTabulador(partida.id, e.target.value)}
                                        className="w-full h-7 rounded border border-gray-200 px-1 text-xs focus:outline-none focus:border-blue-400"
                                      >
                                        <option value="">— Tipo —</option>
                                        {Object.entries(porFuente).map(([fuente, items]) => (
                                          <optgroup key={fuente} label={fuente}>
                                            {items.map(c => (
                                              <option key={c.id} value={c.id}>
                                                {c.clave} — {c.tipo} · ${Number(c.precio_m2).toLocaleString('es-MX')}/m²
                                              </option>
                                            ))}
                                          </optgroup>
                                        ))}
                                      </select>
                                    )}
                                    {partida.descripcion && (
                                      <p className="text-gray-400 truncate max-w-[180px] mt-0.5">{partida.descripcion}</p>
                                    )}
                                  </td>
                                  <td className="px-2 py-1">
                                    <input
                                      type="number"
                                      min="0"
                                      step="0.01"
                                      value={partida.superficie}
                                      onChange={e => handlePartidaCampo(partida.id, 'superficie', e.target.value)}
                                      className="w-20 h-7 rounded border border-gray-200 px-1 text-right text-xs focus:outline-none focus:border-blue-400"
                                      placeholder="0"
                                    />
                                  </td>
                                  <td className="px-2 py-1">
                                    <input
                                      type="number"
                                      min="0"
                                      step="100"
                                      value={partida.costoM2}
                                      onChange={e => handlePartidaCampo(partida.id, 'costoM2', e.target.value)}
                                      className="w-24 h-7 rounded border border-gray-200 px-1 text-right text-xs focus:outline-none focus:border-blue-400"
                                      placeholder="0"
                                    />
                                  </td>
                                  <td className="px-2 py-1 text-right font-mono">
                                    {vrnFila > 0 ? formatCurrency(vrnFila) : '—'}
                                  </td>
                                  <td className="px-1 py-1">
                                    <button
                                      type="button"
                                      onClick={() => eliminarPartida(partida.id)}
                                      className="text-gray-300 hover:text-red-500 p-0.5"
                                    >
                                      <X className="h-3.5 w-3.5" />
                                    </button>
                                  </td>
                                </tr>
                              )
                            })}
                          </tbody>
                          <tfoot className="border-t border-gray-200 bg-gray-50">
                            <tr>
                              <td className="px-2 py-1.5 text-xs font-semibold text-gray-600">Total</td>
                              <td className="px-2 py-1.5 text-right text-xs font-semibold font-mono">{supTotalPartidas > 0 ? `${supTotalPartidas.toFixed(2)} m²` : '—'}</td>
                              <td className="px-2 py-1.5 text-right text-xs text-gray-400">—</td>
                              <td className="px-2 py-1.5 text-right text-xs font-semibold text-blue-700 font-mono">{vrnPartidas ? formatCurrency(vrnPartidas) : '—'}</td>
                              <td></td>
                            </tr>
                          </tfoot>
                        </table>
                        <p className="text-xs text-gray-400 px-3 py-1.5 border-t border-gray-100">
                          Superficie total y VRN calculados de la tabla. $/m² individuales editables.
                        </p>
                      </div>
                    ) : (
                      /* Modo simple: selector único (comportamiento original) */
                      <div className="space-y-3">
                        {cargandoCostos ? (
                          <div className="h-9 flex items-center px-3 text-xs text-gray-400 border border-gray-200 rounded-md">Cargando tabulador…</div>
                        ) : costos.length === 0 ? (
                          <div className="h-9 flex items-center px-3 text-xs text-gray-400 border border-gray-200 rounded-md">Sin tabulador — ingresa el costo manualmente</div>
                        ) : (
                          <select
                            value={costoSeleccionado?.id ?? ''}
                            onChange={e => handleSeleccionTipo(e.target.value)}
                            className="w-full h-9 rounded-md border border-gray-200 px-3 text-sm focus:outline-none focus:border-blue-400"
                          >
                            <option value="">— Seleccionar tipo de construcción —</option>
                            {Object.entries(porFuente).map(([fuente, items]) => (
                              <optgroup key={fuente} label={fuente}>
                                {items.map(c => (
                                  <option key={c.id} value={c.id}>
                                    {c.tipo} — {c.clave} · ${Number(c.precio_m2).toLocaleString('es-MX')}/m²
                                  </option>
                                ))}
                              </optgroup>
                            ))}
                          </select>
                        )}
                        {costoSeleccionado && (
                          <p className="text-xs text-gray-500">{costoSeleccionado.descripcion}</p>
                        )}
                        <Campo
                          label="Costo reposición nuevo"
                          name="costoReposicionM2"
                          value={inputs.costoReposicionM2}
                          onChange={handleCostoInput}
                          suffix="$/m²"
                          hint="Costo de construir 1 m² nuevo hoy"
                          hintWarning={costoManual && costoSeleccionado
                            ? `⚠ Ajustado manualmente. Tabulador ${costoSeleccionado.fuente}: $${Number(costoSeleccionado.precio_m2).toLocaleString('es-MX')}/m²`
                            : null
                          }
                        />
                      </div>
                    )}
                  </div>

                  <div className="col-span-2">
                    <EdadPonderadaInput
                      value={inputs.edadAnios}
                      onChange={handleInput}
                      onAccesoriaChange={setAccesoriaData}
                    />
                  </div>
                  <Campo label="Vida útil" name="vidaUtilAnios" value={inputs.vidaUtilAnios} onChange={handleInput} suffix="años" hint="Típico: 60 años" />
                  <div className="col-span-2">
                    <Campo label="Valor residual" name="valorResidual" value={inputs.valorResidual} onChange={handleInput} suffix="%" hint="Típico: 15%" />
                  </div>
                  <Campo label="Superficie terreno" name="superficieTerreno" value={inputs.superficieTerreno} onChange={handleInput} suffix="m²" />
                  <Campo label="Valor unitario terreno" name="valorUnitarioTerreno" value={inputs.valorUnitarioTerreno} onChange={handleInput} suffix="$/m²" />
                  {accesoriaData.superficieAccesoria > 0 && !partidasConstruccion.length && (
                    <div className="col-span-2">
                      <Campo
                        label={`Costo reposición techo accesorio (lámina) — ${accesoriaData.superficieAccesoria.toFixed(2)} m²`}
                        name="costoReposicionAccesoriaM2"
                        value={inputs.costoReposicionAccesoriaM2}
                        onChange={handleInput}
                        suffix="$/m²"
                        hint="Costo por m² nuevo de techo de lámina"
                      />
                    </div>
                  )}
                </>
              ) : (
                <>
                  <Campo label="Superficie terreno" name="superficieTerreno" value={inputs.superficieTerreno} onChange={handleInput} suffix="m²" />
                  <Campo label="Valor unitario terreno" name="valorUnitarioTerreno" value={inputs.valorUnitarioTerreno} onChange={handleInput} suffix="$/m²" />
                </>
              )}
            </div>
          </CardContent>
        </Card>

        <ConsultarSuelo
          latitud={latitud}
          longitud={longitud}
          onAplicarValor={(val) => setInputs(prev => ({ ...prev, valorUnitarioTerreno: String(Math.round(val)) }))}
        />

        <ComparablesTerrenoPanel
          supSujeto={inputs.superficieTerreno}
          initialComparables={comparablesTerreno}
          onChange={setComparablesTerreno}
          onUsarValor={(val) => setInputs(prev => ({ ...prev, valorUnitarioTerreno: String(Math.round(val)) }))}
        />

        {tieneConstruccion && (
          <ChecklistInspeccion
            estados={estadosChecklist}
            onChange={handleChecklist}
            estadoManual={estadoManual}
            onEstadoManualChange={setEstadoManual}
          />
        )}
      </div>

      <div className="space-y-5">
        <Card className="sticky top-6">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Calculator className="h-4 w-4 text-blue-600" />
              <CardTitle>Resultado — Método Físico</CardTitle>
            </div>
            {tieneConstruccion && (
              <p className="text-xs text-gray-500 font-mono">
                VA = VR × &#123;1 − (1 − r) × [A + (1 − A) × C]&#125;
              </p>
            )}
          </CardHeader>
          <CardContent className="space-y-4">
            {!resultado ? (
              <div className="flex items-start gap-2 p-3 bg-gray-50 rounded-md text-sm text-gray-500">
                <Info className="h-4 w-4 mt-0.5 shrink-0" />
                {tieneConstruccion
                  ? 'Completa los datos del inmueble y el checklist para ver el resultado.'
                  : 'Ingresa la superficie y valor unitario del terreno para ver el resultado.'
                }
              </div>
            ) : tieneConstruccion ? (
              <>
                {vrnPartidas && partidasConstruccion.length > 1 && (
                  <div className="border border-blue-100 bg-blue-50 rounded-md p-3 space-y-1">
                    <p className="text-xs font-semibold text-blue-700 uppercase tracking-wide">Desglose VRN por tipo</p>
                    {partidasConstruccion.map(p => {
                      const vrn = (parseFloat(p.superficie) || 0) * (parseFloat(p.costoM2) || 0)
                      if (!vrn) return null
                      return (
                        <div key={p.id} className="flex justify-between text-xs text-blue-800">
                          <span>{p.nombre || p.clave || '—'} · {parseFloat(p.superficie)} m²</span>
                          <span className="font-mono">{formatCurrency(vrn)}</span>
                        </div>
                      )
                    })}
                  </div>
                )}

                <div className="bg-gray-50 rounded-md p-3 space-y-2">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Variables</p>
                  <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-sm">
                    <span className="text-gray-500">VR (reposición nuevo)</span>
                    <span className="font-mono text-right">{formatCurrency(resultado.valorReposicionNuevo)}</span>
                    <span className="text-gray-500">Factor Ross (A)</span>
                    <span className="font-mono text-right">{formatNumber(resultado.factorA)}</span>
                    <span className="text-gray-500">Coef. Heidecke (C)</span>
                    <span className="font-mono text-right">{formatNumber(estadoFinal?.c ?? coeficienteC)}</span>
                    <span className="text-gray-500">Valor residual (r)</span>
                    <span className="font-mono text-right">{formatNumber(parseFloat(inputs.valorResidual) / 100)}</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Depreciación</p>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 bg-gray-100 rounded-full h-2">
                      <div
                        className="h-2 bg-red-400 rounded-full transition-all"
                        style={{ width: `${Math.min(resultado.porcentajeDepreciacion, 100)}%` }}
                      />
                    </div>
                    <span className="text-sm font-medium text-red-600 whitespace-nowrap">
                      {resultado.porcentajeDepreciacion.toFixed(2)}%
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">
                    {formatCurrency(resultado.depreciacion)} depreciados del costo nuevo
                  </p>
                </div>

                <div className="space-y-2 pt-2 border-t border-gray-100">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Valor actual construcción (VA)</span>
                    <span className="font-semibold">{formatCurrency(resultado.valorActualConstruccion)}</span>
                  </div>
                  {resultadoAccesoria && (
                    <div className="flex justify-between text-sm">
                      <span className="text-amber-700">Valor actual accesoria (lámina)</span>
                      <span className="font-semibold text-amber-800">{formatCurrency(resultadoAccesoria.valorActualAccesoria)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Valor del terreno</span>
                    <span className="font-semibold">{formatCurrency(resultado.valorTerreno)}</span>
                  </div>
                </div>

                {resultadoAccesoria && (
                  <div className="bg-amber-50 border border-amber-200 rounded-md p-3 space-y-1 text-xs">
                    <p className="font-semibold text-amber-700 uppercase tracking-wide">Depreciación accesoria — VU 50 años</p>
                    <div className="flex justify-between text-amber-800">
                      <span>Factor Ross (edad {accesoriaData.edadAccesoria.toFixed(1)} a / 50)</span>
                      <span className="font-mono">{formatNumber(resultadoAccesoria.factorA)}</span>
                    </div>
                    <div className="flex justify-between text-amber-800">
                      <span>Depreciación</span>
                      <span className="font-mono">{resultadoAccesoria.porcentajeDepreciacion.toFixed(2)}%</span>
                    </div>
                  </div>
                )}

                <div className="bg-blue-600 text-white rounded-md p-4">
                  <p className="text-sm text-blue-100">Valor físico total del inmueble</p>
                  <p className="text-2xl font-bold mt-1">{formatCurrency(resultado.valorFisicoTotal + (resultadoAccesoria?.valorActualAccesoria ?? 0))}</p>
                  <p className="text-xs text-blue-200 mt-1">Terreno + Construcción{resultadoAccesoria ? ' + Accesoria' : ''} depreciada</p>
                </div>

                <FactorComercializacion
                  valorFisico={resultado.valorFisicoTotal + (resultadoAccesoria?.valorActualAccesoria ?? 0)}
                  value={factorData}
                  onChange={setFactorData}
                />

                {onGuardar && (
                  <Button className="w-full" onClick={handleGuardar} disabled={guardando}>
                    {guardando
                      ? <><Loader2 className="h-4 w-4 animate-spin" /> Guardando...</>
                      : submitLabel
                    }
                  </Button>
                )}
              </>
            ) : (
              <>
                <div className="space-y-2 p-3 bg-gray-50 rounded-md">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Superficie terreno</span>
                    <span className="font-semibold">{formatNumber(parseFloat(inputs.superficieTerreno), 2)} m²</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Valor unitario terreno</span>
                    <span className="font-semibold">{formatCurrency(parseFloat(inputs.valorUnitarioTerreno))}/m²</span>
                  </div>
                </div>

                <div className="bg-blue-600 text-white rounded-md p-4">
                  <p className="text-sm text-blue-100">Valor del terreno</p>
                  <p className="text-2xl font-bold mt-1">{formatCurrency(resultado.valorFisicoTotal)}</p>
                  <p className="text-xs text-blue-200 mt-1">Terreno sin construcción (solo suelo)</p>
                </div>

                <FactorComercializacion
                  valorFisico={resultado.valorFisicoTotal}
                  value={factorData}
                  onChange={setFactorData}
                />

                {onGuardar && (
                  <Button className="w-full" onClick={handleGuardar} disabled={guardando}>
                    {guardando
                      ? <><Loader2 className="h-4 w-4 animate-spin" /> Guardando...</>
                      : submitLabel
                    }
                  </Button>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
    </div>
  )
}
