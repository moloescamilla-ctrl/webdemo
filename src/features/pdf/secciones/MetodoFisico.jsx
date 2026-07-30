import { Text, View } from '@react-pdf/renderer'
import { styles, COLORES } from '../estilos'
import { sa, formatCurrency, formatNumber } from '../utils'

function Campo({ label, value }) {
  return (
    <View style={styles.campoFila}>
      <Text style={styles.campoLabel}>{label}</Text>
      <Text style={styles.campoValor}>{sa(value) || '—'}</Text>
    </View>
  )
}

export default function MetodoFisico({ metodo, inspeccion }) {
  if (!metodo) return null

  const esTerrenoSolo = metodo.superficie_construccion === 0
  const depPct = Math.min(Number(metodo.porcentaje_depreciacion) || 0, 100)

  return (
    <View>
      <Text style={styles.seccionTitulo}>
        {esTerrenoSolo ? '9. METODO FISICO — TERRENO SIN CONSTRUCCION' : '9. METODO FISICO / COSTOS — ROSS HEIDECKE'}
      </Text>

      <View style={styles.grid2}>
        <View style={styles.col1}>
          {!esTerrenoSolo && (
            <>
              <Campo label="Superficie construccion" value={`${formatNumber(metodo.superficie_construccion, 2)} m2`} />
              <Campo label="Costo reposicion /m2" value={formatCurrency(metodo.costo_reposicion_m2)} />
              <Campo label="Edad" value={`${metodo.edad_anios} anos`} />
              <Campo label="Vida util" value={`${metodo.vida_util_anios} anos`} />
              <Campo label="Valor residual" value={`${metodo.valor_residual_pct}%`} />
            </>
          )}
          <Campo label="Superficie terreno" value={`${formatNumber(metodo.superficie_terreno, 2)} m2`} />
          <Campo label="Valor unitario terreno /m2" value={formatCurrency(metodo.valor_unitario_terreno)} />
        </View>
        <View style={styles.col2}>
          {!esTerrenoSolo && (
            <>
              <Campo label="Valor reposicion nuevo (VRN)" value={formatCurrency(metodo.valor_reposicion_nuevo)} />
              <Campo label="Factor Ross (A)" value={formatNumber(metodo.factor_ross, 4)} />
              <Campo label="Coef. Heidecke (C adoptado)" value={formatNumber(metodo.coeficiente_c_adoptado, 4)} />
              <Campo label="Factor depreciacion" value={formatNumber(metodo.factor_depreciacion, 4)} />
            </>
          )}
          <Campo label="Valor del terreno" value={formatCurrency(metodo.valor_terreno)} />
        </View>
      </View>

      {!esTerrenoSolo && (
        <View>
          {/* Barra depreciación */}
          <View style={{ marginBottom: 4 }}>
            <View style={{ height: 6, backgroundColor: COLORES.grisClaro, borderRadius: 3 }}>
              <View style={{
                height: 6, backgroundColor: COLORES.rojo, borderRadius: 3,
                width: `${depPct}%`,
              }} />
            </View>
            <Text style={[styles.nota, { textAlign: 'right', color: COLORES.rojo }]}>
              {`${formatNumber(depPct, 2)}% depreciado | Depreciacion: ${formatCurrency(metodo.depreciacion_pesos)}`}
            </Text>
          </View>

          {/* Mini-cuadros */}
          <View style={styles.grid2}>
            <View style={[styles.cajaGris, styles.col1, { marginRight: 8 }]}>
              <Text style={{ fontSize: 7, color: COLORES.gris }}>Valor actual construccion</Text>
              <Text style={{ fontSize: 10, fontFamily: 'Helvetica-Bold', marginTop: 2 }}>
                {formatCurrency(metodo.valor_actual_construccion)}
              </Text>
            </View>
            <View style={[styles.cajaGris, styles.col2]}>
              <Text style={{ fontSize: 7, color: COLORES.gris }}>Valor del terreno</Text>
              <Text style={{ fontSize: 10, fontFamily: 'Helvetica-Bold', marginTop: 2 }}>
                {formatCurrency(metodo.valor_terreno)}
              </Text>
            </View>
          </View>
        </View>
      )}

      <View style={styles.cajaAzul}>
        <Text style={styles.resultadoLabel}>
          {esTerrenoSolo ? 'Valor del terreno (Metodo Fisico)' : 'Valor fisico total'}
        </Text>
        <Text style={styles.resultadoValor}>{formatCurrency(metodo.valor_fisico_total)}</Text>
      </View>
    </View>
  )
}
