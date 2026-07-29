import { useState } from 'react'
import { useSearchParams, useNavigate, Link } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { useExpedientes } from '@/hooks/useExpedientes'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { NumericInput } from '@/components/ui/numeric-input'
import { CheckCircle, ExternalLink, Loader2 } from 'lucide-react'

function detectarPortal(url = '') {
  if (url.includes('inmuebles24'))  return 'Inmuebles24'
  if (url.includes('lamudi'))        return 'Lamudi'
  if (url.includes('vivanuncios'))   return 'Vivanuncios'
  if (url.includes('metroscubicos')) return 'Metros Cúbicos'
  if (url.includes('easybroker'))    return 'EasyBroker'
  if (url.includes('propiedades'))   return 'Propiedades.com'
  return 'Otro'
}

export function CapturaRapidaPage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { expedientes } = useExpedientes()

  const [form, setForm] = useState({
    expediente_id:       searchParams.get('expediente_id') || '',
    url_fuente:          searchParams.get('url')           || '',
    titulo_anuncio:      searchParams.get('titulo')        || '',
    precio_total:        searchParams.get('precio')        || '',
    superficie_total_m2: searchParams.get('superficie')    || '',
    recamaras:           searchParams.get('recamaras')     || '',
    banos:               searchParams.get('banos')         || '',
    estacionamientos:    searchParams.get('estacionamientos') || '',
    antiguedad_anios:    searchParams.get('antiguedad')    || '',
    colonia:             searchParams.get('colonia')       || '',
    municipio:           searchParams.get('municipio')     || '',
  })

  const [guardando, setGuardando] = useState(false)
  const [guardado,  setGuardado]  = useState(false)
  const [error,     setError]     = useState(null)

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
  }

  const handleGuardar = async () => {
    if (!form.expediente_id)    { setError('Selecciona un expediente'); return }
    if (!form.precio_total)     { setError('El precio es requerido'); return }
    if (!form.superficie_total_m2) { setError('La superficie es requerida'); return }

    setGuardando(true)
    setError(null)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      const { error: err } = await supabase
        .from('comparables_capturados')
        .insert({
          expediente_id:       form.expediente_id,
          perito_id:           user.id,
          url_fuente:          form.url_fuente          || null,
          portal:              detectarPortal(form.url_fuente),
          titulo_anuncio:      form.titulo_anuncio      || null,
          precio_total:        Number(form.precio_total),
          superficie_total_m2: Number(form.superficie_total_m2),
          recamaras:           form.recamaras        ? Number(form.recamaras)        : null,
          banos:               form.banos            ? Number(form.banos)            : null,
          estacionamientos:    form.estacionamientos ? Number(form.estacionamientos) : null,
          antiguedad_anios:    form.antiguedad_anios ? Number(form.antiguedad_anios) : null,
          colonia:             form.colonia           || null,
          municipio:           form.municipio         || null,
          estado_revision:     'pendiente',
          fuente_captura:      'chrome',
          fecha_captura:       new Date().toISOString().split('T')[0],
        })
      if (err) throw err
      setGuardado(true)
    } catch (e) {
      setError(e.message)
    } finally {
      setGuardando(false)
    }
  }

  if (guardado) {
    return (
      <div className="p-6 max-w-md">
        <div className="flex flex-col items-center gap-4 text-center py-8">
          <CheckCircle className="h-14 w-14 text-green-500" />
          <h2 className="text-lg font-semibold text-gray-900">Comparable guardado</h2>
          <p className="text-sm text-gray-500">
            Quedó en el buffer con estado <span className="font-medium">Pendiente</span>.
            Puedes revisarlo y aprobarlo desde la pestaña Comparativo del expediente.
          </p>
          <div className="flex gap-3 mt-2">
            <Link to={`/expedientes/${form.expediente_id}/captura-comparables`}>
              <Button>Ir al buffer</Button>
            </Link>
            <Button
              variant="outline"
              onClick={() => {
                setGuardado(false)
                setForm(f => ({ ...f, url_fuente: '', titulo_anuncio: '', precio_total: '', superficie_total_m2: '', recamaras: '', banos: '', estacionamientos: '', antiguedad_anios: '', colonia: '', municipio: '' }))
              }}
            >
              Capturar otro
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 max-w-2xl space-y-5">
      <div>
        <h1 className="text-xl font-bold text-gray-900">Capturar comparable</h1>
        <p className="text-sm text-gray-500 mt-0.5">
          Revisa los datos extraídos y guárdalos en el buffer del expediente
        </p>
      </div>

      {/* Expediente destino */}
      <Card>
        <CardHeader><CardTitle>Expediente destino</CardTitle></CardHeader>
        <CardContent>
          <select
            name="expediente_id"
            value={form.expediente_id}
            onChange={handleChange}
            className="w-full h-9 rounded-md border border-gray-200 px-3 text-sm focus:outline-none focus:border-blue-400"
          >
            <option value="">— Seleccionar expediente —</option>
            {expedientes.map(e => (
              <option key={e.id} value={e.id}>
                {e.numero_expediente ? `${e.numero_expediente} — ` : ''}{e.tipo_inmueble ?? ''}{e.municipio ? ` · ${e.municipio}` : ''}
              </option>
            ))}
          </select>
        </CardContent>
      </Card>

      {/* Datos del anuncio */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Datos del anuncio</CardTitle>
            {form.url_fuente && (
              <a
                href={form.url_fuente}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-xs text-blue-600 hover:underline"
              >
                Ver anuncio <ExternalLink className="h-3 w-3" />
              </a>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1">
            <Label>Título del anuncio</Label>
            <Input name="titulo_anuncio" value={form.titulo_anuncio} onChange={handleChange} placeholder="Descripción del inmueble" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label>Precio total ($)</Label>
              <NumericInput name="precio_total" value={form.precio_total} onChange={handleChange} placeholder="0" />
            </div>
            <div className="space-y-1">
              <Label>Superficie (m²)</Label>
              <NumericInput name="superficie_total_m2" value={form.superficie_total_m2} onChange={handleChange} placeholder="0" />
            </div>
            <div className="space-y-1">
              <Label>Recámaras</Label>
              <NumericInput name="recamaras" value={form.recamaras} onChange={handleChange} placeholder="—" />
            </div>
            <div className="space-y-1">
              <Label>Baños</Label>
              <NumericInput name="banos" value={form.banos} onChange={handleChange} placeholder="—" />
            </div>
            <div className="space-y-1">
              <Label>Estacionamientos</Label>
              <NumericInput name="estacionamientos" value={form.estacionamientos} onChange={handleChange} placeholder="—" />
            </div>
            <div className="space-y-1">
              <Label>Antigüedad (años)</Label>
              <NumericInput name="antiguedad_anios" value={form.antiguedad_anios} onChange={handleChange} placeholder="—" />
            </div>
            <div className="space-y-1">
              <Label>Colonia</Label>
              <Input name="colonia" value={form.colonia} onChange={handleChange} />
            </div>
            <div className="space-y-1">
              <Label>Municipio</Label>
              <Input name="municipio" value={form.municipio} onChange={handleChange} />
            </div>
          </div>
        </CardContent>
      </Card>

      {error && (
        <p className="text-sm text-red-500 bg-red-50 border border-red-200 rounded-md px-3 py-2">{error}</p>
      )}

      <div className="flex justify-end gap-3">
        <Button variant="outline" onClick={() => navigate(-1)}>Cancelar</Button>
        <Button onClick={handleGuardar} disabled={guardando}>
          {guardando && <Loader2 className="h-4 w-4 animate-spin mr-1" />}
          Guardar en buffer
        </Button>
      </div>
    </div>
  )
}
