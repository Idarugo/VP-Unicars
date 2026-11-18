// Respaldo completo en JSON (sin claves de usuarios). Lo usan el botón de Mantención y `npm run respaldo`.
// Al armarlo queda registrada la fecha en Mantención ("Último respaldo") y en el historial.
import { Pool } from "mysql2/promise";
import { guardarAjuste, leerAjuste, leerConfiguracion } from "../models/ajustesModel";
import { todosLosCertificados } from "../models/certificadoModel";
import { todosLosCertificadosSeguridad } from "../models/certificadoSeguridadModel";
import { todosLosTrabajos } from "../models/trabajoModel";
import { getAllUsuarios } from "../models/usuarioModel";
import { listarHistorial, registrarHistorial } from "../models/historialModel";

export const armarRespaldo = async (pool: Pool, usuario: { id: number; nombre: string } | null) => {
  const fecha = new Date().toISOString();
  const respaldo = {
    app: "vp-unicars",
    version: 1,
    fecha,
    certificados: await todosLosCertificados(pool),
    certificadosSeguridad: await todosLosCertificadosSeguridad(pool),
    fichasSeguridad: (await leerAjuste(pool, "fichas_seguridad")) || null,
    trabajos: await todosLosTrabajos(pool),
    usuarios: await getAllUsuarios(pool),
    configuracion: await leerConfiguracion(pool),
    contenido: (await leerAjuste(pool, "contenido")) || {},
    historial: await listarHistorial(pool, "", 2000),
  };

  const sistema = (await leerAjuste<Record<string, unknown>>(pool, "sistema")) || {};
  await guardarAjuste(pool, "sistema", { ...sistema, ultimoRespaldo: fecha }, usuario?.id ?? null);
  await registrarHistorial(pool, usuario, "Descargó respaldo", usuario ? "Respaldo completo" : "Respaldo completo (desde el servidor)");
  return respaldo;
};
