import { useMemo, useState } from "react";
import { Check, X, Clock } from "lucide-react";
import {
  useLocalStore,
  StoreKeys,
  SEED_STUDENTS,
  type Student,
  type AttendanceMap,
  type AttendanceStatus,
  toCSV,
  downloadFile,
} from "@/lib/sms-store";

function today() {
  return new Date().toISOString().slice(0, 10);
}

export function Attendance() {
  const [students] = useLocalStore<Student[]>(StoreKeys.students, SEED_STUDENTS);
  const [attendance, setAttendance] = useLocalStore<AttendanceMap>(StoreKeys.attendance, {});
  const [date, setDate] = useState(today());

  function setStatus(studentId: string, status: AttendanceStatus) {
    const key = `${date}|${studentId}`;
    setAttendance((prev) => ({ ...prev, [key]: status }));
  }

  const dayStats = useMemo(() => {
    const entries = students.map((s) => attendance[`${date}|${s.id}`]);
    return {
      present: entries.filter((e) => e === "present").length,
      absent: entries.filter((e) => e === "absent").length,
      late: entries.filter((e) => e === "late").length,
      unmarked: entries.filter((e) => !e).length,
    };
  }, [students, attendance, date]);

  function exportDay() {
    const rows = students.map((s) => ({
      date,
      id: s.id,
      name: s.name,
      status: attendance[`${date}|${s.id}`] || "unmarked",
    }));
    downloadFile(`attendance-${date}.csv`, toCSV(rows));
  }

  return (
    <main className="mx-auto max-w-6xl px-6 py-8">
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-2xl font-semibold">Attendance</h2>
          <p className="text-sm text-muted-foreground">Mark today's attendance or review a past date.</p>
        </div>
        <div className="flex items-end gap-2">
          <div>
            <label className="mb-1 block text-xs font-medium text-muted-foreground">Date</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="rounded-md border border-input bg-background px-3 py-2 text-sm"
            />
          </div>
          <button onClick={exportDay} className="rounded-md border border-input bg-background px-3 py-2 text-sm hover:bg-accent">
            Export CSV
          </button>
        </div>
      </div>

      <div className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Stat label="Present" value={dayStats.present} className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" />
        <Stat label="Late" value={dayStats.late} className="bg-amber-500/10 text-amber-600 dark:text-amber-400" />
        <Stat label="Absent" value={dayStats.absent} className="bg-red-500/10 text-red-600 dark:text-red-400" />
        <Stat label="Unmarked" value={dayStats.unmarked} className="bg-muted text-muted-foreground" />
      </div>

      <div className="overflow-hidden rounded-lg border border-border bg-card">
        <table className="w-full text-sm">
          <thead className="bg-muted text-muted-foreground">
            <tr>
              <th className="px-4 py-3 text-left font-medium">ID</th>
              <th className="px-4 py-3 text-left font-medium">Name</th>
              <th className="px-4 py-3 text-left font-medium">Course</th>
              <th className="px-4 py-3 text-right font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {students.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-4 py-10 text-center text-muted-foreground">
                  Add students first from the Students page.
                </td>
              </tr>
            ) : (
              students.map((s) => {
                const current = attendance[`${date}|${s.id}`];
                return (
                  <tr key={s.id} className="border-t border-border">
                    <td className="px-4 py-3 font-mono text-xs">{s.id}</td>
                    <td className="px-4 py-3 font-medium">{s.name}</td>
                    <td className="px-4 py-3 text-muted-foreground">{s.course}</td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-1">
                        <StatusButton active={current === "present"} onClick={() => setStatus(s.id, "present")} color="emerald" icon={<Check className="h-4 w-4" />} label="P" />
                        <StatusButton active={current === "late"} onClick={() => setStatus(s.id, "late")} color="amber" icon={<Clock className="h-4 w-4" />} label="L" />
                        <StatusButton active={current === "absent"} onClick={() => setStatus(s.id, "absent")} color="red" icon={<X className="h-4 w-4" />} label="A" />
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </main>
  );
}

function Stat({ label, value, className }: { label: string; value: number; className: string }) {
  return (
    <div className={`rounded-lg border border-border p-4 ${className}`}>
      <div className="text-xs uppercase tracking-wide opacity-80">{label}</div>
      <div className="mt-1 text-2xl font-semibold">{value}</div>
    </div>
  );
}

function StatusButton({
  active,
  onClick,
  color,
  icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  color: "emerald" | "amber" | "red";
  icon: React.ReactNode;
  label: string;
}) {
  const activeMap = {
    emerald: "bg-emerald-500 text-white border-emerald-500",
    amber: "bg-amber-500 text-white border-amber-500",
    red: "bg-red-500 text-white border-red-500",
  };
  return (
    <button
      onClick={onClick}
      className={`inline-flex items-center gap-1 rounded-md border px-2.5 py-1.5 text-xs font-medium transition-colors ${
        active ? activeMap[color] : "border-input bg-background text-muted-foreground hover:bg-accent"
      }`}
      aria-label={label}
    >
      {icon}
      <span>{label}</span>
    </button>
  );
}