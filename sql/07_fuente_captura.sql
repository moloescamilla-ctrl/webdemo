-- Agrega columna fuente_captura a comparables_capturados
-- 'app'    = capturado desde la herramienta integrada (texto pegado + Claude API)
-- 'chrome' = capturado desde Claude for Chrome vía Edge Function
ALTER TABLE comparables_capturados
  ADD COLUMN IF NOT EXISTS fuente_captura text DEFAULT 'app';
