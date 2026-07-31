import { Text, View, Image } from '@react-pdf/renderer'
import { COLORES } from '../estilos'
import { sa, formatDate } from '../utils'

const PAD = 45  // padding horizontal igual al resto del documento

export default function Portada({ expediente, fotoFachada }) {
  const dir = [
    expediente.calle,
    expediente.numero_oficial,
    expediente.colonia,
    expediente.municipio,
    expediente.estado_rep,
    expediente.cp,
  ].filter(Boolean).map(sa).join(', ')

  return (
    <View style={{ flex: 1 }}>

      {/* ── Cabecera de marca ── */}
      <View style={{
        backgroundColor: COLORES.primario,
        paddingTop: 28,
        paddingBottom: 18,
        paddingHorizontal: PAD,
        flexDirection: 'row',
        alignItems: 'flex-end',
        justifyContent: 'space-between',
      }}>
        <View>
          <Text style={{
            fontSize: 26,
            fontFamily: 'Helvetica-Bold',
            color: COLORES.blanco,
            letterSpacing: 5,
          }}>
            COVINSA
          </Text>
          <Text style={{ fontSize: 8, color: '#93c5fd', marginTop: 3, letterSpacing: 0.5 }}>
            Construccion, Valuacion e Ingenieria
          </Text>
        </View>
        <View style={{ alignItems: 'flex-end' }}>
          <Text style={{ fontSize: 7, color: '#93c5fd' }}>DICTAMEN VALUATORIO</Text>
          <Text style={{ fontSize: 7, color: COLORES.blanco, marginTop: 2, fontFamily: 'Helvetica-Bold' }}>
            {sa(expediente.proposito_avaluo || 'Avaluo Inmobiliario')}
          </Text>
        </View>
      </View>

      {/* ── Banda de color secundario ── */}
      <View style={{
        backgroundColor: COLORES.secundario,
        height: 4,
      }} />

      {/* ── Foto de fachada ── */}
      {fotoFachada ? (
        <View>
          <Image
            src={fotoFachada}
            style={{ width: '100%', height: 230, objectFit: 'cover' }}
          />
          <View style={{
            backgroundColor: 'rgba(0,0,0,0.45)',
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            paddingVertical: 5,
            paddingHorizontal: PAD,
          }}>
            <Text style={{ fontSize: 7, color: COLORES.blanco, opacity: 0.9 }}>
              Vista exterior del inmueble
            </Text>
          </View>
        </View>
      ) : (
        <View style={{
          height: 230,
          backgroundColor: COLORES.grisClaro,
          borderBottomWidth: 0.5,
          borderBottomColor: COLORES.borde,
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <View style={{
            borderWidth: 0.5,
            borderColor: COLORES.borde,
            paddingVertical: 10,
            paddingHorizontal: 20,
          }}>
            <Text style={{ fontSize: 9, color: COLORES.gris }}>Sin fotografia de fachada</Text>
          </View>
        </View>
      )}

      {/* ── Cuerpo: datos del inmueble ── */}
      <View style={{ flex: 1, paddingHorizontal: PAD, paddingTop: 20 }}>

        {/* Folio con acento verde */}
        <View style={{
          flexDirection: 'row',
          alignItems: 'center',
          marginBottom: 18,
        }}>
          <View style={{
            width: 3,
            height: 36,
            backgroundColor: COLORES.acento,
            marginRight: 10,
          }} />
          <View>
            <Text style={{ fontSize: 7, color: COLORES.gris, marginBottom: 2 }}>FOLIO DEL EXPEDIENTE</Text>
            <Text style={{ fontSize: 18, fontFamily: 'Helvetica-Bold', color: COLORES.primario }}>
              {sa(expediente.folio || expediente.id?.slice(0, 8).toUpperCase() || '—')}
            </Text>
          </View>
        </View>

        {/* Tipo + propósito en dos columnas */}
        <View style={{
          flexDirection: 'row',
          borderTopWidth: 0.5,
          borderTopColor: COLORES.borde,
          paddingTop: 10,
          marginBottom: 10,
        }}>
          <View style={{ flex: 1, paddingRight: 12, borderRightWidth: 0.5, borderRightColor: COLORES.borde }}>
            <Text style={{ fontSize: 7, color: COLORES.gris, marginBottom: 2 }}>TIPO DE INMUEBLE</Text>
            <Text style={{ fontSize: 9, fontFamily: 'Helvetica-Bold', color: COLORES.texto }}>
              {sa(expediente.tipo_inmueble || '—')}
            </Text>
          </View>
          <View style={{ flex: 1, paddingLeft: 12 }}>
            <Text style={{ fontSize: 7, color: COLORES.gris, marginBottom: 2 }}>PROPOSITO DEL AVALUO</Text>
            <Text style={{ fontSize: 9, fontFamily: 'Helvetica-Bold', color: COLORES.texto }}>
              {sa(expediente.proposito_avaluo || '—')}
            </Text>
          </View>
        </View>

        {/* Dirección */}
        <View style={{ marginBottom: 10 }}>
          <Text style={{ fontSize: 7, color: COLORES.gris, marginBottom: 2 }}>UBICACION DEL INMUEBLE</Text>
          <Text style={{ fontSize: 9, color: COLORES.texto }}>
            {dir || '—'}
          </Text>
        </View>

        {/* Fecha */}
        <View>
          <Text style={{ fontSize: 7, color: COLORES.gris, marginBottom: 2 }}>FECHA DE INSPECCION</Text>
          <Text style={{ fontSize: 9, color: COLORES.texto }}>
            {sa(formatDate(expediente.fecha_inspeccion)) || '—'}
          </Text>
        </View>
      </View>

      {/* ── Perito ── */}
      <View style={{
        borderTopWidth: 1,
        borderTopColor: COLORES.borde,
        paddingTop: 12,
        paddingBottom: 8,
        paddingHorizontal: PAD,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        <View>
          <Text style={{ fontSize: 7, color: COLORES.gris, marginBottom: 2 }}>PERITO VALUADOR RESPONSABLE</Text>
          <Text style={{ fontSize: 10, fontFamily: 'Helvetica-Bold', color: COLORES.texto }}>
            {sa(expediente.nombre_perito || '—')}
          </Text>
          {expediente.cedula_perito && (
            <Text style={{ fontSize: 7, color: COLORES.gris, marginTop: 2 }}>
              {`Cedula profesional: ${sa(expediente.cedula_perito)}`}
            </Text>
          )}
        </View>

        {expediente.clave_perito && (
          <View style={{
            borderWidth: 0.5,
            borderColor: COLORES.borde,
            backgroundColor: COLORES.grisClaro,
            paddingVertical: 6,
            paddingHorizontal: 12,
            alignItems: 'center',
          }}>
            <Text style={{ fontSize: 6, color: COLORES.gris }}>REGISTRO SHF</Text>
            <Text style={{ fontSize: 9, fontFamily: 'Helvetica-Bold', color: COLORES.primario, marginTop: 2 }}>
              {sa(expediente.clave_perito)}
            </Text>
          </View>
        )}
      </View>

    </View>
  )
}
