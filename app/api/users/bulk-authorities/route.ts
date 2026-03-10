import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";

import { prisma } from "@/lib/prisma"

export async function POST(req: Request) {
  try {
    // flags opcionales: { resetPasswords?: boolean }
    const body = await req.json().catch(() => ({}));
    const resetPasswords = Boolean(body?.resetPasswords);

    // 1) Elegir rol: AUTORIDAD_ROLE_ID o primero con puedeAsignarEstablecimientos = true
    const roleIdEnv = process.env.AUTORIDAD_ROLE_ID ? Number(process.env.AUTORIDAD_ROLE_ID) : undefined;
    const role = roleIdEnv
      ? await prisma.rol.findUnique({ where: { id: roleIdEnv } })
      : await prisma.rol.findFirst({
          where: { puedeAsignarEstablecimientos: true },
          orderBy: { id: "asc" },
        });

    if (!role) {
      return NextResponse.json(
        { error: "No se encontró un rol con puedeAsignarEstablecimientos=true ni AUTORIDAD_ROLE_ID definido." },
        { status: 400 }
      );
    }

    // 2) Traer escuelas
    const escuelas = await prisma.establecimiento.findMany({
      select: { id: true, nombre: true },
      orderBy: { id: "asc" },
    });

    const stats = {
      totalEscuelas: escuelas.length,
      usuariosCreados: 0,
      usuariosActualizados: 0,
      enlacesCreados: 0,
      enlacesYaExistian: 0,
      errores: 0,
      roleId: role.id,
    };

    // 3) Procesar una por una (seguro para DB; si querés paralelizar, podemos agregar p-limit)
    for (const e of escuelas) {
      try {
        const userId = `aut${e.id}`;
        const email = `email${e.id}@aut.com`;
        const rawPassword = `aut${e.id}2025!`;
        const passwordHash = await bcrypt.hash(rawPassword, 10);

        // ¿Existe por userId?
        const existing = await prisma.usuario.findUnique({ where: { userId } });

        let usuarioId: string;

        if (existing) {
          const updated = await prisma.usuario.update({
            where: { id: existing.id },
            data: {
              nombre: "AUTORIDAD DE MESA",
              apellido: e.nombre,
              rolId: role.id,
              ...(resetPasswords ? { password: passwordHash } : {}),
              // Si querés forzar email siempre: email
            },
            select: { id: true },
          });
          usuarioId = updated.id;
          stats.usuariosActualizados += 1;
        } else {
          const created = await prisma.usuario.create({
            data: {
              userId,
              email,
              password: passwordHash,
              nombre: "AUTORIDAD DE MESA",
              apellido: e.nombre,
              rolId: role.id,
            },
            select: { id: true },
          });
          usuarioId = created.id;
          stats.usuariosCreados += 1;
        }

        // Vincular Usuario <-> Establecimiento
        const link = await prisma.usuarioEstablecimiento.findUnique({
          where: {
            usuarioId_establecimientoId: {
              usuarioId,
              establecimientoId: e.id,
            },
          },
        });

        if (link) {
          stats.enlacesYaExistian += 1;
        } else {
          await prisma.usuarioEstablecimiento.create({
            data: {
              usuarioId,
              establecimientoId: e.id,
            },
          });
          stats.enlacesCreados += 1;
        }
      } catch (err) {
        console.error(`Error procesando escuela ${e.id}:`, err);
        stats.errores += 1;
      }
    }

    return NextResponse.json({ ok: true, stats });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Error generando usuarios." }, { status: 500 });
  }
}
