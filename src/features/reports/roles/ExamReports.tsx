import { useMemo } from "react";
import {
  GraduationCap,
  ClipboardCheck,
  CheckCircle2,
  Clock,
  ListChecks,
} from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import {
  StatGrid,
  ChartCard,
  BarSeries,
  Donut,
  ListCard,
  type ListItem,
} from "@/features/dashboard/blocks";
import type { StatCardProps } from "@/components/shared/StatCard";
import { db } from "@/data/db";

/** Grade bands (matches the CBSE-style grade scale used in seeding). */
const GRADE_ORDER = ["A1", "A2", "B1", "B2", "C1", "C2", "D", "E"];

type BadgeVariant = NonNullable<NonNullable<ListItem["badge"]>["variant"]>;

const STAGE_VARIANT: Record<string, BadgeVariant> = {
  entered: "warning",
  verified: "info",
  approved: "success",
  published: "success",
};

export function ExamReports() {
  /* ── KPI stats ─────────────────────────────────────────────── */
  const stats = useMemo<StatCardProps[]>(() => {
    const exams = db.getAll("exams").length;
    const marksEntered = db.getAll("marksEntries").length;

    const cards = db.getAll("reportCards");
    const passed = cards.filter((c) => c.result === "pass").length;
    const passRate = cards.length ? Math.round((passed / cards.length) * 100) : 0;

    const pendingVerification = db.query(
      "markVerifications",
      (v) => v.stage === "entered",
    ).length;

    return [
      { label: "Exams", value: exams, icon: GraduationCap, tone: "primary" },
      { label: "Marks Entered", value: marksEntered, icon: ClipboardCheck, tone: "info" },
      {
        label: "Pass Rate",
        value: `${passRate}%`,
        icon: CheckCircle2,
        tone: "success",
        hint: `${passed}/${cards.length} passed`,
      },
      {
        label: "Pending Verification",
        value: pendingVerification,
        icon: Clock,
        tone: "warning",
        hint: "Awaiting review",
      },
    ];
  }, []);

  /* ── Subject-wise average marks ────────────────────────────── */
  const subjectAverages = useMemo(() => {
    const entries = db.query("marksEntries", (m) => !m.isAbsent);
    const agg = new Map<string, { sum: number; count: number }>();
    for (const e of entries) {
      const cur = agg.get(e.subjectId) ?? { sum: 0, count: 0 };
      cur.sum += e.marksObtained;
      cur.count += 1;
      agg.set(e.subjectId, cur);
    }
    return [...agg.entries()]
      .map(([subjectId, { sum, count }]) => {
        const subject = db.getById("subjects", subjectId);
        return {
          name: subject?.code ?? "—",
          Avg: count ? Math.round((sum / count) * 10) / 10 : 0,
        };
      })
      .sort((a, b) => b.Avg - a.Avg);
  }, []);

  /* ── Grade distribution (report cards by overall grade) ─────── */
  const gradeDistribution = useMemo(() => {
    const cards = db.getAll("reportCards");
    const counts = new Map<string, number>();
    for (const c of cards) {
      counts.set(c.grade, (counts.get(c.grade) ?? 0) + 1);
    }
    return GRADE_ORDER.filter((g) => counts.has(g)).map((g) => ({
      name: g,
      Count: counts.get(g) ?? 0,
    }));
  }, []);

  /* ── Exam outcomes (pass / compartment / fail) ─────────────── */
  const outcomes = useMemo(() => {
    const cards = db.getAll("reportCards");
    const pass = cards.filter((c) => c.result === "pass").length;
    const compartment = cards.filter((c) => c.result === "compartment").length;
    const fail = cards.filter((c) => c.result === "fail").length;
    return [
      { name: "Pass", value: pass, color: "hsl(var(--success))" },
      { name: "Compartment", value: compartment, color: "hsl(var(--warning))" },
      { name: "Fail", value: fail, color: "hsl(var(--destructive))" },
    ];
  }, []);

  /* ── Marks entry / verification pipeline by stage ──────────── */
  const verificationStages = useMemo(() => {
    const rows = db.getAll("markVerifications");
    const stages = ["entered", "verified", "approved", "published"] as const;
    const palette: Record<(typeof stages)[number], string> = {
      entered: "hsl(var(--warning))",
      verified: "hsl(var(--info))",
      approved: "hsl(var(--chart-2))",
      published: "hsl(var(--success))",
    };
    return stages.map((stage) => ({
      name: stage[0].toUpperCase() + stage.slice(1),
      value: rows.filter((r) => r.stage === stage).length,
      color: palette[stage],
    }));
  }, []);

  /* ── Lowest-scoring subjects (breakdown list) ──────────────── */
  const weakSubjects = useMemo<ListItem[]>(() => {
    return [...subjectAverages]
      .sort((a, b) => a.Avg - b.Avg)
      .slice(0, 6)
      .map((s) => ({
        id: s.name,
        title: s.name,
        subtitle: "Average marks across entries",
        badge: {
          label: `${s.Avg}`,
          variant: s.Avg >= 60 ? "success" : s.Avg >= 40 ? "warning" : "destructive",
        },
      }));
  }, [subjectAverages]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Examination Reports"
        description="Marks, grades and result analytics across exams"
        icon={<GraduationCap className="size-5" />}
      />

      <StatGrid cols={4} items={stats} />

      <div className="grid gap-4 lg:grid-cols-2">
        <ChartCard title="Subject-wise Average Marks">
          <BarSeries
            data={subjectAverages}
            xKey="name"
            series={[{ key: "Avg", label: "Average" }]}
          />
        </ChartCard>

        <ChartCard title="Grade Distribution">
          <BarSeries
            data={gradeDistribution}
            xKey="name"
            series={[{ key: "Count", label: "Students" }]}
          />
        </ChartCard>

        <ChartCard title="Exam Outcomes">
          <Donut data={outcomes} />
        </ChartCard>

        <ChartCard title="Marks Entry Status">
          <Donut data={verificationStages} />
        </ChartCard>
      </div>

      <div className="grid gap-4">
        <ListCard
          title="Lowest Scoring Subjects"
          icon={ListChecks}
          items={weakSubjects}
          emptyText="No marks recorded yet"
          max={6}
        />
      </div>
    </div>
  );
}
