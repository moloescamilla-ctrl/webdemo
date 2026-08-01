-- =====================================================================
-- 18_revision_pares.sql
-- Módulo de revisión entre pares (reemplaza el sistema token/compartidos)
-- Ejecutar en Supabase SQL Editor
-- =====================================================================

-- Eliminar esquema anterior de comentarios basado en tokens
DROP TABLE IF EXISTS comentarios_revision CASCADE;

-- ── Tabla: revisiones_expediente ──────────────────────────────────────
CREATE TABLE IF NOT EXISTS revisiones_expediente (
  id                 UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  expediente_id      UUID        NOT NULL REFERENCES expedientes(id) ON DELETE CASCADE,
  autor_id           UUID        NOT NULL REFERENCES auth.users(id),
  revisor_id         UUID        NOT NULL REFERENCES auth.users(id),
  estado             TEXT        NOT NULL DEFAULT 'activa'
                     CHECK (estado IN ('activa', 'cerrada')),
  mensaje_invitacion TEXT,
  fecha_invitacion   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  fecha_apertura     TIMESTAMPTZ,
  fecha_cierre       TIMESTAMPTZ,
  UNIQUE (expediente_id, revisor_id)
);

ALTER TABLE revisiones_expediente ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "autor_gestiona_revision"    ON revisiones_expediente;
DROP POLICY IF EXISTS "revisor_ve_invitacion"      ON revisiones_expediente;
DROP POLICY IF EXISTS "revisor_actualiza_apertura" ON revisiones_expediente;

CREATE POLICY "autor_gestiona_revision" ON revisiones_expediente
  FOR ALL TO authenticated
  USING  (autor_id = auth.uid())
  WITH CHECK (autor_id = auth.uid());

CREATE POLICY "revisor_ve_invitacion" ON revisiones_expediente
  FOR SELECT TO authenticated
  USING (revisor_id = auth.uid());

CREATE POLICY "revisor_actualiza_apertura" ON revisiones_expediente
  FOR UPDATE TO authenticated
  USING  (revisor_id = auth.uid())
  WITH CHECK (revisor_id = auth.uid());

-- ── Tabla: comentarios_revision (nuevo esquema por sección) ──────────
CREATE TABLE comentarios_revision (
  id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  expediente_id   UUID        NOT NULL REFERENCES expedientes(id) ON DELETE CASCADE,
  revision_id     UUID        REFERENCES revisiones_expediente(id) ON DELETE SET NULL,
  revisor_id      UUID        NOT NULL REFERENCES auth.users(id),
  seccion         TEXT        NOT NULL DEFAULT 'general',
  campo           TEXT,
  texto           TEXT        NOT NULL CHECK (length(trim(texto)) > 0),
  estado          TEXT        NOT NULL DEFAULT 'pendiente'
                  CHECK (estado IN ('pendiente', 'atendido')),
  respuesta_autor TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE comentarios_revision ENABLE ROW LEVEL SECURITY;

-- El autor del expediente ve todos los comentarios y puede actualizarlos
CREATE POLICY "autor_ve_comentarios" ON comentarios_revision
  FOR ALL TO authenticated
  USING (expediente_id IN (
    SELECT id FROM expedientes WHERE perito_id = auth.uid()
  ))
  WITH CHECK (expediente_id IN (
    SELECT id FROM expedientes WHERE perito_id = auth.uid()
  ));

-- El revisor crea y gestiona sus propios comentarios
CREATE POLICY "revisor_gestiona_comentarios" ON comentarios_revision
  FOR ALL TO authenticated
  USING  (revisor_id = auth.uid())
  WITH CHECK (revisor_id = auth.uid());

-- ── Acceso de lectura al expediente para revisores invitados ──────────
DROP POLICY IF EXISTS "revisor_lee_expediente" ON expedientes;
CREATE POLICY "revisor_lee_expediente" ON expedientes
  FOR SELECT TO authenticated
  USING (
    id IN (
      SELECT expediente_id FROM revisiones_expediente
      WHERE revisor_id = auth.uid()
        AND estado IN ('activa', 'cerrada')
    )
  );

-- Aplicar política de lectura a cada tabla relacionada del expediente
DO $$
DECLARE
  tbl TEXT;
  tbls TEXT[] := ARRAY[
    'entorno_inmueble', 'caracteristicas_terreno', 'descripcion_construccion',
    'inspecciones_fisicas', 'metodos_fisicos', 'metodos_comparativos',
    'metodos_rentas', 'metodos_residual', 'fotos_expediente'
  ];
BEGIN
  FOREACH tbl IN ARRAY tbls LOOP
    IF EXISTS (
      SELECT 1 FROM information_schema.tables
      WHERE table_schema = 'public' AND table_name = tbl
    ) THEN
      EXECUTE format('DROP POLICY IF EXISTS "revisor_lee_%s" ON %I', tbl, tbl);
      EXECUTE format(
        'CREATE POLICY "revisor_lee_%s" ON %I FOR SELECT TO authenticated
         USING (expediente_id IN (
           SELECT expediente_id FROM revisiones_expediente
           WHERE revisor_id = auth.uid()
             AND estado IN (''activa'', ''cerrada'')
         ))',
        tbl, tbl
      );
    END IF;
  END LOOP;
END;
$$;

-- ── Función: buscar usuarios para invitar ─────────────────────────────
CREATE OR REPLACE FUNCTION buscar_usuarios_revision(p_query TEXT)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'No autenticado';
  END IF;
  IF length(trim(p_query)) < 2 THEN
    RETURN '[]'::json;
  END IF;
  RETURN (
    SELECT COALESCE(json_agg(r ORDER BY r.email), '[]'::json)
    FROM (
      SELECT
        u.id,
        u.email,
        COALESCE(
          u.raw_user_meta_data->>'nombre_perito',
          split_part(u.email, '@', 1)
        ) AS nombre
      FROM auth.users u
      WHERE u.id != auth.uid()
        AND u.email_confirmed_at IS NOT NULL
        AND (
          u.email ILIKE '%' || trim(p_query) || '%'
          OR u.raw_user_meta_data->>'nombre_perito' ILIKE '%' || trim(p_query) || '%'
        )
      LIMIT 10
    ) r
  );
END;
$$;

NOTIFY pgrst, 'reload schema';
