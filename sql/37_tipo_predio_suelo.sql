-- ============================================================
-- 37_tipo_predio_suelo.sql
-- Agrega clasificación de predio (URBANO / SUBURBANO / RURAL)
-- y tipo de suelo agrícola (para predios rurales/suburbanos)
-- a la tabla expedientes.
-- ============================================================

ALTER TABLE public.expedientes
  ADD COLUMN IF NOT EXISTS tipo_predio TEXT
    CHECK (tipo_predio IN ('URBANO', 'SUBURBANO', 'RURAL')),
  ADD COLUMN IF NOT EXISTS tipo_suelo TEXT
    CHECK (tipo_suelo IN ('TEMPORAL', 'RIEGO', 'HUMEDAD', 'ÁRIDO', 'PANTANOSO'));

-- Valor por omisión retroactivo para expedientes existentes
UPDATE public.expedientes
  SET tipo_predio = 'URBANO'
  WHERE tipo_predio IS NULL;
