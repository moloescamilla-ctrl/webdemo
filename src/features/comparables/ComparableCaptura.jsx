import { useState } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { formatCurrency } from '@/lib/utils'
import {
  Link2, Loader2, AlertCircle, CheckCircle2, Trash2,
  ChevronDown, ChevronUp, ExternalLink, Info,
} from 'lucide-react'
import { useComparables } from './useComparables'

// ─── Confidence badge ────────────────────────────────────────────────────────

function scoreBg(score) {
  if (score === undefined || score === null) return ''
  if (score >= 0.8) return ''
  if (score >= 0.6) return 'bg-yellow-50 border-yellow-300'
  return 'bg-orange-50 border-orange-300'
}

function ScoreLabel({ score }) {
  if (score === undefined || score === null || score >= 0.8) return null
  if (score >= 0.6) return (
    <span className="text-[10px] text-yellow-600 font-medium">revisar</span>
  )
  return (
    <span className="text-[10px] text-orange-600 font-medium">verificar</span>
  )
}

// ─── Single editable field ────────────────────────────────────────────────────

function Campo({ label, campo, value, onChange, scores, type = 'text', options }) {
  const score = scores?.[campo]
  const bg = scoreBg(score)
  return (
    <div className={`space-y-0.5 rounded-md p-2 border ${bg || 'border-transparent'}`}>
      <div className="flex items-center justify-between">
        <Label className="text-xs text-gray-500">{label}</Label>
        <ScoreLabel score={score} />
      </div>
      {options ? (
        <select
          value={value ?? ''}
          onChange={e => onChange(campo, e.target.value || null)}
          className="w-full text-sm bg-transparent border-0 focus:outline-none text-gray-800 py-0.5"
        >
          <option value="">— no detectado —</option>
          {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      ) : (
        <input
          type={type}
          value={value ?? ''}
          onChange={e => onChange(campo, e.target.value === '' ? null : e.target.value)}
          placeholder="—"
          className="w-full text-sm bg-transparent border-0 focus:outline-none text-gray-800 placeholder-gray-300 py-0.5"
        />
      )}
    </div>
  )
}

// ─── Panel de revisión ────────────────────────────────────────────────────────

function PanelRevision({ datos, onCambio, onAgregar, onDescartar }) {
  const [expandido, setExpandido] = useState(false)

  const cambio = (campo, val) => onCambio(campo, val)

  const lowScoreFields = Object.entries(datos.scores || {})
    .filter(([, s]) => s < 0.6).length

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden">
      <div className="bg-gray-50 px-4 py-3 flex items-center justify-between border-b border-gray-200">
        <div className="flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 text-green-600" />
          <span className="text-sm font-medium text-gray-800">Datos extraídos — revisa y edita</span>
          {lowScoreFields > 0 && (
            <span className="text-xs bg-orange-100 text-orange-700 px-1.5 py-0.5 rounded-full font-medium">
              {lowScoreFields} campo{lowScoreFields > 1 ? 's' : ''} por verificar
            </span>
          )}
        </div>
        <a
          href={datos.url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-blue-600 hover:underline flex items-center gap-1"
        >
          {datos.portal}
          <ExternalLink className="h-3 w-3" />
        </a>
      </div>

      <div className="p-4 space-y-4">
        {/* Precio */}
        <div>
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Precio y tipo</p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <Campo label="Operación" campo="tipo_operacion" value={datos.tipo_operacion}
              onChange={cambio} scores={datos.scores}
              options={[{ value: 'venta', label: 'Venta' }, { value: 'renta', label: 'Renta' }]} />
            <Campo label="Tipo inmueble" campo="tipo_inmueble" value={datos.tipo_inmueble}
              onChange={cambio} scores={datos.scores}
              options={[
                { value: 'casa', label: 'Casa' }, { value: 'departamento', label: 'Departamento' },
                { value: 'terreno', label: 'Terreno' }, { value: 'local', label: 'Local' },
                { value: 'bodega', label: 'Bodega' }, { value: 'oficina', label: 'Oficina' },
                { value: 'otro', label: 'Otro' },
              ]} />
            <Campo label="Precio total ($)" campo="precio_total" value={datos.precio_total}
              onChange={(c, v) => cambio(c, v === null ? null : Number(v))}
              type="number" scores={datos.scores} />
            <Campo label="Moneda" campo="moneda" value={datos.moneda}
              onChange={cambio} scores={datos.scores}
              options={[{ value: 'MXN', label: 'MXN' }, { value: 'USD', label: 'USD' }]} />
          </div>
        </div>

        {/* Dimensiones */}
        <div>
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Dimensiones</p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <Campo label="Sup. total (m²)" campo="superficie_total" value={datos.superficie_total}
              onChange={(c, v) => cambio(c, v === null ? null : Number(v))}
              type="number" scores={datos.scores} />
            <Campo label="Sup. construcción (m²)" campo="superficie_construccion" value={datos.superficie_construccion}
              onChange={(c, v) => cambio(c, v === null ? null : Number(v))}
              type="number" scores={datos.scores} />
            <Campo label="Sup. terreno (m²)" campo="superficie_terreno" value={datos.superficie_terreno}
              onChange={(c, v) => cambio(c, v === null ? null : Number(v))}
              type="number" scores={datos.scores} />
            <Campo label="Recámaras" campo="recamaras" value={datos.recamaras}
              onChange={(c, v) => cambio(c, v === null ? null : Number(v))}
              type="number" scores={datos.scores} />
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-2">
            <Campo label="Baños" campo="banos" value={datos.banos}
              onChange={(c, v) => cambio(c, v === null ? null : Number(v))}
              type="number" scores={datos.scores} />
            <Campo label="Cajones" campo="cajones" value={datos.cajones}
              onChange={(c, v) => cambio(c, v === null ? null : Number(v))}
              type="number" scores={datos.scores} />
            <Campo label="Edad (años)" campo="edad_anios" value={datos.edad_anios}
              onChange={(c, v) => cambio(c, v === null ? null : Number(v))}
              type="number" scores={datos.scores} />
            <Campo label="Conservación" campo="conservacion" value={datos.conservacion}
              onChange={cambio} scores={datos.scores}
              options={[
                { value: 'excelente', label: 'Excelente' }, { value: 'bueno', label: 'Bueno' },
                { value: 'regular', label: 'Regular' }, { value: 'malo', label: 'Malo' },
              ]} />
          </div>
        </div>

        {/* Ubicación */}
        <div>
          <button
            type="button"
            className="flex items-center gap-1 text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2 hover:text-gray-600"
            onClick={() => setExpandido(p => !p)}
          >
            {expandido ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
            Ubicación y contacto
          </button>

          {expandido && (
            <div className="space-y-2">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                <Campo label="Calle" campo="calle" value={datos.calle} onChange={cambio} scores={{ calle: datos.scores?.ubicacion }} />
                <Campo label="Colonia" campo="colonia" value={datos.colonia} onChange={cambio} scores={{ colonia: datos.scores?.ubicacion }} />
                <Campo label="Municipio" campo="municipio" value={datos.municipio} onChange={cambio} scores={{ municipio: datos.scores?.ubicacion }} />
                <Campo label="Estado" campo="estado" value={datos.estado} onChange={cambio} scores={{ estado: datos.scores?.ubicacion }} />
                <Campo label="CP" campo="cp" value={datos.cp} onChange={cambio} scores={{ cp: datos.scores?.ubicacion }} />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <Campo label="Anunciante" campo="nombre_anunciante" value={datos.nombre_anunciante} onChange={cambio} scores={{}} />
                <Campo label="Teléfono" campo="telefono" value={datos.telefono} onChange={cambio} scores={{}} />
              </div>
              <Campo label="Descripción del anuncio" campo="descripcion" value={datos.descripcion} onChange={cambio} scores={{}} />
            </div>
          )}
        </div>
      </div>

      <div className="px-4 pb-4 flex gap-2 justify-end">
        <button
          type="button"
          onClick={onDescartar}
          className="text-sm text-gray-400 hover:text-gray-600"
        >
          Descartar
        </button>
        <Button onClick={onAgregar} size="sm">
          Agregar a bandeja
        </Button>
      </div>
    </div>
  )
}

// ─── Item en la bandeja ───────────────────────────────────────────────────────

function ItemBandeja({ comp, onEliminar }) {
  const superficie = comp.superficie_construccion ?? comp.superficie_total ?? comp.superficie_terreno
  const ubicacion = [comp.colonia, comp.municipio].filter(Boolean).join(', ') || 'Ubicación no detectada'

  return (
    <div className="flex items-center gap-3 py-2 border-b border-gray-100 last:border-0">
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-800 truncate">
          {comp.portal} · {comp.tipo_inmueble ?? '—'} en {comp.tipo_operacion ?? '—'}
        </p>
        <p className="text-xs text-gray-500 truncate">{ubicacion}</p>
        <div className="flex gap-3 mt-0.5">
          {comp.precio_total && (
            <span className="text-xs font-semibold text-green-700">{formatCurrency(comp.precio_total)}</span>
          )}
          {superficie && (
            <span className="text-xs text-gray-500">{superficie} m²</span>
          )}
        </div>
      </div>
      <button
        type="button"
        onClick={() => onEliminar(comp._bufferId)}
        className="text-gray-300 hover:text-red-400 transition-colors shrink-0"
      >
        <Trash2 className="h-3.5 w-3.5" />
      </button>
    </div>
  )
}

// ─── Componente principal ─────────────────────────────────────────────────────

export function ComparableCaptura({ expedienteId }) {
  const {
    buffer, guardados, loadingGuardados,
    vinculando, error: hookError,
    agregarAlBuffer, eliminarDelBuffer,
    vincularAlExpediente, eliminarGuardado,
  } = useComparables(expedienteId)

  const [url, setUrl] = useState('')
  const [extrayendo, setExtrayendo] = useState(false)
  const [errorExtraccion, setErrorExtraccion] = useState(null)
  const [datosExtraidos, setDatosExtraidos] = useState(null)

  async function handleExtraer() {
    if (!url.trim()) return
    setExtrayendo(true)
    setErrorExtraccion(null)
    setDatosExtraidos(null)
    try {
      const res = await fetch('/api/extraer-comparable', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: url.trim() }),
      })
      const json = await res.json()
      if (!json.success) throw new Error(json.error)
      setDatosExtraidos(json.data)
    } catch (e) {
      setErrorExtraccion(e.message || 'Error al extraer datos del anuncio')
    } finally {
      setExtrayendo(false)
    }
  }

  function handleCambio(campo, valor) {
    setDatosExtraidos(prev => ({ ...prev, [campo]: valor }))
  }

  function handleAgregar() {
    agregarAlBuffer(datosExtraidos)
    setDatosExtraidos(null)
    setUrl('')
  }

  function handleDescartar() {
    setDatosExtraidos(null)
    setUrl('')
  }

  return (
    <div className="space-y-5">
      {/* URL Capture */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Link2 className="h-4 w-4 text-blue-600" />
            <CardTitle>Capturar comparable</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-1">
            <Label htmlFor="url-comp">URL del anuncio</Label>
            <div className="flex gap-2">
              <Input
                id="url-comp"
                type="url"
                value={url}
                onChange={e => setUrl(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && !extrayendo && handleExtraer()}
                placeholder="https://www.inmuebles24.com/propiedades/..."
                className="flex-1 font-mono text-xs"
                disabled={extrayendo || !!datosExtraidos}
              />
              <Button
                onClick={handleExtraer}
                disabled={extrayendo || !url.trim() || !!datosExtraidos}
                className="shrink-0"
              >
                {extrayendo
                  ? <><Loader2 className="h-4 w-4 animate-spin mr-1" /> Extrayendo...</>
                  : 'Extraer datos'
                }
              </Button>
            </div>
            <p className="text-xs text-gray-400 flex items-center gap-1">
              <Info className="h-3 w-3" />
              Compatible con Inmuebles24, Lamudi, Vivanuncios, Propiedades.com, MercadoLibre y más
            </p>
          </div>

          {errorExtraccion && (
            <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-md text-sm text-red-700">
              <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
              {errorExtraccion}
            </div>
          )}

          {extrayendo && (
            <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-md">
              <Loader2 className="h-5 w-5 animate-spin text-blue-600 shrink-0" />
              <div>
                <p className="text-sm font-medium text-blue-800">Analizando el anuncio...</p>
                <p className="text-xs text-blue-600">Obteniendo contenido y extrayendo datos con IA</p>
              </div>
            </div>
          )}

          {datosExtraidos && (
            <PanelRevision
              datos={datosExtraidos}
              onCambio={handleCambio}
              onAgregar={handleAgregar}
              onDescartar={handleDescartar}
            />
          )}
        </CardContent>
      </Card>

      {/* Session Buffer */}
      {buffer.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>
                Bandeja de sesión
                <span className="ml-2 text-sm font-normal text-gray-400">
                  ({buffer.length} comparable{buffer.length > 1 ? 's' : ''})
                </span>
              </CardTitle>
            </div>
            <p className="text-xs text-gray-400">
              Estos comparables aún no están guardados. Vincula al expediente cuando termines.
            </p>
          </CardHeader>
          <CardContent className="space-y-1">
            {buffer.map(comp => (
              <ItemBandeja
                key={comp._bufferId}
                comp={comp}
                onEliminar={eliminarDelBuffer}
              />
            ))}

            {hookError && (
              <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-md text-sm text-red-700 mt-2">
                <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
                {hookError}
              </div>
            )}

            <div className="pt-3 flex justify-end">
              <Button
                onClick={vincularAlExpediente}
                disabled={vinculando || !expedienteId}
                className="bg-green-600 hover:bg-green-700"
              >
                {vinculando
                  ? <><Loader2 className="h-4 w-4 animate-spin mr-1" /> Guardando...</>
                  : `Vincular ${buffer.length} comparable${buffer.length > 1 ? 's' : ''} al expediente`
                }
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Saved comparables */}
      {(loadingGuardados || guardados.length > 0) && (
        <Card>
          <CardHeader>
            <CardTitle>
              Comparables guardados
              {guardados.length > 0 && (
                <span className="ml-2 text-sm font-normal text-gray-400">
                  ({guardados.length})
                </span>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loadingGuardados ? (
              <div className="flex items-center gap-2 text-gray-400 py-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="text-sm">Cargando...</span>
              </div>
            ) : (
              <div>
                {guardados.map(comp => {
                  const superficie = comp.superficie_construccion ?? comp.superficie_total ?? comp.superficie_terreno
                  const ubicacion = [comp.colonia, comp.municipio].filter(Boolean).join(', ')
                  return (
                    <div key={comp.id} className="flex items-center gap-3 py-2 border-b border-gray-100 last:border-0">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-medium text-gray-800 truncate">
                            {comp.portal} · {comp.tipo_inmueble ?? '—'} en {comp.tipo_operacion ?? '—'}
                          </p>
                          <a
                            href={comp.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-gray-300 hover:text-blue-500 shrink-0"
                          >
                            <ExternalLink className="h-3 w-3" />
                          </a>
                        </div>
                        <p className="text-xs text-gray-500 truncate">{ubicacion || 'Sin ubicación'}</p>
                        <div className="flex gap-3 mt-0.5">
                          {comp.precio_total && (
                            <span className="text-xs font-semibold text-green-700">{formatCurrency(comp.precio_total)}</span>
                          )}
                          {superficie && (
                            <span className="text-xs text-gray-500">{superficie} m²</span>
                          )}
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => eliminarGuardado(comp.id)}
                        className="text-gray-300 hover:text-red-400 transition-colors shrink-0"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}

// ─── Vista compacta para NuevoExpediente (sin expedienteId) ──────────────────

export function ComparableCapturaBuffer({ buffer, onAgregarAlBuffer, onEliminarDelBuffer }) {
  const [url, setUrl] = useState('')
  const [extrayendo, setExtrayendo] = useState(false)
  const [errorExtraccion, setErrorExtraccion] = useState(null)
  const [datosExtraidos, setDatosExtraidos] = useState(null)

  async function handleExtraer() {
    if (!url.trim()) return
    setExtrayendo(true)
    setErrorExtraccion(null)
    setDatosExtraidos(null)
    try {
      const res = await fetch('/api/extraer-comparable', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: url.trim() }),
      })
      const json = await res.json()
      if (!json.success) throw new Error(json.error)
      setDatosExtraidos(json.data)
    } catch (e) {
      setErrorExtraccion(e.message || 'Error al extraer datos del anuncio')
    } finally {
      setExtrayendo(false)
    }
  }

  function handleCambio(campo, valor) {
    setDatosExtraidos(prev => ({ ...prev, [campo]: valor }))
  }

  function handleAgregar() {
    onAgregarAlBuffer(datosExtraidos)
    setDatosExtraidos(null)
    setUrl('')
  }

  function handleDescartar() {
    setDatosExtraidos(null)
    setUrl('')
  }

  return (
    <div className="space-y-5">
      <div className="space-y-3">
        <div className="space-y-1">
          <Label htmlFor="url-comp-buf">URL del anuncio</Label>
          <div className="flex gap-2">
            <Input
              id="url-comp-buf"
              type="url"
              value={url}
              onChange={e => setUrl(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && !extrayendo && handleExtraer()}
              placeholder="https://www.inmuebles24.com/propiedades/..."
              className="flex-1 font-mono text-xs"
              disabled={extrayendo || !!datosExtraidos}
            />
            <Button
              onClick={handleExtraer}
              disabled={extrayendo || !url.trim() || !!datosExtraidos}
              className="shrink-0"
            >
              {extrayendo
                ? <><Loader2 className="h-4 w-4 animate-spin mr-1" /> Extrayendo...</>
                : 'Extraer datos'
              }
            </Button>
          </div>
          <p className="text-xs text-gray-400 flex items-center gap-1">
            <Info className="h-3 w-3" />
            Compatible con Inmuebles24, Lamudi, Vivanuncios, Propiedades.com y más
          </p>
        </div>

        {errorExtraccion && (
          <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-md text-sm text-red-700">
            <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
            {errorExtraccion}
          </div>
        )}

        {extrayendo && (
          <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-md">
            <Loader2 className="h-5 w-5 animate-spin text-blue-600 shrink-0" />
            <div>
              <p className="text-sm font-medium text-blue-800">Analizando el anuncio...</p>
              <p className="text-xs text-blue-600">Obteniendo contenido y extrayendo datos con IA</p>
            </div>
          </div>
        )}

        {datosExtraidos && (
          <PanelRevision
            datos={datosExtraidos}
            onCambio={handleCambio}
            onAgregar={handleAgregar}
            onDescartar={handleDescartar}
          />
        )}
      </div>

      {buffer.length > 0 && (
        <div className="border border-gray-200 rounded-lg overflow-hidden">
          <div className="bg-gray-50 px-4 py-2.5 border-b border-gray-200">
            <p className="text-sm font-medium text-gray-700">
              Bandeja: {buffer.length} comparable{buffer.length > 1 ? 's' : ''} capturado{buffer.length > 1 ? 's' : ''}
            </p>
            <p className="text-xs text-gray-400">Se vincularán al expediente al continuar</p>
          </div>
          <div className="divide-y divide-gray-100 px-4">
            {buffer.map(comp => (
              <ItemBandeja
                key={comp._bufferId}
                comp={comp}
                onEliminar={onEliminarDelBuffer}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
