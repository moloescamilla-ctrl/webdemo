import { View, Image, Text } from '@react-pdf/renderer'
import { styles, COLORES } from '../estilos'
import { obtenerCroquisURL } from '../utils'

export default function CroquisLocalizacion({ lat, lng }) {
  if (!lat || !lng) return null
  const mapaURL = obtenerCroquisURL({ lat, lng })
  if (!mapaURL) return null

  return (
    <View style={{ marginTop: 6 }}>
      <Text style={styles.seccionTitulo}>4. CROQUIS DE LOCALIZACION</Text>
      <Image
        src={mapaURL}
        style={{ width: '100%', height: 180, objectFit: 'cover' }}
      />
      <Text style={styles.nota}>
        {`Coordenadas: ${lat}, ${lng} | Mapa de referencia (no a escala)`}
      </Text>
    </View>
  )
}
