import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/hooks/useAuth'

export function useRevision(expedienteId) {
  const { user } = useAuth()
  const [revisiones, setRevisiones] = useState([])
  const [comentarios, setComentarios] = useState([])
  const [cargando, setCargando] = useState(true)

  const cargarRevision = useCallback(async () => {
    if (!expedienteId || !user) return
    setCargando(true)
    const [{ data: revs }, { data: comms }] = await Promise.all([
      supabase
        .from('revisiones_expediente')
        .select('*, revisor:revisor_id(id, email, nombre)')
        .eq('expediente_id', expedienteId)
        .order('fecha_invitacion'),
      supabase
        .from('comentarios_revision')
        .select('*, revisor:revisor_id(id, email, nombre)')
        .eq('expediente_id', expedienteId)
        .order('created_at'),
    ])
    setRevisiones(revs ?? [])
    setComentarios(comms ?? [])
    setCargando(false)
  }, [expedienteId, user])

  useEffect(() => { cargarRevision() }, [cargarRevision])

  async function invitarRevisor(revisorId, mensajeInvitacion) {
    const { data, error } = await supabase
      .from('revisiones_expediente')
      .insert({
        expediente_id: expedienteId,
        autor_id: user.id,
        revisor_id: revisorId,
        mensaje_invitacion: mensajeInvitacion || null,
        estado: 'activa',
      })
      .select('*, revisor:revisor_id(id, email, nombre)')
      .single()
    if (error) throw new Error(error.message)
    setRevisiones(prev => [...prev, data])
    return data
  }

  async function agregarComentario({ seccion, campo, texto }) {
    const revisionActiva = revisiones.find(
      r => r.revisor_id === user.id && r.estado === 'activa'
    )
    const { data, error } = await supabase
      .from('comentarios_revision')
      .insert({
        expediente_id: expedienteId,
        revision_id: revisionActiva?.id ?? null,
        revisor_id: user.id,
        seccion: seccion || 'general',
        campo: campo || null,
        texto,
        estado: 'pendiente',
      })
      .select('*, revisor:revisor_id(id, email, nombre)')
      .single()
    if (error) throw new Error(error.message)
    setComentarios(prev => [...prev, data])
    return data
  }

  async function atenderComentario(comentarioId, respuesta = '') {
    const { data, error } = await supabase
      .from('comentarios_revision')
      .update({
        estado: 'atendido',
        respuesta_autor: respuesta || null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', comentarioId)
      .select('*, revisor:revisor_id(id, email, nombre)')
      .single()
    if (error) throw new Error(error.message)
    setComentarios(prev => prev.map(c => c.id === comentarioId ? data : c))
    return data
  }

  async function cerrarRevision(revisionId) {
    const { data, error } = await supabase
      .from('revisiones_expediente')
      .update({ estado: 'cerrada', fecha_cierre: new Date().toISOString() })
      .eq('id', revisionId)
      .select('*, revisor:revisor_id(id, email, nombre)')
      .single()
    if (error) throw new Error(error.message)
    setRevisiones(prev => prev.map(r => r.id === revisionId ? data : r))
    return data
  }

  const pendientes = comentarios.filter(c => c.estado === 'pendiente')
  const atendidos  = comentarios.filter(c => c.estado === 'atendido')
  const hayRevisionActiva = revisiones.some(r => r.estado === 'activa')

  let estadoRevision = 'sin_revision'
  if (revisiones.length > 0) {
    if (revisiones.every(r => r.estado === 'cerrada')) {
      estadoRevision = 'revision_cerrada'
    } else if (pendientes.length > 0) {
      estadoRevision = 'con_comentarios'
    } else {
      estadoRevision = 'en_revision'
    }
  }

  return {
    revisiones, comentarios, pendientes, atendidos,
    hayRevisionActiva, estadoRevision, cargando,
    invitarRevisor, agregarComentario, atenderComentario, cerrarRevision,
    refetch: cargarRevision,
  }
}
