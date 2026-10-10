// Todo el contenido editable de la página vive aquí.
export const negocio = {
  nombre: 'VP Unicars',
  whatsapp: '56930235194',
  whatsappTexto: 'Hola VP Unicars! Quiero cotizar un trabajo para mi auto 🚘',
  instagram: 'https://www.instagram.com/vp_unicars/',
  direccion: 'Mall Plaza América, Rancagua',
  mapa: 'https://www.google.com/maps?q=Mall+Plaza+Am%C3%A9rica+Rancagua&output=embed',
  mapaLink: 'https://maps.google.com/?q=Mall+Plaza+America+Rancagua',
}

export const waLink = (texto = negocio.whatsappTexto) =>
  `https://wa.me/${negocio.whatsapp}?text=${encodeURIComponent(texto)}`

export const stats = [
  { valor: 1900, prefijo: '+', sufijo: '', label: 'Trabajos realizados' },
  { valor: 10.4, prefijo: '', sufijo: 'K', label: 'Seguidores en Instagram', decimales: 1 },
  { valor: 1992, prefijo: '', sufijo: '', label: 'Publicaciones de trabajos' },
  { valor: 99, prefijo: '', sufijo: '%', label: 'Protección UV' },
]

// foto: '/fotos/archivo.jpg' (opcional)
export const servicios = [
  {
    id: 'ppf',
    foto: '/fotos/porsche-ppf.jpg',
    num: '01',
    titulo: 'PPF',
    sub: 'Paint Protection Film',
    texto: 'Lámina transparente autorregenerable que protege pintura, parabrisas, pianos black e interiores contra piedras y rayones.',
    tags: ['Carrocería', 'Parabrisas', 'Piano black', 'Mate ↔ Brillante'],
    art: 'shield',
  },
  {
    id: 'polarizados',
    foto: '/fotos/polarizado-5.webp',
    num: '02',
    titulo: 'Polarizados',
    sub: 'Estándar · Nanocarbon · Nanocerámico',
    texto: 'Control solar, privacidad y hasta 99% de protección UV. Tecnología de última generación con alto rechazo de calor.',
    tags: ['Nanocerámico', 'Nanocarbon', 'Parabrisas 50%', 'Infiel'],
    art: 'tint',
  },
  {
    id: 'seguridad',
    foto: '/fotos/laminas-seguridad.webp',
    num: '03',
    titulo: 'Láminas de Seguridad',
    sub: 'Antiportonazo · Antipiquetes',
    texto: 'Láminas que mantienen el vidrio unido ante impactos. Más tiempo, más seguridad para ti y tu familia.',
    tags: ['Antipiquetes', 'Clearplex', 'Productos certificados'],
    art: 'lock',
  },
  {
    id: 'focos',
    foto: '/fotos/ahumado-focos.webp',
    num: '04',
    titulo: 'Ahumado de Focos',
    sub: 'PPF ahumado premium',
    texto: 'Look agresivo y protección real para tus ópticas, con PPF ahumado de alta gama.',
    tags: ['Focos', 'Stops', 'Neblineros'],
    art: 'light',
  },
  {
    id: 'vinilos',
    foto: '/fotos/kill-chrome.jpg',
    num: '05',
    titulo: 'Vinilos & Wrap',
    sub: 'Cambio de color · Kill chrome',
    texto: 'Wrap completo, eliminación de cromos, techos, pilares, fibra de carbono 6D y vinil reflectivo.',
    tags: ['Wrap', 'Kill chrome', 'Fibra 6D', 'Reflectivo'],
    art: 'wrap',
  },
  {
    id: 'arquitectonico',
    foto: '/fotos/arquitectonico-bronce.webp',
    num: '06',
    titulo: 'Arquitectónico',
    sub: 'Hogar · Oficinas · Locales',
    texto: 'Polarizado espejo, bronce y control solar para casas y oficinas. Privacidad máxima, menos calor, cero cortinas.',
    tags: ['Espejo', 'Bronce', 'Tornasol', 'Publicidad'],
    art: 'building',
  },
  {
    id: 'personalizacion',
    foto: '/fotos/fibra-carbono.webp',
    num: '07',
    titulo: 'Personalización',
    sub: 'Cielos estrellados & más',
    texto: 'Techos estrellados, detalles en fibra de carbono, cascos y proyectos únicos para que tu auto no se parezca a ningún otro.',
    tags: ['Cielo estrellado', 'Cascos', 'Interiores'],
    art: 'stars',
  },
]

