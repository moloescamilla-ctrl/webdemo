import { View, Image, Text } from '@react-pdf/renderer'
import { styles, COLORES } from '../estilos'
import { obtenerCroquisURL } from '../utils'

export default function CroquisLocalizacion({ lat, lng, croquisSrc }) {
  if (!croquisSrc) return null

  return (
    <View style={{ marginTop: 6 }}>
      <Text style={styles.seccionTitulo}>4. CROQUIS DE LOCALIZACION</Text>
      <Image
        src={croquisSrc}
        style={{ width: '100%', height: 180, objectFit: 'cover' }}
      />
      {lat && lng && (
        <Text style={styles.nota}>
          {`Coordenadas: ${lat}, ${lng} | Mapa de referencia (no a escala)`}
        </Text>
      )}
    </View>
  )
}
