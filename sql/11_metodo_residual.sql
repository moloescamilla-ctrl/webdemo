CREATE TABLE IF NOT EXISTS metodos_residual (
  id                            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  expediente_id                 uuid REFERENCES expedientes(id) ON DELETE CASCADE UNIQUE,

  caso_uso                      text NOT NULL CHECK (caso_uso IN ('terreno','remodelacion')),
  descripcion_proyecto          text,

  -- Valor de mercado del producto terminado
  vm_total                      numeric,
  vm_fuente                     text,

  -- Superficie
  superficie_proyecto_m2        numeric,
  superficie_terreno_m2         numeric,

  -- Costo de construcción / remodelación
  costo_construccion_m2         numeric,
  costo_construccion_total      numeric,

  -- Componentes porcentuales de Ci (% sobre VM)
  proyecto_pct                  numeric DEFAULT 2,
  permisos_pct                  numeric DEFAULT 1,
  gestion_pct                   numeric DEFAULT 2,
  comercializacion_pct          numeric DEFAULT 3,
  financiamiento_pct            numeric DEFAULT 2,
  imprevistos_pct               numeric DEFAULT 4,

  -- Ci total calculado y persistido
  ci_total                      numeric,

  -- Utilidad del promotor
  utilidad_pct                  numeric DEFAULT 15,
  utilidad_pesos                numeric,

  -- Resultado
  valor_residual                numeric,
  valor_residual_m2_terreno     numeric,

  notas_valuador                text,
  created_at                    timestamptz DEFAULT now()
);

ALTER TABLE metodos_residual ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'metodos_residual' AND policyname = 'perito_own_residual'
  ) THEN
    CREATE POLICY "perito_own_residual"
      ON metodos_residual FOR ALL TO authenticated
      USING (expediente_id IN (SELECT id FROM expedientes WHERE perito_id = auth.uid()))
      WITH CHECK (expediente_id IN (SELECT id FROM expedientes WHERE perito_id = auth.uid()));
  END IF;
END $$;

NOTIFY pgrst, 'reload schema';
