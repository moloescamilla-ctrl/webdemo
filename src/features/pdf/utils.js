// Strip diacritics — Helvetica in react-pdf doesn't support accented chars
export function sa(str) {
  if (str == null) return ''
  return String(str)
    .replace(/[áàä]/g, 'a').replace(/[ÁÀÄ]/g, 'A')
    .replace(/[éèë]/g, 'e').replace(/[ÉÈË]/g, 'E')
    .replace(/[íìï]/g, 'i').replace(/[ÍÌÏ]/g, 'I')
    .replace(/[óòö]/g, 'o').replace(/[ÓÒÖ]/g, 'O')
    .replace(/[úùüû]/g, 'u').replace(/[ÚÙÜ]/g, 'U')
    .replace(/ñ/g, 'n').replace(/Ñ/g, 'N')
    .replace(/ç/g, 'c').replace(/Ç/g, 'C')
}

export function formatCurrency(val) {
  if (val == null) return '—'
  return new Intl.NumberFormat('es-MX', {
    style: 'currency', currency: 'MXN', minimumFractionDigits: 2,
  }).format(val)
}

export function formatNumber(val, dec = 2) {
  if (val == null) return '—'
  return new Intl.NumberFormat('es-MX', {
    minimumFractionDigits: dec, maximumFractionDigits: dec,
  }).format(val)
}

export function formatDate(val) {
  if (!val) return '—'
  return new Date(val + 'T00:00:00').toLocaleDateString('es-MX', {
    day: '2-digit', month: 'long', year: 'numeric',
  })
}

export function formatFecha(val) {
  if (!val) return '—'
  try {
    const d = new Date(val)
    return d.toLocaleDateString('es-MX', { day: '2-digit', month: 'long', year: 'numeric' })
  } catch { return String(val) }
}

export function obtenerCroquisURL({ lat, lng, zoom = 15, width = 500, height = 280 }) {
  if (!lat || !lng) return null
  const key = import.meta.env.VITE_GOOGLE_MAPS_API_KEY
  if (key) {
    return [
      'https://maps.googleapis.com/maps/api/staticmap',
      `?center=${lat},${lng}`,
      `&zoom=${zoom}`,
      `&size=${width}x${height}`,
      '&maptype=roadmap',
      `&markers=color:red|${lat},${lng}`,
      `&key=${key}`,
    ].join('')
  }
  // Free fallback — OpenStreetMap static map
  return `https://staticmap.openstreetmap.de/staticmap.php?center=${lat},${lng}&zoom=${zoom}&size=${width}x${height}&markers=${lat},${lng},red-pushpin`
}

export function vigenciaAvaluo(fechaInspeccion) {
  if (!fechaInspeccion) return '—'
  try {
    const d = new Date(fechaInspeccion + 'T00:00:00')
    d.setMonth(d.getMonth() + 6)
    return d.toLocaleDateString('es-MX', { day: '2-digit', month: 'long', year: 'numeric' })
  } catch { return '—' }
}
