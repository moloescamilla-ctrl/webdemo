-- ============================================================
-- 26_fix_estado_check_constraint.sql
-- La tabla expedientes tiene un CHECK constraint que no incluye
-- el valor 'archivado', causando que el UPDATE falle con:
--   "violates check constraint expedientes_estado_check"
-- Este script elimina el constraint restrictivo y lo recrea
-- incluyendo todos los valores válidos.
-- ============================================================

-- 1. Eliminar constraint existente
ALTER TABLE public.expedientes
  DROP CONSTRAINT IF EXISTS expedientes_estado_check;

-- 2. Recrear incluyendo 'archivado'
ALTER TABLE public.expedientes
  ADD CONSTRAINT expedientes_estado_check
  CHECK (estado IN ('borrador', 'en_proceso', 'completado', 'firmado', 'archivado'));

-- 3. Verificar
SELECT conname, pg_get_constraintdef(oid) AS definicion
FROM pg_constraint
WHERE conrelid = 'public.expedientes'::regclass
  AND contype = 'c';

NOTIFY pgrst, 'reload schema';
