import { Text, View } from '@react-pdf/renderer'
import { styles, COLORES } from '../estilos'
import { sa, formatNumber } from '../utils'
import { PARTIDAS_INSPECCION, ESTADOS_PARTIDA } from '../../metodo-fisico/calculosRossHeidecke'

export default function Inspeccion({ inspeccion }) {
  if (!inspeccion) return null

  const puntaje = Number(inspeccion.puntaje_heidecke) || 0
  const maxPuntaje = 4.0

  return (
    <View>
      <Text style={styles.seccionTitulo}>8. ESTADO DE CONSERVACION — ROSS HEIDECKE</Text>

      {/* Tabla partidas */}
      <View style={[styles.tabla, { borderWidth: 0.5, borderColor: COLORES.borde }]}>
        <View style={styles.filaHeader}>
          <Text style={[styles.celdaHeader, { flex: 3 }]}>Partida</Text>
          <Text style={[styles.celdaHeader, { width: 40, textAlign: 'center' }]}>Peso</Text>
          <Text style={[styles.celdaHeader, { width: 60, textAlign: 'center' }]}>Estado</Text>
          <Text style={[styles.celdaHeader, { width: 55, textAlign: 'right' }]}>Penalizacion</Text>
        </View>
        {PARTIDAS_INSPECCION.map((p, i) => {
          const valorEstado = Number(inspeccion[p.id] ?? 0)
          const estadoPartida = ESTADOS_PARTIDA.find(e => e.valor === valorEstado) || ESTADOS_PARTIDA[0]
          const penalizacion = estadoPartida.penalizacion * p.peso
          return (
            <View key={p.id} style={i % 2 === 0 ? styles.filaPar : styles.filaImpar}>
              <Text style={[styles.celda, { flex: 3 }]}>{sa(p.nombre)}</Text>
              <Text style={[styles.celda, { width: 40, textAlign: 'center' }]}>
                {`${(p.peso * 100).toFixed(0)}%`}
              </Text>
              <Text style={[styles.celda, { width: 60, textAlign: 'center' }]}>
                {sa(estadoPartida.etiqueta)}
              </Text>
              <Text style={[styles.celda, { width: 55, textAlign: 'right' }]}>
                {formatNumber(penalizacion, 4)}
              </Text>
            </View>
          )
        })}
        <View style={styles.filaFoot}>
          <Text style={[styles.celdaFoot, { flex: 3 }]}>Puntaje Heidecke total</Text>
          <Text style={[styles.celdaFoot, { width: 40 }]} />
          <Text style={[styles.celdaFoot, { width: 60 }]} />
          <Text style={[styles.celdaFoot, { width: 55, textAlign: 'right' }]}>
            {formatNumber(puntaje, 4)}
          </Text>
        </View>
      </View>

      {/* Resultado */}
      <View style={styles.grid2}>
        <View style={styles.col1}>
          <View style={styles.campoFila}>
            <Text style={styles.campoLabel}>Estado Heidecke</Text>
            <Text style={[styles.campoValor, { fontFamily: 'Helvetica-Bold' }]}>
              {sa(inspeccion.estado_heidecke) || '—'}
            </Text>
          </View>
          <View style={styles.campoFila}>
            <Text style={styles.campoLabel}>Coeficiente C (automatico)</Text>
            <Text style={styles.campoValor}>{formatNumber(inspeccion.coeficiente_c, 3)}</Text>
          </View>
        </View>
        <View style={styles.col2}>
          {inspeccion.estado_manual && (
            <>
              <View style={styles.campoFila}>
                <Text style={styles.campoLabel}>Estado ajustado por perito</Text>
                <Text style={[styles.campoValor, { fontFamily: 'Helvetica-Bold' }]}>
                  {sa(inspeccion.estado_manual)}
                </Text>
              </View>
              <View style={styles.campoFila}>
                <Text style={styles.campoLabel}>Coeficiente C (adoptado)</Text>
                <Text style={styles.campoValor}>{formatNumber(inspeccion.coeficiente_c_manual, 3)}</Text>
              </View>
            </>
          )}
        </View>
      </View>

      {/* Barra de estado */}
      <View style={{ marginTop: 6 }}>
        <View style={{ height: 6, backgroundColor: COLORES.grisClaro, borderRadius: 3 }}>
          <View style={{
            height: 6,
            backgroundColor: puntaje < 0.5 ? COLORES.acento : puntaje < 1.5 ? '#F59E0B' : COLORES.rojo,
            borderRadius: 3,
            width: `${Math.min((puntaje / maxPuntaje) * 100, 100)}%`,
          }} />
        </View>
        <Text style={[styles.nota, { textAlign: 'right' }]}>
          {`Puntaje: ${formatNumber(puntaje, 4)} / ${maxPuntaje}`}
        </Text>
      </View>
    </View>
  )
}
