-- Habilita RLS en la tabla del sistema PostGIS para silenciar la alerta
-- del Security Advisor de Supabase. La tabla es de solo lectura y no
-- contiene datos de usuarios; sin políticas queda inaccesible desde
-- PostgREST, lo cual es el comportamiento deseado.
ALTER TABLE public.spatial_ref_sys ENABLE ROW LEVEL SECURITY;
