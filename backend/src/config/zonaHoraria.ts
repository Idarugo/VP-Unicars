// Toda la app trabaja en hora de Chile aunque el servidor esté en UTC.
// Se importa primero en server.ts: debe definirse antes de usar fechas.
process.env.TZ = process.env.TZ || "America/Santiago";

// Diferencia actual con UTC en formato "+HH:MM" (cambia con el horario de verano)
export const offsetChile = () => {
  const min = -new Date().getTimezoneOffset();
  const signo = min >= 0 ? "+" : "-";
  const abs = Math.abs(min);
  return `${signo}${String(Math.floor(abs / 60)).padStart(2, "0")}:${String(abs % 60).padStart(2, "0")}`;
};
