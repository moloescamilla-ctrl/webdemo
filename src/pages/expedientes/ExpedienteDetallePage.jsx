import { useParams, Link } from 'react-router-dom'
import { useExpediente } from '@/hooks/useExpediente'
import { ComparableCaptura } from '@/features/comparables/ComparableCaptura'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { formatCurrency, formatNumber } from '@/lib/utils'
import { ArrowLeft, Building2, TrendingUp, Loader2, AlertCircle, Link2 } from 'lucide-react'

const ESTADO_VARIANT = {
  borrador: 'secondary',
  en_proceso: 'warning',
  completado: 'success',
  firmado: 'default',
}

const ESTADO_LABEL = {
  borrador: 'Borrador',
  en_proceso: 'En proceso',
  completado: 'Completado',
  firmado: 'Firmado',
}

function Row({ label, value }) {
  return (
    <div className="flex justify-between py-1.5 border-b border-gray-50 last:border-0 text-sm">
      <span className="text-gray-500">{label}</span>
      <span className="font-medium text-right">{value ?? '—'}</span>
    </div>
  )
}

export function ExpedienteDetallePage() {
  const { id } = useParams()
  const { expediente, metodoFisico, inspeccion, metodoComparativo, loading, error } = useExpediente(id)

  if (loading) {
    return (
      <div className="p-6 flex items-center gap-2 text-gray-400">
        <Loader2 className="h-5 w-5 animate-spin" />
        <span className="text-sm">Cargando expediente...</span>
      </div>
    )
  }

  if (error || !expediente) {
    return (
      <div className="p-6">
        <div className="flex items-center gap-2 text-red-600">
          <AlertCircle className="h-5 w-5" />
          <span className="text-sm">{error || 'Expediente no encontrado'}</span>
        </div>
        <Link to="/expedientes" className="text-sm text-blue-600 hover:underline mt-3 inline-block">
          ← Regresar a expedientes
        </Link>
      </div>
    )
  }

  const dir = [expediente.calle, expediente.colonia, expediente.municipio, expediente.estado_rep]
    .filter(Boolean).join(', ')

  const esTerrenoSolo = metodoFisico && metodoFisico.superficie_construccion === 0

  return (
    <div className="p-6 max-w-4xl space-y-5">
      <div className="flex items-center gap-3">
        <Link to="/expedientes" className="text-gray-400 hover:text-gray-600 transition-colors">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-gray-900">
              {expediente.folio || expediente.id.slice(0, 8).toUpperCase()}
            </h1>
            <Badge variant={ESTADO_VARIANT[expediente.estado]}>
              {ESTADO_LABEL[expediente.estado]}
            </Badge>
          </div>
          <p className="text-sm text-gray-500 mt-0.5">{dir || 'Sin dirección'}</p>
        </div>
      </div>

      <Card>
        <CardHeader><CardTitle>Datos generales</CardTitle></CardHeader>
        <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-x-8">
          <div>
            <Row label="Tipo de inmueble" value={expediente.tipo_inmueble} />
            <Row label="Uso" value={expediente.uso} />
            <Row label="Solicitante" value={expediente.solicitante} />
          </div>
          <div>
            <Row label="Fecha de inspección" value={expediente.fecha_inspeccion
              ? new Date(expediente.fecha_inspeccion + 'T00:00:00').toLocaleDateString('es-MX')
              : null}
            />
            <Row label="Creado" value={new Date(expediente.created_at).toLocaleDateString('es-MX')} />
            <Row label="Código postal" value={expediente.cp} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Building2 className="h-4 w-4 text-blue-600" />
            <CardTitle>
              {esTerrenoSolo
                ? 'Método Físico — Terreno sin construcción'
                : 'Método Físico — Ross Heidecke'
              }
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          {!metodoFisico ? (
            <p className="text-sm text-gray-400">Sin datos del Método Físico guardados.</p>
          ) : esTerrenoSolo ? (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8">
                <div>
                  <Row label="Superficie terreno" value={`${formatNumber(metodoFisico.superficie_terreno, 2)} m²`} />
                  <Row label="Valor unitario terreno /m²" value={formatCurrency(metodoFisico.valor_unitario_terreno)} />
                </div>
              </div>
              <div className="bg-blue-600 text-white rounded-md p-4">
                <p className="text-sm text-blue-100">Valor del terreno</p>
                <p className="text-2xl font-bold mt-1">{formatCurrency(metodoFisico.valor_fisico_total)}</p>
                <p className="text-xs text-blue-200 mt-1">Terreno sin construcción (solo suelo)</p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8">
                <div>
                  <Row label="Superficie construcción" value={`${formatNumber(metodoFisico.superficie_construccion, 2)} m²`} />
                  <Row label="Superficie terreno" value={`${formatNumber(metodoFisico.superficie_terreno, 2)} m²`} />
                  <Row label="Costo reposición /m²" value={formatCurrency(metodoFisico.costo_reposicion_m2)} />
                  <Row label="Valor unitario terreno /m²" value={formatCurrency(metodoFisico.valor_unitario_terreno)} />
                </div>
                <div>
                  <Row label="Edad" value={`${metodoFisico.edad_anios} años`} />
                  <Row label="Vida útil" value={`${metodoFisico.vida_util_anios} años`} />
                  <Row label="Factor Ross (A)" value={formatNumber(metodoFisico.factor_ross)} />
                  <Row label="Coef. Heidecke (C)" value={formatNumber(metodoFisico.coeficiente_c_adoptado)} />
                </div>
              </div>

              {inspeccion && (
                <div className="text-xs text-gray-400 bg-gray-50 rounded px-3 py-2">
                  Estado conservación: <strong>{inspeccion.estado_heidecke}</strong>
                  {inspeccion.estado_manual && (
                    <span> (ajustado por perito: {inspeccion.estado_manual})</span>
                  )}
                </div>
              )}

              <div className="space-y-2 pt-2 border-t border-gray-100">
                <div className="flex items-center gap-2">
                  <div className="flex-1 bg-gray-100 rounded-full h-2">
                    <div
                      className="h-2 bg-red-400 rounded-full"
                      style={{ width: `${Math.min(metodoFisico.porcentaje_depreciacion, 100)}%` }}
                    />
                  </div>
                  <span className="text-sm font-medium text-red-600 whitespace-nowrap">
                    {formatNumber(metodoFisico.porcentaje_depreciacion, 2)}% depreciado
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="bg-gray-50 rounded-md p-3 text-sm">
                  <p className="text-gray-500">Valor actual construcción</p>
                  <p className="font-semibold mt-0.5">{formatCurrency(metodoFisico.valor_actual_construccion)}</p>
                </div>
                <div className="bg-gray-50 rounded-md p-3 text-sm">
                  <p className="text-gray-500">Valor del terreno</p>
                  <p className="font-semibold mt-0.5">{formatCurrency(metodoFisico.valor_terreno)}</p>
                </div>
              </div>

              <div className="bg-blue-600 text-white rounded-md p-4">
                <p className="text-sm text-blue-100">Valor físico total</p>
                <p className="text-2xl font-bold mt-1">{formatCurrency(metodoFisico.valor_fisico_total)}</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Link2 className="h-4 w-4 text-blue-500" />
            <CardTitle>Banco de Comparables</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <ComparableCaptura expedienteId={id} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-green-600" />
            <CardTitle>Método Comparativo de Mercado</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          {!metodoComparativo ? (
            <p className="text-sm text-gray-400">Sin datos del Método Comparativo guardados.</p>
          ) : (
            <div className="space-y-4">
              <Row label="Superficie sujeto" value={`${formatNumber(metodoComparativo.superficie_sujeto, 2)} m²`} />
              <Row label="Comparables utilizados" value={metodoComparativo.comparables?.length ?? 0} />

              {metodoComparativo.comparables?.length > 0 && (
                <div className="bg-gray-50 rounded-md overflow-hidden">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">Comparable</th>
                        <th className="px-3 py-2 text-right text-xs font-medium text-gray-500">F.Total</th>
                        <th className="px-3 py-2 text-right text-xs font-medium text-gray-500">$/m² Homo</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {metodoComparativo.comparables
                        .filter(c => c.precioM2Homologado > 0)
                        .map((c, i) => (
                          <tr key={i}>
                            <td className="px-3 py-1.5 text-gray-600">{c.descripcion || `Comparable ${i + 1}`}</td>
                            <td className="px-3 py-1.5 text-right font-mono text-xs text-gray-500">{formatNumber(c.factorTotal)}</td>
                            <td className="px-3 py-1.5 text-right font-mono text-xs font-semibold text-blue-700">{formatNumber(c.precioM2Homologado, 2)}</td>
                          </tr>
                        ))}
                    </tbody>
                    <tfoot className="border-t border-gray-300 bg-gray-100">
                      <tr>
                        <td className="px-3 py-2 text-xs font-semibold text-gray-600" colSpan={2}>Valor unitario ponderado</td>
                        <td className="px-3 py-2 text-right font-mono text-sm font-bold text-blue-800">
                          {formatNumber(metodoComparativo.valor_unitario_ponderado, 2)}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              )}

              <div className="bg-green-600 text-white rounded-md p-4">
                <p className="text-sm text-green-100">Valor comparativo total</p>
                <p className="text-2xl font-bold mt-1">{formatCurrency(metodoComparativo.valor_comparativo_total)}</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
