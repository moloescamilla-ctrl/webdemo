import { useState } from 'react'
import { supabase } from '@/lib/supabase'

export function useSuelo() {
  const [consultando, setConsultando] = useState(false)
  const [resultado, setResultado] = useState(null)
  const [error, setError] = useState(null)

  async function consultarSuelo(lat, lng, corte = null) {
    setConsultando(true)
    setError(null)
    try {
      const { data, error: rpcErr } = await supabase.rpc('consultar_suelo', {
        p_lat:   Number(lat),
        p_lng:   Number(lng),
        p_corte: corte,
      })
      if (rpcErr) throw rpcErr
      setResultado(data)
      return data
    } catch (err) {
      setError(err.message)
      return null
    } finally {
      setConsultando(false)
    }
  }

  function resetResultado() {
    setResultado(null)
    setError(null)
  }

  return { consultarSuelo, consultando, resultado, error, resetResultado }
}
