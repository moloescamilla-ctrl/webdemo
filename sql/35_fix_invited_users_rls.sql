-- ============================================================
-- 35_fix_invited_users_rls.sql
-- 1. Backfill de perfiles para usuarios invitados sin profile
-- 2. Política RLS que permite a revisores leer expedientes
--    que les fueron asignados para revisar
-- ============================================================

-- ── 1. Backfill: crear profiles para auth users que no tienen ──

INSERT INTO public.profiles (id, email, nombre, plan, limite_expedientes_mes)
SELECT
  u.id,
  u.email,
  u.raw_user_meta_data->>'nombre_perito',
  'prueba',
  3
FROM auth.users u
WHERE NOT EXISTS (
  SELECT 1 FROM public.profiles p WHERE p.id = u.id
)
ON CONFLICT (id) DO NOTHING;

-- ── 2. RLS: revisores pueden leer expedientes asignados ────────

DROP POLICY IF EXISTS "revisores_pueden_leer" ON public.expedientes;

CREATE POLICY "revisores_pueden_leer" ON public.expedientes
  FOR SELECT TO authenticated
  USING (
    id IN (
      SELECT expediente_id
      FROM public.revisiones_expediente
      WHERE revisor_id = auth.uid()
        AND estado IN ('activa', 'cerrada')
    )
  );

NOTIFY pgrst, 'reload schema';
