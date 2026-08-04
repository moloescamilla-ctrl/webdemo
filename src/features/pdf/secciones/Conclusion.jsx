import { Text, View } from '@react-pdf/renderer'
import { styles, COLORES } from '../estilos'
import { sa, formatCurrency, formatDate, numeroALetras } from '../utils'

const CLAVE_LABEL = {
  fisico:      'Metodo Fisico / Costos',
  comparativo: 'Metodo Comparativo de Mercado',
  rentas:      'Metodo de Rentas (Capitalizacion)',
  residual:    'Metodo Residual Estatico',
}

export default function Conclusion({ metodoFisico, metodoComparativo, metodoRentas, metodoResidual, expediente }) {
  const metodos = [
    metodoFisico      && { clave: 'fisico',      label: 'Metodo Fisico / Costos',           valor: metodoFisico.valor_fisico_total },
    metodoComparativo && { clave: 'comparativo', label: 'Metodo Comparativo de Mercado',     valor: metodoComparativo.valor_comparativo_total },
    metodoRentas      && { clave: 'rentas',      label: 'Metodo de Rentas (Capitalizacion)', valor: metodoRentas.valor_capitalizacion },
    metodoResidual    && { clave: 'residual',    label: 'Metodo Residual Estatico',          valor: metodoResidual.valor_residual },
  ].filter(Boolean)

  const metodoElegido = expediente?.metodo_elegido
  const elegido = metodoElegido ? metodos.find(m => m.clave === metodoElegido) : null
  const valores = metodos.map(m => Number(m.valor) || 0).filter(v => v > 0)
  const valorComercial = elegido
    ? Math.round(Number(elegido.valor) || 0)
    : valores.length > 0 ? valores[0] : 0
  const labelAdoptado = elegido ? CLAVE_LABEL[metodoElegido] : 'Primer metodo disponible'

  const variacion = valores.length >= 2
    ? (Math.max(...valores) - Math.min(...valores)) / Math.min(...valores) * 100
    : null
  const variacionAlerta = variacion !== null && variacion > 30

  const letras = numeroALetras(valorComercial)

  return (
    <View>
      <Text style={styles.seccionTitulo}>13. CONCLUSION Y VALOR COMERCIAL</Text>

      {/* Tabla resumen */}
      <View style={[styles.tabla, { borderWidth: 0.5, borderColor: COLORES.borde }]}>
        <View style={styles.filaHeader}>
          <Text style={[styles.celdaHeader, { flex: 3 }]}>Metodo aplicado</Text>
          <Text style={[styles.celdaHeader, { flex: 2, textAlign: 'right' }]}>Valor obtenido</Text>
        </View>
        {metodos.map(({ label, valor }, i) => (
          <View key={label} style={i % 2 === 0 ? styles.filaPar : styles.filaImpar}>
            <Text style={[styles.celda, { flex: 3 }]}>{label}</Text>
            <Text style={[styles.celda, { flex: 2, textAlign: 'right', fontFamily: 'Helvetica-Bold' }]}>
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
          <Text style={{ fontSize: 7.5, color: '#B91C1C', fontFamily: 'Helvetica-Bold' }}>
            {`ATENCION: La variacion entre metodos (${variacion.toFixed(1)}%) supera el limite admisible del 30% (SHF / INDAABIN). Revise la consistencia de los metodos aplicados.`}
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
          {'El valor comercial expresado representa la estimacion del valor de mercado del inmueble '}
          {'objeto de valuacion, con base en la metodologia aplicada y los datos de mercado disponibles '}
          {`a la fecha de inspeccion: ${sa(formatDate(expediente?.fecha_inspeccion))}.`}
        </Text>
      </View>
    </View>
  )
}
