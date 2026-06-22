import { useState, useEffect, useCallback } from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { PlusCircle, Trash2, Calculator } from 'lucide-react'

const TIPOS = [
  'Construcción original',
  'Ampliación',
  'Remodelación parcial',
  'Remodelación total',
]

const AÑO_ACTUAL = new Date().getFullYear()
let _id = 1
const uid = () => _id++

export function EdadPonderadaInput({ value, onChange }) {
  const [modo, setModo] = useState('directo')
  const [partidas, setPartidas] = useState([
    { id: uid(), tipo: 'Construcción original', anio: '', superficie: '' },
  ])

  const calc = partidas.map(p => ({
    ...p,
    edad: p.anio ? Math.max(0, AÑO_ACTUAL - parseInt(p.anio)) : null,
    sup: parseFloat(p.superficie) || 0,
  }))

  const totalSup = calc.reduce((s, p) => s + p.sup, 0)
  const edadPonderada = totalSup > 0
    ? calc.reduce((s, p) => s + p.sup * (p.edad ?? 0), 0) / totalSup
    : 0

  const emitPonderada = useCallback(() => {
    if (totalSup > 0) {
      onChange({ target: { name: 'edadAnios', value: edadPonderada.toFixed(2) } })
    }
  }, [edadPonderada, totalSup])

  useEffect(() => {
    if (modo === 'ponderado') emitPonderada()
  }, [partidas, modo])

  const add = () => setPartidas(p => [...p, { id: uid(), tipo: 'Ampliación', anio: '', superficie: '' }])
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
            id="edadAnios"
            name="edadAnios"
            type="number"
            min="0"
            value={value}
            onChange={onChange}
            className="pr-12"
            placeholder="0"
          />
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 pointer-events-none">
            años
          </span>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-2">
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
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 w-32">Superficie m²</th>
              <th className="px-2 py-2 w-8" />
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {partidas.map((p) => {
              const edad = p.anio ? Math.max(0, AÑO_ACTUAL - parseInt(p.anio)) : null
              return (
                <tr key={p.id} className="hover:bg-gray-50">
                  <td className="px-3 py-2">
                    <select
                      value={p.tipo}
                      onChange={e => update(p.id, 'tipo', e.target.value)}
                      className="w-full text-sm bg-transparent border-0 focus:outline-none text-gray-800"
                    >
                      {TIPOS.map(t => <option key={t}>{t}</option>)}
                    </select>
                  </td>
                  <td className="px-3 py-2">
                    <input
                      type="number"
                      min="1900"
                      max={AÑO_ACTUAL}
                      placeholder={String(AÑO_ACTUAL)}
                      value={p.anio}
                      onChange={e => update(p.id, 'anio', e.target.value)}
                      className="w-24 text-sm bg-transparent border-0 focus:outline-none text-gray-800 placeholder-gray-300"
                    />
                  </td>
                  <td className="px-3 py-2 text-right font-mono text-xs text-gray-500">
                    {edad !== null ? `${edad} a` : '—'}
                  </td>
                  <td className="px-3 py-2">
                    <input
                      type="number"
                      min="0"
                      placeholder="0"
                      value={p.superficie}
                      onChange={e => update(p.id, 'superficie', e.target.value)}
                      className="w-24 text-sm bg-transparent border-0 focus:outline-none text-gray-800 placeholder-gray-300"
                    />
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
              )
            })}
          </tbody>
          {totalSup > 0 && (
            <tfoot className="bg-gray-50 border-t border-gray-200">
              <tr>
                <td className="px-3 py-1.5 text-xs text-gray-500 font-medium" colSpan={2}>Total</td>
                <td className="px-3 py-1.5 text-right font-mono text-xs font-bold text-blue-700">
                  {edadPonderada.toFixed(2)} a
                </td>
                <td className="px-3 py-1.5 font-mono text-xs text-gray-700">
                  {totalSup.toFixed(2)} m²
                </td>
                <td />
              </tr>
            </tfoot>
          )}
        </table>
      </div>

      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={add}
          className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800"
        >
          <PlusCircle className="h-3.5 w-3.5" />
          Agregar partida
        </button>
        {totalSup > 0 && (
          <div className="flex items-center gap-2 bg-blue-50 border border-blue-200 rounded-md px-3 py-1.5">
            <span className="text-xs text-blue-600">Edad efectiva adoptada:</span>
            <span className="text-sm font-bold text-blue-800 font-mono">
              {edadPonderada.toFixed(2)} años
            </span>
          </div>
        )}
      </div>

      <p className="text-xs text-gray-400">
        La superficie de cada partida debe sumar la superficie total de construcción.
        Edad = Σ(sup × edad) / Σ(sup)
      </p>
    </div>
  )
}
