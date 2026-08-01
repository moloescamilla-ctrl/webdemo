-- =====================================================================
-- 17_compartidos.sql
-- Tabla de enlaces de revisión compartida + comentarios
-- Ejecutar en Supabase SQL Editor
-- =====================================================================

-- Tabla de enlaces compartidos
CREATE TABLE IF NOT EXISTS compartidos (
  id           UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  expediente_id UUID        NOT NULL REFERENCES expedientes(id) ON DELETE CASCADE,
  token        TEXT        UNIQUE NOT NULL DEFAULT encode(gen_random_bytes(16), 'hex'),
  creado_por   UUID        NOT NULL REFERENCES auth.users(id),
  expira_en    TIMESTAMPTZ NOT NULL DEFAULT NOW() + INTERVAL '10 days',
  activo       BOOLEAN     NOT NULL DEFAULT true,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE compartidos ENABLE ROW LEVEL SECURITY;

-- El perito dueño puede hacer todo sobre sus propios enlaces
CREATE POLICY "owner_all" ON compartidos
  FOR ALL TO authenticated
  USING (creado_por = auth.uid())
  WITH CHECK (creado_por = auth.uid());

-- ─────────────────────────────────────────────────────────────────────

-- Tabla de comentarios de revisión
CREATE TABLE IF NOT EXISTS comentarios_revision (
  id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  expediente_id UUID        NOT NULL REFERENCES expedientes(id) ON DELETE CASCADE,
  compartido_id UUID        NOT NULL REFERENCES compartidos(id) ON DELETE CASCADE,
  autor_id      UUID        NOT NULL REFERENCES auth.users(id),
  contenido     TEXT        NOT NULL CHECK (length(trim(contenido)) > 0),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE comentarios_revision ENABLE ROW LEVEL SECURITY;

-- El dueño del expediente puede leer todos los comentarios
CREATE POLICY "perito_reads_comments" ON comentarios_revision
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM expedientes e
      WHERE e.id = expediente_id AND e.perito_id = auth.uid()
    )
  );

-- El autor puede leer sus propios comentarios
CREATE POLICY "author_reads_own" ON comentarios_revision
  FOR SELECT TO authenticated
  USING (autor_id = auth.uid());

-- ─────────────────────────────────────────────────────────────────────
-- Funciones RPC (SECURITY DEFINER — bypasan RLS de forma controlada)
-- ─────────────────────────────────────────────────────────────────────

-- 1. Obtener todos los datos del expediente validando el token
CREATE OR REPLACE FUNCTION obtener_expediente_compartido(p_token TEXT)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_compartido compartidos%ROWTYPE;
  v_result     JSON;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'No autenticado';
  END IF;

  SELECT * INTO v_compartido
  FROM compartidos
  WHERE token = p_token AND activo = true AND expira_en > NOW();

  IF v_compartido.id IS NULL THEN
    RAISE EXCEPTION 'Enlace invalido o expirado';
  END IF;

  SELECT json_build_object(
    'compartido', json_build_object(
      'id',        v_compartido.id,
      'token',     v_compartido.token,
      'expira_en', v_compartido.expira_en
    ),
    'expediente',            (SELECT row_to_json(e)  FROM expedientes e             WHERE e.id = v_compartido.expediente_id),
    'entorno',               (SELECT row_to_json(en) FROM entorno_inmueble en       WHERE en.expediente_id = v_compartido.expediente_id),
    'terreno',               (SELECT row_to_json(t)  FROM caracteristicas_terreno t WHERE t.expediente_id = v_compartido.expediente_id),
    'descripcionConstruccion',(SELECT row_to_json(d)  FROM descripcion_construccion d WHERE d.expediente_id = v_compartido.expediente_id),
    'inspeccion',            (SELECT row_to_json(i)  FROM inspecciones_fisicas i    WHERE i.expediente_id = v_compartido.expediente_id),
    'metodoFisico',          (SELECT row_to_json(mf) FROM metodos_fisicos mf        WHERE mf.expediente_id = v_compartido.expediente_id),
    'metodoComparativo',     (SELECT row_to_json(mc) FROM metodos_comparativos mc   WHERE mc.expediente_id = v_compartido.expediente_id),
    'metodoRentas',          (SELECT row_to_json(mr) FROM metodos_rentas mr         WHERE mr.expediente_id = v_compartido.expediente_id),
    'metodoResidual',        (SELECT row_to_json(mres) FROM metodos_residual mres   WHERE mres.expediente_id = v_compartido.expediente_id),
    'fotos',                 (SELECT COALESCE(json_agg(f ORDER BY f.orden), '[]'::json) FROM fotos_expediente f WHERE f.expediente_id = v_compartido.expediente_id)
  ) INTO v_result;

  RETURN v_result;
END;
$$;

-- 2. Obtener comentarios de un enlace
CREATE OR REPLACE FUNCTION obtener_comentarios_compartido(p_token TEXT)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_compartido_id UUID;
  v_result        JSON;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'No autenticado';
  END IF;

  SELECT id INTO v_compartido_id
  FROM compartidos
  WHERE token = p_token AND activo = true AND expira_en > NOW();

  IF v_compartido_id IS NULL THEN
    RAISE EXCEPTION 'Enlace invalido o expirado';
  END IF;

  SELECT COALESCE(json_agg(
    json_build_object(
      'id',        c.id,
      'contenido', c.contenido,
      'autor_id',  c.autor_id,
      'created_at', c.created_at
    ) ORDER BY c.created_at ASC
  ), '[]'::json) INTO v_result
  FROM comentarios_revision c
  WHERE c.compartido_id = v_compartido_id;

  RETURN v_result;
END;
$$;

-- 3. Agregar un comentario usando el token
CREATE OR REPLACE FUNCTION agregar_comentario_revision(p_token TEXT, p_contenido TEXT)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_compartido  compartidos%ROWTYPE;
  v_comentario  comentarios_revision%ROWTYPE;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'No autenticado';
  END IF;

  IF trim(p_contenido) = '' THEN
    RAISE EXCEPTION 'El comentario no puede estar vacio';
  END IF;

  SELECT * INTO v_compartido
  FROM compartidos
  WHERE token = p_token AND activo = true AND expira_en > NOW();

  IF v_compartido.id IS NULL THEN
    RAISE EXCEPTION 'Enlace invalido o expirado';
  END IF;

  INSERT INTO comentarios_revision (expediente_id, compartido_id, autor_id, contenido)
  VALUES (v_compartido.expediente_id, v_compartido.id, auth.uid(), trim(p_contenido))
  RETURNING * INTO v_comentario;

  RETURN json_build_object(
    'id',        v_comentario.id,
    'contenido', v_comentario.contenido,
    'autor_id',  v_comentario.autor_id,
    'created_at', v_comentario.created_at
  );
END;
$$;

-- Notificar a PostgREST del nuevo schema
NOTIFY pgrst, 'reload schema';
