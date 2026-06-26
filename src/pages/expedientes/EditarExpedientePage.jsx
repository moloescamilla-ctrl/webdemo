import { useState } from 'react'
import { useParams, Link, useLocation } from 'react-router-dom'
import { useExpediente } from '@/hooks/useExpediente'
import { useExpedientes } from '@/hooks/useExpedientes'
import { getPeritoPerfil, savePeritoPerfil } from '@/hooks/usePeritoPerfil'
import { MetodoFisicoForm } from '@/features/metodo-fisico/MetodoFisicoForm'
import { MetodoComparativoForm } from '@/features/metodo-comparativo/MetodoComparativoForm'
import { EntornoForm } from '@/features/entorno/EntornoForm'
import { CaracteristicasTerrenoForm } from '@/features/terreno/CaracteristicasTerrenoForm'
import { DescripcionConstruccionForm } from '@/features/construccion/DescripcionConstruccionForm'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { UbicacionMapaInput } from '@/components/ui/ubicacion-mapa-input'
import { ArrowLeft, CheckCircle2, Loader2, Sparkles, User } from 'lucide-react'

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
  { id: 'datos',        label: 'Datos' },
  { id: 'entorno',      label: 'Entorno' },
  { id: 'terreno',      label: 'Terreno' },
  { id: 'construccion', label: 'Construcción' },
  { id: 'fisico',       label: 'Método Físico' },
  { id: 'comparativo',  label: 'Comparativo' },
]

