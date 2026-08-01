import { useState } from 'react'
import { MessageSquare, X } from 'lucide-react'

const SECCIONES = [
  { value: 'datos_generales',  label: 'Datos generales' },
  { value: 'entorno',          label: 'Entorno e infraestructura' },
  { value: 'terreno',          label: 'Características del terreno' },
  { value: 'construcciones',   label: 'Descripción de construcciones' },
  { value: 'inspeccion',       label: 'Inspección física / Ross-Heidecke' },
  { value: 'metodo_fisico',    label: 'Método Físico' },
  { value: 'metodo_comparativo', label: 'Método Comparativo' },
  { value: 'metodo_rentas',    label: 'Método de Rentas' },
  { value: 'metodo_residual',  label: 'Método Residual' },
  { value: 'conclusion',       label: 'Conclusión y valor comercial' },
  { value: 'general',          label: 'Comentario general' },
]

export function FormComentario({ seccionActual = 'general', onGuardar, deshabilitado = false }) {
  const [abierto, setAbierto] = useState(false)
  const [seccion, setSeccion] = useState(seccionActual)
  const [campo, setCampo] = useState('')
  const [texto, setTexto] = useState('')
  const [guardando, setGuardando] = useState(false)
  const [error, setError] = useState(null)

  async function handleGuardar() {
    if (!texto.trim()) return
    setGuardando(true)
    setError(null)
    try {
      await onGuardar({ seccion, campo: campo.trim() || null, texto: texto.trim() })
      setTexto('')
      setCampo('')
      setSeccion(seccionActual)
      setAbierto(false)
    } catch (e) {
      setError(e.message)
    } finally {
      setGuardando(false)
    }
  }

  if (!abierto) return (
    <button
      onClick={() => setAbierto(true)}
      disabled={deshabilitado}
      className="flex items-center gap-1.5 text-xs text-blue-600 hover:text-blue-800 disabled:opacity-40 py-1"
    >
      <MessageSquare className="h-3.5 w-3.5" />
      Agregar comentario
    </button>
  )

  return (
    <div className="mt-3 border border-blue-200 rounded-lg p-3 bg-blue-50 space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-blue-700">Nuevo comentario</span>
        <button onClick={() => setAbierto(false)} className="text-gray-400 hover:text-gray-600">
          <X className="h-3.5 w-3.5" />
        </button>
      </div>

      <select
        value={seccion}
        onChange={e => setSeccion(e.target.value)}
        className="w-full border border-blue-200 rounded px-2 py-1 text-xs bg-white focus:outline-none focus:ring-1 focus:ring-blue-400"
      >
        {SECCIONES.map(s => (
          <option key={s.value} value={s.value}>{s.label}</option>
        ))}
      </select>

      <input
        type="text"
        placeholder="Campo específico (opcional): ej. factor_zona_comp1"
        value={campo}
        onChange={e => setCampo(e.target.value)}
        className="w-full border border-blue-200 rounded px-2 py-1 text-xs bg-white focus:outline-none focus:ring-1 focus:ring-blue-400"
      />

      <textarea
        placeholder="Escribe tu comentario o anotación…"
        value={texto}
        onChange={e => setTexto(e.target.value)}
        rows={3}
        className="w-full border border-blue-200 rounded px-2 py-1.5 text-sm resize-none bg-white focus:outline-none focus:ring-1 focus:ring-blue-400"
      />

      {error && <p className="text-xs text-red-600">{error}</p>}

      <div className="flex justify-end gap-2">
        <button
          onClick={() => setAbierto(false)}
          className="text-xs text-gray-500 hover:text-gray-700 px-2 py-1"
        >
          Cancelar
        </button>
        <button
          onClick={handleGuardar}
          disabled={guardando || !texto.trim()}
          className="text-xs bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {guardando ? 'Guardando…' : 'Guardar comentario'}
        </button>
      </div>
    </div>
  )
}
