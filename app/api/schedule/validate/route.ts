import { type Employee, type ScheduleEntry, validateSchedule } from "@/lib/scheduling";

export const runtime = "nodejs";

type ValidatePayload = { entries?: ScheduleEntry[]; employees?: Employee[]; expectedOffDays?: number };

function isEmployee(value: unknown): value is Employee {
  if (typeof value !== "object" || value === null) return false;
  const employee = value as Partial<Employee>;
  return typeof employee.id === "string" && typeof employee.name === "string" && (employee.role === "SENIOR" || employee.role === "JUNIOR");
}

function isEntry(value: unknown): value is ScheduleEntry {
  if (typeof value !== "object" || value === null) return false;
  const entry = value as Partial<ScheduleEntry>;
  return typeof entry.employeeId === "string" && typeof entry.date === "string" && ["P", "S", "M", "Mid", "L", "CT"].includes(entry.shiftType ?? "");
}

/** POST /api/schedule/validate — validates a proposed schedule before manual edits are saved. */
export async function POST(request: Request) {
  let payload: ValidatePayload;
  try {
    payload = await request.json() as ValidatePayload;
  } catch {
    return Response.json({ error: "Request body harus berupa JSON." }, { status: 400 });
  }

  if (!Array.isArray(payload.entries) || !Array.isArray(payload.employees) || !payload.entries.every(isEntry) || !payload.employees.every(isEmployee)) {
    return Response.json({ error: "entries dan employees harus berupa data jadwal yang valid." }, { status: 400 });
  }
  if (payload.expectedOffDays !== undefined && (!Number.isInteger(payload.expectedOffDays) || payload.expectedOffDays < 0)) {
    return Response.json({ error: "expectedOffDays harus berupa bilangan bulat positif." }, { status: 400 });
  }

  const violations = validateSchedule(payload.entries, payload.employees, payload.expectedOffDays);
  return Response.json({ valid: violations.length === 0, violations });
}
