import { Text, View } from '@react-pdf/renderer'
import { styles, COLORES } from '../estilos'
import { sa, formatCurrency, formatDate, numeroALetras } from '../utils'

export default function ResumenEjecutivo({ metodoFisico, metodoComparativo, metodoRentas, metodoResidual, expediente }) {
  const enfoques = [
    { label: 'ENFOQUE COMPARATIVO DE MERCADO',      valor: metodoComparativo?.valor_comparativo_total },
    { label: 'ENFOQUE DE COSTOS',                   valor: metodoFisico?.valor_fisico_total },
    { label: 'ENFOQUE DE CAPITALIZACION DE RENTAS', valor: metodoRentas?.valor_capitalizacion },
    { label: 'ENFOQUE RESIDUAL ESTATICO',           valor: metodoResidual?.valor_residual },
  ]

  const valores = enfoques.map(e => Number(e.valor) || 0).filter(v => v > 0)
  const valorComercial = valores.length > 0
    ? Math.round(valores.reduce((s, v) => s + v, 0) / valores.length)
    : 0
  const letras = numeroALetras(valorComercial)

  return (
    <View>
      <Text style={styles.seccionTituloVerde}>RESUMEN DE ENFOQUES Y VALOR COMERCIAL</Text>

      {/* Tabla de enfoques — siempre 4 filas */}
      <View style={[styles.tabla, { borderWidth: 0.5, borderColor: COLORES.borde }]}>
        <View style={styles.filaHeader}>
          <Text style={[styles.celdaHeader, { flex: 3 }]}>Enfoque de valor aplicado</Text>
          <Text style={[styles.celdaHeader, { flex: 2, textAlign: 'right' }]}>Valor indicado</Text>
        </View>
        {enfoques.map(({ label, valor }, i) => (
          <View key={label} style={i % 2 === 0 ? styles.filaPar : styles.filaImpar}>
            <Text style={[styles.celda, { flex: 3 }]}>{label}</Text>
            <Text style={[styles.celda, {
              flex: 2,
              textAlign: 'right',
              fontFamily: valor ? 'Helvetica-Bold' : 'Helvetica',
              color: valor ? COLORES.texto : COLORES.gris,
            }]}>
              {valor ? formatCurrency(valor) : 'NO APLICA'}
            </Text>
          </View>
        ))}
      </View>

      {/* Consideraciones */}
      <View style={[styles.cajaGris, { marginTop: 6 }]}>
        <Text style={{ fontSize: 8, fontFamily: 'Helvetica-Bold', color: COLORES.primario, marginBottom: 3 }}>
          CONSIDERACIONES PREVIAS A LA CONCLUSION
        </Text>
        <Text style={{ fontSize: 7.5, lineHeight: 1.6 }}>
          {`El suscrito, experto independiente y Perito Valuador Profesional, con base en la `}
          {`investigacion de mercado, la inspeccion fisica del inmueble y la metodologia tecnica `}
          {`aplicada conforme a la normatividad vigente, concluye que el Valor Comercial del `}
          {`inmueble descrito en el presente dictamen valuatorio es el siguiente:`}
        </Text>
      </View>

      {/* Caja valor comercial */}
      <View style={[styles.cajaVerde, { marginTop: 8 }]}>
        <Text style={styles.resultadoLabel}>VALOR COMERCIAL DEL INMUEBLE</Text>
        <Text style={styles.resultadoValor}>{formatCurrency(valorComercial)}</Text>
        <Text style={{ fontSize: 8, color: '#d1fae5', marginTop: 4 }}>
          {`(${letras} PESOS 00/100 M.N.)`}
        </Text>
      </View>

      {/* Línea de fecha */}
      <View style={{
        marginTop: 8,
        borderWidth: 0.5,
        borderColor: COLORES.primario,
        paddingVertical: 7,
        paddingHorizontal: 12,
        backgroundColor: COLORES.grisClaro,
      }}>
        <Text style={{ fontSize: 8, textAlign: 'center', color: COLORES.primario, fontFamily: 'Helvetica-Bold' }}>
          {`ESTA CANTIDAD REPRESENTA EL VALOR COMERCIAL DEL INMUEBLE AL DIA: ${sa(formatDate(expediente?.fecha_inspeccion))}`}
        </Text>
      </View>
    </View>
  )
}
