import { useState, Fragment } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { EntornoForm } from '@/features/entorno/EntornoForm'
import { CaracteristicasTerrenoForm } from '@/features/terreno/CaracteristicasTerrenoForm'
import { DescripcionConstruccionForm } from '@/features/construccion/DescripcionConstruccionForm'
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
import { Check, ChevronRight, Loader2 } from 'lucide-react'

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

const PASOS_RAPIDOS = [
  { id: 'datos',        label: 'Datos generales' },
  { id: 'fisico',       label: 'Método Físico' },
  { id: 'comparativo',  label: 'Comparativo' },
]

const PASOS_COMPLETOS = [
  { id: 'datos',        label: 'Datos generales' },
  { id: 'entorno',      label: 'Entorno' },
  { id: 'terreno',      label: 'Terreno' },
  { id: 'construccion', label: 'Construcciones' },
  { id: 'fisico',       label: 'Método Físico' },
  { id: 'comparativo',  label: 'Comparativo' },
]

function IndicadorPasos({ pasos, pasoActual, puedeIrA, onIrA }) {
  return (
    <>
      <p className="sm:hidden text-sm font-medium text-blue-700 mb-4">
        Paso {pasoActual + 1} de {pasos.length} — {pasos[pasoActual].label}
      </p>
      <div className="hidden sm:flex items-center mb-6 overflow-x-auto pb-1">
        {pasos.map((p, idx) => {
          const ok = puedeIrA(idx)
          const done = idx < pasoActual
          const active = idx === pasoActual
          return (
            <Fragment key={p.id}>
              <div className="flex flex-col items-center gap-1 shrink-0" style={{ minWidth: 56 }}>
                <button
                  onClick={() => ok && onIrA(idx)}
                  disabled={!ok}
                  className={`flex items-center justify-center w-8 h-8 rounded-full text-xs font-bold transition-colors ${
                    done   ? 'bg-green-500 text-white hover:bg-green-600 cursor-pointer' :
                    active ? 'bg-blue-600 text-white cursor-default' :
                    ok     ? 'bg-gray-200 text-gray-500 hover:bg-gray-300 cursor-pointer' :
                             'bg-gray-100 text-gray-300 cursor-not-allowed'
                  }`}
                >
                  {done ? <Check className="h-3.5 w-3.5" /> : idx + 1}
                </button>
                <span className={`text-[10px] text-center leading-tight max-w-[56px] ${
                  active ? 'text-blue-700 font-medium' :
                  ok     ? 'text-gray-500' : 'text-gray-300'
                }`}>
                  {p.label}
                </span>
              </div>
              {idx < pasos.length - 1 && (
                <div className={`h-0.5 flex-1 min-w-4 mb-5 mx-1 ${done ? 'bg-green-400' : 'bg-gray-200'}`} />
              )}
            </Fragment>
          )
        })}
      </div>
    </>
  )
}

function NavPaso({ onBack, onOmitir, omitirLabel = 'Omitir por ahora' }) {
  return (
    <div className="flex items-center justify-between pt-1">
      <button
        onClick={onBack}
        className="text-sm text-gray-400 hover:text-gray-600 transition-colors"
      >
        ← Anterior
      </button>
      <button
        onClick={onOmitir}
        className="text-xs text-gray-400 hover:text-gray-600 transition-colors"
      >
        {omitirLabel}
      </button>
    </div>
  )
}

