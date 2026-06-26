import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { MetodoFisicoForm } from '@/features/metodo-fisico/MetodoFisicoForm'
import { MetodoComparativoForm } from '@/features/metodo-comparativo/MetodoComparativoForm'
import { ComparableCapturaBuffer } from '@/features/comparables/ComparableCaptura'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { useExpedientes } from '@/hooks/useExpedientes'
import { UbicacionMapaInput } from '@/components/ui/ubicacion-mapa-input'
import { ChevronRight, Loader2 } from 'lucide-react'

const TIPOS_INMUEBLE = [
  'Casa habitación', 'Departamento', 'Local comercial', 'Oficina',
  'Nave industrial', 'Terreno urbano', 'Bodega', 'Otro',
]

const TABS = [
  { id: 'datos', label: '1. Datos generales' },
  { id: 'fisico', label: '2. Método Físico' },
  { id: 'comparables', label: '3. Comparables' },
  { id: 'comparativo', label: '4. Comparativo' },
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
  const [bufferComparables, setBufferComparables] = useState([])

  const [datos, setDatos] = useState({
    calle: '', colonia: '', municipio: '', estado_rep: '', cp: '',
    tipo_inmueble: 'Casa habitación', uso: 'Habitacional',
    solicitante: '', fecha_inspeccion: '',
    latitud: null, longitud: null,
  })

  const handleDatos = (e) => {
    setDatos(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleContinuar = async () => {
    if (!datos.calle && !datos.municipio) {
      setError('Ingresa al menos la calle y el municipio del inmueble.')
      return
    }
    setError(null)
    setGuardando(true)
    try {
      const exp = await crearExpediente({
        calle: datos.calle,
        colonia: datos.colonia,
        municipio: datos.municipio,
        estado_rep: datos.estado_rep,
        cp: datos.cp,
        tipo_inmueble: datos.tipo_inmueble,
        uso: datos.uso,
        solicitante: datos.solicitante,
        fecha_inspeccion: datos.fecha_inspeccion || null,
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
      setTab('comparables')
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
    if (id === 'comparables') return fisicoGuardado
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
            <CardHeader><CardTitle>Ubicación del inmueble</CardTitle></CardHeader>
            <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2 space-y-1">
                <Label>Calle y número</Label>
                <Input name="calle" value={datos.calle} onChange={handleDatos} placeholder="Av. Reforma 123, Int. 4" />
              </div>
              <div className="space-y-1"><Label>Colonia</Label><Input name="colonia" value={datos.colonia} onChange={handleDatos} /></div>
              <div className="space-y-1"><Label>Municipio / Delegación</Label><Input name="municipio" value={datos.municipio} onChange={handleDatos} /></div>
              <div className="space-y-1"><Label>Estado</Label><Input name="estado_rep" value={datos.estado_rep} onChange={handleDatos} /></div>
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

          <Card>
            <CardHeader><CardTitle>Características generales</CardTitle></CardHeader>
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
              <div className="space-y-1"><Label>Solicitante</Label><Input name="solicitante" value={datos.solicitante} onChange={handleDatos} placeholder="Nombre del cliente" /></div>
              <div className="space-y-1"><Label>Fecha de inspección</Label><Input name="fecha_inspeccion" type="date" value={datos.fecha_inspeccion} onChange={handleDatos} /></div>
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
        <div className={tab === 'comparables' ? '' : 'hidden'}>
          <div className="space-y-5">
            <Card>
              <CardHeader>
                <CardTitle>Captura de comparables de mercado</CardTitle>
                <p className="text-xs text-gray-400 mt-1">
                  Pega URLs de anuncios inmobiliarios similares. La IA extrae los datos automáticamente.
                  Mínimo 3 comparables recomendados.
                </p>
              </CardHeader>
              <CardContent>
                <ComparableCapturaBuffer
                  buffer={bufferComparables}
                  onAgregarAlBuffer={comp =>
                    setBufferComparables(prev => [...prev, { ...comp, _bufferId: Date.now() }])
                  }
                  onEliminarDelBuffer={id =>
                    setBufferComparables(prev => prev.filter(c => c._bufferId !== id))
                  }
                />
              </CardContent>
            </Card>
            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={() => setTab('comparativo')}
                className="text-xs text-gray-400 hover:text-gray-600"
              >
                Saltar — continuar sin comparables
              </button>
              <Button onClick={() => setTab('comparativo')}>
                Continuar a Método Comparativo
              </Button>
            </div>
          </div>
        </div>
      )}

      {fisicoGuardado && (
        <div className={tab === 'comparativo' ? '' : 'hidden'}>
          <div className="space-y-2">
            <MetodoComparativoForm
              onGuardar={handleGuardarComparativo}
              guardando={guardando}
              superficieInicial={superficieFisico}
              initialComparables={bufferComparables}
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
