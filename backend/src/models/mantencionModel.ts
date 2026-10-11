import { Pool, RowDataPacket } from "mysql2/promise";

export const leerTareas = async (pool: Pool, mes: string) => {
  const [rows] = await pool.query<RowDataPacket[]>(`SELECT clave, hecho FROM tareas_mantencion WHERE mes = ?`, [mes]);
  return Object.fromEntries(rows.map((r) => [r.clave as string, Boolean(r.hecho)]));
};

export const guardarTarea = async (pool: Pool, mes: string, clave: string, hecho: boolean) => {
  await pool.query(
    `
      INSERT INTO tareas_mantencion (mes, clave, hecho)
      VALUES (?, ?, ?)
      ON DUPLICATE KEY UPDATE hecho = VALUES(hecho)
    `,
    [mes, clave, hecho ? 1 : 0],
  );
};

export const conteos = async (pool: Pool) => {
  const [rows] = await pool.query<RowDataPacket[]>(
    `
      SELECT
        (SELECT COUNT(*) FROM certificados WHERE anulado_en IS NULL) AS certificados,
        (SELECT MAX(numero) FROM certificados) AS ultimoNumero,
        (SELECT COUNT(*) FROM trabajos) AS trabajos,
        (SELECT COUNT(*) FROM usuarios WHERE activo = 1) AS usuariosActivos
    `,
  );
  const r = rows[0];
  return {
    certificados: Number(r.certificados),
    ultimoNumero: r.ultimoNumero ? Number(r.ultimoNumero) : null,
    trabajos: Number(r.trabajos),
    usuariosActivos: Number(r.usuariosActivos),
  };
};
