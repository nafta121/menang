import { prisma } from "@/lib/prisma";

function monthRange(year: number, month: number) {
  return { gte: new Date(Date.UTC(year, month - 1, 1)), lt: new Date(Date.UTC(year, month, 1)) };
}

/** GET /api/schedule?year=2026&month=5 — returns a complete monthly schedule. */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const year = Number(searchParams.get("year"));
  const month = Number(searchParams.get("month"));
  if (!Number.isInteger(year) || !Number.isInteger(month) || month < 1 || month > 12) {
    return Response.json({ error: "year dan month wajib valid." }, { status: 400 });
  }
  const schedules = await prisma.schedule.findMany({
    where: { date: monthRange(year, month) },
    include: { employee: { select: { id: true, name: true, role: true } } },
    orderBy: [{ date: "asc" }, { employee: { name: "asc" } }],
  });
  return Response.json({ year, month, schedules });
}
