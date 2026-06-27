-- ══════════════════════════════════════════════════════════
-- Fase C: campos adicionales en todos los módulos
-- ══════════════════════════════════════════════════════════

-- ── expedientes: datos generales ─────────────────────────
ALTER TABLE expedientes
  ADD COLUMN IF NOT EXISTS nombre_propietario   text,
  ADD COLUMN IF NOT EXISTS nombre_perito        text,
  ADD COLUMN IF NOT EXISTS clave_perito         text,
  ADD COLUMN IF NOT EXISTS cedula_perito        text,
  ADD COLUMN IF NOT EXISTS proposito_avaluo     text,
  ADD COLUMN IF NOT EXISTS numero_oficial       text,
  ADD COLUMN IF NOT EXISTS fraccionamiento      text,
  ADD COLUMN IF NOT EXISTS municipio_clave_inegi text,
  ADD COLUMN IF NOT EXISTS estado_clave_inegi   text,
  ADD COLUMN IF NOT EXISTS num_cuenta_predial   text,
  ADD COLUMN IF NOT EXISTS num_cuenta_agua      text;

-- ── entorno_inmueble: clasificación del entorno ──────────
ALTER TABLE entorno_inmueble
  ADD COLUMN IF NOT EXISTS tipo_construccion_predominante text,
  ADD COLUMN IF NOT EXISTS contaminacion_ambiental        text,
  ADD COLUMN IF NOT EXISTS vias_acceso                    text,
  ADD COLUMN IF NOT EXISTS referencia_proximidad          text;

-- ── caracteristicas_terreno: datos registrales + condominio ──
ALTER TABLE caracteristicas_terreno
  ADD COLUMN IF NOT EXISTS ciudad             text,
  ADD COLUMN IF NOT EXISTS fecha_escritura    date,
  ADD COLUMN IF NOT EXISTS nombre_notario     text,
  ADD COLUMN IF NOT EXISTS indiviso           numeric,
  ADD COLUMN IF NOT EXISTS area_privativa_m2  numeric,
  ADD COLUMN IF NOT EXISTS sup_accesoria_m2   numeric,
  ADD COLUMN IF NOT EXISTS sup_planta_baja_m2 numeric,
  ADD COLUMN IF NOT EXISTS sup_total_const_m2 numeric;

-- ── descripcion_construccion ─────────────────────────────
CREATE TABLE IF NOT EXISTS descripcion_construccion (
  id                              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  expediente_id                   uuid UNIQUE REFERENCES expedientes(id) ON DELETE CASCADE,
  uso_actual                      text,
  condicion                       text CHECK (condicion IN ('nueva', 'usada')),
  num_recamaras                   integer,
  banos_completos                 integer,
  medios_banos                    integer,
  estacionamientos_descubiertos   integer,
  estacionamientos_cubiertos      integer,
  elevador                        boolean DEFAULT false,
  num_niveles                     integer,
  superficie_vendible_m2          numeric,
  observaciones                   text,
  created_at                      timestamptz DEFAULT now()
);

ALTER TABLE descripcion_construccion ENABLE ROW LEVEL SECURITY;

CREATE POLICY "perito_own_descripcion_construccion" ON descripcion_construccion
  FOR ALL TO authenticated
  USING (
    expediente_id IN (SELECT id FROM expedientes WHERE perito_id = auth.uid())
  )
  WITH CHECK (
    expediente_id IN (SELECT id FROM expedientes WHERE perito_id = auth.uid())
  );

-- Forzar recarga del schema cache de PostgREST
NOTIFY pgrst, 'reload schema';
