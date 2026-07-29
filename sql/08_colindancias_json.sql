-- Colindancias as a flexible JSONB array: [{rumbo, metros, descripcion}]
-- Replaces the four fixed text columns with a dynamic list
ALTER TABLE caracteristicas_terreno
  ADD COLUMN IF NOT EXISTS colindancias_json JSONB;

NOTIFY pgrst, 'reload schema';
