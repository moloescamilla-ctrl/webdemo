import { useState, useRef, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { X, Search, UserPlus, Loader2 } from 'lucide-react'

export function InvitarRevisorModal({ onInvitar, onCerrar, revisoresExistentes = [] }) {
  const [query, setQuery] = useState('')
  const [resultados, setResultados] = useState([])
  const [buscando, setBuscando] = useState(false)
  const [seleccionado, setSeleccionado] = useState(null)
  const [mensaje, setMensaje] = useState('')
  const [enviando, setEnviando] = useState(false)
  const [error, setError] = useState(null)
  const timerRef = useRef(null)

  useEffect(() => {
    if (query.length < 2) { setResultados([]); return }
    clearTimeout(timerRef.current)
    timerRef.current = setTimeout(async () => {
      setBuscando(true)
      const { data } = await supabase.rpc('buscar_usuarios_revision', { p_query: query })
      setResultados(Array.isArray(data) ? data : [])
      setBuscando(false)
    }, 350)
    return () => clearTimeout(timerRef.current)
  }, [query])

  const yaInvitados = new Set(revisoresExistentes.map(r => r.revisor_id))

  async function handleInvitar() {
    if (!seleccionado) return
    setEnviando(true)
    setError(null)
    try {
      await onInvitar(seleccionado.id, mensaje.trim())
      onCerrar()
    } catch (e) {
      setError(e.message)
    } finally {
      setEnviando(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={onCerrar} />
      <div className="relative bg-white rounded-xl shadow-xl w-full max-w-md p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <UserPlus className="h-5 w-5 text-[#1B2D4E]" />
            <h2 className="text-base font-semibold text-gray-900">Invitar revisor</h2>
          </div>
          <button onClick={onCerrar} className="text-gray-400 hover:text-gray-600">
            <X className="h-5 w-5" />
          </button>
        </div>

        <p className="text-sm text-gray-500">
          Busca a un colega por nombre o email. Solo puede ver el expediente — no puede modificarlo.
        </p>

        {/* Buscador */}
        {!seleccionado ? (
          <div className="space-y-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                autoFocus
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="Nombre o email del perito…"
                className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1B2D4E]/30 focus:border-[#1B2D4E]"
              />
              {buscando && (
                <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 animate-spin" />
              )}
            </div>

            {resultados.length > 0 && (
              <div className="border border-gray-200 rounded-lg divide-y divide-gray-100 max-h-48 overflow-y-auto">
                {resultados.map(u => {
                  const yaInvitado = yaInvitados.has(u.id)
                  return (
                    <button
                      key={u.id}
                      disabled={yaInvitado}
                      onClick={() => setSeleccionado(u)}
                      className="w-full flex items-center gap-3 px-3 py-2.5 text-left hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-800 truncate">{u.nombre}</p>
                        <p className="text-xs text-gray-400 truncate">{u.email}</p>
                      </div>
                      {yaInvitado && (
                        <span className="text-xs text-gray-400 shrink-0">Ya invitado</span>
                      )}
                    </button>
                  )
                })}
              </div>
            )}

            {query.length >= 2 && !buscando && resultados.length === 0 && (
              <p className="text-xs text-gray-400 text-center py-2">Sin resultados para "{query}"</p>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex items-center gap-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-800">{seleccionado.nombre}</p>
                <p className="text-xs text-gray-500">{seleccionado.email}</p>
              </div>
              <button
                onClick={() => setSeleccionado(null)}
                className="text-gray-400 hover:text-gray-600 text-xs"
              >
                Cambiar
              </button>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Mensaje de invitación (opcional)
              </label>
              <textarea
                value={mensaje}
                onChange={e => setMensaje(e.target.value)}
                rows={3}
                placeholder="Ej: Revisa los comparables de terreno, el factor de zona del comp. 2 puede estar sobreestimado."
                className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 resize-none focus:outline-none focus:ring-2 focus:ring-[#1B2D4E]/30 focus:border-[#1B2D4E]"
              />
            </div>
          </div>
        )}

        {error && <p className="text-xs text-red-600">{error}</p>}

        <div className="flex justify-end gap-2 pt-1">
          <button onClick={onCerrar} className="text-sm text-gray-500 hover:text-gray-700 px-4 py-2">
            Cancelar
          </button>
          {seleccionado && (
            <button
              onClick={handleInvitar}
              disabled={enviando}
              className="flex items-center gap-1.5 text-sm bg-[#1B2D4E] text-white px-4 py-2 rounded-lg hover:bg-[#2A4A7F] disabled:opacity-50"
            >
              {enviando ? <Loader2 className="h-4 w-4 animate-spin" /> : <UserPlus className="h-4 w-4" />}
              {enviando ? 'Enviando…' : 'Invitar'}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
