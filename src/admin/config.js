// Datos que aparecen en todos los certificados. Se pueden cambiar desde Mantención → Configuración.
// DEMO: los cambios se guardan en este navegador.
const KEY_CONFIG = 'vp-demo-config'
const leerConfig = () => { try { return JSON.parse(localStorage.getItem(KEY_CONFIG) || '{}') } catch { return {} } }

export const empresaBase = {
  nombre: 'VP Unicars',
  rut: '77.535.813-0',
  direccion: 'Av. Nueva Einstein 290, Rancagua',
  correo: 'vpunicarscl@gmail.com',
  telefono: '+56 9 3023 5194',
}

export const certificacionBase = {
  uv: '99% de filtro UV',
  documento: 'LEHTX00900653 de 20/07/2020 U.S.A.',
  norma: 'Norma ISO 3795 test: FM55302:2011',
  decreto:
    'En cumplimiento al Decreto 70-2019 de la Subsecretaría de Transportes, declaro la veracidad de los datos contenidos en este certificado.',
}

export const sistemaBase = {
  folioInicial: 239, // el siguiente N° nunca será menor que este (para continuar la numeración en papel)
  dominio: 'vpunicars.cl',
  venceDominio: '2027-10-15',
  hosting: 'Vercel (plan Hobby)',
}

const guardada = leerConfig()
// Objetos mutables: al guardar se actualizan en el lugar y el panel los ve sin recargar
export const empresa = { ...empresaBase, ...(guardada.empresa || {}) }
export const certificacion = { ...certificacionBase, ...(guardada.certificacion || {}) }
export const sistema = { ...sistemaBase, ...(guardada.sistema || {}) }

export function guardarConfig({ empresa: e, certificacion: c, sistema: s }) {
  Object.assign(empresa, e); Object.assign(certificacion, c); Object.assign(sistema, s)
  try { localStorage.setItem(KEY_CONFIG, JSON.stringify({ empresa, certificacion, sistema })) } catch { /* modo privado */ }
}
export function restaurarConfig() {
  Object.assign(empresa, empresaBase); Object.assign(certificacion, certificacionBase); Object.assign(sistema, sistemaBase)
  try { localStorage.removeItem(KEY_CONFIG) } catch { /* nada */ }
}

export const tiposVehiculo = ['Automóvil', 'SUV', 'Camioneta', 'Station wagon', 'Furgón', 'Camión', 'Moto', 'Otro']
export const tonos = [5, 15, 20, 35, 50, 70, 80]
export const marcas = [
  'Audi', 'BMW', 'BYD', 'Changan', 'Chery', 'Chevrolet', 'Citroën', 'Fiat', 'Ford', 'Geely', 'Great Wall', 'Haval',
  'Honda', 'Hyundai', 'JAC', 'Jeep', 'Kia', 'Mahindra', 'Mazda', 'Mercedes-Benz', 'MG', 'Mitsubishi', 'Nissan',
  'Peugeot', 'Porsche', 'Ram', 'Renault', 'Subaru', 'Suzuki', 'Toyota', 'Volkswagen', 'Volvo',
]

// Patentes chilenas: AA·1234 (antigua), BBBB·12 (nueva), motos AAA·12 / AAA·123
export const patenteValida = (p) => /^([A-Z]{2}\d{4}|[A-Z]{4}\d{2}|[A-Z]{3}\d{2,3})$/.test(p)
export const formatoPatente = (p = '') => {
  const s = p.toUpperCase().replace(/[^A-Z0-9]/g, '')
  if (/^[A-Z]{4}\d{2}$/.test(s)) return `${s.slice(0, 2)}·${s.slice(2, 4)}·${s.slice(4)}`
  if (/^[A-Z]{2}\d{4}$/.test(s)) return `${s.slice(0, 2)}·${s.slice(2, 4)}·${s.slice(4)}`
  if (/^[A-Z]{3}\d{2,3}$/.test(s)) return `${s.slice(0, 3)}·${s.slice(3)}`
  return s
}

export const folio = (n) => String(n).padStart(6, '0')

export const urlVerificacion = (c) => {
  const ruta = import.meta.env.DEV ? '/verificar.html' : '/verificar'
  return `${window.location.origin}${ruta}?n=${c.numero}&c=${c.codigo}`
}
