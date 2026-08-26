import { NavLink } from 'react-router-dom'
import { cn } from '@/lib/utils'
import { LayoutDashboard, FolderOpen, PlusCircle, LogOut, UserCircle, MapPin, ShieldCheck, Archive } from 'lucide-react'
import logoCovinsa from '@/assets/logo-covinsa.png'
import { useProfile } from '@/hooks/useProfile'

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Inicio' },
  { to: '/expedientes', icon: FolderOpen, label: 'Expedientes' },
  { to: '/archivados', icon: Archive, label: 'Archivados' },
  { to: '/expedientes/nuevo', icon: PlusCircle, label: 'Nuevo Avalúo' },
  { to: '/suelo', icon: MapPin, label: 'Valores de Suelo' },
  { to: '/perfil', icon: UserCircle, label: 'Mi perfil' },
]

export function Sidebar({ onSignOut }) {
  const { isAdmin } = useProfile()
  return (
    <aside className="hidden lg:flex w-72 min-h-screen bg-gray-900 text-white flex-col">
      <div className="px-5 py-4 border-b border-gray-700">
        <div className="flex items-center gap-3">
          <img src={logoCovinsa} alt="COVINSA" className="h-14 w-auto shrink-0" />
          <p className="text-xs text-gray-400 leading-snug">
            Sistema profesional<br />de valuación<br />inmobiliaria
          </p>
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
      <div className="px-3 pb-4 space-y-1">
        {isAdmin && (
          <NavLink
            to="/admin/usuarios"
            className={({ isActive }) => cn(
              'flex items-center gap-2.5 px-3 py-2 rounded-md text-sm transition-colors',
              isActive ? 'bg-blue-600 text-white' : 'text-gray-300 hover:bg-gray-800 hover:text-white'
            )}
          >
            <ShieldCheck className="h-4 w-4" />
            Administración
          </NavLink>
        )}
        <button onClick={onSignOut} className="flex items-center gap-2.5 px-3 py-2 w-full rounded-md text-sm text-gray-400 hover:bg-gray-800 hover:text-white transition-colors">
          <LogOut className="h-4 w-4" />
          Cerrar sesión
        </button>
      </div>
    </aside>
  )
}
