import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, Map, BookOpen, UploadCloud, BarChart2, History, Loader2, CheckCircle2, ChevronDown, ChevronUp } from 'lucide-react'
import { CatalogoNormativo } from '@/features/suelo/CatalogoNormativo'
import { ImportadorGeoJSON } from '@/features/suelo/ImportadorGeoJSON'
import { useCatalogo, useInstrumentos } from '@/hooks/useCatalogo'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { formatCurrency } from '@/lib/utils'

const TABS = [
  { id: 'catalogo',  label: 'Catálogo normativo', icon: BookOpen    },
  { id: 'importar',  label: 'Importar GeoJSON',   icon: UploadCloud },
  { id: 'cortes',    label: 'Cerrar corte',        icon: BarChart2   },
  { id: 'historico', label: 'Histórico',           icon: History     },
]

const CONFIABILIDAD_LABEL = {
  alta:         'Alta (n≥6)',
  media:        'Media (3–5)',
  baja:         'Baja (<3)',
  insuficiente: 'Sin datos',
}
const CONFIABILIDAD_CLS = {
  alta:         'bg-green-100 text-green-700',
  media:        'bg-amber-100 text-amber-700',
  baja:         'bg-red-100 text-red-700',
  insuficiente: 'bg-gray-100 text-gray-500',
}

