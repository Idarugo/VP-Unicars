import { Router } from "express";
import { authMiddleware } from "../middlewares/authMiddleware";
import { requirePermission } from "../middlewares/permissionMiddleware";
import {
  createUsuarioController, getEquipoController, getUsuarios, resetClaveController, setEstadoUsuarioController,
  updateUsuarioController,
} from "../controllers/usuarioController";

const router = Router();

router.get("/equipo", authMiddleware, getEquipoController);
router.get("/", authMiddleware, requirePermission("usuarios.gestionar"), getUsuarios);
router.post("/", authMiddleware, requirePermission("usuarios.gestionar"), createUsuarioController);
router.put("/:id", authMiddleware, requirePermission("usuarios.gestionar"), updateUsuarioController);
router.patch("/:id/estado", authMiddleware, requirePermission("usuarios.gestionar"), setEstadoUsuarioController);
router.post("/:id/reset-clave", authMiddleware, requirePermission("usuarios.gestionar"), resetClaveController);

export default router;
