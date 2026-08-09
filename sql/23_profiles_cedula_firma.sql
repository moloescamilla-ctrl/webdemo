-- ============================================================
-- 23_profiles_cedula_firma.sql
-- Agrega cédula y firma_url a profiles.
-- Agrega política UPDATE para que el perito edite su propio perfil.
-- Seguro de ejecutar múltiples veces.
-- ============================================================

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS cedula    TEXT,
  ADD COLUMN IF NOT EXISTS firma_url TEXT;

-- Política: el perito solo puede actualizar su propio perfil
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'profiles' AND policyname = 'perito_update_own_profile'
  ) THEN
    CREATE POLICY "perito_update_own_profile" ON public.profiles
      FOR UPDATE TO authenticated
      USING  (id = auth.uid())
      WITH CHECK (id = auth.uid());
  END IF;
END $$;

-- Política: el perito puede insertar su propio perfil (por si el trigger falló)
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'profiles' AND policyname = 'perito_insert_own_profile'
  ) THEN
    CREATE POLICY "perito_insert_own_profile" ON public.profiles
      FOR INSERT TO authenticated
      WITH CHECK (id = auth.uid());
  END IF;
END $$;

NOTIFY pgrst, 'reload schema';
