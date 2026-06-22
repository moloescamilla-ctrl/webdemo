import { Outlet } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import { BottomNav } from './BottomNav'
import { useAuth } from '@/hooks/useAuth'

export function AppLayout() {
  const { signOut } = useAuth()
  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar onSignOut={signOut} />
      <main className="flex-1 overflow-auto pb-20 lg:pb-0">
        <Outlet />
      </main>
      <BottomNav />
    </div>
  )
}
