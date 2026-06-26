import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { MetodoFisicoForm } from '@/features/metodo-fisico/MetodoFisicoForm'
import { MetodoComparativoForm } from '@/features/metodo-comparativo/MetodoComparativoForm'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { useExpedientes } from '@/hooks/useExpedientes'
import { getPeritoPerfil } from '@/hooks/usePeritoPerfil'
import { UbicacionMapaInput } from '@/components/ui/ubicacion-mapa-input'
import { ChevronRight, Loader2 } from 'lucide-react'

const TIPOS_INMUEBLE = [
  'Casa habitación', 'Departamento', 'Local comercial', 'Oficina',
  'Nave industrial', 'Terreno urbano', 'Bodega', 'Otro',
]

const PROPOSITOS_AVALUO = [
  'Compraventa', 'Garantía hipotecaria', 'Arrendamiento', 'Dación en pago', 'Trámite judicial',
]

const ESTADOS_INEGI = [
  { clave: '01', nombre: 'Aguascalientes' },
  { clave: '02', nombre: 'Baja California' },
  { clave: '03', nombre: 'Baja California Sur' },
  { clave: '04', nombre: 'Campeche' },
  { clave: '05', nombre: 'Coahuila de Zaragoza' },
  { clave: '06', nombre: 'Colima' },
  { clave: '07', nombre: 'Chiapas' },
  { clave: '08', nombre: 'Chihuahua' },
  { clave: '09', nombre: 'Ciudad de México' },
  { clave: '10', nombre: 'Durango' },
  { clave: '11', nombre: 'Guanajuato' },
  { clave: '12', nombre: 'Guerrero' },
  { clave: '13', nombre: 'Hidalgo' },
  { clave: '14', nombre: 'Jalisco' },
  { clave: '15', nombre: 'México' },
  { clave: '16', nombre: 'Michoacán de Ocampo' },
  { clave: '17', nombre: 'Morelos' },
  { clave: '18', nombre: 'Nayarit' },
  { clave: '19', nombre: 'Nuevo León' },
  { clave: '20', nombre: 'Oaxaca' },
  { clave: '21', nombre: 'Puebla' },
  { clave: '22', nombre: 'Querétaro' },
  { clave: '23', nombre: 'Quintana Roo' },
  { clave: '24', nombre: 'San Luis Potosí' },
  { clave: '25', nombre: 'Sinaloa' },
  { clave: '26', nombre: 'Sonora' },
  { clave: '27', nombre: 'Tabasco' },
  { clave: '28', nombre: 'Tamaulipas' },
  { clave: '29', nombre: 'Tlaxcala' },
  { clave: '30', nombre: 'Veracruz de Ignacio de la Llave' },
  { clave: '31', nombre: 'Yucatán' },
  { clave: '32', nombre: 'Zacatecas' },
]

const TABS = [
  { id: 'datos', label: '1. Datos generales' },
  { id: 'fisico', label: '2. Método Físico' },
  { id: 'comparativo', label: '3. Comparativo' },
]

