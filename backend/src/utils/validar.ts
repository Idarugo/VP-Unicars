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
