import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { NumericInput } from '@/components/ui/numeric-input'
import { formatNumber } from '@/lib/utils'
import { Check, X, ExternalLink } from 'lucide-react'

function Field({ label, name, value, onChange, numeric = false }) {
  return (
    <div className="space-y-1">
      <Label htmlFor={name} className="text-xs">{label}</Label>
      {numeric ? (
        <NumericInput
          id={name}
          value={value ?? ''}
          onChange={e => onChange(name, e.target.value)}
          className="h-8 text-sm"
          placeholder="0"
        />
      ) : (
        <Input
          id={name}
          value={value ?? ''}
          onChange={e => onChange(name, e.target.value)}
          className="h-8 text-sm"
        />
      )}
    </div>
  )
}

export function PanelRevision({ comparable, onAprobar, onDescartar, onClose }) {
  const [datos, setDatos] = useState({})

  useEffect(() => {
    if (comparable) setDatos({ ...comparable })
  }, [comparable])

  if (!comparable) return null

  const set = (key, val) => setDatos(prev => ({ ...prev, [key]: val }))

  const precioM2 = datos.precio_total && datos.superficie_total_m2
    ? datos.precio_total / datos.superficie_total_m2 : null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="p-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="font-semibold text-gray-900">Revisar comparable</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="p-4 space-y-4">
          {datos.url_fuente && (
            <a
              href={datos.url_fuente}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-xs text-blue-600 hover:underline truncate"
            >
              <ExternalLink className="h-3 w-3 shrink-0" />
              {datos.url_fuente}
            </a>
          )}

          <Field label="Título del anuncio" name="titulo_anuncio" value={datos.titulo_anuncio} onChange={set} />

          <div className="grid grid-cols-2 gap-3">
            <Field label="Precio total ($)" name="precio_total" value={datos.precio_total} onChange={set} numeric />
            <Field label="Superficie (m²)" name="superficie_total_m2" value={datos.superficie_total_m2} onChange={set} numeric />
          </div>

          {precioM2 && (
            <p className="text-xs text-gray-500 bg-gray-50 rounded px-2 py-1">
              $/m² estimado: <strong className="text-blue-700">{formatNumber(precioM2, 2)}</strong>
            </p>
          )}

          <div className="grid grid-cols-2 gap-3">
            <Field label="Recámaras" name="recamaras" value={datos.recamaras} onChange={set} numeric />
            <Field label="Baños" name="banos" value={datos.banos} onChange={set} numeric />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Estacionamientos" name="estacionamientos" value={datos.estacionamientos} onChange={set} numeric />
            <Field label="Niveles" name="niveles" value={datos.niveles} onChange={set} numeric />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Antigüedad (años)" name="antiguedad_anios" value={datos.antiguedad_anios} onChange={set} numeric />
            <Field label="Portal" name="portal" value={datos.portal} onChange={set} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Colonia" name="colonia" value={datos.colonia} onChange={set} />
            <Field label="Municipio" name="municipio" value={datos.municipio} onChange={set} />
          </div>

          <div className="space-y-1">
            <Label className="text-xs">Notas del valuador</Label>
            <textarea
              value={datos.notas_valuador ?? ''}
              onChange={e => set('notas_valuador', e.target.value)}
              rows={2}
              className="w-full text-sm border border-gray-200 rounded-md p-2 resize-none focus:outline-none focus:ring-1 focus:ring-blue-500"
              placeholder="Observaciones, ajustes, fuente adicional..."
            />
          </div>
        </div>

        <div className="p-4 border-t border-gray-100 flex gap-2 justify-end">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onDescartar(comparable.id)}
            className="text-red-600 border-red-200 hover:bg-red-50"
          >
            <X className="h-3.5 w-3.5" />
            Descartar
          </Button>
          <Button
            size="sm"
            onClick={() => onAprobar(comparable.id, datos)}
            className="bg-green-600 hover:bg-green-700"
          >
            <Check className="h-3.5 w-3.5" />
            Aprobar comparable
          </Button>
        </div>
      </div>
    </div>
  )
}
