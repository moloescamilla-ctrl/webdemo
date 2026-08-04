import '../fonts'
import { Text, View, Image } from '@react-pdf/renderer'
import logoCovinsa from '@/assets/logo-covinsa.png'
import { COLORES } from '../estilos'
import { sa, formatDate, formatCurrency, formatNumber, numeroALetras } from '../utils'

const PAD = 28

function Fila({ num, label, valor, numD, labelD, valorD, resaltar }) {
  const bg = resaltar ? '#FEF9C3' : 'transparent'
  const tc = resaltar ? '#78350F' : COLORES.texto
  return (
    <View style={{
      flexDirection: 'row',
      borderBottomWidth: 0.5,
      borderBottomColor: COLORES.borde,
      backgroundColor: bg,
      minHeight: 8.5,
    }}>
      <Text style={{ width: 13, fontSize: 6, color: COLORES.gris, textAlign: 'center', paddingVertical: 1.5, borderRightWidth: 0.5, borderRightColor: COLORES.borde }}>{num}</Text>
      <Text style={{ flex: labelD ? 3 : 5, fontSize: 6.5, paddingHorizontal: 3, paddingVertical: 1.5, borderRightWidth: 0.5, borderRightColor: COLORES.borde }}>{label}</Text>
      <Text style={{ flex: 2, fontSize: 6.5, fontFamily: 'Helvetica-Bold', textAlign: 'right', paddingHorizontal: 3, paddingVertical: 1.5, color: tc, borderRightWidth: labelD ? 0.5 : 0, borderRightColor: COLORES.borde }}>{valor ?? '—'}</Text>
      {labelD && (
        <>
          <Text style={{ width: 13, fontSize: 6, color: COLORES.gris, textAlign: 'center', paddingVertical: 1.5, borderRightWidth: 0.5, borderRightColor: COLORES.borde }}>{numD}</Text>
          <Text style={{ flex: 3, fontSize: 6.5, paddingHorizontal: 3, paddingVertical: 1.5, borderRightWidth: 0.5, borderRightColor: COLORES.borde }}>{labelD}</Text>
          <Text style={{ flex: 2, fontSize: 6.5, fontFamily: 'Helvetica-Bold', textAlign: 'right', paddingHorizontal: 3, paddingVertical: 1.5 }}>{valorD ?? '—'}</Text>
        </>
      )}
    </View>
  )
}

