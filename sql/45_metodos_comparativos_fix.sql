-- Asegura que metodos_comparativos tenga constraint UNIQUE en expediente_id
-- (necesario para que upsert con onConflict funcione correctamente)
-- y que use perito_id en lugar de user_id para consistencia con RLS.

ALTER TABLE public.metodos_comparativos
  ADD COLUMN IF NOT EXISTS perito_id uuid REFERENCES auth.users(id);

-- Si la constraint ya existe con otro nombre, esto es idempotente
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conrelid = 'public.metodos_comparativos'::regclass
      AND contype = 'u'
      AND conname = 'metodos_comparativos_expediente_id_key'
  ) THEN
    ALTER TABLE public.metodos_comparativos
      ADD CONSTRAINT metodos_comparativos_expediente_id_key UNIQUE (expediente_id);
  END IF;
END $$;
