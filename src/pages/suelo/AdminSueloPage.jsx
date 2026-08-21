import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, Map, BookOpen, UploadCloud, BarChart2, Loader2 } from 'lucide-react'
import { CatalogoNormativo } from '@/features/suelo/CatalogoNormativo'
import { ImportadorGeoJSON } from '@/features/suelo/ImportadorGeoJSON'
import { useCatalogo, useInstrumentos } from '@/hooks/useCatalogo'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'

const TABS = [
  { id: 'catalogo',  label: 'Catálogo normativo', icon: BookOpen    },
  { id: 'importar',  label: 'Importar GeoJSON',   icon: UploadCloud },
  { id: 'cortes',    label: 'Cerrar corte',        icon: BarChart2   },
]

function TabCortes({ instrumentoId }) {
  const [corte,     setCorte]     = useState('')
  const [calculando, setCalculando] = useState(false)
  const [resultado, setResultado] = useState(null)
  const [error,     setError]     = useState(null)

  async function handleCerrar() {
    if (!corte.trim()) return
    setCalculando(true)
    setResultado(null)
    setError(null)
    try {
      const { data, error: rpcErr } = await supabase.rpc('calcular_valores_corte', {
        p_corte: corte.trim(),
      })
      if (rpcErr) throw rpcErr
      setResultado(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setCalculando(false)
    }
  }

  return (
    <div className="space-y-4 max-w-md">
      <div>
        <p className="text-sm text-gray-600 mb-3">
          Calcula y consolida los valores estadísticos de suelo por microzona para un
          corte semestral. Formato: <span className="font-mono text-[#1B2D4E]">YYYY-S</span> (ej.{' '}
          <span className="font-mono">2026-1</span>).
        </p>
        <label className="text-xs text-gray-500 block mb-1">Corte</label>
        <div className="flex gap-2">
          <input
            type="text"
            value={corte}
            onChange={e => setCorte(e.target.value)}
            placeholder="2026-1"
            className="flex-1 text-sm border border-gray-200 rounded-md px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-[#1B2D4E]"
          />
          <Button
            className="bg-[#1B2D4E] hover:bg-[#2A4A7F]"
            disabled={!corte.trim() || calculando}
            onClick={handleCerrar}
          >
            {calculando ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Calcular'}
          </Button>
        </div>
      </div>

      {error && (
        <div className="rounded-md bg-red-50 border border-red-200 p-3 text-xs text-red-700">
          {error}
        </div>
      )}

      {resultado && (
        <div className="rounded-md bg-green-50 border border-green-200 p-3 space-y-2">
          <p className="text-sm font-medium text-green-800">
            Corte <span className="font-mono">{resultado.corte ?? corte}</span> procesado
            {' '}— {resultado.microzonas_procesadas ?? 0} microzona{resultado.microzonas_procesadas !== 1 ? 's' : ''}
          </p>
          {Array.isArray(resultado.detalle) && resultado.detalle.length > 0 && (
            <div className="space-y-1">
              {resultado.detalle.map((r, i) => (
                <div key={i} className="text-xs text-green-700 flex justify-between">
                  <span className="font-mono truncate">{r.microzona_id}</span>
                  <span className="font-medium shrink-0 ml-2">
                    {r.mediana != null
                      ? `$${Math.round(r.mediana).toLocaleString('es-MX')}/m² · n=${r.n}`
                      : 'sin datos'}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export function AdminSueloPage() {
  const [tab, setTab] = useState('catalogo')
  const { instrumentos, cargando: cargandoInstrumentos } = useInstrumentos()

  const instrumento = instrumentos.find(i => i.vigente) ?? instrumentos[0] ?? null
  const instrumentoId = instrumento?.id ?? null

  const { filas, cargando: cargandoCatalogo, actualizarFila, recargar } = useCatalogo(instrumentoId)

  return (
    <div className="flex flex-col h-[calc(100vh-56px)] lg:h-screen overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-200 bg-white flex items-center gap-3 shrink-0">
        <Link
          to="/suelo"
          className="text-gray-400 hover:text-[#1B2D4E] transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div className="flex-1 min-w-0">
          <h1 className="text-base font-bold text-[#1B2D4E]">Administración · Valores de Suelo</h1>
          {instrumento && (
            <p className="text-xs text-gray-400 truncate">
              {instrumento.nombre} — {instrumento.municipios?.nombre}, {instrumento.municipios?.estado}
            </p>
          )}
        </div>
        <Link
          to="/suelo"
          className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-[#1B2D4E] border border-gray-200 rounded-md px-2 py-1.5 transition-colors"
        >
          <Map className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Ver mapa</span>
        </Link>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 bg-white px-4 shrink-0">
        <div className="flex gap-1">
          {TABS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              className={`flex items-center gap-1.5 px-3 py-2.5 text-xs font-medium border-b-2 transition-colors ${
                tab === id
                  ? 'border-[#1B2D4E] text-[#1B2D4E]'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {cargandoInstrumentos ? (
          <div className="flex items-center justify-center h-32">
            <Loader2 className="h-5 w-5 animate-spin text-gray-400" />
          </div>
        ) : !instrumentoId ? (
          <div className="text-sm text-gray-500 text-center py-12">
            No hay instrumentos normativos configurados.
          </div>
        ) : (
          <>
            {tab === 'catalogo' && (
              <CatalogoNormativo
                filas={filas}
                cargando={cargandoCatalogo}
                onSave={actualizarFila}
              />
            )}
            {tab === 'importar' && (
              <ImportadorGeoJSON
                instrumentoId={instrumentoId}
                onImportado={recargar}
              />
            )}
            {tab === 'cortes' && (
              <TabCortes instrumentoId={instrumentoId} />
            )}
          </>
        )}
      </div>
    </div>
  )
}
