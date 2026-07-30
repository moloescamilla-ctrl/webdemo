CREATE TABLE IF NOT EXISTS metodos_rentas (
  id                              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  expediente_id                   uuid REFERENCES expedientes(id) ON DELETE CASCADE UNIQUE,

  -- Variantes y modos
  variante                        text NOT NULL CHECK (variante IN ('directa','componentes')),
  modo_rna                        text NOT NULL CHECK (modo_rna IN ('directo','comparables')),
  modo_tc                         text NOT NULL CHECK (modo_tc IN ('directo','componentes')),

  -- RNA
  renta_mensual_bruta             numeric,
  vacancia_pct                    numeric DEFAULT 5,
  gastos_operacion_pct            numeric DEFAULT 15,
  comparables_renta               jsonb,

  -- TC
  tc_global                       numeric,
  tc_tasa_libre_riesgo            numeric,
  tc_prima_riesgo_inmueble        numeric,
  tc_prima_iliquidez              numeric,
  tc_depreciacion                 numeric,
  tc_gastos_no_recuperables       numeric,

  -- Variante componentes tierra/construcción
  proporcion_tierra_pct           numeric,

  -- Resultados persistidos (para PDF y reportes)
  rna                             numeric,
  valor_capitalizacion            numeric,
  valor_tierra_capitalizacion     numeric,
  valor_construccion_capitalizacion numeric,

  -- Trazabilidad
  fecha_tasa_referencia           date,
  fuente_tasa_referencia          text,
  notas_valuador                  text,
  created_at                      timestamptz DEFAULT now()
);

ALTER TABLE metodos_rentas ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'metodos_rentas' AND policyname = 'perito_own_rentas'
  ) THEN
    CREATE POLICY "perito_own_rentas"
      ON metodos_rentas FOR ALL TO authenticated
      USING (expediente_id IN (SELECT id FROM expedientes WHERE perito_id = auth.uid()))
      WITH CHECK (expediente_id IN (SELECT id FROM expedientes WHERE perito_id = auth.uid()));
  END IF;
END $$;

NOTIFY pgrst, 'reload schema';
