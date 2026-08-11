-- ============================================================
-- MVGS Sprint 3-4: Funciones para capas GeoJSON + admin
-- ============================================================

-- ── 1. Políticas de escritura para tablas administrativas ───
-- Admin-only enforcement se hace a nivel UI; a nivel DB = authenticated.

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename='suelo_zonas' AND policyname='mvgs_zonas_write'
  ) THEN
    CREATE POLICY "mvgs_zonas_write" ON public.suelo_zonas
      FOR ALL TO authenticated USING (true) WITH CHECK (true);
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename='suelo_microzonas' AND policyname='mvgs_microzonas_write'
  ) THEN
    CREATE POLICY "mvgs_microzonas_write" ON public.suelo_microzonas
      FOR ALL TO authenticated USING (true) WITH CHECK (true);
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename='suelo_catalogo_normativo' AND policyname='mvgs_catalogo_write'
  ) THEN
    CREATE POLICY "mvgs_catalogo_write" ON public.suelo_catalogo_normativo
      FOR ALL TO authenticated USING (true) WITH CHECK (true);
  END IF;
END $$;

-- ── 2. get_capas_suelo() ─────────────────────────────────────
-- Devuelve zonas y microzonas como GeoJSON FeatureCollections
-- para renderizar las capas del mapa.

CREATE OR REPLACE FUNCTION public.get_capas_suelo(
  p_instrumento_id uuid DEFAULT NULL,
  p_municipio_id   smallint DEFAULT NULL
)
RETURNS jsonb
LANGUAGE sql
STABLE
SECURITY INVOKER
SET search_path = public, extensions
AS $$
  SELECT jsonb_build_object(
    'zonas', (
      SELECT jsonb_build_object(
        'type', 'FeatureCollection',
        'features', COALESCE(jsonb_agg(jsonb_build_object(
          'type', 'Feature',
          'geometry', ST_AsGeoJSON(sz.geom)::jsonb,
          'properties', jsonb_build_object(
            'id',          sz.id,
            'clave',       sz.clave,
            'sector',      sz.sector,
            'categoria',   cn.categoria,
            'descripcion', cn.descripcion,
            'verificado',  cn.verificado,
            'cos',         cn.cos,
            'cus',         COALESCE(cn.cus, CASE WHEN cn.cus_factor_sobre_cos IS NOT NULL AND cn.cos IS NOT NULL
                                                 THEN cn.cos * cn.cus_factor_sobre_cos END)
          )
        )), '[]'::jsonb)
      )
      FROM public.suelo_zonas sz
      JOIN public.suelo_instrumentos si ON si.id = sz.instrumento_id AND si.vigente = true
      LEFT JOIN public.suelo_catalogo_normativo cn ON cn.instrumento_id = sz.instrumento_id AND cn.clave = sz.clave
      WHERE (p_instrumento_id IS NULL OR sz.instrumento_id = p_instrumento_id)
    ),
    'microzonas', (
      SELECT jsonb_build_object(
        'type', 'FeatureCollection',
        'features', COALESCE(jsonb_agg(jsonb_build_object(
          'type', 'Feature',
          'geometry', ST_AsGeoJSON(mz.geom)::jsonb,
          'properties', jsonb_build_object(
            'id',                mz.id,
            'nombre',            mz.nombre,
            'zona_predominante', mz.zona_predominante
          )
        )), '[]'::jsonb)
      )
      FROM public.suelo_microzonas mz
      WHERE (p_municipio_id IS NULL OR mz.municipio_id = p_municipio_id)
    )
  );
$$;

REVOKE EXECUTE ON FUNCTION public.get_capas_suelo(uuid, smallint) FROM PUBLIC, anon;
GRANT  EXECUTE ON FUNCTION public.get_capas_suelo(uuid, smallint) TO authenticated;

-- ── 3. importar_zonas_geojson() ──────────────────────────────
-- Carga un GeoJSON FeatureCollection de zonas o microzonas.
-- Cada Feature requiere en properties: para zona → clave;
-- para microzona → nombre y opcionalmente zona_predominante.

CREATE OR REPLACE FUNCTION public.importar_zonas_geojson(
  p_geojson        jsonb,
  p_instrumento_id uuid,
  p_tipo           text,    -- 'zona' | 'microzona'
  p_fuente         text DEFAULT 'digitalizado_qgis'
)
RETURNS jsonb
LANGUAGE plpgsql
VOLATILE
SECURITY INVOKER
SET search_path = public, extensions
AS $$
DECLARE
  v_feature   jsonb;
  v_geom      geometry;
  v_count     int := 0;
  v_errores   text[] := '{}';
  v_municipio smallint;
BEGIN
  IF p_tipo NOT IN ('zona', 'microzona') THEN
    RAISE EXCEPTION 'p_tipo debe ser "zona" o "microzona"';
  END IF;

  SELECT municipio_id INTO v_municipio
  FROM public.suelo_instrumentos WHERE id = p_instrumento_id;

  FOR v_feature IN
    SELECT value FROM jsonb_array_elements(
      CASE WHEN p_geojson->>'type' = 'FeatureCollection'
           THEN p_geojson->'features'
           ELSE jsonb_build_array(p_geojson) END
    )
  LOOP
    BEGIN
      v_geom := ST_Multi(ST_SetSRID(
        ST_GeomFromGeoJSON((v_feature->'geometry')::text),
        4326
      ));

      IF NOT ST_IsValid(v_geom) THEN
        v_errores := v_errores || format(
          'Geometría inválida (clave=%s): %s',
          COALESCE(v_feature->'properties'->>'clave', v_feature->'properties'->>'nombre', '?'),
          ST_IsValidReason(v_geom)
        );
        CONTINUE;
      END IF;

      IF p_tipo = 'zona' THEN
        INSERT INTO public.suelo_zonas(instrumento_id, clave, sector, geom, fuente_geometria)
        VALUES (
          p_instrumento_id,
          v_feature->'properties'->>'clave',
          v_feature->'properties'->>'sector',
          v_geom,
          p_fuente
        )
        ON CONFLICT DO NOTHING;
      ELSE
        INSERT INTO public.suelo_microzonas(municipio_id, nombre, zona_predominante, geom, notas)
        VALUES (
          v_municipio,
          v_feature->'properties'->>'nombre',
          v_feature->'properties'->>'zona_predominante',
          v_geom,
          v_feature->'properties'->>'notas'
        )
        ON CONFLICT DO NOTHING;
      END IF;

      v_count := v_count + 1;
    EXCEPTION WHEN OTHERS THEN
      v_errores := v_errores || format(
        'Error en feature %s: %s',
        COALESCE(v_feature->'properties'->>'clave', v_feature->'properties'->>'nombre', '?'),
        SQLERRM
      );
    END;
  END LOOP;

  RETURN jsonb_build_object('insertados', v_count, 'errores', to_jsonb(v_errores));
END;
$$;

REVOKE EXECUTE ON FUNCTION public.importar_zonas_geojson(jsonb, uuid, text, text) FROM PUBLIC, anon;
GRANT  EXECUTE ON FUNCTION public.importar_zonas_geojson(jsonb, uuid, text, text) TO authenticated;

NOTIFY pgrst, 'reload schema';
