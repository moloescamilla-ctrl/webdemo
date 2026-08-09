import * as XLSX from 'xlsx'

const ESTADO_LABEL = {
  pendiente:  'Pendiente',
  aprobado:   'Aprobado',
  descartado: 'Descartado',
}

export function exportarComparablesXLSX(comparables, folio = '') {
  const filas = comparables.map(c => ({
    'Estado':              ESTADO_LABEL[c.estado_revision] ?? c.estado_revision,
    'Título / Anuncio':    c.titulo_anuncio || '',
    'Colonia':             c.colonia || '',
    'Municipio':           c.municipio || '',
    'Precio total ($)':    c.precio_total ?? '',
    'Superficie (m²)':     c.superficie_total_m2 ?? '',
    'Precio unitario ($/m²)': c.precio_unitario ?? '',
    'Recámaras':           c.recamaras ?? '',
    'Baños':               c.banos ?? '',
    'Estacionamientos':    c.estacionamientos ?? '',
    'Niveles':             c.niveles ?? '',
    'Antigüedad (años)':   c.antiguedad_anios ?? '',
    'Notas del valuador':  c.notas_valuador || '',
    'Portal':              c.portal || '',
    'URL fuente':          c.url_fuente || '',
    'Fecha captura':       c.fecha_captura || '',
  }))

  const hoja = XLSX.utils.json_to_sheet(filas)

  // Ancho de columnas aproximado
  hoja['!cols'] = [
    { wch: 12 }, // Estado
    { wch: 35 }, // Título
    { wch: 20 }, // Colonia
    { wch: 20 }, // Municipio
    { wch: 16 }, // Precio total
    { wch: 14 }, // Superficie
    { wch: 20 }, // Precio unitario
    { wch: 10 }, // Recámaras
    { wch: 8  }, // Baños
    { wch: 16 }, // Estacionamientos
    { wch: 8  }, // Niveles
    { wch: 16 }, // Antigüedad
    { wch: 30 }, // Notas
    { wch: 14 }, // Portal
    { wch: 40 }, // URL
    { wch: 14 }, // Fecha
  ]

  const libro = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(libro, hoja, 'Comparables')

  const nombre = folio ? `comparables_${folio}.xlsx` : 'comparables.xlsx'
  XLSX.writeFile(libro, nombre)
}
