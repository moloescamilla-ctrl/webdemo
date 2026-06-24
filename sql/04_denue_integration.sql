-- ============================================================
-- FASE DENUE: Integración INEGI para distancias de entorno
-- Correr en Supabase SQL Editor (como superuser / service role)
-- ============================================================

-- 1. PostGIS (requerido para geometrías espaciales)
CREATE EXTENSION IF NOT EXISTS postgis;

-- 2. Tabla de establecimientos DENUE
CREATE TABLE IF NOT EXISTS denue_establecimientos (
  id         bigserial PRIMARY KEY,
  clee       text,
  nom_estab  text,
  codigo_act text,
  nombre_act text,
  municipio  text,
  entidad    text,
  latitud    numeric,
  longitud   numeric,
  geom       geography(Point, 4326)
);

CREATE INDEX IF NOT EXISTS idx_denue_geom  ON denue_establecimientos USING GIST (geom);
CREATE INDEX IF NOT EXISTS idx_denue_scian ON denue_establecimientos (codigo_act);

-- RLS: sólo lectura para usuarios autenticados
ALTER TABLE denue_establecimientos ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'denue_establecimientos' AND policyname = 'lectura_publica_denue'
  ) THEN
    CREATE POLICY "lectura_publica_denue"
      ON denue_establecimientos FOR SELECT TO authenticated USING (true);
  END IF;
END $$;

-- 3. Nuevas columnas en entorno_inmueble (reemplaza los 5 campos manuales anteriores)
ALTER TABLE entorno_inmueble
  ADD COLUMN IF NOT EXISTS dist_escuelas_m    integer,
  ADD COLUMN IF NOT EXISTS dist_hospitales_m  integer,
  ADD COLUMN IF NOT EXISTS dist_bancos_m      integer,
  ADD COLUMN IF NOT EXISTS dist_comercios_m   integer,
  ADD COLUMN IF NOT EXISTS dist_iglesias_m    integer,
  ADD COLUMN IF NOT EXISTS distancias_fuente  text DEFAULT 'manual',
  ADD COLUMN IF NOT EXISTS distancias_fecha_denue date;

-- Migrar datos existentes de columnas antiguas a las nuevas
UPDATE entorno_inmueble SET
  dist_escuelas_m   = dist_escuela_m,
  dist_hospitales_m = dist_hospital_m,
  dist_comercios_m  = dist_mercado_m
WHERE (dist_escuela_m IS NOT NULL OR dist_hospital_m IS NOT NULL OR dist_mercado_m IS NOT NULL);

-- Eliminar columnas obsoletas
ALTER TABLE entorno_inmueble
  DROP COLUMN IF EXISTS dist_escuela_m,
  DROP COLUMN IF EXISTS dist_hospital_m,
  DROP COLUMN IF EXISTS dist_mercado_m;

-- 4. Función RPC: distancias_entorno
--    Devuelve JSON con el establecimiento más cercano de cada categoría SCIAN
--    dentro del radio indicado (default 2000 m).
CREATE OR REPLACE FUNCTION distancias_entorno(
  p_lat   double precision,
  p_lng   double precision,
  p_radio integer DEFAULT 2000
)
RETURNS jsonb
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $func$
  WITH punto AS (
    SELECT ST_SetSRID(ST_MakePoint(p_lng, p_lat), 4326)::geography AS geom
  ),
  categorias(etiqueta, prefijo_scian) AS (
    VALUES
      ('escuelas',   '611'),
      ('hospitales', '622'),
      ('bancos',     '522'),
      ('comercios',  '461'),
      ('iglesias',   '813')
  ),
  cercanos AS (
    SELECT
      c.etiqueta,
      d.nom_estab,
      round(ST_Distance(p.geom, d.geom))::int AS distancia_m,
      ROW_NUMBER() OVER (
        PARTITION BY c.etiqueta
        ORDER BY ST_Distance(p.geom, d.geom)
      ) AS rn
    FROM punto p
    CROSS JOIN categorias c
    JOIN denue_establecimientos d
      ON d.codigo_act LIKE c.prefijo_scian || '%'
    WHERE ST_DWithin(p.geom, d.geom, p_radio)
  )
  SELECT jsonb_object_agg(
    etiqueta,
    jsonb_build_object('distancia_m', distancia_m, 'nombre', nom_estab)
  )
  FROM cercanos
  WHERE rn = 1;
$func$;

-- Permitir ejecución para usuarios autenticados
GRANT EXECUTE ON FUNCTION distancias_entorno(double precision, double precision, integer)
  TO authenticated;