export const niveles = [
  {
    nombre: 'Estándar',
    desc: 'La entrada perfecta: privacidad y estética al mejor precio.',
    calor: 40,
    uv: 99,
    claridad: 70,
    durabilidad: 65,
  },
  {
    nombre: 'Nanocarbon',
    desc: 'Excelente desempeño térmico y apariencia elegante que no se decolora.',
    calor: 70,
    uv: 99,
    claridad: 85,
    durabilidad: 85,
    destacado: true,
  },
  {
    nombre: 'Nanocerámico Premium',
    desc: 'Lo máximo: el mayor rechazo de calor sin interferir señales.',
    calor: 92,
    uv: 99,
    claridad: 96,
    durabilidad: 98,
  },
]

export const autos = [
  'Porsche 911 Turbo S',
  'BMW 520i',
  'Ford Mustang GT',
  'VW Golf GTI',
  'Porsche Boxster S',
  'Ford Territory 2026',
  'Changan X7 Plus 2026',
  'Honda Civic',
  'BMW Serie 3',
  'iPhone 17 Pro',
]

// Trabajos destacados (sacados del Instagram). Agrega "foto" para mostrar la imagen real.
export const trabajos = [
  { auto: 'Porsche 911 Turbo S', trabajo: 'PPF en interior piano black', tono: '#c9a227', foto: '/fotos/piano-black.jpg' },
  { auto: 'BMW 520i', trabajo: 'Nanocarbon + Nanocerámica', tono: '#3b82f6', foto: '/fotos/bmw-520i.jpg' },
  { auto: 'Ford Territory 2026', trabajo: 'PPF protector piano black', tono: '#a3a3a3', foto: '/fotos/territory-ppf.jpg' },
  { auto: 'VW Golf GTI', trabajo: 'Polarizado tornasol', tono: '#e5e5e5', foto: '/fotos/tornasol.webp' },
  { auto: 'Polarizado Infiel', trabajo: 'Nanocerámico 20% · máxima privacidad', tono: '#ffc800', foto: '/fotos/nanoceramico.jpg' },
  { auto: 'Personalización', trabajo: 'PPF ahumado + kill chrome', tono: '#ef4444', foto: '/fotos/personalizacion.jpg' },
  { auto: 'Carbono forjado', trabajo: 'Pianos black en carbono', tono: '#22c55e', foto: '/fotos/pilares-carbono.jpg' },
  { auto: 'Hogar', trabajo: 'Polarizado arquitectónico', tono: '#a16207', foto: '/fotos/arquitectonico.webp' },
]

export const pasos = [
  { t: 'Escríbenos', d: 'Por WhatsApp o DM. Cuéntanos tu auto y lo que buscas.' },
  { t: 'Asesoría', d: 'Te recomendamos la lámina ideal para tu uso y presupuesto.' },
  { t: 'Instalación', d: 'Trabajo de precisión en nuestro taller de Mall Plaza América.' },
  { t: 'Entrega', d: 'Revisión final contigo y recomendaciones de cuidado.' },
]

export const faqs = [
  {
    q: '¿Qué diferencia hay entre Nanocarbon y Nanocerámico?',
    a: 'Ambos son tecnologías de última generación. El Nanocarbon ofrece excelente rechazo de calor y no se decolora; el Nanocerámico va un paso más allá con el mayor rechazo térmico y máxima claridad, sin interferir con GPS ni señal de celular.',
  },
  {
    q: '¿El PPF se nota en la pintura?',
    a: 'No. Es una lámina transparente de alto rendimiento. Incluso puede realzar el brillo, o cambiar un acabado mate a brillante (y viceversa).',
  },
  {
    q: '¿Trabajan hogares y oficinas?',
    a: 'Sí. Instalamos polarizado arquitectónico espejo, bronce y control solar en casas, oficinas y locales comerciales.',
  },
  {
    q: '¿Cómo agendo?',
    a: 'Escríbenos por WhatsApp o por DM en Instagram y coordinamos tu hora en Mall Plaza América, Rancagua.',
  },
]
