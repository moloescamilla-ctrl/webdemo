import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/hooks/useAuth'

export function useProfile() {
  const { user, loading: authLoading } = useAuth()
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (authLoading) return                         // esperar a que auth resuelva
    if (!user) { setProfile(null); setLoading(false); return }

    supabase
      .from('profiles')
      .select('id, nombre, email, role, activo, plan, plan_expira_at, limite_expedientes_mes')
      .eq('id', user.id)
      .single()
      .then(({ data }) => {
        setProfile(data ?? null)
        setLoading(false)
      })
  }, [user, authLoading])

  const isAdmin = profile?.role === 'admin' || profile?.role === 'superadmin'
  const isSuperAdmin = profile?.role === 'superadmin'

  return { profile, loading, isAdmin, isSuperAdmin }
}
