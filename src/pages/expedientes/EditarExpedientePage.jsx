import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useExpediente } from '@/hooks/useExpediente'
import { useExpedientes } from '@/hooks/useExpedientes'
import { MetodoFisicoForm } from '@/features/metodo-fisico/MetodoFisicoForm'
import { MetodoComparativoForm } from '@/features/metodo-comparativo/MetodoComparativoForm'
import { EntornoForm } from '@/features/entorno/EntornoForm'
import { CaracteristicasTerrenoForm } from '@/features/terreno/CaracteristicasTerrenoForm'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { UbicacionMapaInput } from '@/components/ui/ubicacion-mapa-input'
import { ArrowLeft, CheckCircle2, Loader2 } from 'lucide-react'

const TIPOS_INMUEBLE = [
  'Casa habitación', 'Departamento', 'Local comercial', 'Oficina',
  'Nave industrial', 'Terreno urbano', 'Bodega', 'Otro',
]

const TABS = [
  { id: 'datos',       label: 'Datos' },
  { id: 'entorno',     label: 'Entorno' },
  { id: 'terreno',     label: 'Terreno' },
  { id: 'fisico',      label: 'Método Físico' },
  { id: 'comparativo', label: 'Comparativo' },
]

export function EditarExpedientePage() {
  const { id } = useParams()
  const {
    expediente, entorno, terreno,
    metodoFisico, inspeccion, metodoComparativo,
    loading, error,
  } = useExpediente(id)
  const {
    actualizarExpediente,
    guardarEntorno, guardarTerreno,
    guardarMetodoFisico, guardarMetodoComparativo,
  } = useExpedientes()

  const [tab, setTab] = useState('datos')
  const [guardando, setGuardando] = useState(false)
  const [okTab, setOkTab] = useState(null)
  const [errorMsg, setErrorMsg] = useState(null)
  const [datos, setDatos] = useState(null)

  if (loading) {
    return (
      <div className="p-6 flex items-center gap-2 text-gray-400">
        <Loader2 className="h-5 w-5 animate-spin" />
        <span className="text-sm">Cargando...</span>
      </div>
    )
  }

  if (error || !expediente) {
    return (
      <div className="p-6 text-sm">
        <p className="text-red-600">{error || 'Expediente no encontrado'}</p>
        <Link to="/expedientes" className="text-blue-600 hover:underline mt-2 inline-block">← Regresar</Link>
      </div>
    )
  }

  const fromExpediente = () => ({
    calle: expediente.calle || '',
    colonia: expediente.colonia || '',
    municipio: expediente.municipio || '',
    estado_rep: expediente.estado_rep || '',
    cp: expediente.cp || '',
    tipo_inmueble: expediente.tipo_inmueble || 'Casa habitación',
    uso: expediente.uso || 'Habitacional',
    solicitante: expediente.solicitante || '',
    fecha_inspeccion: expediente.fecha_inspeccion || '',
    latitud: expediente.latitud ?? null,
    longitud: expediente.longitud ?? null,
  })

  const d = datos ?? fromExpediente()

  const handleDatos = (e) => {
    setDatos(prev => ({ ...(prev ?? fromExpediente()), [e.target.name]: e.target.value }))
  }

  function flashOk(tabId) {
    setOkTab(tabId)
    setTimeout(() => setOkTab(null), 2500)
  }

  const handleGuardarDatos = async () => {
    setGuardando(true); setErrorMsg(null)
    try {
      await actualizarExpediente(id, {
        ...d,
        fecha_inspeccion: d.fecha_inspeccion || null,
      })
      flashOk('datos')
    }
    catch (e) { setErrorMsg(e.message) }
    finally { setGuardando(false) }
  }

  const handleGuardarEntorno = async (payload) => {
    setGuardando(true); setErrorMsg(null)
    try { await guardarEntorno(id, payload); flashOk('entorno') }
    catch (e) { setErrorMsg(e.message) }
    finally { setGuardando(false) }
  }

  const handleGuardarTerreno = async (payload) => {
    setGuardando(true); setErrorMsg(null)
    try { await guardarTerreno(id, payload); flashOk('terreno') }
    catch (e) { setErrorMsg(e.message) }
    finally { setGuardando(false) }
  }

  const handleGuardarFisico = async (resultado, inspeccionData, inputs) => {
    setGuardando(true); setErrorMsg(null)
    try { await guardarMetodoFisico(id, inspeccionData, resultado, inputs); flashOk('fisico') }
    catch (e) { setErrorMsg(e.message) }
    finally { setGuardando(false) }
  }

  const handleGuardarComparativo = async (resultado, superficieSujeto) => {
    setGuardando(true); setErrorMsg(null)
    try { await guardarMetodoComparativo(id, resultado, superficieSujeto); flashOk('comparativo') }
    catch (e) { setErrorMsg(e.message) }
    finally { setGuardando(false) }
  }

  const fisicoInitial = metodoFisico ? {
    tieneConstruccion: metodoFisico.superficie_construccion !== 0,
    inputs: {
      superficieConstruccion: String(metodoFisico.superficie_construccion || ''),
      superficieTerreno:      String(metodoFisico.superficie_terreno || ''),
      costoReposicionM2:      String(metodoFisico.costo_reposicion_m2 || ''),
      valorUnitarioTerreno:   String(metodoFisico.valor_unitario_terreno || ''),
      edadAnios:              String(metodoFisico.edad_anios || ''),
      vidaUtilAnios:          String(metodoFisico.vida_util_anios || '60'),
      valorResidual:          String(metodoFisico.valor_residual_pct || '15'),
    },
    estadosRaw: inspeccion,
  } : null

  const comparativoInitial = metodoComparativo ? {
    superficieSujeto: String(metodoComparativo.superficie_sujeto || ''),
    comparables: metodoComparativo.comparables || [],
  } : null

  return (
    <div className="p-6 max-w-5xl">
      <div className="flex items-center gap-3 mb-6">
        <Link to={`/expedientes/${id}`} className="text-gray-400 hover:text-gray-600 transition-colors">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-xl font-bold text-gray-900">
            Editar — {expediente.folio || id.slice(0, 8).toUpperCase()}
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {[expediente.calle, expediente.municipio].filter(Boolean).join(', ') || 'Sin dirección'}
          </p>
        </div>
      </div>

      <div className="overflow-x-auto mb-6">
        <div className="flex gap-1 bg-gray-100 rounded-lg p-1 w-fit min-w-full sm:min-w-0">
          {TABS.map(t => (
            <button
              key={t.id}
              onClick={() => { setTab(t.id); setErrorMsg(null) }}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all flex items-center gap-1.5 whitespace-nowrap ${
                tab === t.id ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {t.label}
              {okTab === t.id && <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />}
            </button>
          ))}
        </div>
      </div>

      {errorMsg && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md text-sm text-red-700">
          {errorMsg}
        </div>
      )}

      {tab === 'datos' && (
        <div className="space-y-5">
          <Card>
            <CardHeader><CardTitle>Ubicación del inmueble</CardTitle></CardHeader>
            <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2 space-y-1">
                <Label>Calle y número</Label>
                <Input name="calle" value={d.calle} onChange={handleDatos} placeholder="Av. Reforma 123" />
              </div>
              <div className="space-y-1"><Label>Colonia</Label><Input name="colonia" value={d.colonia} onChange={handleDatos} /></div>
              <div className="space-y-1"><Label>Municipio / Delegación</Label><Input name="municipio" value={d.municipio} onChange={handleDatos} /></div>
              <div className="space-y-1"><Label>Estado</Label><Input name="estado_rep" value={d.estado_rep} onChange={handleDatos} /></div>
              <div className="space-y-1"><Label>Código postal</Label><Input name="cp" value={d.cp} onChange={handleDatos} maxLength={5} /></div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle>Georeferencia del predio</CardTitle></CardHeader>
            <CardContent>
              <UbicacionMapaInput
                latitud={d.latitud}
                longitud={d.longitud}
                onChange={coords => setDatos(prev => ({ ...(prev ?? fromExpediente()), ...coords }))}
              />
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle>Características generales</CardTitle></CardHeader>
            <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label>Tipo de inmueble</Label>
                <Select name="tipo_inmueble" value={d.tipo_inmueble} onChange={handleDatos}>
                  {TIPOS_INMUEBLE.map(t => <option key={t}>{t}</option>)}
                </Select>
              </div>
              <div className="space-y-1">
                <Label>Uso</Label>
                <Select name="uso" value={d.uso} onChange={handleDatos}>
                  <option>Habitacional</option>
                  <option>Comercial</option>
                  <option>Industrial</option>
                  <option>Mixto</option>
                </Select>
              </div>
              <div className="space-y-1"><Label>Solicitante</Label><Input name="solicitante" value={d.solicitante} onChange={handleDatos} /></div>
              <div className="space-y-1"><Label>Fecha de inspección</Label><Input name="fecha_inspeccion" type="date" value={d.fecha_inspeccion} onChange={handleDatos} /></div>
            </CardContent>
          </Card>
          <div className="flex justify-end">
            <Button onClick={handleGuardarDatos} disabled={guardando}>
              {guardando ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              {okTab === 'datos' ? '✓ Guardado' : 'Guardar datos generales'}
            </Button>
          </div>
        </div>
      )}

      {tab === 'entorno' && (
        <EntornoForm
          key={entorno?.id ?? 'entorno-nuevo'}
          initialValues={entorno}
          latitud={expediente.latitud ?? null}
          longitud={expediente.longitud ?? null}
          onGuardar={handleGuardarEntorno}
          guardando={guardando}
          submitLabel={okTab === 'entorno' ? '✓ Guardado' : (entorno ? 'Actualizar entorno' : 'Guardar entorno')}
        />
      )}

      {tab === 'terreno' && (
        <CaracteristicasTerrenoForm
          key={terreno?.id ?? 'terreno-nuevo'}
          initialValues={terreno}
          onGuardar={handleGuardarTerreno}
          guardando={guardando}
          submitLabel={okTab === 'terreno' ? '✓ Guardado' : (terreno ? 'Actualizar terreno' : 'Guardar terreno')}
        />
      )}

      {tab === 'fisico' && (
        <MetodoFisicoForm
          key={metodoFisico?.id ?? 'fisico-nuevo'}
          onGuardar={handleGuardarFisico}
          guardando={guardando}
          submitLabel={okTab === 'fisico' ? '✓ Guardado' : (metodoFisico ? 'Actualizar Método Físico' : 'Guardar Método Físico')}
          initialValues={fisicoInitial}
        />
      )}

      {tab === 'comparativo' && (
        <MetodoComparativoForm
          key={metodoComparativo?.id ?? 'comp-nuevo'}
          onGuardar={handleGuardarComparativo}
          guardando={guardando}
          initialValues={comparativoInitial}
        />
      )}
    </div>
  )
}
