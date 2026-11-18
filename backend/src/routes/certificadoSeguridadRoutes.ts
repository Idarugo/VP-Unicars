import { Router } from "express";
import { authMiddleware } from "../middlewares/authMiddleware";
import { requirePermission } from "../middlewares/permissionMiddleware";
import {
  anularCertificadoSeguridadController, createCertificadoSeguridad, getCertificadoSeguridadController, getCertificadosSeguridad,
  getFichas, getResumenSeguridad, guardarFicha,
} from "../controllers/certificadoSeguridadController";

// Certificados de lámina de seguridad (casas, locales y oficinas): mismos permisos que los de autos
const router = Router();

router.get("/", authMiddleware, requirePermission("certificados.ver"), getCertificadosSeguridad);
router.get("/resumen", authMiddleware, requirePermission("certificados.ver"), getResumenSeguridad);
router.get("/fichas", authMiddleware, requirePermission("certificados.ver"), getFichas);
router.put("/fichas", authMiddleware, requirePermission("certificados.crear"), guardarFicha);
router.get("/:numero", authMiddleware, requirePermission("certificados.ver"), getCertificadoSeguridadController);
router.post("/", authMiddleware, requirePermission("certificados.crear"), createCertificadoSeguridad);
router.delete("/:numero", authMiddleware, requirePermission("certificados.anular"), anularCertificadoSeguridadController);

export default router;
