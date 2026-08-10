-- ============================================================
-- 25_fix_rls_expedientes_estado.sql
-- Limpia TODAS las políticas existentes en expedientes y
-- las recrea correctamente para garantizar que UPDATE funcione.
-- Seguro de ejecutar múltiples veces.
-- ============================================================

-- 1. Habilitar RLS (idempotente)
ALTER TABLE public.expedientes ENABLE ROW LEVEL SECURITY;

-- 2. Eliminar TODAS las políticas existentes en la tabla
--    (cubre cualquier nombre creado desde dashboard o migraciones anteriores)
DO $$
DECLARE
  pol TEXT;
BEGIN
  FOR pol IN
    SELECT policyname
    FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'expedientes'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.expedientes', pol);
    RAISE NOTICE 'Política eliminada: %', pol;
  END LOOP;
END $$;

-- 3. Crear política única para ALL (SELECT, INSERT, UPDATE, DELETE)
--    El perito solo accede a sus propios expedientes
CREATE POLICY "perito_own_expedientes"
  ON public.expedientes
  FOR ALL
  TO authenticated
  USING  (perito_id = auth.uid())
  WITH CHECK (perito_id = auth.uid());

-- 4. Verificar resultado
SELECT policyname, cmd, qual, with_check
FROM pg_policies
WHERE schemaname = 'public' AND tablename = 'expedientes';

-- 5. Forzar recarga del schema en PostgREST
NOTIFY pgrst, 'reload schema';
