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
    foto: '/fotos/hogar-espejo-madera.webp',
    num: '06',
    titulo: 'Arquitectónico',
    sub: 'Hogar · Oficinas · Locales',
    texto: 'Polarizado espejo y control solar para casas y oficinas: de día ves hacia afuera y desde la calle solo se ve el reflejo. Menos calor, protección UV y cero cortinas. Vamos a domicilio.',
    tags: ['Espejo', 'Bronce', 'Control solar', 'A domicilio'],
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
  { id: 'electricidad', titulo: 'Electricidad automotriz', texto: 'Instalaciones y trabajos eléctricos en tu vehículo.', icono: 'electricidad' },
  { id: 'grabado', titulo: 'Grabado de patentes', texto: 'Grabado de patente en los vidrios de tu auto.', icono: 'grabado' },
  { id: 'empavonado', titulo: 'Empavonado de vidrios', texto: 'Vinilo esmerilado para puertas, baños y oficinas: privacidad sin perder luz. También con tu logo.', icono: 'empavonado' },
  { id: 'flotas', titulo: 'Branding de flotas', texto: 'Cambio de color y ploteo de furgones y vehículos de empresa con la imagen de tu marca.', icono: 'flota' },
  { id: 'nautico', titulo: 'Polarizado náutico', texto: 'Láminas para lanchas y yates: menos calor, protección UV y privacidad a bordo.', icono: 'barco' },
  { id: 'motos', titulo: 'Ahumado de micas de moto', texto: 'Parabrisas y micas de moto ahumados con vinilo o PPF: más estilo y protección.', icono: 'moto' },
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

// Portafolio: trabajos reales de VP Unicars (fotos de octubre 2026). La foto "-mini" se usa en la grilla.
export const categoriasPortafolio = [
  ['polarizado', 'Polarizado'], ['ppf', 'PPF'], ['personalizacion', 'Personalización'],
  ['hogar', 'Hogar y oficina'], ['flotas', 'Flotas y furgones'], ['motos', 'Motos'],
  ['tecnologia', 'Pantallas y seguridad'], ['nautico', 'Náutico'],
]
const P = (n) => `/fotos/portafolio/${n}.webp`
const DESTACADOS = ['porsche-ppf', 'polarizado-audi-a4', 'furgon-personalizacion-2', 'cielo-estrellado-2', 'bmw-520i', 'pantalla-volvo-despues',
  'tornasol', 'polarizado-lancha', 'territory-ppf', 'hogar-ventanales']
