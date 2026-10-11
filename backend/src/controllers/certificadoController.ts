import { Request, Response } from "express";
import crypto from "crypto";
import {
  anularCertificado, calcularSiguienteNumero, crearCertificado, getCertificadoByNumero, listarCertificados, resumenCertificados,
} from "../models/certificadoModel";
import { leerConfiguracion } from "../models/ajustesModel";
import { registrarHistorial } from "../models/historialModel";
import { esFecha, limpiarPatente, patenteValida, porcentaje, telefono, texto, textoOpcional } from "../utils/validar";

const folio = (n: number) => String(n).padStart(6, "0");
// Código de verificación del QR: 6 caracteres sin letras confusas (0/O, 1/I)
const nuevoCodigo = () => Array.from(crypto.randomBytes(6), (b) => "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"[b % 32]).join("");

export const getCertificados = async (req: Request, res: Response) => {
  try {
    const pool = req.app.get("pool");
    const q = texto(req.query.q, 60);
    const limite = Math.min(50, Math.max(1, Number(req.query.limit) || 10));
    const pagina = Math.max(1, Number(req.query.page) || 1);

    const { rows, total } = await listarCertificados(pool, q, limite, (pagina - 1) * limite);

    return res.status(200).json({
      ok: true,
      data: rows,
      meta: { total, pagina, limite, paginas: Math.max(1, Math.ceil(total / limite)) },
    });
  } catch (error) {
    console.error("Error al obtener certificados:", error);
    return res.status(500).json({ ok: false, message: "Error interno del servidor" });
  }
};

export const getResumen = async (req: Request, res: Response) => {
  try {
    const pool = req.app.get("pool");
    const config = await leerConfiguracion(pool);
    const resumen = await resumenCertificados(pool);
    const siguiente = await calcularSiguienteNumero(pool, config.sistema.folioInicial);
    return res.status(200).json({ ok: true, data: { ...resumen, siguiente } });
  } catch (error) {
    console.error("Error al obtener resumen:", error);
    return res.status(500).json({ ok: false, message: "Error interno del servidor" });
  }
};

export const getCertificado = async (req: Request, res: Response) => {
  try {
    const numero = Number(req.params.numero);
    if (!Number.isInteger(numero)) return res.status(400).json({ ok: false, message: "Número inválido" });

    const certificado = await getCertificadoByNumero(req.app.get("pool"), numero);
    if (!certificado) return res.status(404).json({ ok: false, message: "Certificado no encontrado" });

    return res.status(200).json({ ok: true, data: certificado });
  } catch (error) {
    console.error("Error al obtener certificado:", error);
    return res.status(500).json({ ok: false, message: "Error interno del servidor" });
  }
};

export const createCertificadoController = async (req: Request, res: Response) => {
  try {
    const pool = req.app.get("pool");
    const b = req.body ?? {};

    const datos = {
      fecha: b.fecha,
      cliente: texto(b.cliente, 120),
      direccion: textoOpcional(b.direccion, 160),
      telefono: telefono(b.telefono),
      instalador: texto(b.instalador, 100),
      tipo: texto(b.tipo, 40) || "Automóvil",
      marca: texto(b.marca, 60),
      modelo: texto(b.modelo, 80),
      anio: Number(b.anio),
      patente: limpiarPatente(b.patente),
      delanteros: porcentaje(b.delanteros),
      traseros: porcentaje(b.traseros),
      luneta: porcentaje(b.luneta),
      observaciones: textoOpcional(b.observaciones, 160),
    };

    const errores: string[] = [];
    if (!esFecha(datos.fecha)) errores.push("fecha");
    if (!datos.cliente) errores.push("cliente");
    if (!datos.instalador) errores.push("instalador");
    if (!datos.marca) errores.push("marca");
    if (!datos.modelo) errores.push("modelo");
    if (!Number.isInteger(datos.anio) || datos.anio < 1950 || datos.anio > new Date().getFullYear() + 1) errores.push("año");
    if (!patenteValida(datos.patente)) errores.push("patente");
    if (datos.delanteros === null) errores.push("% delanteros");
    if (datos.traseros === null) errores.push("% traseros");
    if (datos.luneta === null) errores.push("% luneta");

    if (errores.length) {
      return res.status(400).json({ ok: false, message: `Revisa estos campos: ${errores.join(", ")}` });
    }

    const config = await leerConfiguracion(pool);
    const numero = await crearCertificado(pool, config.sistema.folioInicial, {
      ...datos,
      fecha: datos.fecha as string,
      delanteros: datos.delanteros!,
      traseros: datos.traseros!,
      luneta: datos.luneta!,
      codigo: nuevoCodigo(),
      creadoPor: req.usuario!.id,
    });

    await registrarHistorial(pool, req.usuario!, "Emitió certificado", `N° ${folio(numero)} · ${datos.patente}`);

    return res.status(201).json({ ok: true, message: `Certificado N° ${folio(numero)} emitido`, data: await getCertificadoByNumero(pool, numero) });
  } catch (error) {
    console.error("Error al crear certificado:", error);
    return res.status(500).json({ ok: false, message: "Error interno del servidor" });
  }
};

export const anularCertificadoController = async (req: Request, res: Response) => {
  try {
    const pool = req.app.get("pool");
    const numero = Number(req.params.numero);
    const certificado = Number.isInteger(numero) ? await getCertificadoByNumero(pool, numero) : null;
    if (!certificado) return res.status(404).json({ ok: false, message: "Certificado no encontrado" });

    await anularCertificado(pool, numero, req.usuario!.id);
    await registrarHistorial(pool, req.usuario!, "Anuló certificado", `N° ${folio(numero)} · ${certificado.patente}`);

    return res.status(200).json({ ok: true, message: `Certificado N° ${folio(numero)} anulado` });
  } catch (error) {
    console.error("Error al anular certificado:", error);
    return res.status(500).json({ ok: false, message: "Error interno del servidor" });
  }
};
