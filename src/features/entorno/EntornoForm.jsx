import { useState } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Loader2, DatabaseZap } from 'lucide-react'
import { supabase } from '@/lib/supabase'

const defaultDatos = {
  agua_potable: false, drenaje_alcantarillado: false, energia_electrica: false,
  alumbrado_publico: false, telefonia: false, internet: false,
  gas_natural: false, recoleccion_basura: false,
  pavimentacion: '', banquetas: false, guarniciones: false,
  tipo_vialidad: '', nombre_vialidad: '', ancho_vialidad_m: '',
  uso_predominante_zona: '', nivel_socioeconomico: '', densidad_construccion: '',
  tipo_construccion_predominante: '', contaminacion_ambiental: '', vias_acceso: '', referencia_proximidad: '',
  dist_escuelas_m: '', dist_hospitales_m: '', dist_bancos_m: '',
  dist_comercios_m: '', dist_iglesias_m: '',
  dist_transporte_m: '', dist_parque_m: '',
  distancias_fuente: 'manual', distancias_fecha_denue: null,
  observaciones_entorno: '',
}

const DENUE_KEYS = ['dist_escuelas_m', 'dist_hospitales_m', 'dist_bancos_m', 'dist_comercios_m', 'dist_iglesias_m']

function fromDB(row) {
  if (!row) return defaultDatos
  return {
    agua_potable:           row.agua_potable ?? false,
    drenaje_alcantarillado: row.drenaje_alcantarillado ?? false,
    energia_electrica:      row.energia_electrica ?? false,
    alumbrado_publico:      row.alumbrado_publico ?? false,
    telefonia:              row.telefonia ?? false,
    internet:               row.internet ?? false,
    gas_natural:            row.gas_natural ?? false,
    recoleccion_basura:     row.recoleccion_basura ?? false,
    pavimentacion:          row.pavimentacion || '',
    banquetas:              row.banquetas ?? false,
    guarniciones:           row.guarniciones ?? false,
    tipo_vialidad:          row.tipo_vialidad || '',
    nombre_vialidad:        row.nombre_vialidad || '',
    ancho_vialidad_m:       row.ancho_vialidad_m != null ? String(row.ancho_vialidad_m) : '',
    uso_predominante_zona:  row.uso_predominante_zona || '',
    nivel_socioeconomico:   row.nivel_socioeconomico || '',
    densidad_construccion:  row.densidad_construccion || '',
    tipo_construccion_predominante: row.tipo_construccion_predominante || '',
    contaminacion_ambiental:        row.contaminacion_ambiental || '',
    vias_acceso:                    row.vias_acceso || '',
    referencia_proximidad:          row.referencia_proximidad || '',
    dist_escuelas_m:        row.dist_escuelas_m != null ? String(row.dist_escuelas_m) : '',
    dist_hospitales_m:      row.dist_hospitales_m != null ? String(row.dist_hospitales_m) : '',
    dist_bancos_m:          row.dist_bancos_m != null ? String(row.dist_bancos_m) : '',
    dist_comercios_m:       row.dist_comercios_m != null ? String(row.dist_comercios_m) : '',
    dist_iglesias_m:        row.dist_iglesias_m != null ? String(row.dist_iglesias_m) : '',
    dist_transporte_m:      row.dist_transporte_m != null ? String(row.dist_transporte_m) : '',
    dist_parque_m:          row.dist_parque_m != null ? String(row.dist_parque_m) : '',
    distancias_fuente:      row.distancias_fuente || 'manual',
    distancias_fecha_denue: row.distancias_fecha_denue || null,
    observaciones_entorno:  row.observaciones_entorno || '',
  }
}

const SERVICIOS = [
  { key: 'agua_potable',           label: 'Agua potable' },
  { key: 'drenaje_alcantarillado', label: 'Drenaje / alcantarillado' },
  { key: 'energia_electrica',      label: 'Energía eléctrica' },
  { key: 'alumbrado_publico',      label: 'Alumbrado público' },
  { key: 'telefonia',              label: 'Telefonía' },
  { key: 'internet',               label: 'Internet' },
  { key: 'gas_natural',            label: 'Gas natural' },
  { key: 'recoleccion_basura',     label: 'Recolección de basura' },
]

