-- ============================================================
-- 19_profiles.sql
-- Tabla pública de perfiles para que PostgREST pueda
-- resolver joins sin cruzar al esquema auth.
-- ============================================================

-- 1. Tabla profiles en public
CREATE TABLE IF NOT EXISTS public.profiles (
  id      UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email   TEXT,
  nombre  TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "todos_ven_perfiles" ON public.profiles;
CREATE POLICY "todos_ven_perfiles" ON public.profiles
  FOR SELECT TO authenticated USING (true);

-- 2. Poblar con usuarios existentes
INSERT INTO public.profiles (id, email, nombre)
SELECT
  id,
  email,
  raw_user_meta_data->>'nombre_perito'
FROM auth.users
ON CONFLICT (id) DO UPDATE
  SET email  = EXCLUDED.email,
      nombre = EXCLUDED.nombre;

-- 3. Trigger: crea perfil automáticamente en cada nuevo registro
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
        nombre = EXCLUDED.nombre;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT OR UPDATE ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 4. Migrar FK de revisiones_expediente a public.profiles
ALTER TABLE public.revisiones_expediente
  DROP CONSTRAINT IF EXISTS revisiones_expediente_revisor_id_fkey,
  DROP CONSTRAINT IF EXISTS revisiones_expediente_autor_id_fkey;

ALTER TABLE public.revisiones_expediente
  ADD CONSTRAINT revisiones_expediente_revisor_id_fkey
    FOREIGN KEY (revisor_id) REFERENCES public.profiles(id),
  ADD CONSTRAINT revisiones_expediente_autor_id_fkey
    FOREIGN KEY (autor_id) REFERENCES public.profiles(id);

-- 5. Migrar FK de comentarios_revision a public.profiles
ALTER TABLE public.comentarios_revision
  DROP CONSTRAINT IF EXISTS comentarios_revision_revisor_id_fkey;

ALTER TABLE public.comentarios_revision
  ADD CONSTRAINT comentarios_revision_revisor_id_fkey
    FOREIGN KEY (revisor_id) REFERENCES public.profiles(id);

-- 6. Actualizar buscar_usuarios_revision para leer de profiles (más rápido)
CREATE OR REPLACE FUNCTION public.buscar_usuarios_revision(p_query TEXT)
RETURNS TABLE(id UUID, nombre TEXT, email TEXT)
LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  IF length(trim(p_query)) < 2 THEN
    RETURN;
  END IF;
  RETURN QUERY
  SELECT p.id, p.nombre, p.email
  FROM public.profiles p
  JOIN auth.users u ON u.id = p.id
  WHERE u.email_confirmed_at IS NOT NULL
    AND (
      p.email  ILIKE '%' || p_query || '%' OR
      p.nombre ILIKE '%' || p_query || '%'
    )
  LIMIT 20;
END;
$$;
