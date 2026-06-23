/**
 * Script de prueba para la extracción de comparables.
 * Usa fetch directo al portal + Claude API.
 *
 * Uso:
 *   ANTHROPIC_API_KEY=sk-ant-... node test-extraccion.mjs [URL]
 *
 * Ejemplo:
 *   ANTHROPIC_API_KEY=sk-ant-xxx node test-extraccion.mjs \
 *     "https://www.lamudi.com.mx/jalisco/zapopan/casa/1234.html"
 */

import Anthropic from '@anthropic-ai/sdk'

const url = process.argv[2]
const apiKey = process.env.ANTHROPIC_API_KEY

if (!apiKey) {
  console.error('\n❌  Falta ANTHROPIC_API_KEY')
  console.error('   Uso: ANTHROPIC_API_KEY=sk-ant-... node test-extraccion.mjs [URL]\n')
  process.exit(1)
}

if (!url) {
  console.error('\n❌  Falta URL del anuncio')
  console.error('   Uso: ANTHROPIC_API_KEY=sk-ant-... node test-extraccion.mjs https://...\n')
  process.exit(1)
}

const PROMPT = (url, contenido) => `Eres un extractor especializado en anuncios inmobiliarios de México.

Analiza el siguiente contenido y extrae los datos del inmueble en venta o renta.

URL original: ${url}

CONTENIDO (${contenido.length} chars):
${contenido.slice(0, 12000)}

Responde ÚNICAMENTE con JSON válido sin markdown. Estructura exacta:

{
  "tipo_operacion": "venta" | "renta" | null,
  "tipo_inmueble": "casa" | "departamento" | "terreno" | "local" | "bodega" | "oficina" | "otro" | null,
  "precio_total": número o null,
  "moneda": "MXN" | "USD" | null,
  "superficie_total": número m² o null,
  "superficie_construccion": número m² o null,
  "superficie_terreno": número m² o null,
  "recamaras": entero o null,
  "banos": número o null,
  "cajones": entero o null,
  "edad_anios": entero o null,
  "conservacion": "excelente" | "bueno" | "regular" | "malo" | null,
  "calle": texto o null,
  "colonia": texto o null,
  "municipio": texto o null,
  "estado": texto o null,
  "cp": "XXXXX" o null,
  "nombre_anunciante": texto o null,
  "telefono": texto o null,
  "descripcion": resumen ≤180 chars o null,
  "scores": {
    "precio_total": 0-1, "moneda": 0-1, "superficie_total": 0-1,
    "superficie_construccion": 0-1, "superficie_terreno": 0-1,
    "recamaras": 0-1, "banos": 0-1, "cajones": 0-1,
    "edad_anios": 0-1, "conservacion": 0-1, "ubicacion": 0-1
  }
}

REGLAS: score 1.0=explícito, 0.5=inferido, 0=no encontrado. precio_total=precio completo (no $/m²). null si no aparece.`

function detectarPortal(url) {
  try {
    const h = new URL(url).hostname.toLowerCase()
    if (h.includes('inmuebles24')) return 'Inmuebles24'
    if (h.includes('lamudi')) return 'Lamudi'
    if (h.includes('vivanuncios')) return 'Vivanuncios'
    if (h.includes('mercadolibre')) return 'MercadoLibre'
    if (h.includes('propiedades')) return 'Propiedades.com'
    if (h.includes('metros')) return 'Metros Cúbicos'
    return new URL(url).hostname.replace('www.', '')
  } catch { return 'Desconocido' }
}

async function obtenerContenido(url) {
  // Intento 1: Jina AI Reader
  try {
    console.log('  → Intentando Jina AI Reader...')
    const res = await fetch(`https://r.jina.ai/${url}`, {
      headers: { 'Accept': 'text/plain', 'X-Return-Format': 'markdown', 'X-With-Links-Summary': 'false' },
      signal: AbortSignal.timeout(20000),
    })
    if (res.ok) {
      const text = await res.text()
      if (text.length > 200) {
        console.log(`  ✅ Jina AI: ${text.length} chars`)
        return text
      }
    }
  } catch (e) { console.log(`  ⚠️  Jina AI no disponible: ${e.message}`) }

  // Intento 2: Fetch directo
  console.log('  → Fallback: fetch directo...')
  const res = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (compatible; Googlebot/2.1)',
      'Accept': 'text/html,application/xhtml+xml',
      'Accept-Language': 'es-MX,es;q=0.9',
    },
    signal: AbortSignal.timeout(15000),
  })
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  const html = await res.text()
  const texto = html
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s{3,}/g, '\n')
    .trim()
  console.log(`  ✅ Fetch directo: ${texto.length} chars`)
  return texto
}