export default function Portada({
  expediente, fotoFachada,
  descripcionConstruccion, metodoFisico,
  metodoComparativo, metodoRentas, metodoResidual,
  entorno,
}) {
  const METODO_VALS = {
    fisico:      Number(metodoFisico?.valor_fisico_total)            || 0,
    comparativo: Number(metodoComparativo?.valor_comparativo_total)  || 0,
    rentas:      Number(metodoRentas?.valor_capitalizacion)          || 0,
    residual:    Number(metodoResidual?.valor_residual)              || 0,
  }
  const metodoElegido = expediente?.metodo_elegido
  const valoresMetodos = Object.values(METODO_VALS).filter(v => v > 0)
  const valorConcluido = metodoElegido && METODO_VALS[metodoElegido] > 0
    ? Math.round(METODO_VALS[metodoElegido])
    : valoresMetodos.length > 0 ? valoresMetodos[0] : 0

  const anoTerminacion = metodoFisico?.edad_anios
    ? String(new Date().getFullYear() - Math.round(Number(metodoFisico.edad_anios)))
    : '—'
  const vidaRemanente = (metodoFisico?.vida_util_anios && metodoFisico?.edad_anios)
    ? String(Math.max(0, Math.round(Number(metodoFisico.vida_util_anios) - Number(metodoFisico.edad_anios))))
    : '—'
  const estac = (Number(descripcionConstruccion?.estacionamientos_descubiertos) || 0)
    + (Number(descripcionConstruccion?.estacionamientos_cubiertos) || 0)

  return (
    <View style={{ flex: 1 }}>

      {/* ── Header ── */}
      <View style={{
        backgroundColor: COLORES.primario,
        paddingTop: 10, paddingBottom: 10, paddingHorizontal: PAD,
        flexDirection: 'row', alignItems: 'center',
      }}>
        <View style={{ marginRight: 16, justifyContent: 'center' }}>
          <Image src={logoCovinsa} style={{ width: 80, height: 62, objectFit: 'contain' }} />
        </View>
        <View style={{ flex: 1, justifyContent: 'center' }}>
          <Text style={{ fontSize: 7, color: COLORES.blanco, marginBottom: 2 }}>RETORNO CITLALLI No. 27</Text>
          <Text style={{ fontSize: 7, color: COLORES.blanco, marginBottom: 2 }}>COL. EL ESPINAL, C.P. 94330</Text>
          <Text style={{ fontSize: 7, color: COLORES.blanco, marginBottom: 2 }}>ORIZABA, VER.</Text>
          <Text style={{ fontSize: 7, color: '#93c5fd' }}>TEL. 272 721 69 55</Text>
        </View>
        <View style={{ alignItems: 'flex-end' }}>
          <Text style={{ fontSize: 6, color: '#93c5fd', letterSpacing: 0.5, marginBottom: 3 }}>DICTAMEN VALUATORIO</Text>
          <View style={{ height: 0.5, backgroundColor: 'rgba(255,255,255,0.25)', marginBottom: 4, width: 80 }} />
          <Text style={{ fontSize: 7, color: COLORES.blanco, textAlign: 'right' }}>
            {sa(expediente.proposito_avaluo || 'Avaluo Inmobiliario')}
          </Text>
        </View>
      </View>

      {/* Banda verde */}
      <View style={{ backgroundColor: COLORES.acento, height: 3 }} />

      {/* Título */}
      <View style={{ paddingVertical: 5, paddingHorizontal: PAD, borderBottomWidth: 1, borderBottomColor: COLORES.borde }}>
        <Text style={{ fontSize: 11, fontFamily: 'Helvetica-Bold', color: COLORES.primario, textAlign: 'center', letterSpacing: 1 }}>
          SINTESIS INFORMATIVA DE AVALUO
        </Text>
      </View>

      {/* ── Foto centrada ── */}
      <View style={{ alignItems: 'center', paddingHorizontal: PAD, paddingTop: 5, paddingBottom: 3 }}>
        {fotoFachada ? (
          <Image src={fotoFachada} style={{ width: 210, height: 110, objectFit: 'cover', borderWidth: 0.5, borderColor: COLORES.borde }} />
        ) : (
          <View style={{ width: 210, height: 80, borderWidth: 0.5, borderColor: COLORES.borde, backgroundColor: COLORES.grisClaro, alignItems: 'center', justifyContent: 'center' }}>
            <Text style={{ fontSize: 7, color: COLORES.gris }}>Sin fotografia</Text>
          </View>
        )}
        <Text style={{ fontSize: 6.5, color: COLORES.gris, marginTop: 2 }}>VISTA GENERAL DEL INMUEBLE</Text>
      </View>

      {/* ── Tabla síntesis ── */}
      <View style={{ marginHorizontal: PAD, marginTop: 3, borderWidth: 0.5, borderColor: COLORES.borde }}>

        {/* Header de tabla */}
        <View style={{ flexDirection: 'row', backgroundColor: COLORES.secundario }}>
          <Text style={{ width: 13, fontSize: 6, color: COLORES.blanco, textAlign: 'center', paddingVertical: 2, borderRightWidth: 0.5, borderRightColor: 'rgba(255,255,255,0.2)' }}>#</Text>
          <Text style={{ flex: 3, fontSize: 6, color: COLORES.blanco, fontFamily: 'Helvetica-Bold', paddingHorizontal: 3, paddingVertical: 2, borderRightWidth: 0.5, borderRightColor: 'rgba(255,255,255,0.2)' }}>DESCRIPCION</Text>
          <Text style={{ flex: 2, fontSize: 6, color: COLORES.blanco, fontFamily: 'Helvetica-Bold', paddingHorizontal: 3, paddingVertical: 2, textAlign: 'right', borderRightWidth: 0.5, borderRightColor: 'rgba(255,255,255,0.2)' }}>DATO</Text>
          <Text style={{ width: 13, fontSize: 6, color: COLORES.blanco, textAlign: 'center', paddingVertical: 2, borderRightWidth: 0.5, borderRightColor: 'rgba(255,255,255,0.2)' }}>#</Text>
          <Text style={{ flex: 3, fontSize: 6, color: COLORES.blanco, fontFamily: 'Helvetica-Bold', paddingHorizontal: 3, paddingVertical: 2, borderRightWidth: 0.5, borderRightColor: 'rgba(255,255,255,0.2)' }}>DESCRIPCION</Text>
          <Text style={{ flex: 2, fontSize: 6, color: COLORES.blanco, fontFamily: 'Helvetica-Bold', paddingHorizontal: 3, paddingVertical: 2, textAlign: 'right' }}>DATO</Text>
        </View>

        {/* Filas 1-19 */}
        <Fila num={1}  label="Folio de secuencia del avaluo"                          valor={sa(expediente.folio || expediente.id?.slice(0,8).toUpperCase())} />
        <Fila num={2}  label="Fecha del Avaluo (DD/MM/AAAA)"                          valor={sa(formatDate(expediente.fecha_inspeccion))} />
        <Fila num={3}  label="Nombre del Propietario"                                 valor={sa(expediente.nombre_propietario)} />
        <Fila num={4}  label="Nombre del Perito Valuador"                             valor={sa(expediente.nombre_perito)} />
        <Fila num={5}  label="Clave del Perito Valuador que realizo el Avaluo"        valor={sa(expediente.clave_perito)} />
        <Fila num={6}  label="Cedula profesional del Valuador"                        valor={sa(expediente.cedula_perito)} />
        <Fila num={7}  label="Constructor para el caso de vivienda nueva"             valor="—" />
        <Fila num={8}  label="Proposito"                                              valor={sa(expediente.proposito_avaluo)} />
        <Fila num={9}  label="Tipo de Inmueble a valuar"                              valor={sa(expediente.tipo_inmueble)} />
        <Fila num={10} label="Calle y numero o su equivalencia"                       valor={sa([expediente.calle, expediente.numero_oficial].filter(Boolean).join(' '))} />
        <Fila num={11} label="Nombre del conjunto (de ser aplicable)"                 valor={sa(expediente.fraccionamiento)} />
        <Fila num={12} label="Colonia"                                                valor={sa(expediente.colonia)} />
        <Fila num={13} label="Codigo Postal"                                          valor={sa(expediente.cp)} />
        <Fila num={14} label="Clave Delegacion o Municipio INEGI"                    valor={sa([expediente.municipio_clave_inegi, expediente.municipio].filter(Boolean).join(' — '))} />
        <Fila num={15} label="Clave de la Entidad Federativa INEGI"                  valor={sa([expediente.estado_clave_inegi, expediente.estado_rep].filter(Boolean).join(' — '))} />
        <Fila num={16} label="Numero de cuenta predial"                               valor={sa(expediente.num_cuenta_predial)} />
        <Fila num={17} label="Referencia de proximidad urbana"                       valor={sa(entorno?.nombre_vialidad)} />
        <Fila num={18} label="Nivel de Infraestructura urbana"                       valor={sa(entorno?.nivel_socioeconomico)} />
        <Fila num={19} label="Clase del Inmueble"                                     valor={sa(expediente.uso || expediente.tipo_inmueble)} />

        {/* Filas duales 20-27 / 33-40 */}
        <Fila num={20} label="Vida Util Remanente en anos"
              valor={vidaRemanente}
              numD={33} labelD="Numero de recamaras"
              valorD={sa(descripcionConstruccion?.num_recamaras)} />
        <Fila num={21} label="Ano de terminacion o remodelacion"
              valor={anoTerminacion}
              numD={34} labelD="Numero de banos"
              valorD={sa(descripcionConstruccion?.banos_completos)} />
        <Fila num={22} label="Unidades rentables generales"
              valor="1"
              numD={35} labelD="Numero de medios banos"
              valorD={sa(descripcionConstruccion?.medios_banos)} />
        <Fila num={23} label="Unidades rentables"
              valor="1"
              numD={36} labelD="Numero de niveles de la unidad valuada"
              valorD={sa(descripcionConstruccion?.num_niveles)} />
        <Fila num={24} label="Superficie de terreno en m2"
              valor={metodoFisico?.superficie_terreno ? formatNumber(metodoFisico.superficie_terreno, 2) : '—'}
              numD={37} labelD="Numero de espacios de estacionamiento"
              valorD={estac > 0 ? String(estac) : '—'} />
        <Fila num={25} label="Superficie de construccion en m2"
              valor={metodoFisico?.superficie_construccion ? formatNumber(metodoFisico.superficie_construccion, 2) : '—'}
              numD={38} labelD="Acometida suministro telefonico"
              valorD={entorno?.telefonia != null ? (entorno.telefonia ? 'SI EXISTE' : 'NO EXISTE') : '—'} />
        <Fila num={26} label="Superficie accesoria en m2"
              valor="—"
              numD={39} labelD="Nivel de Equipamiento Urbano"
              valorD={sa(entorno?.nivel_socioeconomico)} />
        <Fila num={27} label="Superficie vendible en m2"
              valor={descripcionConstruccion?.superficie_vendible_m2 ? formatNumber(descripcionConstruccion.superficie_vendible_m2, 2) : '—'}
              numD={40} labelD="Elevador"
              valorD={descripcionConstruccion?.elevador != null ? (descripcionConstruccion.elevador ? 'SI' : 'NO') : '—'} />

        {/* Filas 28-31 con coordenadas a la derecha */}
        <Fila num={28} label="Valor comparativo de mercado"
              valor={metodoComparativo ? formatCurrency(metodoComparativo.valor_comparativo_total) : '—'}
              numD={41} labelD="Longitud (Georeferencia)"
              valorD={sa(expediente.longitud)} />
        <Fila num={29} label="Valor fisico del terreno"
              valor={metodoFisico ? formatCurrency(metodoFisico.valor_terreno) : '—'}
              numD={42} labelD="Latitud (Georeferencia)"
              valorD={sa(expediente.latitud)} />
        <Fila num={30} label="Valor fisico de la construccion"
              valor={metodoFisico ? formatCurrency(metodoFisico.valor_actual_construccion) : '—'}
              numD={43} labelD="Solicitante"
              valorD={sa(expediente.solicitante)} />
        <Fila num={31} label="Valor fisico de instalaciones y elementos comunes"      valor="—" />

        {/* Fila 32: resaltada */}
        <Fila num={32} label="Importe del valor concluido"
              valor={valorConcluido > 0 ? formatCurrency(valorConcluido) : '—'}
              resaltar />
      </View>

      {/* ── Firma ── */}
      <View style={{ marginTop: 8, alignItems: 'center' }}>
        <Text style={{ fontSize: 7.5, fontFamily: 'Helvetica-Bold', color: COLORES.primario }}>FIRMA</Text>
        <View style={{ marginTop: 4, borderTopWidth: 0.5, borderTopColor: COLORES.texto, paddingTop: 3, width: 200, alignItems: 'center' }}>
          <Text style={{ fontSize: 8, fontFamily: 'Helvetica-Bold', color: COLORES.texto, textAlign: 'center' }}>
            {sa(expediente.nombre_perito) || '_____________________________'}
          </Text>
          <Text style={{ fontSize: 6.5, color: COLORES.gris, textAlign: 'center' }}>FIRMA DE VALUADOR PROFESIONAL</Text>
          {expediente.cedula_perito && (
            <Text style={{ fontSize: 6.5, color: COLORES.gris, textAlign: 'center', marginTop: 1 }}>
              {`CEDULA PROFESIONAL: ${sa(expediente.cedula_perito)}`}
            </Text>
          )}
        </View>
      </View>

    </View>
  )
}
