import { NavLink } from 'react-router-dom'
import { cn } from '@/lib/utils'
import { LayoutDashboard, FolderOpen, PlusCircle, LogOut, Building2 } from 'lucide-react'

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Inicio' },
  { to: '/expedientes', icon: FolderOpen, label: 'Expedientes' },
  { to: '/expedientes/nuevo', icon: PlusCircle, label: 'Nuevo Avalúo' },
]

export function Sidebar({ onSignOut }) {
  return (
    <aside className="hidden lg:flex w-56 min-h-screen bg-gray-900 text-white flex-col">
      <div className="px-5 py-5 border-b border-gray-700">
        <div className="flex items-center gap-2">
          <Building2 className="h-5 w-5 text-blue-400" />
          <span className="font-semibold text-sm">Avalúos MX</span>
        </div>
        <p className="text-xs text-gray-400 mt-1">Sistema de Valuación</p>
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
