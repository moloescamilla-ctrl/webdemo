import { useState, useCallback } from 'react'
import { Outlet } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import { BottomNav } from './BottomNav'
import { useAuth } from '@/hooks/useAuth'
import { useProfile } from '@/hooks/useProfile'
import { useInactivityLogout } from '@/hooks/useInactivityLogout'
import { ShieldAlert, UserX } from 'lucide-react'

export function AppLayout() {
  const { signOut } = useAuth()
  const { profile, loading: profileLoading } = useProfile()
  const [mostrarAviso, setMostrarAviso] = useState(false)

  const { reset } = useInactivityLogout({
    onWarn:   setMostrarAviso,
    onLogout: () => setMostrarAviso(false),
  })

  const continuar = useCallback(() => {
    setMostrarAviso(false)
    reset()
  }, [reset])

  if (!profileLoading && profile?.activo === false) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 p-6 text-center bg-gray-50">
        <UserX className="h-12 w-12 text-gray-300" />
        <p className="text-base font-semibold text-gray-700">Cuenta desactivada</p>
        <p className="text-sm text-gray-400 max-w-sm">
          Tu cuenta ha sido desactivada. Contacta al administrador para reactivarla.
        </p>
        <button
          onClick={signOut}
          className="text-sm text-white bg-[#1B2D4E] px-4 py-2 rounded-lg hover:bg-[#2A4A7F] transition-colors"
        >
          Cerrar sesión
        </button>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar onSignOut={signOut} />
      <main className="flex-1 overflow-auto pb-20 lg:pb-0">
        <Outlet />
      </main>
      <BottomNav />

      {mostrarAviso && (
        <div className="fixed bottom-20 lg:bottom-4 left-1/2 -translate-x-1/2 z-50 w-[calc(100%-2rem)] max-w-sm">
          <div className="bg-[#1B2D4E] text-white rounded-xl shadow-2xl px-4 py-3 flex items-center gap-3">
            <ShieldAlert className="h-5 w-5 shrink-0 text-yellow-300" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium leading-tight">Sesión por cerrar</p>
              <p className="text-xs text-white/70 mt-0.5">2 minutos sin actividad</p>
            </div>
            <button
              onClick={continuar}
              className="shrink-0 bg-white text-[#1B2D4E] text-xs font-semibold px-3 py-1.5 rounded-lg hover:bg-white/90 transition-colors"
            >
              Continuar
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
