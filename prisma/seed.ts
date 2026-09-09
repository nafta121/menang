import { PrismaClient, Role } from "@prisma/client";

const prisma = new PrismaClient();
const employees: Array<{ name: string; role: Role }> = [
  { name: "Tunik", role: "SENIOR" }, { name: "Risma", role: "SENIOR" },
  { name: "Dwi", role: "SENIOR" }, { name: "Dinda", role: "SENIOR" },
  { name: "Bela", role: "JUNIOR" }, { name: "Vina", role: "JUNIOR" }, { name: "Alfi", role: "JUNIOR" },
];

async function main() {
  for (const employee of employees) {
    const existing = await prisma.employee.findFirst({ where: { name: employee.name } });
    if (existing) await prisma.employee.update({ where: { id: existing.id }, data: { role: employee.role, isActive: true } });
    else await prisma.employee.create({ data: employee });
  }
}

main().then(() => prisma.$disconnect()).catch(async (error: unknown) => {
  console.error(error);
  await prisma.$disconnect();
  process.exit(1);
});
