// Contenido ORIGINAL de la página. Todo se puede cambiar desde Mantención → Contenido web;
// lo guardado en la base de datos reemplaza a cada sección (ver aplicarContenido al final).
const baseNegocio = {
  nombre: 'VP Unicars',
  whatsapp: '56930235194',
  whatsappTexto: 'Hola VP Unicars! Quiero cotizar un trabajo para mi auto 🚘',
  instagram: 'https://www.instagram.com/vp_unicars/',
  tiktok: 'https://www.tiktok.com/@vpunicars',
  facebook: 'https://www.facebook.com/profile.php?id=100064194631893',
  direccion: 'Mall Plaza América, Rancagua',
  ubicacion: 'Nivel -1 · Sector Hotel',
  mapa: 'https://www.google.com/maps?q=Mall+Plaza+Am%C3%A9rica+Rancagua&output=embed',
  mapaLink: 'https://maps.google.com/?q=Mall+Plaza+America+Rancagua',
  horario: '10:00 a 18:00 aprox.',
  horarioNota: 'Algunos días hacemos trabajos a domicilio: agenda por WhatsApp.',
  // Ficha del negocio en Google (Place ID ChIJL1YlIyZFY5YRbpPpe5mwCnY)
  resenaUrl: 'https://search.google.com/local/writereview?placeid=ChIJL1YlIyZFY5YRbpPpe5mwCnY',
  googleUrl: 'https://www.google.com/maps/place/?q=place_id:ChIJL1YlIyZFY5YRbpPpe5mwCnY',
  calificacion: 5,
  totalResenas: 22,
}

export const waLink = (texto = negocio.whatsappTexto) =>
  `https://wa.me/${negocio.whatsapp}?text=${encodeURIComponent(texto)}`

const baseStats = [
  { id: 'trabajos', valor: 1900, prefijo: '+', sufijo: '', label: 'Trabajos realizados', icono: 'trofeo' },
  { id: 'seguidores', valor: 10.4, prefijo: '', sufijo: 'K', label: 'Seguidores en Instagram', decimales: 1, icono: 'instagram' },
  { id: 'publicaciones', valor: 1992, prefijo: '', sufijo: '', label: 'Publicaciones de trabajos', icono: 'fotos' },
  { id: 'uv', valor: 99, prefijo: '', sufijo: '%', label: 'Protección UV', icono: 'sol' },
]

