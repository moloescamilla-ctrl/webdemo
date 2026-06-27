-- Agrega columna fuente_captura a comparables_capturados
-- 'chrome' = capturado desde Claude for Chrome vía Edge Function
ALTER TABLE comparables_capturados
  ADD COLUMN IF NOT EXISTS fuente_captura text DEFAULT 'chrome';

NOTIFY pgrst, 'reload schema';
