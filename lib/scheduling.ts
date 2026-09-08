export type Role = "SENIOR" | "JUNIOR";
export type ShiftType = "P" | "S" | "M" | "Mid" | "L" | "CT";
export type Rule = "FATIGUE" | "COMPOSITION" | "QUOTA_OFF" | "MID_TRIGGER" | "COVERAGE";

export type Employee = { id: string; name: string; role: Role };
export type ScheduleEntry = { employeeId: string; date: string; shiftType: ShiftType; isLocked?: boolean };
export type Violation = { date: string; rule: Rule; severity: "ERROR" | "WARNING"; message: string; shift?: ShiftType };

const primaryShifts: ShiftType[] = ["P", "S", "M"];
const dayKey = (year: number, month: number, day: number) => `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
const daysInMonth = (year: number, month: number) => new Date(Date.UTC(year, month, 0)).getUTCDate();

/** Validates the non-negotiable schedule rules before a schedule is persisted. */
export function validateSchedule(entries: ScheduleEntry[], employees: Employee[], expectedOffDays = 4): Violation[] {
  const byId = new Map(employees.map((employee) => [employee.id, employee]));
  const days = new Map<string, ScheduleEntry[]>();
  for (const entry of entries) days.set(entry.date, [...(days.get(entry.date) ?? []), entry]);
  const violations: Violation[] = [];

  for (const [date, dayEntries] of days) {
    for (const shift of primaryShifts) {
      const members = dayEntries.filter((entry) => entry.shiftType === shift);
      const seniorCount = members.filter((entry) => byId.get(entry.employeeId)?.role === "SENIOR").length;
      if (members.length !== 2 || seniorCount === 0) {
        violations.push({ date, shift, rule: "COMPOSITION", severity: "ERROR", message: `${shift} harus diisi tepat 2 orang dan minimal 1 Senior.` });
      }
    }
    const ctCount = dayEntries.filter((entry) => entry.shiftType === "CT").length;
    const midCount = dayEntries.filter((entry) => entry.shiftType === "Mid").length;
    if (midCount !== ctCount) violations.push({ date, shift: "Mid", rule: "MID_TRIGGER", severity: "ERROR", message: `Slot Mid (${midCount}) harus sama dengan jumlah CT (${ctCount}).` });
  }

  const sortedDates = [...days.keys()].sort();
  for (let index = 1; index < sortedDates.length; index += 1) {
    const previous = days.get(sortedDates[index - 1]) ?? [];
    const current = days.get(sortedDates[index]) ?? [];
    for (const entry of current.filter((item) => item.shiftType === "P")) {
      if (previous.some((item) => item.employeeId === entry.employeeId && item.shiftType === "M")) {
        violations.push({ date: entry.date, shift: "P", rule: "FATIGUE", severity: "ERROR", message: "Karyawan shift Malam tidak dapat mengambil Pagi pada hari berikutnya." });
      }
    }
  }

  for (const employee of employees) {
    const offDays = entries.filter((entry) => entry.employeeId === employee.id && entry.shiftType === "L").length;
    if (offDays !== expectedOffDays) violations.push({ date: "", rule: "QUOTA_OFF", severity: "ERROR", message: `${employee.name} memiliki ${offDays}/${expectedOffDays} hari Libur.` });
  }
  return violations;
}

/**
 * Prevents generation when the staffing and monthly-off requirements cannot coexist.
 * Seven people can cover six primary slots per day, but exactly four L days each only
 * produces 28 rest slots. A 30/31-day month needs 30/31 rest slots.
 */
export function checkMonthlyFeasibility(year: number, month: number, employeeCount: number, offDaysPerEmployee = 4): Violation[] {
  const days = daysInMonth(year, month);
  const requiredRestSlots = days * (employeeCount - 6);
  const configuredRestSlots = employeeCount * offDaysPerEmployee;
  if (configuredRestSlots === requiredRestSlots) return [];
  return [{ date: `${year}-${String(month).padStart(2, "0")}`, rule: "COVERAGE", severity: "ERROR", message: `Konfigurasi tidak feasible: dibutuhkan ${requiredRestSlots} slot non-primary, tetapi kuota Libur menyediakan ${configuredRestSlots}.` }];
}

/** Creates a deterministic, fair 28-day base rota while preserving the M → P fatigue rule. */
export function generateFourWeekSchedule(year: number, month: number, employees: Employee[]): ScheduleEntry[] {
  const feasibility = checkMonthlyFeasibility(year, month, employees.length);
  if (feasibility.length) throw new Error(feasibility[0].message);
  if (employees.filter((employee) => employee.role === "SENIOR").length < 3 || employees.length !== 7) throw new Error("Generator dasar membutuhkan 4 Senior dan 3 Junior.");
  const entries: ScheduleEntry[] = [];
  let priorNightIds = new Set<string>();
  for (let day = 1; day <= 28; day += 1) {
    const date = dayKey(year, month, day);
    const off = employees[(day - 1) % employees.length];
    const assignments: Record<"P" | "S" | "M", Employee[]> = { P: [], S: [], M: [] };
    const fill = (shiftIndex: number, remaining: Employee[]): boolean => {
      if (shiftIndex === primaryShifts.length) return true;
      const shift = primaryShifts[shiftIndex] as "P" | "S" | "M";
      for (let first = 0; first < remaining.length - 1; first += 1) {
        for (let second = first + 1; second < remaining.length; second += 1) {
          const pair = [remaining[first], remaining[second]];
          if (pair.every((employee) => employee.role === "JUNIOR")) continue;
          if (shift === "P" && pair.some((employee) => priorNightIds.has(employee.id))) continue;
          assignments[shift] = pair;
          if (fill(shiftIndex + 1, remaining.filter((employee) => !pair.includes(employee)))) return true;
        }
      }
      assignments[shift] = [];
      return false;
    };
    if (!fill(0, employees.filter((employee) => employee.id !== off.id))) throw new Error(`Tidak ada kombinasi shift aman pada ${date}.`);
    entries.push({ employeeId: off.id, date, shiftType: "L" });
    for (const shift of primaryShifts) for (const employee of assignments[shift as "P" | "S" | "M"]) entries.push({ employeeId: employee.id, date, shiftType: shift });
    priorNightIds = new Set(assignments.M.map((employee) => employee.id));
  }
  return entries;
}
