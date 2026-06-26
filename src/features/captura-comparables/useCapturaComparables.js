import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'

export function useCapturaComparables(expedienteId) {
  const [comparables, setComparables] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchComparables = useCallback(async () => {
    if (!expedienteId) { setLoading(false); return }
    setLoading(true)
    const { data, error: err } = await supabase
      .from('comparables_capturados')
      .select('*')
      .eq('expediente_id', expedienteId)
      .order('created_at', { ascending: false })
    if (err) setError(err.message)
    else setComparables(data ?? [])
    setLoading(false)
  }, [expedienteId])

  useEffect(() => { fetchComparables() }, [fetchComparables])

  const guardarComparable = async (comp) => {
    const { data: { user } } = await supabase.auth.getUser()
    const { data, error: err } = await supabase
      .from('comparables_capturados')
      .insert({ ...comp, expediente_id: expedienteId, perito_id: user.id })
      .select()
      .single()
    if (err) throw new Error(err.message)
    setComparables(prev => [data, ...prev])
    return data
  }

  const actualizarComparable = async (id, updates) => {
    // precio_unitario is generated; remove it before update
    const { precio_unitario: _, ...rest } = updates
    const { data, error: err } = await supabase
      .from('comparables_capturados')
      .update(rest)
      .eq('id', id)
      .select()
      .single()
    if (err) throw new Error(err.message)
    setComparables(prev => prev.map(c => c.id === id ? data : c))
    return data
  }

  const eliminarComparable = async (id) => {
    const { error: err } = await supabase
      .from('comparables_capturados')
      .delete()
      .eq('id', id)
    if (err) throw new Error(err.message)
    setComparables(prev => prev.filter(c => c.id !== id))
  }

  return {
    comparables, loading, error,
    guardarComparable, actualizarComparable, eliminarComparable,
    refetch: fetchComparables,
  }
}
