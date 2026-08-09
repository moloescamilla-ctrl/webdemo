import { Text, View, Image } from '@react-pdf/renderer'
import { styles, COLORES } from '../estilos'
import { sa, formatDate } from '../utils'

export default function Firma({ expediente, perfil, firmaPerito }) {
  const nombrePerito = perfil?.nombre || expediente?.nombre_perito || ''
  const cedulaPerito = perfil?.cedula  || expediente?.cedula_perito  || ''
  const clavePerito  = expediente?.clave_perito || ''

  return (
    <View>
      <Text style={styles.seccionTitulo}>16. FIRMA DEL PERITO VALUADOR</Text>

      <View style={styles.grid2}>
        <View style={styles.col1}>
          <View style={styles.campoFila}>
            <Text style={styles.campoLabel}>Nombre completo</Text>
            <Text style={[styles.campoValor, { fontFamily: 'Helvetica-Bold' }]}>
              {sa(nombrePerito) || '—'}
            </Text>
          </View>
          <View style={styles.campoFila}>
            <Text style={styles.campoLabel}>Cédula profesional DGP</Text>
            <Text style={styles.campoValor}>{sa(cedulaPerito) || '—'}</Text>
          </View>
          <View style={styles.campoFila}>
            <Text style={styles.campoLabel}>Registro SHF / clave</Text>
            <Text style={styles.campoValor}>{sa(clavePerito) || '—'}</Text>
          </View>
          <View style={styles.campoFila}>
            <Text style={styles.campoLabel}>Fecha del dictamen</Text>
            <Text style={styles.campoValor}>{sa(formatDate(expediente?.fecha_inspeccion)) || '—'}</Text>
          </View>
        </View>

        <View style={styles.col2}>
          {/* Cuadro de firma */}
          <View style={{
            borderWidth: 1,
            borderColor: COLORES.borde,
            borderRadius: 4,
            height: 80,
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden',
          }}>
            {firmaPerito ? (
              <Image
                src={firmaPerito}
                style={{ width: '90%', height: '90%', objectFit: 'contain' }}
              />
            ) : (
              <Text style={{ fontSize: 7, color: COLORES.gris }}>Firma autógrafa o e.firma</Text>
            )}
          </View>

          <View style={{ marginTop: 6, borderTopWidth: 0.5, borderTopColor: COLORES.texto, paddingTop: 3 }}>
            <Text style={{ fontSize: 7, textAlign: 'center' }}>
              {sa(nombrePerito) || '_____________________________'}
            </Text>
            <Text style={{ fontSize: 7, color: COLORES.gris, textAlign: 'center' }}>Perito Valuador</Text>
            {cedulaPerito ? (
              <Text style={{ fontSize: 6.5, color: COLORES.gris, textAlign: 'center', marginTop: 1 }}>
                {`Cédula: ${cedulaPerito}`}
              </Text>
            ) : null}
          </View>
        </View>
      </View>

      {/* Nota de validez */}
      <View style={[styles.cajaGris, { marginTop: 24 }]}>
        <Text style={{ fontSize: 7, textAlign: 'center', lineHeight: 1.6 }}>
          {'Este dictamen fue elaborado por el perito valuador registrado, '}
          {'con base en la inspección física realizada y la investigación de mercado efectuada. '}
          {'La presente valuación tiene vigencia de seis (6) meses a partir de la fecha de inspección. '}
          {'Cualquier alteración invalida este documento.'}
        </Text>
      </View>
    </View>
  )
}
