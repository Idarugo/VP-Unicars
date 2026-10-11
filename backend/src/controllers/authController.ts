import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import { generarToken } from "../utils/jwt";
import {
  actualizarClave, obtenerHashClave, obtenerUsuarioParaLogin, registrarAcceso, usuarioASesion,
} from "../models/authModel";
import { registrarHistorial } from "../models/historialModel";

export const login = async (req: Request, res: Response) => {
  try {
    const pool = req.app.get("pool");
    const usuario = String(req.body?.usuario ?? "").trim().toLowerCase();
    const clave = String(req.body?.clave ?? "");

    if (!usuario || !clave) {
      return res.status(400).json({ ok: false, message: "Usuario y clave son obligatorios" });
    }

    const row = await obtenerUsuarioParaLogin(pool, usuario);
    // Mismo mensaje si el usuario no existe o la clave es incorrecta
    const valido = row ? await bcrypt.compare(clave, row.clave_hash) : false;

    if (!row || !valido) {
      return res.status(401).json({ ok: false, message: "Usuario o clave incorrectos" });
    }

    if (!row.activo) {
      return res.status(403).json({ ok: false, message: "Este usuario está desactivado" });
    }

    await registrarAcceso(pool, row.id);
    const sesion = usuarioASesion(row);
    await registrarHistorial(pool, sesion, "Inició sesión");

    return res.status(200).json({
      ok: true,
      message: "Sesión iniciada",
      token: generarToken({ id: row.id, usuario: row.usuario }),
      usuario: sesion,
    });
  } catch (error) {
    console.error("Error en login:", error);
    return res.status(500).json({ ok: false, message: "Error interno del servidor" });
  }
};

export const me = async (req: Request, res: Response) => {
  return res.status(200).json({ ok: true, usuario: req.usuario });
};

export const cambiarClave = async (req: Request, res: Response) => {
  try {
    const pool = req.app.get("pool");
    const { claveActual, claveNueva } = req.body ?? {};

    if (typeof claveNueva !== "string" || claveNueva.length < 8) {
      return res.status(400).json({ ok: false, message: "La clave nueva debe tener al menos 8 caracteres" });
    }

    const hash = await obtenerHashClave(pool, req.usuario!.id);
    if (!hash || !(await bcrypt.compare(String(claveActual ?? ""), hash))) {
      return res.status(400).json({ ok: false, message: "La clave actual no es correcta" });
    }

    await actualizarClave(pool, req.usuario!.id, await bcrypt.hash(claveNueva, 10));
    await registrarHistorial(pool, req.usuario!, "Cambió su clave");

    return res.status(200).json({ ok: true, message: "Clave actualizada" });
  } catch (error) {
    console.error("Error al cambiar clave:", error);
    return res.status(500).json({ ok: false, message: "Error interno del servidor" });
  }
};
