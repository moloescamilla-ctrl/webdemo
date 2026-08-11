-- ============================================================
-- MVGS Sprint 1: Módulo de Valores Georreferenciados del Suelo
-- Tablas, índices GiST, RLS y seeds (catálogo + polígonos de prueba)
-- Piloto: Orizaba, Veracruz — PMDU 2020
-- ============================================================

-- PostGIS ya habilitado en migración 04; esta línea es idempotente
CREATE EXTENSION IF NOT EXISTS postgis;

-- ── 1. Municipios ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.municipios (
  id           smallint PRIMARY KEY,      -- clave INEGI (Orizaba = 30118)
  nombre       text     NOT NULL,
  estado       text     NOT NULL DEFAULT 'Veracruz',
  clave_inegi  text     UNIQUE NOT NULL
);

ALTER TABLE public.municipios ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'municipios' AND policyname = 'mvgs_municipios_select'
  ) THEN
    CREATE POLICY "mvgs_municipios_select" ON public.municipios
      FOR SELECT TO authenticated USING (true);
  END IF;
END $$;

-- ── 2. Instrumentos normativos ───────────────────────────────
CREATE TABLE IF NOT EXISTS public.suelo_instrumentos (
  id                 uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  municipio_id       smallint    NOT NULL REFERENCES public.municipios(id),
  nombre             text        NOT NULL,
  publicacion        text,
  fecha_publicacion  date,
  vigente            boolean     NOT NULL DEFAULT true,
  url_fuente         text,
  created_at         timestamptz NOT NULL DEFAULT now(),
  UNIQUE(municipio_id, nombre)
);

ALTER TABLE public.suelo_instrumentos ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'suelo_instrumentos' AND policyname = 'mvgs_instrumentos_select'
  ) THEN
    CREATE POLICY "mvgs_instrumentos_select" ON public.suelo_instrumentos
      FOR SELECT TO authenticated USING (true);
  END IF;
END $$;

-- ── 3. Zonas de zonificación (polígonos PMDU) ────────────────
CREATE TABLE IF NOT EXISTS public.suelo_zonas (
  id                uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  instrumento_id    uuid        NOT NULL REFERENCES public.suelo_instrumentos(id),
  clave             text        NOT NULL,
  sector            text,
  distrito          text,
  barrio            text,
  geom              geometry(MultiPolygon, 4326) NOT NULL,
  fuente_geometria  text        NOT NULL DEFAULT 'digitalizado_qgis',
  created_at        timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_suelo_zonas_geom  ON public.suelo_zonas USING gist(geom);
CREATE INDEX IF NOT EXISTS idx_suelo_zonas_clave ON public.suelo_zonas(instrumento_id, clave);

ALTER TABLE public.suelo_zonas ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'suelo_zonas' AND policyname = 'mvgs_zonas_select'
  ) THEN
    CREATE POLICY "mvgs_zonas_select" ON public.suelo_zonas
      FOR SELECT TO authenticated USING (true);
  END IF;
END $$;

-- ── 4. Catálogo normativo (parámetros por clave de zona) ─────
CREATE TABLE IF NOT EXISTS public.suelo_catalogo_normativo (
  id                    uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  instrumento_id        uuid        NOT NULL REFERENCES public.suelo_instrumentos(id),
  clave                 text        NOT NULL,
  categoria             text        NOT NULL,
  descripcion           text,
  densidad_min          numeric,
  densidad_max          numeric,
  lote_minimo_m2        numeric,
  frente_minimo_m       numeric,
  cos                   numeric,
  cus                   numeric,
  cps                   numeric,
  niveles_max           smallint,
  altura_max_m          numeric,
  usos_compatibles      text[],
  restricciones         text,
  verificado            boolean     NOT NULL DEFAULT false,
  -- Addendum A (Gaceta Tomo I)
  mezcla_usm_pct        smallint,
  mezcla_hab_pct        smallint,
  cus_factor_sobre_cos  numeric,
  fuente_dato           text,
  UNIQUE(instrumento_id, clave)
);

ALTER TABLE public.suelo_catalogo_normativo ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'suelo_catalogo_normativo' AND policyname = 'mvgs_catalogo_select'
  ) THEN
    CREATE POLICY "mvgs_catalogo_select" ON public.suelo_catalogo_normativo
      FOR SELECT TO authenticated USING (true);
  END IF;
END $$;

