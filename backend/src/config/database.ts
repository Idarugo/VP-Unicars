import "dotenv/config";
import { offsetChile } from "./zonaHoraria";
import { createPool, type Pool } from "mysql2/promise";

const pool: Pool = createPool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  dateStrings: true, // fechas como "YYYY-MM-DD" para no correr el día por la zona horaria
  timezone: "local",
  // Las conexiones se renuevan seguido para tomar el cambio de horario de verano
  maxIdle: 2,
  idleTimeout: 10 * 60 * 1000,
});

// NOW() y CURRENT_TIMESTAMP de MySQL en hora de Chile, aunque el servidor de BD esté en UTC
pool.pool.on("connection", (conn) => {
  conn.query(`SET time_zone = '${offsetChile()}'`);
});

export default pool;
