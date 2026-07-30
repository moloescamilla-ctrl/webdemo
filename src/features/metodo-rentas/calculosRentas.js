/**
 * Calcula la Renta Neta Anual depurando la renta bruta.
 * RNA = (RBA × (1 − vacancia%)) × (1 − gastos%)
 */
export function calcularRNA({ rentaMensualBruta, vacanciaPct, gastosOperacionPct }) {
  const rba = rentaMensualBruta * 12
  const perdidaVacancia = rba * (vacanciaPct / 100)
  const rea = rba - perdidaVacancia
  const gastosOperacionPesos = rea * (gastosOperacionPct / 100)
  const rna = rea - gastosOperacionPesos
  return { rba, perdidaVacancia, rea, gastosOperacionPesos, rna }
}

/**
 * Construye la TC sumando sus componentes individuales.
 * TC = i + r + iliq + d + g
 */
export function calcularTCComponentes({
  tasaLibreRiesgo,
  primaRiesgoInmueble,
  primaIliquidez,
  depreciacion,
  gastosNoRecuperables,
}) {
  const tc = tasaLibreRiesgo + primaRiesgoInmueble + primaIliquidez + depreciacion + gastosNoRecuperables
  return parseFloat(tc.toFixed(4))
}

/**
 * Capitalización directa: VC = RNA / (TC/100)
 */
export function calcularVCDirecta({ rna, tcPct }) {
  if (!rna || !tcPct) return null
  return rna / (tcPct / 100)
}

/**
 * Capitalización por componentes tierra/construcción.
 * TC_tierra excluye depreciación y gastos no recuperables (la tierra no se deprecia).
 */
export function calcularVCComponentes({
  rna,
  proporcionTierraPct,
  tasaLibreRiesgo,
  primaRiesgoInmueble,
  primaIliquidez,
  depreciacion,
  gastosNoRecuperables,
}) {
  const propT = proporcionTierraPct / 100
  const propC = 1 - propT

  const tcTierra = tasaLibreRiesgo + primaRiesgoInmueble + primaIliquidez
  const tcConstruccion = tasaLibreRiesgo + primaRiesgoInmueble + primaIliquidez + depreciacion + gastosNoRecuperables

  const rnaTierra = rna * propT
  const rnaConstruccion = rna * propC

  const valorTierra = rnaTierra / (tcTierra / 100)
  const valorConstruccion = rnaConstruccion / (tcConstruccion / 100)

  return {
    tcTierra: parseFloat(tcTierra.toFixed(4)),
    tcConstruccion: parseFloat(tcConstruccion.toFixed(4)),
    valorTierra,
    valorConstruccion,
    valorTotal: valorTierra + valorConstruccion,
  }
}

/**
 * Homologación de rentas comparables.
 * Renta unitaria homologada = (renta/sup) × F.Zona × F.Sup × F.Edad × F.Cons
 */
export function calcularHomologacionRentas(comparables, superficieSujeto) {
  const validos = comparables.filter(c => c.superficie > 0 && c.rentaMensual > 0)
  if (!validos.length || !superficieSujeto) return null

  const homologados = validos.map(c => {
    const rentaUnitaria = c.rentaMensual / c.superficie
    const factorTotal =
      (c.factorZona || 1) * (c.factorSuperficie || 1) *
      (c.factorEdad || 1) * (c.factorConservacion || 1)
    return { ...c, rentaUnitaria, factorTotal, rentaUnitariaHomologada: rentaUnitaria * factorTotal }
  })

  const rentaUnitariaPonderada =
    homologados.reduce((s, c) => s + c.rentaUnitariaHomologada, 0) / homologados.length
  const rentaMensualSujeto = rentaUnitariaPonderada * superficieSujeto

  return { homologados, rentaUnitariaPonderada, rentaMensualSujeto }
}
