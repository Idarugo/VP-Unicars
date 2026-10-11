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

    // Token de antes de un cambio de clave o desactivación: ya no sirve
    if (decoded.v !== usuario.sesionVersion) {
      return res.status(401).json({ ok: false, message: "La sesión se cerró, vuelve a entrar" });
    }

    // Con clave temporal solo puede ver su sesión y cambiar la clave
    const ruta = `${req.baseUrl}${req.path}`;
    if (usuario.debeCambiarClave && !["/api/auth/me", "/api/auth/cambiar-clave"].includes(ruta)) {
      return res.status(403).json({ ok: false, code: "CAMBIAR_CLAVE", message: "Debes cambiar tu clave temporal antes de continuar" });
    }

    req.usuario = usuario;
    next();
  } catch {
    return res.status(401).json({ ok: false, message: "Token inválido o expirado" });
  }
};
