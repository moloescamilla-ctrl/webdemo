-- ============================================================
-- 20_folio_secuencia.sql
-- Secuencia global de folios por día, compartida entre todos
-- los usuarios para evitar duplicados.
-- ============================================================

-- Tabla de contadores diarios
CREATE TABLE IF NOT EXISTS public.folio_contador (
  fecha     DATE    PRIMARY KEY,
  contador  INTEGER NOT NULL DEFAULT 0
);

-- RLS habilitado sin políticas: solo la función SECURITY DEFINER puede escribir
ALTER TABLE public.folio_contador ENABLE ROW LEVEL SECURITY;

-- Función que incrementa el contador del día y devuelve el folio
CREATE OR REPLACE FUNCTION public.generar_folio()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER AS $$
DECLARE
  v_fecha    DATE    := CURRENT_DATE;
  v_contador INTEGER;
  v_prefijo  TEXT;
BEGIN
  INSERT INTO public.folio_contador (fecha, contador)
  VALUES (v_fecha, 1)
  ON CONFLICT (fecha) DO UPDATE
    SET contador = folio_contador.contador + 1
  RETURNING contador INTO v_contador;

  v_prefijo := TO_CHAR(v_fecha, 'DDMMYY');
  RETURN v_prefijo || '-' || LPAD(v_contador::TEXT, 2, '0');
END;
$$;

GRANT EXECUTE ON FUNCTION public.generar_folio() TO authenticated;
