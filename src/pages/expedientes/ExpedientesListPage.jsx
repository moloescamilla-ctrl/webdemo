import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useExpedientes } from '@/hooks/useExpedientes'
import { PlusCircle, FileText, Loader2, ChevronRight } from 'lucide-react'

const ESTADO_VARIANT = {
  borrador: 'secondary',
  en_proceso: 'warning',
  completado: 'success',
  firmado: 'default',
}

const ESTADO_LABEL = {
  borrador: 'Borrador',
  en_proceso: 'En proceso',
  completado: 'Completado',
  firmado: 'Firmado',
}

export function ExpedientesListPage() {
  const { expedientes, loading, error } = useExpedientes()

  return (
    <div className="p-6 max-w-4xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Expedientes</h1>
          <p className="text-sm text-gray-500 mt-0.5">Todos tus avalúos</p>
        </div>
        <Link to="/expedientes/nuevo">
          <Button>
            <PlusCircle className="h-4 w-4" />
            Nuevo avalúo
          </Button>
        </Link>
      </div>

      {loading && (
        <div className="flex items-center justify-center py-12 text-gray-400 gap-2">
          <Loader2 className="h-5 w-5 animate-spin" />
          <span className="text-sm">Cargando expedientes...</span>
        </div>
      )}

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-md text-sm text-red-700">
          Error: {error}
        </div>
      )}

      {!loading && !error && expedientes.length === 0 && (
        <div className="text-center py-16 text-gray-400">
          <FileText className="h-12 w-12 mx-auto mb-3 opacity-30" />
          <p className="text-sm font-medium">Sin expedientes aún</p>
          <p className="text-xs mt-1">Crea tu primer avalúo para comenzar</p>
          <Link to="/expedientes/nuevo">
            <Button className="mt-4" variant="outline">
              <PlusCircle className="h-4 w-4" />
              Crear primer avalúo
            </Button>
          </Link>
        </div>
      )}

      <div className="space-y-3">
        {expedientes.map((exp) => (
          <Link key={exp.id} to={`/expedientes/${exp.id}`} className="block">
            <div className="bg-white border border-gray-200 rounded-lg p-4 hover:border-blue-300 hover:shadow-sm transition-all flex items-center gap-4">
              <FileText className="h-8 w-8 text-gray-300 shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs text-gray-500">
                    {exp.folio || exp.id.slice(0, 8).toUpperCase()}
                  </span>
                  <Badge variant={ESTADO_VARIANT[exp.estado]}>
                    {ESTADO_LABEL[exp.estado]}
                  </Badge>
                </div>
                <p className="font-medium text-sm text-gray-900 mt-0.5 truncate">
                  {[exp.calle, exp.colonia, exp.municipio].filter(Boolean).join(', ') || 'Sin dirección'}
                </p>
                <p className="text-xs text-gray-400">
                  {exp.tipo_inmueble} · {new Date(exp.created_at).toLocaleDateString('es-MX')}
                </p>
              </div>
              <ChevronRight className="h-4 w-4 text-gray-300 shrink-0" />
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
