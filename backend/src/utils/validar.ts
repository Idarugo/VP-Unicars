// Validaciones y limpieza de datos de entrada
export const texto = (v: unknown, max: number): string => String(v ?? "").trim().slice(0, max);

export const textoOpcional = (v: unknown, max: number): string | null => {
  const t = texto(v, max);
  return t ? t : null;
};

export const esFecha = (v: unknown): v is string => typeof v === "string" && /^\d{4}-\d{2}-\d{2}$/.test(v) && !Number.isNaN(Date.parse(v));

export const esHora = (v: unknown): v is string => typeof v === "string" && /^\d{2}:\d{2}(:\d{2})?$/.test(v);

// Patentes chilenas: AA1234 (antigua), BBBB12 (nueva), motos AAA12 / AAA123
export const limpiarPatente = (v: unknown) => String(v ?? "").toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 8);
export const patenteValida = (p: string) => /^([A-Z]{2}\d{4}|[A-Z]{4}\d{2}|[A-Z]{3}\d{2,3})$/.test(p);

export const porcentaje = (v: unknown): number | null => {
  const n = Number(v);
  return Number.isInteger(n) && n >= 1 && n <= 100 ? n : null;
};

export const telefono = (v: unknown): string | null => {
  const d = String(v ?? "").replace(/[^\d+]/g, "").slice(0, 16);
  return d || null;
};

export const color = (v: unknown, defecto = "#ffc800") => (typeof v === "string" && /^#[0-9a-fA-F]{6}$/.test(v) ? v : defecto);

// RUT chileno con dígito verificador (módulo 11). Devuelve "77.429.138-5" o null si no es válido.
export const rutFormateado = (v: unknown): string | null => {
  const s = String(v ?? "").toUpperCase().replace(/[^0-9K]/g, "");
  if (s.length < 2 || s.length > 9) return null;
  const cuerpo = s.slice(0, -1);
  const dv = s.slice(-1);
  if (!/^\d+$/.test(cuerpo)) return null;
  let suma = 0;
  let mult = 2;
  for (let i = cuerpo.length - 1; i >= 0; i--) {
    suma += Number(cuerpo[i]) * mult;
    mult = mult === 7 ? 2 : mult + 1;
  }
  const r = 11 - (suma % 11);
  const esperado = r === 11 ? "0" : r === 10 ? "K" : String(r);
  if (dv !== esperado) return null;
  return `${cuerpo.replace(/\B(?=(\d{3})+(?!\d))/g, ".")}-${dv}`;
};
