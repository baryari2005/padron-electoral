import {prisma} from "../lib/prisma"

async function main() {
  // 1. Crear roles
  const [admin, fiscal, supervisor] = await Promise.all([
    prisma.rol.upsert({
      where: { nombre: "ADMINISTRADOR" },
      update: {},
      create: { nombre: "ADMINISTRADOR" },
    }),
    prisma.rol.upsert({
      where: { nombre: "AUTORIDAD DE MESA" },
      update: {},
      create: { nombre: "AUTORIDAD DE MESA" },
    }),
    prisma.rol.upsert({
      where: { nombre: "USUARIO" },
      update: {},
      create: { nombre: "USUARIO" },
    }),
  ]);

  // 2. Definir módulos y acciones
  const modulos = ["usuarios", "circuitos", "establecimientos", "agrupaciones", "mesas"];
  const acciones = ["ver", "crear", "editar", "eliminar"] as const;

  // 3. Crear todos los permisos combinando módulo + acción
  const permisos = modulos.flatMap((modulo) =>
    acciones.map((accion) => ({
      clave: `${accion}_${modulo}`,
      descripcion: `Puede ${accion} ${modulo}`,
      modulo,
      accion,
    }))
  );

  await prisma.permiso.createMany({
    data: permisos,
    skipDuplicates: true,
  });

  // 4. Asignar todos los permisos al rol ADMINISTRADOR
  const todosLosPermisos = await prisma.permiso.findMany();
  await prisma.permisoPorRol.createMany({
    data: todosLosPermisos.map((p) => ({
      permisoId: p.id,
      rolId: admin.id,
    })),
    skipDuplicates: true,
  });

  console.log("✅ Seed ejecutado correctamente");
}

main()
  .catch((e) => {
    console.error("❌ Error en el seed", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
