import { useState, useMemo } from 'react'
import { NumericInput } from '@/components/ui/numeric-input'
import { Label } from '@/components/ui/label'
import { formatNumber } from '@/lib/utils'
import { PlusCircle, Trash2 } from 'lucide-react'
import { calcularHomologacionRentas } from './calculosRentas'

let _cid = 1
const cuid = () => _cid++

const newRow = () => ({
  id: cuid(),
  descripcion: '',
  superficie: '',
  rentaMensual: '',
  factorZona: '1.00',
  factorSuperficie: '1.00',
  factorEdad: '1.00',
  factorConservacion: '1.00',
})

const n = (v) => parseFloat(v) || 0
const inlineNum = 'bg-transparent border-0 shadow-none focus:outline-none focus:ring-0 text-gray-800 placeholder-gray-300 h-auto py-0 rounded-none'

function factorColor(f) {
  if (!f || Math.abs(f - 1) < 0.001) return 'text-gray-500'
  return f > 1 ? 'text-green-600' : 'text-orange-500'
}

export function ComparablesRentaForm({ initialComparables = [], initialSuperficieSujeto = '', onChange }) {
  const [superficieSujeto, setSuperficieSujeto] = useState(String(initialSuperficieSujeto || ''))
  const [rows, setRows] = useState(() => {
    if (initialComparables?.length) return initialComparables.map(c => ({ ...c, id: cuid() }))
    return [newRow(), newRow(), newRow()]
  })

  function notifyChange(currentRows, currentSup) {
    if (!onChange) return
    const parsed = currentRows.map(r => ({
      ...r,
      superficie: n(r.superficie),
      rentaMensual: n(r.rentaMensual),
      factorZona: n(r.factorZona) || 1,
      factorSuperficie: n(r.factorSuperficie) || 1,
      factorEdad: n(r.factorEdad) || 1,
      factorConservacion: n(r.factorConservacion) || 1,
    }))
    const result = calcularHomologacionRentas(parsed, n(currentSup))
    onChange({
      comparables: currentRows.map(r => ({ ...r })),
      superficieSujeto: currentSup,
      rentaUnitariaPonderada: result?.rentaUnitariaPonderada ?? null,
      rentaMensualSujeto: result?.rentaMensualSujeto ?? null,
    })
  }

  const updateRow = (id, field, val) => {
    setRows(prev => {
      const updated = prev.map(r => r.id === id ? { ...r, [field]: val } : r)
      notifyChange(updated, superficieSujeto)
      return updated
    })
  }

  const updateSuperficieSujeto = (val) => {
    setSuperficieSujeto(val)
    notifyChange(rows, val)
  }

  const addRow = () => {
    const updated = [...rows, newRow()]
    setRows(updated)
    notifyChange(updated, superficieSujeto)
  }

  const removeRow = (id) => {
    const updated = rows.filter(r => r.id !== id)
    setRows(updated)
    notifyChange(updated, superficieSujeto)
  }

  const result = useMemo(() => {
    const parsed = rows.map(r => ({
      ...r,
      superficie: n(r.superficie),
      rentaMensual: n(r.rentaMensual),
      factorZona: n(r.factorZona) || 1,
      factorSuperficie: n(r.factorSuperficie) || 1,
      factorEdad: n(r.factorEdad) || 1,
      factorConservacion: n(r.factorConservacion) || 1,
    }))
    return calcularHomologacionRentas(parsed, n(superficieSujeto))
  }, [rows, superficieSujeto])

  return (
    <div className="space-y-3">
      <div className="flex items-end gap-6">
        <div className="max-w-xs space-y-1">
          <Label>Superficie del inmueble sujeto</Label>
          <div className="relative">
            <NumericInput
              value={superficieSujeto}
              onChange={e => updateSuperficieSujeto(e.target.value)}
              className="pr-10"
              placeholder="0"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 pointer-events-none">m²</span>
          </div>
        </div>
        {result && (
          <p className="pb-1 text-sm text-blue-700">
            Renta estimada: <strong>{formatNumber(result.rentaMensualSujeto, 0)} $/mes</strong>
          </p>
        )}
      </div>

      <div className="overflow-x-auto rounded-md border border-gray-200">
        <table className="w-full text-sm min-w-[860px]">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">Descripción</th>
              <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 w-24">Sup m²</th>
              <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 w-28">Renta $/mes</th>
              <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 w-24 bg-gray-100">$/m²/mes</th>
              <th className="px-2 py-2 text-center text-xs font-medium text-gray-500 w-16">F.Zona</th>
              <th className="px-2 py-2 text-center text-xs font-medium text-gray-500 w-16">F.Sup</th>
              <th className="px-2 py-2 text-center text-xs font-medium text-gray-500 w-16">F.Edad</th>
              <th className="px-2 py-2 text-center text-xs font-medium text-gray-500 w-16">F.Cons</th>
              <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 w-20 bg-gray-100">F.Total</th>
              <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 w-28 bg-blue-50">$/m²/mes Homo</th>
              <th className="w-8" />
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {rows.map((row, idx) => {
              const sup = n(row.superficie)
              const renta = n(row.rentaMensual)
              const rentaM2 = sup > 0 && renta > 0 ? renta / sup : null
              const fz = n(row.factorZona) || 1
              const fs = n(row.factorSuperficie) || 1
              const fe = n(row.factorEdad) || 1
              const fc = n(row.factorConservacion) || 1
              const factorTotal = fz * fs * fe * fc
              const homoM2 = rentaM2 ? rentaM2 * factorTotal : null
              return (
                <tr key={row.id} className="hover:bg-gray-50">
                  <td className="px-3 py-2 max-w-[200px]">
                    <input
                      type="text"
                      placeholder={`Comparable ${idx + 1}`}
                      value={row.descripcion}
                      onChange={e => updateRow(row.id, 'descripcion', e.target.value)}
                      className="w-full text-sm bg-transparent border-0 focus:outline-none text-gray-800 placeholder-gray-300"
                    />
                  </td>
                  <td className="px-3 py-2">
                    <NumericInput
                      value={row.superficie}
                      onChange={e => updateRow(row.id, 'superficie', e.target.value)}
                      placeholder="0"
                      className={`w-full text-right text-sm ${inlineNum}`}
                    />
                  </td>
                  <td className="px-3 py-2">
                    <NumericInput
                      value={row.rentaMensual}
                      onChange={e => updateRow(row.id, 'rentaMensual', e.target.value)}
                      placeholder="0"
                      className={`w-full text-right text-sm ${inlineNum}`}
                    />
                  </td>
                  <td className="px-3 py-2 bg-gray-50 text-right font-mono text-xs text-gray-500">
                    {rentaM2 ? formatNumber(rentaM2, 2) : '—'}
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
                        value={row[field]}
                        onChange={e => updateRow(row.id, field, e.target.value)}
                        className={`w-14 text-center text-sm bg-transparent border-0 focus:outline-none placeholder-gray-300 ${factorColor(val)}`}
                      />
                    </td>
                  ))}
                  <td className="px-3 py-2 bg-gray-50 text-right font-mono text-xs font-semibold text-gray-700">
                    {factorTotal.toFixed(4)}
                  </td>
                  <td className="px-3 py-2 bg-blue-50 text-right font-mono text-xs font-semibold text-blue-700">
                    {homoM2 ? formatNumber(homoM2, 2) : '—'}
                  </td>
                  <td className="px-2 py-2">
                    {rows.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeRow(row.id)}
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
          {result && (
            <tfoot className="border-t border-gray-300 bg-gray-100">
              <tr>
                <td className="px-3 py-2 text-xs font-semibold text-gray-600" colSpan={9}>
                  Renta unitaria ponderada ({result.homologados.length} comparables válidos)
                </td>
                <td className="px-3 py-2 text-right font-mono text-sm font-bold text-blue-800">
                  {formatNumber(result.rentaUnitariaPonderada, 2)}
                </td>
                <td />
              </tr>
            </tfoot>
          )}
        </table>
      </div>

      <button
        type="button"
        onClick={addRow}
        className="flex items-center gap-1 text-xs text-gray-400 hover:text-blue-600 transition-colors"
      >
        <PlusCircle className="h-3.5 w-3.5" />
        Agregar comparable
      </button>
    </div>
  )
}
