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

  // Migraciones: columnas agregadas después de la primera versión (funciona en MySQL y MariaDB)
  const columnas: [string, string, string][] = [
    ["usuarios", "sesion_version", "INT NOT NULL DEFAULT 0 AFTER activo"],
    ["usuarios", "debe_cambiar_clave", "TINYINT(1) NOT NULL DEFAULT 0 AFTER sesion_version"],
    ["usuarios", "telefono", "VARCHAR(16) NULL AFTER descripcion"],
  ];
  for (const [tabla, columna, definicion] of columnas) {
    const [existe] = await conn.query<any[]>(
      `SELECT 1 FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ? AND COLUMN_NAME = ?`,
      [db, tabla, columna],
    );
    if (!existe.length) {
      await conn.query(`ALTER TABLE \`${tabla}\` ADD COLUMN \`${columna}\` ${definicion}`);
      console.log(`Migración: ${tabla}.${columna} agregada`);
    }
  }

  const [rows] = await conn.query<any[]>(`SELECT COUNT(*) AS n FROM usuarios`);
  if (Number(rows[0].n) === 0) {
    const iniciales = [
      { nombre: requerido("SEED_SOPORTE_NOMBRE"), usuario: requerido("SEED_SOPORTE_USUARIO"), clave: requerido("SEED_SOPORTE_CLAVE"), rol: "soporte", color: "#c084fc", descripcion: "Soporte técnico" },
      // El dueño recibe una clave inicial y la cambia en su primer ingreso
      { nombre: requerido("SEED_ADMIN_NOMBRE"), usuario: requerido("SEED_ADMIN_USUARIO"), clave: requerido("SEED_ADMIN_CLAVE"), rol: "admin", color: "#ffc800", descripcion: "Polarizado, PPF y láminas", debeCambiar: 1 },
    ];
    for (const u of iniciales) {
      await conn.query(
        `INSERT INTO usuarios (nombre, usuario, clave_hash, rol, color, descripcion, debe_cambiar_clave) VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [u.nombre, u.usuario.toLowerCase(), await bcrypt.hash(u.clave, 10), u.rol, u.color, u.descripcion, "debeCambiar" in u ? u.debeCambiar : 0],
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
