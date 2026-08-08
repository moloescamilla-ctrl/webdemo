import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { pdf } from '@react-pdf/renderer'
import { useExpediente } from '@/hooks/useExpediente'
import { useRevision } from '@/hooks/useRevision'
import { useFotosExpediente } from '@/hooks/useFotosExpediente'
import { AvaluoPDF } from '@/features/pdf/AvaluoPDF'
import { BadgeRevision } from '@/features/revision/BadgeRevision'
import { FormComentario } from '@/features/revision/FormComentario'
import { PanelComentarios } from '@/features/revision/PanelComentarios'
import { InvitarRevisorModal } from '@/features/revision/InvitarRevisorModal'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { formatCurrency, formatNumber, calcularVariacionMetodos } from '@/lib/utils'
import { ArrowLeft, Building2, TrendingUp, Loader2, AlertCircle, Pencil, FileDown, UserPlus, MessageSquare, Scale, AlertTriangle, CheckCircle2 } from 'lucide-react'

async function fetchBase64(url) {
  const res = await fetch(url)
  if (!res.ok) return null
  const blob = await res.blob()
  return new Promise((resolve) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result)
    reader.onerror = () => resolve(null)
    reader.readAsDataURL(blob)
  })
}

function BotonDescargarPDF({ datos, fileName }) {
  const [generando, setGenerando] = useState(false)
  const [errorPdf, setErrorPdf] = useState(null)

  async function handleClick() {
    setGenerando(true)
    setErrorPdf(null)
    try {
      let croquisSrc = null
      if (datos.expediente?.croquis_url) {
        croquisSrc = await fetchBase64(datos.expediente.croquis_url).catch(() => null)
      }
      const blob = await pdf(<AvaluoPDF datos={{ ...datos, croquisSrc }} />).toBlob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = fileName
      a.click()
      URL.revokeObjectURL(url)
    } catch (err) {
      setErrorPdf(err?.message || String(err))
    } finally {
      setGenerando(false)
    }
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <button
        onClick={handleClick}
        disabled={generando}
        className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50 transition-colors"
      >
        {generando
          ? <><Loader2 className="h-3.5 w-3.5 animate-spin" /> Generando...</>
          : <><FileDown className="h-3.5 w-3.5" /> Descargar dictamen</>}
      </button>
      {errorPdf && <span className="text-xs text-red-500">{errorPdf}</span>}
    </div>
  )
}

