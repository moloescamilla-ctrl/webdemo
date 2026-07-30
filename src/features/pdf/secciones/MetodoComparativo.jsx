import { Text, View } from '@react-pdf/renderer'
import { styles, COLORES } from '../estilos'
import { sa, formatCurrency, formatNumber } from '../utils'

export default function MetodoComparativo({ metodo }) {
  if (!metodo) return null

  const comparables = (metodo.comparables || []).filter(c => c.precioM2Homologado > 0)

  return (
    <View>
      <Text style={styles.seccionTitulo}>10. METODO COMPARATIVO DE MERCADO</Text>

      <View style={styles.grid2}>
        <View style={styles.col1}>
          <View style={styles.campoFila}>
            <Text style={styles.campoLabel}>Superficie del sujeto</Text>
            <Text style={styles.campoValor}>{`${formatNumber(metodo.superficie_sujeto, 2)} m2`}</Text>
          </View>
          <View style={styles.campoFila}>
            <Text style={styles.campoLabel}>Comparables validos</Text>
            <Text style={styles.campoValor}>{String(comparables.length)}</Text>
          </View>
        </View>
        <View style={styles.col2}>
          <View style={styles.campoFila}>
            <Text style={styles.campoLabel}>Valor unitario ponderado</Text>
            <Text style={[styles.campoValor, { fontFamily: 'Helvetica-Bold' }]}>
              {`${formatNumber(metodo.valor_unitario_ponderado, 2)} $/m2`}
            </Text>
          </View>
        </View>
      </View>

      {comparables.length > 0 && (
        <View style={[styles.tabla, { borderWidth: 0.5, borderColor: COLORES.borde, marginTop: 4 }]}>
          <View style={styles.filaHeader}>
            <Text style={[styles.celdaHeader, { flex: 3 }]}>Comparable</Text>
            <Text style={[styles.celdaHeader, { width: 50, textAlign: 'right' }]}>Sup. m2</Text>
            <Text style={[styles.celdaHeader, { width: 60, textAlign: 'right' }]}>$/m2</Text>
            <Text style={[styles.celdaHeader, { width: 42, textAlign: 'right' }]}>F.Sup</Text>
            <Text style={[styles.celdaHeader, { width: 42, textAlign: 'right' }]}>F.Total</Text>
            <Text style={[styles.celdaHeader, { width: 60, textAlign: 'right' }]}>$/m2 Homo</Text>
          </View>
          {comparables.map((comp, i) => (
            <View key={i} style={i % 2 === 0 ? styles.filaPar : styles.filaImpar}>
              <Text style={[styles.celda, { flex: 3 }]}>{sa(comp.descripcion) || `Comparable ${i + 1}`}</Text>
              <Text style={[styles.celda, { width: 50, textAlign: 'right' }]}>
                {formatNumber(comp.superficie, 0)}
              </Text>
              <Text style={[styles.celda, { width: 60, textAlign: 'right' }]}>
                {formatNumber(comp.precioM2, 2)}
              </Text>
              <Text style={[styles.celda, { width: 42, textAlign: 'right' }]}>
                {formatNumber(comp.factorSuperficie, 4)}
              </Text>
              <Text style={[styles.celda, { width: 42, textAlign: 'right' }]}>
                {formatNumber(comp.factorTotal, 4)}
              </Text>
              <Text style={[styles.celda, { width: 60, textAlign: 'right', fontFamily: 'Helvetica-Bold', color: COLORES.secundario }]}>
                {formatNumber(comp.precioM2Homologado, 2)}
              </Text>
            </View>
          ))}
          <View style={styles.filaFoot}>
            <Text style={[styles.celdaFoot, { flex: 3 }]}>Valor unitario ponderado</Text>
            <Text style={[styles.celdaFoot, { width: 50 }]} />
            <Text style={[styles.celdaFoot, { width: 60 }]} />
            <Text style={[styles.celdaFoot, { width: 42 }]} />
            <Text style={[styles.celdaFoot, { width: 42 }]} />
            <Text style={[styles.celdaFoot, { width: 60, textAlign: 'right' }]}>
              {formatNumber(metodo.valor_unitario_ponderado, 2)}
            </Text>
          </View>
        </View>
      )}

      <View style={styles.cajaVerde}>
        <Text style={styles.resultadoLabel}>Valor comparativo total</Text>
        <Text style={styles.resultadoValor}>{formatCurrency(metodo.valor_comparativo_total)}</Text>
      </View>
    </View>
  )
}
