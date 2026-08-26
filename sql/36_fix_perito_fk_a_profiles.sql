-- ============================================================
-- 36_fix_perito_fk_a_profiles.sql
-- expedientes.perito_id referenciaba public.peritos (tabla original
-- del sistema). Los usuarios invitados no tienen fila en peritos,
-- lo que causa FK violation al crear un expediente.
-- Solución: mover la FK a public.profiles, que ya tiene todos
-- los usuarios autenticados y es mantenida por trigger + upsert.
-- ============================================================

-- 1. Asegurar que todo usuario de auth.users tenga fila en profiles
INSERT INTO public.profiles (id, email, nombre)
SELECT
  id,
  email,
  raw_user_meta_data->>'nombre_perito'
FROM auth.users
ON CONFLICT (id) DO NOTHING;

-- 2. Asegurar que todo perito_id en expedientes existentes tenga fila en profiles
INSERT INTO public.profiles (id, email)
SELECT DISTINCT e.perito_id, u.email
FROM public.expedientes e
JOIN auth.users u ON u.id = e.perito_id
WHERE e.perito_id IS NOT NULL
ON CONFLICT (id) DO NOTHING;

-- 3. Cambiar la FK de public.peritos → public.profiles
ALTER TABLE public.expedientes
  DROP CONSTRAINT IF EXISTS expedientes_perito_id_fkey;

ALTER TABLE public.expedientes
  ADD CONSTRAINT expedientes_perito_id_fkey
    FOREIGN KEY (perito_id) REFERENCES public.profiles(id) ON DELETE CASCADE;
