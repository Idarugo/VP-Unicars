import { sistema } from './config.js'

// DEMO: los certificados se guardan en este navegador (localStorage).
// En la versión real esto se reemplaza por una base de datos con usuarios (Supabase).
const KEY = 'vp-demo-certificados'

// Fechas en hora local (toISOString usa UTC y en Chile cambia de día a las 21:00)
export const fechaLocal = (d = new Date()) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
const hoy = () => fechaLocal()
const haceDias = (n) => fechaLocal(new Date(Date.now() - n * 864e5))
export const nuevoCodigo = () => Math.random().toString(36).slice(2, 8).toUpperCase()

// Certificados de ejemplo generados (N° 210–235) para mostrar la paginación
const NOMBRES = ['Carlos Díaz', 'Paula Herrera', 'Jorge Castillo', 'Daniela Torres', 'Sebastián Rojas', 'Fernanda Silva', 'Cristóbal Vargas',
  'Antonia Morales', 'Rodrigo Navarro', 'Javiera Contreras', 'Nicolás Espinoza', 'Catalina Flores', 'Martín Sepúlveda']
const AUTOS = [['Toyota', 'Corolla', 'Automóvil'], ['Chevrolet', 'Groove', 'SUV'], ['Suzuki', 'Baleno', 'Automóvil'], ['Hyundai', 'Accent', 'Automóvil'],
  ['Nissan', 'Kicks', 'SUV'], ['Mitsubishi', 'L200', 'Camioneta'], ['Kia', 'Sportage', 'SUV'], ['Peugeot', '208', 'Automóvil'], ['MG', 'ZS', 'SUV']]
const TONOS = [[50, 20, 20], [70, 35, 35], [50, 5, 5], [70, 20, 20], [35, 15, 15]]
const generados = Array.from({ length: 26 }, (_, i) => {
  const [marca, modelo, tipo] = AUTOS[i % AUTOS.length]
  const [d, t, l] = TONOS[i % TONOS.length]
  return {
    numero: 210 + i, fecha: haceDias(60 - i * 2), cliente: NOMBRES[i % NOMBRES.length], direccion: i % 3 ? 'Rancagua' : 'Machalí',
    telefono: '', instalador: 'Marco Niño', tipo, marca, modelo, anio: String(2016 + (i % 9)),
    patente: `DM${String(1000 + i * 37).slice(-4)}`, delanteros: d, traseros: t, luneta: l, observaciones: '',
    codigo: `D${String(210 + i)}X${i % 10}Z`,
  }
})