const ESTADO_VARIANT = {
  borrador: 'secondary', en_proceso: 'warning', completado: 'success', firmado: 'default',
}
const ESTADO_LABEL = {
  borrador: 'Borrador', en_proceso: 'En proceso', completado: 'Completado', firmado: 'Firmado',
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
  const {
    expediente, entorno, terreno, descripcionConstruccion,
    metodoFisico, inspeccion, metodoComparativo, metodoRentas, metodoResidual,
    esAutor, esRevisor,
    guardarMetodoElegido,
    loading, error,
  } = useExpediente(id)
  const { fotos } = useFotosExpediente(id)
  const {
    revisiones, comentarios, pendientes, atendidos,
    estadoRevision, hayRevisionActiva,
    invitarRevisor, agregarComentario, atenderComentario, cerrarRevision,
  } = useRevision(id)

  const [modalInvitar, setModalInvitar] = useState(false)
  const [guardandoMetodo, setGuardandoMetodo] = useState(false)
  const [errorMetodo, setErrorMetodo] = useState(null)

  const handleElegirMetodo = async (clave) => {
    setGuardandoMetodo(true)
    setErrorMetodo(null)
    try { await guardarMetodoElegido(clave) }
    catch (err) { setErrorMetodo(err.message) }
    finally { setGuardandoMetodo(false) }
  }

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

  const mostrarRevision = esAutor || esRevisor
  const revisionDeshabilitada = !hayRevisionActiva

  return (
    <div className="p-6 max-w-4xl space-y-5">

      {/* ── Encabezado ── */}
      <div className="flex items-start gap-3 flex-wrap">
        <Link to="/expedientes" className="text-gray-400 hover:text-gray-600 transition-colors mt-0.5">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-xl font-bold text-gray-900">
              {expediente.folio || expediente.id.slice(0, 8).toUpperCase()}
            </h1>
            <Badge variant={ESTADO_VARIANT[expediente.estado]}>
              {ESTADO_LABEL[expediente.estado]}
            </Badge>
            <BadgeRevision estadoRevision={estadoRevision} pendientes={pendientes.length} />
          </div>
          <p className="text-sm text-gray-500 mt-0.5">{dir || 'Sin dirección'}</p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {esAutor && (
            <button
              onClick={() => setModalInvitar(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-gray-600 border border-gray-200 rounded-md hover:border-blue-400 hover:text-blue-600 transition-colors"
            >
              <UserPlus className="h-3.5 w-3.5" />
              Invitar revisor
            </button>
          )}
          {esAutor && expediente.tipo_expediente !== 'calculo_rapido' && (
            <Link
              to={`/expedientes/${id}/editar`}
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-gray-600 border border-gray-200 rounded-md hover:border-blue-400 hover:text-blue-600 transition-colors"
            >
              <Pencil className="h-3.5 w-3.5" />
              Editar
            </Link>
          )}
          {expediente.tipo_expediente !== 'calculo_rapido' && (
            <BotonDescargarPDF
              datos={{ expediente, entorno, terreno, descripcionConstruccion, inspeccion, metodoFisico, metodoComparativo, metodoRentas, metodoResidual, fotos }}
              fileName={`Avaluo_${expediente.folio || expediente.id.slice(0, 8)}_${expediente.municipio || 'MX'}.pdf`}
            />
          )}
        </div>
      </div>

      {/* Banner para el revisor */}
      {esRevisor && !esAutor && (
        <div className="flex items-center gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-700">
          <MessageSquare className="h-4 w-4 shrink-0" />
          Estás revisando este expediente. Puedes agregar comentarios en cada sección. No puedes modificar los datos.
        </div>
      )}

      {/* ── Datos generales ── */}
      <Card>
        <CardHeader><CardTitle>Datos generales</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8">
            <div>
              <Row label="Tipo de inmueble" value={expediente.tipo_inmueble} />
              <Row label="Uso" value={expediente.uso} />
              <Row label="Solicitante" value={expediente.solicitante} />
              <Row label="Propietario" value={expediente.nombre_propietario} />
            </div>
            <div>
              <Row label="Fecha de inspección" value={expediente.fecha_inspeccion
                ? new Date(expediente.fecha_inspeccion + 'T00:00:00').toLocaleDateString('es-MX')
                : null} />
              <Row label="Creado" value={new Date(expediente.created_at).toLocaleDateString('es-MX')} />
              <Row label="Código postal" value={expediente.cp} />
              <Row label="Perito valuador" value={expediente.nombre_perito} />
            </div>
          </div>
          {esRevisor && (
            <FormComentario
              seccionActual="datos_generales"
              onGuardar={agregarComentario}
              deshabilitado={revisionDeshabilitada}
            />
          )}
        </CardContent>
      </Card>

      {/* ── Método Físico ── */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Building2 className="h-4 w-4 text-blue-600" />
            <CardTitle>
              {esTerrenoSolo ? 'Método Físico — Terreno sin construcción' : 'Método Físico — Ross Heidecke'}
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {!metodoFisico ? (
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-400">Sin datos del Método Físico guardados.</p>
              {esAutor && (
                <Link to={`/expedientes/${id}/editar`} className="text-xs text-blue-600 hover:underline">
                  Agregar →
                </Link>
              )}
            </div>
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
                  {inspeccion.estado_manual && <span> (ajustado: {inspeccion.estado_manual})</span>}
                </div>
              )}
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
              <div className="grid grid-cols-2 gap-3">
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
          {esRevisor && (
            <FormComentario
              seccionActual="metodo_fisico"
              onGuardar={agregarComentario}
              deshabilitado={revisionDeshabilitada}
            />
          )}
        </CardContent>
      </Card>

      {/* ── Método Comparativo ── */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-green-600" />
            <CardTitle>Método Comparativo de Mercado</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {!metodoComparativo ? (
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-400">Sin datos del Método Comparativo guardados.</p>
              {esAutor && (
                <Link to={`/expedientes/${id}/editar`} className="text-xs text-blue-600 hover:underline">
                  Agregar →
                </Link>
              )}
            </div>
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
          {esRevisor && (
            <FormComentario
              seccionActual="metodo_comparativo"
              onGuardar={agregarComentario}
              deshabilitado={revisionDeshabilitada}
            />
          )}
        </CardContent>
      </Card>

      {/* ── Otros métodos (resumen) ── */}
      {(metodoRentas || metodoResidual) && (
        <Card>
          <CardHeader><CardTitle>Otros métodos aplicados</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {metodoRentas && (
              <div className="space-y-1">
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Capitalización de rentas</p>
                <div className="bg-purple-600 text-white rounded-md p-3">
                  <p className="text-xs text-purple-200">Valor por capitalización</p>
                  <p className="text-xl font-bold mt-0.5">{formatCurrency(metodoRentas.valor_capitalizacion)}</p>
                </div>
              </div>
            )}
            {metodoResidual && (
              <div className="space-y-1">
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Método residual</p>
                <div className="bg-amber-600 text-white rounded-md p-3">
                  <p className="text-xs text-amber-200">Valor residual</p>
                  <p className="text-xl font-bold mt-0.5">{formatCurrency(metodoResidual.valor_residual)}</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* ── Valor Concluido ── */}
      {(() => {
        const METODOS = [
          { clave: 'fisico',      label: 'Método Físico / Costos',        valor: Number(metodoFisico?.valor_fisico_total)             || 0 },
          { clave: 'comparativo', label: 'Método Comparativo de Mercado', valor: Number(metodoComparativo?.valor_comparativo_total)   || 0 },
          { clave: 'rentas',      label: 'Capitalización de Rentas',      valor: Number(metodoRentas?.valor_capitalizacion)           || 0 },
          { clave: 'residual',    label: 'Método Residual Estático',      valor: Number(metodoResidual?.valor_residual)               || 0 },
        ].filter(m => m.valor > 0)

        if (METODOS.length === 0) return null

        const variacion = calcularVariacionMetodos(METODOS.map(m => m.valor))
        const variacionAlerta = variacion !== null && variacion > 30
        const metodoElegido = expediente.metodo_elegido
        const elegido = METODOS.find(m => m.clave === metodoElegido)

        return (
          <Card className={variacionAlerta && !metodoElegido ? 'border-red-300' : ''}>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Scale className="h-4 w-4 text-gray-600" />
                <CardTitle>Valor Concluido</CardTitle>
                {guardandoMetodo && <Loader2 className="h-3.5 w-3.5 animate-spin text-gray-400 ml-1" />}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">

              {/* Tabla de métodos con radio para el perito */}
              <div className="rounded-md border border-gray-200 overflow-hidden text-sm divide-y divide-gray-100">
                {METODOS.map(m => (
                  <div
                    key={m.clave}
                    className={`flex items-center gap-3 px-4 py-3 transition-colors ${
                      metodoElegido === m.clave ? 'bg-blue-50' : 'hover:bg-gray-50'
                    }`}
                  >
                    {esAutor && (
                      <input
                        type="radio"
                        name="metodoElegido"
                        value={m.clave}
                        checked={metodoElegido === m.clave}
                        onChange={() => handleElegirMetodo(m.clave)}
                        disabled={guardandoMetodo}
                        className="h-4 w-4 accent-blue-600 shrink-0"
                      />
                    )}
                    <span className="flex-1 text-gray-700">{m.label}</span>
                    <span className={`font-semibold font-mono ${metodoElegido === m.clave ? 'text-blue-800' : 'text-gray-800'}`}>
                      {formatCurrency(m.valor)}
                    </span>
                  </div>
                ))}
              </div>

              {/* Indicador de variación */}
              {variacion !== null && (
                <div className={`flex items-start gap-2 rounded-md px-3 py-2.5 text-sm ${
                  variacionAlerta
                    ? 'bg-red-50 border border-red-200 text-red-700'
                    : 'bg-green-50 border border-green-200 text-green-700'
                }`}>
                  {variacionAlerta
                    ? <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
                    : <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5" />
                  }
                  <div>
                    <span className="font-medium">
                      Variación entre métodos: {formatNumber(variacion, 1)}%
                    </span>
                    {variacionAlerta && (
                      <p className="text-xs mt-0.5">
                        Supera el límite admisible del 30% (SHF / INDAABIN). Revise los datos de los métodos aplicados antes de concluir el valor.
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Instrucción cuando no hay método elegido */}
              {esAutor && !metodoElegido && (
                <p className="text-xs text-amber-600 italic">
                  Selecciona el método que adoptarás como valor concluido. Este es el valor que aparecerá en el dictamen.
                </p>
              )}

              {/* Valor concluido elegido */}
              {elegido && (
                <div className="bg-[#1B2D4E] text-white rounded-md p-4">
                  <p className="text-xs text-blue-300 uppercase tracking-wide mb-1">
                    Valor concluido · {elegido.label}
                  </p>
                  <p className="text-2xl font-bold">{formatCurrency(elegido.valor)}</p>
                  {esAutor && (
                    <button
                      onClick={() => handleElegirMetodo(null)}
                      disabled={guardandoMetodo}
                      className="text-xs text-blue-300 hover:text-white mt-2 underline disabled:opacity-50"
                    >
                      Cambiar método →
                    </button>
                  )}
                </div>
              )}

              {errorMetodo && (
                <p className="text-xs text-red-600">{errorMetodo}</p>
              )}

              {esRevisor && (
                <FormComentario
                  seccionActual="conclusion"
                  onGuardar={agregarComentario}
                  deshabilitado={revisionDeshabilitada}
                />
              )}
            </CardContent>
          </Card>
        )
      })()}

      {/* ── Panel de revisión ── */}
      {mostrarRevision && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <MessageSquare className="h-4 w-4" />
              Revisión entre pares
              {pendientes.length > 0 && (
                <span className="ml-1 px-1.5 py-0.5 text-xs bg-orange-100 text-orange-700 rounded-full font-medium">
                  {pendientes.length} pendiente{pendientes.length !== 1 ? 's' : ''}
                </span>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {esRevisor && (
              <div className="mb-4">
                <p className="text-xs text-gray-500 mb-2">Comentario general sobre el expediente:</p>
                <FormComentario
                  seccionActual="general"
                  onGuardar={agregarComentario}
                  deshabilitado={revisionDeshabilitada}
                />
              </div>
            )}
            <PanelComentarios
              comentarios={comentarios}
              pendientes={pendientes}
              atendidos={atendidos}
              revisiones={revisiones}
              esAutor={esAutor}
              onAtender={atenderComentario}
              onCerrar={cerrarRevision}
            />
          </CardContent>
        </Card>
      )}

      {/* Modal invitar revisor */}
      {modalInvitar && (
        <InvitarRevisorModal
          revisoresExistentes={revisiones}
          onInvitar={invitarRevisor}
          onCerrar={() => setModalInvitar(false)}
        />
      )}
    </div>
  )
}
