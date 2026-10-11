import { Request, Response } from "express";
import { Pool, RowDataPacket } from "mysql2/promise";
import { agrupado, serieDiaria } from "../models/eventoModel";
import { contarTrabajosDesde } from "../models/trabajoModel";

const fechaLocal = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
const sumarDias = (d: Date, n: number) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + n);

export const getEstadisticas = async (req: Request, res: Response) => {
  try {
    const pool = req.app.get("pool");
    const dias = [7, 30, 90].includes(Number(req.query.dias)) ? Number(req.query.dias) : 30;

    const hoy = new Date();
    const desde = sumarDias(hoy, -(dias - 1));
    const desdePrev = sumarDias(desde, -dias);
    const hastaPrev = sumarDias(desde, -1);

    // Serie completa, con 0 en los días sin datos
    const porFecha = new Map((await serieDiaria(pool, fechaLocal(desde), fechaLocal(hoy))).map((r) => [r.fecha, r]));
    const serie = Array.from({ length: dias }, (_, i) => {
      const f = fechaLocal(sumarDias(desde, i));
      return porFecha.get(f) || { fecha: f, visitas: 0, clics: 0 };
    });

    const previa = await serieDiaria(pool, fechaLocal(desdePrev), fechaLocal(hastaPrev));
    const suma = (arr: { visitas: number; clics: number }[], k: "visitas" | "clics") => arr.reduce((a, r) => a + r[k], 0);

    const [certs] = await (pool as Pool).query<RowDataPacket[]>(
      `SELECT COUNT(*) AS n FROM certificados WHERE anulado_en IS NULL AND fecha >= ?`,
      [fechaLocal(desde)],
    );

    return res.status(200).json({
      ok: true,
      data: {
        dias,
        desde: fechaLocal(desde),
        hasta: fechaLocal(hoy),
        serie,
        totales: { visitas: suma(serie, "visitas"), clics: suma(serie, "clics") },
        previo: { visitas: suma(previa, "visitas"), clics: suma(previa, "clics") },
        certificados: Number(certs[0].n),
        trabajos: await contarTrabajosDesde(pool, fechaLocal(desde)),
        porServicio: await agrupado(pool, "servicio", "whatsapp", fechaLocal(desde), fechaLocal(hoy)),
        porOrigen: await agrupado(pool, "origen", "visita", fechaLocal(desde), fechaLocal(hoy)),
      },
    });
  } catch (error) {
    console.error("Error al obtener estadísticas:", error);
    return res.status(500).json({ ok: false, message: "Error interno del servidor" });
  }
};
