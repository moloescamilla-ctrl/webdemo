import { useState, useEffect, useRef } from 'react'
import { useParams, Link, useLocation } from 'react-router-dom'
import { useExpediente } from '@/hooks/useExpediente'
import { useExpedientes } from '@/hooks/useExpedientes'
import { usePeritoPerfil } from '@/hooks/usePeritoPerfil'
import { MetodoFisicoForm } from '@/features/metodo-fisico/MetodoFisicoForm'
import { MetodoComparativoForm } from '@/features/metodo-comparativo/MetodoComparativoForm'
import { MetodoRentasForm } from '@/features/metodo-rentas/MetodoRentasForm'
import { MetodoResidualForm } from '@/features/metodo-residual/MetodoResidualForm'
import { CroquisUploader } from '@/features/croquis/CroquisUploader'
import { FotosUploader } from '@/features/fotos/FotosUploader'
import { PlanoUploader } from '@/features/fotos/PlanoUploader'
import { EntornoForm } from '@/features/entorno/EntornoForm'
import { CaracteristicasTerrenoForm } from '@/features/terreno/CaracteristicasTerrenoForm'
import { DescripcionConstruccionForm } from '@/features/construccion/DescripcionConstruccionForm'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { UbicacionMapaInput } from '@/components/ui/ubicacion-mapa-input'
import { ArrowLeft, CheckCircle2, Loader2, Sparkles, User, MapPin, Calculator } from 'lucide-react'

const TIPOS_INMUEBLE = [
  'Casa habitación', 'Departamento', 'Local comercial', 'Oficina',
  'Nave industrial', 'Terreno urbano', 'Terreno suburbano', 'Terreno rural', 'Bodega', 'Mixto', 'Otro',
]

