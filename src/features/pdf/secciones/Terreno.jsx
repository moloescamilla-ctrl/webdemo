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
          <Text style={[styles.celdaHeader, { width: 60 }]}>Orientacion</Text>
          <Text style={[styles.celdaHeader, { width: 40 }]}>Metros</Text>
          <Text style={[styles.celdaHeader, { flex: 1 }]}>Colindancia</Text>
        </View>
        {(terreno.colindancias_json?.length
          ? terreno.colindancias_json
          : [
              { rumbo: 'Norte',    metros: '', descripcion: terreno.colindancia_norte    || '' },
              { rumbo: 'Sur',      metros: '', descripcion: terreno.colindancia_sur      || '' },
              { rumbo: 'Oriente',  metros: '', descripcion: terreno.colindancia_oriente  || '' },
              { rumbo: 'Poniente', metros: '', descripcion: terreno.colindancia_poniente || '' },
            ]
        ).map((col, i) => (
          <View key={i} style={i % 2 === 0 ? styles.filaPar : styles.filaImpar}>
            <Text style={[styles.celda, { width: 60, fontFamily: 'Helvetica-Bold' }]}>{col.rumbo}</Text>
            <Text style={[styles.celda, { width: 40, textAlign: 'right' }]}>{col.metros ? `${col.metros} m` : '—'}</Text>
            <Text style={[styles.celda, { flex: 1 }]}>{sa(col.descripcion) || '—'}</Text>
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
              <Campo label="Notario" value={terreno.nombre_notario} />
            </View>
            <View style={styles.col2}>
              <Campo label="Ciudad (notaria)" value={terreno.ciudad} />
              <Campo label="Folio real" value={terreno.folio_real} />
              <Campo label="Fecha escritura" value={formatDate(terreno.fecha_escritura)} />
            </View>
          </View>
        </View>
      )}

      {/* Inscripcion en RPP */}
      {(terreno.rpp_fecha || terreno.rpp_oficina || terreno.rpp_registro_orden ||
        terreno.rpp_fojas_folios || terreno.rpp_libro || terreno.rpp_tomo ||
        terreno.rpp_volumen || terreno.rpp_seccion || terreno.rpp_serie) && (
        <View style={{ marginTop: 4 }}>
          <Text style={{ fontSize: 8, fontFamily: 'Helvetica-Bold', marginBottom: 3 }}>
            Inscripcion en el Registro Publico de la Propiedad (RPP)
          </Text>
          <View style={styles.grid2}>
            <View style={styles.col1}>
              <Campo label="Fecha de inscripcion" value={formatDate(terreno.rpp_fecha)} />
              <Campo label="Oficina RPP"          value={terreno.rpp_oficina} />
              <Campo label="Registro u orden"     value={terreno.rpp_registro_orden} />
              <Campo label="A fojas o folios"     value={terreno.rpp_fojas_folios} />
              <Campo label="Del libro"            value={terreno.rpp_libro} />
            </View>
            <View style={styles.col2}>
              <Campo label="Del tomo"  value={terreno.rpp_tomo} />
              <Campo label="Volumen"   value={terreno.rpp_volumen} />
              <Campo label="Seccion"   value={terreno.rpp_seccion} />
              <Campo label="Serie"     value={terreno.rpp_serie} />
            </View>
          </View>
        </View>
      )}
    </View>
  )
}
