import { prisma } from "@/lib/prisma";

/** GET /api/employees — returns active and inactive employees in a stable display order. */
export async function GET() {
  const employees = await prisma.employee.findMany({
    orderBy: [{ isActive: "desc" }, { name: "asc" }],
    select: { id: true, name: true, role: true, isActive: true, annualQuota: true },
  });
  return Response.json({ employees });
}
