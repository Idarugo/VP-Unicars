import { Request, Response } from "express";

export const notFound = (req: Request, res: Response) => {
  return res.status(404).json({
    ok: false,
    message: `Ruta no encontrada: ${req.method} ${req.originalUrl}`,
  });
};
