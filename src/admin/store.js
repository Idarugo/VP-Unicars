// Utilidades compartidas del panel. Los datos viven en la base de datos (ver src/stores y src/services).

// Fechas en hora local (toISOString usa UTC y en Chile cambia de día a las 21:00)
export const fechaLocal = (d = new Date()) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
const hoy = () => fechaLocal()

export const vacio = () => ({
  fecha: hoy(), cliente: '', direccion: '', telefono: '', instalador: '',
  tipo: 'Automóvil', marca: '', modelo: '', anio: '', patente: '', delanteros: '', traseros: '', luneta: '', observaciones: '',
})

/* ---------------- Agenda ---------------- */
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

export const trabajoVacio = (fecha) => ({
  fecha: fecha || hoy(), hora: '10:00', servicio: 'Polarizado', encargadoId: '', lugar: 'local',
  cliente: '', telefono: '', marca: '', modelo: '', patente: '', direccion: '', estado: 'pendiente', notas: '',
})
