import { useState } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { NumericInput } from '@/components/ui/numeric-input'
import { Loader2 } from 'lucide-react'

const defaultDatos = {
  frente_m: '', fondo_m: '', superficie_m2: '',
  forma: '', topografia: '', nivel_vs_banqueta: '',
  uso_suelo_autorizado: '', cos: '', cus: '', altura_maxima_m: '',
  colindancia_norte: '', colindancia_sur: '',
  colindancia_oriente: '', colindancia_poniente: '',
  regimen_propiedad: '', numero_escritura: '', notaria: '', folio_real: '',
  tiene_agua: false, tiene_drenaje: false, tiene_luz: false,
  observaciones_terreno: '',
}

function fromDB(row) {
  if (!row) return defaultDatos
  const n = (v) => v != null ? String(v) : ''
  return {
    frente_m:             n(row.frente_m),
    fondo_m:              n(row.fondo_m),
    superficie_m2:        n(row.superficie_m2),
    forma:                row.forma || '',
    topografia:           row.topografia || '',
    nivel_vs_banqueta:    row.nivel_vs_banqueta || '',
    uso_suelo_autorizado: row.uso_suelo_autorizado || '',
    cos:                  n(row.cos),
    cus:                  n(row.cus),
    altura_maxima_m:      n(row.altura_maxima_m),
    colindancia_norte:    row.colindancia_norte || '',
    colindancia_sur:      row.colindancia_sur || '',
    colindancia_oriente:  row.colindancia_oriente || '',
    colindancia_poniente: row.colindancia_poniente || '',
    regimen_propiedad:    row.regimen_propiedad || '',
    numero_escritura:     row.numero_escritura || '',
    notaria:              row.notaria || '',
    folio_real:           row.folio_real || '',
    tiene_agua:           row.tiene_agua ?? false,
    tiene_drenaje:        row.tiene_drenaje ?? false,
    tiene_luz:            row.tiene_luz ?? false,
    observaciones_terreno: row.observaciones_terreno || '',
  }
}