export function NuevoExpedientePage() {
  const navigate = useNavigate()
  const { crearExpediente, guardarMetodoFisico, guardarMetodoComparativo } = useExpedientes()

  const [tab, setTab] = useState('datos')
  const [guardando, setGuardando] = useState(false)
  const [error, setError] = useState(null)
  const [expedienteId, setExpedienteId] = useState(null)
  const [fisicoGuardado, setFisicoGuardado] = useState(false)
  const [superficieFisico, setSuperficieFisico] = useState('')

  const [datos, setDatos] = useState(() => {
    const perfil = getPeritoPerfil()
    return {
      nombre_propietario: '', solicitante: '',
      calle: '', numero_oficial: '', fraccionamiento: '', colonia: '',
      municipio: '', municipio_clave_inegi: '',
      estado_rep: '', estado_clave_inegi: '', cp: '',
      tipo_inmueble: 'Casa habitación', uso: 'Habitacional',
      proposito_avaluo: '', fecha_inspeccion: '',
      nombre_perito: perfil.nombre_perito || '',
      clave_perito: perfil.clave_perito || '',
      cedula_perito: perfil.cedula_perito || '',
      latitud: null, longitud: null,
    }
  })

  const handleDatos = (e) => {
    setDatos(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleContinuar = async () => {
    if (!datos.calle && !datos.municipio) {
      setError('Ingresa al menos la vialidad y el municipio del inmueble.')
      return
    }
    setError(null)
    setGuardando(true)
    try {
      const exp = await crearExpediente({
        nombre_propietario: datos.nombre_propietario || null,
        solicitante: datos.solicitante || null,
        calle: datos.calle,
        numero_oficial: datos.numero_oficial || null,
        fraccionamiento: datos.fraccionamiento || null,
        colonia: datos.colonia,
        municipio: datos.municipio,
        municipio_clave_inegi: datos.municipio_clave_inegi || null,
        estado_rep: datos.estado_rep,
        estado_clave_inegi: datos.estado_clave_inegi || null,
        cp: datos.cp,
        tipo_inmueble: datos.tipo_inmueble,
        uso: datos.uso,
        proposito_avaluo: datos.proposito_avaluo || null,
        fecha_inspeccion: datos.fecha_inspeccion || null,
        nombre_perito: datos.nombre_perito || null,
        clave_perito: datos.clave_perito || null,
        cedula_perito: datos.cedula_perito || null,
        latitud: datos.latitud ?? null,
        longitud: datos.longitud ?? null,
        estado: 'borrador',
      })
      setExpedienteId(exp.id)
      setTab('fisico')
    } catch (e) {
      setError(e.message)
    } finally {
      setGuardando(false)
    }
  }

  const handleGuardarFisico = async (resultado, inspeccion, inputs) => {
    if (!expedienteId) return
    setGuardando(true)
    setError(null)
    try {
      await guardarMetodoFisico(expedienteId, inspeccion, resultado, inputs)
      const conConstruccion = inspeccion.tieneConstruccion !== false
      setSuperficieFisico(
        conConstruccion
          ? (inputs.superficieConstruccion || '')
          : (inputs.superficieTerreno || '')
      )
      setFisicoGuardado(true)
      setTab('comparativo')
    } catch (e) {
      setError(e.message)
    } finally {
      setGuardando(false)
    }
  }

  const handleGuardarComparativo = async (resultado, superficieSujeto) => {
    if (!expedienteId) return
    setGuardando(true)
    setError(null)
    try {
      await guardarMetodoComparativo(expedienteId, resultado, superficieSujeto)
      navigate('/expedientes')
    } catch (e) {
      setError(e.message)
    } finally {
      setGuardando(false)
    }
  }

  const canAccessTab = (id) => {
    if (id === 'datos') return true
    if (id === 'fisico') return !!expedienteId
    if (id === 'comparativo') return fisicoGuardado
    return false
  }

  return (
    <div className="p-6 max-w-5xl">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-gray-900">Nuevo Avaúlo</h1>
        <p className="text-sm text-gray-500 mt-0.5">Completa los datos del expediente</p>
      </div>

      <div className="flex gap-1 mb-6 bg-gray-100 rounded-lg p-1 w-fit">
        {TABS.map(t => (
          <button
            key={t.id}
            onClick={() => canAccessTab(t.id) ? setTab(t.id) : null}
            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${
              tab === t.id
                ? 'bg-white shadow-sm text-gray-900'
                : !canAccessTab(t.id)
                  ? 'text-gray-300 cursor-not-allowed'
                  : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md text-sm text-red-700">
          {error}
        </div>
      )}

      <div className={tab === 'datos' ? '' : 'hidden'}>
        <div className="space-y-5">
          <Card>
            <CardHeader><CardTitle>Datos del avalúo</CardTitle></CardHeader>
            <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label>Tipo de inmueble</Label>
                <Select name="tipo_inmueble" value={datos.tipo_inmueble} onChange={handleDatos}>
                  {TIPOS_INMUEBLE.map(t => <option key={t}>{t}</option>)}
                </Select>
              </div>
              <div className="space-y-1">
                <Label>Uso</Label>
                <Select name="uso" value={datos.uso} onChange={handleDatos}>
                  <option>Habitacional</option>
                  <option>Comercial</option>
                  <option>Industrial</option>
                  <option>Mixto</option>
                </Select>
              </div>
              <div className="space-y-1">
                <Label>Propósito del avalúo</Label>
                <Select name="proposito_avaluo" value={datos.proposito_avaluo} onChange={handleDatos}>
                  <option value="">— Seleccionar —</option>
                  {PROPOSITOS_AVALUO.map(p => <option key={p}>{p}</option>)}
                </Select>
              </div>
              <div className="space-y-1"><Label>Fecha de inspección</Label><Input name="fecha_inspeccion" type="date" value={datos.fecha_inspeccion} onChange={handleDatos} /></div>
              <div className="space-y-1"><Label>Nombre del propietario</Label><Input name="nombre_propietario" value={datos.nombre_propietario} onChange={handleDatos} /></div>
              <div className="space-y-1"><Label>Solicitante</Label><Input name="solicitante" value={datos.solicitante} onChange={handleDatos} placeholder="Nombre del cliente" /></div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Ubicación del inmueble</CardTitle></CardHeader>
            <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label>Nombre de vialidad <span className="text-red-500">*</span></Label>
                <Input name="calle" value={datos.calle} onChange={handleDatos} placeholder="Av. Reforma, Calle Morelos..." />
              </div>
              <div className="space-y-1"><Label>Número oficial</Label><Input name="numero_oficial" value={datos.numero_oficial} onChange={handleDatos} placeholder="123, 4-B..." /></div>
              <div className="space-y-1"><Label>Fraccionamiento</Label><Input name="fraccionamiento" value={datos.fraccionamiento} onChange={handleDatos} /></div>
              <div className="space-y-1"><Label>Colonia</Label><Input name="colonia" value={datos.colonia} onChange={handleDatos} /></div>
              <div className="space-y-1">
                <Label>Municipio / Delegación <span className="text-red-500">*</span></Label>
                <Input name="municipio" value={datos.municipio} onChange={handleDatos} />
              </div>
              <div className="space-y-1">
                <Label>Estado</Label>
                <Select
                  name="estado_clave_inegi"
                  value={datos.estado_clave_inegi}
                  onChange={e => {
                    const opt = ESTADOS_INEGI.find(x => x.clave === e.target.value)
                    setDatos(prev => ({ ...prev, estado_clave_inegi: e.target.value, estado_rep: opt?.nombre || '' }))
                  }}
                >
                  <option value="">— Estado —</option>
                  {ESTADOS_INEGI.map(s => (
                    <option key={s.clave} value={s.clave}>{s.clave} — {s.nombre}</option>
                  ))}
                </Select>
              </div>
              <div className="space-y-1"><Label>Código postal</Label><Input name="cp" value={datos.cp} onChange={handleDatos} maxLength={5} /></div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Georeferencia del predio</CardTitle></CardHeader>
            <CardContent>
              <UbicacionMapaInput
                latitud={datos.latitud}
                longitud={datos.longitud}
                onChange={coords => setDatos(prev => ({ ...prev, ...coords }))}
              />
            </CardContent>
          </Card>

          <div className="flex justify-end">
            <Button onClick={handleContinuar} disabled={guardando}>
              {guardando ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              Continuar a Método Físico
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {expedienteId && (
        <div className={tab === 'fisico' ? '' : 'hidden'}>
          <MetodoFisicoForm
            onGuardar={handleGuardarFisico}
            guardando={guardando}
            submitLabel="Guardar y continuar a Comparativo"
          />
        </div>
      )}

      {fisicoGuardado && (
        <div className={tab === 'comparativo' ? '' : 'hidden'}>
          <div className="space-y-2">
            <MetodoComparativoForm
              onGuardar={handleGuardarComparativo}
              guardando={guardando}
              superficieInicial={superficieFisico}
            />
            <div className="text-center">
              <button
                type="button"
                onClick={() => navigate('/expedientes')}
                className="text-xs text-gray-400 hover:text-gray-600"
              >
                Saltar — el expediente ya fue guardado con el Método Físico
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
