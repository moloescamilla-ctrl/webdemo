-- ============================================================
-- 32_admin_panel.sql
-- Panel de administración: roles, planes y gestión de usuarios
-- ============================================================

-- ── 1. Columnas adicionales en profiles ──────────────────────

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS role                 text        NOT NULL DEFAULT 'perito'
    CHECK (role IN ('superadmin', 'admin', 'perito')),
  ADD COLUMN IF NOT EXISTS activo               boolean     NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS plan                 text        NOT NULL DEFAULT 'basico'
    CHECK (plan IN ('basico', 'profesional', 'empresa')),
  ADD COLUMN IF NOT EXISTS plan_expira_at       timestamptz,
  ADD COLUMN IF NOT EXISTS limite_expedientes_mes int       NOT NULL DEFAULT 50;

-- ── 2. Promover al superadmin de producción ──────────────────

UPDATE public.profiles
SET role = 'superadmin'
WHERE email = 'moloescamilla@gmail.com';

-- ── 3. Política RLS: admin puede actualizar cualquier perfil ─

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'profiles' AND policyname = 'admin_update_any_profile'
  ) THEN
    CREATE POLICY "admin_update_any_profile" ON public.profiles
      FOR UPDATE TO authenticated
      USING (
        (SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('admin', 'superadmin')
      )
      WITH CHECK (
        (SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('admin', 'superadmin')
      );
  END IF;
END $$;

-- ── 4. Función admin: actualizar usuario ─────────────────────
-- Solo accessible para admin/superadmin (validado dentro de la función).
-- Un admin no puede escalar a superadmin ni modificar a otro superadmin
-- (solo superadmin puede hacerlo).

CREATE OR REPLACE FUNCTION public.admin_update_usuario(
  p_user_id               uuid,
  p_role                  text    DEFAULT NULL,
  p_activo                boolean DEFAULT NULL,
  p_plan                  text    DEFAULT NULL,
  p_limite_expedientes    int     DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
VOLATILE
SECURITY INVOKER
SET search_path = public
AS $$
DECLARE
  v_caller_role text;
  v_target_role text;
BEGIN
  SELECT role INTO v_caller_role
  FROM public.profiles WHERE id = auth.uid();

  IF v_caller_role NOT IN ('admin', 'superadmin') THEN
    RAISE EXCEPTION 'Acceso denegado: se requiere rol admin o superadmin';
  END IF;

  SELECT role INTO v_target_role
  FROM public.profiles WHERE id = p_user_id;

  -- Un admin no puede tocar a un superadmin ni asignar superadmin
  IF v_caller_role = 'admin' AND (
    v_target_role = 'superadmin' OR p_role = 'superadmin'
  ) THEN
    RAISE EXCEPTION 'Sin permiso para modificar cuentas superadmin';
  END IF;

  UPDATE public.profiles SET
    role                   = COALESCE(p_role,               role),
    activo                 = COALESCE(p_activo,             activo),
    plan                   = COALESCE(p_plan,               plan),
    limite_expedientes_mes = COALESCE(p_limite_expedientes, limite_expedientes_mes)
  WHERE id = p_user_id;

  RETURN jsonb_build_object('ok', true, 'user_id', p_user_id);
END;
$$;

REVOKE EXECUTE ON FUNCTION public.admin_update_usuario(uuid, text, boolean, text, int) FROM PUBLIC, anon;
GRANT  EXECUTE ON FUNCTION public.admin_update_usuario(uuid, text, boolean, text, int) TO authenticated;

NOTIFY pgrst, 'reload schema';
