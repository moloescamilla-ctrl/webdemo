-- ============================================================
-- 41_partidas_edad_ponderada.sql
-- Persiste las partidas de la tabla de edad ponderada del
-- Método Físico para que sobrevivan al recargar el formulario.
-- ============================================================

ALTER TABLE public.metodos_fisicos
  ADD COLUMN IF NOT EXISTS partidas_edad_ponderada JSONB;

COMMENT ON COLUMN public.metodos_fisicos.partidas_edad_ponderada IS
  'Estado de EdadPonderadaInput: {modo:"directo"|"ponderado", partidas:[{tipo,anio,superficie}]}';
