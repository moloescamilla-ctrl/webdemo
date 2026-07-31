import { View, Image, Text } from '@react-pdf/renderer'
import { styles } from '../estilos'
import { sa } from '../utils'

const CATEGORIAS = {
  fachada:   'Fachada',
  entorno:   'Entorno',
  acceso:    'Acceso al inmueble',
  sala:      'Sala',
  comedor:   'Comedor',
  cocina:    'Cocina',
  bano:      'Bano',
  recamara1: 'Recamara 1',
  recamara2: 'Recamara 2',
  extra:     'Extra',
}

export default function Fotografias({ fotos }) {
  if (!fotos?.length) return null

  const porCategoria = fotos.reduce((acc, f) => {
    if (!acc[f.categoria]) acc[f.categoria] = []
    acc[f.categoria].push(f)
    return acc
  }, {})

  return (
    <View>
      <Text style={styles.seccionTitulo}>15. FOTOGRAFIAS DE LA INSPECCION</Text>

      {Object.entries(porCategoria).map(([cat, imgs]) => (
        <View key={cat} style={{ marginBottom: 12 }}>
          <Text style={{ fontSize: 9, fontFamily: 'Helvetica-Bold', marginBottom: 4 }}>
            {CATEGORIAS[cat] ?? cat}
          </Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
            {imgs.map((foto, i) => (
              <View key={i} style={{ width: '48%', marginBottom: 6, marginRight: i % 2 === 0 ? '4%' : 0 }}>
                <Image
                  src={foto.url_storage}
                  style={{ width: '100%', height: 100, objectFit: 'cover' }}
                />
                {foto.descripcion && (
                  <Text style={{ fontSize: 7, color: '#6B7280', marginTop: 1 }}>
                    {sa(foto.descripcion)}
                  </Text>
                )}
              </View>
            ))}
          </View>
        </View>
      ))}
    </View>
  )
}
