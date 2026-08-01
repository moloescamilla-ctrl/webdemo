import { useState } from 'react'
import { useCompartidos } from '@/hooks/useCompartidos'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Link2, Copy, X, Plus, CheckCheck, MessageSquare, Clock } from 'lucide-react'

function formatFecha(iso) {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' })
}

function formatHora(iso) {
  if (!iso) return ''
  return new Date(iso).toLocaleString('es-MX', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })
}

function enlaceUrl(token) {
  return `${window.location.origin}/revisar/${token}`
}

export function PanelCompartir({ expedienteId }) {
  const { compartidos, comentarios, loading, generarEnlace, revocarEnlace } = useCompartidos(expedienteId)
  const [generando, setGenerando] = useState(false)
  const [copiado, setCopiado] = useState(null)
  const [error, setError] = useState(null)

  async function handleGenerar() {
    setGenerando(true)
    setError(null)
    try {
      await generarEnlace()
    } catch (e) {
      setError(e.message)
    } finally {
      setGenerando(false)
    }
  }

  async function copiar(token) {
    await navigator.clipboard.writeText(enlaceUrl(token))
    setCopiado(token)
    setTimeout(() => setCopiado(null), 2000)
  }

  const activos = compartidos.filter(c => c.activo && new Date(c.expira_en) > new Date())
  const inactivos = compartidos.filter(c => !c.activo || new Date(c.expira_en) <= new Date())

  if (loading) return <div className="py-8 text-center text-sm text-gray-400">Cargando…</div>

  return (
    <div className="space-y-6">

      {/* ── Generar enlace ── */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Link2 className="w-4 h-4" />
            Enlace de revisión
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-gray-500">
            Genera un enlace temporal (10 días) para que otro perito pueda revisar este
            expediente en modo solo lectura y dejar comentarios. El expediente no puede
            ser modificado desde el enlace compartido.
          </p>

          <Button onClick={handleGenerar} disabled={generando} className="gap-2">
            <Plus className="w-4 h-4" />
            {generando ? 'Generando…' : 'Generar nuevo enlace'}
          </Button>
          {error && <p className="text-sm text-red-600">{error}</p>}

          {/* Links activos */}
          {activos.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                Enlace{activos.length > 1 ? 's' : ''} activo{activos.length > 1 ? 's' : ''}
              </p>
              {activos.map(c => (
                <div key={c.id} className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-mono text-gray-700 truncate">{enlaceUrl(c.token)}</p>
                    <p className="text-xs text-gray-400 mt-0.5 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      Expira: {formatFecha(c.expira_en)}
                    </p>
                  </div>
                  <button
                    onClick={() => copiar(c.token)}
                    className="p-1.5 rounded hover:bg-green-100 text-green-700 shrink-0"
                    title="Copiar enlace"
                  >
                    {copiado === c.token ? <CheckCheck className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  </button>
                  <button
                    onClick={() => revocarEnlace(c.id)}
                    className="p-1.5 rounded hover:bg-red-50 text-red-500 shrink-0"
                    title="Revocar enlace"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Links expirados/revocados */}
          {inactivos.length > 0 && (
            <div className="space-y-1">
              <p className="text-xs font-medium text-gray-400 uppercase tracking-wide">
                Historial
              </p>
              {inactivos.map(c => (
                <div key={c.id} className="flex items-center gap-2 p-2 bg-gray-50 border border-gray-200 rounded text-gray-400">
                  <p className="flex-1 text-xs font-mono truncate">{enlaceUrl(c.token)}</p>
                  <p className="text-xs shrink-0">
                    {!c.activo ? 'Revocado' : `Expiró ${formatFecha(c.expira_en)}`}
                  </p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* ── Comentarios recibidos ── */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <MessageSquare className="w-4 h-4" />
            Comentarios de revisores
            {comentarios.length > 0 && (
              <span className="ml-1 px-1.5 py-0.5 text-xs bg-blue-100 text-blue-700 rounded-full">
                {comentarios.length}
              </span>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {comentarios.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-4">
              Aún no hay comentarios de revisión para este expediente.
            </p>
          ) : (
            <div className="space-y-3">
              {comentarios.map(c => (
                <div key={c.id} className="p-3 bg-gray-50 border border-gray-200 rounded-lg">
                  <p className="text-sm text-gray-800 whitespace-pre-wrap">{c.contenido}</p>
                  <p className="text-xs text-gray-400 mt-1.5">{formatHora(c.created_at)}</p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

    </div>
  )
}
