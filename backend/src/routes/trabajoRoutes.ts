import { Router } from "express";
import { authMiddleware } from "../middlewares/authMiddleware";
import { requirePermission } from "../middlewares/permissionMiddleware";
import {
  createTrabajoController, deleteTrabajoController, getTrabajos, updateTrabajoController,
} from "../controllers/trabajoController";

const router = Router();
const ver = requirePermission("agenda.ver_todo", "agenda.ver_propia");
const editar = requirePermission("agenda.editar_todo", "agenda.editar_propia");

router.get("/", authMiddleware, ver, getTrabajos);
router.post("/", authMiddleware, editar, createTrabajoController);
router.put("/:id", authMiddleware, editar, updateTrabajoController);
router.delete("/:id", authMiddleware, editar, deleteTrabajoController);

export default router;
