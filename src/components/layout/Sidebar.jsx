import { NavLink } from 'react-router-dom'
import { cn } from '@/lib/utils'
import { LayoutDashboard, FolderOpen, PlusCircle, LogOut } from 'lucide-react'
import logoCovinsa from '@/assets/logo-covinsa.png'

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Inicio' },
  { to: '/expedientes', icon: FolderOpen, label: 'Expedientes' },
  { to: '/expedientes/nuevo', icon: PlusCircle, label: 'Nuevo Avalúo' },
]

export function Sidebar({ onSignOut }) {
  return (
    <aside className="hidden lg:flex w-56 min-h-screen bg-gray-900 text-white flex-col">
      <div className="px-5 py-4 border-b border-gray-700">
        <div className="flex items-center gap-3">
          <img src={logoCovinsa} alt="COVINSA" className="h-14 w-auto" />
          <span className="text-sm font-medium text-gray-200 leading-tight">Avalúos</span>
        </div>
      </div>
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink key={to} to={to} className={({ isActive }) => cn('flex items-center gap-2.5 px-3 py-2 rounded-md text-sm transition-colors', isActive ? 'bg-blue-600 text-white' : 'text-gray-300 hover:bg-gray-800 hover:text-white')}>
            <Icon className="h-4 w-4" />
            {label}
          </NavLink>
        ))}
      </nav>
      <div className="px-3 pb-4">
        <button onClick={onSignOut} className="flex items-center gap-2.5 px-3 py-2 w-full rounded-md text-sm text-gray-400 hover:bg-gray-800 hover:text-white transition-colors">
          <LogOut className="h-4 w-4" />
          Cerrar sesión
        </button>
      </div>
    </aside>
  )
}