const MUNICIPIOS_VER = [
  [1,'Acajete'],[2,'Acatlán'],[3,'Acayucan'],[4,'Actopan'],[5,'Acula'],[6,'Acultzingo'],
  [7,'Camarón de Tejeda'],[8,'Alpatláhuac'],[9,'Alto Lucero de Gutiérrez Barrios'],[10,'Altotonga'],
  [11,'Alvarado'],[12,'Amatitlán'],[13,'Naranjos Amatlán'],[14,'Amatlán de los Reyes'],
  [15,'Ángel R. Cabada'],[16,'La Antigua'],[17,'Apazapan'],[18,'Aquila'],[19,'Astacinga'],
  [20,'Atlahuilco'],[21,'Atoyac'],[22,'Atzacan'],[23,'Atzalan'],[24,'Tlaltetela'],
  [25,'Ayahualulco'],[26,'Banderilla'],[27,'Benito Juárez'],[28,'Boca del Río'],[29,'Calcahualco'],
  [30,'Camerino Z. Mendoza'],[31,'Carrillo Puerto'],[32,'Catemaco'],[33,'Cazones de Herrera'],
  [34,'Cerro Azul'],[35,'Citlaltépetl'],[36,'Coacoatzintla'],[37,'Coahuitlán'],[38,'Coatepec'],
  [39,'Coatzacoalcos'],[40,'Coatzintla'],[41,'Coetzala'],[42,'Colipa'],[43,'Comapa'],
  [44,'Córdoba'],[45,'Cosamaloapan de Carpio'],[46,'Cosautlán de Carvajal'],[47,'Coscomatepec'],
  [48,'Cosoleacaque'],[49,'Cotaxtla'],[50,'Coxquihui'],[51,'Coyutla'],[52,'Cuichapa'],
  [53,'Cuitláhuac'],[54,'Chacaltianguis'],[55,'Chalma'],[56,'Chiconamel'],[57,'Chiconquiaco'],
  [58,'Chicontepec'],[59,'Chinameca'],[60,'Chinampa de Gorostiza'],[61,'Las Choapas'],
  [62,'Chocamán'],[63,'Chontla'],[64,'Chumatlán'],[65,'Emiliano Zapata'],[66,'Espinal'],
  [67,'Filomeno Mata'],[68,'Fortín'],[69,'Gutiérrez Zamora'],[70,'Hidalgotitlán'],
  [71,'Huatusco'],[72,'Huayacocotla'],[73,'Hueyapan de Ocampo'],[74,'Huiloapan de Cuauhtémoc'],
  [75,'Ignacio de la Llave'],[76,'Ilamatlán'],[77,'Isla'],[78,'Ixcatepec'],
  [79,'Ixhuacán de los Reyes'],[80,'Ixhuatlán del Café'],[81,'Ixhuatlancillo'],
  [82,'Ixhuatlán del Sureste'],[83,'Ixhuatlán de Madero'],[84,'Ixmatlahuacan'],
  [85,'Ixtaczoquitlán'],[86,'Jalacingo'],[87,'Xalapa'],[88,'Jalcomulco'],[89,'Jáltipan'],
  [90,'Jamapa'],[91,'Jesús Carranza'],[92,'Xico'],[93,'Jilotepec'],[94,'Juan Rodríguez Clara'],
  [95,'Juchique de Ferrer'],[96,'Landero y Coss'],[97,'Lerdo de Tejada'],[98,'Magdalena'],
  [99,'Maltrata'],[100,'Manlio Fabio Altamirano'],[101,'Mariano Escobedo'],
  [102,'Martínez de la Torre'],[103,'Mecatlán'],[104,'Mecayapan'],[105,'Medellín de Bravo'],
  [106,'Miahuatlán'],[107,'Las Minas'],[108,'Minatitlán'],[109,'Misantla'],
  [110,'Mixtla de Altamirano'],[111,'Moloacán'],[112,'Naolinco'],[113,'Naranjal'],[114,'Nautla'],
  [115,'Nogales'],[116,'Oluta'],[117,'Omealca'],[118,'Orizaba'],[119,'Otatitlán'],[120,'Oteapan'],
  [121,'Ozuluama de Mascareñas'],[122,'Pajapan'],[123,'Pánuco'],[124,'Papantla'],
  [125,'Paso del Macho'],[126,'Paso de Ovejas'],[127,'La Perla'],[128,'Perote'],
  [129,'Platón Sánchez'],[130,'Playa Vicente'],[131,'Poza Rica de Hidalgo'],
  [132,'Las Vigas de Ramírez'],[133,'Pueblo Viejo'],[134,'Puente Nacional'],
  [135,'Rafael Delgado'],[136,'Rafael Lucio'],[137,'Los Reyes'],[138,'Río Blanco'],
  [139,'Saltabarranca'],[140,'San Andrés Tenejapan'],[141,'San Andrés Tuxtla'],
  [142,'San Juan Evangelista'],[143,'Santiago Tuxtla'],[144,'Sayula de Alemán'],
  [145,'Soconusco'],[146,'Sochiapa'],[147,'Soledad Atzompa'],[148,'Soledad de Doblado'],
  [149,'Soteapan'],[150,'Tamalín'],[151,'Tamiahua'],[152,'Tampico Alto'],[153,'Tancoco'],
  [154,'Tantima'],[155,'Tantoyuca'],[156,'Tatatila'],[157,'Castillo de Teayo'],
  [158,'Tecolutla'],[159,'Tehuipango'],[160,'Álamo Temapache'],[161,'Tempoal'],
  [162,'Tenampa'],[163,'Tenochtitlán'],[164,'Teocelo'],[165,'Tepatlaxco'],[166,'Tepetlán'],
  [167,'Tepetzintla'],[168,'Tequila'],[169,'José Azueta'],[170,'Texcatepec'],
  [171,'Texhuacán'],[172,'Texistepec'],[173,'Tezonapa'],[174,'Tierra Blanca'],
  [175,'Tihuatlán'],[176,'Tlacojalpan'],[177,'Tlacolulan'],[178,'Tlacotalpan'],
  [179,'Tlacotepec de Mejía'],[180,'Tlachichilco'],[181,'Tlalixcoyan'],[182,'Tlalnelhuayocan'],
  [183,'Tlapacoyan'],[184,'Tlaquilpa'],[185,'Tlilapan'],[186,'Tomatlán'],[187,'Tonayán'],
  [188,'Totutla'],[189,'Tuxpan'],[190,'Tuxtilla'],[191,'Ursulo Galván'],
  [192,'Vega de Alatorre'],[193,'Veracruz'],[194,'Villa Aldama'],[195,'Xoxocotla'],
  [196,'Yanga'],[197,'Yecuatla'],[198,'Zacualpan'],[199,'Zaragoza'],[200,'Zentla'],
  [201,'Zongolica'],[202,'Zontecomatlán de López y Fuentes'],[203,'Zozocolco de Hidalgo'],
  [204,'Agua Dulce'],[205,'El Higo'],[206,'Nanchital de Lázaro Cárdenas del Río'],
  [207,'Tres Valles'],[208,'Carlos A. Carrillo'],[209,'Tatahuicapan de Juárez'],
  [210,'Uxpanapa'],[211,'San Rafael'],[212,'Santiago Sochiapan'],
]

