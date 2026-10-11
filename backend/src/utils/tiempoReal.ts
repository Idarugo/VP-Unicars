import type { Response } from "express";

// Canal en tiempo real (Server-Sent Events). Solo se avisa QUÉ cambió (ej: "trabajos");
// cada panel vuelve a pedir los datos con su propio token, así se respetan los permisos.
export type TipoCambio =
  | "certificados" | "trabajos" | "usuarios" | "configuracion" | "contenido" | "estadisticas" | "mantencion";

interface Cliente { id: number; usuarioId: number; res: Response }

const clientes = new Set<Cliente>();
let siguienteId = 1;

const MAX_POR_USUARIO = 8; // pestañas/dispositivos abiertos a la vez por usuario

export const agregarCliente = (usuarioId: number, res: Response) => {
  // Si abre demasiadas, se cierra la más antigua
  const suyas = [...clientes].filter((c) => c.usuarioId === usuarioId);
  if (suyas.length >= MAX_POR_USUARIO) {
    try { suyas[0].res.end(); } catch { /* ya cerrada */ }
    clientes.delete(suyas[0]);
  }
  const cliente = { id: siguienteId++, usuarioId, res };
  clientes.add(cliente);
  return () => clientes.delete(cliente);
};

// Corta las conexiones de un usuario (ej: al desactivarlo); al reconectar recibe 401 y su panel se cierra
export const desconectarUsuario = (usuarioId: number) => {
  for (const c of clientes) {
    if (c.usuarioId !== usuarioId) continue;
    try {
      c.res.end();
    } catch {
      /* ya cerrada */
    }
    clientes.delete(c);
  }
};

export const totalConectados = () => new Set([...clientes].map((c) => c.usuarioId)).size;

// Un solo mensaje con todos los tipos afectados por la misma acción
export const emitir = (tipos: TipoCambio | TipoCambio[], origen?: number) => {
  const lista = Array.isArray(tipos) ? tipos : [tipos];
  const mensaje = `event: cambio\ndata: ${JSON.stringify({ tipos: lista, origen: origen ?? null, fecha: Date.now() })}\n\n`;
  for (const c of clientes) {
    try {
      c.res.write(mensaje);
    } catch {
      clientes.delete(c);
    }
  }
};

// Las visitas de la página pueden ser muchas: se avisa como máximo cada 10 s
let pendienteEstadisticas: NodeJS.Timeout | null = null;
export const emitirEstadisticas = () => {
  if (pendienteEstadisticas) return;
  pendienteEstadisticas = setTimeout(() => {
    pendienteEstadisticas = null;
    emitir("estadisticas");
  }, 10_000);
};

// Mantiene viva la conexión a través de proxies (que cortan conexiones inactivas)
setInterval(() => {
  for (const c of clientes) {
    try {
      c.res.write(": ping\n\n");
    } catch {
      clientes.delete(c);
    }
  }
}, 15_000).unref();
