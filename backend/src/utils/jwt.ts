import jwt from "jsonwebtoken";

interface JwtPayload {
  id: number;
  usuario: string;
  v: number; // versión de sesión del usuario (ver usuarios.sesion_version)
}

export const generarToken = (payload: JwtPayload): string => {
  return jwt.sign(payload, process.env.JWT_SECRET as string, {
    algorithm: "HS256",
    expiresIn: "12h",
  });
};

export const verificarToken = (token: string): JwtPayload => {
  return jwt.verify(token, process.env.JWT_SECRET as string, { algorithms: ["HS256"] }) as JwtPayload;
};