// foto: '/fotos/archivo.jpg' (opcional)
const baseServicios = [
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
    id: 'pianoblack',
    foto: '/fotos/servicio-piano-black.webp',
    num: '02',
    titulo: 'Piano Black',
    sub: 'PPF autorregenerable para interiores',
    texto: 'Las superficies piano black se rayan con solo mirarlas. Una lámina PPF transparente las protege de rayones y desgaste, mantiene el brillo y el acabado original de tu auto.',
    tags: ['Evita rayones', 'Autorregeneración', 'Mantiene el brillo', 'Alta transparencia'],
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
    foto: '/fotos/servicio-lamina-seguridad.webp',
    num: '03',
    titulo: 'Láminas de Seguridad',
    sub: 'Protege tu vehículo y a tu familia',
    texto: 'Un escudo para tu auto y quienes viajan en él: mantiene el vidrio unido ante un impacto, dificulta los robos y bloquea hasta el 99% de los rayos UV.',
    tags: ['Antiportonazo', 'Antipiquetes', 'Seguridad en accidentes', 'Refuerzo del vidrio'],
    art: 'lock',
  },
  {
    id: 'focos',
    foto: '/fotos/servicio-ahumado-focos.webp',
    num: '04',
    titulo: 'Ahumado de Focos',
    sub: 'Premium · con vinilo o PPF',
    texto: 'Protección + estética: cuida tus ópticas de rayas, piedras y rayos UV, evitando que se pongan amarillas u opacas. Acabado moderno y elegante sin reducir notoriamente la luz. Con PPF, se autorregenera.',
    tags: ['Focos', 'Stops', 'Neblineros', 'Vinilo o PPF', 'Material americano'],
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

// Servicios adicionales: todo se cotiza y agenda por el WhatsApp de VP Unicars.
// icono: nombre del ícono de Font Awesome definido en components/MasServicios.jsx
const baseMasServicios = [
  { id: 'audio', titulo: 'Audio', texto: 'Instalación de parlantes, radios, subwoofers y amplificadores.', icono: 'audio' },
  { id: 'corta-corriente', titulo: 'Corta corriente e inmovilizadores', texto: 'Protección antirrobo que impide que tu auto arranque sin ti.', icono: 'corriente' },
  { id: 'seguridad', titulo: 'Sistemas de seguridad', texto: 'Alarmas y soluciones para que tu auto esté siempre protegido.', icono: 'seguridad' },
  { id: 'iluminacion', titulo: 'Iluminación', texto: 'Luces y todo lo que sea iluminación para tu auto.', icono: 'luces' },
  { id: 'electricidad', titulo: 'Electricidad automotriz', texto: 'Instalaciones y trabajos eléctricos en tu vehículo.', icono: 'electricidad' },
  { id: 'grabado', titulo: 'Grabado de patentes', texto: 'Grabado de patente en los vidrios de tu auto.', icono: 'grabado' },
]

// Datos de los afiches de VP Unicars (octubre 2026)
const baseNiveles = [
  {
    id: 'estandar',
    nombre: 'Estándar',
    nivel: 'Básico',
    desc: 'La entrada perfecta: privacidad y estética al mejor precio.',
    uv: null,
    ir: null,
    beneficios: ['Mayor privacidad', 'Mejor estética', 'Mayor comodidad al conducir'],
    foto: '/fotos/polarizado-estandar.webp',
  },
  {
    id: 'nanocarbon',
    nombre: 'Nanocarbón',
    nivel: 'Intermedio',
    desc: 'Tecnología carbono que protege y da estilo.',
    uv: 99,
    ir: 34,
    beneficios: ['Excelente rechazo de calor', 'Tecnología nanocarbón avanzada', 'Acabado elegante', 'Confort térmico en cada viaje'],
    foto: '/fotos/polarizado-nanocarbon.webp',
    destacado: true,
  },
  {
    id: 'nanoceramico',
    nombre: 'Nanocerámico',
    nivel: 'Premium',
    desc: 'Máxima tecnología y confort térmico.',
    uv: 100,
    ir: 89,
    beneficios: ['Máximo rechazo de calor', 'Mayor claridad y visibilidad', 'Acabado premium', 'Mayor confort al conducir'],
    foto: '/fotos/polarizado-nanoceramico.webp',
  },
]

const basePolarizado = {
  tonos: ['5', '20', '35', '50', '70'],
  sellos: ['Material americano', 'Instalación profesional', 'Trabajo garantizado', 'Previa agenda'],
}

// Videos de la pantalla /videos (TV del local)
const baseVideosTv = [
  { id: 'tv-vp-unicars', titulo: 'VP Unicars · promocional', video: '/tv/vp-unicars.mp4' },
  { id: 'tv-asi-trabajamos', titulo: 'Así trabajamos · procesos reales', video: '/tv/vp-asi-trabajamos.mp4' },
  { id: 'tv-elige-tu-polarizado', titulo: 'Elige tu polarizado', video: '/tv/vp-elige-tu-polarizado.mp4' },
  { id: 'tv-clientes-felices', titulo: 'Clientes felices · reseñas', video: '/tv/vp-clientes-felices.mp4' },
]

// Reseñas de la ficha de Google de VP Unicars (copiadas el 16/10/2026)
const baseResenas = [
  { autor: 'Nathalie Chavarri', estrellas: 5, fecha: 'ago 2026', texto: 'Me recomendó nano cerámicos y sin duda fue la mejor decisión, agradecida por la atención excelente servicio sin duda lo recomendaré' },
  { autor: 'derwin w muñoz d', estrellas: 5, fecha: 'ago 2026', texto: 'Excelente trabajo tuve la oportunidad de obtener un buen servicio de lámina de seguridad para mi auto impecable nada que decir 100 % recomendado' },
  { autor: 'Marina Birot', estrellas: 5, fecha: 'ago 2026', texto: 'Muy profesionales y amables, hacen un buen trabajo.! Los recomiendo' },
  { autor: 'Lisbeth Lamas', estrellas: 5, fecha: 'ago 2026', texto: 'Súper profesional y capacitado!!! A demás cobra lo justo… Súper recomendable' },
  { autor: 'Ronald Cortez', estrellas: 5, fecha: 'jun 2026', texto: 'Excelente servicio 100% recomendado. La atencion y el trabajo de otro nivel' },
  { autor: 'Mauricio Moya', estrellas: 5, fecha: 'oct 2025', texto: 'Lejos el mejor lugar para hacer los retoques a tú auto, láminas de seguridad, para proteger del sol y más lo recomiendo' },
  { autor: 'elberth camaño', estrellas: 5, fecha: 'jun 2026', texto: 'Excelente servicio, calidad de materiales y atención' },
  { autor: 'Mile Rivas', estrellas: 5, fecha: 'oct 2024', texto: 'Excelente profesional, super atento y con un acabado final impecable!.... Muy recomendable!' },
  { autor: 'Enyer Ramirez', estrellas: 5, fecha: 'ago 2026', texto: 'Es un buen trato y atiende super bien' },
  { autor: 'gonzalo javier hernandez lobos', estrellas: 5, fecha: 'jun 2026', texto: 'Exelente trabajo muchas Gracias los mejores' },
]

const baseAutos = [
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
const baseTrabajos = [
  { auto: 'Porsche 911 Turbo S', trabajo: 'PPF en interior piano black', tono: '#c9a227', foto: '/fotos/piano-black.jpg' },
  { auto: 'BMW 520i', trabajo: 'Nanocarbon + Nanocerámica', tono: '#3b82f6', foto: '/fotos/bmw-520i.jpg' },
  { auto: 'Ford Territory 2026', trabajo: 'PPF protector piano black', tono: '#a3a3a3', foto: '/fotos/territory-ppf.jpg' },
  { auto: 'VW Golf GTI', trabajo: 'Polarizado tornasol', tono: '#e5e5e5', foto: '/fotos/tornasol.webp' },
  { auto: 'Polarizado Infiel', trabajo: 'Nanocerámico 20% · máxima privacidad', tono: '#ffe600', foto: '/fotos/nanoceramico.jpg' },
  { auto: 'Personalización', trabajo: 'PPF ahumado + kill chrome', tono: '#ef4444', foto: '/fotos/personalizacion.jpg' },
  { auto: 'Carbono forjado', trabajo: 'Pianos black en carbono', tono: '#22c55e', foto: '/fotos/pilares-carbono.jpg' },
  { auto: 'Hogar', trabajo: 'Polarizado arquitectónico', tono: '#a16207', foto: '/fotos/arquitectonico.webp' },
]

const basePasos = [
  { t: 'Escríbenos', d: 'Por WhatsApp o DM. Cuéntanos tu auto y lo que buscas.' },
  { t: 'Asesoría', d: 'Te recomendamos la lámina ideal para tu uso y presupuesto.' },
  { t: 'Instalación', d: 'Trabajo de precisión en nuestro taller de Mall Plaza América.' },
  { t: 'Entrega', d: 'Revisión final contigo y recomendaciones de cuidado.' },
]

const baseFaqs = [
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
    q: '¿Qué otros servicios tienen?',
    a: 'Además de polarizado y PPF, en VP Unicars hacemos audio, corta corriente e inmovilizadores, sistemas de seguridad, iluminación, electricidad automotriz y grabado de patentes. Todo se cotiza por nuestro WhatsApp.',
  },
  {
    q: '¿Atienden a domicilio?',
    a: 'Algunos trabajos los realizamos a domicilio. Escríbenos por WhatsApp y coordinamos el día y la hora.',
  },
  {
    q: '¿Cómo agendo?',
    a: 'Escríbenos por WhatsApp o por DM en Instagram y coordinamos tu hora en Mall Plaza América, Rancagua (nivel -1, sector Hotel).',
  },
]

// Las fotos subidas desde el panel viven en el backend: en producción se antepone su dirección
const API_ORIGEN = (import.meta.env.VITE_API_URL || '').replace(/\/api\/?$/, '')
export const urlFoto = (f) => (f && f.startsWith('/uploads/') ? `${API_ORIGEN}${f}` : f)

// Cada ítem de lista lleva un id para poder editarlo, moverlo u ocultarlo
const conId = (lista, clave) => lista.map((x, i) => ({ id: x.id || `${clave}-${i + 1}`, ...x }))

// Contenido original en el mismo formato que guarda el panel
export const base = {
  negocio: baseNegocio,
  servicios: baseServicios,
  masServicios: baseMasServicios,
  trabajos: conId(baseTrabajos, 'trabajo'),
  autos: baseAutos.map((nombre, i) => ({ id: `auto-${i + 1}`, nombre })),
  stats: baseStats,
  niveles: conId(baseNiveles, 'nivel'),
  polarizado: basePolarizado,
  resenas: conId(baseResenas, 'resena'),
  videosTv: baseVideosTv,
  pasos: conId(basePasos, 'paso'),
  faqs: conId(baseFaqs, 'faq'),
}

/* --------- Lo que usan los componentes (se rellena con aplicarContenido) --------- */
export const negocio = { ...baseNegocio }
export const servicios = []
export const masServicios = []
export const trabajos = []
export const autos = []
export const stats = []
export const niveles = []
export const polarizado = { ...basePolarizado }
export const resenas = []
export const videosTv = []
export const pasos = []
export const faqs = []

const reemplazar = (arr, nuevos) => { arr.splice(0, arr.length, ...nuevos) }
const seccion = (c, clave) => (Array.isArray(c[clave]) ? c[clave] : base[clave]).filter((x) => !x.oculto)

// c = contenido guardado en la base de datos (las secciones que no vienen usan el original)
export function aplicarContenido(c = {}) {
  Object.assign(negocio, baseNegocio, c.negocio || {})
  const lugar = encodeURIComponent(negocio.direccion)
  negocio.mapa = `https://www.google.com/maps?q=${lugar}&output=embed`
  negocio.mapaLink = `https://maps.google.com/?q=${lugar}`

  reemplazar(servicios, seccion(c, 'servicios').map((s, i) => ({
    ...s, num: String(i + 1).padStart(2, '0'), tags: s.tags || [], foto: urlFoto(s.foto),
  })))
  reemplazar(masServicios, seccion(c, 'masServicios').map((s) => ({ ...s, foto: urlFoto(s.foto) })))
  reemplazar(trabajos, seccion(c, 'trabajos').map((t) => ({ ...t, tono: t.tono || '#ffe600', foto: urlFoto(t.foto) })))
  reemplazar(autos, seccion(c, 'autos').map((a) => a.nombre))
  reemplazar(stats, seccion(c, 'stats').map((s) => ({ ...s, valor: Number(s.valor) || 0, decimales: Number(s.decimales) || 0 })))
  reemplazar(niveles, seccion(c, 'niveles').map((n) => ({ ...n, beneficios: n.beneficios || [], foto: urlFoto(n.foto) })))
  Object.assign(polarizado, basePolarizado, c.polarizado || {})
  reemplazar(resenas, seccion(c, 'resenas').map((r) => ({ ...r, estrellas: Math.min(5, Math.max(1, Number(r.estrellas) || 5)) })))
  reemplazar(videosTv, seccion(c, 'videosTv').filter((v) => v.video).map((v) => ({ ...v, video: urlFoto(v.video) })))
  negocio.calificacion = Number(negocio.calificacion) || 0
  negocio.totalResenas = Number(negocio.totalResenas) || 0
  reemplazar(pasos, seccion(c, 'pasos'))
  reemplazar(faqs, seccion(c, 'faqs'))
}
aplicarContenido()
