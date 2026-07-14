import { useMemo, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import {
  useLocalStore,
  StoreKeys,
  SEED_STUDENTS,
  gradeLetter,
  uid,
  toCSV,
  downloadFile,
  type Student,
  type Grade,
} from "@/lib/sms-store";

export function Grades() {
  const [students] = useLocalStore<Student[]>(StoreKeys.students, SEED_STUDENTS);
  const [grades, setGrades] = useLocalStore<Grade[]>(StoreKeys.grades, []);
  const [studentId, setStudentId] = useState("");
  const [subject, setSubject] = useState("");
  const [marks, setMarks] = useState("");

  function addGrade(e: React.FormEvent) {
    e.preventDefault();
    const m = Number(marks);
    if (!studentId || !subject.trim() || Number.isNaN(m) || m < 0 || m > 100) {
      alert("Please pick a student, enter a subject, and marks between 0 and 100.");
      return;
    }
    setGrades((prev) => [{ id: uid(), studentId, subject: subject.trim(), marks: m }, ...prev]);
    setSubject("");
    setMarks("");
  }

  function remove(id: string) {
    setGrades((prev) => prev.filter((g) => g.id !== id));
  }

  const summary = useMemo(() => {
    return students.map((s) => {
      const g = grades.filter((x) => x.studentId === s.id);
      const avg = g.length ? g.reduce((a, x) => a + x.marks, 0) / g.length : 0;
      const { letter, pass } = gradeLetter(avg);
      return { student: s, count: g.length, avg: Math.round(avg * 10) / 10, letter, pass };
    });
  }, [students, grades]);

  function exportGrades() {
    const rows = grades.map((g) => {
      const s = students.find((x) => x.id === g.studentId);
      return { id: g.studentId, name: s?.name || "", subject: g.subject, marks: g.marks };
    });
    downloadFile(`grades-${new Date().toISOString().slice(0, 10)}.csv`, toCSV(rows));
  }

  return (
    <main className="mx-auto max-w-6xl px-6 py-8">
      <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-2xl font-semibold">Grades</h2>
          <p className="text-sm text-muted-foreground">Enter subject marks and see per-student averages.</p>
        </div>
        <button onClick={exportGrades} className="rounded-md border border-input bg-background px-3 py-2 text-sm hover:bg-accent">
          Export CSV
        </button>
      </div>

      <form onSubmit={addGrade} className="mb-6 rounded-lg border border-border bg-card p-4">
        <div className="grid gap-3 sm:grid-cols-[1fr_1fr_120px_auto]">
          <select
            value={studentId}
            onChange={(e) => setStudentId(e.target.value)}
            className="rounded-md border border-input bg-background px-3 py-2 text-sm"
          >
            <option value="">Select student</option>
            {students.map((s) => (
              <option key={s.id} value={s.id}>{s.id} — {s.name}</option>
            ))}
          </select>
          <input
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="Subject (e.g. Mathematics)"
            className="rounded-md border border-input bg-background px-3 py-2 text-sm"
          />
          <input
            type="number"
            min={0}
            max={100}
            value={marks}
            onChange={(e) => setMarks(e.target.value)}
            placeholder="Marks / 100"
            className="rounded-md border border-input bg-background px-3 py-2 text-sm"
          />
          <button type="submit" className="inline-flex items-center justify-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90">
            <Plus className="h-4 w-4" /> Add
          </button>
        </div>
      </form>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="overflow-hidden rounded-lg border border-border bg-card">
          <div className="border-b border-border bg-muted px-4 py-2 text-sm font-medium">Recent Marks</div>
          <table className="w-full text-sm">
            <thead className="text-muted-foreground">
              <tr>
                <th className="px-4 py-2 text-left font-medium">Student</th>
                <th className="px-4 py-2 text-left font-medium">Subject</th>
                <th className="px-4 py-2 text-right font-medium">Marks</th>
                <th className="px-4 py-2"></th>
              </tr>
            </thead>
            <tbody>
              {grades.length === 0 ? (
                <tr><td colSpan={4} className="px-4 py-8 text-center text-muted-foreground">No marks recorded yet.</td></tr>
              ) : (
                grades.map((g) => {
                  const s = students.find((x) => x.id === g.studentId);
                  return (
                    <tr key={g.id} className="border-t border-border">
                      <td className="px-4 py-2">{s?.name || g.studentId}</td>
                      <td className="px-4 py-2">{g.subject}</td>
                      <td className="px-4 py-2 text-right font-mono">{g.marks}</td>
                      <td className="px-4 py-2 text-right">
                        <button onClick={() => remove(g.id)} className="text-muted-foreground hover:text-destructive" aria-label="Delete">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        <div className="overflow-hidden rounded-lg border border-border bg-card">
          <div className="border-b border-border bg-muted px-4 py-2 text-sm font-medium">Student Averages</div>
          <table className="w-full text-sm">
            <thead className="text-muted-foreground">
              <tr>
                <th className="px-4 py-2 text-left font-medium">Student</th>
                <th className="px-4 py-2 text-right font-medium">Subjects</th>
                <th className="px-4 py-2 text-right font-medium">Avg %</th>
                <th className="px-4 py-2 text-right font-medium">Grade</th>
                <th className="px-4 py-2 text-right font-medium">Result</th>
              </tr>
            </thead>
            <tbody>
              {summary.map(({ student, count, avg, letter, pass }) => (
                <tr key={student.id} className="border-t border-border">
                  <td className="px-4 py-2">{student.name}</td>
                  <td className="px-4 py-2 text-right">{count}</td>
                  <td className="px-4 py-2 text-right font-mono">{count ? avg : "—"}</td>
                  <td className="px-4 py-2 text-right font-semibold">{count ? letter : "—"}</td>
                  <td className="px-4 py-2 text-right">
                    {count === 0 ? (
                      <span className="text-muted-foreground">—</span>
                    ) : pass ? (
                      <span className="rounded-md bg-emerald-500/10 px-2 py-0.5 text-xs font-medium text-emerald-600 dark:text-emerald-400">Pass</span>
                    ) : (
                      <span className="rounded-md bg-red-500/10 px-2 py-0.5 text-xs font-medium text-red-600 dark:text-red-400">Fail</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}