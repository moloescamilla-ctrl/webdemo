import { Component } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { AppLayout } from '@/components/layout/AppLayout'
import { LoginPage } from '@/pages/auth/LoginPage'
import { DashboardPage } from '@/pages/DashboardPage'
import { ExpedientesListPage } from '@/pages/expedientes/ExpedientesListPage'
import { NuevoExpedientePage } from '@/pages/expedientes/NuevoExpedientePage'
import { ExpedienteDetallePage } from '@/pages/expedientes/ExpedienteDetallePage'
import { EditarExpedientePage } from '@/pages/expedientes/EditarExpedientePage'
import { CapturaComparablesPage } from '@/pages/expedientes/CapturaComparablesPage'
import { CapturaRapidaPage } from '@/pages/expedientes/CapturaRapidaPage'
import { RevisarExpedientePage } from '@/pages/compartidos/RevisarExpedientePage'
import { PerfilPage } from '@/pages/PerfilPage'
import { ValoresSueloPage } from '@/pages/suelo/ValoresSueloPage'
import { AdminSueloPage } from '@/pages/suelo/AdminSueloPage'
import { AdminUsuariosPage } from '@/pages/admin/AdminUsuariosPage'
import { AdminRoute } from '@/components/layout/AdminRoute'

class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false }
  }
  static getDerivedStateFromError() {
    return { hasError: true }
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex flex-col items-center justify-center gap-4 p-6 text-center">
          <p className="text-gray-600 text-sm">Ocurrió un error inesperado.</p>
          <button
            onClick={() => window.location.replace('/')}
            className="text-sm text-white bg-[#1B2D4E] px-4 py-2 rounded-lg"
          >
            Reiniciar app
          </button>
        </div>
      )
    }
    return this.props.children
  }
}

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-sm text-gray-400">Cargando...</div>
    </div>
  )
  if (!user) return <Navigate to="/login" replace />
  return children
}

export default function App() {
  return (
    <ErrorBoundary>
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <AppLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="expedientes" element={<ExpedientesListPage />} />
          <Route path="expedientes/nuevo" element={<NuevoExpedientePage />} />
          <Route path="expedientes/:id" element={<ExpedienteDetallePage />} />
          <Route path="expedientes/:id/editar" element={<EditarExpedientePage />} />
          <Route path="expedientes/:id/captura-comparables" element={<CapturaComparablesPage />} />
          <Route path="capturar" element={<CapturaRapidaPage />} />
          <Route path="perfil" element={<PerfilPage />} />
          <Route path="suelo" element={<ValoresSueloPage />} />
          <Route path="suelo/admin" element={<AdminSueloPage />} />
          <Route path="admin/usuarios" element={<AdminRoute><AdminUsuariosPage /></AdminRoute>} />
        </Route>
        <Route
          path="/revisar/:token"
          element={
            <ProtectedRoute>
              <RevisarExpedientePage />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
    </ErrorBoundary>
  )
}
