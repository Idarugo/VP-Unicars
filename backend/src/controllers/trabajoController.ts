import { Request, Response } from "express";
import {
  actualizarTrabajo, crearTrabajo, eliminarTrabajo, getTrabajoById, listarTrabajos, type TrabajoData,
} from "../models/trabajoModel";
import { registrarHistorial } from "../models/historialModel";
import { esFecha, esHora, limpiarPatente, telefono, texto, textoOpcional } from "../utils/validar";

const ESTADOS = ["pendiente", "confirmado", "terminado"] as const;
const puedeVerTodo = (req: Request) => req.usuario!.permisos.includes("agenda.ver_todo");
const puedeEditarTodo = (req: Request) => req.usuario!.permisos.includes("agenda.editar_todo");

const leerDatos = (req: Request): { datos?: TrabajoData; error?: string } => {
  const b = req.body ?? {};
  if (!esFecha(b.fecha)) return { error: "Fecha inválida" };
  if (!esHora(b.hora)) return { error: "Hora inválida" };
  const cliente = texto(b.cliente, 120);
  if (!cliente) return { error: "El cliente es obligatorio" };
  const servicio = texto(b.servicio, 60);
  if (!servicio) return { error: "El servicio es obligatorio" };

  return {
    datos: {
      fecha: b.fecha,
      hora: b.hora.slice(0, 5),
      servicio,
      // Un técnico solo puede asignarse trabajos a sí mismo
      encargadoId: puedeEditarTodo(req) ? (Number(b.encargadoId) || null) : req.usuario!.id,
      lugar: b.lugar === "domicilio" ? "domicilio" : "local",
      direccion: textoOpcional(b.direccion, 160),
      cliente,
      telefono: telefono(b.telefono),
      marca: textoOpcional(b.marca, 60),
      modelo: textoOpcional(b.modelo, 80),
      patente: limpiarPatente(b.patente) || null,
      estado: ESTADOS.includes(b.estado) ? b.estado : "pendiente",
      notas: textoOpcional(b.notas, 255),
    },
  };
};

export const getTrabajos = async (req: Request, res: Response) => {
  try {
    const { desde, hasta } = req.query;
    if (!esFecha(desde) || !esFecha(hasta)) return res.status(400).json({ ok: false, message: "Rango de fechas inválido" });

    // Técnicos: solo sus trabajos, aunque pidan otro encargado
    const encargado = puedeVerTodo(req) ? (Number(req.query.encargado) || null) : req.usuario!.id;
    const trabajos = await listarTrabajos(req.app.get("pool"), desde, hasta, encargado);

    return res.status(200).json({ ok: true, data: trabajos });
  } catch (error) {
    console.error("Error al obtener trabajos:", error);
    return res.status(500).json({ ok: false, message: "Error interno del servidor" });
  }
};

export const createTrabajoController = async (req: Request, res: Response) => {
  try {
    const pool = req.app.get("pool");
    const { datos, error } = leerDatos(req);
    if (!datos) return res.status(400).json({ ok: false, message: error });

    const id = await crearTrabajo(pool, datos, req.usuario!.id);
    await registrarHistorial(pool, req.usuario!, "Agendó trabajo", `${datos.servicio} · ${datos.cliente}`);

    return res.status(201).json({ ok: true, message: "Trabajo agendado", data: await getTrabajoById(pool, id) });
  } catch (error) {
    console.error("Error al crear trabajo:", error);
    return res.status(500).json({ ok: false, message: "Error interno del servidor" });
  }
};

export const updateTrabajoController = async (req: Request, res: Response) => {
  try {
    const pool = req.app.get("pool");
    const id = Number(req.params.id);
    const actual = Number.isInteger(id) ? await getTrabajoById(pool, id) : null;
    if (!actual) return res.status(404).json({ ok: false, message: "Trabajo no encontrado" });
    if (!puedeEditarTodo(req) && actual.encargadoId !== req.usuario!.id) {
      return res.status(403).json({ ok: false, message: "Solo puedes editar tus propios trabajos" });
    }

    const { datos, error } = leerDatos(req);
    if (!datos) return res.status(400).json({ ok: false, message: error });

    await actualizarTrabajo(pool, id, datos);
    await registrarHistorial(pool, req.usuario!, datos.estado !== actual.estado ? `Marcó trabajo ${datos.estado}` : "Editó trabajo", `${datos.servicio} · ${datos.cliente}`);

    return res.status(200).json({ ok: true, message: "Trabajo actualizado", data: await getTrabajoById(pool, id) });
  } catch (error) {
    console.error("Error al actualizar trabajo:", error);
    return res.status(500).json({ ok: false, message: "Error interno del servidor" });
  }
};

export const deleteTrabajoController = async (req: Request, res: Response) => {
  try {
    const pool = req.app.get("pool");
    const id = Number(req.params.id);
    const actual = Number.isInteger(id) ? await getTrabajoById(pool, id) : null;
    if (!actual) return res.status(404).json({ ok: false, message: "Trabajo no encontrado" });
    if (!puedeEditarTodo(req) && actual.encargadoId !== req.usuario!.id) {
      return res.status(403).json({ ok: false, message: "Solo puedes eliminar tus propios trabajos" });
    }

    await eliminarTrabajo(pool, id);
    await registrarHistorial(pool, req.usuario!, "Eliminó trabajo", `${actual.servicio} · ${actual.cliente}`);

    return res.status(200).json({ ok: true, message: "Trabajo eliminado" });
  } catch (error) {
    console.error("Error al eliminar trabajo:", error);
    return res.status(500).json({ ok: false, message: "Error interno del servidor" });
  }
};
