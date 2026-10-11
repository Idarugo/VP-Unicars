// Deja la base de datos lista para la entrega: borra los datos de prueba
// (certificados, agenda, visitas, historial, tareas y usuarios que no sean los iniciales).
// Mantiene: usuarios iniciales (soporte y admin del .env), configuración y contenido de la página.
// Uso: npm run db:limpiar            → muestra qué se borraría
//      npm run db:limpiar -- --confirmar → lo borra
import "dotenv/config";
import { createConnection } from "mysql2/promise";

async function main() {
  const confirmar = process.argv.includes("--confirmar");
  const conn = await createConnection({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT || 3306),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
  });

  const iniciales = [process.env.SEED_SOPORTE_USUARIO, process.env.SEED_ADMIN_USUARIO].filter(Boolean).map((u) => u!.toLowerCase());
  const conteo = async (sql: string, p: unknown[] = []) => Number(((await conn.query<any[]>(sql, p))[0] as any[])[0].n);

  const resumen = {
    certificados: await conteo(`SELECT COUNT(*) AS n FROM certificados`),
    trabajos: await conteo(`SELECT COUNT(*) AS n FROM trabajos`),
    eventos: await conteo(`SELECT COUNT(*) AS n FROM eventos`),
    historial: await conteo(`SELECT COUNT(*) AS n FROM historial`),
    tareas: await conteo(`SELECT COUNT(*) AS n FROM tareas_mantencion`),
    usuariosExtra: await conteo(`SELECT COUNT(*) AS n FROM usuarios WHERE usuario NOT IN (?)`, [iniciales]),
  };
  console.table(resumen);

  if (!confirmar) {
    console.log("Nada se borró. Para borrar: npm run db:limpiar -- --confirmar");
    await conn.end();
    return;
  }

  await conn.beginTransaction();
  try {
    await conn.query(`DELETE FROM certificados`);
    await conn.query(`DELETE FROM trabajos`);
    await conn.query(`DELETE FROM eventos`);
    await conn.query(`DELETE FROM historial`);
    await conn.query(`DELETE FROM tareas_mantencion`);
    await conn.query(`DELETE FROM usuarios WHERE usuario NOT IN (?)`, [iniciales]);
    await conn.query(`DELETE FROM ajustes WHERE clave IN ('folio', 'contenido_versiones')`);
    await conn.commit();
  } catch (e) {
    await conn.rollback();
    throw e;
  }
  await conn.query(`ALTER TABLE certificados AUTO_INCREMENT = 1`);
  await conn.query(`ALTER TABLE trabajos AUTO_INCREMENT = 1`);
  console.log("Datos de prueba borrados. El próximo certificado usará el N° inicial de Configuración.");
  await conn.end();
}

main().catch((e) => {
  console.error(e.message);
  process.exit(1);
});
