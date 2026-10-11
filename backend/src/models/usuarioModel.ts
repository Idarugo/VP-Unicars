import { Pool, ResultSetHeader, RowDataPacket } from "mysql2/promise";
import type { Rol } from "../utils/permisos";

export interface UsuarioListaRow extends RowDataPacket {
  id: number;
  nombre: string;
  usuario: string;
  rol: Rol;
  descripcion: string | null;
  color: string;
  activo: number;
  ultimoAcceso: string | null;
  creadoEn: string;
}

export interface CrearUsuarioData {
  nombre: string;
  usuario: string;
  claveHash: string;
  rol: Rol;
  descripcion: string | null;
  color: string;
}

export interface ActualizarUsuarioData {
  nombre?: string;
  rol?: Rol;
  descripcion?: string | null;
  color?: string;
}

export const getAllUsuarios = async (pool: Pool) => {
  const [rows] = await pool.query<UsuarioListaRow[]>(
    `
      SELECT id, nombre, usuario, rol, descripcion, color, activo,
             ultimo_acceso AS ultimoAcceso, creado_en AS creadoEn
      FROM usuarios
      ORDER BY FIELD(rol, 'admin', 'tecnico', 'soporte'), nombre ASC
    `,
  );

  return rows;
};

// Personas que pueden recibir trabajos en la agenda
export const getEquipo = async (pool: Pool) => {
  const [rows] = await pool.query<UsuarioListaRow[]>(
    `
      SELECT id, nombre, rol, descripcion, color
      FROM usuarios
      WHERE activo = 1 AND rol IN ('admin', 'tecnico')
      ORDER BY FIELD(rol, 'admin', 'tecnico'), nombre ASC
    `,
  );

  return rows;
};

export const getUsuarioById = async (pool: Pool, id: number) => {
  const [rows] = await pool.query<UsuarioListaRow[]>(
    `
      SELECT id, nombre, usuario, rol, descripcion, color, activo,
             ultimo_acceso AS ultimoAcceso, creado_en AS creadoEn
      FROM usuarios
      WHERE id = ?
      LIMIT 1
    `,
    [id],
  );

  return rows.length ? rows[0] : null;
};

export const existsUsuarioByUsuario = async (pool: Pool, usuario: string) => {
  const [rows] = await pool.query<RowDataPacket[]>(`SELECT id FROM usuarios WHERE usuario = ? LIMIT 1`, [usuario]);
  return rows.length > 0;
};

export const createUsuario = async (pool: Pool, data: CrearUsuarioData) => {
  const [result] = await pool.query<ResultSetHeader>(
    `
      INSERT INTO usuarios (nombre, usuario, clave_hash, rol, descripcion, color)
      VALUES (?, ?, ?, ?, ?, ?)
    `,
    [data.nombre, data.usuario, data.claveHash, data.rol, data.descripcion, data.color],
  );

  return result.insertId;
};

export const updateUsuario = async (pool: Pool, id: number, data: ActualizarUsuarioData) => {
  const fields: string[] = [];
  const values: unknown[] = [];

  if (data.nombre !== undefined) { fields.push("nombre = ?"); values.push(data.nombre) }
  if (data.rol !== undefined) { fields.push("rol = ?"); values.push(data.rol) }
  if (data.descripcion !== undefined) { fields.push("descripcion = ?"); values.push(data.descripcion) }
  if (data.color !== undefined) { fields.push("color = ?"); values.push(data.color) }

  if (!fields.length) return false;

  values.push(id);

  const [result] = await pool.query<ResultSetHeader>(`UPDATE usuarios SET ${fields.join(", ")} WHERE id = ?`, values);

  return result.affectedRows > 0;
};

export const setUsuarioActivo = async (pool: Pool, id: number, activo: boolean) => {
  const [result] = await pool.query<ResultSetHeader>(`UPDATE usuarios SET activo = ? WHERE id = ?`, [activo ? 1 : 0, id]);
  return result.affectedRows > 0;
};

export const countSoportesActivos = async (pool: Pool) => {
  const [rows] = await pool.query<RowDataPacket[]>(`SELECT COUNT(*) AS n FROM usuarios WHERE rol = 'soporte' AND activo = 1`);
  return Number(rows[0].n);
};
