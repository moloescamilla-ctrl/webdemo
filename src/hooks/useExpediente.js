import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

export function useExpediente(id) {
  const [expediente, setExpediente] = useState(null)
  const [entorno, setEntorno] = useState(null)
  const [terreno, setTerreno] = useState(null)
  const [descripcionConstruccion, setDescripcionConstruccion] = useState(null)
  const [metodoFisico, setMetodoFisico] = useState(null)
  const [inspeccion, setInspeccion] = useState(null)
  const [metodoComparativo, setMetodoComparativo] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!id) return
    fetchAll()
  }, [id])

  async function fetchAll() {
    setLoading(true)
    setError(null)
    const [
      { data: exp, error: e1 },
      { data: ent },
      { data: ter },
      { data: desc },
      { data: mf },
      { data: insp },
      { data: mc },
    ] = await Promise.all([
      supabase.from('expedientes').select('*').eq('id', id).single(),
      supabase.from('entorno_inmueble').select('*').eq('expediente_id', id).maybeSingle(),
      supabase.from('caracteristicas_terreno').select('*').eq('expediente_id', id).maybeSingle(),
      supabase.from('descripcion_construccion').select('*').eq('expediente_id', id).maybeSingle(),
      supabase.from('metodos_fisicos').select('*').eq('expediente_id', id).maybeSingle(),
      supabase.from('inspecciones_fisicas').select('*').eq('expediente_id', id).maybeSingle(),
      supabase.from('metodos_comparativos').select('*').eq('expediente_id', id).maybeSingle(),
    ])
    if (e1) { setError(e1.message); setLoading(false); return }
    setExpediente(exp)
    setEntorno(ent)
    setTerreno(ter)
    setDescripcionConstruccion(desc)
    setMetodoFisico(mf)
    setInspeccion(insp)
    setMetodoComparativo(mc)
    setLoading(false)
  }

  return {
    expediente, entorno, terreno, descripcionConstruccion,
    metodoFisico, inspeccion, metodoComparativo,
    loading, error,
  }
}
