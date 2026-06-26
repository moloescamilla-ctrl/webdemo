-- Tabla buffer de comparables capturados con IA o manualmente
CREATE TABLE IF NOT EXISTS comparables_capturados (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  expediente_id uuid REFERENCES expedientes(id) ON DELETE CASCADE,
  perito_id uuid REFERENCES auth.users(id),
  url_fuente text,
  portal text,
  fecha_captura date DEFAULT CURRENT_DATE,
  titulo_anuncio text,
  precio_total numeric,
  superficie_total_m2 numeric,
  precio_unitario numeric GENERATED ALWAYS AS (
    CASE WHEN superficie_total_m2 > 0
      THEN round(precio_total / superficie_total_m2, 2)
      ELSE NULL
    END
  ) STORED,
  recamaras integer,
  banos numeric,
  estacionamientos integer,
  niveles integer,
  antiguedad_anios integer,
  colonia text,
  municipio text,
  descripcion_raw text,
  estado_revision text NOT NULL DEFAULT 'pendiente'
    CHECK (estado_revision IN ('pendiente', 'aprobado', 'descartado')),
  notas_valuador text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE comparables_capturados ENABLE ROW LEVEL SECURITY;

CREATE POLICY "perito_own_comparables" ON comparables_capturados
  FOR ALL TO authenticated
  USING (perito_id = auth.uid())
  WITH CHECK (perito_id = auth.uid());

CREATE INDEX IF NOT EXISTS idx_comparables_expediente
  ON comparables_capturados(expediente_id);

CREATE INDEX IF NOT EXISTS idx_comparables_estado
  ON comparables_capturados(estado_revision);
