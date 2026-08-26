import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Badge } from '@/components/ui/badge'
import { useExpedientes } from '@/hooks/useExpedientes'
import {
  Archive, Loader2, ChevronRight, Trash2, Pencil, Search, X,
} from 'lucide-react'

function mesLabel(isoString) {
  const d = new Date(isoString)
  const raw = d.toLocaleDateString('es-MX', { year: 'numeric', month: 'long' })
  return raw.charAt(0).toUpperCase() + raw.slice(1)
}

function coincide(exp, q) {
  if (!q) return true
  const texto = [
    exp.folio,
    exp.calle,
    exp.colonia,
    exp.municipio,
    exp.estado_rep,
    exp.nombre_propietario,
    exp.solicitante,
    exp.tipo_inmueble,
    new Date(exp.created_at).toLocaleDateString('es-MX'),
    new Date(exp.created_at).getFullYear().toString(),
  ].filter(Boolean).join(' ').toLowerCase()
  return texto.includes(q.toLowerCase())
}

export function ArchivadosPage() {
  const { expedientes, loading, error, eliminarExpediente } = useExpedientes()
  const [eliminando, setEliminando] = useState(null)
  const [confirmarEliminar, setConfirmarEliminar] = useState(null)
  const [busqueda, setBusqueda] = useState('')

  const hayBusqueda = busqueda.trim().length > 0

  const handleEliminar = async (id) => {
    setEliminando(id)
    setConfirmarEliminar(null)
    try { await eliminarExpediente(id) }
    catch (err) { console.error('Error al eliminar:', err.message) }
    finally { setEliminando(null) }
  }

  const archivados = expedientes
    .filter(e => e.tipo_expediente !== 'calculo_rapido' && e.estado === 'archivado')
    .filter(e => coincide(e, busqueda))

  const grouped = hayBusqueda
    ? null
    : archivados.reduce((acc, exp) => {
        const label = mesLabel(exp.created_at)
        if (!acc[label]) acc[label] = []
        acc[label].push(exp)
        return acc
      }, {})

  return (
    <div className="p-6 max-w-4xl">
      {/* ── Encabezado ── */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Archivados</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {archivados.length} expediente{archivados.length !== 1 ? 's' : ''} terminado{archivados.length !== 1 ? 's' : ''}
          </p>
        </div>
      </div>

      {/* ── Buscador ── */}
      <div className="relative mb-5">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
        <input
          type="text"
          value={busqueda}
          onChange={e => setBusqueda(e.target.value)}
          placeholder="Buscar por folio, propietario, colonia, municipio, fecha…"
          className="w-full pl-9 pr-9 py-2.5 text-sm bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1B2D4E]/20 focus:border-[#1B2D4E]/50 transition"
        />
        {hayBusqueda && (
          <button
            onClick={() => setBusqueda('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {loading && (
        <div className="flex items-center justify-center py-12 text-gray-400 gap-2">
          <Loader2 className="h-5 w-5 animate-spin" />
          <span className="text-sm">Cargando…</span>
        </div>
      )}

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-md text-sm text-red-700">
          Error: {error}
        </div>
      )}

      {!loading && !error && archivados.length === 0 && (
        <div className="text-center py-16 text-gray-400">
          <Archive className="h-12 w-12 mx-auto mb-3 opacity-20" />
          <p className="text-sm font-medium">Sin expedientes archivados</p>
          <p className="text-xs mt-1">
            {hayBusqueda
              ? 'No hay resultados para tu búsqueda'
              : 'Los expedientes terminados aparecerán aquí'}
          </p>
          {hayBusqueda && (
            <button onClick={() => setBusqueda('')} className="mt-2 text-xs text-blue-500 hover:underline">
              Limpiar búsqueda
            </button>
          )}
        </div>
      )}

      {/* ── Lista agrupada por mes ── */}
      {archivados.length > 0 && (
        <div className="space-y-7">
          {hayBusqueda ? (
            <div>
              <div className="flex items-center gap-3 mb-3">
                <h2 className="text-xs font-semibold text-green-600 uppercase tracking-wide whitespace-nowrap">
                  Terminados
                </h2>
                <span className="text-xs text-gray-300">{archivados.length} resultado{archivados.length !== 1 ? 's' : ''}</span>
                <div className="flex-1 h-px bg-green-100" />
              </div>
              <div className="space-y-2">
                {archivados.map(exp => (
                  <ArchivadoRow
                    key={exp.id} exp={exp}
                    eliminando={eliminando}
                    onEliminar={setConfirmarEliminar}
                  />
                ))}
              </div>
            </div>
          ) : (
            Object.entries(grouped).map(([mes, exps]) => (
              <div key={mes}>
                <div className="flex items-center gap-3 mb-3">
                  <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wide whitespace-nowrap">
                    {mes}
                  </h2>
                  <span className="text-xs text-gray-300">{exps.length} exp.</span>
                  <div className="flex-1 h-px bg-gray-100" />
                </div>
                <div className="space-y-2">
                  {exps.map(exp => (
                    <ArchivadoRow
                      key={exp.id} exp={exp}
                      eliminando={eliminando}
                      onEliminar={setConfirmarEliminar}
                    />
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Modal de confirmación de eliminación */}
      {confirmarEliminar && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center px-4 pb-24 sm:pb-4 bg-black/40">
          <div className="bg-white rounded-2xl shadow-2xl p-5 w-full max-w-sm">
            <div className="flex items-center gap-3 mb-2">
              <div className="bg-red-100 rounded-full p-2 shrink-0">
                <Trash2 className="h-5 w-5 text-red-600" />
              </div>
              <p className="font-semibold text-gray-900 text-sm">¿Eliminar expediente?</p>
            </div>
            <p className="text-xs text-gray-500 mb-4 ml-11">Esta acción no se puede deshacer.</p>
            <div className="flex gap-2">
              <button
                onClick={() => setConfirmarEliminar(null)}
                className="flex-1 py-2.5 text-sm font-medium text-gray-600 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={() => handleEliminar(confirmarEliminar)}
                disabled={eliminando === confirmarEliminar}
                className="flex-1 py-2.5 text-sm font-medium text-white bg-red-600 rounded-xl hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-1.5"
              >
                {eliminando === confirmarEliminar ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function ArchivadoRow({ exp, eliminando, onEliminar }) {
  return (
    <div className="bg-white border border-green-100 rounded-lg hover:shadow-sm transition-all flex items-center opacity-90 hover:opacity-100">
      <Link to={`/expedientes/${exp.id}`} className="flex-1 flex items-center gap-4 p-4 min-w-0">
        <Archive className="h-8 w-8 text-green-300 shrink-0" />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs text-gray-500">
              {exp.folio || exp.id.slice(0, 8).toUpperCase()}
            </span>
            <Badge variant="success">Terminado</Badge>
          </div>
          <p className="font-medium text-sm text-gray-900 mt-0.5 truncate">
            {[exp.calle, exp.colonia, exp.municipio].filter(Boolean).join(', ') || 'Sin dirección'}
          </p>
          <p className="text-xs text-gray-400">
            {exp.tipo_inmueble}
            {exp.nombre_propietario ? ` · ${exp.nombre_propietario}` : ''}
            {' · '}{new Date(exp.created_at).toLocaleDateString('es-MX')}
          </p>
        </div>
        <ChevronRight className="h-4 w-4 text-gray-300 shrink-0" />
      </Link>

      <div className="px-3 flex items-center gap-0.5 border-l border-gray-100 shrink-0">
        <Link
          to={`/expedientes/${exp.id}`}
          className="p-1.5 text-gray-300 hover:text-gray-500 transition-colors rounded"
          title="Ver detalle"
        >
          <Pencil className="h-4 w-4" />
        </Link>
        <button
          onClick={(e) => { e.preventDefault(); e.stopPropagation(); onEliminar(exp.id) }}
          disabled={eliminando === exp.id}
          className="p-1.5 text-gray-300 hover:text-red-400 transition-colors rounded disabled:opacity-50"
          title="Eliminar"
        >
          {eliminando === exp.id
            ? <Loader2 className="h-4 w-4 animate-spin" />
            : <Trash2 className="h-4 w-4" />}
        </button>
      </div>
    </div>
  )
}
