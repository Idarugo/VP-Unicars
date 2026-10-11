import { Router } from "express";
import { limitador } from "../utils/limitador";
import { getContenidoPublico, registrarEventoPublico, verificarCertificadoPublico } from "../controllers/publicController";

// Rutas sin sesión: las usa la página web y el QR de los certificados
const router = Router();

router.get("/contenido", getContenidoPublico);
router.get("/certificados/verificar", limitador(60, 60 * 1000), verificarCertificadoPublico);
router.post("/eventos", limitador(120, 60 * 1000), registrarEventoPublico);

export default router;
