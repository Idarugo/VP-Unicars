import { Pool, RowDataPacket } from "mysql2/promise";

export interface HistorialRow extends RowDataPacket {
  id: number;
  fecha: string;
  usuario: string;
  accion: string;
  detalle: string | null;
}

export const registrarHistorial = async (
  pool: Pool,
  usuario: { id: number; nombre: string } | null,
  accion: string,
  detalle = "",
) => {
  try {
    await pool.query(
      `INSERT INTO historial (usuario_id, usuario_nombre, accion, detalle) VALUES (?, ?, ?, ?)`,
      [usuario?.id ?? null, usuario?.nombre ?? "Sistema", accion.slice(0, 80), detalle.slice(0, 255)],
    );
  } catch (error) {
    // El historial nunca debe impedir la acción principal
    console.error("No se pudo registrar el historial:", error);
  }
};

export const listarHistorial = async (pool: Pool, q: string, limite: number) => {
  const filtro = q ? `WHERE usuario_nombre LIKE ? OR accion LIKE ? OR detalle LIKE ?` : "";
  const like = `%${q}%`;
  const [rows] = await pool.query<HistorialRow[]>(
    `
      SELECT id, fecha, usuario_nombre AS usuario, accion, detalle
      FROM historial
      ${filtro}
      ORDER BY fecha DESC, id DESC
      LIMIT ?
    `,
    q ? [like, like, like, limite] : [limite],
  );
  return rows;
};
