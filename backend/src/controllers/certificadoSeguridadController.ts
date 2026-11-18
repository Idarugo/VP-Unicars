import { Request, Response } from "express";
import { Pool } from "mysql2/promise";
import crypto from "crypto";
import {
  anularCertificadoSeguridad, crearCertificadoSeguridad, getCertificadoSeguridad, listarCertificadosSeguridad,
  resumenCertificadosSeguridad, siguienteNumeroSeguridad,
} from "../models/certificadoSeguridadModel";
import { guardarAjuste, leerAjuste, leerConfiguracion } from "../models/ajustesModel";
import { registrarHistorial } from "../models/historialModel";
import { FICHAS_DEFAULT, limpiarFicha, type FichaSeguridad } from "../utils/fichasSeguridad";
import { esFecha, rutFormateado, telefono, texto, textoOpcional } from "../utils/validar";

const folio = (n: number) => `LS-${String(n).padStart(4, "0")}`;
const nuevoCodigo = () => Array.from(crypto.randomBytes(6), (b) => "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"[b % 32]).join("");
const INMUEBLES = ["Local comercial", "Oficina", "Casa", "Departamento", "Edificio", "Bodega / industria", "Colegio", "Otro"];
const MAX_SUPERFICIES = 12;

export const getCertificadosSeguridad = async (req: Request, res: Response) => {
  try {
    const pool = req.app.get("pool");
    const q = texto(req.query.q, 60);
    const limite = Math.min(50, Math.max(1, Number(req.query.limit) || 10));
    const pagina = Math.max(1, Number(req.query.page) || 1);
    const { rows, total } = await listarCertificadosSeguridad(pool, q, limite, (pagina - 1) * limite);
    return res.status(200).json({ ok: true, data: rows, meta: { total, pagina, limite, paginas: Math.max(1, Math.ceil(total / limite)) } });
  } catch (error) {
    console.error("Error al obtener certificados de seguridad:", error);
    return res.status(500).json({ ok: false, message: "Error interno del servidor" });
  }
};

export const getResumenSeguridad = async (req: Request, res: Response) => {
  try {
    const pool = req.app.get("pool");
    const config = await leerConfiguracion(pool);
    const resumen = await resumenCertificadosSeguridad(pool);
    const siguiente = await siguienteNumeroSeguridad(pool, config.sistema.folioSeguridad);
    return res.status(200).json({ ok: true, data: { ...resumen, siguiente } });
  } catch (error) {
    console.error("Error al obtener resumen de seguridad:", error);
    return res.status(500).json({ ok: false, message: "Error interno del servidor" });
  }
};

export const getCertificadoSeguridadController = async (req: Request, res: Response) => {
  try {
    const numero = Number(req.params.numero);
    if (!Number.isInteger(numero)) return res.status(400).json({ ok: false, message: "Número inválido" });
    const c = await getCertificadoSeguridad(req.app.get("pool"), numero);
    if (!c) return res.status(404).json({ ok: false, message: "Certificado no encontrado" });
    return res.status(200).json({ ok: true, data: c });
  } catch (error) {
    console.error("Error al obtener certificado de seguridad:", error);
    return res.status(500).json({ ok: false, message: "Error interno del servidor" });
  }
};

