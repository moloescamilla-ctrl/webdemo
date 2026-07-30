import { Text, View } from '@react-pdf/renderer'
import { styles } from '../estilos'
import { sa } from '../utils'

export function PiePagina({ expediente }) {
  const folio = sa(expediente?.folio || '')
  const fecha = sa(expediente?.fecha_inspeccion || '')
  return (
    <View style={styles.piePagina} fixed>
      <Text>{`Dictamen Valuatorio | Folio: ${folio} | Inspeccion: ${fecha}`}</Text>
      <Text render={({ pageNumber, totalPages }) => `Pagina ${pageNumber} de ${totalPages}`} />
    </View>
  )
}
