import { Router } from "express";
import { authMiddleware } from "../middlewares/authMiddleware";
import { requirePermission } from "../middlewares/permissionMiddleware";
import { getHistorial } from "../controllers/historialController";

const router = Router();

router.get("/", authMiddleware, requirePermission("historial.ver"), getHistorial);

export default router;
