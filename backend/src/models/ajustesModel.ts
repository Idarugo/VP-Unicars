import { Pool, RowDataPacket } from "mysql2/promise";
import { CONFIG_DEFAULT, CLAVES_CONFIG, type ClaveConfig } from "../utils/ajustes";

export const leerAjuste = async <T>(pool: Pool, clave: string): Promise<T | null> => {
  const [rows] = await pool.query<RowDataPacket[]>(`SELECT valor FROM ajustes WHERE clave = ? LIMIT 1`, [clave]);
  if (!rows.length) return null;
  try {
    return JSON.parse(rows[0].valor as string) as T;
  } catch {
    return null;
  }
};

export const guardarAjuste = async (pool: Pool, clave: string, valor: unknown, usuarioId: number | null) => {
  await pool.query(
    `
      INSERT INTO ajustes (clave, valor, actualizado_por)
      VALUES (?, ?, ?)
      ON DUPLICATE KEY UPDATE valor = VALUES(valor), actualizado_por = VALUES(actualizado_por)
    `,
    [clave, JSON.stringify(valor), usuarioId],
  );
};

export const borrarAjuste = async (pool: Pool, clave: string) => {
  await pool.query(`DELETE FROM ajustes WHERE clave = ?`, [clave]);
};

// Configuración completa: valores por defecto + lo guardado
export const leerConfiguracion = async (pool: Pool) => {
  const salida = structuredClone(CONFIG_DEFAULT);
  for (const clave of CLAVES_CONFIG) {
    const guardado = await leerAjuste<Record<string, unknown>>(pool, clave);
    if (guardado) Object.assign(salida[clave], guardado);
  }
  return salida;
};

export const guardarSeccionConfig = async (pool: Pool, clave: ClaveConfig, valor: Record<string, unknown>, usuarioId: number) => {
  const actual = (await leerConfiguracion(pool))[clave] as Record<string, unknown>;
  // Solo se aceptan las claves que existen en los valores por defecto
  const permitido = Object.fromEntries(Object.keys(CONFIG_DEFAULT[clave]).filter((k) => k in valor).map((k) => [k, valor[k]]));
  await guardarAjuste(pool, clave, { ...actual, ...permitido }, usuarioId);
};
