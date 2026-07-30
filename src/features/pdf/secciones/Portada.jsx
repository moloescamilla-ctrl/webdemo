import { Text, View } from '@react-pdf/renderer'
import { COLORES } from '../estilos'
import { sa, formatDate } from '../utils'

export default function Portada({ expediente }) {
  const dir = [
    expediente.calle,
    expediente.numero_oficial,
    expediente.colonia,
    expediente.municipio,
    expediente.estado_rep,
    expediente.cp,
  ].filter(Boolean).map(sa).join(', ')

  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      {/* Logo COVINSA */}
      <View style={{
        backgroundColor: COLORES.primario,
        paddingVertical: 14,
        paddingHorizontal: 40,
        borderRadius: 4,
        marginBottom: 32,
        alignItems: 'center',
      }}>
        <Text style={{ fontSize: 22, fontFamily: 'Helvetica-Bold', color: COLORES.blanco, letterSpacing: 4 }}>
          COVINSA
        </Text>
        <Text style={{ fontSize: 9, color: '#93c5fd', marginTop: 2, letterSpacing: 1 }}>
          Construccion, Valuacion e Ingenieria
        </Text>
      </View>

      <Text style={{ fontSize: 20, fontFamily: 'Helvetica-Bold', color: COLORES.primario, marginBottom: 6, textAlign: 'center' }}>
        DICTAMEN VALUATORIO
      </Text>
      <Text style={{ fontSize: 10, color: COLORES.gris, marginBottom: 40, textAlign: 'center' }}>
        {sa(expediente.proposito_avaluo || 'Avaluo Inmobiliario')}
      </Text>

      {/* Folio */}
      <View style={{
        borderWidth: 1, borderColor: COLORES.borde,
        borderRadius: 4, paddingVertical: 10, paddingHorizontal: 24,
        marginBottom: 32, alignItems: 'center',
      }}>
        <Text style={{ fontSize: 8, color: COLORES.gris, marginBottom: 2 }}>FOLIO</Text>
        <Text style={{ fontSize: 18, fontFamily: 'Helvetica-Bold', color: COLORES.primario }}>
          {sa(expediente.folio || expediente.id?.slice(0, 8).toUpperCase())}
        </Text>
      </View>

      {/* Inmueble */}
      <View style={{ alignItems: 'center', marginBottom: 40 }}>
        <Text style={{ fontSize: 9, color: COLORES.gris, marginBottom: 3 }}>INMUEBLE OBJETO DE AVALUO</Text>
        <Text style={{ fontSize: 11, fontFamily: 'Helvetica-Bold', color: COLORES.texto, textAlign: 'center', maxWidth: 380 }}>
          {sa(`${expediente.tipo_inmueble || 'Inmueble'} — ${expediente.municipio || ''}`)}
        </Text>
        <Text style={{ fontSize: 8, color: COLORES.gris, marginTop: 4, textAlign: 'center', maxWidth: 380 }}>
          {dir || '—'}
        </Text>
      </View>

      {/* Fecha */}
      <View style={{ alignItems: 'center', marginBottom: 32 }}>
        <Text style={{ fontSize: 8, color: COLORES.gris }}>
          {`Fecha de inspeccion: ${sa(formatDate(expediente.fecha_inspeccion))}`}
        </Text>
      </View>

      {/* Perito */}
      <View style={{
        borderTopWidth: 1, borderTopColor: COLORES.borde,
        paddingTop: 16, width: '80%', alignItems: 'center',
      }}>
        <Text style={{ fontSize: 8, color: COLORES.gris, marginBottom: 3 }}>PERITO VALUADOR</Text>
        <Text style={{ fontSize: 11, fontFamily: 'Helvetica-Bold', color: COLORES.texto }}>
          {sa(expediente.nombre_perito || '—')}
        </Text>
        {expediente.cedula_perito && (
          <Text style={{ fontSize: 8, color: COLORES.gris, marginTop: 2 }}>
            {`Cedula: ${sa(expediente.cedula_perito)}`}
          </Text>
        )}
        {expediente.clave_perito && (
          <Text style={{ fontSize: 8, color: COLORES.gris }}>
            {`Registro: ${sa(expediente.clave_perito)}`}
          </Text>
        )}
      </View>
    </View>
  )
}
