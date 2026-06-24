import { useState } from 'react'
import { Navigation, Loader2, ExternalLink, X } from 'lucide-react'

function parsearUrlGoogleMaps(url) {
  // /@lat,lng,zoom — formato más común al compartir desde web/mobile
  let m = url.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/)
  if (m) return { latitud: parseFloat(m[1]), longitud: parseFloat(m[2]) }
  // ?q=lat,lng
  m = url.match(/[?&]q=(-?\d+\.\d+),(-?\d+\.\d+)/)
  if (m) return { latitud: parseFloat(m[1]), longitud: parseFloat(m[2]) }
  // ?ll=lat,lng
  m = url.match(/[?&]ll=(-?\d+\.\d+),(-?\d+\.\d+)/)
  if (m) return { latitud: parseFloat(m[1]), longitud: parseFloat(m[2]) }
  return null
}

export function UbicacionMapaInput({ latitud, longitud, onChange }) {
  const [urlInput, setUrlInput] = useState('')
  const [geoLoading, setGeoLoading] = useState(false)
  const [error, setError] = useState(null)

  const hasCoords = latitud != null && longitud != null

  function handleGPS() {
    if (!navigator.geolocation) {
      setError('Tu dispositivo no soporta geolocalización.')
      return
    }
    setGeoLoading(true)
    setError(null)
    navigator.geolocation.getCurrentPosition(
      pos => {
        onChange({ latitud: pos.coords.latitude, longitud: pos.coords.longitude })
        setGeoLoading(false)
      },
      () => {
        setError('No se pudo obtener la ubicación. Verifica que el navegador tenga permiso de acceder al GPS.')
        setGeoLoading(false)
      },
      { enableHighAccuracy: true, timeout: 10000 }
    )
  }

  function handleUrlChange(val) {
    setUrlInput(val)
    if (!val) { setError(null); return }
    if (val.includes('goo.gl') || val.includes('maps.app.goo.gl')) {
      setError('Enlace abreviado detectado. Abre el link en el navegador, copia la URL completa de la barra de direcciones y pégala aquí.')
      return
    }
    const coords = parsearUrlGoogleMaps(val)
    if (coords) {
      onChange(coords)
      setError(null)
    } else if (val.length > 15) {
      setError('No se encontraron coordenadas en este enlace. Asegúrate de copiar la URL completa.')
    }
  }

  function handleLimpiar() {
    onChange({ latitud: null, longitud: null })
    setUrlInput('')
    setError(null)
  }

  const previewUrl = hasCoords
    ? `https://www.openstreetmap.org/export/embed.html?bbox=${longitud - 0.002},${latitud - 0.002},${longitud + 0.002},${latitud + 0.002}&layer=mapnik&marker=${latitud},${longitud}`
    : null

  const googleMapsUrl = hasCoords
    ? `https://www.google.com/maps?q=${latitud},${longitud}`
    : null

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <button
          type="button"
          onClick={handleGPS}
          disabled={geoLoading}
          className="flex items-center gap-2 px-3 py-2 text-sm border border-gray-200 rounded-md hover:border-blue-400 hover:text-blue-600 transition-colors disabled:opacity-50 whitespace-nowrap shrink-0"
        >
          {geoLoading
            ? <Loader2 className="h-4 w-4 animate-spin" />
            : <Navigation className="h-4 w-4" />
          }
          {geoLoading ? 'Obteniendo...' : 'Mi ubicación'}
        </button>
        <input
          type="url"
          value={urlInput}
          onChange={e => handleUrlChange(e.target.value)}
          placeholder="Pegar URL de Google Maps..."
          className="flex-1 text-sm border border-gray-200 rounded-md px-3 py-2 focus:outline-none focus:border-blue-400 min-w-0"
        />
      </div>

      {error && (
        <p className="text-xs text-orange-600 bg-orange-50 border border-orange-100 px-3 py-2 rounded-md leading-relaxed">
          {error}
        </p>
      )}

      {hasCoords && (
        <div className="space-y-2">
          <iframe
            src={previewUrl}
            className="w-full h-52 rounded-md border border-gray-200"
            loading="lazy"
            title="Ubicación del predio"
          />
          <div className="flex items-center justify-between">
            <span className="font-mono text-xs text-gray-500 tabular-nums">
              {latitud.toFixed(6)}, {longitud.toFixed(6)}
            </span>
            <div className="flex items-center gap-4">
              <a
                href={googleMapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-xs text-blue-600 hover:underline"
              >
                <ExternalLink className="h-3 w-3" />
                Ver en Google Maps
              </a>
              <button
                type="button"
                onClick={handleLimpiar}
                className="flex items-center gap-1 text-xs text-gray-400 hover:text-red-400 transition-colors"
              >
                <X className="h-3 w-3" />
                Limpiar
              </button>
            </div>
          </div>
        </div>
      )}

      {!hasCoords && (
        <p className="text-xs text-gray-400">
          Usa el GPS del dispositivo estando en el predio, o pega el enlace de Google Maps desde cualquier dispositivo.
        </p>
      )}
    </div>
  )
}
