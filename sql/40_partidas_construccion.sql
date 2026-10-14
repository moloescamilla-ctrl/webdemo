-- ============================================================
-- 40_partidas_construccion.sql
-- Agrega soporte para múltiples tipos de construcción en
-- el Método Físico (cada partida con su propio tabulador).
-- ============================================================

ALTER TABLE public.metodos_fisicos
  ADD COLUMN IF NOT EXISTS partidas_construccion JSONB;

COMMENT ON COLUMN public.metodos_fisicos.partidas_construccion IS
  'Array JSONB [{id,tabuladorId,clave,tipo,descripcion,costoM2,superficie}] para VRN multi-tipo';
