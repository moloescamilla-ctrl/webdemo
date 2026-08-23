import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'

export function useAdminUsuarios() {
  const [usuarios, setUsuarios] = useState([])
  const [loading,  setLoading]  = useState(true)
  const [error,    setError]    = useState(null)

  const cargar = useCallback(async () => {
    setLoading(true)
    setError(null)
    const { data, error: e } = await supabase
      .from('profiles')
      .select('id, nombre, email, role, activo, plan, plan_expira_at, limite_expedientes_mes, created_at')
      .order('created_at', { ascending: false })
    if (e) setError(e.message)
    else setUsuarios(data ?? [])
    setLoading(false)
  }, [])

  useEffect(() => { cargar() }, [cargar])

  async function actualizarUsuario(userId, cambios) {
    const { error: e } = await supabase.rpc('admin_update_usuario', {
      p_user_id:            userId,
      p_role:               cambios.role               ?? null,
      p_activo:             cambios.activo             ?? null,
      p_plan:               cambios.plan               ?? null,
      p_limite_expedientes: cambios.limite_expedientes_mes ?? null,
    })
    if (e) throw new Error(e.message)
    setUsuarios(prev =>
      prev.map(u => u.id === userId ? { ...u, ...cambios } : u)
    )
  }

  return { usuarios, loading, error, cargar, actualizarUsuario }
}
