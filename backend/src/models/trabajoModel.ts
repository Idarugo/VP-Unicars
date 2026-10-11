import { Pool, ResultSetHeader, RowDataPacket } from "mysql2/promise";

export interface TrabajoRow extends RowDataPacket {
  id: number;
  fecha: string;
  hora: string;
  servicio: string;
  encargadoId: number | null;
  encargado: string | null;
  color: string | null;
  lugar: "local" | "domicilio";
  direccion: string | null;
  cliente: string;
  telefono: string | null;
  marca: string | null;
  modelo: string | null;
  patente: string | null;
  estado: "pendiente" | "confirmado" | "terminado";
  notas: string | null;
}

export interface TrabajoData {
  fecha: string;
  hora: string;
  servicio: string;
  encargadoId: number | null;
  lugar: "local" | "domicilio";
  direccion: string | null;
  cliente: string;
  telefono: string | null;
  marca: string | null;
  modelo: string | null;
  patente: string | null;
  estado: "pendiente" | "confirmado" | "terminado";
  notas: string | null;
}

const COLUMNAS = `
  t.id, t.fecha, TIME_FORMAT(t.hora, '%H:%i') AS hora, t.servicio, t.encargado_id AS encargadoId,
  u.nombre AS encargado, u.color, t.lugar, t.direccion, t.cliente, t.telefono, t.marca, t.modelo,
  t.patente, t.estado, t.notas
`;

export const listarTrabajos = async (pool: Pool, desde: string, hasta: string, encargadoId: number | null) => {
  const filtro = encargadoId ? "AND t.encargado_id = ?" : "";
  const [rows] = await pool.query<TrabajoRow[]>(
    `
      SELECT ${COLUMNAS}
      FROM trabajos t
      LEFT JOIN usuarios u ON u.id = t.encargado_id
      WHERE t.fecha BETWEEN ? AND ? ${filtro}
      ORDER BY t.fecha ASC, t.hora ASC
    `,
    encargadoId ? [desde, hasta, encargadoId] : [desde, hasta],
  );
  return rows;
};

export const getTrabajoById = async (pool: Pool, id: number) => {
  const [rows] = await pool.query<TrabajoRow[]>(
    `SELECT ${COLUMNAS} FROM trabajos t LEFT JOIN usuarios u ON u.id = t.encargado_id WHERE t.id = ? LIMIT 1`,
    [id],
  );
  return rows.length ? rows[0] : null;
};

export const crearTrabajo = async (pool: Pool, data: TrabajoData, creadoPor: number) => {
  const [result] = await pool.query<ResultSetHeader>(
    `
      INSERT INTO trabajos
        (fecha, hora, servicio, encargado_id, lugar, direccion, cliente, telefono, marca, modelo, patente, estado, notas, creado_por)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `,
    [
      data.fecha, data.hora, data.servicio, data.encargadoId, data.lugar, data.direccion, data.cliente, data.telefono,
      data.marca, data.modelo, data.patente, data.estado, data.notas, creadoPor,
    ],
  );
  return result.insertId;
};

export const actualizarTrabajo = async (pool: Pool, id: number, data: TrabajoData) => {
  const [result] = await pool.query<ResultSetHeader>(
    `
      UPDATE trabajos
      SET fecha = ?, hora = ?, servicio = ?, encargado_id = ?, lugar = ?, direccion = ?, cliente = ?, telefono = ?,
          marca = ?, modelo = ?, patente = ?, estado = ?, notas = ?
      WHERE id = ?
    `,
    [
      data.fecha, data.hora, data.servicio, data.encargadoId, data.lugar, data.direccion, data.cliente, data.telefono,
      data.marca, data.modelo, data.patente, data.estado, data.notas, id,
    ],
  );
  return result.affectedRows > 0;
};

export const eliminarTrabajo = async (pool: Pool, id: number) => {
  const [result] = await pool.query<ResultSetHeader>(`DELETE FROM trabajos WHERE id = ?`, [id]);
  return result.affectedRows > 0;
};

export const contarTrabajosDesde = async (pool: Pool, desde: string) => {
  const [rows] = await pool.query<RowDataPacket[]>(`SELECT COUNT(*) AS n FROM trabajos WHERE fecha >= ?`, [desde]);
  return Number(rows[0].n);
};

export const todosLosTrabajos = async (pool: Pool) => {
  const [rows] = await pool.query<TrabajoRow[]>(
    `SELECT ${COLUMNAS} FROM trabajos t LEFT JOIN usuarios u ON u.id = t.encargado_id ORDER BY t.fecha ASC, t.hora ASC`,
  );
  return rows;
};
