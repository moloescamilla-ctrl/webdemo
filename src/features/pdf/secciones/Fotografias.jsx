import { View, Image, Text } from '@react-pdf/renderer'
import { styles, COLORES } from '../estilos'
import { sa } from '../utils'

const ETIQUETAS = {
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

// Orden de presentación de las categorías
const ORDEN = ['fachada','entorno','acceso','sala','comedor','cocina','bano','recamara1','recamara2','extra']

function TarjetaFoto({ foto, etiqueta, isRight }) {
  return (
    <View style={{
      width: '48.5%',
      marginLeft: isRight ? '3%' : 0,
      marginBottom: 10,
      borderWidth: 0.5,
      borderColor: COLORES.borde,
    }}>
      {/* Imagen */}
      <Image
        src={foto.url_storage}
        style={{ width: '100%', height: 120, objectFit: 'cover' }}
      />
      {/* Pie de foto: etiqueta de categoría */}
      <View style={{
        borderTopWidth: 0.5,
        borderTopColor: COLORES.borde,
        backgroundColor: COLORES.grisClaro,
        paddingVertical: 4,
        paddingHorizontal: 6,
        flexDirection: 'row',
        alignItems: 'center',
      }}>
        <View style={{
          width: 5,
          height: 5,
          backgroundColor: COLORES.secundario,
          marginRight: 5,
        }} />
        <Text style={{ fontSize: 7, color: COLORES.texto, fontFamily: 'Helvetica-Bold' }}>
          {etiqueta}
        </Text>
        {foto.descripcion ? (
          <Text style={{ fontSize: 7, color: COLORES.gris, marginLeft: 4 }}>
            {`— ${sa(foto.descripcion)}`}
          </Text>
        ) : null}
      </View>
    </View>
  )
}

export default function Fotografias({ fotos }) {
  if (!fotos?.length) return null

  // Ordenar fotos por categoría según ORDEN, luego por orden de captura
  const fotosOrdenadas = [...fotos].sort((a, b) => {
    const ia = ORDEN.indexOf(a.categoria)
    const ib = ORDEN.indexOf(b.categoria)
    if (ia !== ib) return ia - ib
    return (a.orden ?? 0) - (b.orden ?? 0)
  })

  // Agrupar en pares para la cuadrícula de 2 columnas
  const pares = []
  for (let i = 0; i < fotosOrdenadas.length; i += 2) {
    pares.push([fotosOrdenadas[i], fotosOrdenadas[i + 1] ?? null])
  }

  return (
    <View>
      <Text style={styles.seccionTitulo}>15. FOTOGRAFIAS DE LA INSPECCION</Text>

      {pares.map((par, rowIdx) => (
        <View key={rowIdx} wrap={false} style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
          <TarjetaFoto
            foto={par[0]}
            etiqueta={ETIQUETAS[par[0].categoria] ?? par[0].categoria}
            isRight={false}
          />
          {par[1] && (
            <TarjetaFoto
              foto={par[1]}
              etiqueta={ETIQUETAS[par[1].categoria] ?? par[1].categoria}
              isRight={true}
            />
          )}
        </View>
      ))}
    </View>
  )
}
