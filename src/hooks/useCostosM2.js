import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

export function useCostosM2(tipoInmueble = null) {
  const [costos, setCostos] = useState([])
  const [cargando, setCargando] = useState(true)

  useEffect(() => {
    async function cargar() {
      let query = supabase
        .from('costos_construccion_m2')
        .select('id, fuente, clave, tipo, descripcion, precio_m2, tipo_inmueble')
        .eq('activo', true)
        .order('fuente')
        .order('precio_m2')

      if (tipoInmueble) {
        query = query.or(`tipo_inmueble.eq.${tipoInmueble},tipo_inmueble.is.null`)
      }

      const { data, error } = await query
      if (!error) setCostos(data ?? [])
      setCargando(false)
    }
    cargar()
  }, [tipoInmueble])

  const porFuente = costos.reduce((acc, c) => {
    if (!acc[c.fuente]) acc[c.fuente] = []
    acc[c.fuente].push(c)
    return acc
  }, {})

  return { costos, porFuente, cargando }
}
