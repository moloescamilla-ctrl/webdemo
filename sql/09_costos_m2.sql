-- Tabulador de costos por m² de construcción (multi-fuente: COVINSA, SHF, INDAABIN, etc.)
CREATE TABLE IF NOT EXISTS costos_construccion_m2 (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  fuente              text NOT NULL,
  clave               text NOT NULL,
  tipo                text NOT NULL,
  descripcion         text NOT NULL,
  precio_m2           numeric NOT NULL CHECK (precio_m2 > 0),
  tipo_inmueble       text,
  num_niveles_min     integer,
  num_niveles_max     integer,
  fecha_vigencia      date NOT NULL,
  fecha_vigencia_fin  date,
  activo              boolean NOT NULL DEFAULT true,
  notas               text,
  created_at          timestamptz DEFAULT now(),
  UNIQUE (fuente, clave, fecha_vigencia)
);

CREATE INDEX IF NOT EXISTS idx_costos_fuente_activo
  ON costos_construccion_m2 (fuente, activo);

CREATE INDEX IF NOT EXISTS idx_costos_tipo_inmueble
  ON costos_construccion_m2 (tipo_inmueble, activo);

ALTER TABLE costos_construccion_m2 ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'costos_construccion_m2' AND policyname = 'lectura_costos_autenticados'
  ) THEN
    CREATE POLICY "lectura_costos_autenticados"
      ON costos_construccion_m2 FOR SELECT TO authenticated USING (true);
  END IF;
END $$;

-- Columnas de trazabilidad en metodos_fisicos
ALTER TABLE metodos_fisicos
  ADD COLUMN IF NOT EXISTS costo_m2_fuente    text,
  ADD COLUMN IF NOT EXISTS costo_m2_clave     text,
  ADD COLUMN IF NOT EXISTS costo_m2_tipo      text,
  ADD COLUMN IF NOT EXISTS costo_m2_tabulador numeric,
  ADD COLUMN IF NOT EXISTS costo_m2_ajustado  boolean DEFAULT false;

-- Tabulador COVINSA agosto 2025
INSERT INTO costos_construccion_m2
  (fuente, clave, tipo, descripcion, precio_m2, tipo_inmueble, num_niveles_min, num_niveles_max, fecha_vigencia, notas)
VALUES
  ('COVINSA','ECO-L-PP','Económica',
   'Casa Habitación 1 Nivel: Sala, comedor, cocina, 1 baño y 2 recámaras. Techo lámina y piso pulido.',
   8000,'Casa habitación',1,1,'2025-08-01',
   'Tabulador COVINSA agosto 2025 — C.P. Ing. Arq. Ignacio López Fernández'),

  ('COVINSA','ECO-L-PL','Económica',
   'Casa Habitación 1 Nivel: Sala, comedor, cocina, 1 baño y 2 recámaras. Techo lámina y piso loseta.',
   8500,'Casa habitación',1,1,'2025-08-01',
   'Tabulador COVINSA agosto 2025 — C.P. Ing. Arq. Ignacio López Fernández'),

  ('COVINSA','EIS-LC-PP','Económica Interés Social',
   'Casa Habitación 1-2 Niveles: Sala, comedor, cocina, 1 baño y 2 recámaras. Techo losa de concreto y piso pulido.',
   11000,'Casa habitación',1,2,'2025-08-01',
   'Tabulador COVINSA agosto 2025 — C.P. Ing. Arq. Ignacio López Fernández'),

  ('COVINSA','EIS-LC-PL','Económica Interés Social',
   'Casa Habitación 1-2 Niveles: Sala, comedor, cocina, 1 baño y 2 recámaras. Techo losa de concreto y piso loseta.',
   12000,'Casa habitación',1,2,'2025-08-01',
   'Tabulador COVINSA agosto 2025 — C.P. Ing. Arq. Ignacio López Fernández'),

  ('COVINSA','EIS-LC2B-PP','Económica Interés Social',
   'Casa Habitación 1-2 Niveles: Sala, comedor, cocina, 2 baños y 3 recámaras. Techo losa de concreto y piso pulido.',
   12500,'Casa habitación',1,2,'2025-08-01',
   'Tabulador COVINSA agosto 2025 — C.P. Ing. Arq. Ignacio López Fernández'),

  ('COVINSA','EIS-LC2B-PL','Económica Interés Social',
   'Casa Habitación 1-2 Niveles: Sala, comedor, cocina, 2 baños y 3 recámaras. Techo losa de concreto y piso loseta.',
   13500,'Casa habitación',1,2,'2025-08-01',
   'Tabulador COVINSA agosto 2025 — C.P. Ing. Arq. Ignacio López Fernández'),

  ('COVINSA','ISM-3R','Interés Social Media',
   'Casa Habitación 2 Niveles: Sala, comedor, cocina, 2 1/2 baños, 3 recámaras y cuarto de lavado.',
   14300,'Casa habitación',2,2,'2025-08-01',
   'Tabulador COVINSA agosto 2025 — C.P. Ing. Arq. Ignacio López Fernández'),

  ('COVINSA','ISM-4R','Interés Social Media',
   'Casa Habitación 2 Niveles: Sala, comedor, cocina, 2 1/2 baños, 4 recámaras y cuarto de lavado.',
   15700,'Casa habitación',2,2,'2025-08-01',
   'Tabulador COVINSA agosto 2025 — C.P. Ing. Arq. Ignacio López Fernández'),

  ('COVINSA','DIS-2R','Departamento Interés Social',
   'Departamento en condominio: Sala, comedor, cocina, 1 baño, 2 recámaras y área de lavado.',
   10500,'Departamento',null,null,'2025-08-01',
   'Tabulador COVINSA agosto 2025 — C.P. Ing. Arq. Ignacio López Fernández'),

  ('COVINSA','DIS-3R','Departamento Interés Social',
   'Departamento en condominio: Sala, comedor, cocina, 1 baño, 3 recámaras y área de lavado.',
   11500,'Departamento',null,null,'2025-08-01',
   'Tabulador COVINSA agosto 2025 — C.P. Ing. Arq. Ignacio López Fernández'),

  ('COVINSA','DIM-3R','Departamento Interés Medio',
   'Departamento en condominio: Sala, comedor, cocina, 2 baños, 3 recámaras y cuarto de lavado.',
   12200,'Departamento',null,null,'2025-08-01',
   'Tabulador COVINSA agosto 2025 — C.P. Ing. Arq. Ignacio López Fernández')

ON CONFLICT (fuente, clave, fecha_vigencia) DO NOTHING;

NOTIFY pgrst, 'reload schema';
