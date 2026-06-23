import { Document, Page, View, Text, StyleSheet } from '@react-pdf/renderer'

const s = (str) => (str ?? '')
  .replace(/[áà]/g, 'a').replace(/[ÁÀ]/g, 'A')
  .replace(/[éè]/g, 'e').replace(/[ÉÈ]/g, 'E')
  .replace(/[íì]/g, 'i').replace(/[ÍÌ]/g, 'I')
  .replace(/[óò]/g, 'o').replace(/[ÓÒ]/g, 'O')
  .replace(/[úùü]/g, 'u').replace(/[ÚÙÜ]/g, 'U')
  .replace(/ñ/g, 'n').replace(/Ñ/g, 'N')
  .replace(/ç/g, 'c').replace(/Ç/g, 'C')

const fmt = (val) => {
  if (val == null) return '—'
  return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN', minimumFractionDigits: 2 }).format(val)
}

const fmtNum = (val, dec = 2) => {
  if (val == null) return '—'
  return new Intl.NumberFormat('es-MX', { minimumFractionDigits: dec, maximumFractionDigits: dec }).format(val)
}

const c = {
  blue: '#1d4ed8',
  green: '#16a34a',
  white: '#ffffff',
  gray50: '#f9fafb',
  gray100: '#f3f4f6',
  gray200: '#e5e7eb',
  gray400: '#9ca3af',
  gray500: '#6b7280',
  gray600: '#374151',
  gray700: '#111827',
  red400: '#f87171',
  red500: '#ef4444',
  blue100: '#bfdbfe',
  blue800: '#1e40af',
  green100: '#bbf7d0',
}

const styles = StyleSheet.create({
  page: { fontFamily: 'Helvetica', fontSize: 9, padding: 40, paddingBottom: 60, color: c.gray700 },
  header: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16, paddingBottom: 10, borderBottomWidth: 2, borderBottomColor: c.blue },
  headerTitle: { fontSize: 14, fontFamily: 'Helvetica-Bold', color: c.blue },
  headerSub: { fontSize: 8, color: c.gray500, marginTop: 2 },
  headerRight: { alignItems: 'flex-end' },
  folio: { fontSize: 11, fontFamily: 'Helvetica-Bold', color: c.gray700 },
  sectionBlue: { flexDirection: 'row', marginTop: 12, marginBottom: 6, paddingVertical: 4, paddingHorizontal: 8, backgroundColor: c.blue, borderRadius: 3 },
  sectionGreen: { flexDirection: 'row', marginTop: 16, marginBottom: 6, paddingVertical: 4, paddingHorizontal: 8, backgroundColor: c.green, borderRadius: 3 },
  sectionTitle: { fontSize: 9, fontFamily: 'Helvetica-Bold', color: c.white },
  row: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 3, borderBottomWidth: 0.5, borderBottomColor: c.gray100 },
  rowMb: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 3, borderBottomWidth: 0.5, borderBottomColor: c.gray100, marginBottom: 6 },
  rowLabel: { color: c.gray500, flex: 1 },
  rowValue: { fontFamily: 'Helvetica-Bold', textAlign: 'right', flex: 1 },
  grid: { flexDirection: 'row', marginBottom: 8 },
  col: { flex: 1, paddingRight: 8 },
  colEnd: { flex: 1 },
  blueBox: { backgroundColor: c.blue, borderRadius: 4, padding: 10, marginTop: 8 },
  greenBox: { backgroundColor: c.green, borderRadius: 4, padding: 10, marginTop: 8 },
  boxLabelBlue: { color: c.blue100, fontSize: 8 },
  boxLabelGreen: { color: c.green100, fontSize: 8 },
  boxAmount: { color: c.white, fontSize: 14, fontFamily: 'Helvetica-Bold', marginTop: 2 },
  miniRow: { flexDirection: 'row', marginTop: 6 },
  mini: { flex: 1, backgroundColor: c.gray50, borderRadius: 3, padding: 8 },
  miniRight: { flex: 1, backgroundColor: c.gray50, borderRadius: 3, padding: 8, marginLeft: 8 },
  miniLabel: { color: c.gray500, fontSize: 8 },
  miniValue: { fontFamily: 'Helvetica-Bold', fontSize: 9, marginTop: 2 },
  depTrack: { height: 6, backgroundColor: c.gray200, borderRadius: 3, marginTop: 6, marginBottom: 2 },
  depFill: { height: 6, backgroundColor: c.red400, borderRadius: 3 },
  depLabel: { color: c.red500, fontSize: 8, textAlign: 'right' },
  noteText: { color: c.gray500, fontSize: 8, marginTop: 4 },
  noteBold: { fontFamily: 'Helvetica-Bold' },
  tHead: { flexDirection: 'row', backgroundColor: c.gray100, paddingVertical: 3, paddingHorizontal: 6, borderRadius: 2, marginBottom: 2 },
  tHCell: { color: c.gray500, fontSize: 8, fontFamily: 'Helvetica-Bold' },
  tRow: { flexDirection: 'row', paddingVertical: 2.5, paddingHorizontal: 6, borderBottomWidth: 0.5, borderBottomColor: c.gray100 },
  tRowAlt: { flexDirection: 'row', paddingVertical: 2.5, paddingHorizontal: 6, borderBottomWidth: 0.5, borderBottomColor: c.gray100, backgroundColor: c.gray50 },
  tCell: { fontSize: 8, color: c.gray600 },
  tCellBold: { fontSize: 8, color: c.blue800, fontFamily: 'Helvetica-Bold' },
  tFoot: { flexDirection: 'row', paddingVertical: 3, paddingHorizontal: 6, backgroundColor: c.gray200, borderRadius: 2, marginTop: 2 },
  footer: { position: 'absolute', bottom: 24, left: 40, right: 40, flexDirection: 'row', justifyContent: 'space-between', borderTopWidth: 0.5, borderTopColor: c.gray200, paddingTop: 6 },
  footerText: { color: c.gray400, fontSize: 7.5 },
})