const ejemplo = [
  ...generados,
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

export const siguienteNumero = (lista) => Math.max(sistema.folioInicial || 0, Math.max(0, ...lista.map((c) => c.numero)) + 1)

export const vacio = () => ({
  fecha: hoy(), cliente: '', direccion: '', telefono: '', instalador: 'Marco Niño',
  tipo: 'Automóvil', marca: '', modelo: '', anio: '', patente: '', delanteros: '', traseros: '', luneta: '', observaciones: '',
})

/* ---------------- Agenda (DEMO) ---------------- */
const KEY_AGENDA = 'vp-demo-agenda'

// Equipo de ejemplo: en la versión real cada uno tendría su usuario
export const equipo = [
  { id: 'marco', nombre: 'Marco', rol: 'Polarizado, PPF y láminas', color: '#ffc800' },
  { id: 'felipe', nombre: 'Felipe', rol: 'Audio e iluminación', color: '#38bdf8' },
  { id: 'javier', nombre: 'Javier', rol: 'Corta corriente y seguridad', color: '#c084fc' },
]

export const serviciosAgenda = [
  'Polarizado', 'PPF', 'Láminas de seguridad', 'Ahumado de focos', 'Vinilos / Kill chrome', 'Polarizado arquitectónico',
  'Audio', 'Corta corriente / Inmovilizador', 'Sistema de seguridad', 'Iluminación', 'Electricidad', 'Grabado de patentes',
]
// Servicios que llevan certificado de instalación de láminas
export const llevaCertificado = (s) => ['Polarizado', 'Láminas de seguridad'].includes(s)

export const lunesDe = (d) => {
  const x = new Date(d.getFullYear(), d.getMonth(), d.getDate())
  x.setDate(x.getDate() - ((x.getDay() + 6) % 7))
  return x
}
const diaSemana = (n) => { const d = lunesDe(new Date()); d.setDate(d.getDate() + n); return fechaLocal(d) }
export const nuevoId = () => Math.random().toString(36).slice(2, 10)

const ejemploAgenda = () => [
  { id: 'a1', fecha: diaSemana(0), hora: '10:00', servicio: 'Polarizado', encargado: 'marco', lugar: 'local', cliente: 'Camila Rojas', telefono: '', marca: 'Kia', modelo: 'Rio 5', patente: 'DEMO44', direccion: '', estado: 'terminado', notas: 'Nanocarbon 20% traseros' },
  { id: 'a2', fecha: diaSemana(0), hora: '15:00', servicio: 'Audio', encargado: 'felipe', lugar: 'local', cliente: 'Diego Muñoz', telefono: '', marca: 'Mazda', modelo: '3', patente: 'DEMO55', direccion: '', estado: 'confirmado', notas: 'Parlantes delanteros + radio' },
  { id: 'a3', fecha: diaSemana(1), hora: '09:30', servicio: 'PPF', encargado: 'marco', lugar: 'domicilio', cliente: 'Andrés Vera', telefono: '', marca: 'BMW', modelo: '320i', patente: 'DEMO66', direccion: 'Machalí', estado: 'confirmado', notas: 'PPF piano black interior' },
  { id: 'a4', fecha: diaSemana(1), hora: '11:00', servicio: 'Corta corriente / Inmovilizador', encargado: 'javier', lugar: 'local', cliente: 'Rosa Fuentes', telefono: '', marca: 'Chevrolet', modelo: 'Sail', patente: 'DEMO77', direccion: '', estado: 'pendiente', notas: '' },
  { id: 'a5', fecha: diaSemana(2), hora: '10:00', servicio: 'Láminas de seguridad', encargado: 'marco', lugar: 'local', cliente: 'Tomás Pizarro', telefono: '', marca: 'Toyota', modelo: 'RAV4', patente: 'DEMO88', direccion: '', estado: 'confirmado', notas: '' },
  { id: 'a6', fecha: diaSemana(2), hora: '16:30', servicio: 'Iluminación', encargado: 'felipe', lugar: 'local', cliente: 'Ignacio León', telefono: '', marca: 'Nissan', modelo: 'Navara', patente: 'DEMO99', direccion: '', estado: 'pendiente', notas: 'Barra LED' },
  { id: 'a7', fecha: diaSemana(3), hora: '12:00', servicio: 'Grabado de patentes', encargado: 'javier', lugar: 'local', cliente: 'Valentina Soto', telefono: '', marca: 'Suzuki', modelo: 'Swift', patente: 'DEMO12', direccion: '', estado: 'pendiente', notas: '' },
  { id: 'a8', fecha: diaSemana(4), hora: '10:00', servicio: 'Polarizado arquitectónico', encargado: 'marco', lugar: 'domicilio', cliente: 'Oficina Centro', telefono: '', marca: '', modelo: '', patente: '', direccion: 'Rancagua centro', estado: 'confirmado', notas: 'Espejo, 6 ventanas' },
  { id: 'a9', fecha: diaSemana(5), hora: '11:00', servicio: 'Ahumado de focos', encargado: 'marco', lugar: 'local', cliente: 'Matías Reyes', telefono: '', marca: 'VW', modelo: 'Golf GTI', patente: 'DEMO13', direccion: '', estado: 'pendiente', notas: '' },
]

export function cargarAgenda() {
  try {
    const raw = localStorage.getItem(KEY_AGENDA)
    if (raw) return JSON.parse(raw)
  } catch { /* sin almacenamiento */ }
  return ejemploAgenda()
}
export function guardarAgenda(lista) {
  try { localStorage.setItem(KEY_AGENDA, JSON.stringify(lista)) } catch { /* modo privado */ }
}
export function reiniciarAgenda() {
  try { localStorage.removeItem(KEY_AGENDA) } catch { /* nada */ }
  return ejemploAgenda()
}
export const trabajoVacio = (fecha) => ({
  fecha: fecha || hoy(), hora: '10:00', servicio: 'Polarizado', encargado: 'marco', lugar: 'local',
  cliente: '', telefono: '', marca: '', modelo: '', patente: '', direccion: '', estado: 'pendiente', notas: '',
})

/* ---------------- Historial de cambios (DEMO) ---------------- */
const KEY_LOG = 'vp-demo-historial'
export function leerHistorial() {
  try {
    const raw = localStorage.getItem(KEY_LOG)
    if (raw) return JSON.parse(raw)
  } catch { /* nada */ }
  const hace = (h) => new Date(Date.now() - h * 36e5).toISOString()
  return [
    { fecha: hace(2), usuario: 'Marco Niño', accion: 'Emitió certificado', detalle: 'N° 000238 · DE·MO·33' },
    { fecha: hace(5), usuario: 'Marco Niño', accion: 'Agendó trabajo', detalle: 'Audio · Diego Muñoz' },
    { fecha: hace(26), usuario: 'Soporte', accion: 'Editó contenido web', detalle: 'Horario de atención' },
    { fecha: hace(50), usuario: 'Marco Niño', accion: 'Emitió certificado', detalle: 'N° 000237 · DE·MO·22' },
    { fecha: hace(73), usuario: 'Sistema', accion: 'Respaldo automático', detalle: 'Correcto' },
  ]
}
export function registrar(usuario, accion, detalle = '') {
  const lista = [{ fecha: new Date().toISOString(), usuario, accion, detalle }, ...leerHistorial()].slice(0, 300)
  try { localStorage.setItem(KEY_LOG, JSON.stringify(lista)) } catch { /* nada */ }
}

/* ---------------- Usuarios (DEMO) ---------------- */
const KEY_USR = 'vp-demo-usuarios'
export const ROLES = {
  admin: { nombre: 'Administrador', permisos: ['Agenda de todo el equipo', 'Certificados', 'Estadísticas'] },
  tecnico: { nombre: 'Técnico', permisos: ['Su agenda', 'Emitir certificados'] },
  soporte: { nombre: 'Soporte técnico', permisos: ['Todo', 'Mantención', 'Usuarios', 'Respaldos'] },
}
export function leerUsuarios() {
  try {
    const raw = localStorage.getItem(KEY_USR)
    if (raw) return JSON.parse(raw)
  } catch { /* nada */ }
  return [
    { id: 'u1', nombre: 'Marco Niño', usuario: 'demo', rol: 'admin', activo: true, acceso: new Date().toISOString() },
    { id: 'u2', nombre: 'Felipe', usuario: 'felipe', rol: 'tecnico', activo: true, acceso: new Date(Date.now() - 864e5).toISOString() },
    { id: 'u3', nombre: 'Javier', usuario: 'javier', rol: 'tecnico', activo: true, acceso: new Date(Date.now() - 3 * 864e5).toISOString() },
    { id: 'u4', nombre: 'Soporte', usuario: 'soporte', rol: 'soporte', activo: true, acceso: new Date().toISOString() },
  ]
}
export function guardarUsuarios(l) {
  try { localStorage.setItem(KEY_USR, JSON.stringify(l)) } catch { /* nada */ }
}
