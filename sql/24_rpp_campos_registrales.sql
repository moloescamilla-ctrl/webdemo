-- ============================================================
-- 24_rpp_campos_registrales.sql
-- Amplía los datos del Registro Público de la Propiedad
-- en caracteristicas_terreno con todos los campos SIVI.
-- Seguro de ejecutar múltiples veces (IF NOT EXISTS).
-- ============================================================

ALTER TABLE public.caracteristicas_terreno
  ADD COLUMN IF NOT EXISTS rpp_fecha          DATE,
  ADD COLUMN IF NOT EXISTS rpp_oficina        TEXT,
  ADD COLUMN IF NOT EXISTS rpp_registro_orden TEXT,
  ADD COLUMN IF NOT EXISTS rpp_fojas_folios   TEXT,
  ADD COLUMN IF NOT EXISTS rpp_libro          TEXT,
  ADD COLUMN IF NOT EXISTS rpp_tomo           TEXT,
  ADD COLUMN IF NOT EXISTS rpp_volumen        TEXT,
  ADD COLUMN IF NOT EXISTS rpp_seccion        TEXT,
  ADD COLUMN IF NOT EXISTS rpp_serie          TEXT;

NOTIFY pgrst, 'reload schema';
