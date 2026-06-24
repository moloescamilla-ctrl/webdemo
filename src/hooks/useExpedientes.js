import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/hooks/useAuth'

export function useExpedientes() {
  const { user } = useAuth()
  const [expedientes, setExpedientes] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!user) return
    fetchExpedientes()
  }, [user])

  async function fetchExpedientes() {
    setLoading(true)
    const { data, error } = await supabase
      .from('expedientes')
      .select('*')
      .order('created_at', { ascending: false })
    if (error) setError(error.message)
    else setExpedientes(data || [])
    setLoading(false)
  }

  async function crearExpediente(datos) {
    const { data, error } = await supabase
      .from('expedientes')
      .insert({ ...datos, perito_id: user.id })
      .select()
      .single()
    if (error) throw new Error(error.message)
    setExpedientes(prev => [data, ...prev])
    return data
  }

  async function actualizarExpediente(id, datos) {
    const { data, error } = await supabase
      .from('expedientes')
      .update(datos)
      .eq('id', id)
      .select()
      .single()
    if (error) throw new Error(error.message)
    setExpedientes(prev => prev.map(e => e.id === id ? data : e))
    return data
  }

  async function eliminarExpediente(id) {
    await Promise.all([
      supabase.from('metodos_comparativos').delete().eq('expediente_id', id),
      supabase.from('metodos_fisicos').delete().eq('expediente_id', id),
      supabase.from('inspecciones_fisicas').delete().eq('expediente_id', id),
    ])
    const { error } = await supabase.from('expedientes').delete().eq('id', id)
    if (error) throw new Error(error.message)
    setExpedientes(prev => prev.filter(e => e.id !== id))
  }

  async function guardarMetodoFisico(expedienteId, inspeccion, resultado, inputs) {
    const conConstruccion = inspeccion.tieneConstruccion !== false

    if (conConstruccion) {
      const { error: eInsp } = await supabase
        .from('inspecciones_fisicas')
        .upsert({
          expediente_id: expedienteId,
          ...inspeccion.estados,
          puntaje_heidecke: inspeccion.puntaje,
          estado_heidecke: inspeccion.estadoHeidecke.nombre,
          coeficiente_c: inspeccion.coeficienteC,
          estado_manual: inspeccion.estadoManualNombre,
          coeficiente_c_manual: inspeccion.coeficienteCManual,
        }, { onConflict: 'expediente_id' })
      if (eInsp) throw new Error(eInsp.message)
    }

    const { error: eMf } = await supabase
      .from('metodos_fisicos')
      .upsert({
        expediente_id: expedienteId,
        superficie_construccion: conConstruccion ? parseFloat(inputs.superficieConstruccion) : 0,
        superficie_terreno: parseFloat(inputs.superficieTerreno),
        costo_reposicion_m2: conConstruccion ? parseFloat(inputs.costoReposicionM2) : 0,
        valor_unitario_terreno: parseFloat(inputs.valorUnitarioTerreno),
        edad_anios: conConstruccion ? parseFloat(inputs.edadAnios) : 0,
        vida_util_anios: conConstruccion ? parseFloat(inputs.vidaUtilAnios) : 0,
        valor_residual_pct: conConstruccion ? parseFloat(inputs.valorResidual) : 0,
        valor_reposicion_nuevo: resultado.valorReposicionNuevo,
        factor_ross: resultado.factorA,
        coeficiente_c_adoptado: conConstruccion ? (inspeccion.coeficienteCAdoptado ?? null) : null,
        factor_depreciacion: resultado.factorDepreciacion,
        porcentaje_depreciacion: resultado.porcentajeDepreciacion,
        depreciacion_pesos: resultado.depreciacion,
        valor_actual_construccion: resultado.valorActualConstruccion,
        valor_terreno: resultado.valorTerreno,
        valor_fisico_total: resultado.valorFisicoTotal,
      }, { onConflict: 'expediente_id' })
    if (eMf) throw new Error(eMf.message)

    await supabase
      .from('expedientes')
      .update({ estado: 'en_proceso' })
      .eq('id', expedienteId)

    await fetchExpedientes()
  }

  async function guardarMetodoComparativo(expedienteId, resultado, superficieSujeto) {
    const { data: { user } } = await supabase.auth.getUser()
    const { error } = await supabase
      .from('metodos_comparativos')
      .upsert({
        expediente_id: expedienteId,
        user_id: user.id,
        superficie_sujeto: superficieSujeto,
        comparables: resultado.comparables,
        valor_unitario_ponderado: resultado.valorUnitarioPonderado,
        valor_comparativo_total: resultado.valorComparativoTotal,
      }, { onConflict: 'expediente_id' })
    if (error) throw new Error(error.message)

    await supabase
      .from('expedientes')
      .update({ estado: 'en_proceso' })
      .eq('id', expedienteId)

    await fetchExpedientes()
  }

  return {
    expedientes, loading, error,
    crearExpediente, actualizarExpediente, eliminarExpediente,
    guardarMetodoFisico, guardarMetodoComparativo,
  }
}
