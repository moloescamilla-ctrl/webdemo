-- ============================================================
-- 33_fix_handle_new_user_trigger.sql
-- El trigger on_auth_user_created disparaba en INSERT OR UPDATE
-- de auth.users, sobreescribiendo nombre con NULL en cada
-- refresco de sesión. Se corrige para:
--   • Disparar solo en INSERT (nuevos registros)
--   • En conflicto, preservar nombre ya guardado (COALESCE)
-- ============================================================

-- 1. Corregir la función: preservar nombre existente en conflicto
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, nombre)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'nombre_perito'
  )
  ON CONFLICT (id) DO UPDATE
    SET email  = EXCLUDED.email,
        nombre = COALESCE(profiles.nombre, EXCLUDED.nombre);
  RETURN NEW;
END;
$$;

-- 2. Cambiar trigger a INSERT solamente (no UPDATE)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
