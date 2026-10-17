import { Request, Response } from "express";
import { promises as fs, createWriteStream } from "fs";
import path from "path";
import crypto from "crypto";
import { guardarContenido, leerContenido, leerVersiones } from "../models/contenidoModel";
import { registrarHistorial } from "../models/historialModel";
import { SECCIONES, limpiarContenido } from "../utils/contenidoEsquema";
import { limpiarMetadatos } from "../utils/limpiarMetadatos";

export const CARPETA_FOTOS = path.join(__dirname, "..", "..", "uploads", "fotos");

const SECCION_NOMBRE = Object.fromEntries(SECCIONES.map((s) => [s.clave, s.titulo]));
const resumenCambios = (c: Record<string, unknown>) =>
  Object.keys(c).filter((k) => k !== "version").map((k) => SECCION_NOMBRE[k] || k).join(", ") || "Contenido original";

/* ------------------------------ Contenido ------------------------------ */
export const getEsquema = (_req: Request, res: Response) => res.status(200).json({ ok: true, data: SECCIONES });

export const getContenido = async (req: Request, res: Response) => {
  try {
    return res.status(200).json({ ok: true, data: await leerContenido(req.app.get("pool")) });
  } catch (error) {
    console.error("Error al leer contenido:", error);
    return res.status(500).json({ ok: false, message: "Error interno del servidor" });
  }
};

export const updateContenido = async (req: Request, res: Response) => {
  try {
    const pool = req.app.get("pool");
    const { contenido, error } = limpiarContenido(req.body);
    if (error || !contenido) return res.status(400).json({ ok: false, message: error || "Contenido inválido" });

    const detalle = resumenCambios(contenido);
    await guardarContenido(pool, contenido, req.usuario!, `Antes de guardar: ${detalle}`);
    await registrarHistorial(pool, req.usuario!, "Editó contenido web", detalle);
    return res.status(200).json({ ok: true, message: "Contenido guardado y publicado", data: contenido });
  } catch (error) {
    console.error("Error al guardar contenido:", error);
    return res.status(500).json({ ok: false, message: "Error interno del servidor" });
  }
};

export const restaurarContenido = async (req: Request, res: Response) => {
  try {
    const pool = req.app.get("pool");
    await guardarContenido(pool, null, req.usuario!, "Antes de volver al contenido original");
    await registrarHistorial(pool, req.usuario!, "Restauró contenido web", "Contenido original");
    return res.status(200).json({ ok: true, message: "Contenido original restaurado", data: {} });
  } catch (error) {
    console.error("Error al restaurar contenido:", error);
    return res.status(500).json({ ok: false, message: "Error interno del servidor" });
  }
};

/* ------------------------------ Versiones ------------------------------ */
export const getVersiones = async (req: Request, res: Response) => {
  try {
    const versiones = await leerVersiones(req.app.get("pool"));
    // La lista no lleva el contenido completo: solo qué secciones tenía cada versión
    const data = versiones.map(({ contenido, ...v }) => ({ ...v, secciones: contenido ? resumenCambios(contenido) : "Contenido original" }));
    return res.status(200).json({ ok: true, data });
  } catch (error) {
    console.error("Error al leer versiones:", error);
    return res.status(500).json({ ok: false, message: "Error interno del servidor" });
  }
};

export const restaurarVersion = async (req: Request, res: Response) => {
  try {
    const pool = req.app.get("pool");
    const version = (await leerVersiones(pool)).find((v) => v.id === req.params.id);
    if (!version) return res.status(404).json({ ok: false, message: "Versión no encontrada" });

    const fecha = new Date(version.fecha).toLocaleString("es-CL", { timeZone: "America/Santiago" });
    await guardarContenido(pool, version.contenido, req.usuario!, `Antes de volver a la versión del ${fecha}`);
    await registrarHistorial(pool, req.usuario!, "Restauró versión del contenido", fecha);
    return res.status(200).json({ ok: true, message: "Versión restaurada", data: version.contenido || {} });
  } catch (error) {
    console.error("Error al restaurar versión:", error);
    return res.status(500).json({ ok: false, message: "Error interno del servidor" });
  }
};

