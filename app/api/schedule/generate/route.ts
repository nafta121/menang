import { checkMonthlyFeasibility, generateFourWeekSchedule } from "@/lib/scheduling";
import { prisma } from "@/lib/prisma";

/** POST /api/schedule/generate — creates a safe base rota only when no locked data would be overwritten. */
export async function POST(request: Request) {
  const payload = await request.json().catch(() => null) as { year?: unknown; month?: unknown } | null;
  const year = Number(payload?.year);
  const month = Number(payload?.month);
  if (!Number.isInteger(year) || !Number.isInteger(month) || month < 1 || month > 12) {
    return Response.json({ error: "year dan month wajib valid." }, { status: 400 });
  }

  const employees = await prisma.employee.findMany({ where: { isActive: true }, select: { id: true, name: true, role: true } });
  const feasibility = checkMonthlyFeasibility(year, month, employees.length);
  if (feasibility.length) return Response.json({ error: "Konfigurasi jadwal tidak feasible.", violations: feasibility }, { status: 409 });

  const start = new Date(Date.UTC(year, month - 1, 1));
  const end = new Date(Date.UTC(year, month, 1));
  const locked = await prisma.schedule.count({ where: { date: { gte: start, lt: end }, isLocked: true } });
  if (locked > 0) return Response.json({ error: "Jadwal terkunci tidak boleh ditimpa generator." }, { status: 409 });

  const generated = generateFourWeekSchedule(year, month, employees);
  await prisma.$transaction([
    prisma.schedule.deleteMany({ where: { date: { gte: start, lt: end } } }),
    prisma.schedule.createMany({ data: generated.map((entry) => ({ ...entry, date: new Date(`${entry.date}T00:00:00.000Z`) })) }),
  ]);
  return Response.json({ generated: generated.length, year, month }, { status: 201 });
}
