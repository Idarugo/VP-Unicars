import "dotenv/config";
import express, { type Application } from "express";
import cors from "cors";
import pool from "./config/database";
import routes from "./routes";
import { notFound } from "./middlewares/notFound";
import { errorHandler } from "./middlewares/errorHandler";

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
      return callback(new Error(`CORS bloqueado para: ${origin}`));
    },
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);

app.use((_req, res, next) => {
  res.set("X-Content-Type-Options", "nosniff");
  res.set("Referrer-Policy", "strict-origin-when-cross-origin");
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

app.use("/api", routes);

app.use(notFound);
app.use(errorHandler);

const PORT = Number(process.env.PORT || 3001);

app.listen(PORT, () => {
  console.log(`Backend VP Unicars listo en http://localhost:${PORT}`);
});
