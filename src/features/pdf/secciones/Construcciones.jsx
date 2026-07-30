import { Text, View } from '@react-pdf/renderer'
import { styles } from '../estilos'
import { sa, formatNumber } from '../utils'

function Campo({ label, value }) {
  return (
    <View style={styles.campoFila}>
      <Text style={styles.campoLabel}>{label}</Text>
      <Text style={styles.campoValor}>{sa(value) || '—'}</Text>
    </View>
  )
}

function Check({ label, value }) {
  return (
    <View style={[styles.campoFila, { marginBottom: 2, alignItems: 'center' }]}>
      <View style={{ width: 6, height: 6, backgroundColor: value ? '#16A34A' : '#E5E7EB', marginRight: 4 }} />
      <Text style={{ fontSize: 8, color: value ? '#111827' : '#9CA3AF' }}>{label}</Text>
    </View>
  )
}

export default function Construcciones({ descripcion }) {
  if (!descripcion) return null

  return (
    <View>
      <Text style={styles.seccionTitulo}>7. DESCRIPCION DE CONSTRUCCIONES</Text>
      <View style={styles.grid2}>
        <View style={styles.col1}>
          <Campo label="Uso actual" value={descripcion.uso_actual} />
          <Campo label="Condicion" value={descripcion.condicion} />
          <Campo label="Numero de niveles" value={descripcion.num_niveles} />
          <Campo label="Sup. vendible" value={descripcion.superficie_vendible_m2 ? `${formatNumber(descripcion.superficie_vendible_m2, 2)} m2` : null} />
        </View>
        <View style={styles.col2}>
          <Campo label="Recamaras" value={descripcion.num_recamaras} />
          <Campo label="Banos completos" value={descripcion.banos_completos} />
          <Campo label="Medios banos" value={descripcion.medios_banos} />
          <Campo label="Estac. descubiertos" value={descripcion.estacionamientos_descubiertos} />
          <Campo label="Estac. cubiertos" value={descripcion.estacionamientos_cubiertos} />
        </View>
      </View>

      <View style={{ flexDirection: 'row', marginTop: 4 }}>
        <Check label="Elevador" value={descripcion.elevador} />
      </View>

      {descripcion.observaciones && (
        <View style={[styles.cajaGris, { marginTop: 6 }]}>
          <Text style={{ fontSize: 8, fontFamily: 'Helvetica-Bold', marginBottom: 2 }}>Observaciones</Text>
          <Text style={{ fontSize: 8 }}>{sa(descripcion.observaciones)}</Text>
        </View>
      )}
    </View>
  )
}
