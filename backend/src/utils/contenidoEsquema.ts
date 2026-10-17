// Esquema del contenido editable de la página.
// ES LA ÚNICA FUENTE: el backend lo usa para validar y el panel de Mantención lo usa para dibujar los formularios.
// Para que el cliente pueda editar algo nuevo basta con agregar el campo o la sección aquí
// (y que el componente de la página lo use).

export type TipoCampo = "texto" | "textoLargo" | "numero" | "tags" | "foto" | "video" | "color" | "opcion" | "booleano" | "url" | "telefono";

export interface Campo {
  clave: string;
  etiqueta: string;
  tipo: TipoCampo;
  max?: number; // largo máximo (texto) o valor máximo (número)
  min?: number;
  requerido?: boolean;
  ayuda?: string;
  placeholder?: string;
  opciones?: { valor: string; etiqueta: string }[];
}

export interface Seccion {
  clave: string;
  titulo: string;
  descripcion: string;
  tipo: "objeto" | "lista";
  campos: Campo[];
  maxItems?: number;
  nombreItem?: string; // "servicio", "pregunta"… para los botones "Agregar servicio"
  titular?: string; // campo que se muestra como título de cada ítem
}

const FOTO_AYUDA = "Sube una foto o elige una de las que ya están en la página.";

export const SECCIONES: Seccion[] = [
  {
    clave: "negocio",
    titulo: "Datos del negocio",
    descripcion: "Contacto, dirección y horario que aparecen en toda la página.",
    tipo: "objeto",
    campos: [
      { clave: "whatsapp", etiqueta: "WhatsApp (con 56)", tipo: "telefono", requerido: true, placeholder: "56930235194", ayuda: "Todos los botones de cotizar van a este número." },
      { clave: "whatsappTexto", etiqueta: "Mensaje inicial de WhatsApp", tipo: "textoLargo", max: 200 },
      { clave: "instagram", etiqueta: "Link de Instagram", tipo: "url", max: 200 },
      { clave: "tiktok", etiqueta: "Link de TikTok", tipo: "url", max: 200, ayuda: "Déjalo vacío para no mostrar TikTok." },
      { clave: "facebook", etiqueta: "Link de Facebook", tipo: "url", max: 200, ayuda: "Déjalo vacío para no mostrar Facebook." },
      { clave: "direccion", etiqueta: "Dirección", tipo: "texto", max: 120, requerido: true, ayuda: "El mapa de la página se arma con esta dirección." },
      { clave: "ubicacion", etiqueta: "Ubicación dentro del mall", tipo: "texto", max: 80, placeholder: "Nivel -1 · Sector Hotel", ayuda: "Se muestra bajo la dirección para que el cliente llegue directo." },
      { clave: "horario", etiqueta: "Horario", tipo: "texto", max: 80 },
      { clave: "horarioNota", etiqueta: "Nota del horario", tipo: "textoLargo", max: 200 },
      { clave: "resenaUrl", etiqueta: "Link para dejar reseña en Google", tipo: "url", max: 300, ayuda: "El botón “Dejar mi reseña” abre este link (ficha de Google del negocio)." },
      { clave: "googleUrl", etiqueta: "Link de la ficha en Google Maps", tipo: "url", max: 300, ayuda: "Para el botón “Ver todas en Google”." },
      { clave: "calificacion", etiqueta: "Calificación en Google", tipo: "numero", min: 0, max: 5, ayuda: "Ej: 5 o 4,9. Se actualiza sola si está conectada la API de Google." },
      { clave: "totalResenas", etiqueta: "Cantidad de reseñas en Google", tipo: "numero", min: 0, max: 100000 },
    ],
  },
  {
    clave: "servicios",
    titulo: "Servicios principales",
    descripcion: "Las tarjetas grandes que se deslizan en la sección “Lo que hacemos”.",
    tipo: "lista",
    maxItems: 20,
    nombreItem: "servicio",
    titular: "titulo",
    campos: [
      { clave: "titulo", etiqueta: "Nombre", tipo: "texto", max: 40, requerido: true, placeholder: "Ej: PPF" },
      { clave: "sub", etiqueta: "Subtítulo", tipo: "texto", max: 60, placeholder: "Ej: Paint Protection Film" },
      { clave: "texto", etiqueta: "Descripción", tipo: "textoLargo", max: 400 },
      { clave: "tags", etiqueta: "Etiquetas", tipo: "tags", max: 30, ayuda: "Escribe y presiona Enter. Máximo 8." },
      { clave: "foto", etiqueta: "Foto", tipo: "foto", ayuda: FOTO_AYUDA },
      {
        clave: "art", etiqueta: "Dibujo (si no tiene foto)", tipo: "opcion",
        opciones: [
          { valor: "shield", etiqueta: "Escudo" }, { valor: "tint", etiqueta: "Vidrio polarizado" }, { valor: "lock", etiqueta: "Candado" },
          { valor: "light", etiqueta: "Foco" }, { valor: "wrap", etiqueta: "Wrap" }, { valor: "building", etiqueta: "Edificio" },
          { valor: "stars", etiqueta: "Estrellas" },
        ],
      },
    ],
  },
  {
    clave: "masServicios",
    titulo: "Más servicios",
    descripcion: "Audio, seguridad, iluminación… las tarjetas chicas.",
    tipo: "lista",
    maxItems: 30,
    nombreItem: "servicio",
    titular: "titulo",
    campos: [
      { clave: "titulo", etiqueta: "Nombre", tipo: "texto", max: 60, requerido: true },
      { clave: "texto", etiqueta: "Descripción", tipo: "textoLargo", max: 300 },
      {
        clave: "icono", etiqueta: "Ícono", tipo: "opcion",
        opciones: [
          { valor: "audio", etiqueta: "Parlante" }, { valor: "corriente", etiqueta: "Encendido" }, { valor: "seguridad", etiqueta: "Alarma" },
          { valor: "luces", etiqueta: "Ampolleta" }, { valor: "electricidad", etiqueta: "Rayo" }, { valor: "grabado", etiqueta: "Patente" },
          { valor: "herramienta", etiqueta: "Herramienta" }, { valor: "auto", etiqueta: "Auto" }, { valor: "estrella", etiqueta: "Estrella" },
        ],
      },
      { clave: "foto", etiqueta: "Foto (opcional, reemplaza al ícono)", tipo: "foto", ayuda: FOTO_AYUDA },
    ],
  },
  {
    clave: "trabajos",
    titulo: "Trabajos destacados (garage)",
    descripcion: "Las fotos de trabajos reales de la sección “El garage”.",
    tipo: "lista",
    maxItems: 24,
    nombreItem: "trabajo",
    titular: "auto",
    campos: [
      { clave: "auto", etiqueta: "Auto o proyecto", tipo: "texto", max: 60, requerido: true, placeholder: "Ej: BMW 520i" },
      { clave: "trabajo", etiqueta: "Trabajo realizado", tipo: "texto", max: 80, placeholder: "Ej: Nanocerámico 20%" },
      { clave: "foto", etiqueta: "Foto", tipo: "foto", ayuda: FOTO_AYUDA },
      { clave: "tono", etiqueta: "Color de acento", tipo: "color" },
    ],
  },
  {
    clave: "autos",
    titulo: "Autos trabajados (cinta animada)",
    descripcion: "Los nombres que pasan en la cinta debajo del garage.",
    tipo: "lista",
    maxItems: 40,
    nombreItem: "auto",
    titular: "nombre",
    campos: [{ clave: "nombre", etiqueta: "Auto", tipo: "texto", max: 50, requerido: true }],
  },
  {
    clave: "stats",
    titulo: "Números destacados",
    descripcion: "Los contadores animados (trabajos, seguidores…).",
    tipo: "lista",
    maxItems: 6,
    nombreItem: "número",
    titular: "label",
    campos: [
      { clave: "label", etiqueta: "Texto", tipo: "texto", max: 40, requerido: true, placeholder: "Ej: Trabajos realizados" },
      { clave: "valor", etiqueta: "Número", tipo: "numero", min: 0, max: 100000000, requerido: true },
      { clave: "decimales", etiqueta: "Decimales", tipo: "numero", min: 0, max: 2 },
      { clave: "prefijo", etiqueta: "Antes del número", tipo: "texto", max: 5, placeholder: "+" },
      { clave: "sufijo", etiqueta: "Después del número", tipo: "texto", max: 5, placeholder: "K, %" },
      {
        clave: "icono", etiqueta: "Ícono", tipo: "opcion",
        opciones: [
          { valor: "trofeo", etiqueta: "Trofeo" }, { valor: "instagram", etiqueta: "Instagram" }, { valor: "fotos", etiqueta: "Fotos" },
          { valor: "sol", etiqueta: "Sol" }, { valor: "estrella", etiqueta: "Estrella" }, { valor: "auto", etiqueta: "Auto" },
        ],
      },
    ],
  },
  {
    clave: "niveles",
    titulo: "Tipos de polarizado",
    descripcion: "Las tarjetas de Estándar, Nanocarbón y Nanocerámico con sus datos técnicos.",
    tipo: "lista",
    maxItems: 5,
    nombreItem: "tipo",
    titular: "nombre",
    campos: [
      { clave: "nombre", etiqueta: "Nombre", tipo: "texto", max: 40, requerido: true, placeholder: "Ej: Nanocerámico" },
      { clave: "nivel", etiqueta: "Nivel", tipo: "texto", max: 20, placeholder: "Básico, Intermedio, Premium" },
      { clave: "desc", etiqueta: "Descripción corta", tipo: "textoLargo", max: 200 },
      { clave: "uv", etiqueta: "Protección UV (%)", tipo: "numero", min: 0, max: 100, ayuda: "Déjalo vacío si no aplica." },
      { clave: "ir", etiqueta: "Rechazo infrarrojo / calor (%)", tipo: "numero", min: 0, max: 100, ayuda: "Déjalo vacío si no aplica." },
      { clave: "beneficios", etiqueta: "Beneficios", tipo: "tags", max: 40, ayuda: "Escribe y presiona Enter. Máximo 8." },
      { clave: "foto", etiqueta: "Foto", tipo: "foto", ayuda: FOTO_AYUDA },
      { clave: "destacado", etiqueta: "Marcar como “Más elegido”", tipo: "booleano" },
    ],
  },
  {
    clave: "polarizado",
    titulo: "Tonos y garantías del polarizado",
    descripcion: "Los tonos disponibles y los sellos que aparecen bajo los tipos de polarizado.",
    tipo: "objeto",
    campos: [
      { clave: "tonos", etiqueta: "Tonos disponibles (% de luz que pasa)", tipo: "tags", max: 4, ayuda: "Solo el número. Ej: 5, 20, 35, 50, 70." },
      { clave: "sellos", etiqueta: "Sellos", tipo: "tags", max: 30, ayuda: "Ej: Material americano, Instalación profesional." },
    ],
  },
  {
    clave: "pasos",
    titulo: "Cómo trabajamos (pasos)",
    descripcion: "Los pasos del proceso: escríbenos, asesoría, instalación…",
    tipo: "lista",
    maxItems: 8,
    nombreItem: "paso",
    titular: "t",
    campos: [
      { clave: "t", etiqueta: "Título", tipo: "texto", max: 40, requerido: true },
      { clave: "d", etiqueta: "Descripción", tipo: "textoLargo", max: 200 },
    ],
  },
  {
    clave: "resenas",
    titulo: "Reseñas de clientes",
    descripcion: "El carrusel de reseñas. Copia aquí las reseñas de Google (si la API de Google está conectada, se muestran solas).",
    tipo: "lista",
    maxItems: 40,
    nombreItem: "reseña",
    titular: "autor",
    campos: [
      { clave: "autor", etiqueta: "Nombre", tipo: "texto", max: 60, requerido: true },
      { clave: "texto", etiqueta: "Reseña", tipo: "textoLargo", max: 600, requerido: true },
      { clave: "estrellas", etiqueta: "Estrellas (1 a 5)", tipo: "numero", min: 1, max: 5 },
      { clave: "fecha", etiqueta: "Fecha", tipo: "texto", max: 30, placeholder: "Ej: ago 2026" },
    ],
  },
  {
    clave: "videosTv",
    titulo: "Videos de la TV (/videos)",
    descripcion: "Los videos que se repiten en vpunicars.cl/videos, para la televisión del local. Se reproducen en este orden.",
    tipo: "lista",
    maxItems: 30,
    nombreItem: "video",
    titular: "titulo",
    campos: [
      { clave: "titulo", etiqueta: "Nombre (solo para ordenarlos)", tipo: "texto", max: 60, requerido: true },
      { clave: "video", etiqueta: "Video", tipo: "video", requerido: true, ayuda: "MP4 horizontal (16:9) para la TV. Se puede subir desde aquí." },
    ],
  },
  {
    clave: "faqs",
    titulo: "Preguntas frecuentes",
    descripcion: "Preguntas y respuestas al final de la página.",
    tipo: "lista",
    maxItems: 30,
    nombreItem: "pregunta",
    titular: "q",
    campos: [
      { clave: "q", etiqueta: "Pregunta", tipo: "texto", max: 200, requerido: true },
      { clave: "a", etiqueta: "Respuesta", tipo: "textoLargo", max: 800, requerido: true },
    ],
  },
];

