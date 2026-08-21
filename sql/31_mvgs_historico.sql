-- ============================================================
-- MVGS Sprint 5: Histórico de mercado — extracción de
-- comparables de homologación y consulta histórica de valores
-- ============================================================

-- ── 1. extraer_comparables_homologados() ─────────────────────
-- Lee el JSONB comparables de metodos_comparativos y carga cada
-- comparable con precio y superficie válidos en comparables_capturados
-- (tipo_suelo = 'terreno_construido', fuente_url = 'avaluo_homologacion').
-- El trigger asignar_zona_comparable asigna microzona/zona por ST_Contains.
-- Si p_corte es NULL, lo deriva del campo created_at del expediente.
-- Idempotente: elimina y recarga las entradas avaluo_homologacion del corte.

CREATE OR REPLACE FUNCTION public.extraer_comparables_homologados(
  p_corte text DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
VOLATILE
SECURITY INVOKER
SET search_path = public, extensions
AS $$
DECLARE
  v_exp        record;
  v_comp       jsonb;
  v_corte      text;
  v_geom       geometry(Point, 4326);
  v_sup        numeric;
  v_precio     numeric;
  v_inserted   int := 0;
  v_omitidos   int := 0;
BEGIN
  -- Eliminar extracciones previas para evitar duplicados
  DELETE FROM public.comparables_capturados
  WHERE fuente_url = 'avaluo_homologacion'
    AND (p_corte IS NULL OR corte = p_corte);

  FOR v_exp IN
    SELECT
      e.id         AS expediente_id,
      e.latitud,
      e.longitud,
      e.created_at,
      mc.comparables
    FROM   public.expedientes e
    JOIN   public.metodos_comparativos mc ON mc.expediente_id = e.id
    WHERE  e.latitud  IS NOT NULL
      AND  e.longitud IS NOT NULL
      AND  mc.comparables IS NOT NULL
      AND  jsonb_array_length(mc.comparables) > 0
  LOOP
    IF p_corte IS NOT NULL THEN
      v_corte := p_corte;
    ELSE
      v_corte := to_char(v_exp.created_at, 'YYYY') || '-'
              || CASE WHEN EXTRACT(MONTH FROM v_exp.created_at) <= 6 THEN '1' ELSE '2' END;
    END IF;

    v_geom := ST_SetSRID(
      ST_MakePoint(v_exp.longitud::double precision, v_exp.latitud::double precision),
      4326
    );

    FOR v_comp IN SELECT value FROM jsonb_array_elements(v_exp.comparables)
    LOOP
      v_sup    := (v_comp->>'superficie')::numeric;
      v_precio := (v_comp->>'precioTotal')::numeric;

      IF v_sup IS NULL OR v_sup <= 0 OR v_precio IS NULL OR v_precio <= 0 THEN
        v_omitidos := v_omitidos + 1;
        CONTINUE;
      END IF;

      INSERT INTO public.comparables_capturados (
        tipo_suelo,
        superficie_total_m2,
        precio_total,
        descripcion,
        fuente_url,
        corte,
        geom,
        fecha_captura,
        tipo_mercado,
        factor_negociacion
      ) VALUES (
        'terreno_construido',
        v_sup,
        v_precio,
        COALESCE(v_comp->>'descripcion', 'Comparable homologado avalúo'),
        'avaluo_homologacion',
        v_corte,
        v_geom,
        (v_exp.created_at AT TIME ZONE 'UTC')::date,
        'operacion_cerrada',
        1.00
      );

      v_inserted := v_inserted + 1;
    END LOOP;
  END LOOP;

  RETURN jsonb_build_object('insertados', v_inserted, 'omitidos', v_omitidos);
END;
$$;

REVOKE EXECUTE ON FUNCTION public.extraer_comparables_homologados(text) FROM PUBLIC, anon;
GRANT  EXECUTE ON FUNCTION public.extraer_comparables_homologados(text) TO authenticated;

-- ── 2. calcular_valores_construidos() ────────────────────────
-- Mismo algoritmo que calcular_valores_corte pero para
-- tipo_suelo = 'terreno_construido' (comparables de homologación).
-- Almacena el resultado como tipo_suelo = 'tc_v' en suelo_valores.

CREATE OR REPLACE FUNCTION public.calcular_valores_construidos(
  p_corte text
)
RETURNS jsonb
LANGUAGE plpgsql
VOLATILE
SECURITY INVOKER
SET search_path = public, extensions
AS $$
DECLARE
  v_row     record;
  v_stats   record;
  v_n       int;
  v_p25     numeric;
  v_p75     numeric;
  v_count   int := 0;
  v_resumen jsonb[] := '{}';
BEGIN
  FOR v_row IN
    SELECT
      c.microzona_id,
      COUNT(*) AS n_total
    FROM public.comparables_capturados c
    WHERE c.corte        = p_corte
      AND c.tipo_suelo   = 'terreno_construido'
      AND c.microzona_id IS NOT NULL
      AND c.precio_total > 0
      AND c.superficie_total_m2 > 0
    GROUP BY c.microzona_id
  LOOP
    WITH precios AS (
      SELECT (c.precio_total * COALESCE(c.factor_negociacion, 1.0) / c.superficie_total_m2) AS pu
      FROM public.comparables_capturados c
      WHERE c.corte        = p_corte
        AND c.tipo_suelo   = 'terreno_construido'
        AND c.microzona_id = v_row.microzona_id
        AND c.precio_total > 0
        AND c.superficie_total_m2 > 0
    ),
    cuartiles AS (
      SELECT
        percentile_cont(0.25) WITHIN GROUP (ORDER BY pu) AS p25,
        percentile_cont(0.75) WITHIN GROUP (ORDER BY pu) AS p75,
        COUNT(*) AS n
      FROM precios
    ),
    filtrados AS (
      SELECT p.pu FROM precios p
      CROSS JOIN cuartiles q
      WHERE q.n < 5
         OR p.pu BETWEEN (q.p25 - 1.5 * (q.p75 - q.p25))
                     AND (q.p75 + 1.5 * (q.p75 - q.p25))
    )
    SELECT
      COUNT(*)::int,
      MIN(pu), MAX(pu), AVG(pu), STDDEV(pu),
      percentile_cont(0.50) WITHIN GROUP (ORDER BY pu),
      percentile_cont(0.25) WITHIN GROUP (ORDER BY pu),
      percentile_cont(0.75) WITHIN GROUP (ORDER BY pu)
    INTO v_n,
      v_stats.minimo, v_stats.maximo, v_stats.promedio, v_stats.desviacion,
      v_stats.mediana, v_p25, v_p75
    FROM filtrados;

    INSERT INTO public.suelo_valores (
      microzona_id, corte, tipo_suelo,
      n_comparables, minimo, maximo, promedio, mediana, desviacion,
      p25, p75, rango_inf, rango_sup,
      valor_recomendado, confiabilidad, metodo, calculado_at
    ) VALUES (
      v_row.microzona_id, p_corte, 'tc_v',
      v_n,
      ROUND(v_stats.minimo::numeric,    2), ROUND(v_stats.maximo::numeric,    2),
      ROUND(v_stats.promedio::numeric,  2), ROUND(v_stats.mediana::numeric,   2),
      ROUND(v_stats.desviacion::numeric,2),
      ROUND(v_p25::numeric, 2), ROUND(v_p75::numeric, 2),
      ROUND(v_p25::numeric, 2), ROUND(v_p75::numeric, 2),
      ROUND(v_stats.mediana::numeric, 2),
      CASE WHEN v_n >= 6 THEN 'alta' WHEN v_n >= 3 THEN 'media' ELSE 'baja' END,
      'homologacion',
      now()
    )
    ON CONFLICT (microzona_id, corte, tipo_suelo) DO UPDATE SET
      n_comparables     = EXCLUDED.n_comparables,
      minimo            = EXCLUDED.minimo,
      maximo            = EXCLUDED.maximo,
      promedio          = EXCLUDED.promedio,
      mediana           = EXCLUDED.mediana,
      desviacion        = EXCLUDED.desviacion,
      p25               = EXCLUDED.p25,
      p75               = EXCLUDED.p75,
      rango_inf         = EXCLUDED.rango_inf,
      rango_sup         = EXCLUDED.rango_sup,
      valor_recomendado = EXCLUDED.valor_recomendado,
      confiabilidad     = EXCLUDED.confiabilidad,
      calculado_at      = now();

    v_count   := v_count + 1;
    v_resumen := v_resumen || jsonb_build_object(
      'microzona_id', v_row.microzona_id, 'n', v_n,
      'mediana', ROUND(v_stats.mediana::numeric, 2)
    );
  END LOOP;

  RETURN jsonb_build_object(
    'corte',                p_corte,
    'microzonas_procesadas', v_count,
    'detalle',              to_jsonb(v_resumen)
  );
END;
$$;

REVOKE EXECUTE ON FUNCTION public.calcular_valores_construidos(text) FROM PUBLIC, anon;
GRANT  EXECUTE ON FUNCTION public.calcular_valores_construidos(text) TO authenticated;

NOTIFY pgrst, 'reload schema';