export const createCertificadoSeguridad = async (req: Request, res: Response) => {
  try {
    const pool = req.app.get("pool");
    const b = req.body ?? {};

    const rutTexto = texto(b.rut, 14);
    const rut = rutTexto ? rutFormateado(rutTexto) : null;
    const superficies = (Array.isArray(b.superficies) ? b.superficies : [])
      .slice(0, MAX_SUPERFICIES)
      .map((s: { ubicacion?: unknown; m2?: unknown }) => ({ ubicacion: texto(s?.ubicacion, 80), m2: Math.round(Number(s?.m2) * 100) / 100 }))
      .filter((s: { ubicacion: string; m2: number }) => s.ubicacion || s.m2);
    const ficha = limpiarFicha(b.ficha);

    const datos = {
      fecha: b.fecha,
      razonSocial: texto(b.razonSocial, 140),
      rut,
      direccion: texto(b.direccion, 160),
      comuna: textoOpcional(b.comuna, 60),
      contacto: textoOpcional(b.contacto, 100),
      telefono: telefono(b.telefono),
      inmueble: INMUEBLES.includes(b.inmueble) ? b.inmueble : "Otro",
      instalador: texto(b.instalador, 100),
      garantia: textoOpcional(b.garantia, 60),
      observaciones: textoOpcional(b.observaciones, 200),
    };

    const errores: string[] = [];
    if (!esFecha(datos.fecha)) errores.push("fecha");
    if (!datos.razonSocial) errores.push("razón social");
    if (rutTexto && !rut) errores.push("RUT (dígito verificador)");
    if (!datos.direccion) errores.push("dirección");
    if (!datos.instalador) errores.push("instalador");
    if (!superficies.length) errores.push("superficies");
    if (superficies.some((s: { ubicacion: string; m2: number }) => !s.ubicacion || !(s.m2 > 0 && s.m2 <= 10000))) errores.push("ubicación y m² de cada superficie");
    if (!ficha) errores.push("producto, marca y espesor de la lámina");
    if (ficha?.caracteristicas.some((c) => !c.k || !c.v)) errores.push("características de la lámina sin completar");
    if (errores.length) return res.status(400).json({ ok: false, message: `Revisa estos campos: ${errores.join(", ")}` });

    const config = await leerConfiguracion(pool);
    const numero = await crearCertificadoSeguridad(pool, config.sistema.folioSeguridad, {
      ...datos,
      fecha: datos.fecha as string,
      superficies,
      ficha: ficha!,
      codigo: nuevoCodigo(),
      creadoPor: req.usuario!.id,
    });

    await registrarHistorial(pool, req.usuario!, "Emitió certificado de lámina de seguridad", `N° ${folio(numero)} · ${datos.razonSocial}`);
    return res.status(201).json({ ok: true, message: `Certificado N° ${folio(numero)} emitido`, data: await getCertificadoSeguridad(pool, numero) });
  } catch (error) {
    console.error("Error al crear certificado de seguridad:", error);
    return res.status(500).json({ ok: false, message: "Error interno del servidor" });
  }
};

export const anularCertificadoSeguridadController = async (req: Request, res: Response) => {
  try {
    const pool = req.app.get("pool");
    const numero = Number(req.params.numero);
    const c = Number.isInteger(numero) ? await getCertificadoSeguridad(pool, numero) : null;
    if (!c) return res.status(404).json({ ok: false, message: "Certificado no encontrado" });
    await anularCertificadoSeguridad(pool, numero, req.usuario!.id);
    await registrarHistorial(pool, req.usuario!, "Anuló certificado de lámina de seguridad", `N° ${folio(numero)} · ${c.razonSocial}`);
    return res.status(200).json({ ok: true, message: `Certificado N° ${folio(numero)} anulado` });
  } catch (error) {
    console.error("Error al anular certificado de seguridad:", error);
    return res.status(500).json({ ok: false, message: "Error interno del servidor" });
  }
};

/* ---------------- Fichas técnicas de las láminas ---------------- */
const leerFichas = async (pool: Pool) => (await leerAjuste<FichaSeguridad[]>(pool, "fichas_seguridad")) || FICHAS_DEFAULT;

export const getFichas = async (req: Request, res: Response) => {
  try {
    return res.status(200).json({ ok: true, data: await leerFichas(req.app.get("pool")) });
  } catch (error) {
    console.error("Error al leer fichas:", error);
    return res.status(500).json({ ok: false, message: "Error interno del servidor" });
  }
};

// Crea o reemplaza una ficha (por id). Con `borrar: true` la quita de la lista.
export const guardarFicha = async (req: Request, res: Response) => {
  try {
    const pool = req.app.get("pool");
    const fichas = [...(await leerFichas(pool))];
    const id = texto(req.body?.id, 40);

    if (req.body?.borrar) {
      const quedan = fichas.filter((f) => f.id !== id);
      if (!quedan.length) return res.status(400).json({ ok: false, message: "Debe quedar al menos una ficha" });
      await guardarAjuste(pool, "fichas_seguridad", quedan, req.usuario!.id);
      await registrarHistorial(pool, req.usuario!, "Borró ficha de lámina de seguridad", fichas.find((f) => f.id === id)?.nombre || id);
      return res.status(200).json({ ok: true, message: "Ficha eliminada", data: quedan });
    }

    const ficha = limpiarFicha(req.body);
    if (!ficha || !ficha.nombre) return res.status(400).json({ ok: false, message: "La ficha necesita nombre, producto, marca y espesor" });
    const i = fichas.findIndex((f) => f.id === ficha.id);
    if (i >= 0) fichas[i] = ficha;
    else if (fichas.length >= 20) return res.status(400).json({ ok: false, message: "Máximo 20 fichas" });
    else fichas.push(ficha);

    await guardarAjuste(pool, "fichas_seguridad", fichas, req.usuario!.id);
    await registrarHistorial(pool, req.usuario!, "Guardó ficha de lámina de seguridad", ficha.nombre);
    return res.status(200).json({ ok: true, message: `Ficha “${ficha.nombre}” guardada`, data: fichas });
  } catch (error) {
    console.error("Error al guardar ficha:", error);
    return res.status(500).json({ ok: false, message: "Error interno del servidor" });
  }
};