-- ── 5. Microzonas (agregación para estadística de mercado) ───
CREATE TABLE IF NOT EXISTS public.suelo_microzonas (
  id                  uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  municipio_id        smallint    NOT NULL REFERENCES public.municipios(id),
  nombre              text        NOT NULL,
  geom                geometry(MultiPolygon, 4326) NOT NULL,
  zona_predominante   text,
  notas               text,
  created_at          timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_suelo_microzonas_geom ON public.suelo_microzonas USING gist(geom);

ALTER TABLE public.suelo_microzonas ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'suelo_microzonas' AND policyname = 'mvgs_microzonas_select'
  ) THEN
    CREATE POLICY "mvgs_microzonas_select" ON public.suelo_microzonas
      FOR SELECT TO authenticated USING (true);
  END IF;
END $$;

-- ── 6. Valores de suelo por microzona y corte ─────────────────
CREATE TABLE IF NOT EXISTS public.suelo_valores (
  id                uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  microzona_id      uuid        NOT NULL REFERENCES public.suelo_microzonas(id),
  corte             text        NOT NULL,
  tipo_suelo        text        NOT NULL,
  n_comparables     int         NOT NULL DEFAULT 0,
  minimo            numeric,
  maximo            numeric,
  promedio          numeric,
  mediana           numeric,
  desviacion        numeric,
  p25               numeric,
  p75               numeric,
  rango_inf         numeric,
  rango_sup         numeric,
  valor_recomendado numeric,
  confiabilidad     text,
  metodo            text        DEFAULT 'comparativo',
  calculado_at      timestamptz NOT NULL DEFAULT now(),
  UNIQUE(microzona_id, corte, tipo_suelo)
);

ALTER TABLE public.suelo_valores ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'suelo_valores' AND policyname = 'mvgs_valores_select'
  ) THEN
    CREATE POLICY "mvgs_valores_select" ON public.suelo_valores
      FOR SELECT TO authenticated USING (true);
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'suelo_valores' AND policyname = 'mvgs_valores_write'
  ) THEN
    CREATE POLICY "mvgs_valores_write" ON public.suelo_valores
      FOR ALL TO authenticated USING (true) WITH CHECK (true);
  END IF;
END $$;

-- ── 7. Extensión de comparables_capturados ───────────────────
-- Nota: no se crea tabla nueva; se extiende la existente.
ALTER TABLE public.comparables_capturados
  ADD COLUMN IF NOT EXISTS tipo_suelo         text CHECK (tipo_suelo IN (
    'terreno_vacante', 'terreno_construido', 'potencial_desarrollo')),
  ADD COLUMN IF NOT EXISTS geom               geometry(Point, 4326),
  ADD COLUMN IF NOT EXISTS microzona_id       uuid REFERENCES public.suelo_microzonas(id),
  ADD COLUMN IF NOT EXISTS zona_id            uuid REFERENCES public.suelo_zonas(id),
  ADD COLUMN IF NOT EXISTS frente_m           numeric,
  ADD COLUMN IF NOT EXISTS fondo_m            numeric,
  ADD COLUMN IF NOT EXISTS tipo_mercado       text CHECK (tipo_mercado IN ('oferta', 'operacion_cerrada')),
  ADD COLUMN IF NOT EXISTS factor_negociacion numeric DEFAULT 1.00,
  ADD COLUMN IF NOT EXISTS confiabilidad      smallint CHECK (confiabilidad BETWEEN 1 AND 5),
  ADD COLUMN IF NOT EXISTS corte              text,
  ADD COLUMN IF NOT EXISTS fuente_url         text;

CREATE INDEX IF NOT EXISTS idx_comparables_geom  ON public.comparables_capturados USING gist(geom);
CREATE INDEX IF NOT EXISTS idx_comparables_corte ON public.comparables_capturados(corte, tipo_suelo);

-- ── 8. Seeds ─────────────────────────────────────────────────
DO $$
DECLARE
  v_municipio_id smallint := 30118;
  v_inst_id      uuid;
