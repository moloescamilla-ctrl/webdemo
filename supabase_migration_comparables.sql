-- Migration: tabla comparables
-- Ejecutar en Supabase > SQL Editor

CREATE TABLE IF NOT EXISTS comparables (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  expediente_id         UUID NOT NULL REFERENCES expedientes(id) ON DELETE CASCADE,
  url                   TEXT NOT NULL,
  portal                TEXT,
  fecha_captura         TIMESTAMPTZ DEFAULT NOW(),

  -- Datos del inmueble (extraídos por Claude API)
  tipo_operacion        TEXT CHECK (tipo_operacion IN ('venta', 'renta')),
  tipo_inmueble         TEXT CHECK (tipo_inmueble IN ('casa', 'departamento', 'terreno', 'local', 'bodega', 'oficina', 'otro')),
  precio_total          NUMERIC,
  moneda                TEXT DEFAULT 'MXN',
  superficie_total      NUMERIC,
  superficie_construccion NUMERIC,
  superficie_terreno    NUMERIC,
  recamaras             INTEGER,
  banos                 NUMERIC,
  cajones               INTEGER,
  edad_anios            INTEGER,
  conservacion          TEXT CHECK (conservacion IN ('excelente', 'bueno', 'regular', 'malo')),

  -- Ubicación
  calle                 TEXT,
  colonia               TEXT,
  municipio             TEXT,
  estado                TEXT,
  cp                    TEXT,

  -- Contacto
  nombre_anunciante     TEXT,
  telefono              TEXT,
  descripcion           TEXT,

  -- Metadatos de extracción
  scores                JSONB DEFAULT '{}',
  campos_manuales       JSONB DEFAULT '{}',

  created_at            TIMESTAMPTZ DEFAULT NOW()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_comparables_expediente_id ON comparables (expediente_id);

-- Row Level Security
ALTER TABLE comparables ENABLE ROW LEVEL SECURITY;

-- Los usuarios solo ven comparables de sus propios expedientes
CREATE POLICY "comparables_select" ON comparables
  FOR SELECT USING (
    expediente_id IN (
      SELECT id FROM expedientes WHERE perito_id = auth.uid()
    )
  );

CREATE POLICY "comparables_insert" ON comparables
  FOR INSERT WITH CHECK (
    expediente_id IN (
      SELECT id FROM expedientes WHERE perito_id = auth.uid()
    )
  );

CREATE POLICY "comparables_delete" ON comparables
  FOR DELETE USING (
    expediente_id IN (
      SELECT id FROM expedientes WHERE perito_id = auth.uid()
    )
  );
