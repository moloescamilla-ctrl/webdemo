-- ============================================================
-- 22_rls_audit_y_tipo_expediente.sql
-- Auditoría de seguridad: verificar y completar políticas RLS
-- en tablas sin migración explícita + columna tipo_expediente.
-- Seguro de ejecutar múltiples veces (IF NOT EXISTS en todo).
-- ============================================================

-- ── 1. tipo_expediente ────────────────────────────────────
ALTER TABLE public.expedientes
  ADD COLUMN IF NOT EXISTS tipo_expediente TEXT DEFAULT 'avaluo'
  CHECK (tipo_expediente IN ('avaluo', 'calculo_rapido'));

-- ── 2. expedientes ────────────────────────────────────────
-- Garantizar RLS activo
ALTER TABLE public.expedientes ENABLE ROW LEVEL SECURITY;

-- El perito solo ve y edita sus propios expedientes
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'expedientes' AND policyname = 'perito_own_expedientes'
  ) THEN
    CREATE POLICY "perito_own_expedientes" ON public.expedientes
      FOR ALL TO authenticated
      USING  (perito_id = auth.uid())
      WITH CHECK (perito_id = auth.uid());
  END IF;
END $$;

-- ── 3. entorno_inmueble ───────────────────────────────────
ALTER TABLE public.entorno_inmueble ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'entorno_inmueble' AND policyname = 'perito_own_entorno'
  ) THEN
    CREATE POLICY "perito_own_entorno" ON public.entorno_inmueble
      FOR ALL TO authenticated
      USING  (expediente_id IN (SELECT id FROM expedientes WHERE perito_id = auth.uid()))
      WITH CHECK (expediente_id IN (SELECT id FROM expedientes WHERE perito_id = auth.uid()));
  END IF;
END $$;

-- ── 4. caracteristicas_terreno ────────────────────────────
ALTER TABLE public.caracteristicas_terreno ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'caracteristicas_terreno' AND policyname = 'perito_own_terreno'
  ) THEN
    CREATE POLICY "perito_own_terreno" ON public.caracteristicas_terreno
      FOR ALL TO authenticated
      USING  (expediente_id IN (SELECT id FROM expedientes WHERE perito_id = auth.uid()))
      WITH CHECK (expediente_id IN (SELECT id FROM expedientes WHERE perito_id = auth.uid()));
  END IF;
END $$;

-- ── 5. inspecciones_fisicas ───────────────────────────────
ALTER TABLE public.inspecciones_fisicas ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'inspecciones_fisicas' AND policyname = 'perito_own_inspecciones'
  ) THEN
    CREATE POLICY "perito_own_inspecciones" ON public.inspecciones_fisicas
      FOR ALL TO authenticated
      USING  (expediente_id IN (SELECT id FROM expedientes WHERE perito_id = auth.uid()))
      WITH CHECK (expediente_id IN (SELECT id FROM expedientes WHERE perito_id = auth.uid()));
  END IF;
END $$;

-- ── 6. metodos_fisicos ────────────────────────────────────
ALTER TABLE public.metodos_fisicos ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'metodos_fisicos' AND policyname = 'perito_own_metodo_fisico'
  ) THEN
    CREATE POLICY "perito_own_metodo_fisico" ON public.metodos_fisicos
      FOR ALL TO authenticated
      USING  (expediente_id IN (SELECT id FROM expedientes WHERE perito_id = auth.uid()))
      WITH CHECK (expediente_id IN (SELECT id FROM expedientes WHERE perito_id = auth.uid()));
  END IF;
END $$;

-- ── 7. metodos_comparativos ───────────────────────────────
ALTER TABLE public.metodos_comparativos ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'metodos_comparativos' AND policyname = 'perito_own_metodo_comparativo'
  ) THEN
    CREATE POLICY "perito_own_metodo_comparativo" ON public.metodos_comparativos
      FOR ALL TO authenticated
      USING  (expediente_id IN (SELECT id FROM expedientes WHERE perito_id = auth.uid()))
      WITH CHECK (expediente_id IN (SELECT id FROM expedientes WHERE perito_id = auth.uid()));
  END IF;
END $$;

-- ── 8. Verificación final ─────────────────────────────────
-- Ejecuta esto para confirmar que todas las tablas tienen RLS activo:
SELECT
  schemaname,
  tablename,
  rowsecurity AS rls_activo
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN (
    'expedientes', 'entorno_inmueble', 'caracteristicas_terreno',
    'inspecciones_fisicas', 'metodos_fisicos', 'metodos_comparativos',
    'metodos_rentas', 'metodos_residual', 'fotos_expediente',
    'compartidos', 'comentarios_revision', 'revisiones_expediente',
    'comparables_capturados', 'descripcion_construccion',
    'costos_construccion_m2', 'profiles', 'folio_contador'
  )
ORDER BY tablename;

NOTIFY pgrst, 'reload schema';
