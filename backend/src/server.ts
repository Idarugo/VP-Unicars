import "dotenv/config";
import "./config/zonaHoraria";
import express, { type Application } from "express";
import cors from "cors";
import pool from "./config/database";
import routes from "./routes";
import { notFound } from "./middlewares/notFound";
import { errorHandler } from "./middlewares/errorHandler";
import { CARPETA_FOTOS } from "./controllers/contenidoController";

if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) {
  console.error("Falta JWT_SECRET en el .env (mínimo 32 caracteres)");
  process.exit(1);
}

const app: Application = express();

const allowedOrigins = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(",").map((s) => s.trim())
  : ["http://localhost:5173", "http://localhost:4173"];

app.set("trust proxy", 1);
app.disable("x-powered-by");

app.use(
  cors({
    origin(origin, callback) {
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) return callback(null, true);
      // Origen no permitido: sin cabeceras CORS el navegador bloquea la respuesta (no es un error del servidor)
      return callback(null, false);
    },
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);

app.use((req, res, next) => {
  res.set("X-Content-Type-Options", "nosniff");
  res.set("Referrer-Policy", "strict-origin-when-cross-origin");
  res.set("X-Frame-Options", "DENY");
  res.set("Cross-Origin-Resource-Policy", "cross-origin"); // las fotos se muestran desde el dominio de la página
  if (req.secure) res.set("Strict-Transport-Security", "max-age=31536000; includeSubDomains");
  // La API solo responde datos: ningún HTML ni script puede ejecutarse desde aquí
  if (req.path.startsWith("/api")) res.set("Content-Security-Policy", "default-src 'none'; frame-ancestors 'none'");
  next();
});

app.use(express.json({ limit: "1mb" }));

app.set("pool", pool);

app.get("/health", async (_req, res) => {
  try {
    await pool.query("SELECT 1");
    res.json({ ok: true, message: "Backend funcionando correctamente" });
  } catch {
    res.status(503).json({ ok: false, message: "Sin conexión a la base de datos" });
  }
});

// Fotos subidas desde Mantención (nombres aleatorios: se pueden guardar en caché mucho tiempo)
app.use("/uploads/fotos", express.static(CARPETA_FOTOS, { maxAge: "30d", immutable: true, index: false }));

app.use("/api", routes);

app.use(notFound);
app.use(errorHandler);

const PORT = Number(process.env.PORT || 3001);

app.listen(PORT, () => {
  console.log(`Backend VP Unicars listo en http://localhost:${PORT}`);
});
