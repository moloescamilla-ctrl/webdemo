import { Text, View } from '@react-pdf/renderer'
import { styles, COLORES } from '../estilos'
import { sa, formatCurrency, formatDate, numeroALetras } from '../utils'

const CLAVE_LABEL = {
  fisico:      'Método Físico / Costos',
  comparativo: 'Método Comparativo de Mercado',
  rentas:      'Método de Rentas (Capitalización)',
  residual:    'Método Residual Estático',
}

export default function Conclusion({ metodoFisico, metodoComparativo, metodoRentas, metodoResidual, expediente }) {
  const metodos = [
    metodoFisico      && { clave: 'fisico',      label: metodoFisico.valor_mercado_estimado ? 'Método Físico / Costos (con fc)' : 'Método Físico / Costos', valor: metodoFisico.valor_mercado_estimado || metodoFisico.valor_fisico_total },
    metodoComparativo && { clave: 'comparativo', label: 'Método Comparativo de Mercado',     valor: metodoComparativo.valor_comparativo_total },
    metodoRentas      && { clave: 'rentas',      label: 'Método de Rentas (Capitalización)', valor: metodoRentas.valor_capitalizacion },
    metodoResidual    && { clave: 'residual',    label: 'Método Residual Estático',          valor: metodoResidual.valor_residual },
  ].filter(Boolean)

  const metodoElegido = expediente?.metodo_elegido
  const elegido = metodoElegido ? metodos.find(m => m.clave === metodoElegido) : null
  const valores = metodos.map(m => Number(m.valor) || 0).filter(v => v > 0)
  const valorComercial = elegido
    ? Math.round(Number(elegido.valor) || 0)
    : valores.length > 0 ? valores[0] : 0
  const labelAdoptado = elegido ? CLAVE_LABEL[metodoElegido] : 'Primer método disponible'

  const variacion = valores.length >= 2
    ? (Math.max(...valores) - Math.min(...valores)) / Math.min(...valores) * 100
    : null
  const variacionAlerta = variacion !== null && variacion > 30

  const letras = numeroALetras(valorComercial)

  return (
    <View>
      <Text style={styles.seccionTitulo}>13. CONCLUSIÓN Y VALOR COMERCIAL</Text>

      {/* Tabla resumen */}
      <View style={[styles.tabla, { borderWidth: 0.5, borderColor: COLORES.borde }]}>
        <View style={styles.filaHeader}>
          <Text style={[styles.celdaHeader, { flex: 3 }]}>Método aplicado</Text>
          <Text style={[styles.celdaHeader, { flex: 2, textAlign: 'right' }]}>Valor obtenido</Text>
        </View>
        {metodos.map(({ label, valor }, i) => (
          <View key={label} style={i % 2 === 0 ? styles.filaPar : styles.filaImpar}>
            <Text style={[styles.celda, { flex: 3 }]}>{label}</Text>
            <Text style={[styles.celda, { flex: 2, textAlign: 'right', fontFamily: 'Roboto', fontWeight: 'bold' }]}>
              {formatCurrency(valor)}
            </Text>
          </View>
        ))}
        <View style={styles.filaFoot}>
          <Text style={[styles.celdaFoot, { flex: 3 }]}>
            {`Valor comercial adoptado (${labelAdoptado})`}
          </Text>
          <Text style={[styles.celdaFoot, { flex: 2, textAlign: 'right', color: COLORES.acento }]}>
            {formatCurrency(valorComercial)}
          </Text>
        </View>
      </View>

      {/* Alerta variacion > 30% */}
      {variacionAlerta && (
        <View style={{ marginTop: 6, padding: 6, backgroundColor: '#FEF2F2', borderWidth: 0.5, borderColor: '#FECACA' }}>
          <Text style={{ fontSize: 7.5, color: '#B91C1C', fontFamily: 'Roboto', fontWeight: 'bold' }}>
            {`ATENCIÓN: La variación entre métodos (${variacion.toFixed(1)}%) supera el límite admisible del 30% (SHF / INDAABIN). Revise la consistencia de los métodos aplicados.`}
          </Text>
        </View>
      )}

      {/* Caja valor comercial */}
      <View style={styles.cajaVerde}>
        <Text style={styles.resultadoLabel}>VALOR COMERCIAL DEL INMUEBLE</Text>
        <Text style={styles.resultadoValor}>{formatCurrency(valorComercial)}</Text>
        <Text style={{ fontSize: 8, color: '#d1fae5', marginTop: 4 }}>
          {`(${letras} PESOS 00/100 M.N.)`}
        </Text>
      </View>

      <View style={[styles.cajaGris, { marginTop: 8 }]}>
        <Text style={{ fontSize: 8 }}>
          {'El valor comercial expresado representa la estimación del valor de mercado del inmueble '}
          {'objeto de valuación, con base en la metodología aplicada y los datos de mercado disponibles '}
          {`a la fecha de inspección: ${sa(formatDate(expediente?.fecha_inspeccion))}.`}
        </Text>
      </View>
    </View>
  )
}
