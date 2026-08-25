-- ============================================================
-- 34_plan_prueba_auto_registro.sql
-- Agrega plan 'prueba' con límite de 3 expedientes para
-- nuevos usuarios que se registran desde la landing page.
-- ============================================================

-- 1. Ampliar el CHECK de plan para incluir 'prueba'
ALTER TABLE public.profiles
  DROP CONSTRAINT IF EXISTS profiles_plan_check;

ALTER TABLE public.profiles
  ADD CONSTRAINT profiles_plan_check
    CHECK (plan IN ('prueba', 'basico', 'profesional', 'empresa'));

-- 2. Actualizar trigger handle_new_user para asignar plan prueba
--    con límite de 3 expedientes a nuevos registros
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, nombre, plan, limite_expedientes_mes)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'nombre_perito',
    'prueba',
    3
  )
  ON CONFLICT (id) DO UPDATE
    SET email  = EXCLUDED.email,
        nombre = COALESCE(profiles.nombre, EXCLUDED.nombre);
  RETURN NEW;
END;
$$;
