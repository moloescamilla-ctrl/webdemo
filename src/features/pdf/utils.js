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

export function numeroALetras(n) {
  if (!n || isNaN(n)) return '—'
  const unidades = ['','UN','DOS','TRES','CUATRO','CINCO','SEIS','SIETE','OCHO','NUEVE']
  const decenas  = ['','DIEZ','VEINTE','TREINTA','CUARENTA','CINCUENTA','SESENTA','SETENTA','OCHENTA','NOVENTA']
  const especial  = ['ONCE','DOCE','TRECE','CATORCE','QUINCE','DIECISEIS','DIECISIETE','DIECIOCHO','DIECINUEVE']
  const centenas = ['','CIENTO','DOSCIENTOS','TRESCIENTOS','CUATROCIENTOS','QUINIENTOS','SEISCIENTOS','SETECIENTOS','OCHOCIENTOS','NOVECIENTOS']
  const num = Math.round(Number(n))
  if (num === 0) return 'CERO'
  if (num === 100) return 'CIEN'
  if (num >= 1000000) {
    const mill = Math.floor(num / 1000000)
    const rest = num % 1000000
    const millStr = mill === 1 ? 'UN MILLON' : `${numeroALetras(mill)} MILLONES`
    return rest > 0 ? `${millStr} ${numeroALetras(rest)}` : millStr
  }
  if (num >= 1000) {
    const miles = Math.floor(num / 1000)
    const rest  = num % 1000
    const milesStr = miles === 1 ? 'MIL' : `${numeroALetras(miles)} MIL`
    return rest > 0 ? `${milesStr} ${numeroALetras(rest)}` : milesStr
  }
  if (num >= 100) {
    const c = Math.floor(num / 100)
    const r = num % 100
    return r > 0 ? `${centenas[c]} ${numeroALetras(r)}` : centenas[c]
  }
  if (num > 10 && num < 20) return especial[num - 11]
  if (num >= 10) {
    const d = Math.floor(num / 10)
    const u = num % 10
    return u > 0 ? `${decenas[d]} Y ${unidades[u]}` : decenas[d]
  }
  return unidades[num]
}

export function vigenciaAvaluo(fechaInspeccion) {
  if (!fechaInspeccion) return '—'
  try {
    const d = new Date(fechaInspeccion + 'T00:00:00')
    d.setMonth(d.getMonth() + 6)
    return d.toLocaleDateString('es-MX', { day: '2-digit', month: 'long', year: 'numeric' })
  } catch { return '—' }
}
