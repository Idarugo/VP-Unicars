// Fichas técnicas de las láminas de seguridad. El equipo elige una al emitir el certificado y puede
// ajustar sus datos; con "Guardar ficha" queda disponible para los próximos (tabla `ajustes`, clave fichas_seguridad).
import { texto } from "./validar";

export interface Caracteristica { k: string; v: string }
export interface FichaSeguridad {
  id: string;
  nombre: string;
  producto: string;
  marca: string;
  espesorMil: number;
  caracteristicas: Caracteristica[];
}

// La de 12 mil viene del certificado en Word que usaban (N° 0027). La de 4 mil queda con los datos
// técnicos por completar: no se inventan cifras de resistencia en un documento que se entrega al cliente.
export const FICHAS_DEFAULT: FichaSeguridad[] = [
  {
    id: "seguridad-12",
    nombre: "Seguridad Ultra 12 mil",
    producto: "Lámina de seguridad transparente",
    marca: "American Films",
    espesorMil: 12,
    caracteristicas: [
      { k: "Nivel de seguridad", v: "Seguridad Ultra" },
      { k: "Filtro UV", v: "99%" },
      { k: "Resistencia a la tensión", v: "32.700 psi" },
      { k: "Resistencia a la rotura", v: "370 lbs/pulgada" },
      { k: "Certificaciones", v: "NFRC 100/200/304-2010 y CPSC Categoría I y II" },
    ],
  },
  {
    id: "seguridad-4",
    nombre: "Seguridad 4 mil",
    producto: "Lámina de seguridad transparente",
    marca: "American Films",
    espesorMil: 4,
    caracteristicas: [
      { k: "Nivel de seguridad", v: "" },
      { k: "Filtro UV", v: "99%" },
      { k: "Resistencia a la tensión", v: "" },
      { k: "Resistencia a la rotura", v: "" },
      { k: "Certificaciones", v: "" },
    ],
  },
];

export const MAX_CARACTERISTICAS = 10;

// Limpia una ficha recibida del navegador. `completa` exige que no queden datos vacíos (para emitir).
export const limpiarFicha = (f: unknown): FichaSeguridad | null => {
  const o = (f ?? {}) as Record<string, unknown>;
  const espesorMil = Number(o.espesorMil);
  const caracteristicas = (Array.isArray(o.caracteristicas) ? o.caracteristicas : [])
    .slice(0, MAX_CARACTERISTICAS)
    .map((c) => ({ k: texto((c as Caracteristica)?.k, 40), v: texto((c as Caracteristica)?.v, 160) }))
    .filter((c) => c.k || c.v);
  const ficha = {
    id: texto(o.id, 40).replace(/[^a-z0-9-]/g, "") || `ficha-${Date.now().toString(36)}`,
    nombre: texto(o.nombre, 60),
    producto: texto(o.producto, 80),
    marca: texto(o.marca, 60),
    espesorMil: Number.isFinite(espesorMil) && espesorMil > 0 && espesorMil <= 40 ? Math.round(espesorMil * 10) / 10 : 0,
    caracteristicas,
  };
  if (!ficha.producto || !ficha.marca || !ficha.espesorMil) return null;
  return ficha;
};
