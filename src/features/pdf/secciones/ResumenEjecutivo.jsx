import { Text, View } from '@react-pdf/renderer'
import { styles, COLORES } from '../estilos'
import { sa, formatCurrency, formatDate, numeroALetras } from '../utils'

const CLAVES_ENFOQUE = {
  comparativo: 'ENFOQUE COMPARATIVO DE MERCADO',
  fisico:      'ENFOQUE DE COSTOS',
  rentas:      'ENFOQUE DE CAPITALIZACION DE RENTAS',
  residual:    'ENFOQUE RESIDUAL ESTATICO',
}

export default function ResumenEjecutivo({ metodoFisico, metodoComparativo, metodoRentas, metodoResidual, expediente }) {
  const enfoques = [
    { clave: 'comparativo', label: 'ENFOQUE COMPARATIVO DE MERCADO',      valor: metodoComparativo?.valor_comparativo_total },
    { clave: 'fisico',      label: 'ENFOQUE DE COSTOS',                   valor: metodoFisico?.valor_fisico_total },
    { clave: 'rentas',      label: 'ENFOQUE DE CAPITALIZACION DE RENTAS', valor: metodoRentas?.valor_capitalizacion },
    { clave: 'residual',    label: 'ENFOQUE RESIDUAL ESTATICO',           valor: metodoResidual?.valor_residual },
  ]

  const metodoElegido = expediente?.metodo_elegido
  const elegido = metodoElegido ? enfoques.find(e => e.clave === metodoElegido) : null
  const valores = enfoques.map(e => Number(e.valor) || 0).filter(v => v > 0)
  const valorComercial = elegido
    ? Math.round(Number(elegido.valor) || 0)
    : valores.length > 0 ? valores[0] : 0

  const variacion = valores.length >= 2
    ? (Math.max(...valores) - Math.min(...valores)) / Math.min(...valores) * 100
    : null
  const variacionAlerta = variacion !== null && variacion > 30

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

      {/* Alerta variacion > 30% */}
      {variacionAlerta && (
        <View style={{ marginTop: 6, padding: 6, backgroundColor: '#FEF2F2', borderWidth: 0.5, borderColor: '#FECACA' }}>
          <Text style={{ fontSize: 7.5, color: '#B91C1C', fontFamily: 'Helvetica-Bold' }}>
            {`ATENCION: La variacion entre enfoques (${variacion.toFixed(1)}%) supera el limite admisible del 30% (SHF / INDAABIN).`}
          </Text>
        </View>
      )}

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
        {elegido && (
          <Text style={{ fontSize: 7, color: '#86efac', marginBottom: 3 }}>
            {`Metodo adoptado: ${CLAVES_ENFOQUE[elegido.clave] || elegido.label}`}
          </Text>
        )}
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
