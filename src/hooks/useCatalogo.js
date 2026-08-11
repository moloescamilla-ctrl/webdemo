import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'

export function useCatalogo(instrumentoId) {
  const [filas, setFilas] = useState([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState(null)

  const cargar = useCallback(async () => {
    if (!instrumentoId) return
    setCargando(true)
    setError(null)
    try {
      const { data, error: dbErr } = await supabase
        .from('suelo_catalogo_normativo')
        .select('*')
        .eq('instrumento_id', instrumentoId)
        .order('categoria')
        .order('clave')
      if (dbErr) throw dbErr
      setFilas(data ?? [])
    } catch (err) {
      setError(err.message)
    } finally {
      setCargando(false)
    }
  }, [instrumentoId])

  useEffect(() => { cargar() }, [cargar])

  async function actualizarFila(id, cambios) {
    const { error: dbErr } = await supabase
      .from('suelo_catalogo_normativo')
      .update(cambios)
      .eq('id', id)
    if (dbErr) throw dbErr
    await cargar()
  }

  return { filas, cargando, error, recargar: cargar, actualizarFila }
}

export function useInstrumentos() {
  const [instrumentos, setInstrumentos] = useState([])
  const [cargando, setCargando] = useState(true)

  useEffect(() => {
    supabase
      .from('suelo_instrumentos')
      .select('id, nombre, municipio_id, municipios(nombre, estado), vigente, fecha_publicacion')
      .order('vigente', { ascending: false })
      .then(({ data }) => {
        setInstrumentos(data ?? [])
        setCargando(false)
      })
  }, [])

  return { instrumentos, cargando }
}

export function useCortes(microzonaId) {
  const [cortes, setCortes] = useState([])

  useEffect(() => {
    if (!microzonaId) return
    supabase
      .from('suelo_valores')
      .select('corte')
      .eq('microzona_id', microzonaId)
      .order('corte', { ascending: false })
      .then(({ data }) => setCortes((data ?? []).map(r => r.corte)))
  }, [microzonaId])

  return cortes
}
