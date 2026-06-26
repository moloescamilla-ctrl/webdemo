// Stores perito profile in localStorage for quick auto-fill.
// Data is device-local (fine for a single-perito tool).
const KEY = 'perito_perfil'

export function getPeritoPerfil() {
  try { return JSON.parse(localStorage.getItem(KEY) ?? '{}') } catch { return {} }
}

export function savePeritoPerfil(perfil) {
  localStorage.setItem(KEY, JSON.stringify(perfil))
}
