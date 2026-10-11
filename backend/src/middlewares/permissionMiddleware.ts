import { Request, Response, NextFunction } from "express";

// Pasa si el usuario tiene AL MENOS UNO de los permisos indicados
export const requirePermission = (...requiredPermissions: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.usuario) {
      return res.status(401).json({ ok: false, message: "No autorizado" });
    }

    const hasPermission = requiredPermissions.some((p) => req.usuario!.permisos.includes(p));

    if (!hasPermission) {
      return res.status(403).json({ ok: false, message: "No tienes permisos para realizar esta acción" });
    }

    next();
  };
};
