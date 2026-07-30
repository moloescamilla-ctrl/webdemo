/**
 * Calcula los componentes del Costo de Inversión (Ci).
 * Ci = costo_construccion_total + porcentajes_sobre_VM
 */
export function calcularCi({
  costoConstuccionTotal,
  vmTotal,
  proyectoPct = 2,
  permisosPct = 1,
  gestionPct = 2,
  comercializacionPct = 3,
  financiamientoPct = 2,
  imprevistoPct = 4,
}) {
  const componentes = {
    costoConstuccion:  costoConstuccionTotal,
    proyecto:          vmTotal * (proyectoPct         / 100),
    permisos:          vmTotal * (permisosPct         / 100),
    gestion:           vmTotal * (gestionPct          / 100),
    comercializacion:  vmTotal * (comercializacionPct / 100),
    financiamiento:    vmTotal * (financiamientoPct   / 100),
    imprevistos:       vmTotal * (imprevistoPct       / 100),
  }
  const ciTotal = Object.values(componentes).reduce((s, v) => s + v, 0)
  return { componentes, ciTotal }
}

/**
 * Calcula la utilidad del promotor.
 */
export function calcularUtilidad({ vmTotal, utilidadPct }) {
  return vmTotal * (utilidadPct / 100)
}

/**
 * Cálculo completo del Método Residual Estático.
 * F = VM − Ci − Up
 * Devuelve todos los intermedios para UI y persistencia.
 */
export function calcularMetodoResidual({
  vmTotal,
  superficieProyectoM2,
  costoConstuccionM2,
  superficieTerrenoM2,
  proyectoPct,
  permisosPct,
  gestionPct,
  comercializacionPct,
  financiamientoPct,
  imprevistoPct,
  utilidadPct,
}) {
  if (!vmTotal || vmTotal <= 0) return null

  const costoConstuccionTotal = (superficieProyectoM2 || 0) * (costoConstuccionM2 || 0)

  const { componentes, ciTotal } = calcularCi({
    costoConstuccionTotal,
    vmTotal,
    proyectoPct,
    permisosPct,
    gestionPct,
    comercializacionPct,
    financiamientoPct,
    imprevistoPct,
  })

  const utilidadPesos = calcularUtilidad({ vmTotal, utilidadPct })
  const valorResidual = vmTotal - ciTotal - utilidadPesos
  const valorResidualM2Terreno =
    superficieTerrenoM2 > 0 ? valorResidual / superficieTerrenoM2 : null

  return {
    costoConstuccionTotal,
    componentes,
    ciTotal,
    utilidadPesos,
    valorResidual,
    valorResidualM2Terreno,
    esViable: valorResidual > 0,
  }
}
