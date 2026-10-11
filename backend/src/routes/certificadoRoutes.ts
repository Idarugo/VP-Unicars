import { Router } from "express";
import { authMiddleware } from "../middlewares/authMiddleware";
import { requirePermission } from "../middlewares/permissionMiddleware";
import {
  anularCertificadoController, createCertificadoController, getCertificado, getCertificados, getResumen,
} from "../controllers/certificadoController";

const router = Router();

router.get("/", authMiddleware, requirePermission("certificados.ver"), getCertificados);
router.get("/resumen", authMiddleware, requirePermission("certificados.ver"), getResumen);
router.get("/:numero", authMiddleware, requirePermission("certificados.ver"), getCertificado);
router.post("/", authMiddleware, requirePermission("certificados.crear"), createCertificadoController);
router.delete("/:numero", authMiddleware, requirePermission("certificados.anular"), anularCertificadoController);

export default router;
