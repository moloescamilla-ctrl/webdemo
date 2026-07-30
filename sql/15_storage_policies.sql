-- Políticas de Storage para el bucket 'fotos-avaluos'
-- Ejecutar en Supabase SQL Editor después de crear el bucket

-- Lectura pública (para que las URLs funcionen en el PDF sin autenticación)
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'storage' AND tablename = 'objects'
    AND policyname = 'fotos_avaluos_select_public'
  ) THEN
    CREATE POLICY "fotos_avaluos_select_public"
      ON storage.objects FOR SELECT TO public
      USING (bucket_id = 'fotos-avaluos');
  END IF;
END $$;

-- Upload (INSERT) para usuarios autenticados
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'storage' AND tablename = 'objects'
    AND policyname = 'fotos_avaluos_insert_auth'
  ) THEN
    CREATE POLICY "fotos_avaluos_insert_auth"
      ON storage.objects FOR INSERT TO authenticated
      WITH CHECK (bucket_id = 'fotos-avaluos');
  END IF;
END $$;

-- Reemplazar archivo existente (UPDATE / upsert)
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'storage' AND tablename = 'objects'
    AND policyname = 'fotos_avaluos_update_auth'
  ) THEN
    CREATE POLICY "fotos_avaluos_update_auth"
      ON storage.objects FOR UPDATE TO authenticated
      USING (bucket_id = 'fotos-avaluos');
  END IF;
END $$;

-- Eliminar archivo
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'storage' AND tablename = 'objects'
    AND policyname = 'fotos_avaluos_delete_auth'
  ) THEN
    CREATE POLICY "fotos_avaluos_delete_auth"
      ON storage.objects FOR DELETE TO authenticated
      USING (bucket_id = 'fotos-avaluos');
  END IF;
END $$;
