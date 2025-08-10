// lib/auth/checkUserPermission.ts
import { db } from "@/lib/db";
import jwt from "jsonwebtoken";

const SECRET = process.env.JWT_SECRET || "mi_clave_secreta";

export async function checkUserPermission(req: Request, permiso: string) {
  const authHeader = req.headers.get("authorization");

  if (!authHeader) throw new Error("Unauthorized");

  const token = authHeader.split(" ")[1];
  if (!token) throw new Error("Unauthorized");

  const decoded = jwt.verify(token, SECRET) as { sub: string };

  const user = await db.usuario.findUnique({
    where: { id: decoded.sub },
    include: {
      rol: {
        include: {
          permisos: {
            include: { permiso: true },
          },
        },
      },
    },
  });

  if (!user) throw new Error("Unauthorized");

  const claves = user.rol.permisos.map((p) => p.permiso.clave);

  if (!claves.includes(permiso)) throw new Error("Forbidden");
}