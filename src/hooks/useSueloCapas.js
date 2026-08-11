import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

export function useSueloCapas({ instrumentoId = null, municipioId = null } = {}) {
  const [capas, setCapas] = useState(null)
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState(null)

  async function cargar() {
    setCargando(true)
    setError(null)
    try {
      const { data, error: rpcErr } = await supabase.rpc('get_capas_suelo', {
        p_instrumento_id: instrumentoId,
        p_municipio_id:   municipioId,
      })
      if (rpcErr) throw rpcErr
      setCapas(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setCargando(false)
    }
  }

  useEffect(() => { cargar() }, [instrumentoId, municipioId])

  return { capas, cargando, error, recargar: cargar }
}
