import { Text, View } from '@react-pdf/renderer'
import { styles, COLORES } from '../estilos'
import { formatCurrency, formatNumber } from '../utils'

function Campo({ label, value }) {
  return (
    <View style={styles.campoFila}>
      <Text style={styles.campoLabel}>{label}</Text>
      <Text style={styles.campoValor}>{value || '—'}</Text>
    </View>
  )
}

export default function MetodoRentas({ metodo }) {
  if (!metodo) return null

  const esDirecta    = metodo.variante === 'directa'
  const esComponentes = metodo.variante === 'componentes'
  const tcEfectivo   = esDirecta
    ? Number(metodo.tc_global)
    : (Number(metodo.tc_tasa_libre_riesgo) || 0)
      + (Number(metodo.tc_prima_riesgo_inmueble) || 0)
      + (Number(metodo.tc_prima_iliquidez) || 0)
      + (Number(metodo.tc_depreciacion) || 0)
      + (Number(metodo.tc_gastos_no_recuperables) || 0)

  return (
    <View>
      <Text style={styles.seccionTitulo}>11. METODO DE RENTAS — CAPITALIZACION</Text>

      <View style={styles.grid2}>
        <View style={styles.col1}>
          <Campo label="Variante" value={metodo.variante} />
          <Campo label="Modo RNA" value={metodo.modo_rna} />
          <Campo label="Renta mensual bruta" value={formatCurrency(metodo.renta_mensual_bruta)} />
          <Campo label="Vacancia" value={`${formatNumber(metodo.vacancia_pct, 1)}%`} />
          <Campo label="Gastos operacion" value={`${formatNumber(metodo.gastos_operacion_pct, 1)}%`} />
          <Campo label="RNA (Renta Neta Anual)" value={formatCurrency(metodo.rna)} />
        </View>
        <View style={styles.col2}>
          {esDirecta ? (
            <Campo label="Tasa de capitalizacion" value={`${formatNumber(metodo.tc_global, 2)}%`} />
          ) : (
            <>
              <Campo label="Tasa libre de riesgo" value={`${formatNumber(metodo.tc_tasa_libre_riesgo, 2)}%`} />
              <Campo label="Prima riesgo inmueble" value={`${formatNumber(metodo.tc_prima_riesgo_inmueble, 2)}%`} />
              <Campo label="Prima iliquidez" value={`${formatNumber(metodo.tc_prima_iliquidez, 2)}%`} />
              <Campo label="Depreciacion" value={`${formatNumber(metodo.tc_depreciacion, 2)}%`} />
              <Campo label="Gastos no recuperables" value={`${formatNumber(metodo.tc_gastos_no_recuperables, 2)}%`} />
              <Campo label="TC efectiva (suma)" value={`${formatNumber(tcEfectivo, 2)}%`} />
            </>
          )}
        </View>
      </View>

      {esComponentes && metodo.proporcion_tierra_pct > 0 && (
        <View style={{ marginTop: 4 }}>
          <View style={[styles.tabla, { borderWidth: 0.5, borderColor: COLORES.borde }]}>
            <View style={styles.filaHeader}>
              <Text style={[styles.celdaHeader, { flex: 2 }]}>Componente</Text>
              <Text style={[styles.celdaHeader, { flex: 1, textAlign: 'right' }]}>Valor</Text>
            </View>
            {[
              ['Valor total por capitalizacion', metodo.valor_capitalizacion],
              ['Valor tierra', metodo.valor_tierra_capitalizacion],
              ['Valor construccion', metodo.valor_construccion_capitalizacion],
            ].map(([label, val], i) => (
              <View key={label} style={i % 2 === 0 ? styles.filaPar : styles.filaImpar}>
                <Text style={[styles.celda, { flex: 2 }]}>{label}</Text>
                <Text style={[styles.celda, { flex: 1, textAlign: 'right' }]}>{formatCurrency(val)}</Text>
              </View>
            ))}
          </View>
        </View>
      )}

      <View style={styles.cajaAzul}>
        <Text style={styles.resultadoLabel}>Valor por capitalizacion de rentas</Text>
        <Text style={styles.resultadoValor}>{formatCurrency(metodo.valor_capitalizacion)}</Text>
      </View>

      {metodo.notas_valuador && (
        <View style={[styles.cajaGris, { marginTop: 6 }]}>
          <Text style={{ fontSize: 7, fontFamily: 'Helvetica-Bold', marginBottom: 2 }}>Notas del valuador</Text>
          <Text style={{ fontSize: 7 }}>{metodo.notas_valuador}</Text>
        </View>
      )}
    </View>
  )
}
