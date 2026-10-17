import { Request, Response } from "express";
import { leerConfiguracion } from "../models/ajustesModel";
import { leerContenido } from "../models/contenidoModel";
import { verificarCertificado } from "../models/certificadoModel";
import { registrarEvento } from "../models/eventoModel";
import { texto } from "../utils/validar";
import { emitirEstadisticas } from "../utils/tiempoReal";

export const getContenidoPublico = async (req: Request, res: Response) => {
  try {
    const contenido = await leerContenido(req.app.get("pool"));
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
    emitirEstadisticas();
    return res.status(204).end();
  } catch (error) {
    console.error("Error al registrar evento:", error);
    return res.status(500).json({ ok: false, message: "Error interno del servidor" });
  }
};

/* ---------------- Reseñas de Google (opcional) ----------------
   Con GOOGLE_PLACES_API_KEY y GOOGLE_PLACE_ID en el .env, se leen la nota, la cantidad y las reseñas
   más relevantes desde la API de Google Places (máx. 5, es lo que entrega Google) y se guardan 12 h.
   Sin clave, la página usa las reseñas cargadas en Mantención → Contenido web. */
interface ResenasGoogle { calificacion: number; total: number; resenas: { autor: string; texto: string; estrellas: number; fecha: string; foto?: string }[] }
let cacheResenas: { datos: ResenasGoogle | null; hasta: number } = { datos: null, hasta: 0 };

export const getResenasGoogle = async (_req: Request, res: Response) => {
  const clave = process.env.GOOGLE_PLACES_API_KEY;
  const lugar = process.env.GOOGLE_PLACE_ID;
  if (!clave || !lugar) return res.status(200).json({ ok: true, data: null });

  if (Date.now() < cacheResenas.hasta) return res.status(200).json({ ok: true, data: cacheResenas.datos });
  try {
    const r = await fetch(`https://places.googleapis.com/v1/places/${encodeURIComponent(lugar)}?languageCode=es`, {
      headers: { "X-Goog-Api-Key": clave, "X-Goog-FieldMask": "rating,userRatingCount,reviews" },
      signal: AbortSignal.timeout(8000),
    });
    if (!r.ok) throw new Error(`Google respondió ${r.status}`);
    const g = (await r.json()) as {
      rating?: number; userRatingCount?: number;
      reviews?: { rating?: number; text?: { text?: string }; originalText?: { text?: string }; relativePublishTimeDescription?: string; authorAttribution?: { displayName?: string; photoUri?: string } }[];
    };
    const datos: ResenasGoogle = {
      calificacion: Number(g.rating) || 0,
      total: Number(g.userRatingCount) || 0,
      resenas: (g.reviews || [])
        .map((x) => ({
          autor: texto(x.authorAttribution?.displayName, 60),
          texto: texto(x.originalText?.text || x.text?.text, 600),
          estrellas: Number(x.rating) || 5,
          fecha: texto(x.relativePublishTimeDescription, 30),
          foto: /^https:\/\//.test(String(x.authorAttribution?.photoUri)) ? String(x.authorAttribution?.photoUri) : undefined,
        }))
        .filter((x) => x.autor && x.texto),
    };
    cacheResenas = { datos, hasta: Date.now() + 12 * 3600 * 1000 };
    return res.status(200).json({ ok: true, data: datos });
  } catch (error) {
    console.error("No se pudieron leer las reseñas de Google:", error);
    cacheResenas = { datos: cacheResenas.datos, hasta: Date.now() + 15 * 60 * 1000 }; // reintenta en 15 min
    return res.status(200).json({ ok: true, data: cacheResenas.datos });
  }
};
