-- ============================================================
-- 39_tabulador_covinsa_ago2026.sql
-- Actualiza el tabulador de costos por m² con los precios
-- publicados por C.P. Ing. Arq. Ignacio López Fernández
-- para agosto de 2026.
-- ============================================================

-- 1. Marcar el tabulador anterior como inactivo
UPDATE public.costos_construccion_m2
SET activo = false,
    fecha_vigencia_fin = '2026-07-31'
WHERE fuente = 'COVINSA'
  AND activo = true;

-- 2. Insertar los nuevos precios agosto 2026
INSERT INTO public.costos_construccion_m2
  (fuente, clave, tipo, descripcion, precio_m2, tipo_inmueble, num_niveles_min, num_niveles_max, fecha_vigencia, notas)
VALUES
  ('COVINSA','ECO-L-PP','Económica',
   'Casa Habitación 1 Nivel: Sala, comedor, cocina, 1 baño y 2 recámaras. Con techo lámina y piso pulido.',
   8500,'Casa habitación',1,1,'2026-08-01',
   'Tabulador COVINSA agosto 2026 — C.P. Ing. Arq. Ignacio López Fernández'),

  ('COVINSA','ECO-L-PL','Económica',
   'Casa Habitación 1 Nivel: Sala, comedor, cocina, 1 baño y 2 recámaras. Con techo de lámina y piso loseta.',
   8800,'Casa habitación',1,1,'2026-08-01',
   'Tabulador COVINSA agosto 2026 — C.P. Ing. Arq. Ignacio López Fernández'),

  ('COVINSA','EIS-LC-PP','Económica Interés Social',
   'Casa Habitación 1-2 Niveles: Sala, comedor, cocina, 1 baño y 2 recámaras. Con techo losa de concreto y piso pulido.',
   11500,'Casa habitación',1,2,'2026-08-01',
   'Tabulador COVINSA agosto 2026 — C.P. Ing. Arq. Ignacio López Fernández'),

  ('COVINSA','EIS-LC-PL','Económica Interés Social',
   'Casa Habitación 1-2 Niveles: Sala, comedor, cocina, 1 baño y 2 recámaras. Con techo losa de concreto y piso loseta.',
   12500,'Casa habitación',1,2,'2026-08-01',
   'Tabulador COVINSA agosto 2026 — C.P. Ing. Arq. Ignacio López Fernández'),

  ('COVINSA','EIS-LC2B-PP','Económica Interés Social',
   'Casa Habitación 1-2 Niveles: Sala, comedor, cocina, 2 baños y 3 recámaras. Con techo losa de concreto y piso pulido.',
   13500,'Casa habitación',1,2,'2026-08-01',
   'Tabulador COVINSA agosto 2026 — C.P. Ing. Arq. Ignacio López Fernández'),

  ('COVINSA','EIS-LC2B-PL','Económica Interés Social',
   'Casa Habitación 1-2 Niveles: Sala, comedor, cocina, 2 baños y 3 recámaras. Con techo losa de concreto y piso loseta.',
   14500,'Casa habitación',1,2,'2026-08-01',
   'Tabulador COVINSA agosto 2026 — C.P. Ing. Arq. Ignacio López Fernández'),

  ('COVINSA','ISM-3R','Interés Social Media',
   'Casa Habitación 2 Niveles: Sala, comedor, cocina, 2 1/2 baños, 3 recámaras y cuarto de lavado.',
   14800,'Casa habitación',2,2,'2026-08-01',
   'Tabulador COVINSA agosto 2026 — C.P. Ing. Arq. Ignacio López Fernández'),

  ('COVINSA','ISM-4R','Interés Social Media',
   'Casa Habitación 2 Niveles: Sala, comedor, cocina, 2 1/2 baños, 4 recámaras y cuarto de lavado.',
   16000,'Casa habitación',2,2,'2026-08-01',
   'Tabulador COVINSA agosto 2026 — C.P. Ing. Arq. Ignacio López Fernández'),

  ('COVINSA','DIS-2R','Departamento Interés Social',
   'Departamento en condominio: Sala, comedor, cocina, 1 baño, 2 recámaras y área de lavado.',
   11500,'Departamento',null,null,'2026-08-01',
   'Tabulador COVINSA agosto 2026 — C.P. Ing. Arq. Ignacio López Fernández'),

  ('COVINSA','DIS-3R','Departamento Interés Social',
   'Departamento en condominio: Sala, comedor, cocina, 1 baño, 3 recámaras y área de lavado.',
   12500,'Departamento',null,null,'2026-08-01',
   'Tabulador COVINSA agosto 2026 — C.P. Ing. Arq. Ignacio López Fernández'),

  ('COVINSA','DIM-3R','Departamento Interés Medio',
   'Departamento en condominio: Sala, comedor, cocina, 2 baños, 3 recámaras y cuarto de lavado.',
   13200,'Departamento',null,null,'2026-08-01',
   'Tabulador COVINSA agosto 2026 — C.P. Ing. Arq. Ignacio López Fernández');
