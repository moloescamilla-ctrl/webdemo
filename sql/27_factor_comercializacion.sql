-- ============================================================
-- 27_factor_comercializacion.sql
-- Addendum B: Factor de Comercialización por Microzona
-- Agrega columnas a metodos_fisicos y crea tabla de auditoría.
-- Idempotente: usa IF NOT EXISTS / IF EXISTS.
-- ============================================================

-- 1. Columnas en metodos_fisicos
ALTER TABLE public.metodos_fisicos
  ADD COLUMN IF NOT EXISTS factor_comercializacion              NUMERIC(6,4),
  ADD COLUMN IF NOT EXISTS factor_comercializacion_segmento     TEXT,
  ADD COLUMN IF NOT EXISTS factor_comercializacion_justificacion TEXT,
  ADD COLUMN IF NOT EXISTS valor_mercado_estimado               NUMERIC(18,2);

-- 2. Tabla de auditoría (insert-only para el perito)
CREATE TABLE IF NOT EXISTS public.suelo_factor_aplicado (
  id             UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  expediente_id  UUID        NOT NULL REFERENCES public.expedientes(id) ON DELETE CASCADE,
  perito_id      UUID        NOT NULL REFERENCES auth.users(id),
  segmento       TEXT,
  factor         NUMERIC(6,4) NOT NULL,
  valor_fisico   NUMERIC(18,2) NOT NULL,
  valor_mercado  NUMERIC(18,2) NOT NULL,
  justificacion  TEXT,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.suelo_factor_aplicado ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "perito_read_factor_aplicado"   ON public.suelo_factor_aplicado;
DROP POLICY IF EXISTS "perito_insert_factor_aplicado" ON public.suelo_factor_aplicado;

CREATE POLICY "perito_read_factor_aplicado"
  ON public.suelo_factor_aplicado
  FOR SELECT TO authenticated
  USING (perito_id = auth.uid());

CREATE POLICY "perito_insert_factor_aplicado"
  ON public.suelo_factor_aplicado
  FOR INSERT TO authenticated
  WITH CHECK (perito_id = auth.uid());

-- 3. Tabla estadística (base para futuro módulo suelo)
CREATE TABLE IF NOT EXISTS public.suelo_factores_comercializacion (
  id                  UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  microzona           TEXT        NOT NULL,
  segmento            TEXT        NOT NULL,
  factor_mediana      NUMERIC(6,4) NOT NULL,
  factor_promedio     NUMERIC(6,4),
  desviacion_std      NUMERIC(6,4),
  n_observaciones     INTEGER     NOT NULL DEFAULT 0,
  nivel_confianza     TEXT        CHECK (nivel_confianza IN ('alta', 'media', 'baja', 'insuficiente')),
  p25                 NUMERIC(6,4),
  p75                 NUMERIC(6,4),
  vigente_desde       DATE,
  vigente_hasta       DATE,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.suelo_factores_comercializacion ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "authenticated_read_factores" ON public.suelo_factores_comercializacion;

CREATE POLICY "authenticated_read_factores"
  ON public.suelo_factores_comercializacion
  FOR SELECT TO authenticated
  USING (true);

NOTIFY pgrst, 'reload schema';
