// Cambios de contenido hechos desde el panel de mantención.
// DEMO: se guardan en este navegador. En la versión real se guardan en la base de datos
// y la página los lee al publicar, así los ven todos los visitantes.
const KEY = 'vp-demo-contenido'

export function leerContenido() {
  try { return JSON.parse(localStorage.getItem(KEY) || '{}') } catch { return {} }
}
export function guardarContenido(c) {
  try { localStorage.setItem(KEY, JSON.stringify(c)) } catch { /* modo privado */ }
}
export function borrarContenido() {
  try { localStorage.removeItem(KEY) } catch { /* nada */ }
}
