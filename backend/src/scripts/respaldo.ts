// Respaldo completo desde el servidor, igual al botón de Mantención → Respaldos (queda como "Último respaldo").
// Uso: npm run respaldo -- /ruta/archivo.json
import fs from "fs";
import pool from "../config/database";
import { armarRespaldo } from "../utils/respaldo";

async function main() {
  const destino = process.argv[2];
  if (!destino) throw new Error("Indica el archivo de salida: npm run respaldo -- /ruta/respaldo.json");
  const respaldo = await armarRespaldo(pool, null);
  fs.writeFileSync(destino, JSON.stringify(respaldo, null, 2), { mode: 0o600 });
  console.log(`Respaldo listo en ${destino}: ${respaldo.certificados.length} certificados, ${respaldo.certificadosSeguridad.length} de lámina de seguridad, ${respaldo.trabajos.length} trabajos`);
  await pool.end();
}

main().catch((e) => {
  console.error(e.message);
  process.exit(1);
});