BEGIN
  -- Municipio Orizaba
  INSERT INTO public.municipios(id, nombre, estado, clave_inegi)
  VALUES (v_municipio_id, 'Orizaba', 'Veracruz', '30118')
  ON CONFLICT(id) DO NOTHING;

  -- Instrumento normativo
  INSERT INTO public.suelo_instrumentos(municipio_id, nombre, publicacion, fecha_publicacion, vigente)
  VALUES (v_municipio_id, 'PMDU Orizaba 2020',
          'Gaceta Of. Ver. Ext. 008, 06-ene-2022', '2022-01-06', true)
  ON CONFLICT(municipio_id, nombre) DO NOTHING;

  SELECT id INTO v_inst_id
  FROM public.suelo_instrumentos
  WHERE municipio_id = v_municipio_id AND nombre = 'PMDU Orizaba 2020';

  -- ── Catálogo normativo ────────────────────────────────────
  -- Habitacionales verificados (fuente: investigación previa del proyecto)
  INSERT INTO public.suelo_catalogo_normativo
    (instrumento_id, clave, categoria, descripcion,
     densidad_min, densidad_max, lote_minimo_m2, cos, cus, cps, niveles_max, altura_max_m,
     verificado, fuente_dato)
  VALUES
    (v_inst_id,'ZHDMB','habitacional','Habitacional Densidad Media-Baja',
     10,20,200,0.50,1.00,0.25,2,6,  true,'proyecto'),
    (v_inst_id,'ZHDM', 'habitacional','Habitacional Densidad Media',
     20,30,200,0.50,1.10,0.25,2,6,  true,'proyecto'),
    (v_inst_id,'ZHDMA','habitacional','Habitacional Densidad Media-Alta',
     30,40,150,0.55,1.65,0.23,3,9,  true,'proyecto'),
    (v_inst_id,'ZHA1', 'habitacional','Habitacional Alta 1',
     40,50,120,0.60,1.80,0.20,3,9,  true,'proyecto'),
    (v_inst_id,'ZHAM', 'habitacional','Habitacional Alta Máxima',
     50,60,67.5,0.70,2.10,0.15,3,9, true,'proyecto'),
    (v_inst_id,'ZHA2', 'habitacional','Habitacional Alta 2 (>60 viv/ha)',
     60,NULL,NULL,NULL,NULL,NULL,NULL,NULL, false,'gaceta_t1')
  ON CONFLICT(instrumento_id, clave) DO UPDATE SET
    densidad_min   = EXCLUDED.densidad_min,
    densidad_max   = EXCLUDED.densidad_max,
    lote_minimo_m2 = EXCLUDED.lote_minimo_m2,
    cos            = EXCLUDED.cos,
    cus            = EXCLUDED.cus,
    cps            = EXCLUDED.cps,
    niveles_max    = EXCLUDED.niveles_max,
    altura_max_m   = EXCLUDED.altura_max_m,
    verificado     = EXCLUDED.verificado,
    fuente_dato    = EXCLUDED.fuente_dato;

  -- Habitacionales nuevas (Addendum A, Gaceta Tomo I)
  INSERT INTO public.suelo_catalogo_normativo
    (instrumento_id, clave, categoria, descripcion, densidad_max, verificado, fuente_dato)
  VALUES
    (v_inst_id,'ZHDB1','habitacional','Habitacional Densidad Muy Baja (<4 viv/ha)',4,false,'gaceta_t1'),
    (v_inst_id,'ZHDB2','habitacional','Habitacional Densidad Baja (4-10 viv/ha)',10,false,'gaceta_t1')
  ON CONFLICT(instrumento_id, clave) DO NOTHING;

  -- Mixtas (verificadas Gaceta Tomo I p.359)
  INSERT INTO public.suelo_catalogo_normativo
    (instrumento_id, clave, categoria, descripcion,
     densidad_min, densidad_max, mezcla_usm_pct, mezcla_hab_pct, verificado, fuente_dato)
  VALUES
    (v_inst_id,'ZUMA','mixto','Zona Mixta Alta',        80,NULL,75,25,true,'gaceta_t1'),
    (v_inst_id,'ZUM', 'mixto','Zona Mixta Media',        60,80,  50,50,true,'gaceta_t1'),
    (v_inst_id,'ZUMB','mixto','Zona Mixta Baja',         NULL,60,25,75,true,'gaceta_t1')
  ON CONFLICT(instrumento_id, clave) DO UPDATE SET
    densidad_min    = EXCLUDED.densidad_min,
    densidad_max    = EXCLUDED.densidad_max,
    mezcla_usm_pct  = EXCLUDED.mezcla_usm_pct,
    mezcla_hab_pct  = EXCLUDED.mezcla_hab_pct,
    verificado      = EXCLUDED.verificado,
    fuente_dato     = EXCLUDED.fuente_dato;

  -- Corredores (heredan parámetros de zona mixta; Tomo I pp.357-360)
  INSERT INTO public.suelo_catalogo_normativo
    (instrumento_id, clave, categoria, descripcion, verificado, fuente_dato, restricciones)
  VALUES
    (v_inst_id,'CUMA','corredor','Corredor Usos Mixtos Alto (hereda ZUMA)',true,'gaceta_t1',
     'Predios con frente a vialidades de conexión regional y primarias; Av. Cri-Cri, Periférico Met., etc.'),
    (v_inst_id,'CUM', 'corredor','Corredor Usos Mixtos Medio (asimilable ZUM)',true,'gaceta_t1',
     'Jerarquía media; Avenida 5, Col. Rafael Alvarado Fernández')
  ON CONFLICT(instrumento_id, clave) DO UPDATE SET
    descripcion = EXCLUDED.descripcion,
    verificado  = EXCLUDED.verificado,
    fuente_dato = EXCLUDED.fuente_dato,
    restricciones = EXCLUDED.restricciones;

  -- Comercio y servicios (verificadas Gaceta Tomo I p.360)
  INSERT INTO public.suelo_catalogo_normativo
    (instrumento_id, clave, categoria, descripcion,
     densidad_max, cos, cus_factor_sobre_cos, verificado, fuente_dato, restricciones)
  VALUES
    (v_inst_id,'ZCSL','comercio','Comercial y de Servicios Local',  50,0.70,3.5,true,'gaceta_t1',
     'COS hasta 0.80 en esquina a vialidad principal; densidad 60 para hospedaje'),
    (v_inst_id,'ZCSR','comercio','Comercial y de Servicios Regional',60,0.70,5.0,true,'gaceta_t1',
     'COS 0.80 solo hospedaje turístico')
  ON CONFLICT(instrumento_id, clave) DO UPDATE SET
    cos                   = EXCLUDED.cos,
    cus_factor_sobre_cos  = EXCLUDED.cus_factor_sobre_cos,
    verificado            = EXCLUDED.verificado,
    fuente_dato           = EXCLUDED.fuente_dato;

  -- Industrial (pendientes Anexo I)
  INSERT INTO public.suelo_catalogo_normativo
    (instrumento_id, clave, categoria, descripcion, verificado, fuente_dato)
  VALUES
    (v_inst_id,'ZIL','industrial','Industrial Ligera',                     false,'gaceta_t1'),
    (v_inst_id,'ZIP','industrial','Industrial Pesada',                     false,'gaceta_t1'),
    (v_inst_id,'ZIM','industrial','Industria Media (bienes de equipo)',    false,'gaceta_t1')
  ON CONFLICT(instrumento_id, clave) DO NOTHING;

  -- Infraestructura
  INSERT INTO public.suelo_catalogo_normativo
    (instrumento_id, clave, categoria, descripcion, verificado, fuente_dato)
  VALUES
    (v_inst_id,'ZIU1','infraestructura','Plantas potabilizadoras y tratamiento',false,'gaceta_t1'),
    (v_inst_id,'ZIU3','infraestructura','Rellenos sanitarios y residuos',       false,'gaceta_t1')
  ON CONFLICT(instrumento_id, clave) DO NOTHING;

  -- Protección ecológica (verificadas Gaceta Tomo I)
  INSERT INTO public.suelo_catalogo_normativo
    (instrumento_id, clave, categoria, descripcion, verificado, fuente_dato, restricciones)
  VALUES
    (v_inst_id,'ZREP',    'proteccion','Reserva Ecológica Productiva',          true,'gaceta_t1',
     'Permite actividades primarias y vivienda unifamiliar'),
    (v_inst_id,'ZRERyANP','proteccion','Reserva Restrictiva y ANP (sin uso urbano)',true,'gaceta_t1',
     'Sin uso urbano; Área Natural Protegida')
  ON CONFLICT(instrumento_id, clave) DO NOTHING;

  -- Equipamiento, turismo, centralidad (pendientes Anexo I)
  INSERT INTO public.suelo_catalogo_normativo
    (instrumento_id, clave, categoria, descripcion, verificado, fuente_dato)
  VALUES
    (v_inst_id,'ZEU', 'equipamiento','Equipamiento Urbano',                     false,'gaceta_t1'),
    (v_inst_id,'ZTUR','turismo',     'Zona Turística',                          false,'gaceta_t1'),
    (v_inst_id,'ZPC', 'proteccion',  'Zona de Protección Civil (riesgo)',        false,'gaceta_t1'),
    (v_inst_id,'CU1', 'centralidad', 'Centro Urbano 1',                          false,'gaceta_t1'),
    (v_inst_id,'CU2', 'centralidad', 'Centro Urbano 2',                          false,'gaceta_t1')
  ON CONFLICT(instrumento_id, clave) DO NOTHING;

  -- Supletorias — Cuadro 4.27 Tomo I p.364 (fallback cuando la clave tiene verificado=false)
  INSERT INTO public.suelo_catalogo_normativo
    (instrumento_id, clave, categoria, descripcion, cos, cus, niveles_max, verificado, fuente_dato)
  VALUES
    (v_inst_id,'_SUP_HAB','supletoria','Cuadro 4.27 Habitacional (máximos)',0.70,1.40,3,true,'gaceta_t1'),
    (v_inst_id,'_SUP_COM','supletoria','Cuadro 4.27 Comercio-Servicios (máximos)',0.70,2.80,4,true,'gaceta_t1'),
    (v_inst_id,'_SUP_IND','supletoria','Cuadro 4.27 Industria (máximos)',0.70,1.40,2,true,'gaceta_t1')
  ON CONFLICT(instrumento_id, clave) DO NOTHING;

  -- ── Polígonos de prueba (Centro de Orizaba) ───────────────
  -- 4 polígonos para desarrollo/prueba; georreferenciados aproximadamente
  -- Coordenadas: lat ~18.854°N, lng ~-97.100°W (Centro histórico)

  -- CU1 — Centro histórico de Orizaba (~500×400 m)
  INSERT INTO public.suelo_zonas(instrumento_id, clave, sector, geom, fuente_geometria)
  VALUES (
    v_inst_id, 'CU1', 'Centro',
    ST_Multi(ST_GeomFromText(
      'POLYGON((-97.1030 18.8570, -97.0985 18.8570, -97.0985 18.8535,
                -97.1030 18.8535, -97.1030 18.8570))', 4326)),
    'digitalizado_qgis_prueba'
  ) ON CONFLICT DO NOTHING;

  -- ZHA1 — Zona habitacional alta, norte del centro
  INSERT INTO public.suelo_zonas(instrumento_id, clave, sector, geom, fuente_geometria)
  VALUES (
    v_inst_id, 'ZHA1', 'Barrio Nuevo',
    ST_Multi(ST_GeomFromText(
      'POLYGON((-97.1055 18.8610, -97.1010 18.8610, -97.1010 18.8575,
                -97.1055 18.8575, -97.1055 18.8610))', 4326)),
    'digitalizado_qgis_prueba'
  ) ON CONFLICT DO NOTHING;

  -- CUMA — Corredor usos mixtos (franja sobre Av. Cri-Cri, E–O)
  INSERT INTO public.suelo_zonas(instrumento_id, clave, sector, geom, fuente_geometria)
  VALUES (
    v_inst_id, 'CUMA', 'Corredor Norte',
    ST_Multi(ST_GeomFromText(
      'POLYGON((-97.1100 18.8552, -97.0960 18.8552, -97.0960 18.8537,
                -97.1100 18.8537, -97.1100 18.8552))', 4326)),
    'digitalizado_qgis_prueba'
  ) ON CONFLICT DO NOTHING;

  -- ZHDM — Habitacional densidad media, suroeste
  INSERT INTO public.suelo_zonas(instrumento_id, clave, sector, geom, fuente_geometria)
  VALUES (
    v_inst_id, 'ZHDM', 'Lourdes',
    ST_Multi(ST_GeomFromText(
      'POLYGON((-97.1090 18.8525, -97.1040 18.8525, -97.1040 18.8485,
                -97.1090 18.8485, -97.1090 18.8525))', 4326)),
    'digitalizado_qgis_prueba'
  ) ON CONFLICT DO NOTHING;

  -- ── Microzonas piloto ─────────────────────────────────────
  INSERT INTO public.suelo_microzonas(municipio_id, nombre, zona_predominante, geom, notas)
  VALUES
    (v_municipio_id, 'Centro-1', 'CU1',
     ST_Multi(ST_GeomFromText(
       'POLYGON((-97.1030 18.8570, -97.0985 18.8570, -97.0985 18.8535,
                 -97.1030 18.8535, -97.1030 18.8570))', 4326)),
     'Centro histórico de Orizaba; delimitación de prueba'),
    (v_municipio_id, 'Barrio Nuevo-A', 'ZHA1',
     ST_Multi(ST_GeomFromText(
       'POLYGON((-97.1055 18.8610, -97.1010 18.8610, -97.1010 18.8575,
                 -97.1055 18.8575, -97.1055 18.8610))', 4326)),
     'Zona habitacional norte; delimitación de prueba'),
    (v_municipio_id, 'Corredor-Norte', 'CUMA',
     ST_Multi(ST_GeomFromText(
       'POLYGON((-97.1100 18.8552, -97.0960 18.8552, -97.0960 18.8537,
                 -97.1100 18.8537, -97.1100 18.8552))', 4326)),
     'Corredor av. Cri-Cri; delimitación de prueba')
  ON CONFLICT DO NOTHING;

END $$;

NOTIFY pgrst, 'reload schema';
