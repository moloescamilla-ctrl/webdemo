import { useState, useEffect, useRef } from 'react'
import { usePeritoPerfil } from '@/hooks/usePeritoPerfil'
import { UserCircle, Upload, CheckCircle, AlertCircle, Loader2 } from 'lucide-react'

export function PerfilPage() {
  const { perfil, loading, guardando, error, guardarPerfil, subirFirma } = usePeritoPerfil()
  const [nombre, setNombre] = useState('')
  const [cedula, setCedula] = useState('')
  const [exito, setExito] = useState(false)
  const firmaRef = useRef(null)

  useEffect(() => {
    if (perfil) {
      setNombre(perfil.nombre || '')
      setCedula(perfil.cedula || '')
    }
  }, [perfil])

  const handleGuardar = async (e) => {
    e.preventDefault()
    setExito(false)
    const ok = await guardarPerfil({ nombre, cedula })
    if (ok) {
      setExito(true)
      setTimeout(() => setExito(false), 3000)
    }
  }

  const handleFirma = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    await subirFirma(file)
  }

  if (loading) return (
    <div className="flex items-center justify-center min-h-[300px]">
      <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
    </div>
  )

  return (
    <div className="p-6 max-w-lg">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-gray-900">Mi perfil</h1>
        <p className="text-sm text-gray-500 mt-0.5">Datos que aparecen en los reportes de avalúo</p>
      </div>

      <form onSubmit={handleGuardar} className="space-y-5">
        {/* Nombre */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Nombre completo
          </label>
          <input
            type="text"
            value={nombre}
            onChange={e => setNombre(e.target.value)}
            placeholder="Ej. Ing. Juan Pérez Rodríguez"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Cédula */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Número de cédula profesional
          </label>
          <input
            type="text"
            value={cedula}
            onChange={e => setCedula(e.target.value)}
            placeholder="Ej. 12345678"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Email (solo lectura) */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Correo electrónico
          </label>
          <input
            type="email"
            value={perfil?.email || ''}
            disabled
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-gray-50 text-gray-400 cursor-not-allowed"
          />
        </div>

        {error && (
          <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">
            <AlertCircle className="h-4 w-4 flex-shrink-0" />
            {error}
          </div>
        )}

        {exito && (
          <div className="flex items-center gap-2 text-sm text-green-700 bg-green-50 px-3 py-2 rounded-lg">
            <CheckCircle className="h-4 w-4 flex-shrink-0" />
            Perfil guardado correctamente
          </div>
        )}

        <button
          type="submit"
          disabled={guardando}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
        >
          {guardando ? <Loader2 className="h-4 w-4 animate-spin" /> : <UserCircle className="h-4 w-4" />}
          Guardar perfil
        </button>
      </form>

      {/* Firma */}
      <div className="mt-8 pt-6 border-t border-gray-200">
        <h2 className="text-base font-semibold text-gray-900 mb-1">Firma</h2>
        <p className="text-sm text-gray-500 mb-4">
          Imagen de tu firma manuscrita. Se incluirá en el PDF del avalúo. Fondo blanco, formato PNG o JPG.
        </p>

        {perfil?.firma_url ? (
          <div className="mb-4">
            <img
              src={perfil.firma_url}
              alt="Firma"
              className="h-20 object-contain border border-gray-200 rounded-lg bg-white p-2"
            />
          </div>
        ) : (
          <div className="mb-4 h-20 flex items-center justify-center border border-dashed border-gray-300 rounded-lg bg-gray-50">
            <p className="text-sm text-gray-400">Sin firma registrada</p>
          </div>
        )}

        <input
          ref={firmaRef}
          type="file"
          accept="image/png,image/jpeg"
          onChange={handleFirma}
          className="hidden"
        />
        <button
          type="button"
          onClick={() => firmaRef.current?.click()}
          disabled={guardando}
          className="flex items-center gap-2 border border-gray-300 hover:border-gray-400 bg-white text-sm font-medium text-gray-700 px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
        >
          {guardando ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
          {perfil?.firma_url ? 'Reemplazar firma' : 'Subir firma'}
        </button>
      </div>
    </div>
  )
}
