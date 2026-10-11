import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import {
  countSoportesActivos, createUsuario, existsUsuarioByUsuario, getAllUsuarios, getEquipo, getUsuarioById,
  setUsuarioActivo, updateUsuario,
} from "../models/usuarioModel";
import { actualizarClave } from "../models/authModel";
import { registrarHistorial } from "../models/historialModel";
import { ROL_NOMBRE, type Rol } from "../utils/permisos";
import { color, texto, textoOpcional } from "../utils/validar";

const ROLES: Rol[] = ["admin", "tecnico", "soporte"];
const claveTemporal = () => crypto.randomBytes(6).toString("base64url"); // 8 caracteres

export const getUsuarios = async (req: Request, res: Response) => {
  try {
    const usuarios = await getAllUsuarios(req.app.get("pool"));
    return res.status(200).json({ ok: true, data: usuarios.map((u) => ({ ...u, activo: Boolean(u.activo) })) });
  } catch (error) {
    console.error("Error al obtener usuarios:", error);
    return res.status(500).json({ ok: false, message: "Error interno del servidor" });
  }
};

export const getEquipoController = async (req: Request, res: Response) => {
  try {
    const equipo = await getEquipo(req.app.get("pool"));
    return res.status(200).json({ ok: true, data: equipo });
  } catch (error) {
    console.error("Error al obtener equipo:", error);
    return res.status(500).json({ ok: false, message: "Error interno del servidor" });
  }
};

export const createUsuarioController = async (req: Request, res: Response) => {
  try {
    const pool = req.app.get("pool");
    const nombre = texto(req.body?.nombre, 100);
    const usuario = texto(req.body?.usuario, 40).toLowerCase().replace(/[^a-z0-9._-]/g, "");
    const rol = req.body?.rol as Rol;

    if (!nombre || !usuario) return res.status(400).json({ ok: false, message: "Nombre y usuario son obligatorios" });
    if (!ROLES.includes(rol)) return res.status(400).json({ ok: false, message: "Rol inválido" });
    if (await existsUsuarioByUsuario(pool, usuario)) return res.status(409).json({ ok: false, message: "Ese usuario ya existe" });

    const clave = claveTemporal();
    const id = await createUsuario(pool, {
      nombre,
      usuario,
      claveHash: await bcrypt.hash(clave, 10),
      rol,
      descripcion: textoOpcional(req.body?.descripcion, 120),
      color: color(req.body?.color),
    });

    await registrarHistorial(pool, req.usuario!, "Creó usuario", `${nombre} · ${ROL_NOMBRE[rol]}`);

    // La clave temporal se muestra una sola vez para entregársela a la persona
    return res.status(201).json({ ok: true, message: "Usuario creado", data: { ...(await getUsuarioById(pool, id)), claveTemporal: clave } });
  } catch (error) {
    console.error("Error al crear usuario:", error);
    return res.status(500).json({ ok: false, message: "Error interno del servidor" });
  }
};

export const updateUsuarioController = async (req: Request, res: Response) => {
  try {
    const pool = req.app.get("pool");
    const id = Number(req.params.id);
    const actual = Number.isInteger(id) ? await getUsuarioById(pool, id) : null;
    if (!actual) return res.status(404).json({ ok: false, message: "Usuario no encontrado" });

    const rol = req.body?.rol as Rol | undefined;
    if (rol !== undefined && !ROLES.includes(rol)) return res.status(400).json({ ok: false, message: "Rol inválido" });
    if (rol && actual.rol === "soporte" && rol !== "soporte" && (await countSoportesActivos(pool)) <= 1) {
      return res.status(400).json({ ok: false, message: "Debe quedar al menos un usuario de soporte" });
    }

    await updateUsuario(pool, id, {
      nombre: req.body?.nombre !== undefined ? texto(req.body.nombre, 100) || actual.nombre : undefined,
      rol,
      descripcion: req.body?.descripcion !== undefined ? textoOpcional(req.body.descripcion, 120) : undefined,
      color: req.body?.color !== undefined ? color(req.body.color, actual.color) : undefined,
    });
    await registrarHistorial(pool, req.usuario!, "Editó usuario", actual.nombre);

    return res.status(200).json({ ok: true, message: "Usuario actualizado", data: await getUsuarioById(pool, id) });
  } catch (error) {
    console.error("Error al actualizar usuario:", error);
    return res.status(500).json({ ok: false, message: "Error interno del servidor" });
  }
};

export const setEstadoUsuarioController = async (req: Request, res: Response) => {
  try {
    const pool = req.app.get("pool");
    const id = Number(req.params.id);
    const activo = Boolean(req.body?.activo);
    const actual = Number.isInteger(id) ? await getUsuarioById(pool, id) : null;
    if (!actual) return res.status(404).json({ ok: false, message: "Usuario no encontrado" });
    if (id === req.usuario!.id && !activo) return res.status(400).json({ ok: false, message: "No puedes desactivarte a ti mismo" });
    if (!activo && actual.rol === "soporte" && (await countSoportesActivos(pool)) <= 1) {
      return res.status(400).json({ ok: false, message: "Debe quedar al menos un usuario de soporte" });
    }

    await setUsuarioActivo(pool, id, activo);
    await registrarHistorial(pool, req.usuario!, activo ? "Activó usuario" : "Desactivó usuario", actual.nombre);
    return res.status(200).json({ ok: true, message: activo ? "Usuario activado" : "Usuario desactivado" });
  } catch (error) {
    console.error("Error al cambiar estado:", error);
    return res.status(500).json({ ok: false, message: "Error interno del servidor" });
  }
};

export const resetClaveController = async (req: Request, res: Response) => {
  try {
    const pool = req.app.get("pool");
    const id = Number(req.params.id);
    const actual = Number.isInteger(id) ? await getUsuarioById(pool, id) : null;
    if (!actual) return res.status(404).json({ ok: false, message: "Usuario no encontrado" });

    const clave = claveTemporal();
    await actualizarClave(pool, id, await bcrypt.hash(clave, 10));
    await registrarHistorial(pool, req.usuario!, "Restableció clave", actual.nombre);

    return res.status(200).json({ ok: true, message: "Clave restablecida", data: { claveTemporal: clave } });
  } catch (error) {
    console.error("Error al restablecer clave:", error);
    return res.status(500).json({ ok: false, message: "Error interno del servidor" });
  }
};