export function EditarExpedientePage() {
  const { id } = useParams()
  const location = useLocation()
  const navState = location.state ?? {}
  const {
    expediente, entorno, terreno, descripcionConstruccion,
    metodoFisico, inspeccion, metodoComparativo,
    loading, error,
  } = useExpediente(id)
  const {
    actualizarExpediente,
    guardarEntorno, guardarTerreno,
    guardarDescripcionConstruccion,
    guardarMetodoFisico, guardarMetodoComparativo,
  } = useExpedientes()

  const [tab, setTab] = useState(navState.tab ?? 'datos')
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

  const fromExpediente = () => {
    const perfil = getPeritoPerfil()
    return {
      calle: expediente.calle || '',
      numero_oficial: expediente.numero_oficial || '',
      fraccionamiento: expediente.fraccionamiento || '',
      colonia: expediente.colonia || '',
      municipio: expediente.municipio || '',
      municipio_clave_inegi: expediente.municipio_clave_inegi || '',
      estado_rep: expediente.estado_rep || '',
      estado_clave_inegi: expediente.estado_clave_inegi || '',
      cp: expediente.cp || '',
      num_cuenta_predial: expediente.num_cuenta_predial || '',
      num_cuenta_agua: expediente.num_cuenta_agua || '',
      tipo_inmueble: expediente.tipo_inmueble || 'Casa habitación',
      uso: expediente.uso || 'Habitacional',
      proposito_avaluo: expediente.proposito_avaluo || '',
      nombre_propietario: expediente.nombre_propietario || '',
      solicitante: expediente.solicitante || '',
      fecha_inspeccion: expediente.fecha_inspeccion || '',
      nombre_perito: expediente.nombre_perito || perfil.nombre_perito || '',
      clave_perito: expediente.clave_perito || perfil.clave_perito || '',
      cedula_perito: expediente.cedula_perito || perfil.cedula_perito || '',
      latitud: expediente.latitud ?? null,
      longitud: expediente.longitud ?? null,
    }
  }

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
        municipio_clave_inegi: d.municipio_clave_inegi || null,
        estado_clave_inegi: d.estado_clave_inegi || null,
        num_cuenta_predial: d.num_cuenta_predial || null,
        num_cuenta_agua: d.num_cuenta_agua || null,
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

  const handleGuardarConstruccion = async (payload) => {
    setGuardando(true); setErrorMsg(null)
    try { await guardarDescripcionConstruccion(id, payload); flashOk('construccion') }
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
      superficieConstruccion:     String(metodoFisico.superficie_construccion || ''),
      superficieTerreno:          String(metodoFisico.superficie_terreno || ''),
      costoReposicionM2:          String(metodoFisico.costo_reposicion_m2 || ''),
      costoReposicionAccesoriaM2: '',
      valorUnitarioTerreno:       String(metodoFisico.valor_unitario_terreno || ''),
      edadAnios:                  String(metodoFisico.edad_anios || ''),
      vidaUtilAnios:              String(metodoFisico.vida_util_anios || '60'),
      valorResidual:              String(metodoFisico.valor_residual_pct || '15'),
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
            <CardHeader><CardTitle>Datos del avalúo</CardTitle></CardHeader>
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
              <div className="space-y-1">
                <Label>Propósito del avalúo</Label>
                <Select name="proposito_avaluo" value={d.proposito_avaluo} onChange={handleDatos}>
                  <option value="">— Seleccionar —</option>
                  {PROPOSITOS_AVALUO.map(p => <option key={p}>{p}</option>)}
                </Select>
              </div>
              <div className="space-y-1"><Label>Fecha de inspección</Label><Input name="fecha_inspeccion" type="date" value={d.fecha_inspeccion} onChange={handleDatos} /></div>
              <div className="space-y-1"><Label>Nombre del propietario</Label><Input name="nombre_propietario" value={d.nombre_propietario} onChange={handleDatos} /></div>
              <div className="space-y-1"><Label>Solicitante</Label><Input name="solicitante" value={d.solicitante} onChange={handleDatos} /></div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Ubicación del inmueble</CardTitle></CardHeader>
            <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label>Nombre de vialidad</Label>
                <Input name="calle" value={d.calle} onChange={handleDatos} placeholder="Av. Reforma, Calle Morelos..." />
              </div>
              <div className="space-y-1"><Label>Número oficial</Label><Input name="numero_oficial" value={d.numero_oficial} onChange={handleDatos} placeholder="123, 4-B..." /></div>
              <div className="space-y-1"><Label>Fraccionamiento / Colonia</Label><Input name="fraccionamiento" value={d.fraccionamiento} onChange={handleDatos} placeholder="Fraccionamiento..." /></div>
              <div className="space-y-1"><Label>Colonia</Label><Input name="colonia" value={d.colonia} onChange={handleDatos} /></div>
              <div className="space-y-1"><Label>Municipio / Delegación</Label><Input name="municipio" value={d.municipio} onChange={handleDatos} /></div>
              <div className="space-y-1">
                <Label>Clave INEGI municipio</Label>
                <Input name="municipio_clave_inegi" value={d.municipio_clave_inegi} onChange={handleDatos} placeholder="001" maxLength={3} />
              </div>
              <div className="space-y-1">
                <Label>Estado</Label>
                <Select
                  name="estado_clave_inegi"
                  value={d.estado_clave_inegi}
                  onChange={e => {
                    const opt = ESTADOS_INEGI.find(x => x.clave === e.target.value)
                    setDatos(prev => ({
                      ...(prev ?? fromExpediente()),
                      estado_clave_inegi: e.target.value,
                      estado_rep: opt?.nombre || '',
                    }))
                  }}
                >
                  <option value="">— Estado —</option>
                  {ESTADOS_INEGI.map(s => (
                    <option key={s.clave} value={s.clave}>{s.clave} — {s.nombre}</option>
                  ))}
                </Select>
              </div>
              <div className="space-y-1"><Label>Código postal</Label><Input name="cp" value={d.cp} onChange={handleDatos} maxLength={5} /></div>
              <div className="space-y-1"><Label>No. cuenta predial</Label><Input name="num_cuenta_predial" value={d.num_cuenta_predial} onChange={handleDatos} /></div>
              <div className="space-y-1"><Label>No. cuenta agua</Label><Input name="num_cuenta_agua" value={d.num_cuenta_agua} onChange={handleDatos} /></div>
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
            <CardHeader>
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-gray-500" />
                <CardTitle>Datos del perito</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-1 space-y-1"><Label>Clave de perito</Label><Input name="clave_perito" value={d.clave_perito} onChange={handleDatos} /></div>
                <div className="sm:col-span-2 space-y-1"><Label>Nombre del perito valuador</Label><Input name="nombre_perito" value={d.nombre_perito} onChange={handleDatos} /></div>
                <div className="sm:col-span-1 space-y-1"><Label>Cédula profesional</Label><Input name="cedula_perito" value={d.cedula_perito} onChange={handleDatos} /></div>
              </div>
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => savePeritoPerfil({ nombre_perito: d.nombre_perito, clave_perito: d.clave_perito, cedula_perito: d.cedula_perito })}
                  className="text-xs text-blue-600 hover:text-blue-800 border border-blue-200 rounded px-3 py-1.5 hover:bg-blue-50 transition-colors"
                >
                  Guardar en perfil (auto-relleno)
                </button>
              </div>
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

      {tab === 'construccion' && (
        <DescripcionConstruccionForm
          key={descripcionConstruccion?.id ?? 'construccion-nueva'}
          initialValues={descripcionConstruccion}
          onGuardar={handleGuardarConstruccion}
          guardando={guardando}
          submitLabel={okTab === 'construccion' ? '✓ Guardado' : (descripcionConstruccion ? 'Actualizar construcción' : 'Guardar construcción')}
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
        <div className="space-y-4">
          <div className="flex justify-end">
            <Link
              to={`/expedientes/${id}/captura-comparables`}
              className="flex items-center gap-1.5 text-sm text-purple-700 border border-purple-200 rounded-md px-3 py-1.5 hover:bg-purple-50 transition-colors"
            >
              <Sparkles className="h-3.5 w-3.5" />
              Capturar comparables con IA
            </Link>
          </div>
          {navState.comparablesImportados?.length > 0 && (
            <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-md text-sm text-green-800">
              <CheckCircle2 className="h-4 w-4 text-green-600 shrink-0" />
              {navState.comparablesImportados.length} comparable{navState.comparablesImportados.length !== 1 ? 's' : ''} importado{navState.comparablesImportados.length !== 1 ? 's' : ''} del buffer — revisa los factores de homologación.
            </div>
          )}
          <MetodoComparativoForm
            key={metodoComparativo?.id ?? 'comp-nuevo'}
            onGuardar={handleGuardarComparativo}
            guardando={guardando}
            initialValues={comparativoInitial}
            comparablesImportados={navState.comparablesImportados ?? null}
          />
        </div>
      )}
    </div>
  )
}
