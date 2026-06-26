import { useState } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { NumericInput } from '@/components/ui/numeric-input'
import { Loader2 } from 'lucide-react'

const defaultDatos = {
  uso_actual: '',
  condicion: '',
  num_recamaras: '',
  banos_completos: '',
  medios_banos: '',
  estacionamientos_descubiertos: '',
  estacionamientos_cubiertos: '',
  elevador: false,
  num_niveles: '',
  superficie_vendible_m2: '',
  observaciones: '',
}

function fromDB(row) {
  if (!row) return defaultDatos
  const n = (v) => v != null ? String(v) : ''
  return {
    uso_actual:                     row.uso_actual || '',
    condicion:                      row.condicion || '',
    num_recamaras:                  n(row.num_recamaras),
    banos_completos:                n(row.banos_completos),
    medios_banos:                   n(row.medios_banos),
    estacionamientos_descubiertos:  n(row.estacionamientos_descubiertos),
    estacionamientos_cubiertos:     n(row.estacionamientos_cubiertos),
    elevador:                       row.elevador ?? false,
    num_niveles:                    n(row.num_niveles),
    superficie_vendible_m2:         n(row.superficie_vendible_m2),
    observaciones:                  row.observaciones || '',
  }
}

function Campo({ label, name, value, onChange, children }) {
  return (
    <div className="space-y-1">
      <Label htmlFor={name}>{label}</Label>
      {children ?? <Input id={name} name={name} value={value} onChange={onChange} />}
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

export function DescripcionConstruccionForm({
  initialValues = null, onGuardar, guardando,
  submitLabel = 'Guardar descripción',
}) {
  const [datos, setDatos] = useState(() => fromDB(initialValues))

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setDatos(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }))
  }

  const handleGuardar = () => {
    if (!onGuardar) return
    const pi = (v) => v ? parseInt(v) : null
    const pf = (v) => v ? parseFloat(v) : null
    onGuardar({
      ...datos,
      num_recamaras:                 pi(datos.num_recamaras),
      banos_completos:               pi(datos.banos_completos),
      medios_banos:                  pi(datos.medios_banos),
      estacionamientos_descubiertos: pi(datos.estacionamientos_descubiertos),
      estacionamientos_cubiertos:    pi(datos.estacionamientos_cubiertos),
      num_niveles:                   pi(datos.num_niveles),
      superficie_vendible_m2:        pf(datos.superficie_vendible_m2),
    })
  }

  return (
    <div className="space-y-5">
      <Card>
        <CardHeader><CardTitle>Uso y condición</CardTitle></CardHeader>
        <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Campo label="Uso actual / destino" name="uso_actual" value={datos.uso_actual} onChange={handleChange}>
            <Input name="uso_actual" value={datos.uso_actual} onChange={handleChange}
              placeholder="Casa habitación, oficina, local comercial..." />
          </Campo>
          <Campo label="Condición del inmueble" name="condicion" value={datos.condicion} onChange={handleChange}>
            <Select name="condicion" value={datos.condicion} onChange={handleChange}>
              <option value="">— Seleccionar —</option>
              <option value="nueva">Vivienda nueva</option>
              <option value="usada">Vivienda usada</option>
            </Select>
          </Campo>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Características de la construcción</CardTitle></CardHeader>
        <CardContent className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          <NumCampo label="Recámaras"           name="num_recamaras"    value={datos.num_recamaras}    onChange={handleChange} />
          <NumCampo label="Baños completos"      name="banos_completos"  value={datos.banos_completos}  onChange={handleChange} />
          <NumCampo label="Medios baños"         name="medios_banos"     value={datos.medios_banos}     onChange={handleChange} />
          <NumCampo label="Estac. descubiertos"  name="estacionamientos_descubiertos" value={datos.estacionamientos_descubiertos} onChange={handleChange} />
          <NumCampo label="Estac. cubiertos"     name="estacionamientos_cubiertos"    value={datos.estacionamientos_cubiertos}    onChange={handleChange} />
          <NumCampo label="Número de niveles"    name="num_niveles"      value={datos.num_niveles}      onChange={handleChange} />
          <div className="sm:col-span-2">
            <NumCampo label="Superficie vendible" name="superficie_vendible_m2" value={datos.superficie_vendible_m2} onChange={handleChange} suffix="m²" />
          </div>
          <div className="flex items-end pb-1">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox" name="elevador"
                checked={datos.elevador} onChange={handleChange}
                className="h-4 w-4 rounded border-gray-300 accent-blue-600"
              />
              <span className="text-sm text-gray-700">Cuenta con elevador</span>
            </label>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Observaciones</CardTitle></CardHeader>
        <CardContent>
          <textarea
            name="observaciones"
            value={datos.observaciones}
            onChange={handleChange}
            rows={3}
            placeholder="Descripción libre de acabados, estado de conservación, características especiales..."
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
