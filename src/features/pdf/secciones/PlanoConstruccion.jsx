import { View, Image, Text, Page } from '@react-pdf/renderer'
import { styles, COLORES } from '../estilos'

export default function PlanoConstruccion({ planoSrc }) {
  if (!planoSrc) return null

  return (
    <Page size="LETTER" style={{ margin: 0, padding: 0 }}>
      {/* Encabezado delgado */}
      <View style={{
        backgroundColor: COLORES.primario,
        paddingVertical: 6,
        paddingHorizontal: 18,
      }}>
        <Text style={{ fontSize: 9, color: '#FFFFFF', fontFamily: 'Roboto', fontWeight: 'bold', letterSpacing: 0.5 }}>
          16. CROQUIS / PLANO DE LA PROPIEDAD
        </Text>
      </View>

      {/* Imagen a toda la página restante */}
      <Image
        src={planoSrc}
        style={{ width: '100%', flex: 1, objectFit: 'contain' }}
      />
    </Page>
  )
}
