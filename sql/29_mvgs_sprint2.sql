-- ============================================================
-- MVGS Sprint 2: Función de consulta espacial y motor de corte
-- Todas las funciones usan SECURITY INVOKER + search_path explícito
-- ============================================================

-- ── 1. consultar_suelo() ─────────────────────────────────────
-- Dado un punto (lat, lng) devuelve: municipio, microzona,
-- zona PMDU con parámetros normativos, y estadística de valor de suelo
-- del corte solicitado (o el más reciente si p_corte es NULL).

CREATE OR REPLACE FUNCTION public.consultar_suelo(
  p_lat   numeric,
  p_lng   numeric,
  p_corte text DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
STABLE
SECURITY INVOKER
SET search_path = public, extensions
AS $$
DECLARE
  v_punto      geometry(Point, 4326);
  v_microzona  record;
  v_zona       record;
  v_catalogo   record;
  v_valores    record;
  v_municipio  record;
  v_corte_uso  text;
BEGIN
  v_punto := ST_SetSRID(ST_MakePoint(p_lng::double precision, p_lat::double precision), 4326);

  -- Microzona que contiene el punto
  SELECT mz.id, mz.nombre, mz.zona_predominante, mz.municipio_id
  INTO   v_microzona
  FROM   public.suelo_microzonas mz
  WHERE  ST_Contains(mz.geom, v_punto)
  LIMIT  1;

  -- Zona PMDU (fallback si no hay microzona, o para complementar info)
  SELECT sz.id, sz.clave, sz.sector, sz.instrumento_id
  INTO   v_zona
  FROM   public.suelo_zonas sz
  JOIN   public.suelo_instrumentos si ON si.id = sz.instrumento_id
  WHERE  ST_Contains(sz.geom, v_punto)
    AND  si.vigente = true
  ORDER  BY si.fecha_publicacion DESC NULLS LAST
  LIMIT  1;

  -- Sin ninguna cobertura espacial
  IF v_microzona IS NULL AND v_zona IS NULL THEN
    RETURN jsonb_build_object(
      'municipio',   NULL,
      'microzona',   NULL,
      'zona',        NULL,
      'valor_suelo', NULL,
      'mensaje',     'Coordenadas fuera del área con zonificación registrada'
    );
  END IF;

  -- Municipio
  SELECT m.id, m.nombre, m.estado
  INTO   v_municipio
  FROM   public.municipios m
  WHERE  m.id = COALESCE(v_microzona.municipio_id,
           (SELECT si2.municipio_id FROM public.suelo_instrumentos si2
            WHERE si2.id = v_zona.instrumento_id LIMIT 1));

  -- Parámetros normativos del catálogo
  -- Prioridad: la clave de la zona encontrada (o la zona_predominante de la microzona)
  SELECT cn.*
  INTO   v_catalogo
  FROM   public.suelo_catalogo_normativo cn
  WHERE  cn.instrumento_id = COALESCE(v_zona.instrumento_id,
           (SELECT id FROM public.suelo_instrumentos
            WHERE municipio_id = v_microzona.municipio_id AND vigente = true LIMIT 1))
    AND  cn.clave = COALESCE(v_zona.clave, v_microzona.zona_predominante)
  LIMIT  1;

  -- Corte activo (solicitado o el más reciente con datos)
  IF p_corte IS NOT NULL THEN
    v_corte_uso := p_corte;
  ELSE
    SELECT sv.corte INTO v_corte_uso
    FROM   public.suelo_valores sv
    WHERE  sv.microzona_id = v_microzona.id
    ORDER  BY sv.corte DESC
    LIMIT  1;
  END IF;

  -- Estadística de valor de suelo
  IF v_microzona IS NOT NULL AND v_corte_uso IS NOT NULL THEN
    SELECT sv.*
    INTO   v_valores
    FROM   public.suelo_valores sv
    WHERE  sv.microzona_id = v_microzona.id
      AND  sv.corte        = v_corte_uso
      AND  sv.tipo_suelo   = 'vt_v'
    LIMIT  1;
  END IF;

  RETURN jsonb_build_object(
    'municipio', CASE WHEN v_municipio IS NULL THEN NULL ELSE
      jsonb_build_object('id', v_municipio.id, 'nombre', v_municipio.nombre, 'estado', v_municipio.estado)
    END,
    'microzona', CASE WHEN v_microzona IS NULL THEN NULL ELSE
      jsonb_build_object('id', v_microzona.id, 'nombre', v_microzona.nombre,
                         'zona_predominante', v_microzona.zona_predominante)
    END,
    'zona', CASE WHEN v_catalogo IS NULL THEN
      CASE WHEN v_zona IS NULL THEN NULL ELSE
        jsonb_build_object('clave', v_zona.clave, 'sector', v_zona.sector,
                           'descripcion', NULL, 'categoria', NULL,
                           'verificado', false)
      END
    ELSE
      jsonb_build_object(
        'clave',            v_catalogo.clave,
        'categoria',        v_catalogo.categoria,
        'descripcion',      v_catalogo.descripcion,
        'cos',              v_catalogo.cos,
        'cus',              COALESCE(v_catalogo.cus,
                              CASE WHEN v_catalogo.cus_factor_sobre_cos IS NOT NULL AND v_catalogo.cos IS NOT NULL
                                   THEN v_catalogo.cos * v_catalogo.cus_factor_sobre_cos END),
        'cps',              v_catalogo.cps,
        'lote_minimo_m2',   v_catalogo.lote_minimo_m2,
        'frente_minimo_m',  v_catalogo.frente_minimo_m,
        'densidad_min',     v_catalogo.densidad_min,
        'densidad_max',     v_catalogo.densidad_max,
        'niveles_max',      v_catalogo.niveles_max,
        'altura_max_m',     v_catalogo.altura_max_m,
        'verificado',       v_catalogo.verificado,
        'restricciones',    v_catalogo.restricciones,
        'mezcla_usm_pct',   v_catalogo.mezcla_usm_pct,
        'mezcla_hab_pct',   v_catalogo.mezcla_hab_pct
      )
    END,
    'valor_suelo', CASE WHEN v_valores IS NULL THEN
      CASE WHEN v_microzona IS NOT NULL THEN
        jsonb_build_object('microzona', v_microzona.nombre,
                           'corte', v_corte_uso,
                           'tipo_suelo', 'vt_v',
                           'n_comparables', 0,
                           'confiabilidad', 'insuficiente',
                           'valor_recomendado', NULL)
      ELSE NULL END
    ELSE
      jsonb_build_object(
        'corte',             v_valores.corte,
        'tipo_suelo',        v_valores.tipo_suelo,
        'n_comparables',     v_valores.n_comparables,
        'minimo',            v_valores.minimo,
        'maximo',            v_valores.maximo,
        'promedio',          v_valores.promedio,
        'mediana',           v_valores.mediana,
        'p25',               v_valores.p25,
        'p75',               v_valores.p75,
        'rango_inf',         v_valores.rango_inf,
        'rango_sup',         v_valores.rango_sup,
        'valor_recomendado', v_valores.valor_recomendado,
        'confiabilidad',     v_valores.confiabilidad
      )
    END
  );
END;
$$;

REVOKE EXECUTE ON FUNCTION public.consultar_suelo(numeric, numeric, text) FROM PUBLIC, anon;
GRANT  EXECUTE ON FUNCTION public.consultar_suelo(numeric, numeric, text) TO authenticated;

-- ── 2. calcular_valores_corte() ───────────────────────────────
-- Recalcula suelo_valores para todas las microzonas con comparables
-- del corte indicado. Se llama desde el botón «Cerrar corte» (admin UI).

CREATE OR REPLACE FUNCTION public.calcular_valores_corte(
  p_corte text
)
RETURNS jsonb
LANGUAGE plpgsql
VOLATILE
SECURITY INVOKER
SET search_path = public, extensions
AS $$
DECLARE
  v_row      record;
  v_stats    record;
  v_n        int;
  v_p25      numeric;
  v_p75      numeric;
  v_iqr      numeric;
  v_count    int := 0;
  v_resumen  jsonb[] := '{}';
BEGIN
  FOR v_row IN
    SELECT
      c.microzona_id,
      c.tipo_suelo,
      COUNT(*) AS n_total
    FROM public.comparables_capturados c
    WHERE c.corte        = p_corte
      AND c.tipo_suelo   = 'terreno_vacante'
      AND c.microzona_id IS NOT NULL
      AND c.precio_total > 0
      AND c.superficie_total_m2 > 0
    GROUP BY c.microzona_id, c.tipo_suelo
  LOOP
    -- Precios unitarios ajustados
    WITH precios AS (
      SELECT
        (c.precio_total * COALESCE(c.factor_negociacion, 1.0) / c.superficie_total_m2) AS pu
      FROM public.comparables_capturados c
      WHERE c.corte        = p_corte
        AND c.tipo_suelo   = 'terreno_vacante'
        AND c.microzona_id = v_row.microzona_id
        AND c.precio_total > 0
        AND c.superficie_total_m2 > 0
    ),
    -- P25 y P75 para filtro IQR (solo cuando n >= 5)
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
      MIN(pu),
      MAX(pu),
      AVG(pu),
      STDDEV(pu),
      percentile_cont(0.50) WITHIN GROUP (ORDER BY pu),
      percentile_cont(0.25) WITHIN GROUP (ORDER BY pu),
      percentile_cont(0.75) WITHIN GROUP (ORDER BY pu)
    INTO
      v_n,
      v_stats.minimo,
      v_stats.maximo,
      v_stats.promedio,
      v_stats.desviacion,
      v_stats.mediana,
      v_p25,
      v_p75
    FROM filtrados;

    INSERT INTO public.suelo_valores (
      microzona_id, corte, tipo_suelo,
      n_comparables, minimo, maximo, promedio, mediana, desviacion,
      p25, p75, rango_inf, rango_sup,
      valor_recomendado, confiabilidad, metodo, calculado_at
    ) VALUES (
      v_row.microzona_id, p_corte, 'vt_v',
      v_n,
      ROUND(v_stats.minimo::numeric, 2),
      ROUND(v_stats.maximo::numeric, 2),
      ROUND(v_stats.promedio::numeric, 2),
      ROUND(v_stats.mediana::numeric, 2),
      ROUND(v_stats.desviacion::numeric, 2),
      ROUND(v_p25::numeric, 2),
      ROUND(v_p75::numeric, 2),
      ROUND(v_p25::numeric, 2),
      ROUND(v_p75::numeric, 2),
      ROUND(v_stats.mediana::numeric, 2),
      CASE WHEN v_n >= 6 THEN 'alta' WHEN v_n >= 3 THEN 'media' ELSE 'baja' END,
      'comparativo',
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

    v_count := v_count + 1;
    v_resumen := v_resumen || jsonb_build_object(
      'microzona_id', v_row.microzona_id, 'n', v_n,
      'mediana', ROUND(v_stats.mediana::numeric, 2)
    );
  END LOOP;

  RETURN jsonb_build_object(
    'corte', p_corte,
    'microzonas_procesadas', v_count,
    'detalle', to_jsonb(v_resumen)
  );
END;
$$;

REVOKE EXECUTE ON FUNCTION public.calcular_valores_corte(text) FROM PUBLIC, anon;
GRANT  EXECUTE ON FUNCTION public.calcular_valores_corte(text) TO authenticated;

-- ── 3. Trigger: asignación espacial de microzona y zona ───────
-- Cuando se guarda un comparable con coordenadas (geom), asigna
-- automáticamente microzona_id y zona_id por ST_Contains.

CREATE OR REPLACE FUNCTION public.asignar_zona_comparable()
RETURNS trigger
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public, extensions
AS $$
BEGIN
  IF NEW.geom IS NULL THEN
    RETURN NEW;
  END IF;

  -- Microzona
  IF NEW.microzona_id IS NULL THEN
    SELECT id INTO NEW.microzona_id
    FROM   public.suelo_microzonas
    WHERE  ST_Contains(geom, NEW.geom)
    LIMIT  1;
  END IF;

  -- Zona PMDU
  IF NEW.zona_id IS NULL THEN
    SELECT sz.id INTO NEW.zona_id
    FROM   public.suelo_zonas sz
    JOIN   public.suelo_instrumentos si ON si.id = sz.instrumento_id AND si.vigente = true
    WHERE  ST_Contains(sz.geom, NEW.geom)
    ORDER  BY si.fecha_publicacion DESC NULLS LAST
    LIMIT  1;
  END IF;

  -- Corte automático por fecha de captura si no se proporcionó
  IF NEW.corte IS NULL AND NEW.fecha_captura IS NOT NULL THEN
    NEW.corte := to_char(NEW.fecha_captura, 'YYYY') || '-'
              || CASE WHEN EXTRACT(MONTH FROM NEW.fecha_captura) <= 6 THEN '1' ELSE '2' END;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS tg_asignar_zona_comparable ON public.comparables_capturados;
CREATE TRIGGER tg_asignar_zona_comparable
  BEFORE INSERT OR UPDATE OF geom ON public.comparables_capturados
  FOR EACH ROW EXECUTE FUNCTION public.asignar_zona_comparable();

NOTIFY pgrst, 'reload schema';
