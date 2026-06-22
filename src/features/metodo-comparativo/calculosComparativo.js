export function calcFactorSuperficie(supSujeto, supComparable) {
  if (!supSujeto || !supComparable) return 1
  return Math.pow(supSujeto / supComparable, 0.12)
}

function calcComparable(comp) {
  const precioM2 = comp.superficie > 0 && comp.precioTotal > 0
    ? comp.precioTotal / comp.superficie
    : 0
  const factorTotal =
    (comp.factorZona || 1) *
    (comp.factorSuperficie || 1) *
    (comp.factorEdad || 1) *
    (comp.factorConservacion || 1)
  const precioM2Homologado = precioM2 * factorTotal
  return { ...comp, precioM2, factorTotal, precioM2Homologado }
}

export function calcularMetodoComparativo(comparables, superficieSujeto) {
  if (!superficieSujeto) return null
  const calculados = comparables.map(calcComparable)
  const validos = calculados.filter(c => c.precioM2Homologado > 0)
  if (!validos.length) return null

  const valorUnitarioPonderado =
    validos.reduce((s, c) => s + c.precioM2Homologado, 0) / validos.length
  const valorComparativoTotal = valorUnitarioPonderado * superficieSujeto

  return { comparables: calculados, valorUnitarioPonderado, valorComparativoTotal, nComparables: validos.length }
}
