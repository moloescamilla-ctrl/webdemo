-- Renombrar fuente 'ABBA' → 'COVINSA' en tabulador de costos y registros relacionados
UPDATE costos_construccion_m2
  SET fuente = 'COVINSA',
      notas  = replace(notas, 'ABBA', 'COVINSA')
  WHERE fuente = 'ABBA';

UPDATE metodos_fisicos
  SET costo_m2_fuente = 'COVINSA'
  WHERE costo_m2_fuente = 'ABBA';

NOTIFY pgrst, 'reload schema';
