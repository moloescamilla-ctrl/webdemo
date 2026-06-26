import { useState, useEffect, useCallback } from 'react'
import { Input } from '@/components/ui/input'
import { NumericInput } from '@/components/ui/numeric-input'
import { Label } from '@/components/ui/label'
import { PlusCircle, Trash2, Calculator } from 'lucide-react'

// vidaUtil null = inherited from the main form field
const TIPOS = [
  { label: 'Construcción original',   accesoria: false, vidaUtil: null },
  { label: 'Ampliación',              accesoria: false, vidaUtil: null },
  { label: 'Remodelación parcial',    accesoria: false, vidaUtil: null },
  { label: 'Remodelación total',      accesoria: false, vidaUtil: null },
  { label: 'Techo accesorio (lámina)', accesoria: true, vidaUtil: 50  },
]

const AÑO_ACTUAL = new Date().getFullYear()
let _id = 1
const uid = () => _id++

function tipoConfig(label) {
  return TIPOS.find(t => t.label === label) ?? TIPOS[0]
}

export function EdadPonderadaInput({ value, onChange, onAccesoriaChange }) {
  const [modo, setModo] = useState('directo')
  const [partidas, setPartidas] = useState([
    { id: uid(), tipo: 'Construcción original', anio: '', superficie: '' },
  ])

  const calc = partidas.map(p => ({
    ...p,
    cfg: tipoConfig(p.tipo),
    edad: p.anio ? Math.max(0, AÑO_ACTUAL - parseInt(p.anio)) : null,
    sup: parseFloat(p.superficie) || 0,
  }))

  const principal  = calc.filter(p => !p.cfg.accesoria)
  const accesoria  = calc.filter(p =>  p.cfg.accesoria)

  // Weighted age for principal construction
  const totalSupP  = principal.reduce((s, p) => s + p.sup, 0)
  const conEdadP   = principal.filter(p => p.edad !== null)
  const edadP = conEdadP.length === 0 ? 0
    : totalSupP > 0
      ? principal.reduce((s, p) => s + p.sup * (p.edad ?? 0), 0) / totalSupP
      : conEdadP.reduce((s, p) => s + p.edad, 0) / conEdadP.length

  // Weighted age for accessory surfaces
  const totalSupA  = accesoria.reduce((s, p) => s + p.sup, 0)
  const conEdadA   = accesoria.filter(p => p.edad !== null)
  const edadA = conEdadA.length === 0 ? 0
    : totalSupA > 0
      ? accesoria.reduce((s, p) => s + p.sup * (p.edad ?? 0), 0) / totalSupA
      : conEdadA.reduce((s, p) => s + p.edad, 0) / conEdadA.length

  useEffect(() => {
    if (modo !== 'ponderado') return
    if (conEdadP.length > 0)
      onChange({ target: { name: 'edadAnios', value: edadP.toFixed(2) } })
    if (onAccesoriaChange)
      onAccesoriaChange({ edadAccesoria: edadA, superficieAccesoria: totalSupA })
  }, [partidas, modo])

  const add = () => setPartidas(p => [...p, { id: uid(), tipo: 'Construcción original', anio: '', superficie: '' }])
  const remove = (id) => setPartidas(p => p.filter(x => x.id !== id))
  const update = (id, field, val) => setPartidas(p => p.map(x => x.id === id ? { ...x, [field]: val } : x))

  if (modo === 'directo') {
    return (
      <div className="space-y-1">
        <div className="flex items-center justify-between">
          <Label htmlFor="edadAnios">Edad de la construcción</Label>
          <button
            type="button"
            onClick={() => setModo('ponderado')}
            className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800"
          >
            <Calculator className="h-3 w-3" />
            Calcular por partidas
          </button>
        </div>
        <div className="relative">
          <Input
            id="edadAnios" name="edadAnios" type="number" min="0"
            value={value} onChange={onChange} className="pr-12" placeholder="0"
          />
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 pointer-events-none">
            años
          </span>
        </div>
      </div>
    )
  }

  return (
    <div className="col-span-2 space-y-2">
      <div className="flex items-center justify-between">
        <Label>Edad ponderada por partidas de construcción</Label>
        <button
          type="button"
          onClick={() => setModo('directo')}
          className="text-xs text-blue-600 hover:text-blue-800"
        >
          ← Ingresar directamente
        </button>
      </div>

      <div className="border border-gray-200 rounded-md overflow-hidden text-sm">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">Tipo de construcción</th>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 w-28">Año</th>
              <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 w-20">Edad</th>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 w-32">
                Sup m²
                <span className="ml-1 font-normal text-gray-400">(opcional)</span>
              </th>
              <th className="px-3 py-2 text-center text-xs font-medium text-gray-500 w-24">Vida útil</th>
              <th className="px-2 py-2 w-8" />
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {calc.map((p) => (
              <tr key={p.id} className={`hover:bg-gray-50 ${p.cfg.accesoria ? 'bg-amber-50/50' : ''}`}>
                <td className="px-3 py-2">
                  <select
                    value={p.tipo}
                    onChange={e => update(p.id, 'tipo', e.target.value)}
                    className="w-full text-sm bg-transparent border-0 focus:outline-none text-gray-800"
                  >
                    {TIPOS.map(t => <option key={t.label}>{t.label}</option>)}
                  </select>
                </td>
                <td className="px-3 py-2">
                  <input
                    type="number" min="1900" max={AÑO_ACTUAL}
                    placeholder={String(AÑO_ACTUAL)}
                    value={p.anio}
                    onChange={e => update(p.id, 'anio', e.target.value)}
                    className="w-24 text-sm bg-transparent border-0 focus:outline-none text-gray-800 placeholder-gray-300"
                  />
                </td>
                <td className="px-3 py-2 text-right font-mono text-xs text-gray-500">
                  {p.edad !== null ? `${p.edad} a` : '—'}
                </td>
                <td className="px-3 py-2">
                  <NumericInput
                    value={p.superficie}
                    onChange={e => update(p.id, 'superficie', e.target.value)}
                    placeholder="—"
                    className="w-24 text-sm bg-transparent border-0 shadow-none focus:outline-none focus:ring-0 rounded-none text-gray-800 placeholder-gray-300 h-auto py-0"
                  />
                </td>
                <td className="px-3 py-2 text-center text-xs font-mono">
                  {p.cfg.accesoria
                    ? <span className="text-amber-700 font-semibold">50 años</span>
                    : <span className="text-gray-400">del form</span>
                  }
                </td>
                <td className="px-2 py-2">
                  {partidas.length > 1 && (
                    <button
                      type="button"
                      onClick={() => remove(p.id)}
                      className="text-gray-300 hover:text-red-400 transition-colors"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
          {(conEdadP.length > 0 || conEdadA.length > 0) && (
            <tfoot className="bg-gray-50 border-t border-gray-200">
              {conEdadP.length > 0 && (
                <tr>
                  <td className="px-3 py-1.5 text-xs text-gray-500 font-medium" colSpan={2}>Construcción principal</td>
                  <td className="px-3 py-1.5 text-right font-mono text-xs font-bold text-blue-700">
                    {edadP.toFixed(2)} a
                  </td>
                  <td className="px-3 py-1.5 font-mono text-xs text-gray-700">
                    {totalSupP > 0 ? `${totalSupP.toFixed(2)} m²` : ''}
                  </td>
                  <td colSpan={2} />
                </tr>
              )}
              {conEdadA.length > 0 && (
                <tr>
                  <td className="px-3 py-1.5 text-xs text-amber-700 font-medium" colSpan={2}>Accesoria (lámina)</td>
                  <td className="px-3 py-1.5 text-right font-mono text-xs font-bold text-amber-700">
                    {edadA.toFixed(2)} a
                  </td>
                  <td className="px-3 py-1.5 font-mono text-xs text-amber-700">
                    {totalSupA > 0 ? `${totalSupA.toFixed(2)} m²` : ''}
                  </td>
                  <td colSpan={2} />
                </tr>
              )}
            </tfoot>
          )}
        </table>
      </div>

      <div className="flex items-center justify-between">
        <button
          type="button" onClick={add}
          className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800"
        >
          <PlusCircle className="h-3.5 w-3.5" />
          Agregar partida
        </button>
        {conEdadP.length > 0 && (
          <div className="flex items-center gap-2 bg-blue-50 border border-blue-200 rounded-md px-3 py-1.5">
            <span className="text-xs text-blue-600">Edad principal adoptada:</span>
            <span className="text-sm font-bold text-blue-800 font-mono">{edadP.toFixed(2)} años</span>
          </div>
        )}
      </div>

      {conEdadP.length > 0 && (
        <p className="text-xs text-gray-400">
          {totalSupP > 0
            ? 'Edad principal = Σ(sup × edad) / Σ(sup). Techos de lámina usan 50 años de vida útil.'
            : 'Sin superficie por partida se usa promedio simple. Ingresa m² para ponderar por área.'
          }
        </p>
      )}
    </div>
  )
}