/* -------------------------------- Fotos -------------------------------- */
// Se revisan los primeros bytes del archivo: no basta con confiar en el Content-Type
const detectarTipo = (b: Buffer): "jpg" | "png" | "webp" | null => {
  if (b.length > 3 && b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff) return "jpg";
  if (b.length > 8 && b.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))) return "png";
  if (b.length > 12 && b.subarray(0, 4).toString() === "RIFF" && b.subarray(8, 12).toString() === "WEBP") return "webp";
  return null;
};

export const getFotos = async (_req: Request, res: Response) => {
  try {
    await fs.mkdir(CARPETA_FOTOS, { recursive: true });
    const archivos = await fs.readdir(CARPETA_FOTOS);
    const fotos = await Promise.all(
      archivos.filter((a) => /\.(jpg|png|webp)$/.test(a)).map(async (a) => {
        const st = await fs.stat(path.join(CARPETA_FOTOS, a));
        return { nombre: a, url: `/uploads/fotos/${a}`, tamano: st.size, fecha: st.mtime.toISOString() };
      }),
    );
    fotos.sort((a, b) => b.fecha.localeCompare(a.fecha));
    return res.status(200).json({ ok: true, data: fotos });
  } catch (error) {
    console.error("Error al listar fotos:", error);
    return res.status(500).json({ ok: false, message: "Error interno del servidor" });
  }
};

export const subirFoto = async (req: Request, res: Response) => {
  try {
    const datos = req.body as Buffer;
    if (!Buffer.isBuffer(datos) || !datos.length) return res.status(400).json({ ok: false, message: "No llegó ninguna foto" });
    const tipo = detectarTipo(datos);
    if (!tipo) return res.status(400).json({ ok: false, message: "La foto debe ser JPG, PNG o WEBP" });

    let limpia: Buffer;
    try {
      limpia = limpiarMetadatos(datos, tipo);
    } catch {
      return res.status(400).json({ ok: false, message: "La foto está dañada o no se puede leer" });
    }

    await fs.mkdir(CARPETA_FOTOS, { recursive: true });
    const nombre = `${Date.now().toString(36)}-${crypto.randomBytes(4).toString("hex")}.${tipo}`;
    await fs.writeFile(path.join(CARPETA_FOTOS, nombre), limpia);
    await registrarHistorial(req.app.get("pool"), req.usuario!, "Subió foto", nombre);

    return res.status(201).json({ ok: true, message: "Foto subida", data: { nombre, url: `/uploads/fotos/${nombre}` } });
  } catch (error) {
    console.error("Error al subir foto:", error);
    return res.status(500).json({ ok: false, message: "Error interno del servidor" });
  }
};

export const eliminarFoto = async (req: Request, res: Response) => {
  try {
    const nombre = String(req.params.nombre);
    if (!/^[\w-]+\.(jpg|png|webp)$/.test(nombre)) return res.status(400).json({ ok: false, message: "Nombre inválido" });

    const pool = req.app.get("pool");
    const usada = JSON.stringify(await leerContenido(pool)).includes(`/uploads/fotos/${nombre}`);
    if (usada) return res.status(409).json({ ok: false, message: "Esa foto se está usando en la página: quítala primero del contenido" });

    await fs.unlink(path.join(CARPETA_FOTOS, nombre)).catch(() => {});
    await registrarHistorial(pool, req.usuario!, "Eliminó foto", nombre);
    return res.status(200).json({ ok: true, message: "Foto eliminada" });
  } catch (error) {
    console.error("Error al eliminar foto:", error);
    return res.status(500).json({ ok: false, message: "Error interno del servidor" });
  }
};

/* -------------------------------- Videos (pantalla /videos) -------------------------------- */
export const CARPETA_VIDEOS = path.join(__dirname, "..", "..", "uploads", "videos");
const MAX_VIDEO = 400 * 1024 * 1024; // 400 MB
const TIPOS_VIDEO: Record<string, "mp4" | "webm"> = { "video/mp4": "mp4", "video/webm": "webm", "video/quicktime": "mp4" };

// mp4/mov: "ftyp" en los bytes 4-8 · webm: cabecera EBML 1A 45 DF A3
const esVideo = (b: Buffer) =>
  (b.length >= 8 && b.subarray(4, 8).toString("latin1") === "ftyp") || (b.length >= 4 && b.readUInt32BE(0) === 0x1a45dfa3);

