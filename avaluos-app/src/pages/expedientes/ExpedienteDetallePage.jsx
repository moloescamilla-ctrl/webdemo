import { Link, useParams } from 'react-router-dom'
import { useExpediente } from '@/hooks/useExpediente'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { formatCurrency, formatNumber } from '@/lib/utils'
import { ArrowLeft, FileText, Loader2 } from 'lucide-react'

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

export function ExpedienteDetallePage() {
  const { id } = useParams()
  const { expediente, metodoFisico, inspeccion, loading, error } = useExpediente(id)

  if (loading) return (
    <div className="p-6 flex items-center gap-2 text-gray-400">
      <Loader2 className="h-5 w-5 animate-spin" />
      <span className="text-sm">Cargando expediente...</span>
    </div>
  )

  if (error || !expediente) return (
    <div className="p-6">
      <Link to="/expedientes" className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-4">
        <ArrowLeft className="h-4 w-4" /> Regresar
      </Link>
      <p className="text-sm text-red-600">No se pudo cargar el expediente.</p>
    </div>
  )

  const direccion = [expediente.calle, expediente.colonia, expediente.municipio, expediente.estado_rep]
    .filter(Boolean).join(', ')

  return (
    <div className="p-6 max-w-4xl space-y-5">
      <div>
        <Link to="/expedientes" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-4">
          <ArrowLeft className="h-4 w-4" /> Regresar a expedientes
        </Link>
        <div className="flex items-center gap-3">
          <FileText className="h-6 w-6 text-gray-300" />
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-gray-900 font-mono">
                {expediente.folio || expediente.id.slice(0, 8).toUpperCase()}
              </h1>
              <Badge variant={ESTADO_VARIANT[expediente.estado]}>
                {ESTADO_LABEL[expediente.estado]}
              </Badge>
            </div>
            <p className="text-sm text-gray-500">
              {expediente.tipo_inmueble} · {new Date(expediente.created_at).toLocaleDateString('es-MX', { year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>
        </div>
      </div>

      <Card>
        <CardHeader><CardTitle>Datos generales</CardTitle></CardHeader>
        <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
          <div className="sm:col-span-2">
            <p className="text-xs text-gray-500 mb-0.5">Dirección</p>
            <p className="font-medium">{direccion || 'Sin dirección'}</p>
            {expediente.cp && <p className="text-gray-400">C.P. {expediente.cp}</p>}
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-0.5">Tipo de inmueble</p>
            <p className="font-medium">{expediente.tipo_inmueble}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-0.5">Uso</p>
            <p className="font-medium">{expediente.uso}</p>
          </div>
          {expediente.solicitante && (
            <div>
              <p className="text-xs text-gray-500 mb-0.5">Solicitante</p>
              <p className="font-medium">{expediente.solicitante}</p>
            </div>
          )}
          {expediente.fecha_inspeccion && (
            <div>
              <p className="text-xs text-gray-500 mb-0.5">Fecha de inspección</p>
              <p className="font-medium">{new Date(expediente.fecha_inspeccion + 'T12:00:00').toLocaleDateString('es-MX')}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {metodoFisico ? (
        <Card>
          <CardHeader><CardTitle>Método Físico — Ross-Heidecke</CardTitle></CardHeader>
          <CardContent className="space-y-5">
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Superficies y costos</p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  ['Sup. construcción', `${formatNumber(metodoFisico.superficie_construccion, 2)} m²`],
                  ['Sup. terreno', `${formatNumber(metodoFisico.superficie_terreno, 2)} m²`],
                  ['Costo reposición', `${formatCurrency(metodoFisico.costo_reposicion_m2)}/m²`],
                  ['Val. unit. terreno', `${formatCurrency(metodoFisico.valor_unitario_terreno)}/m²`],
                ].map(([label, val]) => (
                  <div key={label} className="bg-gray-50 rounded-md p-3">
                    <p className="text-xs text-gray-500">{label}</p>
                    <p className="font-semibold text-sm mt-0.5">{val}</p>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Depreciación</p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  ['Edad / Vida útil', `${metodoFisico.edad_anios} / ${metodoFisico.vida_util_anios} años`],
                  ['Factor Ross (A)', formatNumber(metodoFisico.factor_ross)],
                  ['Coef. Heidecke (C)', formatNumber(metodoFisico.coeficiente_c_adoptado)],
                  ['Depreciación', `${metodoFisico.porcentaje_depreciacion?.toFixed(2)}%`],
                ].map(([label, val]) => (
                  <div key={label} className="bg-gray-50 rounded-md p-3">
                    <p className="text-xs text-gray-500">{label}</p>
                    <p className="font-semibold text-sm font-mono mt-0.5">{val}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-2 pt-3 border-t border-gray-100">
              {[
                ['Valor reposición nuevo (VR)', formatCurrency(metodoFisico.valor_reposicion_nuevo), ''],
                ['Depreciación aplicada', `− ${formatCurrency(metodoFisico.depreciacion_pesos)}`, 'text-red-600'],
                ['Valor actual construcción (VA)', formatCurrency(metodoFisico.valor_actual_construccion), ''],
                ['Valor del terreno', formatCurrency(metodoFisico.valor_terreno), ''],
              ].map(([label, val, cls]) => (
                <div key={label} className="flex justify-between text-sm">
                  <span className="text-gray-600">{label}</span>
                  <span className={`font-medium ${cls}`}>{val}</span>
                </div>
              ))}
            </div>

            <div className="bg-blue-600 text-white rounded-md p-4">
              <p className="text-sm text-blue-100">Valor físico total del inmueble</p>
              <p className="text-2xl font-bold mt-1">{formatCurrency(metodoFisico.valor_fisico_total)}</p>
              <p className="text-xs text-blue-200 mt-1">Terreno + Construcción depreciada</p>
            </div>

            {inspeccion && (
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Estado de conservación (Heidecke)</p>
                <div className="flex items-center gap-3">
                  <Badge variant="secondary">{inspeccion.estado_heidecke}</Badge>
                  <span className="text-sm text-gray-600">C = {inspeccion.coeficiente_c?.toFixed(3)}</span>
                  {inspeccion.estado_manual && (
                    <span className="text-xs text-orange-600">ajustado por perito: {inspeccion.estado_manual}</span>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      ) : (
        <Card className="border-dashed">
          <CardContent className="pt-6 text-center text-gray-400">
            <p className="text-sm">Sin datos del Método Físico guardados.</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
