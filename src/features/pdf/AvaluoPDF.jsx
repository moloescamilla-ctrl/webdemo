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
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN',
    minimumFractionDigits: 2,
  }).format(val)
}

const fmtNum = (val, dec = 2) => {
  if (val == null) return '—'
  return new Intl.NumberFormat('es-MX', {
    minimumFractionDigits: dec,
    maximumFractionDigits: dec,
  }).format(val)
}

const styles = StyleSheet.create({
  page: {
    fontFamily: 'Helvetica',
    fontSize: 9,
    padding: 40,
    paddingBottom: 60,
    color: '#111827',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
    paddingBottom: 10,
    borderBottomWidth: 2,
    borderBottomColor: '#1d4ed8',
  },
  headerTitle: {
    fontSize: 14,
    fontFamily: 'Helvetica-Bold',
    color: '#1d4ed8',
  },
  headerSub: {
    fontSize: 8,
    color: '#6b7280',
    marginTop: 2,
  },
  headerRight: {
    alignItems: 'flex-end',
  },
  folio: {
    fontSize: 11,
    fontFamily: 'Helvetica-Bold',
    color: '#111827',
  },
  sectionBar: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    marginBottom: 6,
    paddingVertical: 4,
    paddingHorizontal: 8,
    backgroundColor: '#1d4ed8',
    borderRadius: 3,
  },
  sectionBarGreen: {
    backgroundColor: '#16a34a',
    marginTop: 16,
  },
  sectionTitle: {
    fontSize: 9,
    fontFamily: 'Helvetica-Bold',
    color: '#ffffff',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 3,
    borderBottomWidth: 0.5,
    borderBottomColor: '#f3f4f6',
  },
  rowLabel: {
    color: '#6b7280',
    flex: 1,
  },
  rowValue: {
    fontFamily: 'Helvetica-Bold',
    textAlign: 'right',
    flex: 1,
  },
  grid2: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  col: {
    flex: 1,
    paddingRight: 8,
  },
  colLast: {
    flex: 1,
  },
  valuebox: {
    backgroundColor: '#1d4ed8',
    borderRadius: 4,
    padding: 10,
    marginTop: 8,
  },
  valueboxGreen: {
    backgroundColor: '#16a34a',
  },
  valueboxLabel: {
    color: '#bfdbfe',
    fontSize: 8,
  },
  valueboxLabelGreen: {
    color: '#bbf7d0',
  },
  valueboxAmount: {
    color: '#ffffff',
    fontSize: 14,
    fontFamily: 'Helvetica-Bold',
    marginTop: 2,
  },
  minibox: {
    backgroundColor: '#f9fafb',
    borderRadius: 3,
    padding: 8,
    flex: 1,
  },
  miniboxRight: {
    backgroundColor: '#f9fafb',
    borderRadius: 3,
    padding: 8,
    flex: 1,
    marginLeft: 8,
  },
  miniboxLabel: {
    color: '#6b7280',
    fontSize: 8,
  },
  miniboxValue: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 9,
    marginTop: 2,
  },
  miniboxRow: {
    flexDirection: 'row',
    marginTop: 6,
  },
  depBar: {
    height: 6,
    backgroundColor: '#e5e7eb',
    borderRadius: 3,
    marginTop: 6,
    marginBottom: 2,
  },
  depFill: {
    height: 6,
    backgroundColor: '#f87171',
    borderRadius: 3,
  },
  depLabel: {
    color: '#ef4444',
    fontSize: 8,
    textAlign: 'right',
  },
  table: {
    marginTop: 6,
  },
  tableHead: {
    flexDirection: 'row',
    backgroundColor: '#f3f4f6',
    paddingVertical: 3,
    paddingHorizontal: 6,
    borderRadius: 2,
    marginBottom: 2,
  },
  tableHeadCell: {
    color: '#6b7280',
    fontSize: 8,
    fontFamily: 'Helvetica-Bold',
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 2.5,
    paddingHorizontal: 6,
    borderBottomWidth: 0.5,
    borderBottomColor: '#f3f4f6',
  },
  tableRowAlt: {
    flexDirection: 'row',
    paddingVertical: 2.5,
    paddingHorizontal: 6,
    borderBottomWidth: 0.5,
    borderBottomColor: '#f3f4f6',
    backgroundColor: '#f9fafb',
  },
  tableCell: {
    fontSize: 8,
    color: '#374151',
  },
  tableCellBold: {
    fontFamily: 'Helvetica-Bold',
    color: '#1e40af',
  },
  tableFoot: {
    flexDirection: 'row',
    paddingVertical: 3,
    paddingHorizontal: 6,
    backgroundColor: '#e5e7eb',
    borderRadius: 2,
    marginTop: 2,
  },
  footer: {
    position: 'absolute',
    bottom: 24,
    left: 40,
    right: 40,
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 0.5,
    borderTopColor: '#e5e7eb',
    paddingTop: 6,
  },
  footerText: {
    color: '#9ca3af',
    fontSize: 7.5,
  },
})

