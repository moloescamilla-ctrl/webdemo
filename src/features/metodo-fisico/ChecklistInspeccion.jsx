import { PARTIDAS_INSPECCION, ESTADOS_PARTIDA, ESTADOS_HEIDECKE, calcularHeideckeDesdeChecklist } from './calculosRossHeidecke'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

const badgeVariantPorEstado = (n) => ({ 'Óptimo':'success','Muy Bueno':'success','Bueno':'success','Intermedio':'warning','Regular':'warning','Malo':'destructive','Muy Malo':'destructive','Pésimo':'destructive' }[n] ?? 'secondary')
const colorBoton = (v) => v===0?'border-green-500 bg-green-50 text-green-700':v===1?'border-blue-400 bg-blue-50 text-blue-700':v===2?'border-yellow-400 bg-yellow-50 text-yellow-700':v===3?'border-orange-400 bg-orange-50 text-orange-700':'border-red-500 bg-red-50 text-red-700'

export function ChecklistInspeccion({ estados, onChange, estadoManual, onEstadoManualChange }) {
  const { puntaje, estadoHeidecke } = calcularHeideckeDesdeChecklist(estados)
  const estadoFinal = estadoManual !== null ? ESTADOS_HEIDECKE.find(e => e.id === estadoManual) : estadoHeidecke

  return (
    <div className="space-y-5">
      <Card>
        <CardHeader>
          <CardTitle>Checklist de Inspección Física</CardTitle>
          <p className="text-sm text-gray-500">Evalúa cada partida constructiva. El sistema calculará automáticamente el estado Heidecke.</p>
        </CardHeader>
        <CardContent className="space-y-4">
          {PARTIDAS_INSPECCION.map((partida) => (
            <div key={partida.id} className="space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">{partida.nombre}</span>
                <span className="text-xs text-gray-400">Peso: {(partida.peso*100).toFixed(0)}%</span>
              </div>
              <div className="flex gap-2">
                {ESTADOS_PARTIDA.map((estado) => {
                  const sel = Number(estados[partida.id]??0)===estado.valor
                  return (
                    <button key={estado.valor} onClick={()=>onChange(partida.id,estado.valor)} className={cn('flex-1 py-1.5 rounded border text-xs font-medium transition-all', sel?colorBoton(estado.valor):'border-gray-200 bg-gray-50 text-gray-500 hover:border-gray-300')}>
                      {estado.etiqueta}
                    </button>
                  )
                })}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card className="border-blue-200 bg-blue-50">
        <CardContent className="pt-5">
          <p className="text-sm font-medium text-blue-900">Estado calculado por checklist</p>
          <div className="flex items-center gap-2 mt-1.5">
            <Badge variant={badgeVariantPorEstado(estadoHeidecke.nombre)}>{estadoHeidecke.nombre}</Badge>
            <span className="text-sm text-blue-700">C = {estadoHeidecke.c.toFixed(3)}</span>
            <span className="text-xs text-blue-500">(puntaje: {puntaje.toFixed(3)})</span>
          </div>
          <p className="text-xs text-blue-600 mt-1">{estadoHeidecke.descripcion}</p>

          <div className="mt-4 pt-4 border-t border-blue-200">
            <p className="text-xs font-medium text-blue-800 mb-2">Ajuste del perito (opcional)</p>
            <div className="flex flex-wrap gap-2">
              <button onClick={()=>onEstadoManualChange(null)} className={cn('px-3 py-1 rounded text-xs border transition-all', estadoManual===null?'bg-blue-600 text-white border-blue-600':'bg-white text-blue-700 border-blue-300 hover:bg-blue-50')}>Usar calculado</button>
              {ESTADOS_HEIDECKE.map((e)=>(
                <button key={e.id} onClick={()=>onEstadoManualChange(e.id)} className={cn('px-3 py-1 rounded text-xs border transition-all', estadoManual===e.id?'bg-gray-800 text-white border-gray-800':'bg-white text-gray-600 border-gray-200 hover:bg-gray-50')}>{e.nombre}</button>
              ))}
            </div>
          </div>

          <div className="mt-3 p-3 bg-white rounded-md border border-blue-200">
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-500">Estado adoptado para el cálculo:</span>
              <div className="flex items-center gap-2">
                <Badge variant={badgeVariantPorEstado(estadoFinal.nombre)}>{estadoFinal.nombre}</Badge>
                <span className="font-mono text-sm font-semibold text-gray-800">C = {estadoFinal.c.toFixed(3)}</span>
                {estadoManual!==null&&<span className="text-xs text-orange-600 font-medium">(ajustado por perito)</span>}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
