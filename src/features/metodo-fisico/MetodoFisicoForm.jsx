import { useState, useMemo } from 'react'
import { ChecklistInspeccion } from './ChecklistInspeccion'
import { EdadPonderadaInput } from './EdadPonderadaInput'
import { calcularMetodoFisico, calcularTerrenoSolo, calcularHeideckeDesdeChecklist, ESTADOS_HEIDECKE, PARTIDAS_INSPECCION } from './calculosRossHeidecke'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { formatCurrency, formatNumber } from '@/lib/utils'
import { Calculator, Info, Loader2 } from 'lucide-react'

const initialEstados = Object.fromEntries(PARTIDAS_INSPECCION.map(p => [p.id, 0]))

const defaultInputs = {
  superficieConstruccion: '',
  superficieTerreno: '',
  costoReposicionM2: '',
  valorUnitarioTerreno: '',
  edadAnios: '',
  vidaUtilAnios: '60',
  valorResidual: '15',
}

function Campo({ label, name, value, onChange, suffix, hint }) {
  return (
    <div className="space-y-1">
      <Label htmlFor={name}>{label}</Label>
      <div className="relative">
        <Input
          id={name}
          name={name}
          type="number"
          min="0"
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
    </div>
  )
}

export function MetodoFisicoForm({ onGuardar, guardando, submitLabel = 'Guardar resultado en expediente' }) {
  const [tieneConstruccion, setTieneConstruccion] = useState(true)
  const [inputs, setInputs] = useState(defaultInputs)
  const [estadosChecklist, setEstadosChecklist] = useState(initialEstados)
  const [estadoManual, setEstadoManual] = useState(null)

  const handleInput = (e) => setInputs(prev => ({ ...prev, [e.target.name]: e.target.value }))
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
    if (!sc || !cr || !vu) return null
    return calcularMetodoFisico({
      superficieConstruccion: sc, superficieTerreno: st,
      costoReposicionM2: cr, valorUnitarioTerreno: vt,
      edadAnios: edad, vidaUtilAnios: vu,
      valorResidual: vr, coeficienteC: estadoFinal?.c ?? coeficienteC,
    })
  }, [inputs, estadoFinal, coeficienteC, tieneConstruccion])

  const handleGuardar = () => {
    if (!resultado || !onGuardar) return
    if (!tieneConstruccion) {
      onGuardar(resultado, { tieneConstruccion: false }, inputs)
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
    onGuardar(resultado, inspeccion, inputs)
  }

  return (
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
                  <Campo label="Superficie construcción" name="superficieConstruccion" value={inputs.superficieConstruccion} onChange={handleInput} suffix="m²" />
                  <Campo label="Superficie terreno" name="superficieTerreno" value={inputs.superficieTerreno} onChange={handleInput} suffix="m²" />
                  <Campo label="Costo reposición nuevo" name="costoReposicionM2" value={inputs.costoReposicionM2} onChange={handleInput} suffix="$/m²" hint="Costo de construir 1 m² nuevo hoy" />
                  <Campo label="Valor unitario terreno" name="valorUnitarioTerreno" value={inputs.valorUnitarioTerreno} onChange={handleInput} suffix="$/m²" />
                  <div className="col-span-2">
                    <EdadPonderadaInput value={inputs.edadAnios} onChange={handleInput} />
                  </div>
                  <Campo label="Vida útil" name="vidaUtilAnios" value={inputs.vidaUtilAnios} onChange={handleInput} suffix="años" hint="Típico: 60 años" />
                  <div className="col-span-2">
                    <Campo label="Valor residual" name="valorResidual" value={inputs.valorResidual} onChange={handleInput} suffix="%" hint="Típico: 15%" />
                  </div>
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
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Valor del terreno</span>
                    <span className="font-semibold">{formatCurrency(resultado.valorTerreno)}</span>
                  </div>
                </div>

                <div className="bg-blue-600 text-white rounded-md p-4">
                  <p className="text-sm text-blue-100">Valor físico total del inmueble</p>
                  <p className="text-2xl font-bold mt-1">{formatCurrency(resultado.valorFisicoTotal)}</p>
                  <p className="text-xs text-blue-200 mt-1">Terreno + Construcción depreciada</p>
                </div>

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
  )
}
