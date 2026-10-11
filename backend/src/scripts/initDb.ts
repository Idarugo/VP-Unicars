// Crea la base de datos, las tablas y los usuarios iniciales (si no existen).
// Uso: npm run db:init
import "dotenv/config";
import fs from "fs";
import path from "path";
import bcrypt from "bcryptjs";
import { createConnection } from "mysql2/promise";

const requerido = (k: string) => {
  const v = process.env[k];
  if (!v) throw new Error(`Falta ${k} en el .env`);
  return v;
};

async function main() {
  const db = requerido("DB_NAME");
  if (!/^[a-zA-Z0-9_]+$/.test(db)) throw new Error("DB_NAME inválido");

  const conn = await createConnection({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT || 3306),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    multipleStatements: true,
  });

  await conn.query(`CREATE DATABASE IF NOT EXISTS \`${db}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);
  await conn.query(`USE \`${db}\``);
  await conn.query(fs.readFileSync(path.join(__dirname, "../config/vpUnicars.sql"), "utf8"));
  console.log(`Tablas listas en "${db}"`);

  const [rows] = await conn.query<any[]>(`SELECT COUNT(*) AS n FROM usuarios`);
  if (Number(rows[0].n) === 0) {
    const iniciales = [
      { nombre: requerido("SEED_SOPORTE_NOMBRE"), usuario: requerido("SEED_SOPORTE_USUARIO"), clave: requerido("SEED_SOPORTE_CLAVE"), rol: "soporte", color: "#c084fc", descripcion: "Soporte técnico" },
      { nombre: requerido("SEED_ADMIN_NOMBRE"), usuario: requerido("SEED_ADMIN_USUARIO"), clave: requerido("SEED_ADMIN_CLAVE"), rol: "admin", color: "#ffc800", descripcion: "Polarizado, PPF y láminas" },
    ];
    for (const u of iniciales) {
      await conn.query(
        `INSERT INTO usuarios (nombre, usuario, clave_hash, rol, color, descripcion) VALUES (?, ?, ?, ?, ?, ?)`,
        [u.nombre, u.usuario.toLowerCase(), await bcrypt.hash(u.clave, 10), u.rol, u.color, u.descripcion],
      );
      console.log(`Usuario creado: ${u.usuario} (${u.rol})`);
    }
  } else {
    console.log("Ya existen usuarios: no se crearon los iniciales");
  }

  await conn.end();
}

main().catch((e) => {
  console.error(e.message);
  process.exit(1);
});
