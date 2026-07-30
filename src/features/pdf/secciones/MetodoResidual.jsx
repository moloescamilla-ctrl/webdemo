import { Text, View } from '@react-pdf/renderer'
import { styles, COLORES } from '../estilos'
import { sa, formatCurrency, formatNumber } from '../utils'

const CI_LABELS = {
  costoConstuccion:  'Costo de construccion / remodelacion',
  proyecto:          'Proyecto y diseno',
  permisos:          'Permisos y licencias',
  gestion:           'Gestion y administracion',
  comercializacion:  'Comercializacion y ventas',
  financiamiento:    'Financiamiento',
  imprevistos:       'Imprevistos',
}

export default function MetodoResidual({ metodo }) {
  if (!metodo) return null

  const vmTotal      = Number(metodo.vm_total) || 0
  const ciTotal      = Number(metodo.ci_total) || 0
  const utilPesos    = Number(metodo.utilidad_pesos) || 0
  const valResidual  = Number(metodo.valor_residual) || 0
  const esViable     = valResidual > 0

  const costoConst   = (Number(metodo.superficie_proyecto_m2) || 0) * (Number(metodo.costo_construccion_m2) || 0)
  const pcts = [
    ['proyecto',        metodo.proyecto_pct],
    ['permisos',        metodo.permisos_pct],
    ['gestion',         metodo.gestion_pct],
    ['comercializacion',metodo.comercializacion_pct],
    ['financiamiento',  metodo.financiamiento_pct],
    ['imprevistos',     metodo.imprevistos_pct],
  ]

  return (
    <View>
      <Text style={styles.seccionTitulo}>12. METODO RESIDUAL ESTATICO</Text>

      <View style={styles.grid2}>
        <View style={styles.col1}>
          <View style={styles.campoFila}>
            <Text style={styles.campoLabel}>Caso de uso</Text>
            <Text style={styles.campoValor}>{sa(metodo.caso_uso)}</Text>
          </View>
          <View style={styles.campoFila}>
            <Text style={styles.campoLabel}>Descripcion del proyecto</Text>
            <Text style={styles.campoValor}>{sa(metodo.descripcion_proyecto) || '—'}</Text>
          </View>
          <View style={styles.campoFila}>
            <Text style={styles.campoLabel}>Sup. proyecto m2</Text>
            <Text style={styles.campoValor}>{formatNumber(metodo.superficie_proyecto_m2, 2)}</Text>
          </View>
          <View style={styles.campoFila}>
            <Text style={styles.campoLabel}>Sup. terreno m2</Text>
            <Text style={styles.campoValor}>{formatNumber(metodo.superficie_terreno_m2, 2)}</Text>
          </View>
        </View>
        <View style={styles.col2}>
          <View style={styles.campoFila}>
            <Text style={styles.campoLabel}>VM total (producto terminado)</Text>
            <Text style={[styles.campoValor, { fontFamily: 'Helvetica-Bold' }]}>{formatCurrency(vmTotal)}</Text>
          </View>
          {metodo.vm_fuente && (
            <View style={styles.campoFila}>
              <Text style={styles.campoLabel}>Fuente VM</Text>
              <Text style={styles.campoValor}>{sa(metodo.vm_fuente)}</Text>
            </View>
          )}
          <View style={styles.campoFila}>
            <Text style={styles.campoLabel}>Costo construccion /m2</Text>
            <Text style={styles.campoValor}>{formatCurrency(metodo.costo_construccion_m2)}</Text>
          </View>
          <View style={styles.campoFila}>
            <Text style={styles.campoLabel}>Utilidad del promotor</Text>
            <Text style={styles.campoValor}>{`${formatNumber(metodo.utilidad_pct, 1)}% = ${formatCurrency(utilPesos)}`}</Text>
          </View>
        </View>
      </View>

      {/* Tabla Ci */}
      <Text style={{ fontSize: 8, fontFamily: 'Helvetica-Bold', marginTop: 6, marginBottom: 3 }}>
        Desglose del Costo de Inversion (Ci)
      </Text>
      <View style={[styles.tabla, { borderWidth: 0.5, borderColor: COLORES.borde }]}>
        <View style={styles.filaHeader}>
          <Text style={[styles.celdaHeader, { flex: 3 }]}>Concepto</Text>
          <Text style={[styles.celdaHeader, { width: 40, textAlign: 'right' }]}>%</Text>
          <Text style={[styles.celdaHeader, { width: 80, textAlign: 'right' }]}>Importe $</Text>
        </View>

        {/* Construccion */}
        <View style={styles.filaPar}>
          <Text style={[styles.celda, { flex: 3 }]}>{CI_LABELS.costoConstuccion}</Text>
          <Text style={[styles.celda, { width: 40, textAlign: 'right' }]}>—</Text>
          <Text style={[styles.celda, { width: 80, textAlign: 'right' }]}>{formatCurrency(costoConst)}</Text>
        </View>

        {pcts.map(([key, pct], i) => {
          const importe = vmTotal * ((Number(pct) || 0) / 100)
          return (
            <View key={key} style={(i + 1) % 2 === 0 ? styles.filaPar : styles.filaImpar}>
              <Text style={[styles.celda, { flex: 3 }]}>{CI_LABELS[key]}</Text>
              <Text style={[styles.celda, { width: 40, textAlign: 'right' }]}>{`${formatNumber(pct, 1)}%`}</Text>
              <Text style={[styles.celda, { width: 80, textAlign: 'right' }]}>{formatCurrency(importe)}</Text>
            </View>
          )
        })}

        <View style={styles.filaFoot}>
          <Text style={[styles.celdaFoot, { flex: 3 }]}>Ci Total</Text>
          <Text style={[styles.celdaFoot, { width: 40 }]} />
          <Text style={[styles.celdaFoot, { width: 80, textAlign: 'right' }]}>{formatCurrency(ciTotal)}</Text>
        </View>
      </View>

      {/* Resumen F = VM - Ci - Up */}
      <View style={[styles.tabla, { borderWidth: 0.5, borderColor: COLORES.borde, marginTop: 6 }]}>
        <View style={styles.filaHeader}>
          <Text style={[styles.celdaHeader, { flex: 2 }]}>Formula: F = VM - Ci - Up</Text>
          <Text style={[styles.celdaHeader, { flex: 1, textAlign: 'right' }]}>Importe</Text>
        </View>
        {[
          ['VM — Valor de mercado', vmTotal],
          ['Ci — Costo de inversion', -ciTotal],
          ['Up — Utilidad del promotor', -utilPesos],
        ].map(([label, val], i) => (
          <View key={label} style={i % 2 === 0 ? styles.filaPar : styles.filaImpar}>
            <Text style={[styles.celda, { flex: 2 }]}>{label}</Text>
            <Text style={[styles.celda, { flex: 1, textAlign: 'right' }]}>{formatCurrency(val)}</Text>
          </View>
        ))}
      </View>

      <View style={esViable ? styles.cajaVerde : [styles.cajaAzul, { backgroundColor: COLORES.rojo }]}>
        <Text style={styles.resultadoLabel}>
          {esViable ? 'Valor Residual (viable)' : 'Valor Residual (no viable)'}
        </Text>
        <Text style={styles.resultadoValor}>{formatCurrency(valResidual)}</Text>
        {metodo.valor_residual_m2_terreno && (
          <Text style={{ fontSize: 8, color: '#d1fae5', marginTop: 2 }}>
            {`${formatCurrency(metodo.valor_residual_m2_terreno)} / m2 de terreno`}
          </Text>
        )}
      </View>

      {metodo.notas_valuador && (
        <View style={[styles.cajaGris, { marginTop: 6 }]}>
          <Text style={{ fontSize: 7, fontFamily: 'Helvetica-Bold', marginBottom: 2 }}>Notas del valuador</Text>
          <Text style={{ fontSize: 7 }}>{sa(metodo.notas_valuador)}</Text>
        </View>
      )}
    </View>
  )
}