const basePortafolio = [
  ['pantalla-volvo-despues', 'Pantalla Android en Volvo: después', 'tecnologia'],
  ['polarizado-lancha', 'Polarizado en lancha', 'nautico'],
  ['polarizado-audi-a4', 'Polarizado en Audi A4', 'polarizado'],
  ['pulido-de-focos', 'Pulido de focos', 'tecnologia'],
  ['hogar-ventanal-instalacion', 'Instalando lámina en ventanal', 'hogar'],
  ['cielo-estrellado-2', 'Cielo estrellado con fibra óptica', 'personalizacion'],
  ['furgon-personalizacion-2', 'Furgón con cambio de color completo', 'flotas'],
  ['polarizado-espejo-caseta-de-vigilancia', 'Polarizado espejo en caseta de vigilancia', 'hogar'],
  ['ahumado-de-mica-moto', 'Ahumado de mica en moto deportiva', 'motos'],
  ['polarizado-full-black', 'Polarizado full black', 'polarizado'],
  ['personalizacion-de-consola-central-con-fibra-de-carbono', 'Consola central en fibra de carbono', 'personalizacion'],
  ['empovanado-con-logo-para-oficina', 'Empavonado con logo para oficina', 'hogar'],
  ['ppf-en-volante', 'PPF en volante BMW', 'ppf'],
  ['polarizado-nanoceramico-certificado', 'Polarizado nanocerámico certificado', 'polarizado'],
  ['personalizacion-con-vinilo-fucsia', 'Detalles en vinilo fucsia', 'personalizacion'],
  ['furgon-personalizacion-3', 'Instalación de vinilo en furgón', 'flotas'],
  ['polarizado-espejo-maxima-privacidad', 'Polarizado espejo: máxima privacidad', 'hogar'],
  ['cielo-estrellado', 'Instalando un cielo estrellado', 'personalizacion'],
  ['polarizado-5-infiel', 'Polarizado 5% “infiel”', 'polarizado'],
  ['ahumado-de-mica-1', 'Ahumado de mica: en proceso', 'motos'],
  ['personalizacion-de-pilares', 'Pilares en carbono forjado', 'personalizacion'],
  ['empavonado-oficina', 'Empavonado en puertas de oficina', 'hogar'],
  ['polarizado-oscuro', 'Polarizado oscuro en SUV', 'polarizado'],
  ['furgon-personalizacion', 'Furgón de empresa con franjas reflectivas', 'flotas'],
  ['personalizacion-de-espejos-con-vinilos', 'Espejos en vinilo', 'personalizacion'],
  ['personalizacion-con-fibra-de-carbono', 'Interior en fibra de carbono', 'personalizacion'],
  ['polarizado', 'Polarizado en Dodge', 'polarizado'],
  ['empavonado-casa', 'Empavonado en puerta de casa', 'hogar'],
  ['ahumado-de-mica-moto-3', 'Mica ahumada lista para instalar', 'motos'],
  ['personalizacion-de-consola-3', 'Consola con vinilo carbono', 'personalizacion'],
  ['furgon-personalizacion-1', 'Furgón: de blanco a amarillo', 'flotas'],
  ['personalizacion-de-interior-con-vinilo', 'Interior con vinilo carbono forjado', 'personalizacion'],
  ['polarizado-espejo-maxima', 'Polarizado espejo en casa', 'hogar'],
  ['personalizacion-con-vinilo', 'Parrilla y detalles en vinilo', 'personalizacion'],
  ['personalizacion-de-consola-2', 'Consola desmontada para personalizar', 'personalizacion'],
  ['pantalla-volvo-antes', 'Volvo antes de la pantalla nueva', 'tecnologia'],
  ['faros-ojos-de-angel', 'Faros con ojos de ángel', 'tecnologia'],
  ['polarizado-lancha-2', 'Lámina en vidrios de yate', 'nautico'],
  ['pantalla-android-cruze', 'Pantalla vertical en Chevrolet Cruze', 'tecnologia'],
  ['instalacion-inmovilizador', 'Instalación de inmovilizador', 'tecnologia'],
  ['polarizado-luneta', 'Polarizado de luneta trasera', 'polarizado'],
  ['hogar-ventanal-lamina', 'Lámina de control solar en casa', 'hogar'],
].map(([n, titulo, categoria]) => ({ id: n, titulo, categoria, foto: P(n) }))
  .concat([
    ['porsche-ppf.jpg', 'PPF en Porsche 911 Turbo S', 'ppf'],
    ['bmw-520i.jpg', 'BMW 520i: nanocarbon + nanocerámica', 'polarizado'],
    ['tornasol.webp', 'Polarizado tornasol en VW Golf GTI', 'polarizado'],
    ['territory-ppf.jpg', 'PPF en piano black de Ford Territory', 'ppf'],
    ['piano-black.jpg', 'Porsche 911: PPF en piano black', 'ppf'],
    ['nanoceramico.jpg', 'Nanocerámico 20%: máxima privacidad', 'polarizado'],
    ['kill-chrome.jpg', 'Kill chrome: del cromo al negro', 'personalizacion'],
    ['personalizacion.jpg', 'PPF ahumado + kill chrome', 'personalizacion'],
    ['pilares-carbono.jpg', 'Pilares en carbono forjado', 'personalizacion'],
    ['fibra-carbono.webp', 'Detalles en fibra de carbono', 'personalizacion'],
    ['ahumado-focos.webp', 'Ahumado de focos', 'personalizacion'],
    ['nanocarbon.jpg', 'Polarizado nanocarbon', 'polarizado'],
    ['polarizado-5.webp', 'Polarizado 5%', 'polarizado'],
    ['privacidad.jpg', 'Polarizado de privacidad', 'polarizado'],
    ['laminas-seguridad.webp', 'Lámina de seguridad', 'polarizado'],
    ['pilares-ppf.webp', 'PPF en pilares', 'ppf'],
    ['ppf-moto.webp', 'PPF en tablero de moto', 'ppf'],
    ['ppf-trabajos.webp', 'PPF en interior', 'ppf'],
    ['hogar-ventanales.webp', 'Ventanales con polarizado espejo', 'hogar'],
    ['hogar-espejo-ladrillo.webp', 'Casa de ladrillo con lámina espejo', 'hogar'],
    ['hogar-espejo-madera.webp', 'Casa con polarizado espejo', 'hogar'],
    ['hogar-espejo-patio.webp', 'Lámina espejo hacia el patio', 'hogar'],
    ['hogar-instalacion.webp', 'Instalación a domicilio', 'hogar'],
    ['hogar-antes-despues.webp', 'Antes y después: vidrio con y sin lámina', 'hogar'],
    ['arquitectonico-bronce.webp', 'Lámina bronce en edificio', 'hogar'],
  ].map(([f, titulo, categoria]) => ({ id: f.replace(/\.\w+$/, ''), titulo, categoria, foto: P(f.replace(/\.\w+$/, '')) })))
  // Los destacados también se muestran en "El garage"
  .map((x) => ({ ...x, destacado: DESTACADOS.includes(x.id) }))
  // Primero los destacados (en el orden de DESTACADOS), después el resto
  .sort((x, y) => (DESTACADOS.indexOf(x.id) + 1 || 99) - (DESTACADOS.indexOf(y.id) + 1 || 99))

