import { useState } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { supabase } from '@/lib/supabase'
import { useCapturaComparables } from './useCapturaComparables'
import { PanelRevision } from './PanelRevision'
import { ComparableBuffer } from './ComparableBuffer'
import { ChevronDown, ChevronUp, Loader2, Info, ArrowRight, Globe, Copy, Check, RefreshCw } from 'lucide-react'

const ENDPOINT_CHROME = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/capturar-comparable`

export function CapturaComparables({ expedienteId, onTransferir }) {
  const [showChrome, setShowChrome] = useState(true)
  const [tokenCopiado, setTokenCopiado] = useState(false)
  const [enRevision, setEnRevision] = useState(null)

  const {
    comparables, loading,
    actualizarComparable, eliminarComparable, refetch,
  } = useCapturaComparables(expedienteId)

  const handleAprobar = async (id, datosEditados) => {
    await actualizarComparable(id, { ...datosEditados, estado_revision: 'aprobado' })
    setEnRevision(null)
  }

  const handleDescartar = async (id) => {
    await actualizarComparable(id, { estado_revision: 'descartado' })
    setEnRevision(null)
  }

  const handleAprobarRapido = async (id) => {
    await actualizarComparable(id, { estado_revision: 'aprobado' })
  }

  const handleCopiarToken = async () => {
    const { data: { session } } = await supabase.auth.getSession()
    if (session?.access_token) {
      await navigator.clipboard.writeText(session.access_token)
      setTokenCopiado(true)
      setTimeout(() => setTokenCopiado(false), 3000)
    }
  }

  const aprobados = comparables.filter(c => c.estado_revision === 'aprobado')

  return (
    <div className="space-y-5">

      {/* Claude for Chrome */}
      <Card className="border-purple-200">
        <CardHeader>
          <button
            className="flex items-center justify-between w-full text-left"
            onClick={() => setShowChrome(v => !v)}
          >
            <div className="flex items-center gap-2">
              <Globe className="h-4 w-4 text-purple-500" />
              <CardTitle className="text-sm text-purple-800">Claude for Chrome — captura directa desde portales</CardTitle>
              <span className="text-[10px] bg-purple-100 text-purple-700 px-1.5 py-0.5 rounded font-medium">Recomendado</span>
            </div>
            {showChrome
              ? <ChevronUp className="h-4 w-4 text-gray-400" />
              : <ChevronDown className="h-4 w-4 text-gray-400" />
            }
          </button>
        </CardHeader>
        {showChrome && (
          <CardContent className="space-y-4">
            <div className="flex items-start gap-2 p-3 bg-purple-50 rounded-md text-xs text-purple-800">
              <Info className="h-3.5 w-3.5 mt-0.5 shrink-0" />
              <span>
                Con la extensión <strong>Claude for Chrome</strong> instalada, navega a cualquier portal
                (Inmuebles24, Lamudi, Vivanuncios…), abre el detalle del comparable y pídele a Claude:
                <br />
                <em className="mt-1 block">"Captura este comparable para el expediente [folio]"</em>
                El comparable aparece aquí abajo con estado <strong>Pendiente</strong> sin que toques nada en la app.
              </span>
            </div>

            <div className="space-y-2">
              <p className="text-xs font-medium text-gray-600">1. Endpoint (configurar en Claude for Chrome)</p>
              <div className="flex items-center gap-2">
                <code className="flex-1 text-xs bg-gray-100 rounded px-2 py-1.5 text-gray-700 truncate select-all">
                  {ENDPOINT_CHROME}
                </code>
                <button
                  onClick={() => navigator.clipboard.writeText(ENDPOINT_CHROME)}
                  className="shrink-0 p-1.5 text-gray-400 hover:text-gray-700 transition-colors"
                  title="Copiar endpoint"
                >
                  <Copy className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-xs font-medium text-gray-600">2. Token de autenticación (copiar y pegar en Claude for Chrome)</p>
              <p className="text-xs text-gray-400">El token dura 1 hora. Cópialo al inicio de cada sesión de captura.</p>
              <Button
                size="sm"
                variant="outline"
                onClick={handleCopiarToken}
                className={`gap-1.5 text-xs ${tokenCopiado ? 'border-green-400 text-green-700' : ''}`}
              >
                {tokenCopiado
                  ? <><Check className="h-3.5 w-3.5" /> Token copiado al portapapeles</>
                  : <><Copy className="h-3.5 w-3.5" /> Copiar mi token de sesión</>
                }
              </Button>
            </div>

            <details className="text-xs text-gray-500">
              <summary className="cursor-pointer hover:text-gray-700">Ver instrucción base para Claude for Chrome</summary>
              <pre className="mt-2 bg-gray-50 rounded p-2 text-[11px] whitespace-pre-wrap leading-relaxed text-gray-600">{`Eres un asistente para captura de comparables inmobiliarios.
Cuando el usuario pida capturar un comparable:
1. Lee la página actual y extrae: precio_total, superficie_total_m2,
   recamaras, banos, estacionamientos, niveles, antiguedad_anios,
   colonia, municipio, titulo_anuncio, descripcion_raw, url_fuente.
2. Pide el expediente_id si no lo dieron.
3. Llama POST ${ENDPOINT_CHROME}
   Authorization: Bearer [token del usuario]
   Content-Type: application/json`}
              </pre>
            </details>
          </CardContent>
        )}
      </Card>

      {/* Buffer */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CardTitle>Buffer de comparables</CardTitle>
              <button
                onClick={refetch}
                disabled={loading}
                className="p-1 text-gray-400 hover:text-blue-600 transition-colors rounded"
                title="Actualizar — muestra comparables nuevos de Claude for Chrome"
              >
                <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
              </button>
            </div>
            {aprobados.length > 0 && onTransferir && (
              <Button
                size="sm"
                onClick={() => onTransferir(aprobados)}
                className="gap-1.5 bg-green-600 hover:bg-green-700 text-xs"
              >
                <ArrowRight className="h-3.5 w-3.5" />
                Transferir {aprobados.length} aprobado{aprobados.length !== 1 ? 's' : ''}
              </Button>
            )}
          </div>
          <p className="text-xs text-gray-400">
            Revisa cada captura antes de aprobarla. Solo los aprobados se transfieren a la homologación.
          </p>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center gap-2 text-gray-400 py-6 justify-center">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span className="text-sm">Cargando...</span>
            </div>
          ) : (
            <ComparableBuffer
              comparables={comparables}
              onRevisar={setEnRevision}
              onAprobarRapido={handleAprobarRapido}
              onEliminar={eliminarComparable}
            />
          )}
        </CardContent>
      </Card>

      {enRevision && (
        <PanelRevision
          comparable={enRevision}
          onAprobar={handleAprobar}
          onDescartar={handleDescartar}
          onClose={() => setEnRevision(null)}
        />
      )}
    </div>
  )
}
