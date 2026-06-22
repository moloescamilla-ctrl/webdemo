import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

export function useExpediente(id) {
  const [expediente, setExpediente] = useState(null)
  const [metodoFisico, setMetodoFisico] = useState(null)
  const [inspeccion, setInspeccion] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!id) return
    fetchAll()
  }, [id])

  async function fetchAll() {
    setLoading(true)
    setError(null)
    const [{ data: exp, error: e1 }, { data: mf }, { data: insp }] = await Promise.all([
      supabase.from('expedientes').select('*').eq('id', id).single(),
      supabase.from('metodos_fisicos').select('*').eq('expediente_id', id).maybeSingle(),
      supabase.from('inspecciones_fisicas').select('*').eq('expediente_id', id).maybeSingle(),
    ])
    if (e1) { setError(e1.message); setLoading(false); return }
    setExpediente(exp)
    setMetodoFisico(mf)
    setInspeccion(insp)
    setLoading(false)
  }

  return { expediente, metodoFisico, inspeccion, loading, error }
}
