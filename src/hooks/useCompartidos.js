import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/hooks/useAuth'

export function useCompartidos(expedienteId) {
  const { user } = useAuth()
  const [compartidos, setCompartidos] = useState([])
  const [comentarios, setComentarios] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchData = useCallback(async () => {
    if (!expedienteId || !user) return
    setLoading(true)
    const [{ data: links }, { data: comms }] = await Promise.all([
      supabase
        .from('compartidos')
        .select('*')
        .eq('expediente_id', expedienteId)
        .order('created_at', { ascending: false }),
      supabase
        .from('comentarios_revision')
        .select('*')
        .eq('expediente_id', expedienteId)
        .order('created_at', { ascending: true }),
    ])
    setCompartidos(links || [])
    setComentarios(comms || [])
    setLoading(false)
  }, [expedienteId, user])

  useEffect(() => { fetchData() }, [fetchData])

  async function generarEnlace() {
    const { data, error } = await supabase
      .from('compartidos')
      .insert({ expediente_id: expedienteId, creado_por: user.id })
      .select()
      .single()
    if (error) throw new Error(error.message)
    setCompartidos(prev => [data, ...prev])
    return data
  }

  async function revocarEnlace(id) {
    const { error } = await supabase
      .from('compartidos')
      .update({ activo: false })
      .eq('id', id)
    if (error) throw new Error(error.message)
    setCompartidos(prev => prev.map(c => c.id === id ? { ...c, activo: false } : c))
  }

  return { compartidos, comentarios, loading, generarEnlace, revocarEnlace, refetch: fetchData }
}
