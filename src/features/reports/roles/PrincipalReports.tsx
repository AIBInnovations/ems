import { useMemo } from "react";
import { CalendarCheck, GraduationCap, Star, Trophy } from "lucide-react";
import { format, parseISO, subDays } from "date-fns";
import { PageHeader } from "@/components/shared/PageHeader";
import {
  StatGrid,
  ChartCard,
  BarSeries,
  LineTrend,
  Donut,
  ListCard,
  type ListItem,
} from "@/features/dashboard/blocks";
import type { StatCardProps } from "@/components/shared/StatCard";
import { db } from "@/data/db";
import { fullName, percent } from "@/lib/format";

/** Shorten a class name like "Class 10" / "Grade 8" to a compact axis label. */
function classShort(name: string): string {
  const m = name.match(/\d+/);
  return m ? `C${m[0]}` : name.slice(0, 6);
}

export function PrincipalReports() {
  const data = useMemo(() => {
    const students = db.getAll("students");
    const staff = db.getAll("staff");
    const classes = db.getAll("classes");
    const reportCards = db.getAll("reportCards");
    const attendance = db.getAll("studentAttendance");

    const studentById = new Map(students.map((s) => [s.id, s]));

    /* ── KPI: average attendance % across all records ── */
    const presentCount = attendance.filter((a) => a.status === "present").length;
    const avgAttendance = attendance.length
      ? Math.round((presentCount / attendance.length) * 100)
      : 0;

    /* ── KPI: pass rate ── */
    const passCount = reportCards.filter((r) => r.result === "pass").length;
    const passRate = reportCards.length
      ? Math.round((passCount / reportCards.length) * 100)
      : 0;

    /* ── KPI: toppers (rank 1) ── */
    const toppers = reportCards.filter((r) => r.rank === 1).length;

    /* ── KPI: average teacher rating ── */
    const teachers = staff.filter(
      (s) => s.roleKey === "class_teacher" || s.roleKey === "subject_teacher",
    );
    const rated = teachers.filter((t) => typeof t.rating === "number");
    const avgRating = rated.length
      ? rated.reduce((sum, t) => sum + (t.rating ?? 0), 0) / rated.length
      : 0;

    /* ── Chart: class-wise average percentage ── */
    const byClass = new Map<string, { sum: number; n: number }>();
    for (const rc of reportCards) {
      const cur = byClass.get(rc.classId) ?? { sum: 0, n: 0 };
      cur.sum += rc.percentage;
      cur.n += 1;
      byClass.set(rc.classId, cur);
    }
    const classAvg = classes
      .filter((c) => byClass.has(c.id))
      .map((c) => {
        const agg = byClass.get(c.id)!;
        return {
          name: classShort(c.name),
          level: c.numericLevel,
          Avg: Math.round((agg.sum / agg.n) * 10) / 10,
        };
      })
      .sort((a, b) => a.level - b.level)
      .map(({ name, Avg }) => ({ name, Avg }));

    /* ── Chart: exam outcomes donut ── */
    const compartmentCount = reportCards.filter((r) => r.result === "compartment").length;
    const failCount = reportCards.filter((r) => r.result === "fail").length;
    const outcomes = [
      { name: "Pass", value: passCount, color: "hsl(var(--success))" },
      { name: "Compartment", value: compartmentCount, color: "hsl(var(--warning))" },
      { name: "Fail", value: failCount, color: "hsl(var(--destructive))" },
    ].filter((o) => o.value > 0);

    /* ── Chart: attendance trend (last 14 days) ── */
    const byDate = new Map<string, { present: number; total: number }>();
    for (const a of attendance) {
      const cur = byDate.get(a.date) ?? { present: 0, total: 0 };
      cur.total += 1;
      if (a.status === "present") cur.present += 1;
      byDate.set(a.date, cur);
    }
    const today = new Date();
    const attendanceTrend = Array.from({ length: 14 }, (_, i) => {
      const d = subDays(today, 13 - i);
      const key = format(d, "yyyy-MM-dd");
      const agg = byDate.get(key);
      return {
        day: format(d, "dd MMM"),
        Present: agg && agg.total ? Math.round((agg.present / agg.total) * 100) : 0,
      };
    });

    /* ── Chart: staff performance — top 8 teachers by rating ── */
    const staffPerf = [...rated]
      .sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0))
      .slice(0, 8)
      .map((t) => ({ name: t.lastName, Rating: t.rating ?? 0 }));

    /* ── List: top performers (rank <= 8) ── */
    const topPerformers: ListItem[] = [...reportCards]
      .filter((r) => r.rank <= 8)
      .sort((a, b) => a.rank - b.rank || b.percentage - a.percentage)
      .slice(0, 8)
      .map((r) => {
        const st = studentById.get(r.studentId);
        return {
          id: r.id,
          title: st ? fullName(st.firstName, st.lastName) : "Student",
          subtitle: `Rank #${r.rank}`,
          badge: { label: percent(r.percentage), variant: "success" as const },
        };
      });

    return {
      avgAttendance,
      passRate,
      toppers,
      avgRating,
      classAvg,
      outcomes,
      attendanceTrend,
      staffPerf,
      topPerformers,
    };
  }, []);

  const stats: StatCardProps[] = [
    {
      label: "Avg Attendance",
      value: `${data.avgAttendance}%`,
      icon: CalendarCheck,
      tone: "success",
      hint: "Across all marked records",
    },
    {
      label: "Pass Rate",
      value: `${data.passRate}%`,
      icon: GraduationCap,
      tone: "primary",
      hint: "Published report cards",
    },
    {
      label: "Toppers",
      value: data.toppers,
      icon: Trophy,
      tone: "accent",
      hint: "Rank #1 across exams",
    },
    {
      label: "Avg Teacher Rating",
      value: data.avgRating.toFixed(1),
      icon: Star,
      tone: "info",
      hint: "Out of 5.0",
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Academic Reports"
        description="Academic performance and attendance insights across the school"
        icon={<GraduationCap className="size-5" />}
      />

      <StatGrid cols={4} items={stats} />

      <div className="grid gap-4 lg:grid-cols-2">
        <ChartCard title="Class-wise Average %">
          <BarSeries
            data={data.classAvg}
            xKey="name"
            series={[{ key: "Avg", label: "Average %" }]}
          />
        </ChartCard>

        <ChartCard title="Exam Outcomes">
          <Donut data={data.outcomes} />
        </ChartCard>

        <ChartCard title="Attendance Trend (14 days)">
          <LineTrend
            data={data.attendanceTrend}
            xKey="day"
            series={[{ key: "Present", label: "Present %" }]}
          />
        </ChartCard>

        <ChartCard title="Staff Performance (avg rating)">
          <BarSeries
            data={data.staffPerf}
            xKey="name"
            series={[{ key: "Rating", label: "Rating" }]}
          />
        </ChartCard>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <ListCard
          title="Top Performers"
          icon={Trophy}
          items={data.topPerformers}
          max={8}
        />
      </div>
    </div>
  );
}
