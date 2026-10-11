import { Router } from "express";
import { authMiddleware } from "../middlewares/authMiddleware";
import { requirePermission } from "../middlewares/permissionMiddleware";
import {
  getConfiguracion, getContenido, restaurarConfiguracion, restaurarContenido, updateConfiguracion, updateContenido,
} from "../controllers/ajustesController";

export const configuracionRoutes = Router();
configuracionRoutes.get("/", authMiddleware, getConfiguracion);
configuracionRoutes.put("/", authMiddleware, requirePermission("configuracion.editar"), updateConfiguracion);
configuracionRoutes.delete("/", authMiddleware, requirePermission("configuracion.editar"), restaurarConfiguracion);

export const contenidoRoutes = Router();
contenidoRoutes.get("/", authMiddleware, requirePermission("contenido.editar"), getContenido);
contenidoRoutes.put("/", authMiddleware, requirePermission("contenido.editar"), updateContenido);
contenidoRoutes.delete("/", authMiddleware, requirePermission("contenido.editar"), restaurarContenido);