function Checkbox({ name, label, checked, onChange }) {
  return (
    <label className="flex items-center gap-2 cursor-pointer select-none">
      <input type="checkbox" name={name} checked={checked} onChange={onChange}
        className="h-4 w-4 rounded border-gray-300 accent-blue-600" />
      <span className="text-sm text-gray-700">{label}</span>
    </label>
  )
}

function Campo({ label, name, value, onChange, type = 'text', suffix, denue, children }) {
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between gap-1">
        <Label htmlFor={name}>{label}</Label>
        {denue && (
          <span className="text-[10px] font-medium text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded leading-none">
            DENUE
          </span>
        )}
      </div>
      {children ?? (
        <div className="relative">
          <Input id={name} name={name} value={value} onChange={onChange} type={type}
            className={`${suffix ? 'pr-12' : ''} ${denue ? 'border-blue-200 bg-blue-50/40' : ''}`} />
          {suffix && (
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 pointer-events-none">
              {suffix}
            </span>
          )}
        </div>
      )}
    </div>
  )
}

export function EntornoForm({
  initialValues = null,
  latitud = null,
  longitud = null,
  onGuardar,
  guardando,
  submitLabel = 'Guardar entorno',
}) {
  const [datos, setDatos] = useState(() => fromDB(initialValues))
  const [cargandoDenue, setCargandoDenue] = useState(false)
  const [errorDenue, setErrorDenue] = useState(null)
  const [denueKeys, setDenueKeys] = useState(() =>
    initialValues?.distancias_fuente === 'denue' ? new Set(DENUE_KEYS) : new Set()
  )

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setDatos(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }))
    if (denueKeys.has(name)) {
      setDenueKeys(prev => { const s = new Set(prev); s.delete(name); return s })
    }
  }

  const cargarDistanciasDenue = async () => {
    if (!latitud || !longitud) return
    setCargandoDenue(true)
    setErrorDenue(null)
    try {
      const { data, error } = await supabase.rpc('distancias_entorno', {
        p_lat: latitud, p_lng: longitud, p_radio: 2000,
      })
      if (error) throw new Error(error.message)
      if (!data) throw new Error('No se encontraron establecimientos en el radio de 2 km')

      const updates = {}
      if (data.escuelas)   updates.dist_escuelas_m   = String(data.escuelas.distancia_m)
      if (data.hospitales) updates.dist_hospitales_m = String(data.hospitales.distancia_m)
      if (data.bancos)     updates.dist_bancos_m     = String(data.bancos.distancia_m)
      if (data.comercios)  updates.dist_comercios_m  = String(data.comercios.distancia_m)
      if (data.iglesias)   updates.dist_iglesias_m   = String(data.iglesias.distancia_m)

      if (Object.keys(updates).length === 0)
        throw new Error('No se encontraron establecimientos cercanos en el DENUE')

      setDatos(prev => ({
        ...prev, ...updates,
        distancias_fuente: 'denue',
        distancias_fecha_denue: new Date().toISOString().slice(0, 10),
      }))
      setDenueKeys(new Set(Object.keys(updates)))
    } catch (e) { setErrorDenue(e.message) }
    finally { setCargandoDenue(false) }
  }

  const handleGuardar = () => {
    if (!onGuardar) return
    onGuardar({
      ...datos,
      ancho_vialidad_m:  datos.ancho_vialidad_m  ? parseFloat(datos.ancho_vialidad_m)  : null,
      dist_escuelas_m:   datos.dist_escuelas_m   ? parseInt(datos.dist_escuelas_m)   : null,
      dist_hospitales_m: datos.dist_hospitales_m ? parseInt(datos.dist_hospitales_m) : null,
      dist_bancos_m:     datos.dist_bancos_m     ? parseInt(datos.dist_bancos_m)     : null,
      dist_comercios_m:  datos.dist_comercios_m  ? parseInt(datos.dist_comercios_m)  : null,
      dist_iglesias_m:   datos.dist_iglesias_m   ? parseInt(datos.dist_iglesias_m)   : null,
      dist_transporte_m: datos.dist_transporte_m ? parseInt(datos.dist_transporte_m) : null,
      dist_parque_m:     datos.dist_parque_m     ? parseInt(datos.dist_parque_m)     : null,
    })
  }

  const tieneCoordenadas = latitud != null && longitud != null
  const fuenteDenue = datos.distancias_fuente === 'denue' && datos.distancias_fecha_denue

  return (
    <div className="space-y-5">

      <Card>
        <CardHeader><CardTitle>Servicios municipales</CardTitle></CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {SERVICIOS.map(s => (
              <Checkbox key={s.key} name={s.key} label={s.label} checked={datos[s.key]} onChange={handleChange} />
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Infraestructura vial</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Campo label="Pavimentación" name="pavimentacion" value={datos.pavimentacion} onChange={handleChange}>
              <Select name="pavimentacion" value={datos.pavimentacion} onChange={handleChange}>
                <option value="">— Seleccionar —</option>
                <option value="asfalto">Asfalto</option>
                <option value="concreto">Concreto</option>
                <option value="empedrado">Empedrado</option>
                <option value="terraceria">Terracería</option>
                <option value="ninguna">Sin pavimentar</option>
              </Select>
            </Campo>
            <div className="flex items-end gap-6 pb-1">
              <Checkbox name="banquetas"    label="Banquetas"    checked={datos.banquetas}    onChange={handleChange} />
              <Checkbox name="guarniciones" label="Guarniciones" checked={datos.guarniciones} onChange={handleChange} />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 border-t border-gray-100">
            <Campo label="Tipo de vialidad del frente" name="tipo_vialidad" value={datos.tipo_vialidad} onChange={handleChange}>
              <Select name="tipo_vialidad" value={datos.tipo_vialidad} onChange={handleChange}>
                <option value="">— Seleccionar —</option>
                <option value="local">Local</option>
                <option value="colectora">Colectora</option>
                <option value="primaria">Primaria</option>
                <option value="autopista">Autopista / vía rápida</option>
              </Select>
            </Campo>
            <Campo label="Nombre de la vialidad" name="nombre_vialidad" value={datos.nombre_vialidad} onChange={handleChange} />
            <Campo label="Ancho de vialidad" name="ancho_vialidad_m" value={datos.ancho_vialidad_m} onChange={handleChange} type="number" suffix="m" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Clasificación del entorno</CardTitle></CardHeader>
        <CardContent className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Campo label="Uso predominante de la zona" name="uso_predominante_zona" value={datos.uso_predominante_zona} onChange={handleChange}>
            <Select name="uso_predominante_zona" value={datos.uso_predominante_zona} onChange={handleChange}>
              <option value="">— Seleccionar —</option>
              <option value="habitacional">Habitacional</option>
              <option value="comercial">Comercial</option>
              <option value="industrial">Industrial</option>
              <option value="mixto">Mixto</option>
              <option value="equipamiento">Equipamiento urbano</option>
            </Select>
          </Campo>
          <Campo label="Nivel socioeconómico" name="nivel_socioeconomico" value={datos.nivel_socioeconomico} onChange={handleChange}>
            <Select name="nivel_socioeconomico" value={datos.nivel_socioeconomico} onChange={handleChange}>
              <option value="">— Seleccionar —</option>
              <option value="popular">Popular</option>
              <option value="medio">Medio</option>
              <option value="residencial">Residencial</option>
              <option value="residencial_plus">Residencial Plus</option>
            </Select>
          </Campo>
          <Campo label="Densidad de construcción" name="densidad_construccion" value={datos.densidad_construccion} onChange={handleChange}>
            <Select name="densidad_construccion" value={datos.densidad_construccion} onChange={handleChange}>
              <option value="">— Seleccionar —</option>
              <option value="baja">Baja</option>
              <option value="media">Media</option>
              <option value="alta">Alta</option>
            </Select>
          </Campo>
          <Campo label="Tipo de construcción predominante" name="tipo_construccion_predominante" value={datos.tipo_construccion_predominante} onChange={handleChange}>
            <Select name="tipo_construccion_predominante" value={datos.tipo_construccion_predominante} onChange={handleChange}>
              <option value="">— Seleccionar —</option>
              <option value="concreto_losa">Concreto / losa</option>
              <option value="tabique_losa">Tabique y losa</option>
              <option value="adobe">Adobe</option>
              <option value="madera">Madera</option>
              <option value="lamina_metalica">Lámina metálica</option>
              <option value="mixto">Mixto</option>
            </Select>
          </Campo>
          <Campo label="Contaminación ambiental" name="contaminacion_ambiental" value={datos.contaminacion_ambiental} onChange={handleChange}>
            <Select name="contaminacion_ambiental" value={datos.contaminacion_ambiental} onChange={handleChange}>
              <option value="">— Seleccionar —</option>
              <option value="ninguna">Sin contaminación</option>
              <option value="ruido">Ruido</option>
              <option value="visual">Visual</option>
              <option value="quimica">Química / industrial</option>
              <option value="mixta">Mixta</option>
            </Select>
          </Campo>
          <Campo label="Vías de acceso" name="vias_acceso" value={datos.vias_acceso} onChange={handleChange}>
            <Select name="vias_acceso" value={datos.vias_acceso} onChange={handleChange}>
              <option value="">— Seleccionar —</option>
              <option value="excelentes">Excelentes</option>
              <option value="buenas">Buenas</option>
              <option value="regulares">Regulares</option>
              <option value="deficientes">Deficientes</option>
            </Select>
          </Campo>
          <Campo label="Referencia de proximidad" name="referencia_proximidad" value={datos.referencia_proximidad} onChange={handleChange}>
            <Select name="referencia_proximidad" value={datos.referencia_proximidad} onChange={handleChange}>
              <option value="">— Seleccionar —</option>
              <option value="centrica">Céntrica</option>
              <option value="intermedia">Intermedia</option>
              <option value="periferica">Periférica</option>
              <option value="expansion">De expansión</option>
              <option value="rural">Rural</option>
            </Select>
          </Campo>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-start justify-between gap-4">
            <div>
              <CardTitle>Distancias a equipamiento urbano</CardTitle>
              {fuenteDenue && (
                <p className="text-xs text-blue-600 mt-1">
                  Datos DENUE INEGI — consultados el {datos.distancias_fecha_denue}.
                  Campos con etiqueta <span className="font-semibold">DENUE</span> se llenaron automáticamente; puedes editarlos.
                </p>
              )}
            </div>
            {tieneCoordenadas && (
              <button
                type="button"
                onClick={cargarDistanciasDenue}
                disabled={cargandoDenue}
                className="flex items-center gap-1.5 text-xs font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 px-3 py-1.5 rounded-md transition-colors disabled:opacity-50 whitespace-nowrap flex-shrink-0"
              >
                {cargandoDenue ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <DatabaseZap className="h-3.5 w-3.5" />}
                {cargandoDenue ? 'Consultando…' : 'Cargar desde DENUE'}
              </button>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {errorDenue && (
            <div className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-md px-3 py-2">{errorDenue}</div>
          )}
          {!tieneCoordenadas && (
            <p className="text-xs text-gray-400 italic">
              Registra la georreferencia del predio (tab Datos) para habilitar la carga automática desde DENUE.
            </p>
          )}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            <Campo label="Escuela más cercana"   name="dist_escuelas_m"   value={datos.dist_escuelas_m}   onChange={handleChange} type="number" suffix="m" denue={denueKeys.has('dist_escuelas_m')} />
            <Campo label="Hospital / clínica"    name="dist_hospitales_m" value={datos.dist_hospitales_m} onChange={handleChange} type="number" suffix="m" denue={denueKeys.has('dist_hospitales_m')} />
            <Campo label="Banco / cajero"        name="dist_bancos_m"     value={datos.dist_bancos_m}     onChange={handleChange} type="number" suffix="m" denue={denueKeys.has('dist_bancos_m')} />
            <Campo label="Comercio / tienda"     name="dist_comercios_m"  value={datos.dist_comercios_m}  onChange={handleChange} type="number" suffix="m" denue={denueKeys.has('dist_comercios_m')} />
            <Campo label="Iglesia / templo"      name="dist_iglesias_m"   value={datos.dist_iglesias_m}   onChange={handleChange} type="number" suffix="m" denue={denueKeys.has('dist_iglesias_m')} />
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-2 border-t border-gray-100">
            <Campo label="Transporte público" name="dist_transporte_m" value={datos.dist_transporte_m} onChange={handleChange} type="number" suffix="m" />
            <Campo label="Parque / área verde"  name="dist_parque_m"   value={datos.dist_parque_m}     onChange={handleChange} type="number" suffix="m" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Observaciones del entorno</CardTitle></CardHeader>
        <CardContent>
          <textarea
            name="observaciones_entorno"
            value={datos.observaciones_entorno}
            onChange={handleChange}
            rows={3}
            placeholder="Descripción libre del entorno, características especiales, restricciones, etc."
            className="w-full text-sm border border-gray-200 rounded-md px-3 py-2 focus:outline-none focus:border-blue-400 resize-none"
          />
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={handleGuardar} disabled={guardando}>
          {guardando ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
          {submitLabel}
        </Button>
      </div>
    </div>
  )
}
