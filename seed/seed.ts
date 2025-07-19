import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  // Crear roles
  const adminRole = await prisma.role.upsert({
    where: { name: 'ADMIN' },
    update: {},
    create: {
      name: 'ADMINISTRADOR',
    },
  });

  const userRole = await prisma.role.upsert({
    where: { name: 'USER' },
    update: {},
    create: {
      name: 'USER',
    },
  });

  const moderatorRole = await prisma.role.upsert({
    where: { name: 'FISCAL' },
    update: {},
    create: {
      name: 'FISCAL',
    },
  });

  const presidenteRole = await prisma.role.upsert({
    where: { name: 'PRESIDENTE' },
    update: {},
    create: {
      name: 'PRESIDENTE',
    },
  });

  // Hashear la contraseña
  const hashedPassword = await bcrypt.hash('admin123', 10);

  // Crear usuario admin
  await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: {
      email: 'admin@example.com',
      userId: 'admin001',
      password: hashedPassword,
      name: 'Admin',
      lastName: 'User',
      avatarUrl: 'https://via.placeholder.com/150',
      roleId: adminRole.id,
    },
  });

  console.log('Seed completado.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
