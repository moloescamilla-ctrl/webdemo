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

  async function guardarMetodoFisico(expedienteId, inspeccion, resultado, inputs) {
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

    const { error: eMf } = await supabase
      .from('metodos_fisicos')
      .upsert({
        expediente_id: expedienteId,
        superficie_construccion: parseFloat(inputs.superficieConstruccion),
        superficie_terreno: parseFloat(inputs.superficieTerreno),
        costo_reposicion_m2: parseFloat(inputs.costoReposicionM2),
        valor_unitario_terreno: parseFloat(inputs.valorUnitarioTerreno),
        edad_anios: parseFloat(inputs.edadAnios),
        vida_util_anios: parseFloat(inputs.vidaUtilAnios),
        valor_residual_pct: parseFloat(inputs.valorResidual),
        valor_reposicion_nuevo: resultado.valorReposicionNuevo,
        factor_ross: resultado.factorA,
        coeficiente_c_adoptado: inspeccion.coeficienteCAdoptado,
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

  return { expedientes, loading, error, crearExpediente, guardarMetodoFisico, guardarMetodoComparativo }
}