// Videos de la pantalla /videos (TV del local)
// Tecnología y seguridad: videos cortos verticales (en /public/clips, con su póster .jpg)
const baseTecnologia = [
  ['pantalla-android', 'Pantallas Android', 'Pantallas táctiles grandes, con cámara, GPS y apps.', 'Multimedia'],
  ['carplay', 'Apple CarPlay y Android Auto', 'Tu celular en la pantalla del auto: mapas, música y llamadas.', 'Multimedia'],
  ['camara-retroceso', 'Cámara de retroceso', 'Estaciona con guías en pantalla, sin adivinar.', 'Seguridad'],
  ['inmovilizador', 'Inmovilizador inalámbrico', 'Si no estás tú, el auto no arranca.', 'Seguridad'],
  ['alarma', 'Alarmas y cierre centralizado', 'Control remoto, sensores y bloqueo de puertas.', 'Seguridad'],
  ['faros-led', 'Luces LED', 'Más luz y un look moderno de noche.', 'Iluminación'],
  ['pulido-focos', 'Pulido de focos', 'Del amarillo opaco a transparente como nuevo.', 'Estética'],
  ['luces-ambiente', 'Luces de ambiente', 'Tiras LED RGB en el interior, del color que quieras.', 'Iluminación'],
  ['audio', 'Audio', 'Parlantes, radios y amplificadores bien instalados.', 'Audio'],
  ['cielo-estrellado', 'Cielo estrellado', 'Fibra óptica con colores en el techo.', 'Personalización'],
].map(([n, titulo, texto, etiqueta]) => ({ id: `tec-${n}`, titulo, texto, etiqueta, video: `/clips/${n}.mp4` }))

// Comparador antes / después: fotos alineadas del mismo auto (en /public/fotos/comparar)
const baseComparaciones = [
  { id: 'cmp-audi-a4', titulo: 'Audi A4 · polarizado', detalle: 'Mismo auto, mismo lugar, sin filtros. Foto real de nuestro taller.',
    antes: '/fotos/comparar/audi-a4-antes.webp', despues: '/fotos/comparar/audi-a4-despues.webp', etiquetaAntes: 'Sin polarizado', etiquetaDespues: 'Con polarizado' },
]

