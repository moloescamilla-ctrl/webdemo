import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { useRevision } from '@/hooks/useRevision'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Clock, MessageSquare, Send, AlertTriangle, Eye } from 'lucide-react'

function formatFecha(iso) {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('es-MX', { day: '2-digit', month: 'long', year: 'numeric' })
}

function formatHora(iso) {
  if (!iso) return ''
  return new Date(iso).toLocaleString('es-MX', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
}

function formatCurrency(n) {
  if (n == null) return '—'
  return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN', maximumFractionDigits: 0 }).format(n)
}

function diasRestantes(iso) {
  if (!iso) return 0
  return Math.ceil((new Date(iso) - new Date()) / (1000 * 60 * 60 * 24))
}

function Fila({ label, value }) {
  if (!value && value !== 0) return null
  return (
    <div className="flex flex-col sm:flex-row sm:gap-4 py-2 border-b border-gray-100 last:border-0">
      <dt className="text-xs font-medium text-gray-500 sm:w-48 shrink-0">{label}</dt>
      <dd className="text-sm text-gray-800 mt-0.5 sm:mt-0">{value}</dd>
    </div>
  )
}

export function RevisarExpedientePage() {
  const { token } = useParams()
  const { datos, comentarios, loading, error, agregarComentario } = useRevision(token)
  const [texto, setTexto] = useState('')
  const [enviando, setEnviando] = useState(false)
  const [errComentario, setErrComentario] = useState(null)

  async function handleEnviar(e) {
    e.preventDefault()
    if (!texto.trim()) return
    setEnviando(true)
    setErrComentario(null)
    try {
      await agregarComentario(texto.trim())
      setTexto('')
    } catch (err) {
      setErrComentario(err.message)
    } finally {
      setEnviando(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-sm text-gray-400">Cargando expediente…</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
        <div className="max-w-sm w-full text-center space-y-3">
          <AlertTriangle className="w-10 h-10 text-red-400 mx-auto" />
          <h1 className="text-lg font-semibold text-gray-800">Enlace no disponible</h1>
          <p className="text-sm text-gray-500">{error}</p>
          <p className="text-xs text-gray-400">El enlace puede haber expirado o sido revocado por el perito titular.</p>
        </div>
      </div>
    )
  }

  if (!datos) return null

  const { compartido, expediente, metodoFisico, metodoComparativo, metodoRentas, metodoResidual } = datos

  const valores = [
    { label: 'Enfoque comparativo de mercado', valor: metodoComparativo?.valor_comparativo_total },
    { label: 'Enfoque de costos (físico)',      valor: metodoFisico?.valor_fisico_total },
    { label: 'Enfoque de capitalización',       valor: metodoRentas?.valor_capitalizacion },
    { label: 'Enfoque residual',                valor: metodoResidual?.valor_residual },
  ].filter(v => v.valor != null)

  const diasRestantesExp = diasRestantes(compartido?.expira_en)

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Banner superior */}
      <div className="bg-[#1B2D4E] text-white px-4 py-3 flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Eye className="w-4 h-4 shrink-0" />
          <span className="text-sm font-medium">Expediente compartido — solo lectura</span>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-blue-200 shrink-0">
          <Clock className="w-3.5 h-3.5" />
          {diasRestantesExp > 0
            ? `Expira en ${diasRestantesExp} día${diasRestantesExp !== 1 ? 's' : ''}`
            : 'Expirado'}
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">

        {/* Encabezado */}
        <div>
          <p className="text-xs font-mono text-gray-400 uppercase tracking-wider">
            Folio {expediente?.folio || '—'}
          </p>
          <h1 className="text-xl font-bold text-gray-900 mt-1">
            {expediente?.tipo_inmueble || 'Inmueble'}
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {[expediente?.calle, expediente?.numero_oficial, expediente?.colonia, expediente?.municipio]
              .filter(Boolean).join(', ') || 'Sin dirección registrada'}
          </p>
        </div>

        {/* Datos generales */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Datos generales</CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="divide-y divide-gray-100">
              <Fila label="Propietario"        value={expediente?.nombre_propietario} />
              <Fila label="Solicitante"        value={expediente?.solicitante} />
              <Fila label="Propósito"          value={expediente?.proposito_avaluo} />
              <Fila label="Fecha de inspección" value={formatFecha(expediente?.fecha_inspeccion)} />
              <Fila label="Perito valuador"    value={expediente?.nombre_perito} />
              <Fila label="Cédula profesional" value={expediente?.cedula_perito} />
              <Fila label="CP"                 value={expediente?.cp} />
              <Fila label="Estado"             value={expediente?.estado_rep} />
            </dl>
          </CardContent>
        </Card>

        {/* Valores concluidos */}
        {valores.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Valores concluidos</CardTitle>
            </CardHeader>
            <CardContent>
              <dl className="divide-y divide-gray-100">
                {valores.map(v => (
                  <div key={v.label} className="flex justify-between items-center py-2">
                    <dt className="text-sm text-gray-600">{v.label}</dt>
                    <dd className="text-sm font-semibold text-gray-900 tabular-nums">{formatCurrency(v.valor)}</dd>
                  </div>
                ))}
              </dl>
            </CardContent>
          </Card>
        )}

        {/* Comentarios */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <MessageSquare className="w-4 h-4" />
              Comentarios de revisión
              {comentarios.length > 0 && (
                <span className="ml-1 px-1.5 py-0.5 text-xs bg-blue-100 text-blue-700 rounded-full">
                  {comentarios.length}
                </span>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {comentarios.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-2">
                Aún no hay comentarios. Sé el primero en dejar retroalimentación.
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

            {/* Formulario de comentario */}
            <form onSubmit={handleEnviar} className="space-y-2 border-t border-gray-100 pt-4">
              <textarea
                value={texto}
                onChange={e => setTexto(e.target.value)}
                placeholder="Escribe tu comentario de revisión aquí…"
                rows={4}
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-[#1B2D4E]/30 focus:border-[#1B2D4E]"
              />
              {errComentario && (
                <p className="text-xs text-red-600">{errComentario}</p>
              )}
              <div className="flex justify-end">
                <Button type="submit" disabled={enviando || !texto.trim()} className="gap-2">
                  <Send className="w-4 h-4" />
                  {enviando ? 'Enviando…' : 'Enviar comentario'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

      </div>
    </div>
  )
}
