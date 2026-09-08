export function calcFactorSuperficieTerreno(supSujeto, supComp) {
  if (!supSujeto || !supComp) return 1
  return Math.pow(supSujeto / supComp, 0.12)
}

function calcComp(comp) {
  const precioM2 = comp.superficie > 0 && comp.precioTotal > 0
    ? comp.precioTotal / comp.superficie
    : 0
  const factorTotal =
    (comp.factorZona        || 1) *
    (comp.factorSuperficie  || 1) *
    (comp.factorForma       || 1) *
    (comp.factorFrente      || 1) *
    (comp.factorServicios   || 1) *
    (comp.factorNegociacion || 1)
  const precioM2Homologado = precioM2 * factorTotal
  return { ...comp, precioM2, factorTotal, precioM2Homologado }
}

export function calcularComparativosTerreno(comparables, supSujeto) {
  const calculados = comparables.map(calcComp)
  const validos = calculados.filter(c => c.precioM2Homologado > 0)
  if (!validos.length) return { comparables: calculados, valorUnitarioPonderado: 0, nComparables: 0 }
  const valorUnitarioPonderado = validos.reduce((s, c) => s + c.precioM2Homologado, 0) / validos.length
  return { comparables: calculados, valorUnitarioPonderado, nComparables: validos.length }
}