const baseVideosTv = [
  { id: 'tv-vp-unicars', titulo: 'VP Unicars · promocional', video: '/tv/vp-unicars.mp4' },
  { id: 'tv-asi-trabajamos', titulo: 'Así trabajamos · procesos reales', video: '/tv/vp-asi-trabajamos.mp4' },
  { id: 'tv-elige-tu-polarizado', titulo: 'Elige tu polarizado', video: '/tv/vp-elige-tu-polarizado.mp4' },
  { id: 'tv-clientes-felices', titulo: 'Clientes felices · reseñas', video: '/tv/vp-clientes-felices.mp4' },
  { id: 'tv-tu-hogar', titulo: 'Polarizado para tu hogar', video: '/tv/vp-tu-hogar.mp4' },
  { id: 'tv-hazlo-unico', titulo: 'Hazlo único · personalización', video: '/tv/vp-hazlo-unico.mp4' },
  { id: 'tv-tecnologia', titulo: 'Tecnología y seguridad', video: '/tv/vp-tecnologia.mp4' },
  { id: 'tv-antes-despues', titulo: 'Antes y después · Audi A4', video: '/tv/vp-antes-despues.mp4' },
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
  autos: baseAutos.map((nombre, i) => ({ id: `auto-${i + 1}`, nombre })),
  stats: baseStats,
  niveles: conId(baseNiveles, 'nivel'),
  polarizado: basePolarizado,
  resenas: conId(baseResenas, 'resena'),
  videosTv: baseVideosTv,
  portafolio: basePortafolio,
  tecnologia: baseTecnologia,
  comparaciones: baseComparaciones,
  pasos: conId(basePasos, 'paso'),
  faqs: conId(baseFaqs, 'faq'),
}

/* --------- Lo que usan los componentes (se rellena con aplicarContenido) --------- */
export const negocio = { ...baseNegocio }
export const servicios = []
export const masServicios = []
export const autos = []
export const stats = []
export const niveles = []
export const polarizado = { ...basePolarizado }
export const resenas = []
export const videosTv = []
export const portafolio = []
export const tecnologia = []
export const comparaciones = []
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
  reemplazar(autos, seccion(c, 'autos').map((a) => a.nombre))
  reemplazar(stats, seccion(c, 'stats').map((s) => ({ ...s, valor: Number(s.valor) || 0, decimales: Number(s.decimales) || 0 })))
  reemplazar(niveles, seccion(c, 'niveles').map((n) => ({ ...n, beneficios: n.beneficios || [], foto: urlFoto(n.foto) })))
  Object.assign(polarizado, basePolarizado, c.polarizado || {})
  reemplazar(resenas, seccion(c, 'resenas').map((r) => ({ ...r, estrellas: Math.min(5, Math.max(1, Number(r.estrellas) || 5)) })))
  reemplazar(portafolio, seccion(c, 'portafolio').filter((x) => x.foto).map((x) => ({ ...x, foto: urlFoto(x.foto), mini: x.foto.startsWith('/fotos/portafolio/') ? x.foto.replace(/\.webp$/, '-mini.webp') : urlFoto(x.foto) })))
  reemplazar(tecnologia, seccion(c, 'tecnologia').filter((x) => x.video).map((x) => ({ ...x, video: urlFoto(x.video), poster: x.video.startsWith('/clips/') ? x.video.replace(/\.mp4$/, '.jpg') : undefined })))
  reemplazar(comparaciones, seccion(c, 'comparaciones').filter((x) => x.antes && x.despues).map((x) => ({ ...x, antes: urlFoto(x.antes), despues: urlFoto(x.despues) })))
  reemplazar(videosTv, seccion(c, 'videosTv').filter((v) => v.video).map((v) => ({ ...v, video: urlFoto(v.video) })))
  negocio.calificacion = Number(negocio.calificacion) || 0
  negocio.totalResenas = Number(negocio.totalResenas) || 0
  reemplazar(pasos, seccion(c, 'pasos'))
  reemplazar(faqs, seccion(c, 'faqs'))
}
aplicarContenido()