const TIPOS_PREDIO = ['URBANO', 'SUBURBANO', 'RURAL']
const TIPOS_SUELO  = ['TEMPORAL', 'RIEGO', 'HUMEDAD', 'ÁRIDO', 'PANTANOSO']

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
  { id: 'rentas',       label: 'Rentas' },
  { id: 'residual',     label: 'Residual' },
  { id: 'comparativo',  label: 'Comparativo' },
  { id: 'fotos',        label: 'Fotos' },
]

export function EditarExpedientePage() {
  const { id } = useParams()
  const location = useLocation()
  const navState = location.state ?? {}
  const {
    expediente, entorno, terreno, descripcionConstruccion,
    metodoFisico, inspeccion, metodoComparativo, metodoRentas, metodoResidual,
    loading, error,
  } = useExpediente(id)
  const {
    actualizarExpediente,
    guardarEntorno, guardarTerreno,
    guardarDescripcionConstruccion,
    guardarMetodoFisico, guardarMetodoComparativo, guardarMetodoRentas, guardarMetodoResidual,
    guardarParcialesFisico,
  } = useExpedientes()
  const { perfil, guardarPerfil } = usePeritoPerfil()

  const [tab, setTab] = useState(navState.tab ?? 'datos')
  const [guardando, setGuardando] = useState(false)
  const pendingConstruccionRef = useRef(null)
  const pendingFisicoRef = useRef(null)

  useEffect(() => {
    if (expediente?.tipo_expediente === 'calculo_rapido' && !['datos', 'fisico'].includes(tab)) {
      setTab('datos')
    }
  }, [expediente?.tipo_expediente])

  // Pre-llenar campos del perito desde el perfil de Supabase si el expediente no tiene datos propios
  // Necesita !expediente porque fromExpediente() se define después del early-return de loading;
  // expediente?.id en deps hace que el efecto se re-ejecute cuando el expediente llega.
  useEffect(() => {
    if (!perfil || !expediente) return
    setDatos(prev => {
      const base = prev ?? fromExpediente()
      return {
        ...base,
        nombre_perito: base.nombre_perito || perfil.nombre || '',
        cedula_perito: base.cedula_perito || perfil.cedula || '',
      }
    })
  }, [perfil?.nombre, perfil?.cedula, expediente?.id])
  const [okTab, setOkTab] = useState(null)
  const [errorMsg, setErrorMsg] = useState(null)
  const [datos, setDatos] = useState(null)
  const [croquisUrl, setCroquisUrl] = useState(undefined)
  const [planoUrl, setPlanoUrl] = useState(undefined)

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
      tipo_predio: expediente.tipo_predio || 'URBANO',
      tipo_suelo: expediente.tipo_suelo || '',
      uso: expediente.uso || 'Habitacional',
      proposito_avaluo: expediente.proposito_avaluo || '',
      nombre_propietario: expediente.nombre_propietario || '',
      solicitante: expediente.solicitante || '',
      fecha_inspeccion: expediente.fecha_inspeccion || '',
      nombre_perito: expediente.nombre_perito || '',
      clave_perito: expediente.clave_perito || '',
      cedula_perito: expediente.cedula_perito || '',
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
        tipo_suelo: d.tipo_suelo || null,
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

  const handleCambiarTab = async (nextTab) => {
    if (tab === 'construccion' && nextTab !== 'construccion' && pendingConstruccionRef.current) {
      try { await guardarDescripcionConstruccion(id, pendingConstruccionRef.current) }
      catch { /* silencioso */ }
      pendingConstruccionRef.current = null
    }
    if (tab === 'fisico' && nextTab !== 'fisico' && pendingFisicoRef.current) {
      try { await guardarParcialesFisico(id, pendingFisicoRef.current) }
      catch { /* silencioso */ }
      pendingFisicoRef.current = null
    }
    setTab(nextTab)
    setErrorMsg(null)
  }

  const handleGuardarFisico = async (resultado, inspeccionData, inputs, factorData) => {
    setGuardando(true); setErrorMsg(null)
    try { await guardarMetodoFisico(id, inspeccionData, resultado, inputs, factorData); flashOk('fisico') }
    catch (e) { setErrorMsg(e.message) }
    finally { setGuardando(false) }
  }

  const handleGuardarRentas = async (datos) => {
    setGuardando(true); setErrorMsg(null)
    try { await guardarMetodoRentas(id, datos); flashOk('rentas') }
    catch (e) { setErrorMsg(e.message) }
    finally { setGuardando(false) }
  }

  const handleGuardarResidual = async (datos) => {
    setGuardando(true); setErrorMsg(null)
    try { await guardarMetodoResidual(id, datos); flashOk('residual') }
    catch (e) { setErrorMsg(e.message) }
    finally { setGuardando(false) }
  }

  const handleGuardarComparativo = async (resultado, superficieSujeto) => {
    setGuardando(true); setErrorMsg(null)
    try { await guardarMetodoComparativo(id, resultado, superficieSujeto); flashOk('comparativo') }
    catch (e) { setErrorMsg(e.message) }
    finally { setGuardando(false) }
  }

  const fisicoInitial = {
    tieneConstruccion: metodoFisico ? metodoFisico.superficie_construccion !== 0 : true,
    inputs: {
      superficieConstruccion:     String(metodoFisico?.superficie_construccion || terreno?.sup_total_const_m2 || ''),
      superficieTerreno:          String(metodoFisico?.superficie_terreno      || terreno?.superficie_m2       || ''),
      costoReposicionM2:          String(metodoFisico?.costo_reposicion_m2     || ''),
      costoReposicionAccesoriaM2: '',
      valorUnitarioTerreno:       String(metodoFisico?.valor_unitario_terreno  || ''),
      edadAnios:                  String(metodoFisico?.edad_anios              || ''),
      vidaUtilAnios:              String(metodoFisico?.vida_util_anios         || '60'),
      valorResidual:              String(metodoFisico?.valor_residual_pct      || '15'),
    },
    estadosRaw: inspeccion,
    comparablesTerreno: metodoFisico?.comparables_terreno ?? null,
    partidasConstruccion: metodoFisico?.partidas_construccion ?? [],
    edadPonderadaState: metodoFisico?.partidas_edad_ponderada ?? null,
    factorData: metodoFisico?.factor_comercializacion ? {
      activo:        true,
      factor:        String(metodoFisico.factor_comercializacion),
      segmento:      metodoFisico.factor_comercializacion_segmento || '',
      justificacion: metodoFisico.factor_comercializacion_justificacion || '',
    } : null,
  }

  const rentasInitial = metodoRentas ?? null

  const residualInitial = metodoResidual ?? null

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

      {expediente.tipo_expediente === 'calculo_rapido' && (
        <div className="mb-4 flex items-center gap-2 px-3 py-2 bg-purple-50 border border-purple-200 rounded-lg text-sm text-purple-700">
          <Calculator className="h-4 w-4 shrink-0" />
          <span>Cálculo rápido — datos generales y método físico</span>
        </div>
      )}

      <div className="overflow-x-auto mb-6">
        <div className="flex gap-1 bg-gray-100 rounded-lg p-1 w-fit min-w-full sm:min-w-0">
          {(expediente.tipo_expediente === 'calculo_rapido'
            ? TABS.filter(t => ['datos', 'fisico'].includes(t.id))
            : TABS
          ).map(t => (
            <button
              key={t.id}
              onClick={() => handleCambiarTab(t.id)}
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
                <Label>Tipo de predio</Label>
                <Select name="tipo_predio" value={d.tipo_predio} onChange={handleDatos}>
                  {TIPOS_PREDIO.map(t => <option key={t}>{t}</option>)}
                </Select>
              </div>
              <div className="space-y-1">
                <Label>Uso</Label>
                <Select name="uso" value={d.uso} onChange={handleDatos}>
                  <option>Habitacional</option>
                  <option>Comercial</option>
                  <option>Industrial</option>
                  <option>Mixto</option>
                  <option>Agropecuario</option>
                </Select>
              </div>
              {(d.tipo_predio === 'RURAL' || d.tipo_predio === 'SUBURBANO') && (
                <div className="space-y-1">
                  <Label>Tipo de suelo</Label>
                  <Select name="tipo_suelo" value={d.tipo_suelo} onChange={handleDatos}>
                    <option value="">— Seleccionar —</option>
                    {TIPOS_SUELO.map(t => <option key={t}>{t}</option>)}
                  </Select>
                </div>
              )}
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
              <div className="space-y-1 sm:col-span-2">
                <Label>Municipio</Label>
                <Select
                  value={d.municipio_clave_inegi ? `${d.municipio_clave_inegi}|${d.municipio}` : ''}
                  onChange={e => {
                    const [clave, ...rest] = e.target.value.split('|')
                    const nombre = rest.join('|')
                    setDatos(prev => ({ ...prev, municipio: nombre, municipio_clave_inegi: clave }))
                  }}
                >
                  <option value="">— Selecciona municipio —</option>
                  {MUNICIPIOS_VER.map(([clave, nombre]) => (
                    <option key={clave} value={`${String(clave).padStart(3,'0')}|${nombre}`}>
                      {String(clave).padStart(3,'0')} — {nombre}
                    </option>
                  ))}
                </Select>
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
              <div className="space-y-1"><Label>Manzana</Label><Input name="manzana" value={d.manzana || ''} onChange={handleDatos} placeholder="Mza. 5" /></div>
              <div className="space-y-1"><Label>Lote</Label><Input name="lote" value={d.lote || ''} onChange={handleDatos} placeholder="Lote 12" /></div>
              <div className="space-y-1"><Label>No. cuenta predial</Label><Input name="num_cuenta_predial" value={d.num_cuenta_predial} onChange={handleDatos} /></div>
              <div className="space-y-1"><Label>No. cuenta agua</Label><Input name="num_cuenta_agua" value={d.num_cuenta_agua} onChange={handleDatos} /></div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Georreferencia del predio</CardTitle></CardHeader>
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
                <MapPin className="h-4 w-4 text-gray-500" />
                <CardTitle>Croquis de localización</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <CroquisUploader
                expedienteId={id}
                currentUrl={croquisUrl !== undefined ? croquisUrl : (expediente.croquis_url ?? null)}
                onSaved={setCroquisUrl}
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
                  onClick={() => guardarPerfil({ nombre: d.nombre_perito, cedula: d.cedula_perito })}
                  className="text-xs text-blue-600 hover:text-blue-800 border border-blue-200 rounded px-3 py-1.5 hover:bg-blue-50 transition-colors"
                >
                  Guardar en perfil — se usará en futuros expedientes
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
          latitud={d.latitud ?? null}
          longitud={d.longitud ?? null}
          vialidadDelExpediente={d.calle ?? ''}
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
          onChange={(payload) => { pendingConstruccionRef.current = payload }}
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
          latitud={d.latitud}
          longitud={d.longitud}
          onParcialesChange={(parciales) => { pendingFisicoRef.current = parciales }}
        />
      )}

      {tab === 'rentas' && (
        <MetodoRentasForm
          key={metodoRentas?.id ?? 'rentas-nuevo'}
          onGuardar={handleGuardarRentas}
          guardando={guardando}
          submitLabel={okTab === 'rentas' ? '✓ Guardado' : (metodoRentas ? 'Actualizar Método Rentas' : 'Guardar Método Rentas')}
          initialValues={rentasInitial}
        />
      )}

      {tab === 'residual' && (
        <MetodoResidualForm
          key={metodoResidual?.id ?? 'residual-nuevo'}
          onGuardar={handleGuardarResidual}
          guardando={guardando}
          submitLabel={okTab === 'residual' ? '✓ Guardado' : (metodoResidual ? 'Actualizar Método Residual' : 'Guardar Método Residual')}
          initialValues={residualInitial}
          superficieTerrenoDefecto={terreno?.superficie_m2 ?? null}
          superficieProyectoDefecto={metodoFisico?.superficie_construccion || terreno?.sup_total_const_m2 || null}
          costoM2Defecto={metodoFisico?.costo_reposicion_m2 ?? null}
          vmSugerido={metodoComparativo?.valor_comparativo_total ?? null}
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
            datosSujeto={{
              supTerreno: String(metodoFisico?.superficie_terreno || terreno?.superficie_m2 || ''),
              supConstruccion: String(metodoFisico?.superficie_construccion || terreno?.sup_total_const_m2 || ''),
              edad: String(metodoFisico?.edad_anios || ''),
              direccion: [expediente.calle, expediente.colonia].filter(Boolean).join(', '),
            }}
          />
        </div>
      )}
      {tab === 'fotos' && (
        <div className="space-y-6">
          <Card>
            <CardHeader><CardTitle>Fotos del inmueble</CardTitle></CardHeader>
            <CardContent>
              <FotosUploader expedienteId={id} />
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Croquis / plano de la propiedad</CardTitle>
            </CardHeader>
            <CardContent>
              <PlanoUploader
                expedienteId={id}
                currentUrl={planoUrl !== undefined ? planoUrl : (expediente?.plano_url ?? null)}
                onSaved={setPlanoUrl}
              />
            </CardContent>
          </Card>
        </div>
      )}

    </div>
  )
}
