import { Request, Response, NextFunction } from "express";
import { emitir, type TipoCambio } from "../utils/tiempoReal";

// Después de un POST/PUT/PATCH/DELETE exitoso avisa a los paneles conectados
export const notificarCambio = (...tipos: TipoCambio[]) => (req: Request, res: Response, next: NextFunction) => {
  if (req.method !== "GET") {
    res.on("finish", () => {
      if (res.statusCode < 400) emitir(tipos, req.usuario?.id);
    });
  }
  next();
};
