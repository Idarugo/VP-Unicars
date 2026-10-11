import { Request, Response, NextFunction } from "express";

export const errorHandler = (err: unknown, _req: Request, res: Response, _next: NextFunction) => {
  console.error("Error:", err);
  // No se expone el detalle interno al cliente
  return res.status(500).json({
    ok: false,
    message: "Error interno del servidor",
  });
};
