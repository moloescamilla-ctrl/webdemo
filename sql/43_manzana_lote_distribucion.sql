-- Agrega campos de ubicación catastral en expedientes
ALTER TABLE public.expedientes
  ADD COLUMN IF NOT EXISTS manzana text,
  ADD COLUMN IF NOT EXISTS lote    text;

-- Agrega campo de distribución de la vivienda en descripción de construcción
ALTER TABLE public.descripcion_construccion
  ADD COLUMN IF NOT EXISTS distribucion text;
