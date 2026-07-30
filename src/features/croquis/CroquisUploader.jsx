import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { ImageIcon, Upload, Trash2, Loader2 } from 'lucide-react'

const BUCKET = 'fotos-avaluos'

export function CroquisUploader({ expedienteId, currentUrl, onSaved }) {
  const [subiendo, setSubiendo] = useState(false)
  const [error, setError] = useState(null)

  async function handleFile(e) {
    const file = e.target.files?.[0]
    if (!file) return
    setSubiendo(true)
    setError(null)
    try {
      const ext = file.name.split('.').pop().toLowerCase() || 'jpg'
      const path = `${expedienteId}/croquis.${ext}`
      const { error: upErr } = await supabase.storage
        .from(BUCKET)
        .upload(path, file, { upsert: true, contentType: file.type })
      if (upErr) throw upErr

      const { data: { publicUrl } } = supabase.storage.from(BUCKET).getPublicUrl(path)
      const { error: dbErr } = await supabase
        .from('expedientes')
        .update({ croquis_url: publicUrl })
        .eq('id', expedienteId)
      if (dbErr) throw dbErr

      onSaved(publicUrl)
    } catch (err) {
      setError(err.message || 'Error al subir imagen')
    } finally {
      setSubiendo(false)
      e.target.value = ''
    }
  }

  async function handleEliminar() {
    setSubiendo(true)
    setError(null)
    try {
      const { error: dbErr } = await supabase
        .from('expedientes')
        .update({ croquis_url: null })
        .eq('id', expedienteId)
      if (dbErr) throw dbErr
      onSaved(null)
    } catch (err) {
      setError(err.message)
    } finally {
      setSubiendo(false)
    }
  }

  return (
    <div className="space-y-3">
      {currentUrl ? (
        <div className="relative">
          <img
            src={currentUrl}
            alt="Croquis de localización"
            className="w-full max-h-64 object-contain rounded-md border border-gray-200 bg-gray-50"
          />
          <button
            type="button"
            onClick={handleEliminar}
            disabled={subiendo}
            className="absolute top-2 right-2 flex items-center gap-1 px-2 py-1 text-xs bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50 transition-colors"
          >
            <Trash2 className="h-3 w-3" />
            Eliminar
          </button>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center gap-2 border-2 border-dashed border-gray-200 rounded-md p-8 text-gray-400 bg-gray-50">
          <ImageIcon className="h-8 w-8" />
          <p className="text-sm">Sin croquis — sube una captura de pantalla del mapa</p>
        </div>
      )}

      <label className={`inline-flex items-center gap-2 px-3 py-2 text-sm border border-gray-200 rounded-md cursor-pointer transition-colors ${subiendo ? 'opacity-50 pointer-events-none' : 'hover:border-blue-400 hover:text-blue-600'}`}>
        {subiendo ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
        {currentUrl ? 'Reemplazar imagen' : 'Subir croquis'}
        <input
          type="file"
          accept="image/png,image/jpeg,image/webp"
          onChange={handleFile}
          className="hidden"
          disabled={subiendo}
        />
      </label>

      {error && <p className="text-xs text-red-500">{error}</p>}
      <p className="text-xs text-gray-400">
        Formatos: PNG, JPG, WebP. Sube una captura de pantalla del mapa de Google Maps, SIGSA, u otro visor.
      </p>
    </div>
  )
}
