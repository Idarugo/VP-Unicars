import { Pool, RowDataPacket } from "mysql2/promise";

export const registrarEvento = async (pool: Pool, tipo: "visita" | "whatsapp", servicio: string | null, origen: string | null) => {
  await pool.query(`INSERT INTO eventos (tipo, servicio, origen) VALUES (?, ?, ?)`, [tipo, servicio, origen]);
};

// Visitas y clics por día entre dos fechas (incluidas)
export const serieDiaria = async (pool: Pool, desde: string, hasta: string) => {
  const [rows] = await pool.query<RowDataPacket[]>(
    `
      SELECT DATE_FORMAT(creado_en, '%Y-%m-%d') AS fecha,
             SUM(tipo = 'visita') AS visitas,
             SUM(tipo = 'whatsapp') AS clics
      FROM eventos
      WHERE creado_en >= ? AND creado_en < DATE_ADD(?, INTERVAL 1 DAY)
      GROUP BY DATE_FORMAT(creado_en, '%Y-%m-%d')
    `,
    [desde, hasta],
  );
  return rows.map((r) => ({ fecha: r.fecha as string, visitas: Number(r.visitas), clics: Number(r.clics) }));
};

export const agrupado = async (pool: Pool, campo: "servicio" | "origen", tipo: "visita" | "whatsapp", desde: string, hasta: string) => {
  const [rows] = await pool.query<RowDataPacket[]>(
    `
      SELECT COALESCE(${campo}, 'Sin especificar') AS nombre, COUNT(*) AS valor
      FROM eventos
      WHERE tipo = ? AND creado_en >= ? AND creado_en < DATE_ADD(?, INTERVAL 1 DAY)
      GROUP BY nombre
      ORDER BY valor DESC
      LIMIT 12
    `,
    [tipo, desde, hasta],
  );
  return rows.map((r) => ({ nombre: r.nombre as string, valor: Number(r.valor) }));
};