export const getVideos = async (_req: Request, res: Response) => {
  try {
    await fs.mkdir(CARPETA_VIDEOS, { recursive: true });
    const archivos = (await fs.readdir(CARPETA_VIDEOS)).filter((a) => /\.(mp4|webm)$/.test(a));
    const videos = await Promise.all(archivos.map(async (a) => {
      const st = await fs.stat(path.join(CARPETA_VIDEOS, a));
      return { nombre: a, url: `/uploads/videos/${a}`, tamano: st.size, fecha: st.mtime.toISOString() };
    }));
    videos.sort((a, b) => b.fecha.localeCompare(a.fecha));
    return res.status(200).json({ ok: true, data: videos });
  } catch (error) {
    console.error("Error al listar videos:", error);
    return res.status(500).json({ ok: false, message: "Error interno del servidor" });
  }
};

// El video se escribe a disco mientras llega (no se guarda entero en memoria)
export const subirVideo = async (req: Request, res: Response) => {
  const ext = TIPOS_VIDEO[String(req.headers["content-type"] || "").split(";")[0]];
  if (!ext) return res.status(400).json({ ok: false, message: "El video debe ser MP4 o WEBM" });
  const declarado = Number(req.headers["content-length"] || 0);
  if (declarado > MAX_VIDEO) return res.status(413).json({ ok: false, message: "El video supera los 400 MB" });

  await fs.mkdir(CARPETA_VIDEOS, { recursive: true });
  const nombre = `${Date.now().toString(36)}-${crypto.randomBytes(4).toString("hex")}.${ext}`;
  const destino = path.join(CARPETA_VIDEOS, nombre);
  const salida = createWriteStream(destino);
  let total = 0;
  let inicio = Buffer.alloc(0);
  let error: string | null = null;

  const cortar = (msg: string) => {
    error = msg;
    req.unpipe(salida);
    salida.destroy();
    req.resume();
  };
  req.on("data", (trozo: Buffer) => {
    total += trozo.length;
    if (inicio.length < 16) inicio = Buffer.concat([inicio, trozo]).subarray(0, 16);
    if (total > MAX_VIDEO && !error) cortar("El video supera los 400 MB");
  });
  req.pipe(salida);

  const terminar = async () => {
    if (res.headersSent) return;
    if (!error && !esVideo(inicio)) error = "El archivo no es un video válido";
    if (error || total === 0) {
      await fs.unlink(destino).catch(() => {});
      return res.status(400).json({ ok: false, message: error || "No llegó ningún video" });
    }
    await registrarHistorial(req.app.get("pool"), req.usuario!, "Subió video", nombre);
    return res.status(201).json({ ok: true, message: "Video subido", data: { nombre, url: `/uploads/videos/${nombre}`, tamano: total } });
  };
  salida.on("finish", () => { terminar().catch(() => res.status(500).end()); });
  salida.on("close", () => { if (error && !res.headersSent) terminar().catch(() => res.status(500).end()); });
  req.on("aborted", () => { error = "La subida se cortó"; salida.destroy(); fs.unlink(destino).catch(() => {}); });
};

export const eliminarVideo = async (req: Request, res: Response) => {
  try {
    const nombre = String(req.params.nombre);
    if (!/^[\w-]+\.(mp4|webm)$/.test(nombre)) return res.status(400).json({ ok: false, message: "Nombre inválido" });
    const pool = req.app.get("pool");
    if (JSON.stringify(await leerContenido(pool)).includes(`/uploads/videos/${nombre}`)) {
      return res.status(409).json({ ok: false, message: "Ese video está en la lista de /videos: quítalo primero de la lista" });
    }
    await fs.unlink(path.join(CARPETA_VIDEOS, nombre)).catch(() => {});
    await registrarHistorial(pool, req.usuario!, "Eliminó video", nombre);
    return res.status(200).json({ ok: true, message: "Video eliminado" });
  } catch (error) {
    console.error("Error al eliminar video:", error);
    return res.status(500).json({ ok: false, message: "Error interno del servidor" });
  }
};
