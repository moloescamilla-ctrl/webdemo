import { Text, View } from '@react-pdf/renderer'
import { styles, COLORES } from '../estilos'

const VERIFICACIONES_SHF = [
  'Se realizó inspección física del inmueble en la fecha indicada',
  'Se verificó la identidad del inmueble con la escritura pública',
  'Se constató el uso de suelo autorizado y el régimen de propiedad',
  'Se compararon los datos físicos del inmueble con los documentos legales',
  'Se investigaron ofertas de compraventa en la zona para el método comparativo',
  'Se aplicó la metodología de valuación conforme a las Reglas SHF vigentes',
  'El valuador no tiene interés financiero ni personal en el inmueble valuado',
  'El avalúo fue elaborado de manera imparcial y objetiva',
  'Los valores declarados son vigentes a la fecha de inspección indicada',
]

export default function Declaraciones() {
  return (
    <View>
      <Text style={styles.seccionTitulo}>14. DECLARACIONES Y ADVERTENCIAS</Text>

      <Text style={{ fontSize: 8, marginBottom: 6, lineHeight: 1.5 }}>
        {'El presente dictamen valuatorio ha sido elaborado de conformidad con las Reglas de caracter general '}
        {'de metodología de valuación emitidas por la Sociedad Hipotecaria Federal (SHF), aplicando los métodos '}
        {'de valuación reconocidos internacionalmente: Método Físico o de Costos, Método de Mercado o Comparativo '}
        {'y, cuando aplica, el Método de Capitalización de Rentas y el Método Residual Estático.'}
      </Text>

      <Text style={{ fontSize: 8, marginBottom: 6, lineHeight: 1.5 }}>
        {'El valor expresado en este dictamen es válido únicamente a la fecha de inspección indicada y '}
        {'tiene una vigencia de seis (6) meses. Las condiciones del mercado inmobiliario pueden cambiar '}
        {'significativamente en periodos cortos de tiempo, por lo que valores posteriores podrían diferir.'}
      </Text>

      <Text style={{ fontSize: 8, marginBottom: 8, lineHeight: 1.5 }}>
        {'Este dictamen no constituye garantía de venta ni promesa de compra. El valuador asume que '}
        {'la información proporcionada por el solicitante es verídica y completa. El valuador no es '}
        {'responsable de vicios ocultos, gravámenes no registrados ni situaciones jurídicas no reveladas.'}
      </Text>

      {/* Tabla de verificaciones SHF */}
      <Text style={{ fontSize: 8, fontFamily: 'Roboto', fontWeight: 'bold', marginBottom: 4 }}>
        Verificaciones realizadas (lista de chequeo SHF)
      </Text>
      <View style={[styles.tabla, { borderWidth: 0.5, borderColor: COLORES.borde }]}>
        {VERIFICACIONES_SHF.map((item, i) => (
          <View key={i} style={[i % 2 === 0 ? styles.filaPar : styles.filaImpar, { flexDirection: 'row', alignItems: 'center' }]}>
            <View style={{ width: 6, height: 6, backgroundColor: COLORES.acento, marginLeft: 6, marginRight: 6 }} />
            <Text style={[styles.celda, { flex: 1, borderRightWidth: 0 }]}>{item}</Text>
          </View>
        ))}
      </View>

      {/* Definiciones */}
      <Text style={{ fontSize: 8, fontFamily: 'Roboto', fontWeight: 'bold', marginTop: 8, marginBottom: 3 }}>
        Definiciones de valor
      </Text>
      <View style={styles.cajaGris}>
        <Text style={{ fontSize: 7, lineHeight: 1.5 }}>
          <Text style={{ fontFamily: 'Roboto', fontWeight: 'bold' }}>Valor de mercado: </Text>
          {'Precio más probable al que se vendería un inmueble en condiciones normales de mercado, '}
          {'entre un comprador y un vendedor bien informados, actuando con prudencia y sin compulsion.'}
        </Text>
        <Text style={{ fontSize: 7, lineHeight: 1.5, marginTop: 3 }}>
          <Text style={{ fontFamily: 'Roboto', fontWeight: 'bold' }}>Valor físico: </Text>
          {'Valor obtenido por el método de costos, considerando el valor del terreno más el costo '}
          {'de construcción depreciado por edad y estado de conservación.'}
        </Text>
        <Text style={{ fontSize: 7, lineHeight: 1.5, marginTop: 3 }}>
          <Text style={{ fontFamily: 'Roboto', fontWeight: 'bold' }}>Valor comercial: </Text>
          {'Valor adoptado por el perito como resultado de la ponderación de los distintos métodos '}
          {'aplicados, representando la mejor estimación del valor de mercado del inmueble.'}
        </Text>
      </View>
    </View>
  )
}
