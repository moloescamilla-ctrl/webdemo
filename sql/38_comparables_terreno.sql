-- ============================================================
-- 38_comparables_terreno.sql
-- Agrega columna JSONB para almacenar la tabla de comparables
-- de terreno (homologación) dentro del método físico.
-- ============================================================

ALTER TABLE public.metodos_fisicos
  ADD COLUMN IF NOT EXISTS comparables_terreno JSONB,
  ADD COLUMN IF NOT EXISTS valor_unitario_terreno_homologado NUMERIC(14,2);
