-- Agrega campo para croquis/plano de la propiedad (distinto al croquis de localización)
ALTER TABLE public.expedientes
  ADD COLUMN IF NOT EXISTS plano_url text;
