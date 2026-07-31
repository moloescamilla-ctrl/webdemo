import '../fonts'
import { Text, View, Image } from '@react-pdf/renderer'
import logoCovinsa from '@/assets/logo-covinsa.png'
import { COLORES } from '../estilos'
import { sa, formatDate } from '../utils'

const PAD = 45

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

      {/* ── Header: Logo | Datos del despacho | Tipo documento ── */}
      <View style={{
        backgroundColor: COLORES.primario,
        paddingTop: 14,
        paddingBottom: 14,
        paddingHorizontal: PAD,
        flexDirection: 'row',
        alignItems: 'center',
      }}>
        {/* Logo COVINSA blanco (izquierda) */}
        <View style={{ marginRight: 20, justifyContent: 'center' }}>
          <Image
            src={logoCovinsa}
            style={{ width: 100, height: 78, objectFit: 'contain' }}
          />
        </View>

        {/* Datos del despacho (centro) */}
        <View style={{ flex: 1, justifyContent: 'center' }}>
          <Text style={{ fontSize: 7.5, color: COLORES.blanco, marginBottom: 3 }}>
            RETORNO CITLALLI No. 27
          </Text>
          <Text style={{ fontSize: 7.5, color: COLORES.blanco, marginBottom: 3 }}>
            COL. EL ESPINAL, C.P. 94330
          </Text>
          <Text style={{ fontSize: 7.5, color: COLORES.blanco, marginBottom: 3 }}>
            ORIZABA, VER.
          </Text>
          <Text style={{ fontSize: 7.5, color: '#93c5fd' }}>
            TEL. 272 721 69 55
          </Text>
        </View>

        {/* Tipo de documento (derecha) */}
        <View style={{ width: 90, alignItems: 'flex-end' }}>
          <Text style={{ fontSize: 6.5, color: '#93c5fd', marginBottom: 2, letterSpacing: 0.5 }}>
            DICTAMEN
          </Text>
          <Text style={{ fontSize: 6.5, color: '#93c5fd', marginBottom: 6, letterSpacing: 0.5 }}>
            VALUATORIO
          </Text>
          <View style={{ height: 0.5, backgroundColor: 'rgba(255,255,255,0.2)', width: '100%', marginBottom: 6 }} />
          <Text style={{ fontSize: 7, color: COLORES.blanco, textAlign: 'right' }}>
            {sa(expediente.proposito_avaluo || 'Avaluo Inmobiliario')}
          </Text>
        </View>
      </View>

      {/* Banda de acento verde */}
      <View style={{ backgroundColor: COLORES.acento, height: 3 }} />

      {/* ── Foto de fachada ── */}
      {fotoFachada ? (
        <View>
          <Image
            src={fotoFachada}
            style={{ width: '100%', height: 234, objectFit: 'cover' }}
          />
          <View style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            paddingVertical: 6,
            paddingHorizontal: PAD,
            backgroundColor: 'rgba(0,0,0,0.40)',
          }}>
            <Text style={{ fontSize: 7, color: COLORES.blanco }}>
              Vista exterior del inmueble
            </Text>
          </View>
        </View>
      ) : (
        <View style={{
          height: 234,
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

      {/* ── Datos del inmueble ── */}
      <View style={{ flex: 1, paddingHorizontal: PAD, paddingTop: 18 }}>

        {/* Folio */}
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
          <View style={{ width: 3, height: 34, backgroundColor: COLORES.acento, marginRight: 10 }} />
          <View>
            <Text style={{ fontSize: 7, color: COLORES.gris, marginBottom: 2 }}>FOLIO DEL EXPEDIENTE</Text>
            <Text style={{ fontSize: 17, fontFamily: 'Helvetica-Bold', color: COLORES.primario }}>
              {sa(expediente.folio || expediente.id?.slice(0, 8).toUpperCase() || '—')}
            </Text>
          </View>
        </View>

        {/* Tipo + propósito */}
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
          <Text style={{ fontSize: 9, color: COLORES.texto }}>{dir || '—'}</Text>
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
