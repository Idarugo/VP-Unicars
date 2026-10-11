import { Request, Response } from "express";
import { borrarAjuste, guardarAjuste, guardarSeccionConfig, leerConfiguracion } from "../models/ajustesModel";
import { registrarHistorial } from "../models/historialModel";
import { CLAVES_CONFIG, type ClaveConfig } from "../utils/ajustes";
import { texto } from "../utils/validar";

/* ------------------------------- Configuración ------------------------------- */
export const getConfiguracion = async (req: Request, res: Response) => {
  try {
    return res.status(200).json({ ok: true, data: await leerConfiguracion(req.app.get("pool")) });
  } catch (error) {
    console.error("Error al leer configuración:", error);
    return res.status(500).json({ ok: false, message: "Error interno del servidor" });
  }
};

export const updateConfiguracion = async (req: Request, res: Response) => {
  try {
    const pool = req.app.get("pool");
    const body = req.body ?? {};

    for (const clave of CLAVES_CONFIG) {
      if (!body[clave] || typeof body[clave] !== "object") continue;
      const limpio = Object.fromEntries(
        Object.entries(body[clave] as Record<string, unknown>).map(([k, v]) => [k, typeof v === "number" ? v : texto(v, 400)]),
      );
      if (clave === "sistema" && "folioInicial" in limpio) {
        const n = Number(limpio.folioInicial);
        if (!Number.isInteger(n) || n < 1) return res.status(400).json({ ok: false, message: "El folio inicial debe ser un número positivo" });
        limpio.folioInicial = n;
      }
      delete limpio.ultimoRespaldo; // lo administra el sistema
      await guardarSeccionConfig(pool, clave as ClaveConfig, limpio, req.usuario!.id);
    }

    await registrarHistorial(pool, req.usuario!, "Cambió configuración", "Empresa, certificación o sistema");
    return res.status(200).json({ ok: true, message: "Configuración guardada", data: await leerConfiguracion(pool) });
  } catch (error) {
    console.error("Error al guardar configuración:", error);
    return res.status(500).json({ ok: false, message: "Error interno del servidor" });
  }
};

export const restaurarConfiguracion = async (req: Request, res: Response) => {
  try {
    const pool = req.app.get("pool");
    const sistema = (await leerConfiguracion(pool)).sistema;
    await borrarAjuste(pool, "empresa");
    await borrarAjuste(pool, "certificacion");
    // Se conserva la fecha del último respaldo
    await guardarAjuste(pool, "sistema", { ultimoRespaldo: sistema.ultimoRespaldo }, req.usuario!.id);
    await registrarHistorial(pool, req.usuario!, "Restauró configuración");
    return res.status(200).json({ ok: true, message: "Configuración original restaurada", data: await leerConfiguracion(pool) });
  } catch (error) {
    console.error("Error al restaurar configuración:", error);
    return res.status(500).json({ ok: false, message: "Error interno del servidor" });
  }
};
