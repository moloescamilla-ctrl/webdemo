import { Link } from 'react-router-dom'
import { Card, CardContent } from '@/components/ui/card'
import { useAuth } from '@/hooks/useAuth'
import { PlusCircle, FolderOpen, Calculator, Archive } from 'lucide-react'

export function DashboardPage() {
  const { user } = useAuth()
  return (
    <div className="p-6 max-w-4xl">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-gray-900">Bienvenido</h1>
        <p className="text-sm text-gray-500 mt-0.5">{user?.email}</p>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        <Link to="/expedientes/nuevo">
          <Card className="hover:border-blue-300 hover:shadow-md transition-all cursor-pointer">
            <CardContent className="pt-5 pb-5">
              <PlusCircle className="h-7 w-7 text-blue-600 mb-3" />
              <p className="font-semibold text-gray-900 text-sm">Nuevo Avalúo</p>
              <p className="text-xs text-gray-400 mt-0.5">Expediente completo</p>
            </CardContent>
          </Card>
        </Link>
        <Link to="/expedientes">
          <Card className="hover:border-blue-300 hover:shadow-md transition-all cursor-pointer">
            <CardContent className="pt-5 pb-5">
              <FolderOpen className="h-7 w-7 text-green-600 mb-3" />
              <p className="font-semibold text-gray-900 text-sm">Expedientes</p>
              <p className="text-xs text-gray-400 mt-0.5">Ver y continuar avalúos</p>
            </CardContent>
          </Card>
        </Link>
        <Link to="/expedientes/nuevo?modo=rapido">
          <Card className="hover:border-blue-300 hover:shadow-md transition-all cursor-pointer">
            <CardContent className="pt-5 pb-5">
              <Calculator className="h-7 w-7 text-purple-600 mb-3" />
              <p className="font-semibold text-gray-900 text-sm">Calculadora Rápida</p>
              <p className="text-xs text-gray-400 mt-0.5">Estimación en 3 pasos</p>
            </CardContent>
          </Card>
        </Link>
        <Link to="/expedientes" state={{ mostrarArchivados: true }}>
          <Card className="hover:border-gray-300 hover:shadow-md transition-all cursor-pointer">
            <CardContent className="pt-5 pb-5">
              <Archive className="h-7 w-7 text-gray-400 mb-3" />
              <p className="font-semibold text-gray-900 text-sm">Archivados</p>
              <p className="text-xs text-gray-400 mt-0.5">Avalúos terminados</p>
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  )
}
