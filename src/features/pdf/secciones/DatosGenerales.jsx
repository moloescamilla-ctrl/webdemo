import { Text, View } from '@react-pdf/renderer'
import { styles } from '../estilos'
import { sa, formatDate, vigenciaAvaluo } from '../utils'

function Campo({ label, value }) {
  return (
    <View style={styles.campoFila}>
      <Text style={styles.campoLabel}>{label}</Text>
      <Text style={styles.campoValor}>{sa(value) || '—'}</Text>
    </View>
  )
}

export default function DatosGenerales({ expediente }) {
  const dir = [
    expediente.calle,
    expediente.numero_oficial,
    expediente.fraccionamiento,
    expediente.colonia,
    expediente.municipio,
    expediente.estado_rep,
    expediente.cp,
  ].filter(Boolean).map(sa).join(', ')

  return (
    <View>
      <Text style={styles.seccionTitulo}>2. DATOS GENERALES DEL AVALUO</Text>
      <View style={styles.grid2}>
        <View style={styles.col1}>
          <Campo label="Folio" value={expediente.folio || expediente.id?.slice(0, 8).toUpperCase()} />
          <Campo label="Fecha de inspeccion" value={formatDate(expediente.fecha_inspeccion)} />
          <Campo label="Vigencia (6 meses)" value={vigenciaAvaluo(expediente.fecha_inspeccion)} />
          <Campo label="Proposito" value={expediente.proposito_avaluo} />
          <Campo label="Tipo de inmueble" value={expediente.tipo_inmueble} />
          <Campo label="Uso" value={expediente.uso} />
        </View>
        <View style={styles.col2}>
          <Campo label="Propietario" value={expediente.nombre_propietario} />
          <Campo label="Solicitante" value={expediente.solicitante} />
          <Campo label="Perito valuador" value={expediente.nombre_perito} />
          <Campo label="Cedula profesional" value={expediente.cedula_perito} />
          <Campo label="Registro perito" value={expediente.clave_perito} />
        </View>
      </View>

      <Text style={styles.seccionTitulo}>3. IDENTIFICACION DEL INMUEBLE</Text>
      <View style={styles.grid2}>
        <View style={styles.col1}>
          <Campo label="Direccion completa" value={dir} />
          <Campo label="Municipio" value={expediente.municipio} />
          <Campo label="Estado" value={expediente.estado_rep} />
          <Campo label="Clave INEGI municipio" value={expediente.municipio_clave_inegi} />
          <Campo label="Clave INEGI estado" value={expediente.estado_clave_inegi} />
        </View>
        <View style={styles.col2}>
          <Campo label="Cuenta predial" value={expediente.num_cuenta_predial} />
          <Campo label="Cuenta de agua" value={expediente.num_cuenta_agua} />
          <Campo label="Latitud" value={expediente.latitud} />
          <Campo label="Longitud" value={expediente.longitud} />
          <Campo label="Codigo postal" value={expediente.cp} />
        </View>
      </View>
    </View>
  )
}
