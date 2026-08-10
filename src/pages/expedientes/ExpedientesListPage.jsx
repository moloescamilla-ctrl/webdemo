import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useExpedientes } from '@/hooks/useExpedientes'
import {
  PlusCircle, FileText, Loader2, ChevronRight, Trash2, Eye, Pencil,
  Calculator, Archive, ChevronDown, ChevronUp, Search, X,
} from 'lucide-react'

const ESTADO_VARIANT = {
  borrador: 'secondary',
  en_proceso: 'warning',
  completado: 'success',
  firmado: 'default',
  archivado: 'secondary',
}

const ESTADO_LABEL = {
  borrador: 'Borrador',
  en_proceso: 'En proceso',
  completado: 'Completado',
  firmado: 'Firmado',
  archivado: 'Archivado',
}

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

export function ExpedientesListPage() {
  const location = useLocation()
  const { expedientes, expedientesParaRevisar, loading, error, eliminarExpediente, archivarExpediente } = useExpedientes()
  const [eliminando, setEliminando] = useState(null)
  const [archivando, setArchivando] = useState(null)
  // Si venimos desde el dashboard o desde el botón "Terminado" que navega de vuelta, abre archivados automáticamente
  const [mostrarArchivados, setMostrarArchivados] = useState(location.state?.mostrarArchivados ?? false)
  const [busqueda, setBusqueda] = useState('')
  // Confirmación inline para eliminar (evita window.confirm que puede bloquearse en Android PWA)
  const [confirmarEliminar, setConfirmarEliminar] = useState(null)

  const hayBusqueda = busqueda.trim().length > 0

  const handleEliminar = async (id) => {
    setEliminando(id)
    setConfirmarEliminar(null)
    try { await eliminarExpediente(id) }
    catch (err) { console.error('Error al eliminar:', err.message) }
    finally { setEliminando(null) }
  }

  const handleArchivar = async (e, id) => {
    e.preventDefault(); e.stopPropagation()
    setArchivando(id)
    try { await archivarExpediente(id) }
    catch (err) { console.error('Error al archivar:', err.message) }
    finally { setArchivando(null) }
  }

  const avaluos = expedientes.filter(e => e.tipo_expediente !== 'calculo_rapido')
  const calculosRapidos = expedientes.filter(e => e.tipo_expediente === 'calculo_rapido')

  const vigentes   = avaluos.filter(e => e.estado !== 'archivado').filter(e => coincide(e, busqueda))
  const archivados = avaluos.filter(e => e.estado === 'archivado').filter(e => coincide(e, busqueda))
  const calculosFiltrados = calculosRapidos.filter(e => coincide(e, busqueda))

  // Agrupar vigentes por mes (solo cuando no hay búsqueda activa)
  const grouped = hayBusqueda
    ? null
    : vigentes.reduce((acc, exp) => {
        const label = mesLabel(exp.created_at)
        if (!acc[label]) acc[label] = []
        acc[label].push(exp)
        return acc
      }, {})

  const totalVisible = vigentes.length + archivados.length + calculosFiltrados.length

  return (
    <div className="p-6 max-w-4xl">
      {/* ── Encabezado ── */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Expedientes</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {avaluos.filter(e => e.estado !== 'archivado').length} vigente{avaluos.filter(e => e.estado !== 'archivado').length !== 1 ? 's' : ''}
            {archivados.length > 0 ? ` · ${archivados.length} archivado${archivados.length !== 1 ? 's' : ''}` : ''}
          </p>
        </div>
        <Link to="/expedientes/nuevo">
          <Button>
            <PlusCircle className="h-4 w-4" />
            Nuevo avalúo
          </Button>
        </Link>
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
          <span className="text-sm">Cargando expedientes…</span>
        </div>
      )}

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-md text-sm text-red-700">
          Error: {error}
        </div>
      )}

      {/* Estado vacío global */}
      {!loading && !error && expedientes.length === 0 && (
        <div className="text-center py-16 text-gray-400">
          <FileText className="h-12 w-12 mx-auto mb-3 opacity-30" />
          <p className="text-sm font-medium">Sin expedientes aún</p>
          <p className="text-xs mt-1">Crea tu primer avalúo para comenzar</p>
          <Link to="/expedientes/nuevo">
            <Button className="mt-4" variant="outline">
              <PlusCircle className="h-4 w-4" />
              Crear primer avalúo
            </Button>
          </Link>
        </div>
      )}

      {/* Sin resultados de búsqueda */}
      {!loading && hayBusqueda && totalVisible === 0 && expedientes.length > 0 && (
        <div className="text-center py-12 text-gray-400">
          <Search className="h-8 w-8 mx-auto mb-2 opacity-30" />
          <p className="text-sm">Sin resultados para <strong>"{busqueda}"</strong></p>
          <button onClick={() => setBusqueda('')} className="mt-2 text-xs text-blue-500 hover:underline">
            Limpiar búsqueda
          </button>
        </div>
      )}

      {/* ── Para revisar ── */}
      {expedientesParaRevisar.length > 0 && (
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-3">
            <Eye className="h-4 w-4 text-yellow-500" />
            <h2 className="text-xs font-semibold text-yellow-600 uppercase tracking-wide whitespace-nowrap">
              Para revisar
            </h2>
            <span className="text-xs text-gray-300">{expedientesParaRevisar.length} exp.</span>
            <div className="flex-1 h-px bg-yellow-100" />
          </div>
          <div className="space-y-2">
            {expedientesParaRevisar.map(exp => {
              const cerrada = exp._estadoRevision === 'cerrada'
              return (
                <Link
                  key={exp.id}
                  to={`/expedientes/${exp.id}`}
                  className={`border rounded-lg hover:shadow-sm transition-all flex items-center gap-4 p-4 ${
                    cerrada
                      ? 'bg-green-50 border-green-200 hover:border-green-400'
                      : 'bg-yellow-50 border-yellow-200 hover:border-yellow-400'
                  }`}
                >
                  <Eye className={`h-8 w-8 shrink-0 ${cerrada ? 'text-green-300' : 'text-yellow-300'}`} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs text-gray-500">
                        {exp.folio || exp.id.slice(0, 8).toUpperCase()}
                      </span>
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                        cerrada ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                      }`}>
                        {cerrada ? 'Revisión cerrada' : 'En revisión'}
                      </span>
                    </div>
                    <p className="font-medium text-sm text-gray-900 mt-0.5 truncate">
                      {[exp.calle, exp.colonia, exp.municipio].filter(Boolean).join(', ') || 'Sin dirección'}
                    </p>
                    <p className="text-xs text-gray-400">
                      {exp.tipo_inmueble} · {new Date(exp.created_at).toLocaleDateString('es-MX')}
                    </p>
                  </div>
                  <ChevronRight className={`h-4 w-4 shrink-0 ${cerrada ? 'text-green-300' : 'text-yellow-300'}`} />
                </Link>
              )
            })}
          </div>
        </div>
      )}

      {/* ── Avalúos vigentes ── */}
      {vigentes.length > 0 && (
        <div className="space-y-7">
          {hayBusqueda ? (
            // Búsqueda activa → lista plana sin agrupación
            <div>
              <div className="flex items-center gap-3 mb-3">
                <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wide whitespace-nowrap">
                  Vigentes
                </h2>
                <span className="text-xs text-gray-300">{vigentes.length} resultado{vigentes.length !== 1 ? 's' : ''}</span>
                <div className="flex-1 h-px bg-gray-100" />
              </div>
              <div className="space-y-2">
                {vigentes.map(exp => (
                  <ExpRow
                    key={exp.id} exp={exp}
                    eliminando={eliminando} archivando={archivando}
                    onEliminar={setConfirmarEliminar} onArchivar={handleArchivar}
                  />
                ))}
              </div>
            </div>
          ) : (
            // Sin búsqueda → grupos por mes
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
                    <ExpRow
                      key={exp.id} exp={exp}
                      eliminando={eliminando} archivando={archivando}
                      onEliminar={setConfirmarEliminar} onArchivar={handleArchivar}
                    />
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* ── Archivados ── */}
      {archivados.length > 0 && (
        <div className="mt-8">
          <button
            onClick={() => setMostrarArchivados(v => !v)}
            className="flex items-center gap-3 w-full mb-3 group"
          >
            <Archive className="h-4 w-4 text-gray-400 group-hover:text-gray-600" />
            <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wide whitespace-nowrap group-hover:text-gray-600">
              Archivados
            </h2>
            <span className="text-xs text-gray-300">{archivados.length}</span>
            <div className="flex-1 h-px bg-gray-100" />
            {mostrarArchivados || hayBusqueda
              ? <ChevronUp className="h-4 w-4 text-gray-300" />
              : <ChevronDown className="h-4 w-4 text-gray-300" />}
          </button>

          {(mostrarArchivados || hayBusqueda) && (
            <div className="space-y-2">
              {archivados.map(exp => (
                <ExpRow
                  key={exp.id} exp={exp}
                  eliminando={eliminando} archivando={archivando}
                  onEliminar={setConfirmarEliminar} onArchivar={null}
                  archivado
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── Cálculos rápidos ── */}
      {calculosFiltrados.length > 0 && (
        <div className="mt-10">
          <div className="flex items-center gap-3 mb-3">
            <Calculator className="h-4 w-4 text-purple-400" />
            <h2 className="text-xs font-semibold text-purple-500 uppercase tracking-wide whitespace-nowrap">
              Cálculos rápidos
            </h2>
            <span className="text-xs text-gray-300">{calculosFiltrados.length}</span>
            <div className="flex-1 h-px bg-purple-100" />
          </div>
          <div className="space-y-2">
            {calculosFiltrados.map(exp => (
              <ExpRow
                key={exp.id} exp={exp}
                eliminando={eliminando} archivando={archivando}
                onEliminar={setConfirmarEliminar} onArchivar={null}
                rapido
              />
            ))}
          </div>
        </div>
      )}

      {/* Modal de confirmación de eliminación (reemplaza window.confirm) */}
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

function ExpRow({ exp, eliminando, archivando, onEliminar, onArchivar, rapido = false, archivado = false }) {
  return (
    <div className={`bg-white border rounded-lg hover:shadow-sm transition-all flex items-center ${
      archivado ? 'border-gray-100 opacity-70' : 'border-gray-200 hover:border-blue-300'
    }`}>
      <Link to={rapido ? `/expedientes/${exp.id}/editar` : `/expedientes/${exp.id}`} className="flex-1 flex items-center gap-4 p-4 min-w-0">
        {rapido
          ? <Calculator className="h-8 w-8 text-purple-200 shrink-0" />
          : archivado
            ? <Archive className="h-8 w-8 text-gray-200 shrink-0" />
            : <FileText className="h-8 w-8 text-gray-300 shrink-0" />}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs text-gray-500">
              {exp.folio || exp.id.slice(0, 8).toUpperCase()}
            </span>
            {rapido
              ? <span className="text-xs font-medium px-1.5 py-0.5 rounded-full bg-purple-100 text-purple-700">Cálculo rápido</span>
              : <Badge variant={ESTADO_VARIANT[exp.estado]}>{ESTADO_LABEL[exp.estado]}</Badge>}
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
          to={rapido ? `/expedientes/${exp.id}/editar` : `/expedientes/${exp.id}`}
          className="p-1.5 text-gray-300 hover:text-gray-500 transition-colors rounded"
          title={rapido ? 'Editar' : 'Ver detalle'}
        >
          <Pencil className="h-4 w-4" />
        </Link>
        {onArchivar && !archivado && !rapido && (
          <button
            onClick={(e) => onArchivar(e, exp.id)}
            disabled={archivando === exp.id}
            className="p-1.5 text-gray-300 hover:text-emerald-500 transition-colors rounded disabled:opacity-50"
            title="Marcar como terminado"
          >
            {archivando === exp.id
              ? <Loader2 className="h-4 w-4 animate-spin" />
              : <Archive className="h-4 w-4" />}
          </button>
        )}
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
