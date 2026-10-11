import { Router } from "express";
import { authMiddleware } from "../middlewares/authMiddleware";
import { requirePermission } from "../middlewares/permissionMiddleware";
import { exportarRespaldo, getEstado, getTareas, updateTarea } from "../controllers/mantencionController";

const router = Router();

router.get("/estado", authMiddleware, requirePermission("mantencion.ver"), getEstado);
router.get("/tareas", authMiddleware, requirePermission("mantencion.ver"), getTareas);
router.put("/tareas", authMiddleware, requirePermission("mantencion.ver"), updateTarea);
router.get("/respaldo", authMiddleware, requirePermission("respaldos.exportar"), exportarRespaldo);

export default router;
