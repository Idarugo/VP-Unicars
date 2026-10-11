import jwt from "jsonwebtoken";

interface JwtPayload {
  id: number;
  usuario: string;
}

export const generarToken = (payload: JwtPayload): string => {
  return jwt.sign(payload, process.env.JWT_SECRET as string, {
    expiresIn: "12h",
  });
};

export const verificarToken = (token: string): JwtPayload => {
  return jwt.verify(token, process.env.JWT_SECRET as string) as JwtPayload;
};
