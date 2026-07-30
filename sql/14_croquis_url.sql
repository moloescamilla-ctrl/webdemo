-- Columna para almacenar la URL del croquis de localización subido por el perito
ALTER TABLE expedientes ADD COLUMN IF NOT EXISTS croquis_url text;

NOTIFY pgrst, 'reload schema';

-- NOTA: Crear bucket 'fotos-avaluos' en Supabase → Storage → New bucket
--       Configurarlo como PÚBLICO para que las imágenes sean accesibles en el PDF.
--       Si ya existe como privado, cambiar a public o crear bucket 'croquis-avaluos' público.
