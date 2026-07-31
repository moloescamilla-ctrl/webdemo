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
    const now = new Date()
    const dd = String(now.getDate()).padStart(2, '0')
    const mm = String(now.getMonth() + 1).padStart(2, '0')
    const yy = String(now.getFullYear()).slice(-2)
    const prefijo = `${dd}${mm}${yy}`

    const { data: foliosHoy } = await supabase
      .from('expedientes')
      .select('folio')
      .like('folio', `${prefijo}-%`)

    const consecutivo = String((foliosHoy?.length ?? 0) + 1).padStart(2, '0')
    const folio = `${prefijo}-${consecutivo}`

    const { data, error } = await supabase
      .from('expedientes')
      .insert({ ...datos, perito_id: user.id, folio })
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
      supabase.from('metodos_rentas').delete().eq('expediente_id', id),
      supabase.from('metodos_residual').delete().eq('expediente_id', id),
      supabase.from('inspecciones_fisicas').delete().eq('expediente_id', id),
      supabase.from('entorno_inmueble').delete().eq('expediente_id', id),
      supabase.from('caracteristicas_terreno').delete().eq('expediente_id', id),
      supabase.from('descripcion_construccion').delete().eq('expediente_id', id),
    ])
    const { error } = await supabase.from('expedientes').delete().eq('id', id)
    if (error) throw new Error(error.message)
    setExpedientes(prev => prev.filter(e => e.id !== id))
  }

  async function guardarEntorno(expedienteId, datos) {
    const { error } = await supabase
      .from('entorno_inmueble')
      .upsert({ expediente_id: expedienteId, ...datos }, { onConflict: 'expediente_id' })
    if (error) throw new Error(error.message)
  }

  async function guardarTerreno(expedienteId, datos) {
    const { error } = await supabase
      .from('caracteristicas_terreno')
      .upsert({ expediente_id: expedienteId, ...datos }, { onConflict: 'expediente_id' })
    if (error) throw new Error(error.message)
  }

  async function guardarDescripcionConstruccion(expedienteId, datos) {
    const { error } = await supabase
      .from('descripcion_construccion')
      .upsert({ expediente_id: expedienteId, ...datos }, { onConflict: 'expediente_id' })
    if (error) throw new Error(error.message)
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
        costo_m2_fuente:     conConstruccion ? (inputs.costo_m2_fuente    ?? null) : null,
        costo_m2_clave:      conConstruccion ? (inputs.costo_m2_clave     ?? null) : null,
        costo_m2_tipo:       conConstruccion ? (inputs.costo_m2_tipo      ?? null) : null,
        costo_m2_tabulador:  conConstruccion ? (inputs.costo_m2_tabulador ?? null) : null,
        costo_m2_ajustado:   conConstruccion ? (inputs.costo_m2_ajustado  ?? false) : false,
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

  async function guardarMetodoRentas(expedienteId, datos) {
    const { error } = await supabase
      .from('metodos_rentas')
      .upsert({
        expediente_id: expedienteId,
        variante: datos.variante,
        modo_rna: datos.modoRNA,
        modo_tc: datos.modoTC,
        renta_mensual_bruta: datos.rentaMensualBruta,
        vacancia_pct: datos.vacanciaPct,
        gastos_operacion_pct: datos.gastosOperacionPct,
        comparables_renta: datos.comparablesRenta,
        tc_global: datos.tcGlobal,
        tc_tasa_libre_riesgo: datos.tcTasaLibreRiesgo,
        tc_prima_riesgo_inmueble: datos.tcPrimaRiesgoInmueble,
        tc_prima_iliquidez: datos.tcPrimaIliquidez,
        tc_depreciacion: datos.tcDepreciacion,
        tc_gastos_no_recuperables: datos.tcGastosNoRecuperables,
        proporcion_tierra_pct: datos.proporcionTierraPct,
        rna: datos.rna,
        valor_capitalizacion: datos.valorCapitalizacion,
        valor_tierra_capitalizacion: datos.valorTierraCapitalizacion,
        valor_construccion_capitalizacion: datos.valorConstruccionCapitalizacion,
        fecha_tasa_referencia: datos.fechaTasaReferencia,
        fuente_tasa_referencia: datos.fuenteTasaReferencia,
        notas_valuador: datos.notasValuador,
      }, { onConflict: 'expediente_id' })
    if (error) throw new Error(error.message)

    await supabase
      .from('expedientes')
      .update({ estado: 'en_proceso' })
      .eq('id', expedienteId)

    await fetchExpedientes()
  }

  async function guardarMetodoResidual(expedienteId, datos) {
    const { error } = await supabase
      .from('metodos_residual')
      .upsert({
        expediente_id:                expedienteId,
        caso_uso:                     datos.casoUso,
        descripcion_proyecto:         datos.descripcionProyecto,
        vm_total:                     datos.vmTotal,
        vm_fuente:                    datos.vmFuente,
        superficie_proyecto_m2:       datos.superficieProyectoM2,
        superficie_terreno_m2:        datos.superficieTerrenoM2,
        costo_construccion_m2:        datos.costoConstuccionM2,
        costo_construccion_total:     datos.costoConstuccionTotal,
        proyecto_pct:                 datos.proyectoPct,
        permisos_pct:                 datos.permisosPct,
        gestion_pct:                  datos.gestionPct,
        comercializacion_pct:         datos.comercializacionPct,
        financiamiento_pct:           datos.financiamientoPct,
        imprevistos_pct:              datos.imprevistoPct,
        ci_total:                     datos.ciTotal,
        utilidad_pct:                 datos.utilidadPct,
        utilidad_pesos:               datos.utilidadPesos,
        valor_residual:               datos.valorResidual,
        valor_residual_m2_terreno:    datos.valorResidualM2Terreno,
        notas_valuador:               datos.notasValuador,
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
    guardarEntorno, guardarTerreno, guardarDescripcionConstruccion,
    guardarMetodoFisico, guardarMetodoComparativo, guardarMetodoRentas, guardarMetodoResidual,
  }
}
