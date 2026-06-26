import Anthropic from '@anthropic-ai/sdk'

const SYSTEM_PROMPT = `Eres un extractor especializado en anuncios de bienes raíces en México.
El usuario te pegará el texto de un anuncio de propiedad en venta.
Extrae todos los datos que puedas y devuelve ÚNICAMENTE un objeto JSON válido (sin markdown, sin explicaciones).
Campos a extraer:
{
  "titulo_anuncio": "string o null",
  "precio_total": number_o_null,
  "superficie_total_m2": number_o_null,
  "recamaras": integer_o_null,
  "banos": number_o_null,
  "estacionamientos": integer_o_null,
  "niveles": integer_o_null,
  "antiguedad_anios": integer_o_null,
  "colonia": "string o null",
  "municipio": "string o null",
  "portal": "string o null",
  "descripcion_raw": "primeros 300 chars de descripcion o null"
}
precio_total en MXN como número sin comas ni signos. Si un dato no aparece, usa null. No inventes datos.`

export async function extraerComparableDeTexto(texto, apiKey) {
  const client = new Anthropic({ apiKey, dangerouslyAllowBrowser: true })

  const message = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 1024,
    system: SYSTEM_PROMPT,
    messages: [{ role: 'user', content: `Texto del anuncio:\n\n${texto}` }],
  })

  const raw = message.content[0]?.text?.trim() ?? ''
  const clean = raw.replace(/^```json\s*/i, '').replace(/\s*```$/, '')
  return JSON.parse(clean)
}
