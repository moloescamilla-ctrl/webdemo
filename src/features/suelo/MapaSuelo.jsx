import 'leaflet/dist/leaflet.css'
import { MapContainer, TileLayer, GeoJSON, useMapEvents, CircleMarker } from 'react-leaflet'
import { useState, useRef } from 'react'

// Colores por categoría de zona PMDU
const COLOR_CATEGORIA = {
  habitacional:  '#16a34a',
  mixto:         '#0d9488',
  corredor:      '#ea580c',
  comercio:      '#2563eb',
  industrial:    '#7c3aed',
  proteccion:    '#dc2626',
  centralidad:   '#1B2D4E',
  equipamiento:  '#ca8a04',
  turismo:       '#db2777',
  infraestructura: '#64748b',
  supletoria:    '#9ca3af',
}

const OPACIDAD_NORMAL    = 0.35
const OPACIDAD_HIGHLIGHT = 0.65

function capa_style(feature, clave_hover) {
  const cat  = feature?.properties?.categoria
  const id   = feature?.properties?.id
  const color = COLOR_CATEGORIA[cat] ?? '#6b7280'
  return {
    color,
    weight:      id === clave_hover ? 2.5 : 1,
    fillColor:   color,
    fillOpacity: id === clave_hover ? OPACIDAD_HIGHLIGHT : OPACIDAD_NORMAL,
    opacity:     0.9,
  }
}

function style_microzona() {
  return { color: '#1B2D4E', weight: 1.5, fillOpacity: 0, dashArray: '4 3', opacity: 0.5 }
}

function ClickCapturer({ onMapClick }) {
  useMapEvents({ click: (e) => onMapClick(e.latlng.lat, e.latlng.lng) })
  return null
}

export function MapaSuelo({
  capas,
  onZonaClick,
  capasVisibles = { zonas: true, microzonas: true },
}) {
  const [hoverId, setHoverId]     = useState(null)
  const [clickPin, setClickPin]   = useState(null)
  const geoJsonRef = useRef(null)

  function handleMapClick(lat, lng) {
    setClickPin({ lat, lng })
    onZonaClick?.(lat, lng)
  }

  function onEachZona(feature, layer) {
    layer.on({
      mouseover: () => setHoverId(feature.properties.id),
      mouseout:  () => setHoverId(null),
      click: (e) => {
        const { lat, lng } = e.latlng
        setClickPin({ lat, lng })
        onZonaClick?.(lat, lng)
      },
    })
  }

  return (
    <MapContainer
      center={[18.854, -97.101]}
      zoom={14}
      style={{ height: '100%', width: '100%' }}
      zoomControl={true}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      <ClickCapturer onMapClick={handleMapClick} />

      {capas?.zonas && capasVisibles.zonas && (
        <GeoJSON
          key={JSON.stringify(capas.zonas.features?.length)}
          data={capas.zonas}
          style={(f) => capa_style(f, hoverId)}
          onEachFeature={onEachZona}
        />
      )}

      {capas?.microzonas && capasVisibles.microzonas && (
        <GeoJSON
          key={'mz-' + JSON.stringify(capas.microzonas.features?.length)}
          data={capas.microzonas}
          style={style_microzona}
        />
      )}

      {clickPin && (
        <CircleMarker
          center={[clickPin.lat, clickPin.lng]}
          radius={6}
          pathOptions={{ color: '#1B2D4E', fillColor: '#fff', fillOpacity: 1, weight: 2 }}
        />
      )}
    </MapContainer>
  )
}

// Leyenda de categorías
export function LeyendaMapa({ categorias = [] }) {
  const visibles = categorias.filter(c => COLOR_CATEGORIA[c])
  if (!visibles.length) return null
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-2 space-y-1 min-w-[150px]">
      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Leyenda</p>
      {visibles.map(cat => (
        <div key={cat} className="flex items-center gap-2 text-xs text-gray-700 capitalize">
          <span
            className="w-3 h-3 rounded-sm shrink-0 border border-white"
            style={{ backgroundColor: COLOR_CATEGORIA[cat] }}
          />
          {cat}
        </div>
      ))}
    </div>
  )
}
