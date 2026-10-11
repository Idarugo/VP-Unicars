import { Request, Response } from "express";
import { Pool, RowDataPacket } from "mysql2/promise";
import { conteos, guardarTarea, leerTareas } from "../models/mantencionModel";
import { guardarAjuste, leerAjuste, leerConfiguracion } from "../models/ajustesModel";
import { todosLosCertificados } from "../models/certificadoModel";
import { todosLosTrabajos } from "../models/trabajoModel";
import { getAllUsuarios } from "../models/usuarioModel";
import { listarHistorial, registrarHistorial } from "../models/historialModel";
import { emitir, totalConectados } from "../utils/tiempoReal";

const TAREAS = ["fotos", "whatsapp", "contenido", "respaldo", "reporte"];
const mesValido = (m: unknown): m is string => typeof m === "string" && /^\d{4}-\d{2}$/.test(m);

export const getEstado = async (req: Request, res: Response) => {
  try {
    const pool = req.app.get("pool");
    const t0 = Date.now();
    await (pool as Pool).query<RowDataPacket[]>("SELECT 1");
    const msBaseDatos = Date.now() - t0;

    const config = await leerConfiguracion(pool);
    return res.status(200).json({
      ok: true,
      data: { baseDatos: { ok: true, ms: msBaseDatos }, sistema: config.sistema, conteos: await conteos(pool), conectados: totalConectados() },
    });
  } catch (error) {
    console.error("Error al obtener estado:", error);
    return res.status(500).json({ ok: false, message: "Error interno del servidor" });
  }
};

export const getTareas = async (req: Request, res: Response) => {
  try {
    const mes = req.query.mes;
    if (!mesValido(mes)) return res.status(400).json({ ok: false, message: "Mes inválido" });
    return res.status(200).json({ ok: true, data: await leerTareas(req.app.get("pool"), mes) });
  } catch (error) {
    console.error("Error al obtener tareas:", error);
    return res.status(500).json({ ok: false, message: "Error interno del servidor" });
  }
};

export const updateTarea = async (req: Request, res: Response) => {
  try {
    const { mes, clave, hecho } = req.body ?? {};
    if (!mesValido(mes) || !TAREAS.includes(clave)) return res.status(400).json({ ok: false, message: "Tarea inválida" });
    await guardarTarea(req.app.get("pool"), mes, clave, Boolean(hecho));
    return res.status(200).json({ ok: true, message: "Tarea actualizada" });
  } catch (error) {
    console.error("Error al actualizar tarea:", error);
    return res.status(500).json({ ok: false, message: "Error interno del servidor" });
  }
};

// Respaldo completo en JSON (sin claves de usuarios)
export const exportarRespaldo = async (req: Request, res: Response) => {
  try {
    const pool = req.app.get("pool");
    const fecha = new Date().toISOString();

    const respaldo = {
      app: "vp-unicars",
      version: 1,
      fecha,
      certificados: await todosLosCertificados(pool),
      trabajos: await todosLosTrabajos(pool),
      usuarios: await getAllUsuarios(pool),
      configuracion: await leerConfiguracion(pool),
      contenido: (await leerAjuste(pool, "contenido")) || {},
      historial: await listarHistorial(pool, "", 2000),
    };

    const sistema = (await leerAjuste<Record<string, unknown>>(pool, "sistema")) || {};
    await guardarAjuste(pool, "sistema", { ...sistema, ultimoRespaldo: fecha }, req.usuario!.id);
    await registrarHistorial(pool, req.usuario!, "Descargó respaldo", "Respaldo completo");
    emitir("mantencion", req.usuario!.id);

    return res.status(200).json({ ok: true, data: respaldo });
  } catch (error) {
    console.error("Error al exportar respaldo:", error);
    return res.status(500).json({ ok: false, message: "Error interno del servidor" });
  }
};
