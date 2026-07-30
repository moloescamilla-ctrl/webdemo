import { View, Image, Text } from '@react-pdf/renderer'
import { styles } from '../estilos'

export default function CroquisLocalizacion({ croquisSrc }) {
  if (!croquisSrc) return null

  return (
    <View style={{ marginTop: 6 }}>
      <Text style={styles.seccionTitulo}>4. CROQUIS DE LOCALIZACION</Text>
      <Image
        src={croquisSrc}
        style={{ width: '100%', height: 180, objectFit: 'cover' }}
      />
    </View>
  )
}
