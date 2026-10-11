import { Request, Response } from "express";
import { agregarCliente } from "../utils/tiempoReal";

export const conectarTiempoReal = (req: Request, res: Response) => {
  res.set({
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache, no-transform",
    Connection: "keep-alive",
    "X-Accel-Buffering": "no", // nginx: no acumular los mensajes
  });
  res.flushHeaders();
  res.write(`event: conectado\ndata: {}\n\n`);

  const quitar = agregarCliente(req.usuario!.id, res);
  req.on("close", quitar);
};
