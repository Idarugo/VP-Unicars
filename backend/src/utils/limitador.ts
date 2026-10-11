import type { Request, Response, NextFunction } from "express";

// Limitador simple en memoria: máximo `max` solicitudes por IP cada `ventanaMs`
export const limitador = (max: number, ventanaMs: number, mensaje = "Demasiadas solicitudes, intenta en un momento") => {
  const hits = new Map<string, { n: number; desde: number }>();
  return (req: Request, res: Response, next: NextFunction) => {
    const ip = req.ip || "desconocida";
    const ahora = Date.now();
    const h = hits.get(ip);
    if (!h || ahora - h.desde > ventanaMs) {
      hits.set(ip, { n: 1, desde: ahora });
      return next();
    }
    h.n += 1;
    if (h.n > max) return res.status(429).json({ ok: false, message: mensaje });
    return next();
  };
};
