// DEMO: los certificados se guardan en este navegador (localStorage).
// En la versión real esto se reemplaza por una base de datos con usuarios (Supabase).
const KEY = 'vp-demo-certificados'

const hoy = () => new Date().toISOString().slice(0, 10)
const haceDias = (d) => new Date(Date.now() - d * 864e5).toISOString().slice(0, 10)
export const nuevoCodigo = () => Math.random().toString(36).slice(2, 8).toUpperCase()

const ejemplo = [
  { numero: 236, fecha: haceDias(6), cliente: 'Juan Pérez', direccion: 'Rancagua', telefono: '', instalador: 'Marco Niño',
    tipo: 'Automóvil', marca: 'Toyota', modelo: 'Yaris 1.5', anio: '2021', patente: 'DEMO11', delanteros: 50, traseros: 20, luneta: 20,
    observaciones: 'Polarizado nanocarbon', codigo: 'K3P9QA' },
  { numero: 237, fecha: haceDias(3), cliente: 'María González', direccion: 'Machalí', telefono: '', instalador: 'Marco Niño',
    tipo: 'SUV', marca: 'Hyundai', modelo: 'Tucson', anio: '2023', patente: 'DEMO22', delanteros: 70, traseros: 35, luneta: 35,
    observaciones: '', codigo: 'X7M2LB' },
  { numero: 238, fecha: hoy(), cliente: 'Pedro Soto', direccion: 'Rancagua', telefono: '', instalador: 'Marco Niño',
    tipo: 'Camioneta', marca: 'Ford', modelo: 'Ranger XLT', anio: '2022', patente: 'DEMO33', delanteros: 50, traseros: 5, luneta: 5,
    observaciones: 'Láminas de seguridad', codigo: 'R8T4WD' },
]

export function cargar() {
  try {
    const raw = localStorage.getItem(KEY)
    if (raw) return JSON.parse(raw)
  } catch { /* sin almacenamiento: se usan los ejemplos */ }
  return ejemplo
}

export function guardar(lista) {
  try { localStorage.setItem(KEY, JSON.stringify(lista)) } catch { /* modo privado */ }
}

export function reiniciar() {
  try { localStorage.removeItem(KEY) } catch { /* nada */ }
  return ejemplo
}

export const siguienteNumero = (lista) => Math.max(0, ...lista.map((c) => c.numero)) + 1

export const vacio = () => ({
  fecha: hoy(), cliente: '', direccion: '', telefono: '', instalador: 'Marco Niño',
  tipo: 'Automóvil', marca: '', modelo: '', anio: '', patente: '', delanteros: '', traseros: '', luneta: '', observaciones: '',
})
