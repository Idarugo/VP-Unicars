// Datos fijos que aparecen en todos los certificados.
export const empresa = {
  nombre: 'VP Unicars',
  rut: '77.535.813-0',
  direccion: 'Av. Nueva Einstein 290, Rancagua',
  correo: 'vpunicarscl@gmail.com',
  telefono: '+56 9 3023 5194',
}

export const certificacion = {
  uv: '99% de filtro UV',
  documento: 'LEHTX00900653 de 20/07/2020 U.S.A.',
  norma: 'Norma ISO 3795 test: FM55302:2011',
  decreto:
    'En cumplimiento al Decreto 70-2019 de la Subsecretaría de Transportes, declaro la veracidad de los datos contenidos en este certificado.',
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