/* ------------------------------ Validación ------------------------------ */
const FOTO_VALIDA = /^\/(fotos|uploads\/fotos)\/[\w.-]+$/;
const VIDEO_VALIDO = /^\/(tv|uploads\/videos)\/[\w.-]+$/;
const COLOR_VALIDO = /^#[0-9a-fA-F]{6}$/;
const URL_VALIDA = /^https:\/\/[^\s"'<>]+$/;

const limpiarCampo = (campo: Campo, v: unknown): unknown => {
  switch (campo.tipo) {
    case "numero": {
      const n = Number(v);
      if (v === "" || v == null || !Number.isFinite(n)) return null;
      return Math.min(campo.max ?? Infinity, Math.max(campo.min ?? -Infinity, n));
    }
    case "booleano":
      return Boolean(v);
    case "tags":
      return Array.isArray(v) ? v.map((t) => String(t ?? "").trim().slice(0, campo.max ?? 30)).filter(Boolean).slice(0, 8) : [];
    case "foto":
      return FOTO_VALIDA.test(String(v ?? "")) ? String(v) : "";
    case "video":
      return VIDEO_VALIDO.test(String(v ?? "")) ? String(v) : "";
    case "color":
      return COLOR_VALIDO.test(String(v ?? "")) ? String(v) : "";
    case "url":
      return URL_VALIDA.test(String(v ?? "").trim()) ? String(v).trim().slice(0, campo.max ?? 300) : "";
    case "telefono":
      return String(v ?? "").replace(/\D/g, "").slice(0, 15);
    case "opcion":
      return campo.opciones?.some((o) => o.valor === v) ? v : (campo.opciones?.[0]?.valor ?? "");
    default:
      return String(v ?? "").trim().slice(0, campo.max ?? 200);
  }
};

const limpiarObjeto = (seccion: Seccion, obj: Record<string, unknown>) => {
  const salida: Record<string, unknown> = {};
  const faltan: string[] = [];
  for (const campo of seccion.campos) {
    const valor = limpiarCampo(campo, obj?.[campo.clave]);
    if (campo.requerido && (valor === "" || valor === null)) faltan.push(campo.etiqueta);
    salida[campo.clave] = valor;
  }
  return { salida, faltan };
};

const nuevoId = () => Math.random().toString(36).slice(2, 10);

// Devuelve el contenido limpio o un error legible para mostrar en el panel
export const limpiarContenido = (body: unknown): { contenido?: Record<string, unknown>; error?: string } => {
  const b = (body && typeof body === "object" ? body : {}) as Record<string, unknown>;
  const contenido: Record<string, unknown> = { version: 2 };

  for (const seccion of SECCIONES) {
    const valor = b[seccion.clave];
    if (valor === undefined || valor === null) continue; // sección sin cambios: la página usa la original

    if (seccion.tipo === "objeto") {
      const { salida, faltan } = limpiarObjeto(seccion, valor as Record<string, unknown>);
      if (faltan.length) return { error: `${seccion.titulo}: falta ${faltan.join(", ")}` };
      contenido[seccion.clave] = salida;
      continue;
    }

    if (!Array.isArray(valor)) return { error: `${seccion.titulo}: formato inválido` };
    if (valor.length > (seccion.maxItems ?? 50)) return { error: `${seccion.titulo}: máximo ${seccion.maxItems} elementos` };

    const ids = new Set<string>();
    const lista = [];
    for (const [i, item] of valor.entries()) {
      const { salida, faltan } = limpiarObjeto(seccion, item as Record<string, unknown>);
      if (faltan.length) return { error: `${seccion.titulo} (#${i + 1}): falta ${faltan.join(", ")}` };
      let id = String((item as Record<string, unknown>)?.id ?? "").replace(/[^\w-]/g, "").slice(0, 40) || nuevoId();
      while (ids.has(id)) id = nuevoId();
      ids.add(id);
      lista.push({ id, oculto: Boolean((item as Record<string, unknown>)?.oculto), ...salida });
    }
    contenido[seccion.clave] = lista;
  }

  return { contenido };
};
