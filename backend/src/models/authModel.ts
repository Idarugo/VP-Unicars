import { Pool, ResultSetHeader, RowDataPacket } from "mysql2/promise";
import { PERMISOS, ROL_NOMBRE, type Rol } from "../utils/permisos";

interface UsuarioRow extends RowDataPacket {
  id: number;
  nombre: string;
  usuario: string;
  clave_hash: string;
  rol: Rol;
  descripcion: string | null;
  color: string;
  activo: number;
}

export interface UsuarioSesion {
  id: number;
  nombre: string;
  usuario: string;
  rol: Rol;
  rolNombre: string;
  descripcion: string | null;
  color: string;
  activo: boolean;
  permisos: string[];
}

const aSesion = (u: UsuarioRow): UsuarioSesion => ({
  id: u.id,
  nombre: u.nombre,
  usuario: u.usuario,
  rol: u.rol,
  rolNombre: ROL_NOMBRE[u.rol],
  descripcion: u.descripcion,
  color: u.color,
  activo: Boolean(u.activo),
  permisos: PERMISOS[u.rol] || [],
});

export const obtenerUsuarioParaLogin = async (pool: Pool, usuario: string) => {
  const [rows] = await pool.query<UsuarioRow[]>(
    `
      SELECT id, nombre, usuario, clave_hash, rol, descripcion, color, activo
      FROM usuarios
      WHERE usuario = ?
      LIMIT 1
    `,
    [usuario],
  );

  return rows.length ? rows[0] : null;
};

export const obtenerUsuarioSesionPorId = async (pool: Pool, id: number) => {
  const [rows] = await pool.query<UsuarioRow[]>(
    `
      SELECT id, nombre, usuario, clave_hash, rol, descripcion, color, activo
      FROM usuarios
      WHERE id = ?
      LIMIT 1
    `,
    [id],
  );

  return rows.length ? aSesion(rows[0]) : null;
};

export const usuarioASesion = aSesion;

export const registrarAcceso = async (pool: Pool, id: number) => {
  await pool.query<ResultSetHeader>(`UPDATE usuarios SET ultimo_acceso = NOW() WHERE id = ?`, [id]);
};

export const obtenerHashClave = async (pool: Pool, id: number) => {
  const [rows] = await pool.query<RowDataPacket[]>(`SELECT clave_hash FROM usuarios WHERE id = ? LIMIT 1`, [id]);
  return rows.length ? (rows[0].clave_hash as string) : null;
};

export const actualizarClave = async (pool: Pool, id: number, claveHash: string) => {
  const [result] = await pool.query<ResultSetHeader>(`UPDATE usuarios SET clave_hash = ? WHERE id = ?`, [claveHash, id]);
  return result.affectedRows > 0;
};
