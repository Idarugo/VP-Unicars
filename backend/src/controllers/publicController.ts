import { Request, Response } from "express";
import { leerAjuste, leerConfiguracion } from "../models/ajustesModel";
import { verificarCertificado } from "../models/certificadoModel";
import { registrarEvento } from "../models/eventoModel";
import { texto } from "../utils/validar";

export const getContenidoPublico = async (req: Request, res: Response) => {
  try {
    const contenido = (await leerAjuste(req.app.get("pool"), "contenido")) || {};
    res.set("Cache-Control", "no-cache"); // revalida con ETag: los cambios del panel se ven al instante
    return res.status(200).json({ ok: true, data: contenido });
  } catch (error) {
    console.error("Error al leer contenido público:", error);
    return res.status(500).json({ ok: false, message: "Error interno del servidor" });
  }
};

// Ocultar los dígitos de la patente en la verificación pública: AB·CD·••
const ocultarPatente = (p: string) => p.replace(/\d/g, "•");

export const verificarCertificadoPublico = async (req: Request, res: Response) => {
  try {
    const pool = req.app.get("pool");
    const numero = Number(req.query.n);
    const codigo = texto(req.query.c, 8).toUpperCase();
    if (!Number.isInteger(numero) || !codigo) return res.status(400).json({ ok: false, message: "Datos de verificación incompletos" });

    const cert = await verificarCertificado(pool, numero, codigo);
    if (!cert) return res.status(404).json({ ok: false, message: "No encontramos este certificado" });

    const { empresa } = await leerConfiguracion(pool);
    return res.status(200).json({
      ok: true,
      data: { ...cert, patente: ocultarPatente(cert.patente as string), empresa: { nombre: empresa.nombre, rut: empresa.rut } },
    });
  } catch (error) {
    console.error("Error al verificar certificado:", error);
    return res.status(500).json({ ok: false, message: "Error interno del servidor" });
  }
};

const ORIGENES = ["Instagram", "Google", "Facebook", "WhatsApp", "Directo", "Otro"];

export const registrarEventoPublico = async (req: Request, res: Response) => {
  try {
    const tipo = req.body?.tipo === "whatsapp" ? "whatsapp" : req.body?.tipo === "visita" ? "visita" : null;
    if (!tipo) return res.status(400).json({ ok: false, message: "Tipo inválido" });

    const origen = ORIGENES.includes(req.body?.origen) ? req.body.origen : null;
    const servicio = tipo === "whatsapp" ? texto(req.body?.servicio, 60) || "General" : null;

    await registrarEvento(req.app.get("pool"), tipo, servicio, origen);
    return res.status(204).end();
  } catch (error) {
    console.error("Error al registrar evento:", error);
    return res.status(500).json({ ok: false, message: "Error interno del servidor" });
  }
};
