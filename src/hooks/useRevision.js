import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

export function useRevision(token) {
  const [datos, setDatos] = useState(null)
  const [comentarios, setComentarios] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!token) return
    cargarDatos()
  }, [token])

  async function cargarDatos() {
    setLoading(true)
    setError(null)
    const [{ data: exp, error: e1 }, { data: comms, error: e2 }] = await Promise.all([
      supabase.rpc('obtener_expediente_compartido', { p_token: token }),
      supabase.rpc('obtener_comentarios_compartido', { p_token: token }),
    ])
    if (e1) { setError(e1.message); setLoading(false); return }
    setDatos(exp)
    setComentarios(Array.isArray(comms) ? comms : [])
    setLoading(false)
  }

  async function agregarComentario(contenido) {
    const { data, error } = await supabase.rpc('agregar_comentario_revision', {
      p_token: token,
      p_contenido: contenido,
    })
    if (error) throw new Error(error.message)
    setComentarios(prev => [...prev, data])
    return data
  }

  return { datos, comentarios, loading, error, agregarComentario }
}
