import { Pool, PoolConnection, ResultSetHeader, RowDataPacket } from "mysql2/promise";

export interface CertificadoRow extends RowDataPacket {
  id: number;
  numero: number;
  codigo: string;
  fecha: string;
  cliente: string;
  direccion: string | null;
  telefono: string | null;
  instalador: string;
  tipo: string;
  marca: string;
  modelo: string;
  anio: number;
  patente: string;
  delanteros: number;
  traseros: number;
  luneta: number;
  observaciones: string | null;
  creadoPor: string | null;
  creadoEn: string;
}

export interface CrearCertificadoData {
  codigo: string;
  fecha: string;
  cliente: string;
  direccion: string | null;
  telefono: string | null;
  instalador: string;
  tipo: string;
  marca: string;
  modelo: string;
  anio: number;
  patente: string;
  delanteros: number;
  traseros: number;
  luneta: number;
  observaciones: string | null;
  creadoPor: number;
}

const COLUMNAS = `
  c.id, c.numero, c.codigo, c.fecha, c.cliente, c.direccion, c.telefono, c.instalador, c.tipo,
  c.marca, c.modelo, c.anio, c.patente, c.delanteros, c.traseros, c.luneta, c.observaciones,
  u.nombre AS creadoPor, c.creado_en AS creadoEn
`;

export const listarCertificados = async (pool: Pool, q: string, limite: number, offset: number) => {
  const filtro = q ? `AND (c.patente LIKE ? OR c.cliente LIKE ? OR CAST(c.numero AS CHAR) LIKE ? OR CONCAT(c.marca, ' ', c.modelo) LIKE ?)` : "";
  const like = `%${q}%`;
  const params = q ? [like.replace(/[·\s-]/g, ""), like, like, like] : [];

  const [rows] = await pool.query<CertificadoRow[]>(
    `
      SELECT ${COLUMNAS}
      FROM certificados c
      LEFT JOIN usuarios u ON u.id = c.creado_por
      WHERE c.anulado_en IS NULL ${filtro}
      ORDER BY c.numero DESC
      LIMIT ? OFFSET ?
    `,
    [...params, limite, offset],
  );

  const [total] = await pool.query<RowDataPacket[]>(
    `SELECT COUNT(*) AS n FROM certificados c WHERE c.anulado_en IS NULL ${filtro}`,
    params,
  );

  return { rows, total: Number(total[0].n) };
};

export const getCertificadoByNumero = async (pool: Pool, numero: number) => {
  const [rows] = await pool.query<CertificadoRow[]>(
    `
      SELECT ${COLUMNAS}
      FROM certificados c
      LEFT JOIN usuarios u ON u.id = c.creado_por
      WHERE c.numero = ? AND c.anulado_en IS NULL
      LIMIT 1
    `,
    [numero],
  );

  return rows.length ? rows[0] : null;
};

// Siguiente número: nunca menor que el folio inicial ni que el mayor emitido (incluidos los anulados)
export const calcularSiguienteNumero = async (db: Pool | PoolConnection, folioInicial: number) => {
  const [rows] = await db.query<RowDataPacket[]>(`SELECT COALESCE(MAX(numero), 0) AS maximo FROM certificados`);
  return Math.max(folioInicial, Number(rows[0].maximo) + 1);
};

// Se crea dentro de una transacción que bloquea la fila "folio" de `ajustes`: así dos personas que emiten
// al mismo tiempo esperan su turno y nunca obtienen el mismo número. Si igual choca, se reintenta.
export const crearCertificado = async (pool: Pool, folioInicial: number, data: CrearCertificadoData) => {
  await pool.query(`INSERT IGNORE INTO ajustes (clave, valor) VALUES ('folio', '{}')`);

  for (let intento = 1; ; intento++) {
    const conn = await pool.getConnection();
    try {
      await conn.beginTransaction();
      await conn.query(`SELECT clave FROM ajustes WHERE clave = 'folio' FOR UPDATE`);
      const numero = await calcularSiguienteNumero(conn, folioInicial);

      await conn.query<ResultSetHeader>(
        `
          INSERT INTO certificados
            (numero, codigo, fecha, cliente, direccion, telefono, instalador, tipo, marca, modelo, anio, patente,
             delanteros, traseros, luneta, observaciones, creado_por)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `,
        [
          numero, data.codigo, data.fecha, data.cliente, data.direccion, data.telefono, data.instalador, data.tipo,
          data.marca, data.modelo, data.anio, data.patente, data.delanteros, data.traseros, data.luneta,
          data.observaciones, data.creadoPor,
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

export const anularCertificado = async (pool: Pool, numero: number, usuarioId: number) => {
  const [result] = await pool.query<ResultSetHeader>(
    `UPDATE certificados SET anulado_en = NOW(), anulado_por = ? WHERE numero = ? AND anulado_en IS NULL`,
    [usuarioId, numero],
  );
  return result.affectedRows > 0;
};

// Datos mínimos para la página pública de verificación (sin nombre, dirección ni teléfono)
export const verificarCertificado = async (pool: Pool, numero: number, codigo: string) => {
  const [rows] = await pool.query<RowDataPacket[]>(
    `
      SELECT numero, fecha, marca, modelo, anio, patente, delanteros, traseros, luneta
      FROM certificados
      WHERE numero = ? AND codigo = ? AND anulado_en IS NULL
      LIMIT 1
    `,
    [numero, codigo],
  );
  return rows.length ? rows[0] : null;
};

export const resumenCertificados = async (pool: Pool) => {
  const [rows] = await pool.query<RowDataPacket[]>(
    `
      SELECT
        COUNT(*) AS total,
        SUM(DATE_FORMAT(fecha, '%Y-%m') = DATE_FORMAT(CURDATE(), '%Y-%m')) AS delMes,
        MAX(numero) AS ultimo
      FROM certificados
      WHERE anulado_en IS NULL
    `,
  );
  return { total: Number(rows[0].total), delMes: Number(rows[0].delMes || 0), ultimo: rows[0].ultimo ? Number(rows[0].ultimo) : null };
};

export const todosLosCertificados = async (pool: Pool) => {
  const [rows] = await pool.query<CertificadoRow[]>(
    `SELECT ${COLUMNAS} FROM certificados c LEFT JOIN usuarios u ON u.id = c.creado_por WHERE c.anulado_en IS NULL ORDER BY c.numero ASC`,
  );
  return rows;
};
