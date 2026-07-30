import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

export function useFotosExpediente(expedienteId) {
  const [fotos, setFotos] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!expedienteId) { setLoading(false); return }
    supabase
      .from('fotos_expediente')
      .select('*')
      .eq('expediente_id', expedienteId)
      .order('orden', { ascending: true })
      .then(({ data }) => {
        setFotos(data || [])
        setLoading(false)
      })
  }, [expedienteId])

  return { fotos, loading }
}
