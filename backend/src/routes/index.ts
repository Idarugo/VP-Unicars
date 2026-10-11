import { Router } from "express";
import authRoutes from "./authRoutes";
import usuarioRoutes from "./usuarioRoutes";
import certificadoRoutes from "./certificadoRoutes";
import trabajoRoutes from "./trabajoRoutes";
import estadisticaRoutes from "./estadisticaRoutes";
import historialRoutes from "./historialRoutes";
import mantencionRoutes from "./mantencionRoutes";
import publicRoutes from "./publicRoutes";
import { configuracionRoutes, contenidoRoutes } from "./ajustesRoutes";
import tiempoRealRoutes from "./tiempoRealRoutes";
import { notificarCambio } from "../middlewares/notificarCambio";

const router = Router();

router.use("/auth", authRoutes);
router.use("/usuarios", notificarCambio("usuarios", "trabajos", "mantencion"), usuarioRoutes);
router.use("/certificados", notificarCambio("certificados", "estadisticas", "mantencion"), certificadoRoutes);
router.use("/trabajos", notificarCambio("trabajos", "estadisticas", "mantencion"), trabajoRoutes);
router.use("/estadisticas", estadisticaRoutes);
router.use("/configuracion", notificarCambio("configuracion", "certificados", "mantencion"), configuracionRoutes);
router.use("/contenido", notificarCambio("contenido", "mantencion"), contenidoRoutes);
router.use("/historial", historialRoutes);
router.use("/mantencion", notificarCambio("mantencion"), mantencionRoutes);
router.use("/public", publicRoutes);
router.use("/tiempo-real", tiempoRealRoutes);

export default router;
