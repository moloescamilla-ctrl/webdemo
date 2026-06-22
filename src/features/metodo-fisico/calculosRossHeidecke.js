export const ESTADOS_HEIDECKE = [
  { id: 1, nombre: 'Óptimo',      descripcion: 'Nuevo o recién remodelado, sin deterioro visible',       c: 0.000 },
  { id: 2, nombre: 'Muy Bueno',   descripcion: 'Excelente estado, mantenimiento preventivo constante',   c: 0.032 },
  { id: 3, nombre: 'Bueno',       descripcion: 'Buen estado general, deterioro mínimo por uso normal',   c: 0.105 },
  { id: 4, nombre: 'Intermedio',  descripcion: 'Estado aceptable, requiere mantenimiento menor pronto',   c: 0.222 },
  { id: 5, nombre: 'Regular',     descripcion: 'Deterioro visible, requiere reparaciones importantes',    c: 0.472 },
  { id: 6, nombre: 'Malo',        descripcion: 'Deterioro significativo, requiere reparaciones urgentes', c: 0.661 },
  { id: 7, nombre: 'Muy Malo',    descripcion: 'Gran deterioro estructural, uso muy limitado',            c: 0.869 },
  { id: 8, nombre: 'Pésimo',      descripcion: 'Casi inhabitable, riesgo estructural inminente',          c: 0.950 },
]

export const PARTIDAS_INSPECCION = [
  { id: 'cimentacion',  nombre: 'Cimentación',             peso: 0.15 },
  { id: 'estructura',   nombre: 'Estructura',               peso: 0.15 },
  { id: 'muros',        nombre: 'Muros y acabados',         peso: 0.12 },
  { id: 'techos',       nombre: 'Techos / Losa',            peso: 0.12 },
  { id: 'pisos',        nombre: 'Pisos y recubrimientos',   peso: 0.08 },
  { id: 'electricidad', nombre: 'Instalación eléctrica',    peso: 0.08 },
  { id: 'hidraulica',   nombre: 'Instalación hidráulica',   peso: 0.08 },
  { id: 'sanitaria',    nombre: 'Instalación sanitaria',    peso: 0.08 },
  { id: 'carpinteria',  nombre: 'Carpintería',              peso: 0.05 },
  { id: 'herreria',     nombre: 'Herrería y cancelería',    peso: 0.04 },
  { id: 'pintura',      nombre: 'Pintura y acabados finos', peso: 0.03 },
  { id: 'fachada',      nombre: 'Fachada',                  peso: 0.02 },
]

export const ESTADOS_PARTIDA = [
  { valor: 0, etiqueta: 'Óptimo',  penalizacion: 0.0 },
  { valor: 1, etiqueta: 'Bueno',   penalizacion: 0.5 },
  { valor: 2, etiqueta: 'Regular', penalizacion: 1.5 },
  { valor: 3, etiqueta: 'Malo',    penalizacion: 2.5 },
  { valor: 4, etiqueta: 'Pésimo',  penalizacion: 4.0 },
]

export function calcularHeideckeDesdeChecklist(estados) {
  let puntajePonderado = 0
  for (const partida of PARTIDAS_INSPECCION) {
    const valorEstado = estados[partida.id] ?? 0
    const estadoPartida = ESTADOS_PARTIDA.find(e => e.valor === Number(valorEstado))
    puntajePonderado += (estadoPartida?.penalizacion ?? 0) * partida.peso
  }
  let estadoHeidecke
  if (puntajePonderado < 0.05)       estadoHeidecke = ESTADOS_HEIDECKE[0]
  else if (puntajePonderado < 0.15)  estadoHeidecke = ESTADOS_HEIDECKE[1]
  else if (puntajePonderado < 0.50)  estadoHeidecke = ESTADOS_HEIDECKE[2]
  else if (puntajePonderado < 1.00)  estadoHeidecke = ESTADOS_HEIDECKE[3]
  else if (puntajePonderado < 1.80)  estadoHeidecke = ESTADOS_HEIDECKE[4]
  else if (puntajePonderado < 2.50)  estadoHeidecke = ESTADOS_HEIDECKE[5]
  else if (puntajePonderado < 3.20)  estadoHeidecke = ESTADOS_HEIDECKE[6]
  else                                estadoHeidecke = ESTADOS_HEIDECKE[7]
  return { puntaje: puntajePonderado, estadoHeidecke, coeficienteC: estadoHeidecke.c }
}

export function calcularFactorRoss(edadAnios, vidaUtilAnios) {
  if (!vidaUtilAnios || vidaUtilAnios <= 0) return 0
  return Math.min(edadAnios / vidaUtilAnios, 1)
}

export function calcularRossHeidecke(vr, r, a, c) {
  const factorDepreciacion = (1 - r) * (a + (1 - a) * c)
  const va = vr * (1 - factorDepreciacion)
  const depreciacion = vr - va
  return {
    va: Math.max(va, 0),
    depreciacion: Math.max(depreciacion, 0),
    porcentajeDepreciacion: Math.min((depreciacion / vr) * 100, 100),
    factorDepreciacion,
  }
}

export function calcularMetodoFisico({ superficieConstruccion, superficieTerreno, costoReposicionM2, valorUnitarioTerreno, edadAnios, vidaUtilAnios, valorResidual = 0.15, coeficienteC }) {
  const vr = superficieConstruccion * costoReposicionM2
  const valorTerreno = superficieTerreno * valorUnitarioTerreno
  const factorA = calcularFactorRoss(edadAnios, vidaUtilAnios)
  const { va, depreciacion, porcentajeDepreciacion, factorDepreciacion } = calcularRossHeidecke(vr, valorResidual, factorA, coeficienteC)
  return {
    valorReposicionNuevo: vr,
    valorTerreno,
    factorA,
    depreciacion,
    porcentajeDepreciacion,
    factorDepreciacion,
    valorActualConstruccion: va,
    valorFisicoTotal: valorTerreno + va,
  }
}
