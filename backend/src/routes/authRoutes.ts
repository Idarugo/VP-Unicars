import { Router } from "express";
import { authMiddleware } from "../middlewares/authMiddleware";
import { limitador } from "../utils/limitador";
import { cambiarClave, login, me } from "../controllers/authController";

const router = Router();

// Máximo 10 intentos de login cada 15 minutos por IP
router.post("/login", limitador(10, 15 * 60 * 1000, "Demasiados intentos, espera unos minutos"), login);
router.get("/me", authMiddleware, me);
router.post("/cambiar-clave", authMiddleware, cambiarClave);

export default router;
