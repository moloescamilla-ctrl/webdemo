import { useState } from 'react'
import { CheckCircle, AlertCircle, Pencil, X, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

const CAMPOS_EDITABLES = [
  { key: 'cos',          label: 'COS',           tipo: 'number' },
  { key: 'cus',          label: 'CUS',           tipo: 'number' },
  { key: 'cps',          label: 'CPS',           tipo: 'number' },
  { key: 'densidad_min', label: 'Dens. mín.',    tipo: 'number' },
  { key: 'densidad_max', label: 'Dens. máx.',    tipo: 'number' },
  { key: 'niveles_max',  label: 'Niveles máx.',  tipo: 'number' },
  { key: 'altura_max_m', label: 'Altura máx. m', tipo: 'number' },
  { key: 'lote_minimo_m2', label: 'Lote mín. m²',  tipo: 'number' },
  { key: 'restricciones',  label: 'Restricciones',  tipo: 'text'   },
]

const COLOR_CAT = {
  habitacional: 'bg-green-100 text-green-700',
  mixto:        'bg-teal-100 text-teal-700',
  corredor:     'bg-orange-100 text-orange-700',
  comercio:     'bg-blue-100 text-blue-700',
  industrial:   'bg-purple-100 text-purple-700',
  proteccion:   'bg-red-100 text-red-700',
  centralidad:  'bg-[#1B2D4E]/10 text-[#1B2D4E]',
  equipamiento: 'bg-yellow-100 text-yellow-700',
  supletoria:   'bg-gray-100 text-gray-500',
}

function FilaEditable({ fila, onSave }) {
  const [editando, setEditando] = useState(false)
  const [valores, setValores]   = useState({})
  const [guardando, setGuardando] = useState(false)

  function iniciarEdicion() {
    const init = {}
    CAMPOS_EDITABLES.forEach(c => { init[c.key] = fila[c.key] ?? '' })
    setValores(init)
    setEditando(true)
  }

  async function handleGuardar() {
    setGuardando(true)
    const cambios = { verificado: true }
    CAMPOS_EDITABLES.forEach(({ key, tipo }) => {
      const v = valores[key]
      if (v !== '' && v !== null && v !== undefined) {
        cambios[key] = tipo === 'number' ? parseFloat(v) : v
      } else {
        cambios[key] = null
      }
    })
    try {
      await onSave(fila.id, cambios)
      setEditando(false)
    } finally {
      setGuardando(false)
    }
  }

  const catCls = COLOR_CAT[fila.categoria] ?? 'bg-gray-100 text-gray-500'

  return (
    <tr className="border-b border-gray-100 hover:bg-gray-50/50">
      <td className="px-3 py-2 text-xs">
        <div className="flex items-center gap-1.5">
          {fila.verificado
            ? <CheckCircle className="h-3.5 w-3.5 text-green-500 shrink-0" />
            : <AlertCircle className="h-3.5 w-3.5 text-amber-400 shrink-0" />
          }
          <span className="font-mono font-medium text-gray-800">{fila.clave}</span>
        </div>
      </td>
      <td className="px-3 py-2">
        <span className={`text-xs px-1.5 py-0.5 rounded capitalize ${catCls}`}>
          {fila.categoria}
        </span>
      </td>
      <td className="px-3 py-2 text-xs text-gray-600 max-w-[180px] truncate" title={fila.descripcion}>
        {fila.descripcion ?? '—'}
      </td>

      {editando ? (
        <>
          {CAMPOS_EDITABLES.slice(0, 5).map(({ key }) => (
            <td key={key} className="px-2 py-1">
              <Input
                value={valores[key] ?? ''}
                onChange={e => setValores(p => ({ ...p, [key]: e.target.value }))}
                className="h-6 text-xs w-16 px-1"
              />
            </td>
          ))}
          <td className="px-2 py-1 whitespace-nowrap">
            <Button size="sm" className="h-6 text-xs px-2 mr-1" onClick={handleGuardar} disabled={guardando}>
              {guardando ? '…' : <Check className="h-3 w-3" />}
            </Button>
            <Button size="sm" variant="ghost" className="h-6 text-xs px-1" onClick={() => setEditando(false)}>
              <X className="h-3 w-3" />
            </Button>
          </td>
        </>
      ) : (
        <>
          <td className="px-3 py-2 text-xs text-center text-gray-700">{fila.cos ?? '—'}</td>
          <td className="px-3 py-2 text-xs text-center text-gray-700">{fila.cus ?? '—'}</td>
          <td className="px-3 py-2 text-xs text-center text-gray-700">{fila.densidad_max ?? '—'}</td>
          <td className="px-3 py-2 text-xs text-center text-gray-700">{fila.niveles_max ?? '—'}</td>
          <td className="px-3 py-2 text-xs text-center text-gray-700">{fila.altura_max_m != null ? `${fila.altura_max_m}m` : '—'}</td>
          <td className="px-3 py-2 text-xs">
            <Button
              size="sm"
              variant="ghost"
              className="h-6 w-6 p-0 text-gray-400 hover:text-[#1B2D4E]"
              onClick={iniciarEdicion}
            >
              <Pencil className="h-3 w-3" />
            </Button>
          </td>
        </>
      )}
    </tr>
  )
}

export function CatalogoNormativo({ filas, cargando, onSave }) {
  const [filtro, setFiltro] = useState('todas')

  const porVerificar = filas.filter(f => !f.verificado).length
  const filasFiltradas = filtro === 'pendientes'
    ? filas.filter(f => !f.verificado)
    : filas

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        <div className="flex gap-2">
          <button
            onClick={() => setFiltro('todas')}
            className={`text-xs px-3 py-1 rounded-full border transition-colors ${
              filtro === 'todas'
                ? 'bg-[#1B2D4E] text-white border-[#1B2D4E]'
                : 'text-gray-500 border-gray-200 hover:border-gray-400'
            }`}
          >
            Todas ({filas.length})
          </button>
          <button
            onClick={() => setFiltro('pendientes')}
            className={`text-xs px-3 py-1 rounded-full border transition-colors ${
              filtro === 'pendientes'
                ? 'bg-amber-500 text-white border-amber-500'
                : 'text-amber-600 border-amber-200 hover:border-amber-400'
            }`}
          >
            Pendientes ({porVerificar})
          </button>
        </div>
      </div>

      {cargando ? (
        <p className="text-sm text-gray-400 text-center py-8">Cargando catálogo…</p>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-gray-200">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200 text-xs text-gray-500 uppercase tracking-wide">
                <th className="px-3 py-2">Clave</th>
                <th className="px-3 py-2">Categoría</th>
                <th className="px-3 py-2">Descripción</th>
                <th className="px-3 py-2 text-center">COS</th>
                <th className="px-3 py-2 text-center">CUS</th>
                <th className="px-3 py-2 text-center">Dens.</th>
                <th className="px-3 py-2 text-center">Niveles</th>
                <th className="px-3 py-2 text-center">Alt.</th>
                <th className="px-3 py-2" />
              </tr>
            </thead>
            <tbody>
              {filasFiltradas.map(f => (
                <FilaEditable key={f.id} fila={f} onSave={onSave} />
              ))}
              {filasFiltradas.length === 0 && (
                <tr>
                  <td colSpan={9} className="px-3 py-6 text-center text-xs text-gray-400">
                    Sin registros
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
