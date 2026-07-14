import { useMemo } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import { Users, ClipboardCheck, BookOpen, TrendingUp } from "lucide-react";
import {
  useLocalStore,
  StoreKeys,
  SEED_STUDENTS,
  type Student,
  type AttendanceMap,
  type Grade,
} from "@/lib/sms-store";

const COLORS = ["oklch(0.208 0.042 265.755)", "oklch(0.6 0.118 184.704)", "oklch(0.646 0.222 41.116)", "oklch(0.828 0.189 84.429)", "oklch(0.769 0.188 70.08)"];

export function Dashboard() {
  const [students] = useLocalStore<Student[]>(StoreKeys.students, SEED_STUDENTS);
  const [attendance] = useLocalStore<AttendanceMap>(StoreKeys.attendance, {});
  const [grades] = useLocalStore<Grade[]>(StoreKeys.grades, []);

  const byCourse = useMemo(() => {
    const map = new Map<string, number>();
    students.forEach((s) => map.set(s.course || "—", (map.get(s.course || "—") || 0) + 1));
    return Array.from(map, ([name, value]) => ({ name, value }));
  }, [students]);

  const byYear = useMemo(() => {
    const map = new Map<string, number>();
    ["1", "2", "3", "4"].forEach((y) => map.set(y, 0));
    students.forEach((s) => map.set(s.year, (map.get(s.year) || 0) + 1));
    return Array.from(map, ([year, count]) => ({ year: `Year ${year}`, count }));
  }, [students]);

  const attendanceStats = useMemo(() => {
    const values = Object.values(attendance);
    const total = values.length;
    const present = values.filter((v) => v === "present").length;
    const late = values.filter((v) => v === "late").length;
    const rate = total ? Math.round(((present + late * 0.5) / total) * 100) : 0;
    return { total, rate };
  }, [attendance]);

  const avgMarks = useMemo(() => {
    if (grades.length === 0) return 0;
    return Math.round(grades.reduce((a, g) => a + g.marks, 0) / grades.length);
  }, [grades]);

  return (
    <main className="mx-auto max-w-6xl px-6 py-8">
      <h2 className="mb-2 text-2xl font-semibold">Dashboard</h2>
      <p className="mb-6 text-sm text-muted-foreground">A quick snapshot of your college data.</p>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total Students" value={students.length} icon={<Users className="h-5 w-5" />} />
        <StatCard label="Attendance Records" value={attendanceStats.total} icon={<ClipboardCheck className="h-5 w-5" />} />
        <StatCard label="Attendance Rate" value={`${attendanceStats.rate}%`} icon={<TrendingUp className="h-5 w-5" />} />
        <StatCard label="Average Marks" value={`${avgMarks}%`} icon={<BookOpen className="h-5 w-5" />} />
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <ChartCard title="Students by Year">
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={byYear}>
              <XAxis dataKey="year" stroke="currentColor" fontSize={12} />
              <YAxis allowDecimals={false} stroke="currentColor" fontSize={12} />
              <Tooltip cursor={{ fill: "var(--muted)" }} />
              <Bar dataKey="count" fill="var(--primary)" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Students by Course">
          {byCourse.length === 0 ? (
            <EmptyChart />
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie data={byCourse} dataKey="value" nameKey="name" outerRadius={90} label>
                  {byCourse.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          )}
        </ChartCard>
      </div>
    </main>
  );
}

function StatCard({ label, value, icon }: { label: string; value: string | number; icon: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-border bg-card p-5">
      <div className="flex items-center justify-between text-muted-foreground">
        <span className="text-sm">{label}</span>
        {icon}
      </div>
      <div className="mt-2 text-3xl font-semibold">{value}</div>
    </div>
  );
}

function ChartCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-border bg-card p-5">
      <h3 className="mb-4 text-sm font-semibold">{title}</h3>
      {children}
    </div>
  );
}

function EmptyChart() {
  return <div className="flex h-[260px] items-center justify-center text-sm text-muted-foreground">No data yet</div>;
}