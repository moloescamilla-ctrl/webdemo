// supabase/functions/capturar-comparable/index.ts
// Recibe datos de un comparable extraídos por Claude for Chrome
// y los inserta en comparables_capturados con fuente_captura = 'chrome'
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'No autorizado' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    )

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Token inválido' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const body = await req.json()
    const {
      expediente_id,
      url_fuente,
      portal,
      titulo_anuncio,
      precio_total,
      superficie_total_m2,
      recamaras,
      banos,
      estacionamientos,
      niveles,
      antiguedad_anios,
      colonia,
      municipio,
      descripcion_raw,
    } = body

    if (!expediente_id) {
      return new Response(JSON.stringify({ error: 'expediente_id es requerido' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }
    if (!precio_total || !superficie_total_m2) {
      return new Response(JSON.stringify({ error: 'precio_total y superficie_total_m2 son requeridos' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const portalDetectado = portal ?? detectarPortal(url_fuente ?? '')

    const { data, error } = await supabase
      .from('comparables_capturados')
      .insert({
        expediente_id,
        perito_id: user.id,
        url_fuente,
        portal: portalDetectado,
        fecha_captura: new Date().toISOString().split('T')[0],
        titulo_anuncio,
        precio_total: Number(precio_total),
        superficie_total_m2: Number(superficie_total_m2),
        recamaras: recamaras != null ? Number(recamaras) : null,
        banos: banos != null ? Number(banos) : null,
        estacionamientos: estacionamientos != null ? Number(estacionamientos) : null,
        niveles: niveles != null ? Number(niveles) : null,
        antiguedad_anios: antiguedad_anios != null ? Number(antiguedad_anios) : null,
        colonia,
        municipio,
        descripcion_raw,
        estado_revision: 'pendiente',
        fuente_captura: 'chrome',
      })
      .select()
      .single()

    if (error) throw error

    return new Response(JSON.stringify(data), {
      status: 201,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})

function detectarPortal(url: string): string {
  if (url.includes('inmuebles24'))  return 'Inmuebles24'
  if (url.includes('lamudi'))        return 'Lamudi'
  if (url.includes('vivanuncios'))   return 'Vivanuncios'
  if (url.includes('metroscubicos')) return 'Metros Cúbicos'
  if (url.includes('easybroker'))    return 'easybroker'
  return 'Otro'
}
