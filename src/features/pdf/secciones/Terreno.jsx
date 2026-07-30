import { Text, View } from '@react-pdf/renderer'
import { styles } from '../estilos'
import { sa, formatNumber, formatDate } from '../utils'

function Campo({ label, value }) {
  return (
    <View style={styles.campoFila}>
      <Text style={styles.campoLabel}>{label}</Text>
      <Text style={styles.campoValor}>{sa(value) || '—'}</Text>
    </View>
  )
}

export default function Terreno({ terreno }) {
  if (!terreno) return null

  return (
    <View>
      <Text style={styles.seccionTitulo}>6. CARACTERISTICAS DEL TERRENO</Text>
      <View style={styles.grid2}>
        <View style={styles.col1}>
          <Campo label="Superficie" value={terreno.superficie_m2 ? `${formatNumber(terreno.superficie_m2, 2)} m2` : null} />
          <Campo label="Frente" value={terreno.frente_m ? `${formatNumber(terreno.frente_m, 2)} m` : null} />
          <Campo label="Fondo" value={terreno.fondo_m ? `${formatNumber(terreno.fondo_m, 2)} m` : null} />
          <Campo label="Forma" value={terreno.forma} />
          <Campo label="Topografia" value={terreno.topografia} />
          <Campo label="Nivel vs banqueta" value={terreno.nivel_vs_banqueta} />
        </View>
        <View style={styles.col2}>
          <Campo label="Uso de suelo" value={terreno.uso_suelo_autorizado} />
          <Campo label="COS" value={terreno.cos} />
          <Campo label="CUS" value={terreno.cus} />
          <Campo label="Altura maxima" value={terreno.altura_maxima_m ? `${terreno.altura_maxima_m} m` : null} />
          <Campo label="Regimen de propiedad" value={terreno.regimen_propiedad} />
        </View>
      </View>

      {/* Colindancias */}
      <Text style={{ fontSize: 8, fontFamily: 'Helvetica-Bold', marginTop: 6, marginBottom: 3 }}>
        Medidas y colindancias
      </Text>
      <View style={[styles.tabla, { borderWidth: 0.5, borderColor: '#D1D5DB' }]}>
        <View style={styles.filaHeader}>
          <Text style={[styles.celdaHeader, { width: 70 }]}>Orientacion</Text>
          <Text style={[styles.celdaHeader, { flex: 1 }]}>Colindancia</Text>
        </View>
        {[
          ['Norte',    terreno.colindancia_norte],
          ['Sur',      terreno.colindancia_sur],
          ['Oriente',  terreno.colindancia_oriente],
          ['Poniente', terreno.colindancia_poniente],
        ].map(([orient, col], i) => (
          <View key={orient} style={i % 2 === 0 ? styles.filaPar : styles.filaImpar}>
            <Text style={[styles.celda, { width: 70, fontFamily: 'Helvetica-Bold' }]}>{orient}</Text>
            <Text style={[styles.celda, { flex: 1 }]}>{sa(col) || '—'}</Text>
          </View>
        ))}
      </View>

      {/* Datos registrales */}
      {(terreno.numero_escritura || terreno.notaria || terreno.folio_real) && (
        <View style={{ marginTop: 4 }}>
          <Text style={{ fontSize: 8, fontFamily: 'Helvetica-Bold', marginBottom: 3 }}>Datos registrales</Text>
          <View style={styles.grid2}>
            <View style={styles.col1}>
              <Campo label="No. escritura" value={terreno.numero_escritura} />
              <Campo label="Notaria" value={terreno.notaria} />
            </View>
            <View style={styles.col2}>
              <Campo label="Folio real (RPP)" value={terreno.folio_real} />
              <Campo label="Fecha escritura" value={formatDate(terreno.fecha_escritura)} />
            </View>
          </View>
        </View>
      )}
    </View>
  )
}
