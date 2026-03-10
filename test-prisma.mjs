import { prisma } from "@/lib/prisma"

async function main() {
  try {
    const companies = await prisma.company.findMany();
    console.log(companies);
  } catch (error) {
    console.error(error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
