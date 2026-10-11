import { Request, Response, NextFunction } from "express";
import { verificarToken } from "../utils/jwt";
import { obtenerUsuarioSesionPorId } from "../models/authModel";

export const authMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ ok: false, message: "Token no proporcionado" });
    }

    const token = authHeader.split(" ")[1];
    const decoded = verificarToken(token);

    const pool = req.app.get("pool");
    const usuario = await obtenerUsuarioSesionPorId(pool, decoded.id);

    if (!usuario || !usuario.activo) {
      return res.status(401).json({ ok: false, message: "Usuario no válido o desactivado" });
    }

    req.usuario = usuario;
    next();
  } catch {
    return res.status(401).json({ ok: false, message: "Token inválido o expirado" });
  }
};
