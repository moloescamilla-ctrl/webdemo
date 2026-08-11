import { useState, useRef } from 'react'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { UploadCloud, CheckCircle, AlertTriangle, X } from 'lucide-react'

const TIPO_OPTS = [
  { value: 'zona',      label: 'Zonas PMDU' },
  { value: 'microzona', label: 'Microzonas' },
]

export function ImportadorGeoJSON({ instrumentoId, onImportado }) {
  const [tipo,      setTipo]      = useState('zona')
  const [fuente,    setFuente]    = useState('digitalizado_qgis')
  const [geojson,   setGeojson]   = useState(null)
  const [fileName,  setFileName]  = useState(null)
  const [importando, setImportando] = useState(false)
  const [resultado, setResultado] = useState(null)
  const [parseError, setParseError] = useState(null)
  const inputRef = useRef()

  function handleFile(e) {
    const file = e.target.files?.[0]
    if (!file) return
    setParseError(null)
    setResultado(null)
    setFileName(file.name)
    const reader = new FileReader()
    reader.onload = (ev) => {
      try {
        const parsed = JSON.parse(ev.target.result)
        if (parsed.type !== 'FeatureCollection' && parsed.type !== 'Feature') {
          throw new Error('El archivo debe ser un GeoJSON FeatureCollection o Feature.')
        }
        setGeojson(parsed)
      } catch (err) {
        setParseError(err.message)
        setGeojson(null)
      }
    }
    reader.readAsText(file)
    e.target.value = ''
  }

  function handleDrop(e) {
    e.preventDefault()
    const file = e.dataTransfer.files?.[0]
    if (file) {
      const ev = { target: { files: [file], value: '' } }
      handleFile(ev)
    }
  }

  async function handleImportar() {
    if (!geojson || !instrumentoId) return
    setImportando(true)
    setResultado(null)
    try {
      const { data, error } = await supabase.rpc('importar_zonas_geojson', {
        p_geojson:        geojson,
        p_instrumento_id: instrumentoId,
        p_tipo:           tipo,
        p_fuente:         fuente,
      })
      if (error) throw error
      setResultado(data)
      if (data.insertados > 0) onImportado?.()
    } catch (err) {
      setResultado({ insertados: 0, errores: [err.message] })
    } finally {
      setImportando(false)
    }
  }

  function handleLimpiar() {
    setGeojson(null)
    setFileName(null)
    setResultado(null)
    setParseError(null)
  }

  const nFeatures = geojson?.features?.length ?? (geojson?.type === 'Feature' ? 1 : 0)

  return (
    <div className="space-y-4">
      {/* Tipo + fuente */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs text-gray-500 block mb-1">Tipo de capa</label>
          <select
            value={tipo}
            onChange={e => setTipo(e.target.value)}
            className="w-full text-sm border border-gray-200 rounded-md px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-[#1B2D4E]"
          >
            {TIPO_OPTS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </div>
        <div>
          <label className="text-xs text-gray-500 block mb-1">Fuente</label>
          <input
            type="text"
            value={fuente}
            onChange={e => setFuente(e.target.value)}
            className="w-full text-sm border border-gray-200 rounded-md px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-[#1B2D4E]"
            placeholder="digitalizado_qgis"
          />
        </div>
      </div>

      {/* Zona de drop */}
      {!geojson ? (
        <div
          onDragOver={e => e.preventDefault()}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
          className="border-2 border-dashed border-gray-200 rounded-lg p-8 text-center cursor-pointer hover:border-[#1B2D4E]/40 hover:bg-[#1B2D4E]/[0.02] transition-colors"
        >
          <UploadCloud className="h-8 w-8 text-gray-300 mx-auto mb-2" />
          <p className="text-sm text-gray-500">Arrastra un archivo GeoJSON o haz clic</p>
          <p className="text-xs text-gray-400 mt-1">Acepta FeatureCollection o Feature único</p>
          <input ref={inputRef} type="file" accept=".geojson,.json" onChange={handleFile} className="hidden" />
        </div>
      ) : (
        <div className="rounded-lg border border-green-200 bg-green-50 p-3 flex items-start justify-between gap-3">
          <div>
            <p className="text-sm font-medium text-green-800">{fileName}</p>
            <p className="text-xs text-green-600 mt-0.5">
              {nFeatures} feature{nFeatures !== 1 ? 's' : ''} · {TIPO_OPTS.find(o => o.value === tipo)?.label}
            </p>
          </div>
          <button onClick={handleLimpiar} className="text-gray-400 hover:text-red-500 mt-0.5">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {parseError && (
        <div className="rounded-md bg-red-50 border border-red-200 p-3 flex gap-2 text-xs text-red-700">
          <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
          {parseError}
        </div>
      )}

      {/* Requisitos del formato */}
      <div className="rounded-md bg-gray-50 border border-gray-100 p-3 text-xs text-gray-500 space-y-1">
        <p className="font-medium text-gray-600">Formato requerido en properties:</p>
        {tipo === 'zona'
          ? <p><span className="font-mono">clave</span> (requerido), <span className="font-mono">sector</span> (opcional)</p>
          : <p><span className="font-mono">nombre</span> (requerido), <span className="font-mono">zona_predominante</span>, <span className="font-mono">notas</span></p>
        }
        <p>Geometría: MultiPolygon o Polygon (se convierte automáticamente)</p>
      </div>

      <Button
        className="w-full bg-[#1B2D4E] hover:bg-[#2A4A7F]"
        disabled={!geojson || importando || !instrumentoId}
        onClick={handleImportar}
      >
        {importando ? 'Importando…' : `Importar ${nFeatures} feature${nFeatures !== 1 ? 's' : ''}`}
      </Button>

      {resultado && (
        <div className={`rounded-md border p-3 space-y-1 ${
          resultado.errores?.length ? 'bg-amber-50 border-amber-200' : 'bg-green-50 border-green-200'
        }`}>
          <div className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <p className="text-sm font-medium text-green-800">
              {resultado.insertados} polígono{resultado.insertados !== 1 ? 's' : ''} importado{resultado.insertados !== 1 ? 's' : ''}
            </p>
          </div>
          {resultado.errores?.length > 0 && (
            <div className="space-y-0.5 mt-2">
              {resultado.errores.map((e, i) => (
                <p key={i} className="text-xs text-amber-700 flex gap-1">
                  <AlertTriangle className="h-3 w-3 shrink-0 mt-0.5" />
                  {e}
                </p>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
