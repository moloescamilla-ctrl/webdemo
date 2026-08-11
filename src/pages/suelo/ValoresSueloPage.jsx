import { useState, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { MapaSuelo, LeyendaMapa } from '@/features/suelo/MapaSuelo'
import { PanelZona } from '@/features/suelo/PanelZona'
import { useSuelo } from '@/hooks/useSuelo'
import { useSueloCapas } from '@/hooks/useSueloCapas'
import { Layers, Settings, Loader2 } from 'lucide-react'

export function ValoresSueloPage() {
  const { capas, cargando: cargandoCapas } = useSueloCapas({ municipioId: 30118 })
  const { consultarSuelo, consultando, resultado } = useSuelo()
  const [coordenadas, setCoordenadas] = useState(null)
  const [capasVisibles, setCapasVisibles] = useState({ zonas: true, microzonas: true })

  const handleMapClick = useCallback(async (lat, lng) => {
    setCoordenadas({ lat, lng })
    await consultarSuelo(lat, lng)
  }, [consultarSuelo])

  // Categorías presentes en las capas para la leyenda
  const categorias = [...new Set(
    (capas?.zonas?.features ?? []).map(f => f.properties?.categoria).filter(Boolean)
  )]

  return (
    <div className="flex flex-col h-[calc(100vh-56px)] lg:h-screen overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-200 bg-white flex items-center justify-between shrink-0">
        <div>
          <h1 className="text-base font-bold text-[#1B2D4E]">Valores de Suelo</h1>
          <p className="text-xs text-gray-400 hidden sm:block">
            Haz clic en el mapa para consultar zonificación PMDU y mercado de terrenos
          </p>
        </div>
        <div className="flex items-center gap-2">
          {/* Toggle capas */}
          <div className="hidden sm:flex items-center gap-1 text-xs border border-gray-200 rounded-md px-2 py-1 bg-white">
            <Layers className="h-3.5 w-3.5 text-gray-400" />
            <label className="flex items-center gap-1 cursor-pointer">
              <input
                type="checkbox"
                checked={capasVisibles.zonas}
                onChange={e => setCapasVisibles(p => ({ ...p, zonas: e.target.checked }))}
                className="accent-[#1B2D4E] h-3 w-3"
              />
              Zonas
            </label>
            <label className="flex items-center gap-1 cursor-pointer ml-2">
              <input
                type="checkbox"
                checked={capasVisibles.microzonas}
                onChange={e => setCapasVisibles(p => ({ ...p, microzonas: e.target.checked }))}
                className="accent-[#1B2D4E] h-3 w-3"
              />
              Microzonas
            </label>
          </div>
          <Link
            to="/suelo/admin"
            className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-[#1B2D4E] border border-gray-200 rounded-md px-2 py-1.5 transition-colors"
          >
            <Settings className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Admin</span>
          </Link>
        </div>
      </div>

      {/* Body: mapa + panel lateral */}
      <div className="flex flex-1 overflow-hidden">
        {/* Mapa */}
        <div className="relative flex-1 min-w-0">
          {cargandoCapas && (
            <div className="absolute inset-0 z-[1000] flex items-center justify-center bg-white/70 pointer-events-none">
              <Loader2 className="h-6 w-6 animate-spin text-[#1B2D4E]" />
            </div>
          )}
          <MapaSuelo
            capas={capas}
            onZonaClick={handleMapClick}
            capasVisibles={capasVisibles}
          />
          {/* Leyenda en esquina */}
          {categorias.length > 0 && (
            <div className="absolute bottom-6 left-3 z-[1000]">
              <LeyendaMapa categorias={categorias} />
            </div>
          )}
        </div>

        {/* Panel de resultado */}
        <div className="w-72 lg:w-80 shrink-0 border-l border-gray-200 bg-white overflow-hidden flex flex-col">
          <div className="px-3 py-2 border-b border-gray-100 bg-gray-50/50 shrink-0">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
              {consultando ? 'Consultando…' : resultado ? 'Resultado de consulta' : 'Consulta espacial'}
            </p>
          </div>
          <PanelZona resultado={resultado} consultando={consultando} coordenadas={coordenadas} />
        </div>
      </div>
    </div>
  )
}
