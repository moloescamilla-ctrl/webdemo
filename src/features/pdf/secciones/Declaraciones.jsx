import { Text, View } from '@react-pdf/renderer'
import { styles, COLORES } from '../estilos'

const VERIFICACIONES_SHF = [
  'Se realizo inspeccion fisica del inmueble en la fecha indicada',
  'Se verifico la identidad del inmueble con la escritura publica',
  'Se constato el uso de suelo autorizado y el regimen de propiedad',
  'Se compararon los datos fisicos del inmueble con los documentos legales',
  'Se investigaron ofertas de compraventa en la zona para el metodo comparativo',
  'Se aplico la metodologia de valuacion conforme a las Reglas SHF vigentes',
  'El valuador no tiene interes financiero ni personal en el inmueble valuado',
  'El avaluo fue elaborado de manera imparcial y objetiva',
  'Los valores declarados son vigentes a la fecha de inspeccion indicada',
]

export default function Declaraciones() {
  return (
    <View>
      <Text style={styles.seccionTitulo}>14. DECLARACIONES Y ADVERTENCIAS</Text>

      <Text style={{ fontSize: 8, marginBottom: 6, lineHeight: 1.5 }}>
        {'El presente dictamen valuatorio ha sido elaborado de conformidad con las Reglas de caracter general '}
        {'de metodologia de valuacion emitidas por la Sociedad Hipotecaria Federal (SHF), aplicando los metodos '}
        {'de valuacion reconocidos internacionalmente: Metodo Fisico o de Costos, Metodo de Mercado o Comparativo '}
        {'y, cuando aplica, el Metodo de Capitalizacion de Rentas y el Metodo Residual Estatico.'}
      </Text>

      <Text style={{ fontSize: 8, marginBottom: 6, lineHeight: 1.5 }}>
        {'El valor expresado en este dictamen es valido unicamente a la fecha de inspeccion indicada y '}
        {'tiene una vigencia de seis (6) meses. Las condiciones del mercado inmobiliario pueden cambiar '}
        {'significativamente en periodos cortos de tiempo, por lo que valores posteriores podrian diferir.'}
      </Text>

      <Text style={{ fontSize: 8, marginBottom: 8, lineHeight: 1.5 }}>
        {'Este dictamen no constituye garantia de venta ni promesa de compra. El valuador asume que '}
        {'la informacion proporcionada por el solicitante es verídica y completa. El valuador no es '}
        {'responsable de vicios ocultos, gravamenes no registrados ni situaciones juridicas no reveladas.'}
      </Text>

      {/* Tabla de verificaciones SHF */}
      <Text style={{ fontSize: 8, fontFamily: 'Helvetica-Bold', marginBottom: 4 }}>
        Verificaciones realizadas (lista de chequeo SHF)
      </Text>
      <View style={[styles.tabla, { borderWidth: 0.5, borderColor: COLORES.borde }]}>
        {VERIFICACIONES_SHF.map((item, i) => (
          <View key={i} style={[i % 2 === 0 ? styles.filaPar : styles.filaImpar, { flexDirection: 'row', alignItems: 'center' }]}>
            <Text style={{ fontSize: 9, color: COLORES.acento, paddingHorizontal: 6, paddingVertical: 3 }}>✓</Text>
            <Text style={[styles.celda, { flex: 1, borderRightWidth: 0 }]}>{item}</Text>
          </View>
        ))}
      </View>

      {/* Definiciones */}
      <Text style={{ fontSize: 8, fontFamily: 'Helvetica-Bold', marginTop: 8, marginBottom: 3 }}>
        Definiciones de valor
      </Text>
      <View style={styles.cajaGris}>
        <Text style={{ fontSize: 7, lineHeight: 1.5 }}>
          <Text style={{ fontFamily: 'Helvetica-Bold' }}>Valor de mercado: </Text>
          {'Precio mas probable al que se venderia un inmueble en condiciones normales de mercado, '}
          {'entre un comprador y un vendedor bien informados, actuando con prudencia y sin compulsion.'}
        </Text>
        <Text style={{ fontSize: 7, lineHeight: 1.5, marginTop: 3 }}>
          <Text style={{ fontFamily: 'Helvetica-Bold' }}>Valor fisico: </Text>
          {'Valor obtenido por el metodo de costos, considerando el valor del terreno mas el costo '}
          {'de construccion depreciado por edad y estado de conservacion.'}
        </Text>
        <Text style={{ fontSize: 7, lineHeight: 1.5, marginTop: 3 }}>
          <Text style={{ fontFamily: 'Helvetica-Bold' }}>Valor comercial: </Text>
          {'Valor adoptado por el perito como resultado de la ponderacion de los distintos metodos '}
          {'aplicados, representando la mejor estimacion del valor de mercado del inmueble.'}
        </Text>
      </View>
    </View>
  )
}
