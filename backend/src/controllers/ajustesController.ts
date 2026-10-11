import { Request, Response } from "express";
import { borrarAjuste, guardarAjuste, guardarSeccionConfig, leerAjuste, leerConfiguracion } from "../models/ajustesModel";
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

/* ------------------------------ Contenido web ------------------------------ */
interface ItemContenido { titulo?: string; texto?: string; foto?: string; oculto?: boolean }

const limpiarItems = (v: unknown) => {
  if (!v || typeof v !== "object") return {};
  return Object.fromEntries(
    Object.entries(v as Record<string, ItemContenido>).slice(0, 40).map(([id, item]) => {
      const out: ItemContenido = {};
      if (item.titulo !== undefined) out.titulo = texto(item.titulo, 80);
      if (item.texto !== undefined) out.texto = texto(item.texto, 400);
      // Solo fotos de la carpeta pública de la página
      if (item.foto !== undefined) out.foto = /^\/fotos\/[\w.-]+$/.test(String(item.foto)) ? String(item.foto) : "";
      if (item.oculto !== undefined) out.oculto = Boolean(item.oculto);
      return [texto(id, 40), out];
    }),
  );
};

export const getContenido = async (req: Request, res: Response) => {
  try {
    const contenido = (await leerAjuste(req.app.get("pool"), "contenido")) || {};
    return res.status(200).json({ ok: true, data: contenido });
  } catch (error) {
    console.error("Error al leer contenido:", error);
    return res.status(500).json({ ok: false, message: "Error interno del servidor" });
  }
};

export const updateContenido = async (req: Request, res: Response) => {
  try {
    const pool = req.app.get("pool");
    const b = req.body ?? {};
    const negocio = b.negocio && typeof b.negocio === "object" ? b.negocio : {};

    const contenido = {
      negocio: Object.fromEntries(
        ["whatsapp", "direccion", "horario", "horarioNota"].filter((k) => negocio[k] !== undefined).map((k) => [
          k,
          k === "whatsapp" ? String(negocio[k]).replace(/\D/g, "").slice(0, 15) : texto(negocio[k], 160),
        ]),
      ),
      servicios: limpiarItems(b.servicios),
      masServicios: limpiarItems(b.masServicios),
      faqs: Array.isArray(b.faqs)
        ? b.faqs.slice(0, 30).map((f: { q?: unknown; a?: unknown }) => ({ q: texto(f?.q, 200), a: texto(f?.a, 800) })).filter((f: { q: string }) => f.q)
        : undefined,
    };

    await guardarAjuste(pool, "contenido", contenido, req.usuario!.id);
    await registrarHistorial(pool, req.usuario!, "Editó contenido web", "Textos, fotos u horario de la página");

    return res.status(200).json({ ok: true, message: "Contenido guardado y publicado", data: contenido });
  } catch (error) {
    console.error("Error al guardar contenido:", error);
    return res.status(500).json({ ok: false, message: "Error interno del servidor" });
  }
};

export const restaurarContenido = async (req: Request, res: Response) => {
  try {
    const pool = req.app.get("pool");
    await borrarAjuste(pool, "contenido");
    await registrarHistorial(pool, req.usuario!, "Restauró contenido web", "Contenido original");
    return res.status(200).json({ ok: true, message: "Contenido original restaurado", data: {} });
  } catch (error) {
    console.error("Error al restaurar contenido:", error);
    return res.status(500).json({ ok: false, message: "Error interno del servidor" });
  }
};
