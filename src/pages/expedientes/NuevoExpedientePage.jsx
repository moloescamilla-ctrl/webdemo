import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, CardContent } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Select } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { useExpedientes } from '@/hooks/useExpedientes'
import { getPeritoPerfil } from '@/hooks/usePeritoPerfil'
import { Loader2 } from 'lucide-react'

const TIPOS_INMUEBLE = [
  'Casa habitación', 'Departamento', 'Local comercial', 'Oficina',
  'Nave industrial', 'Terreno urbano', 'Bodega', 'Otro',
]

export function NuevoExpedientePage() {
  const navigate = useNavigate()
  const { crearExpediente } = useExpedientes()
  const [tipoInmueble, setTipoInmueble] = useState('Casa habitación')
  const [guardando, setGuardando] = useState(false)
  const [error, setError] = useState(null)

  const handleCrear = async () => {
    setGuardando(true)
    setError(null)
    try {
      const perfil = getPeritoPerfil()
      const exp = await crearExpediente({
        tipo_inmueble:  tipoInmueble,
        uso:            'Habitacional',
        nombre_perito:  perfil.nombre_perito  || null,
        clave_perito:   perfil.clave_perito   || null,
        cedula_perito:  perfil.cedula_perito  || null,
        estado:         'borrador',
      })
      navigate(`/expedientes/${exp.id}/editar`)
    } catch (e) {
      setError(e.message)
    } finally {
      setGuardando(false)
    }
  }

  return (
    <div className="p-6 flex flex-col items-center justify-center min-h-[60vh]">
      <div className="w-full max-w-xs">
        <h1 className="text-xl font-bold text-gray-900 mb-1">Nuevo avalúo</h1>
        <p className="text-sm text-gray-400 mb-6">Elige el tipo de inmueble para comenzar</p>

        <Card>
          <CardContent className="pt-5 space-y-5">
            <div className="space-y-1.5">
              <Label>Tipo de inmueble</Label>
              <Select
                value={tipoInmueble}
                onChange={e => setTipoInmueble(e.target.value)}
              >
                {TIPOS_INMUEBLE.map(t => <option key={t}>{t}</option>)}
              </Select>
            </div>

            {error && (
              <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded px-3 py-2">
                {error}
              </p>
            )}

            <Button className="w-full" onClick={handleCrear} disabled={guardando}>
              {guardando ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              Crear expediente
            </Button>
          </CardContent>
        </Card>

        <p className="text-xs text-gray-400 mt-3 text-center">
          Completa los datos en el expediente una vez creado
        </p>
      </div>
    </div>
  )
}
