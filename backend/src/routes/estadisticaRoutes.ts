import { Router } from "express";
import { authMiddleware } from "../middlewares/authMiddleware";
import { requirePermission } from "../middlewares/permissionMiddleware";
import { getEstadisticas } from "../controllers/estadisticaController";

const router = Router();

router.get("/", authMiddleware, requirePermission("estadisticas.ver"), getEstadisticas);

export default router;