export function AvaluoPDF({ expediente, metodoFisico, inspeccion, metodoComparativo }) {
  const folio = s(expediente.folio || expediente.id.slice(0, 8).toUpperCase())
  const fecha = new Date().toLocaleDateString('es-MX', { year: 'numeric', month: 'long', day: 'numeric' })
  const dir = [expediente.calle, expediente.colonia, expediente.municipio, expediente.estado_rep]
    .filter(Boolean).map(s).join(', ')
  const depPct = Math.min(metodoFisico?.porcentaje_depreciacion ?? 0, 100)
  const comparables = (metodoComparativo?.comparables ?? []).filter(c => c.precioM2Homologado > 0)

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
            <Text style={styles.headerSub}>{s(fecha)}</Text>
          </View>
        </View>

        {/* Datos Generales */}
        <View style={styles.sectionBar}>
          <Text style={styles.sectionTitle}>DATOS GENERALES</Text>
        </View>
        <View style={styles.grid2}>
          <View style={styles.col}>
            <View style={styles.row}>
              <Text style={styles.rowLabel}>Tipo de inmueble</Text>
              <Text style={styles.rowValue}>{s(expediente.tipo_inmueble) || '—'}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.rowLabel}>Uso</Text>
              <Text style={styles.rowValue}>{s(expediente.uso) || '—'}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.rowLabel}>Solicitante</Text>
              <Text style={styles.rowValue}>{s(expediente.solicitante) || '—'}</Text>
            </View>
          </View>
          <View style={styles.colLast}>
            <View style={styles.row}>
              <Text style={styles.rowLabel}>Direccion</Text>
              <Text style={styles.rowValue}>{dir || '—'}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.rowLabel}>Fecha inspeccion</Text>
              <Text style={styles.rowValue}>
                {expediente.fecha_inspeccion
                  ? new Date(expediente.fecha_inspeccion + 'T00:00:00').toLocaleDateString('es-MX')
                  : '—'}
              </Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.rowLabel}>Codigo postal</Text>
              <Text style={styles.rowValue}>{expediente.cp || '—'}</Text>
            </View>
          </View>
        </View>

        {/* Metodo Fisico */}
        {metodoFisico && (
          <>
            <View style={styles.sectionBar}>
              <Text style={styles.sectionTitle}>METODO FISICO — ROSS HEIDECKE</Text>
            </View>

            <View style={styles.grid2}>
              <View style={styles.col}>
                <View style={styles.row}>
                  <Text style={styles.rowLabel}>Sup. construccion</Text>
                  <Text style={styles.rowValue}>{fmtNum(metodoFisico.superficie_construccion)} m2</Text>
                </View>
                <View style={styles.row}>
                  <Text style={styles.rowLabel}>Sup. terreno</Text>
                  <Text style={styles.rowValue}>{fmtNum(metodoFisico.superficie_terreno)} m2</Text>
                </View>
                <View style={styles.row}>
                  <Text style={styles.rowLabel}>Costo repos. /m2</Text>
                  <Text style={styles.rowValue}>{fmt(metodoFisico.costo_reposicion_m2)}</Text>
                </View>
                <View style={styles.row}>
                  <Text style={styles.rowLabel}>Val. unit. terreno /m2</Text>
                  <Text style={styles.rowValue}>{fmt(metodoFisico.valor_unitario_terreno)}</Text>
                </View>
              </View>
              <View style={styles.colLast}>
                <View style={styles.row}>
                  <Text style={styles.rowLabel}>Edad</Text>
                  <Text style={styles.rowValue}>{metodoFisico.edad_anios} anos</Text>
                </View>
                <View style={styles.row}>
                  <Text style={styles.rowLabel}>Vida util</Text>
                  <Text style={styles.rowValue}>{metodoFisico.vida_util_anios} anos</Text>
                </View>
                <View style={styles.row}>
                  <Text style={styles.rowLabel}>Factor Ross (A)</Text>
                  <Text style={styles.rowValue}>{fmtNum(metodoFisico.factor_ross, 4)}</Text>
                </View>
                <View style={styles.row}>
                  <Text style={styles.rowLabel}>Coef. Heidecke (C)</Text>
                  <Text style={styles.rowValue}>{fmtNum(metodoFisico.coeficiente_c_adoptado, 4)}</Text>
                </View>
              </View>
            </View>

            {inspeccion && (
              <Text style={{ color: '#6b7280', fontSize: 8, marginTop: 4 }}>
                {'Estado conservacion: '}
                <Text style={{ fontFamily: 'Helvetica-Bold' }}>{s(inspeccion.estado_heidecke)}</Text>
                {inspeccion.estado_manual ? ` (ajustado: ${s(inspeccion.estado_manual)})` : ''}
              </Text>
            )}

            <View style={{ marginTop: 8 }}>
              <View style={styles.depBar}>
                <View style={[styles.depFill, { width: `${depPct}%` }]} />
              </View>
              <Text style={styles.depLabel}>{fmtNum(depPct, 2)}% depreciado</Text>
            </View>

            <View style={styles.miniboxRow}>
              <View style={styles.minibox}>
                <Text style={styles.miniboxLabel}>Valor actual construccion</Text>
                <Text style={styles.miniboxValue}>{fmt(metodoFisico.valor_actual_construccion)}</Text>
              </View>
              <View style={styles.miniboxRight}>
                <Text style={styles.miniboxLabel}>Valor del terreno</Text>
                <Text style={styles.miniboxValue}>{fmt(metodoFisico.valor_terreno)}</Text>
              </View>
            </View>

            <View style={styles.valuebox}>
              <Text style={styles.valueboxLabel}>Valor fisico total</Text>
              <Text style={styles.valueboxAmount}>{fmt(metodoFisico.valor_fisico_total)}</Text>
            </View>
          </>
        )}

        {/* Metodo Comparativo */}
        {metodoComparativo && (
          <>
            <View style={styles.sectionBarGreen}>
              <Text style={styles.sectionTitle}>METODO COMPARATIVO DE MERCADO</Text>
            </View>

            <View style={styles.row}>
              <Text style={styles.rowLabel}>Superficie sujeto</Text>
              <Text style={styles.rowValue}>{fmtNum(metodoComparativo.superficie_sujeto)} m2</Text>
            </View>
            <View style={[styles.row, { marginBottom: 6 }]}>
              <Text style={styles.rowLabel}>Comparables utilizados</Text>
              <Text style={styles.rowValue}>{comparables.length}</Text>
            </View>

            {comparables.length > 0 && (
              <View style={styles.table}>
                <View style={styles.tableHead}>
                  <Text style={[styles.tableHeadCell, { flex: 3 }]}>Comparable</Text>
                  <Text style={[styles.tableHeadCell, { flex: 1, textAlign: 'right' }]}>F.Total</Text>
                  <Text style={[styles.tableHeadCell, { flex: 1.5, textAlign: 'right' }]}>$/m2 Homo</Text>
                </View>
                {comparables.map((c, i) => (
                  <View key={i} style={i % 2 === 0 ? styles.tableRow : styles.tableRowAlt}>
                    <Text style={[styles.tableCell, { flex: 3 }]}>{s(c.descripcion) || `Comparable ${i + 1}`}</Text>
                    <Text style={[styles.tableCell, { flex: 1, textAlign: 'right' }]}>{fmtNum(c.factorTotal, 4)}</Text>
                    <Text style={[styles.tableCell, styles.tableCellBold, { flex: 1.5, textAlign: 'right' }]}>{fmtNum(c.precioM2Homologado, 2)}</Text>
                  </View>
                ))}
                <View style={styles.tableFoot}>
                  <Text style={[styles.tableHeadCell, { flex: 4 }]}>Valor unitario ponderado</Text>
                  <Text style={[styles.tableHeadCell, { flex: 1.5, textAlign: 'right', color: '#1e3a5f' }]}>
                    {fmtNum(metodoComparativo.valor_unitario_ponderado, 2)}
                  </Text>
                </View>
              </View>
            )}

            <View style={[styles.valuebox, styles.valueboxGreen]}>
              <Text style={[styles.valueboxLabel, styles.valueboxLabelGreen]}>Valor comparativo total</Text>
              <Text style={styles.valueboxAmount}>{fmt(metodoComparativo.valor_comparativo_total)}</Text>
            </View>
          </>
        )}

        {/* Footer */}
        <View style={styles.footer} fixed>
          <Text style={styles.footerText}>Folio: {folio} — Avaluos Inmobiliarios MX</Text>
          <Text
            style={styles.footerText}
            render={({ pageNumber, totalPages }) => `Pagina ${pageNumber} de ${totalPages}`}
          />
        </View>
      </Page>
    </Document>
  )
}
