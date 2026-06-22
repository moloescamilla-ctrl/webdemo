import { Link, useLocation } from 'react-router-dom'
import { LayoutDashboard, FolderOpen, PlusCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

const items = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Inicio' },
  { to: '/expedientes', icon: FolderOpen, label: 'Expedientes' },
  { to: '/expedientes/nuevo', icon: PlusCircle, label: 'Nuevo' },
]

export function BottomNav() {
  const { pathname } = useLocation()

  const isActive = (to) => {
    if (to === '/expedientes') {
      return pathname.startsWith('/expedientes') && !pathname.startsWith('/expedientes/nuevo')
    }
    return pathname === to || pathname.startsWith(to + '/')
  }

  return (
    <nav
      className="fixed bottom-0 inset-x-0 z-50 flex lg:hidden bg-gray-900 border-t border-gray-700"
      style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
    >
      {items.map(({ to, icon: Icon, label }) => {
        const active = isActive(to)
        const isNew = to === '/expedientes/nuevo'
        return (
          <Link
            key={to}
            to={to}
            className="flex-1 flex flex-col items-center gap-1 py-2.5 text-xs transition-colors"
          >
            <span className={cn(
              'flex items-center justify-center rounded-xl transition-all',
              isNew
                ? active
                  ? 'bg-blue-500 text-white w-10 h-7'
                  : 'bg-gray-700 text-gray-300 w-10 h-7'
                : 'w-10 h-7',
              !isNew && (active ? 'text-blue-400' : 'text-gray-500')
            )}>
              <Icon className="h-5 w-5" />
            </span>
            <span className={cn(
              'transition-colors',
              active ? 'text-blue-400' : 'text-gray-500'
            )}>
              {label}
            </span>
          </Link>
        )
      })}
    </nav>
  )
}
