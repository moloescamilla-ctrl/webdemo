import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'

const BUCKET = 'fotos-avaluos'

export function useFotosExpediente(expedienteId) {
  const [fotos, setFotos] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!expedienteId) { setLoading(false); return }
    supabase
      .from('fotos_expediente')
      .select('*')
      .eq('expediente_id', expedienteId)
      .order('orden', { ascending: true })
      .then(({ data }) => {
        setFotos(data || [])
        setLoading(false)
      })
  }, [expedienteId])

  const subirFoto = useCallback(async (file, categoria) => {
    const ext = file.name.split('.').pop().toLowerCase() || 'jpg'
    const path = `${expedienteId}/fotos/${crypto.randomUUID()}.${ext}`

    const { error: upErr } = await supabase.storage
      .from(BUCKET)
      .upload(path, file, { contentType: file.type })
    if (upErr) throw upErr

    const { data: { publicUrl } } = supabase.storage.from(BUCKET).getPublicUrl(path)

    const { data: registro, error: dbErr } = await supabase
      .from('fotos_expediente')
      .insert({ expediente_id: expedienteId, categoria, url_storage: publicUrl, nombre_archivo: file.name, orden: Math.floor(Date.now() / 1000)})
      .select()
      .single()
    if (dbErr) throw dbErr

    setFotos(prev => [...prev, registro])
  }, [expedienteId])

  const eliminarFoto = useCallback(async (foto) => {
    const match = foto.url_storage.match(/\/public\/fotos-avaluos\/(.+)$/)
    const storagePath = match?.[1]
    if (storagePath) {
      await supabase.storage.from(BUCKET).remove([storagePath])
    }
    const { error } = await supabase.from('fotos_expediente').delete().eq('id', foto.id)
    if (error) throw error
    setFotos(prev => prev.filter(f => f.id !== foto.id))
  }, [])

  return { fotos, loading, subirFoto, eliminarFoto }
}
