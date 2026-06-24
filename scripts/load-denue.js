#!/usr/bin/env node
/**
 * load-denue.js — Carga el CSV del DENUE (INEGI) a Supabase.
 *
 * Uso:
 *   SUPABASE_URL=https://xxx.supabase.co \
 *   SUPABASE_SERVICE_KEY=eyJ... \
 *   node scripts/load-denue.js /ruta/al/denue.csv
 *
 * El CSV del DENUE se descarga en:
 *   https://www.inegi.org.mx/app/descarga/?ti=6
 *   (Directorio Estadístico Nacional de Unidades Económicas → CSV por entidad)
 *
 * Columnas requeridas del CSV (encabezados exactos INEGI):
 *   clee, nom_estab, codigo_act, nombre_act, municipio, entidad, latitud, longitud
 *
 * El script:
 *   1. Lee el CSV línea a línea (streaming) para evitar cargar todo en RAM.
 *   2. Filtra únicamente los SCIAN relevantes: 611, 622, 522, 461, 813.
 *   3. Inserta en lotes de 500 registros (upsert por clee).
 *   4. Genera el punto geography a partir de latitud/longitud.
 */

import fs from 'node:fs'
import readline from 'node:readline'
import path from 'node:path'
import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL        = process.env.SUPABASE_URL
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY
const CSV_PATH            = process.argv[2]

const SCIAN_PREFIXES = ['611', '622', '522', '461', '813']
const BATCH_SIZE     = 500

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('ERROR: Falta SUPABASE_URL o SUPABASE_SERVICE_KEY')
  process.exit(1)
}
if (!CSV_PATH) {
  console.error('ERROR: Proporciona la ruta al CSV como primer argumento')
  process.exit(1)
}
if (!fs.existsSync(CSV_PATH)) {
  console.error(`ERROR: No se encontró el archivo: ${CSV_PATH}`)
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
  auth: { persistSession: false },
})

async function flush(batch) {
  const { error } = await supabase
    .from('denue_establecimientos')
    .upsert(batch, { onConflict: 'clee', ignoreDuplicates: false })
  if (error) throw new Error(`Supabase error: ${error.message}`)
}

async function main() {
  const fileStream = fs.createReadStream(CSV_PATH)
  const rl = readline.createInterface({ input: fileStream, crlfDelay: Infinity })

  let headers = null
  let batch   = []
  let total   = 0
  let skipped = 0

  for await (const line of rl) {
    if (!line.trim()) continue

    if (!headers) {
      // Primera línea: encabezados
      headers = line.split(',').map(h => h.trim().toLowerCase().replace(/^"|"$/g, ''))
      console.log(`Columnas detectadas: ${headers.join(', ')}`)
      continue
    }

    const values = parseCsvLine(line)
    if (values.length !== headers.length) { skipped++; continue }

    const row = {}
    headers.forEach((h, i) => { row[h] = values[i] })

    const codigo = row['codigo_act'] || row['codigo act'] || ''
    const relevant = SCIAN_PREFIXES.some(p => codigo.startsWith(p))
    if (!relevant) continue

    const lat = parseFloat(row['latitud'])
    const lng = parseFloat(row['longitud'])
    if (isNaN(lat) || isNaN(lng)) { skipped++; continue }

    batch.push({
      clee:       row['clee']       || null,
      nom_estab:  row['nom_estab']  || row['razon_social'] || null,
      codigo_act: codigo,
      nombre_act: row['nombre_act'] || null,
      municipio:  row['municipio']  || null,
      entidad:    row['entidad']    || null,
      latitud:    lat,
      longitud:   lng,
      // Supabase acepta WKT o GeoJSON como geography
      geom:       `POINT(${lng} ${lat})`,
    })

    if (batch.length >= BATCH_SIZE) {
      await flush(batch)
      total += batch.length
      process.stdout.write(`\rInsertados: ${total.toLocaleString()}`)
      batch = []
    }
  }

  if (batch.length) {
    await flush(batch)
    total += batch.length
  }

  console.log(`\n\nListo. Total insertados: ${total.toLocaleString()}  |  Omitidos: ${skipped.toLocaleString()}`)
}

function parseCsvLine(line) {
  const result = []
  let current  = ''
  let inQuotes = false

  for (let i = 0; i < line.length; i++) {
    const ch = line[i]
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') { current += '"'; i++ }
      else { inQuotes = !inQuotes }
    } else if (ch === ',' && !inQuotes) {
      result.push(current.trim())
      current = ''
    } else {
      current += ch
    }
  }
  result.push(current.trim())
  return result
}

main().catch(err => { console.error('\nERROR:', err.message); process.exit(1) })
