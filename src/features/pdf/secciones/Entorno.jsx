import { Text, View } from '@react-pdf/renderer'
import { styles } from '../estilos'
import { sa, formatNumber } from '../utils'

const SERVICIOS = [
  ['agua_potable',           'Agua potable'],
  ['drenaje_alcantarillado', 'Drenaje y alcantarillado'],
  ['energia_electrica',      'Energia electrica'],
  ['alumbrado_publico',      'Alumbrado publico'],
  ['gas_natural',            'Gas natural'],
  ['telefonia',              'Telefonia'],
  ['internet',               'Internet'],
  ['recoleccion_basura',     'Recoleccion de basura'],
  ['banquetas',              'Banquetas'],
  ['guarniciones',           'Guarniciones'],
]

const DISTANCIAS = [
  ['dist_escuelas_m',   'Escuelas'],
  ['dist_hospitales_m', 'Hospitales'],
  ['dist_comercios_m',  'Comercios'],
  ['dist_bancos_m',     'Bancos'],
  ['dist_transporte_m', 'Transporte publico'],
  ['dist_parque_m',     'Areas verdes'],
]

export default function Entorno({ entorno }) {
  if (!entorno) return null

  const serviciosPresentes = SERVICIOS.filter(([key]) => entorno[key])
  const serviciosAusentes  = SERVICIOS.filter(([key]) => !entorno[key])

  return (
    <View>
      <Text style={styles.seccionTitulo}>5. ENTORNO E INFRAESTRUCTURA</Text>

      {/* Clasificación de zona */}
      <View style={styles.grid2}>
        <View style={styles.col1}>
          <View style={styles.campoFila}>
            <Text style={styles.campoLabel}>Uso predominante</Text>
            <Text style={styles.campoValor}>{sa(entorno.uso_predominante_zona) || '—'}</Text>
          </View>
          <View style={styles.campoFila}>
            <Text style={styles.campoLabel}>Nivel socioeconomico</Text>
            <Text style={styles.campoValor}>{sa(entorno.nivel_socioeconomico) || '—'}</Text>
          </View>
          <View style={styles.campoFila}>
            <Text style={styles.campoLabel}>Densidad construccion</Text>
            <Text style={styles.campoValor}>{sa(entorno.densidad_construccion) || '—'}</Text>
          </View>
          <View style={styles.campoFila}>
            <Text style={styles.campoLabel}>Tipo const. predominante</Text>
            <Text style={styles.campoValor}>{sa(entorno.tipo_construccion_predominante) || '—'}</Text>
          </View>
        </View>
        <View style={styles.col2}>
          <View style={styles.campoFila}>
            <Text style={styles.campoLabel}>Tipo de vialidad</Text>
            <Text style={styles.campoValor}>{sa(entorno.tipo_vialidad) || '—'}</Text>
          </View>
          <View style={styles.campoFila}>
            <Text style={styles.campoLabel}>Nombre de vialidad</Text>
            <Text style={styles.campoValor}>{sa(entorno.nombre_vialidad) || '—'}</Text>
          </View>
          <View style={styles.campoFila}>
            <Text style={styles.campoLabel}>Ancho de vialidad</Text>
            <Text style={styles.campoValor}>
              {entorno.ancho_vialidad_m ? `${formatNumber(entorno.ancho_vialidad_m, 1)} m` : '—'}
            </Text>
          </View>
          <View style={styles.campoFila}>
            <Text style={styles.campoLabel}>Contaminacion ambiental</Text>
            <Text style={styles.campoValor}>{sa(entorno.contaminacion_ambiental) || '—'}</Text>
          </View>
        </View>
      </View>

      {/* Servicios */}
      <Text style={{ fontSize: 8, fontFamily: 'Helvetica-Bold', marginTop: 6, marginBottom: 3 }}>
        Servicios urbanos disponibles
      </Text>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
        {serviciosPresentes.map(([, label]) => (
          <View key={label} style={{ flexDirection: 'row', width: '50%', marginBottom: 2, alignItems: 'center' }}>
            <View style={{ width: 6, height: 6, backgroundColor: '#16A34A', marginRight: 4 }} />
            <Text style={{ fontSize: 7 }}>{label}</Text>
          </View>
        ))}
        {serviciosAusentes.map(([, label]) => (
          <View key={label} style={{ flexDirection: 'row', width: '50%', marginBottom: 2, alignItems: 'center' }}>
            <View style={{ width: 6, height: 6, backgroundColor: '#E5E7EB', marginRight: 4 }} />
            <Text style={{ fontSize: 7, color: '#9CA3AF' }}>{label}</Text>
          </View>
        ))}
      </View>

      {/* Distancias */}
      {DISTANCIAS.some(([key]) => entorno[key] != null) && (
        <View style={{ marginTop: 6 }}>
          <Text style={{ fontSize: 8, fontFamily: 'Helvetica-Bold', marginBottom: 3 }}>
            Distancias al equipamiento urbano
          </Text>
          <View style={[styles.tabla, { borderWidth: 0.5, borderColor: '#D1D5DB' }]}>
            <View style={styles.filaHeader}>
              <Text style={[styles.celdaHeader, { flex: 2 }]}>Equipamiento</Text>
              <Text style={[styles.celdaHeader, { flex: 1, textAlign: 'right' }]}>Distancia</Text>
            </View>
            {DISTANCIAS.filter(([key]) => entorno[key] != null).map(([key, label], i) => (
              <View key={key} style={i % 2 === 0 ? styles.filaPar : styles.filaImpar}>
                <Text style={[styles.celda, { flex: 2 }]}>{label}</Text>
                <Text style={[styles.celda, { flex: 1, textAlign: 'right' }]}>
                  {`${formatNumber(entorno[key], 0)} m`}
                </Text>
              </View>
            ))}
          </View>
        </View>
      )}

      {entorno.observaciones_entorno && (
        <View style={styles.campoFila}>
          <Text style={styles.campoLabel}>Observaciones</Text>
          <Text style={styles.campoValor}>{sa(entorno.observaciones_entorno)}</Text>
        </View>
      )}
    </View>
  )
}
