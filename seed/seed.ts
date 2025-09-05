import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const bcrypt = (await import("bcryptjs")).default;
  // 1️⃣ Crear los roles si no existen
  await prisma.rol.createMany({
    data: [
      { nombre: "ADMINISTRADOR" },
      { nombre: "USUARIO" },
      { nombre: "AUTORIDAD DE MESA" },
    ],
    skipDuplicates: true,
  });

  // 2️⃣ Obtener el ID del rol ADMINISTRADOR
  const adminRol = await prisma.rol.findUnique({
    where: { nombre: "ADMINISTRADOR" },
  });

  if (!adminRol) {
    throw new Error("❌ No se pudo encontrar el rol ADMINISTRADOR");
  }

  // 3️⃣ Hashear contraseña
  const hashedPassword = await bcrypt.hash('admin123', 10);

  // 4️⃣ Crear usuario admin
  await prisma.usuario.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: {
      email: 'admin@example.com',
      userId: 'admin',
      password: hashedPassword,
      nombre: 'Admin',
      apellido: 'Admin',
      avatarUrl: '',
      rolId: adminRol.id,
    },
  });

  console.log('✅ Seed completado.');

  // 2. Definir módulos y acciones

  const modulos = ["usuarios",
    "circuitos",
    "establecimientos",
    "agrupaciones",
    "mesas",
    "categorias",
    "votantes",
    "reportes",
    "estadoelector",
    "generarusuario",
    "permisos",
    "permisosrol",
    "roles",
    "estadisticas",
    "importarpadron",
    "certificados"];

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
      rolId: adminRol.id,
    })),
    skipDuplicates: true,
  });

  console.log("✅ Seed ejecutado correctamente");
}

main()
  .catch((e) => {
    console.error("❌ Error en seed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
