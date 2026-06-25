import { useState } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Loader2 } from 'lucide-react'

const defaultDatos = {
  // Servicios
  agua_potable: false,
  drenaje_alcantarillado: false,
  energia_electrica: false,
  alumbrado_publico: false,
  telefonia: false,
  internet: false,
  gas_natural: false,
  recoleccion_basura: false,
  // Infraestructura vial
  pavimentacion: '',
  banquetas: false,
  guarniciones: false,
  tipo_vialidad: '',
  nombre_vialidad: '',
  ancho_vialidad_m: '',
  // Entorno
  uso_predominante_zona: '',
  nivel_socioeconomico: '',
  densidad_construccion: '',
  // Distancias
  dist_escuela_m: '',
  dist_hospital_m: '',
  dist_mercado_m: '',
  dist_transporte_m: '',
  dist_parque_m: '',
  // Libre
  observaciones_entorno: '',
}

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
    dist_escuela_m:         row.dist_escuela_m != null ? String(row.dist_escuela_m) : '',
    dist_hospital_m:        row.dist_hospital_m != null ? String(row.dist_hospital_m) : '',
    dist_mercado_m:         row.dist_mercado_m != null ? String(row.dist_mercado_m) : '',
    dist_transporte_m:      row.dist_transporte_m != null ? String(row.dist_transporte_m) : '',
    dist_parque_m:          row.dist_parque_m != null ? String(row.dist_parque_m) : '',
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
      <input
        type="checkbox"
        name={name}
        checked={checked}
        onChange={onChange}
        className="h-4 w-4 rounded border-gray-300 accent-blue-600"
      />
      <span className="text-sm text-gray-700">{label}</span>
    </label>
  )
}

function Campo({ label, name, value, onChange, type = 'text', suffix, children }) {
  return (
    <div className="space-y-1">
      <Label htmlFor={name}>{label}</Label>
      {children ?? (
        <div className="relative">
          <Input id={name} name={name} value={value} onChange={onChange} type={type} />
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

export function EntornoForm({ initialValues = null, onGuardar, guardando, submitLabel = 'Guardar entorno' }) {
  const [datos, setDatos] = useState(() => fromDB(initialValues))

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setDatos(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }))
  }

  const handleGuardar = () => {
    if (!onGuardar) return
    const payload = {
      ...datos,
      ancho_vialidad_m:  datos.ancho_vialidad_m  ? parseFloat(datos.ancho_vialidad_m)  : null,
      dist_escuela_m:    datos.dist_escuela_m    ? parseInt(datos.dist_escuela_m)    : null,
      dist_hospital_m:   datos.dist_hospital_m   ? parseInt(datos.dist_hospital_m)   : null,
      dist_mercado_m:    datos.dist_mercado_m    ? parseInt(datos.dist_mercado_m)    : null,
      dist_transporte_m: datos.dist_transporte_m ? parseInt(datos.dist_transporte_m) : null,
      dist_parque_m:     datos.dist_parque_m     ? parseInt(datos.dist_parque_m)     : null,
    }
    onGuardar(payload)
  }

  return (
    <div className="space-y-5">

      {/* Servicios municipales */}
      <Card>
        <CardHeader><CardTitle>Servicios municipales</CardTitle></CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {SERVICIOS.map(s => (
              <Checkbox
                key={s.key}
                name={s.key}
                label={s.label}
                checked={datos[s.key]}
                onChange={handleChange}
              />
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Infraestructura vial */}
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
              <Checkbox name="banquetas"   label="Banquetas"   checked={datos.banquetas}   onChange={handleChange} />
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

      {/* Clasificación del entorno */}
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
        </CardContent>
      </Card>

      {/* Distancias a equipamiento */}
      <Card>
        <CardHeader>
          <CardTitle>Distancias a equipamiento urbano</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 sm:grid-cols-5 gap-4">
          <Campo label="Escuela" name="dist_escuela_m"    value={datos.dist_escuela_m}    onChange={handleChange} type="number" suffix="m" />
          <Campo label="Hospital" name="dist_hospital_m"  value={datos.dist_hospital_m}   onChange={handleChange} type="number" suffix="m" />
          <Campo label="Mercado" name="dist_mercado_m"    value={datos.dist_mercado_m}     onChange={handleChange} type="number" suffix="m" />
          <Campo label="Transporte" name="dist_transporte_m" value={datos.dist_transporte_m} onChange={handleChange} type="number" suffix="m" />
          <Campo label="Parque" name="dist_parque_m"      value={datos.dist_parque_m}      onChange={handleChange} type="number" suffix="m" />
        </CardContent>
      </Card>

      {/* Observaciones */}
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
