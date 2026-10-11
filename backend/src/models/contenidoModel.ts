import { Pool } from "mysql2/promise";
import { borrarAjuste, guardarAjuste, leerAjuste } from "./ajustesModel";

const MAX_VERSIONES = 15;

export interface VersionContenido {
  id: string;
  fecha: string;
  usuario: string;
  motivo: string;
  contenido: Record<string, unknown> | null; // null = contenido original de la página
}

// El contenido guardado antes de la versión 2 (solo diferencias) no es compatible: se ignora
export const leerContenido = async (pool: Pool) => {
  const c = await leerAjuste<Record<string, unknown>>(pool, "contenido");
  return c && c.version === 2 ? c : {};
};

export const leerVersiones = async (pool: Pool) => (await leerAjuste<VersionContenido[]>(pool, "contenido_versiones")) || [];

// Antes de cada cambio se guarda el contenido anterior para poder volver atrás
const guardarVersionAnterior = async (pool: Pool, usuario: { id: number; nombre: string }, motivo: string) => {
  const anterior = await leerContenido(pool);
  const versiones = await leerVersiones(pool);
  versiones.unshift({
    id: Math.random().toString(36).slice(2, 10),
    fecha: new Date().toISOString(),
    usuario: usuario.nombre,
    motivo,
    contenido: Object.keys(anterior).length ? anterior : null,
  });
  await guardarAjuste(pool, "contenido_versiones", versiones.slice(0, MAX_VERSIONES), usuario.id);
};

export const guardarContenido = async (
  pool: Pool, contenido: Record<string, unknown> | null, usuario: { id: number; nombre: string }, motivo: string,
) => {
  await guardarVersionAnterior(pool, usuario, motivo);
  if (contenido && Object.keys(contenido).some((k) => k !== "version")) await guardarAjuste(pool, "contenido", contenido, usuario.id);
  else await borrarAjuste(pool, "contenido");
};
