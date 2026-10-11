// Permisos por rol. Se validan siempre en el backend (requirePermission),
// el frontend solo los usa para mostrar u ocultar opciones.
export type Rol = "soporte" | "admin" | "tecnico";

const ADMIN = [
  "agenda.ver_todo",
  "agenda.editar_todo",
  "certificados.ver",
  "certificados.crear",
  "certificados.anular",
  "estadisticas.ver",
];

export const PERMISOS: Record<Rol, string[]> = {
  admin: ADMIN,
  tecnico: ["agenda.ver_propia", "agenda.editar_propia", "certificados.ver", "certificados.crear"],
  soporte: [
    ...ADMIN,
    "usuarios.gestionar",
    "contenido.editar",
    "configuracion.editar",
    "historial.ver",
    "mantencion.ver",
    "respaldos.exportar",
  ],
};

export const ROL_NOMBRE: Record<Rol, string> = {
  soporte: "Soporte técnico",
  admin: "Administrador",
  tecnico: "Técnico",
};
