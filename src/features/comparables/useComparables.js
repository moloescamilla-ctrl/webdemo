import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'

export function useComparables(expedienteId) {
  const [buffer, setBuffer] = useState([])
  const [guardados, setGuardados] = useState([])
  const [loadingGuardados, setLoadingGuardados] = useState(false)
  const [vinculando, setVinculando] = useState(false)
  const [error, setError] = useState(null)

  const fetchGuardados = useCallback(async () => {
    if (!expedienteId) return
    setLoadingGuardados(true)
    const { data, error: e } = await supabase
      .from('comparables')
      .select('*')
      .eq('expediente_id', expedienteId)
      .order('created_at', { ascending: true })
    if (e) setError(e.message)
    else setGuardados(data || [])
    setLoadingGuardados(false)
  }, [expedienteId])

  useEffect(() => {
    fetchGuardados()
  }, [fetchGuardados])

  function agregarAlBuffer(comparable) {
    setBuffer(prev => [...prev, { ...comparable, _bufferId: Date.now() }])
  }

  function eliminarDelBuffer(bufferId) {
    setBuffer(prev => prev.filter(c => c._bufferId !== bufferId))
  }

  async function vincularAlExpediente() {
    if (!expedienteId || buffer.length === 0) return
    setVinculando(true)
    setError(null)
    try {
      const rows = buffer.map(({ _bufferId, ...comp }) => ({
        expediente_id: expedienteId,
        url: comp.url,
        portal: comp.portal,
        fecha_captura: comp.fecha_captura,
        tipo_operacion: comp.tipo_operacion,
        tipo_inmueble: comp.tipo_inmueble,
        precio_total: comp.precio_total,
        moneda: comp.moneda,
        superficie_total: comp.superficie_total,
        superficie_construccion: comp.superficie_construccion,
        superficie_terreno: comp.superficie_terreno,
        recamaras: comp.recamaras,
        banos: comp.banos,
        cajones: comp.cajones,
        edad_anios: comp.edad_anios,
        conservacion: comp.conservacion,
        calle: comp.calle,
        colonia: comp.colonia,
        municipio: comp.municipio,
        estado: comp.estado,
        cp: comp.cp,
        nombre_anunciante: comp.nombre_anunciante,
        telefono: comp.telefono,
        descripcion: comp.descripcion,
        scores: comp.scores,
        campos_manuales: comp.campos_manuales || {},
      }))

      const { error: e } = await supabase.from('comparables').insert(rows)
      if (e) throw new Error(e.message)

      setBuffer([])
      await fetchGuardados()
    } catch (e) {
      setError(e.message)
    } finally {
      setVinculando(false)
    }
  }

  async function eliminarGuardado(id) {
    const { error: e } = await supabase.from('comparables').delete().eq('id', id)
    if (e) { setError(e.message); return }
    setGuardados(prev => prev.filter(c => c.id !== id))
  }

  return {
    buffer,
    guardados,
    loadingGuardados,
    vinculando,
    error,
    agregarAlBuffer,
    eliminarDelBuffer,
    vincularAlExpediente,
    eliminarGuardado,
    refetch: fetchGuardados,
  }
}