export function NuevoExpedientePage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const esCompleto = searchParams.get('modo') !== 'rapido'
  const pasos = esCompleto ? PASOS_COMPLETOS : PASOS_RAPIDOS

  const {
    crearExpediente,
    guardarEntorno, guardarTerreno, guardarDescripcionConstruccion,
    guardarMetodoFisico, guardarMetodoComparativo,
  } = useExpedientes()

  const [paso, setPaso] = useState(0)
  const [maxAlcanzado, setMaxAlcanzado] = useState(0)
  const [expedienteId, setExpedienteId] = useState(null)
  const [superficieFisico, setSuperficieFisico] = useState('')
  const [guardando, setGuardando] = useState(false)
  const [error, setError] = useState(null)

  const [datos, setDatos] = useState(() => {
    const perfil = getPeritoPerfil()
    return {
      nombre_propietario: '', solicitante: '',
      calle: '', numero_oficial: '', fraccionamiento: '', colonia: '',
      municipio: '', municipio_clave_inegi: '',
      estado_rep: '', estado_clave_inegi: '', cp: '',
      num_cuenta_predial: '', num_cuenta_agua: '',
      tipo_inmueble: 'Casa habitación', uso: 'Habitacional',
      proposito_avaluo: '', fecha_inspeccion: '',
      nombre_perito: perfil.nombre_perito || '',
      clave_perito: perfil.clave_perito || '',
      cedula_perito: perfil.cedula_perito || '',
      latitud: null, longitud: null,
    }
  })

  const pasoId = pasos[paso]?.id
  const esUltimoPaso = paso === pasos.length - 1

  const avanzar = () => {
    setPaso(prev => {
      const next = Math.min(prev + 1, pasos.length - 1)
      setMaxAlcanzado(m => Math.max(m, next))
      return next
    })
    setError(null)
  }

  const retroceder = () => { setPaso(prev => Math.max(prev - 1, 0)); setError(null) }
  const puedeIrA = (idx) => idx === 0 || (!!expedienteId && idx <= maxAlcanzado)

  const omitir = () => {
    if (esUltimoPaso && expedienteId) navigate(`/expedientes/${expedienteId}`)
    else avanzar()
  }

  // ── Paso 1: Datos generales ──────────────────────────────────────────────
  const handleDatos = (e) => setDatos(prev => ({ ...prev, [e.target.name]: e.target.value }))

  const handleContinuarDatos = async () => {
    if (!datos.calle && !datos.municipio) {
      setError('Ingresa al menos la vialidad y el municipio del inmueble.')
      return
    }
    setGuardando(true); setError(null)
    try {
      const exp = await crearExpediente({
        tipo_inmueble:        datos.tipo_inmueble,
        uso:                  datos.uso,
        proposito_avaluo:     datos.proposito_avaluo     || null,
        fecha_inspeccion:     datos.fecha_inspeccion     || null,
        nombre_propietario:   datos.nombre_propietario   || null,
        solicitante:          datos.solicitante          || null,
        calle:                datos.calle,
        numero_oficial:       datos.numero_oficial       || null,
        fraccionamiento:      datos.fraccionamiento      || null,
        colonia:              datos.colonia,
        municipio:            datos.municipio,
        municipio_clave_inegi: datos.municipio_clave_inegi || null,
        estado_rep:           datos.estado_rep,
        estado_clave_inegi:   datos.estado_clave_inegi  || null,
        cp:                   datos.cp,
        num_cuenta_predial:   datos.num_cuenta_predial  || null,
        num_cuenta_agua:      datos.num_cuenta_agua     || null,
        nombre_perito:        datos.nombre_perito       || null,
        clave_perito:         datos.clave_perito        || null,
        cedula_perito:        datos.cedula_perito       || null,
        latitud:              datos.latitud  ?? null,
        longitud:             datos.longitud ?? null,
        estado: 'borrador',
      })
      setExpedienteId(exp.id)
      avanzar()
    } catch (e) { setError(e.message) }
    finally { setGuardando(false) }
  }

  // ── Pasos opcionales ─────────────────────────────────────────────────────
  const handleGuardarEntorno = async (payload) => {
    setGuardando(true); setError(null)
    try { await guardarEntorno(expedienteId, payload); avanzar() }
    catch (e) { setError(e.message) }
    finally { setGuardando(false) }
  }

  const handleGuardarTerreno = async (payload) => {
    setGuardando(true); setError(null)
    try { await guardarTerreno(expedienteId, payload); avanzar() }
    catch (e) { setError(e.message) }
    finally { setGuardando(false) }
  }

  const handleGuardarConstruccion = async (payload) => {
    setGuardando(true); setError(null)
    try { await guardarDescripcionConstruccion(expedienteId, payload); avanzar() }
    catch (e) { setError(e.message) }
    finally { setGuardando(false) }
  }

  // ── Métodos ───────────────────────────────────────────────────────────────
  const handleGuardarFisico = async (resultado, inspeccion, inputs) => {
    setGuardando(true); setError(null)
    try {
      await guardarMetodoFisico(expedienteId, inspeccion, resultado, inputs)
      const conConstruccion = inspeccion.tieneConstruccion !== false
      setSuperficieFisico(
        conConstruccion ? inputs.superficieConstruccion || '' : inputs.superficieTerreno || ''
      )
      avanzar()
    } catch (e) { setError(e.message) }
    finally { setGuardando(false) }
  }

  const handleGuardarComparativo = async (resultado, superficieSujeto) => {
    setGuardando(true); setError(null)
    try {
      await guardarMetodoComparativo(expedienteId, resultado, superficieSujeto)
      navigate(`/expedientes/${expedienteId}`)
    } catch (e) { setError(e.message) }
    finally { setGuardando(false) }
  }

  return (
    <div className="p-6 max-w-5xl">
      <div className="mb-5">
        <h1 className="text-xl font-bold text-gray-900">
          {esCompleto ? 'Nuevo Avalúo' : 'Calculadora Rápida'}
        </h1>
        <p className="text-sm text-gray-500 mt-0.5">
          {esCompleto
            ? `Expediente completo · ${pasos.length} pasos`
            : 'Estimación rápida de valor · 3 pasos'}
        </p>
      </div>

      <IndicadorPasos
        pasos={pasos}
        pasoActual={paso}
        puedeIrA={puedeIrA}
        onIrA={setPaso}
      />

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md text-sm text-red-700">
          {error}
        </div>
      )}

      {/* ── Paso: Datos generales ──────────────────────────────────────── */}
      {pasoId === 'datos' && (
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
              <div className="space-y-1">
                <Label>Fecha de inspección</Label>
                <Input name="fecha_inspeccion" type="date" value={datos.fecha_inspeccion} onChange={handleDatos} />
              </div>
              <div className="space-y-1">
                <Label>Nombre del propietario</Label>
                <Input name="nombre_propietario" value={datos.nombre_propietario} onChange={handleDatos} />
              </div>
              <div className="space-y-1">
                <Label>Solicitante</Label>
                <Input name="solicitante" value={datos.solicitante} onChange={handleDatos} placeholder="Nombre del cliente" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Ubicación del inmueble</CardTitle></CardHeader>
            <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label>Nombre de vialidad <span className="text-red-500">*</span></Label>
                <Input name="calle" value={datos.calle} onChange={handleDatos} placeholder="Av. Reforma, Calle Morelos..." />
              </div>
              <div className="space-y-1">
                <Label>Número oficial</Label>
                <Input name="numero_oficial" value={datos.numero_oficial} onChange={handleDatos} placeholder="123, 4-B..." />
              </div>
              <div className="space-y-1">
                <Label>Fraccionamiento</Label>
                <Input name="fraccionamiento" value={datos.fraccionamiento} onChange={handleDatos} />
              </div>
              <div className="space-y-1">
                <Label>Colonia</Label>
                <Input name="colonia" value={datos.colonia} onChange={handleDatos} />
              </div>
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
                    setDatos(prev => ({
                      ...prev,
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
              <div className="space-y-1">
                <Label>Código postal</Label>
                <Input name="cp" value={datos.cp} onChange={handleDatos} maxLength={5} />
              </div>
              <div className="space-y-1">
                <Label>Clave INEGI municipio</Label>
                <Input name="municipio_clave_inegi" value={datos.municipio_clave_inegi} onChange={handleDatos} placeholder="001" maxLength={3} />
              </div>
              <div className="space-y-1">
                <Label>No. cuenta predial</Label>
                <Input name="num_cuenta_predial" value={datos.num_cuenta_predial} onChange={handleDatos} />
              </div>
              <div className="space-y-1">
                <Label>No. cuenta agua</Label>
                <Input name="num_cuenta_agua" value={datos.num_cuenta_agua} onChange={handleDatos} />
              </div>
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
            <Button onClick={handleContinuarDatos} disabled={guardando}>
              {guardando ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              Continuar
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* ── Paso: Entorno ─────────────────────────────────────────────────── */}
      {pasoId === 'entorno' && expedienteId && (
        <div className="space-y-3">
          <EntornoForm
            onGuardar={handleGuardarEntorno}
            guardando={guardando}
            latitud={datos.latitud}
            longitud={datos.longitud}
            submitLabel="Guardar y continuar"
          />
          <NavPaso onBack={retroceder} onOmitir={omitir} />
        </div>
      )}

      {/* ── Paso: Terreno ─────────────────────────────────────────────────── */}
      {pasoId === 'terreno' && expedienteId && (
        <div className="space-y-3">
          <CaracteristicasTerrenoForm
            onGuardar={handleGuardarTerreno}
            guardando={guardando}
            submitLabel="Guardar y continuar"
          />
          <NavPaso onBack={retroceder} onOmitir={omitir} />
        </div>
      )}

      {/* ── Paso: Construcciones ──────────────────────────────────────────── */}
      {pasoId === 'construccion' && expedienteId && (
        <div className="space-y-3">
          <DescripcionConstruccionForm
            onGuardar={handleGuardarConstruccion}
            guardando={guardando}
            submitLabel="Guardar y continuar"
          />
          <NavPaso onBack={retroceder} onOmitir={omitir} />
        </div>
      )}

      {/* ── Paso: Método Físico ───────────────────────────────────────────── */}
      {pasoId === 'fisico' && expedienteId && (
        <div className="space-y-3">
          <MetodoFisicoForm
            onGuardar={handleGuardarFisico}
            guardando={guardando}
            submitLabel="Guardar y continuar"
          />
          {esCompleto ? (
            <NavPaso onBack={retroceder} onOmitir={omitir} />
          ) : (
            <div className="text-center">
              <button
                type="button"
                onClick={omitir}
                className="text-xs text-gray-400 hover:text-gray-600 transition-colors"
              >
                Saltar — el expediente ya fue guardado con el Método Físico
              </button>
            </div>
          )}
        </div>
      )}

      {/* ── Paso: Comparativo ─────────────────────────────────────────────── */}
      {pasoId === 'comparativo' && expedienteId && (
        <div className="space-y-3">
          <MetodoComparativoForm
            onGuardar={handleGuardarComparativo}
            guardando={guardando}
            superficieInicial={superficieFisico}
          />
          <div className="flex items-center justify-between pt-1">
            {esCompleto ? (
              <button
                onClick={retroceder}
                className="text-sm text-gray-400 hover:text-gray-600 transition-colors"
              >
                ← Anterior
              </button>
            ) : <span />}
            <button
              onClick={omitir}
              className="text-xs text-gray-400 hover:text-gray-600 transition-colors"
            >
              Ver expediente sin completar comparativo
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
