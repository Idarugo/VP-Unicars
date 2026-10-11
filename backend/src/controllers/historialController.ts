import { Request, Response } from "express";
import { listarHistorial } from "../models/historialModel";
import { texto } from "../utils/validar";

export const getHistorial = async (req: Request, res: Response) => {
  try {
    const limite = Math.min(500, Math.max(1, Number(req.query.limit) || 200));
    const data = await listarHistorial(req.app.get("pool"), texto(req.query.q, 60), limite);
    return res.status(200).json({ ok: true, data });
  } catch (error) {
    console.error("Error al obtener historial:", error);
    return res.status(500).json({ ok: false, message: "Error interno del servidor" });
  }
};
