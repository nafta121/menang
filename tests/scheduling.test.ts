import assert from "node:assert/strict";
import { checkMonthlyFeasibility, generateFourWeekSchedule, validateSchedule, type Employee, type ScheduleEntry } from "../lib/scheduling.ts";

const team: Employee[] = ["Tunik", "Risma", "Dwi", "Dinda"].map((name, index) => ({ id: `s${index}`, name, role: "SENIOR" as const })).concat(["Bela", "Vina", "Alfi"].map((name, index) => ({ id: `j${index}`, name, role: "JUNIOR" as const })));
const fatigueEntries: ScheduleEntry[] = [
  { employeeId: "s0", date: "2026-05-01", shiftType: "M" }, { employeeId: "j0", date: "2026-05-01", shiftType: "M" },
  { employeeId: "s0", date: "2026-05-02", shiftType: "P" }, { employeeId: "j0", date: "2026-05-02", shiftType: "P" },
];
assert.ok(validateSchedule(fatigueEntries, team).some((violation) => violation.rule === "FATIGUE"));
assert.equal(checkMonthlyFeasibility(2026, 2, 7).length, 0);
assert.equal(checkMonthlyFeasibility(2026, 5, 7)[0].rule, "COVERAGE");
const generated = generateFourWeekSchedule(2026, 2, team);
assert.equal(generated.length, 196);
assert.deepEqual(validateSchedule(generated, team), []);
console.log("scheduling rules: passed");
