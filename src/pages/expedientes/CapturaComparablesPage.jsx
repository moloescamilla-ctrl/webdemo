import { useParams, Link, useNavigate } from 'react-router-dom'
import { CapturaComparables } from '@/features/captura-comparables/CapturaComparables'
import { ArrowLeft } from 'lucide-react'

export function CapturaComparablesPage() {
  const { id } = useParams()
  const navigate = useNavigate()

  const handleTransferir = (aprobados) => {
    navigate(`/expedientes/${id}/editar`, {
      state: { tab: 'comparativo', comparablesImportados: aprobados },
    })
  }

  return (
    <div className="p-6 max-w-2xl">
      <div className="flex items-center gap-3 mb-5">
        <Link
          to={`/expedientes/${id}/editar`}
          className="text-gray-400 hover:text-gray-600 transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-xl font-bold text-gray-900">Captura de Comparables</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Extrae datos de anuncios con IA · revisa · transfiere a la tabla de homologación
          </p>
        </div>
      </div>

      <CapturaComparables expedienteId={id} onTransferir={handleTransferir} />
    </div>
  )
}