async function main() {
  console.log(`\n🔍  URL: ${url}`)
  console.log(`📡  Portal: ${detectarPortal(url)}\n`)

  console.log('⏳  Paso 1: Obteniendo contenido del anuncio...')
  let contenido
  try {
    contenido = await obtenerContenido(url)
  } catch (e) {
    console.error(`❌  No se pudo obtener el contenido: ${e.message}`)
    process.exit(1)
  }

  console.log('\n⏳  Paso 2: Extrayendo datos con Claude API...')
  const anthropic = new Anthropic({ apiKey })

  const message = await anthropic.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 1024,
    messages: [{ role: 'user', content: PROMPT(url, contenido) }],
  })

  const rawText = message.content[0]?.text?.trim() ?? ''

  let datos
  try {
    datos = JSON.parse(rawText)
  } catch {
    const match = rawText.match(/\{[\s\S]*\}/)
    if (!match) {
      console.error('❌  Claude no retornó JSON válido:')
      console.error(rawText.slice(0, 500))
      process.exit(1)
    }
    datos = JSON.parse(match[0])
  }

  const resultado = {
    ...datos,
    url,
    portal: detectarPortal(url),
    fecha_captura: new Date().toISOString(),
  }

  // ── Mostrar resultado ──────────────────────────────────────────────────────
  console.log('\n' + '═'.repeat(60))
  console.log('✅  RESULTADO DE EXTRACCIÓN')
  console.log('═'.repeat(60))

  const { scores, ...campos } = resultado
  const displayFields = [
    ['Portal', campos.portal],
    ['Operación', campos.tipo_operacion],
    ['Tipo', campos.tipo_inmueble],
    ['Precio', campos.precio_total ? `$${Number(campos.precio_total).toLocaleString('es-MX')} ${campos.moneda}` : null],
    ['Sup. total', campos.superficie_total ? `${campos.superficie_total} m²` : null],
    ['Sup. construcción', campos.superficie_construccion ? `${campos.superficie_construccion} m²` : null],
    ['Sup. terreno', campos.superficie_terreno ? `${campos.superficie_terreno} m²` : null],
    ['Recámaras', campos.recamaras],
    ['Baños', campos.banos],
    ['Cajones', campos.cajones],
    ['Edad', campos.edad_anios != null ? `${campos.edad_anios} años` : null],
    ['Conservación', campos.conservacion],
    ['Calle', campos.calle],
    ['Colonia', campos.colonia],
    ['Municipio', campos.municipio],
    ['Estado', campos.estado],
    ['CP', campos.cp],
    ['Anunciante', campos.nombre_anunciante],
    ['Teléfono', campos.telefono],
    ['Descripción', campos.descripcion],
  ]

  for (const [label, valor] of displayFields) {
    if (valor !== null && valor !== undefined) {
      console.log(`  ${label.padEnd(20)} ${valor}`)
    }
  }

  console.log('\n📊  Scores de confianza:')
  const scoreOrden = ['precio_total', 'superficie_total', 'superficie_construccion', 'recamaras', 'banos', 'cajones', 'edad_anios', 'conservacion', 'ubicacion']
  for (const campo of scoreOrden) {
    const s = scores?.[campo] ?? 0
    const icon = s >= 0.8 ? '🟢' : s >= 0.6 ? '🟡' : '🔴'
    const bar = '█'.repeat(Math.round(s * 10)) + '░'.repeat(10 - Math.round(s * 10))
    console.log(`  ${icon} ${campo.padEnd(25)} ${bar} ${(s * 100).toFixed(0)}%`)
  }

  const extraidos = displayFields.filter(([, v]) => v !== null && v !== undefined).length
  console.log(`\n✅  ${extraidos}/${displayFields.length} campos extraídos`)
  console.log('═'.repeat(60) + '\n')
}

main().catch(e => {
  console.error('\n❌  Error inesperado:', e.message)
  process.exit(1)
})
