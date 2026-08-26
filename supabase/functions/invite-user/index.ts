// supabase/functions/invite-user/index.ts
// Invita a un nuevo perito por email. Solo accesible para admin/superadmin.
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
    const authHeader = req.headers.get('Authorization') ?? ''
    const token = authHeader.replace('Bearer ', '')

    if (!token) {
      return new Response(JSON.stringify({ error: 'No autenticado' }), {
        status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Usar service_role para todo — validar token y luego operar
    const adminClient = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    )

    // Validar el JWT del usuario llamante
    const { data: { user }, error: authError } = await adminClient.auth.getUser(token)
    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Token inválido' }), {
        status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Verificar que sea admin o superadmin
    const { data: profile } = await adminClient
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (!profile || !['admin', 'superadmin'].includes(profile.role)) {
      return new Response(JSON.stringify({ error: 'Se requiere rol admin o superadmin' }), {
        status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const { email, nombre } = await req.json()
    if (!email?.trim()) {
      return new Response(JSON.stringify({ error: 'El email es requerido' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Enviar invitación
    const { data, error } = await adminClient.auth.admin.inviteUserByEmail(email.trim(), {
      data: { nombre_perito: nombre?.trim() ?? '' },
    })

    if (error) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Crear perfil explícitamente (no depender solo del trigger)
    // El trigger puede fallar silenciosamente en algunas versiones de Supabase
    if (data.user?.id) {
      await adminClient.from('profiles').upsert({
        id:                     data.user.id,
        email:                  email.trim(),
        nombre:                 nombre?.trim() || null,
        plan:                   'prueba',
        limite_expedientes_mes: 3,
      }, { onConflict: 'id' })
    }

    return new Response(JSON.stringify({ ok: true, user_id: data.user.id }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })

  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
