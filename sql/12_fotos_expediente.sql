CREATE TABLE IF NOT EXISTS fotos_expediente (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  expediente_id  uuid REFERENCES expedientes(id) ON DELETE CASCADE,
  categoria      text NOT NULL CHECK (categoria IN ('fachada','entorno','interior','construccion','adicionales')),
  url_storage    text NOT NULL,
  nombre_archivo text,
  descripcion    text,
  orden          integer DEFAULT 0,
  created_at     timestamptz DEFAULT now()
);

ALTER TABLE fotos_expediente ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'fotos_expediente' AND policyname = 'perito_own_fotos'
  ) THEN
    CREATE POLICY "perito_own_fotos"
      ON fotos_expediente FOR ALL TO authenticated
      USING (expediente_id IN (SELECT id FROM expedientes WHERE perito_id = auth.uid()))
      WITH CHECK (expediente_id IN (SELECT id FROM expedientes WHERE perito_id = auth.uid()));
  END IF;
END $$;

NOTIFY pgrst, 'reload schema';