function DataRow({ label, value }) {
  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={styles.rowValue}>{value}</Text>
    </View>
  )
}

export function AvaluoPDF({ expediente, metodoFisico, inspeccion, metodoComparativo }) {
  const folio = s(expediente.folio || expediente.id.slice(0, 8).toUpperCase())
  const fecha = s(new Date().toLocaleDateString('es-MX', { year: 'numeric', month: 'long', day: 'numeric' }))
  const dir = [expediente.calle, expediente.colonia, expediente.municipio, expediente.estado_rep]
    .filter(Boolean).map(s).join(', ')
  const depPct = Math.min(Number(metodoFisico?.porcentaje_depreciacion) || 0, 100)
  const comparables = metodoComparativo
    ? (metodoComparativo.comparables || []).filter(c => c.precioM2Homologado > 0)
    : []

  return (
    <Document title={`Avaluo ${folio}`} author="Avaluos Inmobiliarios MX">
      <Page size="LETTER" style={styles.page}>

        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.headerTitle}>Avaluos Inmobiliarios MX</Text>
            <Text style={styles.headerSub}>Dictamen de Valor Inmobiliario</Text>
          </View>
          <View style={styles.headerRight}>
            <Text style={styles.folio}>Folio: {folio}</Text>
            <Text style={styles.headerSub}>{fecha}</Text>
          </View>
        </View>

        {/* Datos Generales */}
        <View style={styles.sectionBlue}>
          <Text style={styles.sectionTitle}>DATOS GENERALES</Text>
        </View>
        <View style={styles.grid}>
          <View style={styles.col}>
            <DataRow label="Tipo de inmueble" value={s(expediente.tipo_inmueble) || '—'} />
            <DataRow label="Uso" value={s(expediente.uso) || '—'} />
            <DataRow label="Solicitante" value={s(expediente.solicitante) || '—'} />
          </View>
          <View style={styles.colEnd}>
            <DataRow label="Direccion" value={dir || '—'} />
            <DataRow
              label="Fecha inspeccion"
              value={expediente.fecha_inspeccion
                ? new Date(expediente.fecha_inspeccion + 'T00:00:00').toLocaleDateString('es-MX')
                : '—'}
            />
            <DataRow label="Codigo postal" value={expediente.cp || '—'} />
          </View>
        </View>

        {/* Metodo Fisico */}
        {metodoFisico ? (
          <View>
            <View style={styles.sectionBlue}>
              <Text style={styles.sectionTitle}>METODO FISICO — ROSS HEIDECKE</Text>
            </View>
            <View style={styles.grid}>
              <View style={styles.col}>
                <DataRow label="Sup. construccion" value={`${fmtNum(metodoFisico.superficie_construccion)} m2`} />
                <DataRow label="Sup. terreno" value={`${fmtNum(metodoFisico.superficie_terreno)} m2`} />
                <DataRow label="Costo repos. /m2" value={fmt(metodoFisico.costo_reposicion_m2)} />
                <DataRow label="Val. unit. terreno /m2" value={fmt(metodoFisico.valor_unitario_terreno)} />
              </View>
              <View style={styles.colEnd}>
                <DataRow label="Edad" value={`${metodoFisico.edad_anios} anos`} />
                <DataRow label="Vida util" value={`${metodoFisico.vida_util_anios} anos`} />
                <DataRow label="Factor Ross (A)" value={fmtNum(metodoFisico.factor_ross, 4)} />
                <DataRow label="Coef. Heidecke (C)" value={fmtNum(metodoFisico.coeficiente_c_adoptado, 4)} />
              </View>
            </View>

            {inspeccion ? (
              <Text style={styles.noteText}>
                {'Estado conservacion: '}
                <Text style={styles.noteBold}>{s(inspeccion.estado_heidecke)}</Text>
                {inspeccion.estado_manual ? ` (ajustado: ${s(inspeccion.estado_manual)})` : ''}
              </Text>
            ) : null}

            <View style={{ marginTop: 8 }}>
              <View style={styles.depTrack}>
                <View style={{ height: 6, backgroundColor: c.red400, borderRadius: 3, width: `${depPct}%` }} />
              </View>
              <Text style={styles.depLabel}>{fmtNum(depPct, 2)}% depreciado</Text>
            </View>

            <View style={styles.miniRow}>
              <View style={styles.mini}>
                <Text style={styles.miniLabel}>Valor actual construccion</Text>
                <Text style={styles.miniValue}>{fmt(metodoFisico.valor_actual_construccion)}</Text>
              </View>
              <View style={styles.miniRight}>
                <Text style={styles.miniLabel}>Valor del terreno</Text>
                <Text style={styles.miniValue}>{fmt(metodoFisico.valor_terreno)}</Text>
              </View>
            </View>

            <View style={styles.blueBox}>
              <Text style={styles.boxLabelBlue}>Valor fisico total</Text>
              <Text style={styles.boxAmount}>{fmt(metodoFisico.valor_fisico_total)}</Text>
            </View>
          </View>
        ) : null}

        {/* Metodo Comparativo */}
        {metodoComparativo ? (
          <View>
            <View style={styles.sectionGreen}>
              <Text style={styles.sectionTitle}>METODO COMPARATIVO DE MERCADO</Text>
            </View>

            <DataRow label="Superficie sujeto" value={`${fmtNum(metodoComparativo.superficie_sujeto)} m2`} />
            <View style={styles.rowMb}>
              <Text style={styles.rowLabel}>Comparables utilizados</Text>
              <Text style={styles.rowValue}>{String(comparables.length)}</Text>
            </View>

            {comparables.length > 0 ? (
              <View style={{ marginBottom: 4 }}>
                <View style={styles.tHead}>
                  <Text style={[styles.tHCell, { flex: 3 }]}>Comparable</Text>
                  <Text style={[styles.tHCell, { flex: 1, textAlign: 'right' }]}>F.Total</Text>
                  <Text style={[styles.tHCell, { flex: 2, textAlign: 'right' }]}>$/m2 Homo</Text>
                </View>
                {comparables.map((comp, i) => (
                  <View key={i} style={i % 2 === 0 ? styles.tRow : styles.tRowAlt}>
                    <Text style={[styles.tCell, { flex: 3 }]}>{s(comp.descripcion) || `Comparable ${i + 1}`}</Text>
                    <Text style={[styles.tCell, { flex: 1, textAlign: 'right' }]}>{fmtNum(comp.factorTotal, 4)}</Text>
                    <Text style={[styles.tCellBold, { flex: 2, textAlign: 'right' }]}>{fmtNum(comp.precioM2Homologado, 2)}</Text>
                  </View>
                ))}
                <View style={styles.tFoot}>
                  <Text style={[styles.tHCell, { flex: 4 }]}>Valor unitario ponderado</Text>
                  <Text style={[styles.tHCell, { flex: 2, textAlign: 'right' }]}>{fmtNum(metodoComparativo.valor_unitario_ponderado, 2)}</Text>
                </View>
              </View>
            ) : null}

            <View style={styles.greenBox}>
              <Text style={styles.boxLabelGreen}>Valor comparativo total</Text>
              <Text style={styles.boxAmount}>{fmt(metodoComparativo.valor_comparativo_total)}</Text>
            </View>
          </View>
        ) : null}

        {/* Footer */}
        <View style={styles.footer} fixed>
          <Text style={styles.footerText}>Folio: {folio} — Avaluos Inmobiliarios MX</Text>
          <Text style={styles.footerText} render={({ pageNumber, totalPages }) => `Pagina ${pageNumber} de ${totalPages}`} />
        </View>

      </Page>
    </Document>
  )
}
