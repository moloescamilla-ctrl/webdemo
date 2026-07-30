import { Text, View } from '@react-pdf/renderer'
import { styles, COLORES } from '../estilos'
import { sa, formatDate } from '../utils'

export default function Firma({ expediente }) {
  return (
    <View>
      <Text style={styles.seccionTitulo}>16. FIRMA DEL PERITO VALUADOR</Text>

      <View style={styles.grid2}>
        <View style={styles.col1}>
          <View style={styles.campoFila}>
            <Text style={styles.campoLabel}>Nombre completo</Text>
            <Text style={[styles.campoValor, { fontFamily: 'Helvetica-Bold' }]}>
              {sa(expediente.nombre_perito) || '—'}
            </Text>
          </View>
          <View style={styles.campoFila}>
            <Text style={styles.campoLabel}>Cedula profesional DGP</Text>
            <Text style={styles.campoValor}>{sa(expediente.cedula_perito) || '—'}</Text>
          </View>
          <View style={styles.campoFila}>
            <Text style={styles.campoLabel}>Registro SHF / clave</Text>
            <Text style={styles.campoValor}>{sa(expediente.clave_perito) || '—'}</Text>
          </View>
          <View style={styles.campoFila}>
            <Text style={styles.campoLabel}>Fecha del dictamen</Text>
            <Text style={styles.campoValor}>{sa(formatDate(expediente.fecha_inspeccion)) || '—'}</Text>
          </View>
        </View>
        <View style={styles.col2}>
          {/* Espacio para firma */}
          <View style={{
            borderWidth: 1,
            borderColor: COLORES.borde,
            borderRadius: 4,
            height: 80,
            alignItems: 'center',
            justifyContent: 'flex-end',
            paddingBottom: 8,
          }}>
            <Text style={{ fontSize: 7, color: COLORES.gris }}>Firma autografa o e.firma</Text>
          </View>
          <View style={{ marginTop: 6, borderTopWidth: 0.5, borderTopColor: COLORES.texto, paddingTop: 3 }}>
            <Text style={{ fontSize: 7, textAlign: 'center' }}>
              {sa(expediente.nombre_perito) || '_____________________________'}
            </Text>
            <Text style={{ fontSize: 7, color: COLORES.gris, textAlign: 'center' }}>Perito Valuador</Text>
          </View>
        </View>
      </View>

      {/* Nota de validez */}
      <View style={[styles.cajaGris, { marginTop: 24 }]}>
        <Text style={{ fontSize: 7, textAlign: 'center', lineHeight: 1.6 }}>
          {'Este dictamen fue elaborado por el perito valuador registrado, '}
          {'con base en la inspeccion fisica realizada y la investigacion de mercado efectuada. '}
          {'La presente valuacion tiene vigencia de seis (6) meses a partir de la fecha de inspeccion. '}
          {'Cualquier alteracion invalida este documento.'}
        </Text>
      </View>
    </View>
  )
}
