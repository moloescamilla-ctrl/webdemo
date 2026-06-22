import { Link } from 'react-router-dom'
import { Card, CardContent } from '@/components/ui/card'
import { useAuth } from '@/hooks/useAuth'
import { PlusCircle, FolderOpen, Calculator } from 'lucide-react'

export function DashboardPage() {
  const { user } = useAuth()
  return (
    <div className="p-6 max-w-4xl">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-gray-900">Bienvenido</h1>
        <p className="text-sm text-gray-500 mt-0.5">{user?.email}</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <Link to="/expedientes/nuevo"><Card className="hover:border-blue-300 hover:shadow-md transition-all cursor-pointer"><CardContent className="pt-5 pb-5"><PlusCircle className="h-7 w-7 text-blue-600 mb-3" /><p className="font-semibold text-gray-900 text-sm">Nuevo Avalúo</p><p className="text-xs text-gray-400 mt-0.5">Iniciar un expediente nuevo</p></CardContent></Card></Link>
        <Link to="/expedientes"><Card className="hover:border-blue-300 hover:shadow-md transition-all cursor-pointer"><CardContent className="pt-5 pb-5"><FolderOpen className="h-7 w-7 text-green-600 mb-3" /><p className="font-semibold text-gray-900 text-sm">Mis Expedientes</p><p className="text-xs text-gray-400 mt-0.5">Ver y continuar avalúos</p></CardContent></Card></Link>
        <Link to="/expedientes/nuevo"><Card className="hover:border-blue-300 hover:shadow-md transition-all cursor-pointer"><CardContent className="pt-5 pb-5"><Calculator className="h-7 w-7 text-purple-600 mb-3" /><p className="font-semibold text-gray-900 text-sm">Calculadora Rápida</p><p className="text-xs text-gray-400 mt-0.5">Método Físico sin expediente</p></CardContent></Card></Link>
      </div>
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm font-medium text-blue-800">Módulo activo: Método Físico / Costos</p>
        <p className="text-xs text-blue-600 mt-1">Calcula el valor de inmuebles mediante depreciación Ross-Heidecke. Los métodos Comparativo, Rentas y Residual estarán disponibles próximamente.</p>
      </div>
    </div>
  )
}
