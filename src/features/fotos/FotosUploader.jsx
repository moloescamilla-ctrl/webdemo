import { useRef, useState } from 'react'
import { useFotosExpediente } from '@/hooks/useFotosExpediente'
import { Camera, Loader2, X, ImageOff } from 'lucide-react'

async function comprimirImagen(file, maxWidth = 1200, quality = 0.82) {
  if (file.type === 'image/heic' || file.type === 'image/heif' || file.size < 150 * 1024) {
    return file
  }
  return new Promise((resolve) => {
    const img = new Image()
    const url = URL.createObjectURL(file)
    img.onload = () => {
      URL.revokeObjectURL(url)
      const scale = Math.min(1, maxWidth / img.width)
      const canvas = document.createElement('canvas')
      canvas.width = Math.round(img.width * scale)
      canvas.height = Math.round(img.height * scale)
      canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height)
      canvas.toBlob(
        (blob) => resolve(new File([blob], file.name.replace(/\.[^.]+$/, '.jpg'), { type: 'image/jpeg', lastModified: Date.now() })),
        'image/jpeg',
        quality
      )
    }
    img.onerror = () => { URL.revokeObjectURL(url); resolve(file) }
    img.src = url
  })
}

const CATEGORIAS = [
  { id: 'fachada',   label: 'Fachada' },
  { id: 'entorno',   label: 'Entorno' },
  { id: 'acceso',    label: 'Acceso al inmueble' },
  { id: 'sala',      label: 'Sala' },
  { id: 'comedor',   label: 'Comedor' },
  { id: 'cocina',    label: 'Cocina' },
  { id: 'bano',      label: 'Baño' },
  { id: 'recamara1', label: 'Recámara 1' },
  { id: 'recamara2', label: 'Recámara 2' },
  { id: 'extra',     label: 'Extra', btnLabel: 'Agregar extra' },
]

export function FotosUploader({ expedienteId }) {
  const { fotos, loading, subirFoto, eliminarFoto } = useFotosExpediente(expedienteId)
  const [subiendo, setSubiendo] = useState({})   // { categoria: boolean }
  const [eliminando, setEliminando] = useState({}) // { fotoId: boolean }
  const [errores, setErrores] = useState({})       // { categoria: string }
  const refs = useRef({})

  async function handleSubir(e, categoria) {
    const files = Array.from(e.target.files || [])
    if (!files.length) return
    e.target.value = ''
    setSubiendo(prev => ({ ...prev, [categoria]: true }))
    setErrores(prev => ({ ...prev, [categoria]: null }))
    try {
      for (const file of files) {
        const compressed = await comprimirImagen(file)
        await subirFoto(compressed, categoria)
      }
    } catch (err) {
      setErrores(prev => ({ ...prev, [categoria]: err.message || 'Error al subir' }))
    } finally {
      setSubiendo(prev => ({ ...prev, [categoria]: false }))
    }
  }

  async function handleEliminar(foto) {
    setEliminando(prev => ({ ...prev, [foto.id]: true }))
    try {
      await eliminarFoto(foto)
    } catch (err) {
      console.error('Error al eliminar foto:', err)
    } finally {
      setEliminando(prev => ({ ...prev, [foto.id]: false }))
    }
  }

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-gray-400 py-6">
        <Loader2 className="h-4 w-4 animate-spin" />
        <span className="text-sm">Cargando fotos...</span>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {CATEGORIAS.map(cat => {
        const fotosCategoria = fotos.filter(f => f.categoria === cat.id)
        const cargando = subiendo[cat.id]
        const error = errores[cat.id]
        const btnLabel = cat.btnLabel ?? 'Agregar'

        return (
          <div key={cat.id}>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-semibold text-gray-700">{cat.label}</h3>
              <label
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium border border-gray-200 rounded-md cursor-pointer transition-colors ${
                  cargando ? 'opacity-50 pointer-events-none' : 'hover:border-blue-400 hover:text-blue-600'
                }`}
              >
                {cargando
                  ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  : <Camera className="h-3.5 w-3.5" />
                }
                {cargando ? 'Subiendo...' : btnLabel}
                <input
                  ref={el => { refs.current[cat.id] = el }}
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/heic"
                  multiple
                  className="hidden"
                  disabled={cargando}
                  onChange={e => handleSubir(e, cat.id)}
                />
              </label>
            </div>

            {fotosCategoria.length === 0 && !cargando ? (
              <div className="flex items-center gap-2 border border-dashed border-gray-200 rounded-md p-4 text-gray-400 bg-gray-50">
                <ImageOff className="h-4 w-4 shrink-0" />
                <span className="text-xs">Sin fotos — presiona "Agregar" para subir</span>
              </div>
            ) : (
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
                {fotosCategoria.map(foto => (
                  <div key={foto.id} className="relative group aspect-square">
                    <img
                      src={foto.url_storage}
                      alt={foto.nombre_archivo || cat.label}
                      className="w-full h-full object-cover rounded-md border border-gray-200 bg-gray-100"
                    />
                    <button
                      type="button"
                      onClick={() => handleEliminar(foto)}
                      disabled={eliminando[foto.id]}
                      className="absolute top-1 right-1 flex items-center justify-center w-5 h-5 bg-red-600 text-white rounded-full opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity disabled:opacity-50 hover:bg-red-700"
                      title="Eliminar foto"
                    >
                      {eliminando[foto.id]
                        ? <Loader2 className="h-3 w-3 animate-spin" />
                        : <X className="h-3 w-3" />
                      }
                    </button>
                  </div>
                ))}

                {cargando && (
                  <div className="aspect-square rounded-md border-2 border-dashed border-blue-300 bg-blue-50 flex items-center justify-center">
                    <Loader2 className="h-5 w-5 animate-spin text-blue-400" />
                  </div>
                )}
              </div>
            )}

            {error && (
              <p className="text-xs text-red-500 mt-1">{error}</p>
            )}
          </div>
        )
      })}

      <p className="text-xs text-gray-400">
        Formatos: JPG, PNG, WebP, HEIC. Las imágenes se optimizan automáticamente antes de subir.
      </p>
    </div>
  )
}
