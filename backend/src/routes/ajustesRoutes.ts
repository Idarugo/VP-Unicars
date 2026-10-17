import { Router } from "express";
import { authMiddleware } from "../middlewares/authMiddleware";
import { requirePermission } from "../middlewares/permissionMiddleware";
import express from "express";
import { getConfiguracion, restaurarConfiguracion, updateConfiguracion } from "../controllers/ajustesController";
import {
  eliminarFoto, eliminarVideo, getContenido, getEsquema, getFotos, getVideos, getVersiones, restaurarContenido, restaurarVersion, subirFoto,
  subirVideo, updateContenido,
} from "../controllers/contenidoController";

export const configuracionRoutes = Router();
configuracionRoutes.get("/", authMiddleware, getConfiguracion);
configuracionRoutes.put("/", authMiddleware, requirePermission("configuracion.editar"), updateConfiguracion);
configuracionRoutes.delete("/", authMiddleware, requirePermission("configuracion.editar"), restaurarConfiguracion);

export const contenidoRoutes = Router();
contenidoRoutes.get("/", authMiddleware, requirePermission("contenido.editar"), getContenido);
contenidoRoutes.put("/", authMiddleware, requirePermission("contenido.editar"), updateContenido);
contenidoRoutes.delete("/", authMiddleware, requirePermission("contenido.editar"), restaurarContenido);
contenidoRoutes.get("/esquema", authMiddleware, requirePermission("contenido.editar"), getEsquema);
contenidoRoutes.get("/versiones", authMiddleware, requirePermission("contenido.editar"), getVersiones);
contenidoRoutes.post("/versiones/:id/restaurar", authMiddleware, requirePermission("contenido.editar"), restaurarVersion);
contenidoRoutes.get("/fotos", authMiddleware, requirePermission("contenido.editar"), getFotos);
contenidoRoutes.post(
  "/fotos", authMiddleware, requirePermission("contenido.editar"),
  express.raw({ type: ["image/jpeg", "image/png", "image/webp"], limit: "6mb" }), subirFoto,
);
contenidoRoutes.delete("/fotos/:nombre", authMiddleware, requirePermission("contenido.editar"), eliminarFoto);
contenidoRoutes.get("/videos", authMiddleware, requirePermission("contenido.editar"), getVideos);
contenidoRoutes.post("/videos", authMiddleware, requirePermission("contenido.editar"), subirVideo);
contenidoRoutes.delete("/videos/:nombre", authMiddleware, requirePermission("contenido.editar"), eliminarVideo);