function Campo({ label, name, value, onChange, suffix, type = 'text', children }) {
  return (
    <div className="space-y-1">
      <Label htmlFor={name}>{label}</Label>
      {children ?? (
        <div className="relative">
          <Input id={name} name={name} value={value} onChange={onChange} type={type} className={suffix ? 'pr-12' : ''} />
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

function NumCampo({ label, name, value, onChange, suffix }) {
  return (
    <div className="space-y-1">
      <Label htmlFor={name}>{label}</Label>
      <div className="relative">
        <NumericInput
          id={name} name={name} value={value} onChange={onChange}
          placeholder="0" className={suffix ? 'pr-12' : ''}
        />
        {suffix && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 pointer-events-none">
            {suffix}
          </span>
        )}
      </div>
    </div>
  )
}

function Checkbox({ name, label, checked, onChange }) {
  return (
    <label className="flex items-center gap-2 cursor-pointer select-none">
      <input
        type="checkbox" name={name} checked={checked} onChange={onChange}
        className="h-4 w-4 rounded border-gray-300 accent-blue-600"
      />
      <span className="text-sm text-gray-700">{label}</span>
    </label>
  )
}

export function CaracteristicasTerrenoForm({ initialValues = null, onGuardar, guardando, submitLabel = 'Guardar terreno' }) {
  const [datos, setDatos] = useState(() => fromDB(initialValues))

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setDatos(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }))
  }

  const handleGuardar = () => {
    if (!onGuardar) return
    const pf = (v) => v ? parseFloat(v) : null
    const payload = {
      ...datos,
      frente_m:        pf(datos.frente_m),
      fondo_m:         pf(datos.fondo_m),
      superficie_m2:   pf(datos.superficie_m2),
      cos:             pf(datos.cos),
      cus:             pf(datos.cus),
      altura_maxima_m: pf(datos.altura_maxima_m),
    }
    onGuardar(payload)
  }

  return (
    <div className="space-y-5">

      {/* Medidas del lote */}
      <Card>
        <CardHeader><CardTitle>Medidas del lote</CardTitle></CardHeader>
        <CardContent className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          <NumCampo label="Frente"     name="frente_m"      value={datos.frente_m}      onChange={handleChange} suffix="m" />
          <NumCampo label="Fondo"      name="fondo_m"       value={datos.fondo_m}       onChange={handleChange} suffix="m" />
          <NumCampo label="Superficie" name="superficie_m2" value={datos.superficie_m2} onChange={handleChange} suffix="m²" />

          <Campo label="Forma del lote" name="forma" value={datos.forma} onChange={handleChange}>
            <Select name="forma" value={datos.forma} onChange={handleChange}>
              <option value="">— Seleccionar —</option>
              <option value="regular">Regular</option>
              <option value="irregular">Irregular</option>
              <option value="esquina">Esquina</option>
              <option value="cabeza_toro">Cabeza de toro</option>
            </Select>
          </Campo>

          <Campo label="Topografía" name="topografia" value={datos.topografia} onChange={handleChange}>
            <Select name="topografia" value={datos.topografia} onChange={handleChange}>
              <option value="">— Seleccionar —</option>
              <option value="plano">Plano</option>
              <option value="pendiente_suave">Pendiente suave</option>
              <option value="pendiente_fuerte">Pendiente fuerte</option>
              <option value="escarpado">Escarpado</option>
            </Select>
          </Campo>

          <Campo label="Nivel respecto a banqueta" name="nivel_vs_banqueta" value={datos.nivel_vs_banqueta} onChange={handleChange}>
            <Select name="nivel_vs_banqueta" value={datos.nivel_vs_banqueta} onChange={handleChange}>
              <option value="">— Seleccionar —</option>
              <option value="nivel">A nivel</option>
              <option value="arriba">Por encima</option>
              <option value="abajo">Por debajo</option>
            </Select>
          </Campo>
        </CardContent>
      </Card>

      {/* Uso de suelo y densidades */}
      <Card>
        <CardHeader><CardTitle>Uso de suelo y densidades</CardTitle></CardHeader>
        <CardContent className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="sm:col-span-2 space-y-1">
            <Label>Uso de suelo autorizado</Label>
            <Input name="uso_suelo_autorizado" value={datos.uso_suelo_autorizado} onChange={handleChange} placeholder="H2, H3, CU, etc." />
          </div>
          <NumCampo label="COS" name="cos" value={datos.cos} onChange={handleChange} suffix="(0–1)" />
          <NumCampo label="CUS" name="cus" value={datos.cus} onChange={handleChange} />
          <NumCampo label="Altura máxima" name="altura_maxima_m" value={datos.altura_maxima_m} onChange={handleChange} suffix="m" />
        </CardContent>
      </Card>

      {/* Colindancias */}
      <Card>
        <CardHeader><CardTitle>Colindancias</CardTitle></CardHeader>
        <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Campo label="Norte" name="colindancia_norte"    value={datos.colindancia_norte}    onChange={handleChange} placeholder="Con calle, propiedad, etc." />
          <Campo label="Sur"   name="colindancia_sur"      value={datos.colindancia_sur}      onChange={handleChange} placeholder="Con calle, propiedad, etc." />
          <Campo label="Oriente" name="colindancia_oriente" value={datos.colindancia_oriente} onChange={handleChange} placeholder="Con calle, propiedad, etc." />
          <Campo label="Poniente" name="colindancia_poniente" value={datos.colindancia_poniente} onChange={handleChange} placeholder="Con calle, propiedad, etc." />
        </CardContent>
      </Card>

      {/* Régimen de propiedad */}
      <Card>
        <CardHeader><CardTitle>Régimen y datos registrales</CardTitle></CardHeader>
        <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Campo label="Régimen de propiedad" name="regimen_propiedad" value={datos.regimen_propiedad} onChange={handleChange}>
            <Select name="regimen_propiedad" value={datos.regimen_propiedad} onChange={handleChange}>
              <option value="">— Seleccionar —</option>
              <option value="privada">Privada</option>
              <option value="ejidal">Ejidal</option>
              <option value="publica">Pública</option>
              <option value="condominio">Condominio</option>
            </Select>
          </Campo>
          <Campo label="Número de escritura"  name="numero_escritura" value={datos.numero_escritura} onChange={handleChange} />
          <Campo label="Notaría"              name="notaria"          value={datos.notaria}          onChange={handleChange} />
          <Campo label="Folio real / registro" name="folio_real"      value={datos.folio_real}       onChange={handleChange} />
        </CardContent>
      </Card>

      {/* Servicios propios */}
      <Card>
        <CardHeader><CardTitle>Servicios propios del terreno</CardTitle></CardHeader>
        <CardContent>
          <div className="flex gap-8">
            <Checkbox name="tiene_agua"   label="Toma de agua"   checked={datos.tiene_agua}   onChange={handleChange} />
            <Checkbox name="tiene_drenaje" label="Conexión drenaje" checked={datos.tiene_drenaje} onChange={handleChange} />
            <Checkbox name="tiene_luz"    label="Acometida eléctrica" checked={datos.tiene_luz}    onChange={handleChange} />
          </div>
        </CardContent>
      </Card>

      {/* Observaciones */}
      <Card>
        <CardHeader><CardTitle>Observaciones del terreno</CardTitle></CardHeader>
        <CardContent>
          <textarea
            name="observaciones_terreno"
            value={datos.observaciones_terreno}
            onChange={handleChange}
            rows={3}
            placeholder="Servidumbres, restricciones, afectaciones, características especiales..."
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
