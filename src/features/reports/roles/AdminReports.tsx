import { useMemo } from "react";
import { BarChart3, Users, UserCog, CalendarCheck, Wallet, Layers } from "lucide-react";
import { format, subDays } from "date-fns";
import { PageHeader } from "@/components/shared/PageHeader";
import {
  StatGrid,
  ChartCard,
  BarSeries,
  AreaTrend,
  Donut,
  ListCard,
  type ListItem,
} from "@/features/dashboard/blocks";
import type { StatCardProps } from "@/components/shared/StatCard";
import { db } from "@/data/db";
import { formatMoneyCompact } from "@/lib/format";

/** Strip the "Class " prefix for compact chart axis labels. */
function shortClassName(name: string): string {
  return name.replace(/^Class\s+/i, "").trim() || name;
}

/** Admin analytics — broad, school-wide view across students, staff, attendance and fees. */
export function AdminReports() {
  const data = useMemo(() => {
    const students = db.getAll("students");
    const activeStudents = students.filter((s) => s.status === "active");
    const staff = db.getAll("staff");
    const classes = db.getAll("classes");
    const attendance = db.getAll("studentAttendance");
    const payments = db.getAll("payments");
    const feeBills = db.getAll("feeBills");

    // ── KPIs ────────────────────────────────────────────────────────────
    const totalStudents = students.length;
    const totalStaff = staff.filter((s) => s.roleKey !== "super_admin").length;

    const present = attendance.filter((a) => a.status === "present").length;
    const avgAttendance = attendance.length ? Math.round((present / attendance.length) * 100) : 0;

    const feesCollected = payments
      .filter((p) => p.status === "success")
      .reduce((sum, p) => sum + p.amount, 0);

    // ── Student strength by class (sorted by numericLevel) ───────────────
    const countByClass = new Map<string, number>();
    for (const s of activeStudents) {
      countByClass.set(s.classId, (countByClass.get(s.classId) ?? 0) + 1);
    }
    const classRows = classes
      .slice()
      .sort((a, b) => a.numericLevel - b.numericLevel)
      .map((c) => ({ name: shortClassName(c.name), Students: countByClass.get(c.id) ?? 0 }));

    // ── Largest classes (top 5 by student count) ─────────────────────────
    const largestClasses: ListItem[] = classes
      .map((c) => ({ id: c.id, name: c.name, count: countByClass.get(c.id) ?? 0 }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5)
      .map((c) => ({
        id: c.id,
        title: c.name,
        subtitle: `${c.count === 1 ? "1 student" : `${c.count} students`}`,
        right: <span className="text-sm font-semibold tabular-nums">{c.count}</span>,
      }));

    // ── Attendance trend (last 14 days, present %) ───────────────────────
    const byDate = new Map<string, { present: number; total: number }>();
    for (const a of attendance) {
      const bucket = byDate.get(a.date) ?? { present: 0, total: 0 };
      bucket.total += 1;
      if (a.status === "present") bucket.present += 1;
      byDate.set(a.date, bucket);
    }
    const today = new Date();
    const attendanceTrend = Array.from({ length: 14 }, (_, i) => {
      const d = subDays(today, 13 - i);
      const key = format(d, "yyyy-MM-dd");
      const bucket = byDate.get(key);
      const pct = bucket && bucket.total ? Math.round((bucket.present / bucket.total) * 100) : 0;
      return { day: format(d, "dd MMM"), Present: pct };
    });

    // ── Gender distribution ──────────────────────────────────────────────
    const genderCounts = { male: 0, female: 0, other: 0 };
    for (const s of students) genderCounts[s.gender] += 1;
    const genderData = [
      { name: "Male", value: genderCounts.male, color: "hsl(var(--chart-1))" },
      { name: "Female", value: genderCounts.female, color: "hsl(var(--chart-2))" },
      { name: "Other", value: genderCounts.other, color: "hsl(var(--chart-3))" },
    ].filter((g) => g.value > 0);

    // ── Fee status distribution ──────────────────────────────────────────
    const feeStatusMeta = [
      { key: "paid", name: "Paid", color: "hsl(var(--success))" },
      { key: "partial", name: "Partial", color: "hsl(var(--warning))" },
      { key: "due", name: "Due", color: "hsl(var(--info))" },
      { key: "overdue", name: "Overdue", color: "hsl(var(--destructive))" },
    ] as const;
    const feeStatusData = feeStatusMeta
      .map((m) => ({
        name: m.name,
        value: feeBills.filter((b) => b.status === m.key).length,
        color: m.color,
      }))
      .filter((s) => s.value > 0);

    const stats: StatCardProps[] = [
      { label: "Total Students", value: totalStudents, icon: Users, tone: "primary", hint: `${activeStudents.length} active` },
      { label: "Total Staff", value: totalStaff, icon: UserCog, tone: "info", hint: "Excludes super admin" },
      { label: "Avg Attendance", value: `${avgAttendance}%`, icon: CalendarCheck, tone: "success", hint: "Overall present rate" },
      { label: "Fees Collected", value: formatMoneyCompact(feesCollected), icon: Wallet, tone: "accent", hint: "Successful payments" },
    ];

    return { stats, classRows, attendanceTrend, genderData, feeStatusData, largestClasses };
  }, []);

  return (
    <div className="space-y-6">
      <PageHeader
        title="School Reports"
        description="School-wide analytics across enrolment, staffing, attendance and fee collection."
        icon={<BarChart3 className="size-5" />}
      />

      <StatGrid cols={4} items={data.stats} />

      <div className="grid gap-4 lg:grid-cols-2">
        <ChartCard title="Student Strength by Class">
          <BarSeries data={data.classRows} xKey="name" series={[{ key: "Students", label: "Students" }]} />
        </ChartCard>

        <ChartCard title="Attendance Trend (14 days)">
          <AreaTrend data={data.attendanceTrend} xKey="day" series={[{ key: "Present", label: "Present %" }]} />
        </ChartCard>

        <ChartCard title="Gender Distribution">
          <Donut data={data.genderData} />
        </ChartCard>

        <ChartCard title="Fee Status">
          <Donut data={data.feeStatusData} />
        </ChartCard>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <ListCard title="Largest Classes" icon={Layers} items={data.largestClasses} max={5} />
      </div>
    </div>
  );
}
