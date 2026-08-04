import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(value) {
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN',
    minimumFractionDigits: 2,
  }).format(value)
}

export function formatNumber(value, decimals = 4) {
  return new Intl.NumberFormat('es-MX', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value)
}

// Variación porcentual entre métodos: (max - min) / min × 100
// Devuelve null si hay menos de 2 métodos con valor.
// Referencia: manuales SHF / INDAABIN — límite admisible ≤ 30 %.
export function calcularVariacionMetodos(valores) {
  const vals = valores.map(Number).filter(v => v > 0)
  if (vals.length < 2) return null
  const min = Math.min(...vals)
  const max = Math.max(...vals)
  return ((max - min) / min) * 100
}

// Dado el código de método y los objetos de cada método, devuelve el valor numérico.
export function valorDeMetodo(clave, { metodoFisico, metodoComparativo, metodoRentas, metodoResidual }) {
  switch (clave) {
    case 'fisico':      return Number(metodoFisico?.valor_fisico_total) || 0
    case 'comparativo': return Number(metodoComparativo?.valor_comparativo_total) || 0
    case 'rentas':      return Number(metodoRentas?.valor_capitalizacion) || 0
    case 'residual':    return Number(metodoResidual?.valor_residual) || 0
    default:            return 0
  }
}
