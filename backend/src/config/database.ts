import "dotenv/config";
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
  timezone: "-03:00",
});

export default pool;
