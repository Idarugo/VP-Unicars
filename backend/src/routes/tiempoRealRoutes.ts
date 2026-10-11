import { Router } from "express";
import { authMiddleware } from "../middlewares/authMiddleware";
import { conectarTiempoReal } from "../controllers/tiempoRealController";

const router = Router();

router.get("/", authMiddleware, conectarTiempoReal);

export default router;
