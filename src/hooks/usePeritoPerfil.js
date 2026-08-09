import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'

const BUCKET = 'fotos-avaluos'

export function usePeritoPerfil() {
  const [perfil, setPerfil] = useState(null)
  const [loading, setLoading] = useState(true)
  const [guardando, setGuardando] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) { setLoading(false); return }
      supabase
        .from('profiles')
        .select('id, nombre, email, cedula, firma_url')
        .eq('id', user.id)
        .single()
        .then(({ data, error: err }) => {
          if (err && err.code !== 'PGRST116') setError(err.message)
          setPerfil(data || { id: user.id, email: user.email, nombre: '', cedula: '', firma_url: null })
          setLoading(false)
        })
    })
  }, [])

  const guardarPerfil = useCallback(async ({ nombre, cedula }) => {
    setGuardando(true)
    setError(null)
    const { data: { user } } = await supabase.auth.getUser()
    const { data, error: err } = await supabase
      .from('profiles')
      .upsert({ id: user.id, email: user.email, nombre, cedula }, { onConflict: 'id' })
      .select()
      .single()
    if (err) { setError(err.message); setGuardando(false); return false }
    setPerfil(prev => ({ ...prev, ...data }))
    setGuardando(false)
    return true
  }, [])

  const subirFirma = useCallback(async (file) => {
    setGuardando(true)
    setError(null)
    const { data: { user } } = await supabase.auth.getUser()
    const ext = file.name.split('.').pop().toLowerCase() || 'png'
    const path = `firmas/${user.id}/firma.${ext}`

    const { error: upErr } = await supabase.storage
      .from(BUCKET)
      .upload(path, file, { contentType: file.type, upsert: true })
    if (upErr) { setError(upErr.message); setGuardando(false); return false }

    const { data: { publicUrl } } = supabase.storage.from(BUCKET).getPublicUrl(path)

    const { data, error: dbErr } = await supabase
      .from('profiles')
      .upsert({ id: user.id, firma_url: publicUrl }, { onConflict: 'id' })
      .select()
      .single()
    if (dbErr) { setError(dbErr.message); setGuardando(false); return false }

    setPerfil(prev => ({ ...prev, firma_url: data.firma_url }))
    setGuardando(false)
    return true
  }, [])

  return { perfil, loading, guardando, error, guardarPerfil, subirFirma }
}