function ResultadoCorte({ label, resultado, corte }) {
  if (!resultado) return null
  return (
    <div className="rounded-md bg-green-50 border border-green-200 p-3 space-y-1.5">
      <p className="text-sm font-medium text-green-800 flex items-center gap-1.5">
        <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0" />
        {label} — {resultado.microzonas_procesadas ?? 0} microzona{resultado.microzonas_procesadas !== 1 ? 's' : ''}
      </p>
      {Array.isArray(resultado.detalle) && resultado.detalle.length > 0 && (
        <div className="space-y-0.5">
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
  )
}

function TabCortes() {
  const [corte,        setCorte]        = useState('')
  const [paso,         setPaso]         = useState(null)   // null | 'extrayendo' | 'calculando' | 'done'
  const [resExtraccion, setResExtraccion] = useState(null)
  const [resTerreno,   setResTerreno]   = useState(null)
  const [resConstruido, setResConstruido] = useState(null)
  const [error,        setError]        = useState(null)

  async function handleConsolidar() {
    const c = corte.trim()
    if (!c) return
    setError(null)
    setResExtraccion(null)
    setResTerreno(null)
    setResConstruido(null)

    try {
      // Paso 1: extraer comparables de homologación
      setPaso('extrayendo')
      const { data: extData, error: extErr } = await supabase.rpc('extraer_comparables_homologados', { p_corte: c })
      if (extErr) throw extErr
      setResExtraccion(extData)

      // Paso 2: calcular valores terreno vacante
      setPaso('calculando')
      const { data: tvData, error: tvErr } = await supabase.rpc('calcular_valores_corte', { p_corte: c })
      if (tvErr) throw tvErr
      setResTerreno(tvData)

      // Paso 3: calcular valores terreno construido (homologación)
      const { data: tcData, error: tcErr } = await supabase.rpc('calcular_valores_construidos', { p_corte: c })
      if (tcErr) throw tcErr
      setResConstruido(tcData)

      setPaso('done')
    } catch (err) {
      setError(err.message)
      setPaso(null)
    }
  }

  const procesando = paso === 'extrayendo' || paso === 'calculando'

  return (
    <div className="space-y-4 max-w-lg">
      <p className="text-sm text-gray-600">
        Consolida los valores estadísticos de suelo por microzona para un corte semestral.
        Extrae los comparables de los avalúos, luego calcula medianas y rangos de mercado.
        Formato: <span className="font-mono text-[#1B2D4E]">YYYY-S</span> (ej.{' '}
        <span className="font-mono">2026-1</span>).
      </p>

      <div>
        <label className="text-xs text-gray-500 block mb-1">Corte</label>
        <div className="flex gap-2">
          <input
            type="text"
            value={corte}
            onChange={e => setCorte(e.target.value)}
            placeholder="2026-1"
            disabled={procesando}
            className="flex-1 text-sm border border-gray-200 rounded-md px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-[#1B2D4E] disabled:opacity-50"
          />
          <Button
            className="bg-[#1B2D4E] hover:bg-[#2A4A7F] min-w-[120px]"
            disabled={!corte.trim() || procesando}
            onClick={handleConsolidar}
          >
            {procesando ? (
              <span className="flex items-center gap-1.5">
                <Loader2 className="h-4 w-4 animate-spin" />
                {paso === 'extrayendo' ? 'Extrayendo…' : 'Calculando…'}
              </span>
            ) : 'Consolidar'}
          </Button>
        </div>
      </div>

      {error && (
        <div className="rounded-md bg-red-50 border border-red-200 p-3 text-xs text-red-700">
          {error}
        </div>
      )}

      {resExtraccion && (
        <div className="rounded-md bg-blue-50 border border-blue-200 p-3 text-xs text-blue-700">
          Extracción — {resExtraccion.insertados ?? 0} comparable{resExtraccion.insertados !== 1 ? 's' : ''} de homologación cargado{resExtraccion.insertados !== 1 ? 's' : ''}
          {resExtraccion.omitidos > 0 && `, ${resExtraccion.omitidos} omitido${resExtraccion.omitidos !== 1 ? 's' : ''} (datos insuficientes)`}
        </div>
      )}

      <ResultadoCorte label="Terreno vacante (VT-V)" resultado={resTerreno}  corte={corte} />
      <ResultadoCorte label="Terreno construido (TC-V)" resultado={resConstruido} corte={corte} />
    </div>
  )
}

function TabHistorico({ municipioId }) {
  const [filas,     setFilas]     = useState([])
  const [cargando,  setCargando]  = useState(true)
  const [error,     setError]     = useState(null)
  const [expandido, setExpandido] = useState({})

  useEffect(() => {
    async function cargar() {
      setCargando(true)
      const { data, error: e } = await supabase
        .from('suelo_valores')
        .select('*, suelo_microzonas(nombre, municipio_id)')
        .order('corte', { ascending: false })
      if (e) { setError(e.message); setCargando(false); return }

      const filtrado = municipioId
        ? (data ?? []).filter(r => r.suelo_microzonas?.municipio_id === municipioId)
        : (data ?? [])
      setFilas(filtrado)
      setCargando(false)
    }
    cargar()
  }, [municipioId])

  if (cargando) {
    return (
      <div className="flex items-center justify-center h-32">
        <Loader2 className="h-5 w-5 animate-spin text-gray-400" />
      </div>
    )
  }

  if (error) {
    return <p className="text-sm text-red-600">{error}</p>
  }

  if (!filas.length) {
    return (
      <div className="text-center py-16 text-gray-400">
        <History className="h-10 w-10 mx-auto mb-3 text-gray-200" />
        <p className="text-sm font-medium text-gray-500">Sin datos históricos</p>
        <p className="text-xs mt-1">Consolida al menos un corte desde la pestaña «Cerrar corte».</p>
      </div>
    )
  }

  // Agrupar por microzona
  const porMicrozona = filas.reduce((acc, r) => {
    const key = r.microzona_id
    if (!acc[key]) acc[key] = { nombre: r.suelo_microzonas?.nombre ?? r.microzona_id, cortes: [] }
    acc[key].cortes.push(r)
    return acc
  }, {})

  const microzonas = Object.entries(porMicrozona).sort((a, b) => a[1].nombre.localeCompare(b[1].nombre))

  return (
    <div className="space-y-4 max-w-3xl">
      <p className="text-xs text-gray-500">
        Evolución de valores de suelo por microzona y corte semestral. Las medianas se calculan a partir de comparables de terreno vacante (VT-V) y construcción homologada (TC-V).
      </p>

      {microzonas.map(([mzId, { nombre, cortes }]) => {
        const abierto = expandido[mzId] !== false  // abierto por defecto
        return (
          <div key={mzId} className="border border-gray-200 rounded-lg overflow-hidden">
            <button
              className="w-full flex items-center justify-between px-4 py-2.5 bg-gray-50 hover:bg-gray-100 transition-colors text-left"
              onClick={() => setExpandido(prev => ({ ...prev, [mzId]: !abierto }))}
            >
              <span className="text-sm font-semibold text-[#1B2D4E]">{nombre}</span>
              {abierto ? <ChevronUp className="h-4 w-4 text-gray-400" /> : <ChevronDown className="h-4 w-4 text-gray-400" />}
            </button>

            {abierto && (
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-gray-100 bg-white text-gray-500">
                      <th className="px-3 py-2 text-left font-medium">Corte</th>
                      <th className="px-3 py-2 text-left font-medium">Tipo</th>
                      <th className="px-3 py-2 text-right font-medium">Mediana</th>
                      <th className="px-3 py-2 text-right font-medium">Rango P25–P75</th>
                      <th className="px-3 py-2 text-right font-medium">n</th>
                      <th className="px-3 py-2 text-left font-medium">Confiabilidad</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {cortes.map((r, i) => (
                      <tr key={i} className="hover:bg-gray-50">
                        <td className="px-3 py-2 font-mono text-gray-700">{r.corte}</td>
                        <td className="px-3 py-2">
                          <span className={`px-1.5 py-0.5 rounded text-xs font-medium ${r.tipo_suelo === 'vt_v' ? 'bg-[#1B2D4E]/10 text-[#1B2D4E]' : 'bg-purple-100 text-purple-700'}`}>
                            {r.tipo_suelo}
                          </span>
                        </td>
                        <td className="px-3 py-2 text-right font-mono font-semibold text-gray-800">
                          {r.valor_recomendado != null ? `${formatCurrency(r.valor_recomendado)}/m²` : '—'}
                        </td>
                        <td className="px-3 py-2 text-right font-mono text-gray-500">
                          {r.rango_inf != null
                            ? `${formatCurrency(r.rango_inf)} – ${formatCurrency(r.rango_sup)}`
                            : '—'}
                        </td>
                        <td className="px-3 py-2 text-right text-gray-700">{r.n_comparables}</td>
                        <td className="px-3 py-2">
                          <span className={`px-1.5 py-0.5 rounded-full text-xs font-medium ${CONFIABILIDAD_CLS[r.confiabilidad] ?? CONFIABILIDAD_CLS.insuficiente}`}>
                            {CONFIABILIDAD_LABEL[r.confiabilidad] ?? 'Sin datos'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

export function AdminSueloPage() {
  const [tab, setTab] = useState('catalogo')
  const { instrumentos, cargando: cargandoInstrumentos } = useInstrumentos()

  const instrumento   = instrumentos.find(i => i.vigente) ?? instrumentos[0] ?? null
  const instrumentoId = instrumento?.id ?? null
  const municipioId   = instrumento?.municipio_id ?? null

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
        <div className="flex gap-1 overflow-x-auto">
          {TABS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              className={`flex items-center gap-1.5 px-3 py-2.5 text-xs font-medium border-b-2 transition-colors whitespace-nowrap ${
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
        ) : !instrumentoId && tab !== 'historico' ? (
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
            {tab === 'cortes' && <TabCortes />}
            {tab === 'historico' && <TabHistorico municipioId={municipioId} />}
          </>
        )}
      </div>
    </div>
  )
}
