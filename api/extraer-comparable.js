import Anthropic from '@anthropic-ai/sdk'

const CAMPOS_SCORES = [
  'precio_total', 'moneda', 'superficie_total', 'superficie_construccion',
  'superficie_terreno', 'recamaras', 'banos', 'cajones', 'edad_anios',
  'conservacion', 'ubicacion',
]

const PROMPT_EXTRACCION = (url, contenido) => `Eres un extractor especializado en anuncios inmobiliarios de México.

Analiza el siguiente contenido extraído de un portal inmobiliario y extrae los datos del inmueble.

URL original: ${url}

CONTENIDO:
${contenido.slice(0, 12000)}

Responde ÚNICAMENTE con un objeto JSON válido (sin markdown, sin bloques de código, sin explicaciones). Estructura exacta:

{
  "tipo_operacion": "venta" | "renta" | null,
  "tipo_inmueble": "casa" | "departamento" | "terreno" | "local" | "bodega" | "oficina" | "otro" | null,
  "precio_total": número o null,
  "moneda": "MXN" | "USD" | null,
  "superficie_total": número en m² o null,
  "superficie_construccion": número en m² o null,
  "superficie_terreno": número en m² o null,
  "recamaras": número entero o null,
  "banos": número (puede ser 1.5) o null,
  "cajones": número entero o null,
  "edad_anios": número entero o null,
  "conservacion": "excelente" | "bueno" | "regular" | "malo" | null,
  "calle": texto o null,
  "colonia": texto o null,
  "municipio": texto o null,
  "estado": nombre del estado de México o null,
  "cp": código postal (5 dígitos como string) o null,
  "nombre_anunciante": texto o null,
  "telefono": texto o null,
  "descripcion": resumen breve del inmueble (máximo 180 caracteres) o null,
  "scores": {
    "precio_total": 0.0-1.0,
    "moneda": 0.0-1.0,
    "superficie_total": 0.0-1.0,
    "superficie_construccion": 0.0-1.0,
    "superficie_terreno": 0.0-1.0,
    "recamaras": 0.0-1.0,
    "banos": 0.0-1.0,
    "cajones": 0.0-1.0,
    "edad_anios": 0.0-1.0,
    "conservacion": 0.0-1.0,
    "ubicacion": 0.0-1.0
  }
}

REGLAS:
- scores: 1.0 = dato explícito y claro en el anuncio, 0.5 = inferido, 0.0 = no encontrado
- precio_total: precio de venta o renta del inmueble completo (NO precio por m²)
- Si hay un solo dato de superficie, ponlo en superficie_total
- edad_anios: si dice "año de construcción XXXX", calcula la edad. "nuevo" o "estrenar" = 0
- conservacion: "nuevo" o "estrenar" = excelente; infiere del estado descrito
- cp: solo 5 dígitos numéricos, sin espacios
- descripcion: síntesis útil para el valuador, incluye características clave
- Si un dato no aparece en el contenido, usa null (no inventes)`

function detectarPortal(url) {
  try {
    const hostname = new URL(url).hostname.toLowerCase()
    if (hostname.includes('inmuebles24')) return 'Inmuebles24'
    if (hostname.includes('lamudi')) return 'Lamudi'
    if (hostname.includes('vivanuncios')) return 'Vivanuncios'
    if (hostname.includes('propiedades.com')) return 'Propiedades.com'
    if (hostname.includes('metros')) return 'Metros Cúbicos'
    if (hostname.includes('easybroker')) return 'EasyBroker'
    if (hostname.includes('mercadolibre')) return 'MercadoLibre'
    if (hostname.includes('trovit')) return 'Trovit'
    return new URL(url).hostname.replace('www.', '')
  } catch {
    return 'Portal desconocido'
  }
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Método no permitido' })
  }

  const { url } = req.body || {}

  if (!url || typeof url !== 'string') {
    return res.status(400).json({ success: false, error: 'Se requiere un URL válido' })
  }

  let urlObj
  try {
    urlObj = new URL(url)
    if (!['http:', 'https:'].includes(urlObj.protocol)) throw new Error()
  } catch {
    return res.status(400).json({ success: false, error: 'El URL no es válido (debe comenzar con http:// o https://)' })
  }

  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) {
    return res.status(500).json({ success: false, error: 'Servicio de extracción no configurado (ANTHROPIC_API_KEY)' })
  }

  try {
    // Fetch page content — Jina AI Reader first, direct fetch as fallback
    let contenido = ''

    try {
      const jinaUrl = `https://r.jina.ai/${url}`
      const jinaRes = await fetch(jinaUrl, {
        headers: {
          'Accept': 'text/plain',
          'X-Return-Format': 'markdown',
          'X-With-Links-Summary': 'false',
          'X-With-Images-Summary': 'false',
        },
        signal: AbortSignal.timeout(20000),
      })
      if (jinaRes.ok) {
        contenido = await jinaRes.text()
      }
    } catch {
      // Jina failed — try direct fetch
    }

    // Fallback: direct HTTP fetch (works for portals with SSR; less reliable for SPAs)
    if (!contenido || contenido.length < 200) {
      const directRes = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)',
          'Accept': 'text/html,application/xhtml+xml',
          'Accept-Language': 'es-MX,es;q=0.9',
        },
        signal: AbortSignal.timeout(15000),
      })
      if (!directRes.ok) {
        return res.status(502).json({
          success: false,
          error: `No se pudo acceder al portal (HTTP ${directRes.status}). Verifica que el URL sea público y esté activo.`,
        })
      }
      const html = await directRes.text()
      // Strip tags for a cleaner text input to Claude
      contenido = html
        .replace(/<script[\s\S]*?<\/script>/gi, '')
        .replace(/<style[\s\S]*?<\/style>/gi, '')
        .replace(/<[^>]+>/g, ' ')
        .replace(/\s{3,}/g, '\n')
        .trim()
    }

    if (!contenido || contenido.length < 100) {
      return res.status(422).json({
        success: false,
        error: 'El anuncio no tiene suficiente contenido para extraer datos.',
      })
    }

    // Extract structured data with Claude
    const anthropic = new Anthropic({ apiKey })
    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 1024,
      messages: [{ role: 'user', content: PROMPT_EXTRACCION(url, contenido) }],
    })

    const rawText = message.content[0]?.text?.trim() ?? ''

    let datos
    try {
      datos = JSON.parse(rawText)
    } catch {
      // Try to extract JSON from text if wrapped
      const match = rawText.match(/\{[\s\S]*\}/)
      if (!match) throw new Error('Claude no retornó JSON válido')
      datos = JSON.parse(match[0])
    }

    // Ensure scores object exists
    if (!datos.scores || typeof datos.scores !== 'object') {
      datos.scores = {}
    }
    CAMPOS_SCORES.forEach(c => {
      if (typeof datos.scores[c] !== 'number') datos.scores[c] = 0
    })

    return res.status(200).json({
      success: true,
      data: {
        ...datos,
        url,
        portal: detectarPortal(url),
        fecha_captura: new Date().toISOString(),
      },
    })
  } catch (err) {
    if (err.name === 'TimeoutError' || err.name === 'AbortError') {
      return res.status(504).json({
        success: false,
        error: 'El portal tardó demasiado en responder. Intenta de nuevo.',
      })
    }
    console.error('extraer-comparable error:', err)
    return res.status(500).json({
      success: false,
      error: 'Error interno al procesar el anuncio. Intenta de nuevo.',
    })
  }
}
