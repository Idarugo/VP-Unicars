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
  sesion_version: number;
  debe_cambiar_clave: number;
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
  sesionVersion: number;
  debeCambiarClave: boolean;
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
  sesionVersion: Number(u.sesion_version),
  debeCambiarClave: Boolean(u.debe_cambiar_clave),
  permisos: PERMISOS[u.rol] || [],
});

export const obtenerUsuarioParaLogin = async (pool: Pool, usuario: string) => {
  const [rows] = await pool.query<UsuarioRow[]>(
    `
      SELECT id, nombre, usuario, clave_hash, rol, descripcion, color, activo, sesion_version, debe_cambiar_clave
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
      SELECT id, nombre, usuario, clave_hash, rol, descripcion, color, activo, sesion_version, debe_cambiar_clave
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

// Cambiar la clave siempre cierra las demás sesiones (sube sesion_version)
export const actualizarClave = async (pool: Pool, id: number, claveHash: string, debeCambiar: boolean) => {
  const [result] = await pool.query<ResultSetHeader>(
    `UPDATE usuarios SET clave_hash = ?, debe_cambiar_clave = ?, sesion_version = sesion_version + 1 WHERE id = ?`,
    [claveHash, debeCambiar ? 1 : 0, id],
  );
  return result.affectedRows > 0;
};

export const cerrarSesiones = async (pool: Pool, id: number) => {
  await pool.query(`UPDATE usuarios SET sesion_version = sesion_version + 1 WHERE id = ?`, [id]);
};

// Lo que va al panel: sin datos internos de la sesión
export const sesionPublica = ({ sesionVersion: _v, ...u }: UsuarioSesion) => u;
