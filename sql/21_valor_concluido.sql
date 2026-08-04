-- Agrega campo metodo_elegido al expediente
-- El perito elige con qué método se queda; el valor concluido se deriva de esa elección.
ALTER TABLE public.expedientes
  ADD COLUMN IF NOT EXISTS metodo_elegido TEXT;

-- Restricción de valores válidos
ALTER TABLE public.expedientes
  ADD CONSTRAINT chk_metodo_elegido
    CHECK (metodo_elegido IS NULL OR metodo_elegido IN ('fisico', 'comparativo', 'rentas', 'residual'));
