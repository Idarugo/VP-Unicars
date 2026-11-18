import { Pool, PoolConnection, ResultSetHeader, RowDataPacket } from "mysql2/promise";
import type { FichaSeguridad } from "../utils/fichasSeguridad";

export interface Superficie { ubicacion: string; m2: number }

export interface CrearCertificadoSeguridadData {
  codigo: string;
  fecha: string;
  razonSocial: string;
  rut: string | null;
  direccion: string;
  comuna: string | null;
  contacto: string | null;
  telefono: string | null;
  inmueble: string;
  instalador: string;
  superficies: Superficie[];
  ficha: FichaSeguridad;
  garantia: string | null;
  observaciones: string | null;
  creadoPor: number;
}

const COLUMNAS = `
  c.id, c.numero, c.codigo, c.fecha, c.razon_social AS razonSocial, c.rut, c.direccion, c.comuna, c.contacto,
  c.telefono, c.inmueble, c.instalador, c.superficies, c.ficha, c.garantia, c.observaciones,
  u.nombre AS creadoPor, c.creado_en AS creadoEn
`;

// Superficies y ficha se guardan como texto JSON: se devuelven ya convertidas, con el total de m²
const leer = (r: RowDataPacket): Record<string, any> & { superficies: Superficie[]; ficha: FichaSeguridad | null; totalM2: number } => {
  const json = <T>(v: unknown, def: T): T => { try { return JSON.parse(String(v)) as T; } catch { return def; } };
  const superficies = json<Superficie[]>(r.superficies, []);
  return {
    ...r,
    superficies,
    ficha: json<FichaSeguridad | null>(r.ficha, null),
    totalM2: Math.round(superficies.reduce((s, x) => s + Number(x.m2 || 0), 0) * 100) / 100,
  };
};

export const listarCertificadosSeguridad = async (pool: Pool, q: string, limite: number, offset: number) => {
  const filtro = q
    ? `AND (c.razon_social LIKE ? OR REPLACE(REPLACE(c.rut, '.', ''), '-', '') LIKE ? OR CAST(c.numero AS CHAR) LIKE ? OR c.direccion LIKE ? OR c.comuna LIKE ?)`
    : "";
  const like = `%${q}%`;
  const params = q ? [like, `%${q.replace(/[.\-\s]/g, "")}%`, like, like, like] : [];

  const [rows] = await pool.query<RowDataPacket[]>(
    `
      SELECT ${COLUMNAS}
      FROM certificados_seguridad c
      LEFT JOIN usuarios u ON u.id = c.creado_por
      WHERE c.anulado_en IS NULL ${filtro}
      ORDER BY c.numero DESC
      LIMIT ? OFFSET ?
    `,
    [...params, limite, offset],
  );
  const [total] = await pool.query<RowDataPacket[]>(
    `SELECT COUNT(*) AS n FROM certificados_seguridad c WHERE c.anulado_en IS NULL ${filtro}`,
    params,
  );
  return { rows: rows.map(leer), total: Number(total[0].n) };
};

export const getCertificadoSeguridad = async (pool: Pool, numero: number) => {
  const [rows] = await pool.query<RowDataPacket[]>(
    `
      SELECT ${COLUMNAS}
      FROM certificados_seguridad c
      LEFT JOIN usuarios u ON u.id = c.creado_por
      WHERE c.numero = ? AND c.anulado_en IS NULL
      LIMIT 1
    `,
    [numero],
  );
  return rows.length ? leer(rows[0]) : null;
};

export const siguienteNumeroSeguridad = async (db: Pool | PoolConnection, folioInicial: number) => {
  const [rows] = await db.query<RowDataPacket[]>(`SELECT COALESCE(MAX(numero), 0) AS maximo FROM certificados_seguridad`);
  return Math.max(folioInicial, Number(rows[0].maximo) + 1);
};

