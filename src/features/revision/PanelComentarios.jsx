import { useState } from 'react'
import { CheckCircle2, Clock, ChevronDown, ChevronUp, MessageSquare } from 'lucide-react'

const ETIQUETAS = {
  datos_generales:   'Datos generales',
  entorno:           'Entorno e infraestructura',
  terreno:           'Características del terreno',
  construcciones:    'Descripción de construcciones',
  inspeccion:        'Inspección física / Ross-Heidecke',
  metodo_fisico:     'Método Físico',
  metodo_comparativo:'Método Comparativo',
  metodo_rentas:     'Método de Rentas',
  metodo_residual:   'Método Residual',
  conclusion:        'Conclusión y valor comercial',
  general:           'Comentario general',
}

function nombreRevisor(revisor) {
  return revisor?.raw_user_meta_data?.nombre_perito || revisor?.email || 'Revisor'
}

function formatHora(iso) {
  if (!iso) return ''
  return new Date(iso).toLocaleString('es-MX', {
    day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit',
  })
}

function TarjetaComentario({ comentario, esAutor, onAtender }) {
  const [expandirRespuesta, setExpandirRespuesta] = useState(false)
  const [respuesta, setRespuesta] = useState('')
  const [guardando, setGuardando] = useState(false)

  const pendiente = comentario.estado === 'pendiente'

  async function handleAtender() {
    setGuardando(true)
    try {
      await onAtender(comentario.id, respuesta)
      setExpandirRespuesta(false)
    } finally {
      setGuardando(false)
    }
  }

  return (
    <div className={`rounded-lg border p-3 space-y-2 text-sm ${
      pendiente ? 'bg-white border-gray-200' : 'bg-gray-50 border-gray-100'
    }`}>
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <p className="text-gray-800 whitespace-pre-wrap">{comentario.texto}</p>
          {comentario.campo && (
            <p className="text-xs text-gray-400 mt-1">Campo: <span className="font-mono">{comentario.campo}</span></p>
          )}
        </div>
        {pendiente ? (
          <span className="shrink-0 flex items-center gap-1 text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded-full px-2 py-0.5">
            <Clock className="w-3 h-3" /> Pendiente
          </span>
        ) : (
          <span className="shrink-0 flex items-center gap-1 text-xs text-green-600 bg-green-50 border border-green-200 rounded-full px-2 py-0.5">
            <CheckCircle2 className="w-3 h-3" /> Atendido
          </span>
        )}
      </div>

      <div className="text-xs text-gray-400">
        {nombreRevisor(comentario.revisor)} · {formatHora(comentario.created_at)}
      </div>

      {/* Respuesta del autor ya guardada */}
      {comentario.respuesta_autor && (
        <div className="bg-blue-50 border border-blue-100 rounded p-2 text-xs text-blue-800">
          <span className="font-medium">Respuesta del perito: </span>
          {comentario.respuesta_autor}
        </div>
      )}

      {/* Botón "Marcar atendido" solo para autor y comentarios pendientes */}
      {esAutor && pendiente && (
        <div>
          {!expandirRespuesta ? (
            <button
              onClick={() => setExpandirRespuesta(true)}
              className="text-xs text-blue-600 hover:text-blue-800 flex items-center gap-1"
            >
              <ChevronDown className="w-3 h-3" /> Marcar como atendido
            </button>
          ) : (
            <div className="space-y-2">
              <textarea
                placeholder="Respuesta opcional (decisión tomada, aclaración…)"
                value={respuesta}
                onChange={e => setRespuesta(e.target.value)}
                rows={2}
                className="w-full border border-gray-200 rounded px-2 py-1.5 text-xs resize-none focus:outline-none focus:ring-1 focus:ring-blue-400"
              />
              <div className="flex gap-2">
                <button
                  onClick={handleAtender}
                  disabled={guardando}
                  className="text-xs bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700 disabled:opacity-50 flex items-center gap-1"
                >
                  <CheckCircle2 className="w-3 h-3" />
                  {guardando ? 'Guardando…' : 'Confirmar atendido'}
                </button>
                <button
                  onClick={() => setExpandirRespuesta(false)}
                  className="text-xs text-gray-400 hover:text-gray-600 px-2 py-1"
                >
                  Cancelar
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export function PanelComentarios({ comentarios, pendientes, atendidos, esAutor, onAtender, onCerrar, revisiones }) {
  const [seccionExpandida, setSeccionExpandida] = useState(null)

  const porSeccion = comentarios.reduce((acc, c) => {
    const s = c.seccion || 'general'
    if (!acc[s]) acc[s] = []
    acc[s].push(c)
    return acc
  }, {})

  const revisionesActivas = (revisiones ?? []).filter(r => r.estado === 'activa')
  const todoAtendido = pendientes.length === 0 && atendidos.length > 0

  if (comentarios.length === 0 && (revisiones ?? []).length === 0) {
    return (
      <div className="text-center py-8 text-sm text-gray-400">
        <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-30" />
        Sin comentarios de revisión aún.
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Resumen */}
      {comentarios.length > 0 && (
        <div className="flex flex-wrap gap-2 text-sm">
          <span className="px-2.5 py-1 bg-amber-100 text-amber-800 rounded-full font-medium text-xs">
            {pendientes.length} pendiente{pendientes.length !== 1 ? 's' : ''}
          </span>
          <span className="px-2.5 py-1 bg-green-100 text-green-800 rounded-full font-medium text-xs">
            {atendidos.length} atendido{atendidos.length !== 1 ? 's' : ''}
          </span>
        </div>
      )}

      {/* Revisores activos */}
      {revisionesActivas.length > 0 && (
        <div className="space-y-1.5">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Revisores activos</p>
          {revisionesActivas.map(r => (
            <div key={r.id} className="flex items-center justify-between p-2.5 bg-yellow-50 border border-yellow-200 rounded-lg">
              <span className="text-xs text-gray-700">{nombreRevisor(r.revisor)}</span>
              {esAutor && todoAtendido && (
                <button
                  onClick={() => onCerrar?.(r.id)}
                  className="text-xs text-gray-500 hover:text-gray-700 border border-gray-200 rounded px-2 py-0.5 hover:border-gray-400"
                >
                  Cerrar revisión
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Comentarios por sección */}
      {Object.entries(porSeccion).map(([seccion, items]) => {
        const expandido = seccionExpandida === seccion || seccionExpandida === null
        return (
          <div key={seccion}>
            <button
              onClick={() => setSeccionExpandida(expandido && seccionExpandida !== null ? null : seccion)}
              className="flex items-center gap-2 w-full text-left mb-2"
            >
              <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide flex-1">
                {ETIQUETAS[seccion] ?? seccion}
              </h4>
              <span className="text-xs text-gray-400">{items.length}</span>
              {seccionExpandida !== null
                ? (expandido ? <ChevronUp className="w-3 h-3 text-gray-400" /> : <ChevronDown className="w-3 h-3 text-gray-400" />)
                : null}
            </button>
            {(seccionExpandida === null || seccionExpandida === seccion) && (
              <div className="space-y-2">
                {items.map(c => (
                  <TarjetaComentario
                    key={c.id}
                    comentario={c}
                    esAutor={esAutor}
                    onAtender={onAtender}
                  />
                ))}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
