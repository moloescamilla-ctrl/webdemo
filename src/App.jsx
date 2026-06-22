import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { AppLayout } from '@/components/layout/AppLayout'
import { LoginPage } from '@/pages/auth/LoginPage'
import { DashboardPage } from '@/pages/DashboardPage'
import { ExpedientesListPage } from '@/pages/expedientes/ExpedientesListPage'
import { NuevoExpedientePage } from '@/pages/expedientes/NuevoExpedientePage'
import { ExpedienteDetallePage } from '@/pages/expedientes/ExpedienteDetallePage'

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
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
