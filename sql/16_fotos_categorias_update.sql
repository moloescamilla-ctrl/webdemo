-- Actualiza el constraint de categorías de fotos_expediente
-- con las nuevas categorías predeterminadas

ALTER TABLE fotos_expediente
  DROP CONSTRAINT IF EXISTS fotos_expediente_categoria_check;

ALTER TABLE fotos_expediente
  ADD CONSTRAINT fotos_expediente_categoria_check
  CHECK (categoria IN (
    'fachada',
    'entorno',
    'acceso',
    'sala',
    'comedor',
    'cocina',
    'bano',
    'recamara1',
    'recamara2',
    'extra'
  ));
