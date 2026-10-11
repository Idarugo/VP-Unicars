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

const router = Router();

router.use("/auth", authRoutes);
router.use("/usuarios", usuarioRoutes);
router.use("/certificados", certificadoRoutes);
router.use("/trabajos", trabajoRoutes);
router.use("/estadisticas", estadisticaRoutes);
router.use("/configuracion", configuracionRoutes);
router.use("/contenido", contenidoRoutes);
router.use("/historial", historialRoutes);
router.use("/mantencion", mantencionRoutes);
router.use("/public", publicRoutes);

export default router;
