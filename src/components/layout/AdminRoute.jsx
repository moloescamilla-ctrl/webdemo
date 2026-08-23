import { Navigate } from 'react-router-dom'
import { useProfile } from '@/hooks/useProfile'
import { Loader2 } from 'lucide-react'

export function AdminRoute({ children }) {
  const { profile, loading } = useProfile()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-5 w-5 animate-spin text-gray-400" />
      </div>
    )
  }

  if (!profile || !['admin', 'superadmin'].includes(profile.role)) {
    return <Navigate to="/dashboard" replace />
  }

  return children
}