// Igual que los certificados de autos: la fila "folio_seguridad" de `ajustes` hace de turno,
// así dos personas que emiten a la vez nunca reciben el mismo número.
export const crearCertificadoSeguridad = async (pool: Pool, folioInicial: number, d: CrearCertificadoSeguridadData) => {
  await pool.query(`INSERT IGNORE INTO ajustes (clave, valor) VALUES ('folio_seguridad', '{}')`);

  for (let intento = 1; ; intento++) {
    const conn = await pool.getConnection();
    try {
      await conn.beginTransaction();
      await conn.query(`SELECT clave FROM ajustes WHERE clave = 'folio_seguridad' FOR UPDATE`);
      const numero = await siguienteNumeroSeguridad(conn, folioInicial);
      await conn.query<ResultSetHeader>(
        `
          INSERT INTO certificados_seguridad
            (numero, codigo, fecha, razon_social, rut, direccion, comuna, contacto, telefono, inmueble, instalador,
             superficies, ficha, garantia, observaciones, creado_por)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `,
        [
          numero, d.codigo, d.fecha, d.razonSocial, d.rut, d.direccion, d.comuna, d.contacto, d.telefono, d.inmueble,
          d.instalador, JSON.stringify(d.superficies), JSON.stringify(d.ficha), d.garantia, d.observaciones, d.creadoPor,
        ],
      );
      await conn.commit();
      return numero;
    } catch (error) {
      await conn.rollback();
      const code = (error as { code?: string }).code;
      if (intento < 4 && (code === "ER_LOCK_DEADLOCK" || code === "ER_DUP_ENTRY" || code === "ER_LOCK_WAIT_TIMEOUT")) continue;
      throw error;
    } finally {
      conn.release();
    }
  }
};

export const anularCertificadoSeguridad = async (pool: Pool, numero: number, usuarioId: number) => {
  const [result] = await pool.query<ResultSetHeader>(
    `UPDATE certificados_seguridad SET anulado_en = NOW(), anulado_por = ? WHERE numero = ? AND anulado_en IS NULL`,
    [usuarioId, numero],
  );
  return result.affectedRows > 0;
};

export const resumenCertificadosSeguridad = async (pool: Pool) => {
  const [rows] = await pool.query<RowDataPacket[]>(
    `
      SELECT
        COUNT(*) AS total,
        SUM(DATE_FORMAT(fecha, '%Y-%m') = DATE_FORMAT(CURDATE(), '%Y-%m')) AS delMes,
        MAX(numero) AS ultimo
      FROM certificados_seguridad
      WHERE anulado_en IS NULL
    `,
  );
  const [m2] = await pool.query<RowDataPacket[]>(`SELECT superficies FROM certificados_seguridad WHERE anulado_en IS NULL`);
  const totalM2 = m2.map(leer).reduce((s, r) => s + r.totalM2, 0);
  return {
    total: Number(rows[0].total),
    delMes: Number(rows[0].delMes || 0),
    ultimo: rows[0].ultimo ? Number(rows[0].ultimo) : null,
    totalM2: Math.round(totalM2 * 10) / 10,
  };
};

// Datos para la página pública del QR. La razón social se muestra solo si el RUT es de empresa
// (desde 50.000.000): si el cliente es una persona, su nombre no se publica.
export const verificarCertificadoSeguridad = async (pool: Pool, numero: number, codigo: string) => {
  const [rows] = await pool.query<RowDataPacket[]>(
    `
      SELECT numero, fecha, razon_social AS razonSocial, rut, comuna, inmueble, superficies, ficha
      FROM certificados_seguridad
      WHERE numero = ? AND codigo = ? AND anulado_en IS NULL
      LIMIT 1
    `,
    [numero, codigo],
  );
  if (!rows.length) return null;
  const c = leer(rows[0]);
  const esEmpresa = Number(String(c.rut || "").replace(/\D/g, "").slice(0, -1)) >= 50000000;
  return {
    numero: c.numero,
    fecha: c.fecha,
    cliente: esEmpresa ? c.razonSocial : null,
    comuna: c.comuna,
    inmueble: c.inmueble,
    superficies: c.superficies.length,
    totalM2: c.totalM2,
    lamina: c.ficha ? `${c.ficha.producto} ${c.ficha.espesorMil} mil · ${c.ficha.marca}` : null,
  };
};

export const todosLosCertificadosSeguridad = async (pool: Pool) => {
  const [rows] = await pool.query<RowDataPacket[]>(
    `SELECT ${COLUMNAS} FROM certificados_seguridad c LEFT JOIN usuarios u ON u.id = c.creado_por WHERE c.anulado_en IS NULL ORDER BY c.numero ASC`,
  );
  return rows.map(leer);
};
