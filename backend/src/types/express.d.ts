import type { UsuarioSesion } from "../models/authModel";

declare global {
  namespace Express {
    interface Request {
      usuario?: UsuarioSesion;
    }
  }
}

export {};
