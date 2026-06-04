import { useMemo } from "react";
import { BarChart3, Building2, UserCog, Users, Wallet } from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import {
  StatGrid,
  ChartCard,
  BarSeries,
  AreaTrend,
  Donut,
} from "@/features/dashboard/blocks";
import { platformStats } from "@/data/services";
import { db } from "@/data/db";
import { ROLE_LABELS } from "@/types";
import type { RoleKey } from "@/types";
import { formatMoneyCompact } from "@/lib/format";

const PLAN_COLORS: Record<string, string> = {
  basic: "hsl(var(--chart-1))",
  standard: "hsl(var(--chart-2))",
  premium: "hsl(var(--chart-3))",
  enterprise: "hsl(var(--chart-4))",
};

const PLAN_ORDER = ["basic", "standard", "premium", "enterprise"] as const;

/** Short role labels for the per-role bar chart (avoids long axis ticks). */
const ROLE_SHORT: Partial<Record<RoleKey, string>> = {
  admin: "Admin",
  principal: "Principal",
  accountant: "Accounts",
  receptionist: "Reception",
  librarian: "Library",
  lab_assistant: "Lab",
  examiner: "Exams",
  sports_coach: "Sports",
  class_teacher: "Class Tchr",
  subject_teacher: "Sub Tchr",
  bus_driver: "Driver",
  bus_helper: "Helper",
  other_staff: "Other",
};

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"];

export function PlatformAnalytics() {
  const ps = useMemo(() => platformStats(), []);

  const charts = useMemo(() => {
    // Revenue by school (in ₹'000)
    const revenueBySchool = ps.schools.map((r) => ({
      name: r.school.name.split(" ")[0],
      Revenue: Math.round(r.metrics.monthlyRevenue / 1000),
    }));

    // Students by school
    const studentsBySchool = ps.schools.map((r) => ({
      name: r.school.name.split(" ")[0],
      Students: r.metrics.students,
    }));

    // Plan distribution
    const planCounts = new Map<string, number>();
    for (const r of ps.schools) {
      const plan = r.school.plan ?? "basic";
      planCounts.set(plan, (planCounts.get(plan) ?? 0) + 1);
    }
    const planDistribution = PLAN_ORDER.filter((p) => planCounts.has(p)).map((plan) => ({
      name: plan[0].toUpperCase() + plan.slice(1),
      value: planCounts.get(plan) ?? 0,
      color: PLAN_COLORS[plan],
    }));

    // Attendance comparison
    const attendanceBySchool = ps.schools.map((r) => ({
      name: r.school.name.split(" ")[0],
      Attendance: r.metrics.attendancePct,
    }));

    // Members by role (platform staff, excluding super_admin)
    const roleCounts = new Map<RoleKey, number>();
    for (const s of db.getAll("staff")) {
      if (s.roleKey === "super_admin") continue;
      roleCounts.set(s.roleKey, (roleCounts.get(s.roleKey) ?? 0) + 1);
    }
    const membersByRole = [...roleCounts.entries()]
      .map(([roleKey, count]) => ({
        name: ROLE_SHORT[roleKey] ?? ROLE_LABELS[roleKey],
        Members: count,
      }))
      .sort((a, b) => b.Members - a.Members);

    // Enrollment growth — last 6 months cumulative, ramping up to current total
    const total = ps.totalStudents;
    const enrollmentGrowth = MONTHS.map((month, i) => {
      const factor = 0.82 + (0.18 * i) / (MONTHS.length - 1); // 82% → 100%
      return { month, Students: Math.round(total * factor) };
    });

    return {
      revenueBySchool,
      studentsBySchool,
      planDistribution,
      attendanceBySchool,
      membersByRole,
      enrollmentGrowth,
    };
  }, [ps]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Platform Analytics"
        description="Cross-school performance, revenue and growth."
        icon={<BarChart3 className="size-5" />}
      />

      <StatGrid
        cols={4}
        items={[
          {
            label: "Total Students",
            value: ps.totalStudents,
            icon: Users,
            tone: "primary",
            hint: "across all schools",
          },
          {
            label: "Total Staff",
            value: ps.totalStaff,
            icon: UserCog,
            tone: "info",
            hint: "across all schools",
          },
          {
            label: "Platform Revenue",
            value: formatMoneyCompact(ps.totalRevenue),
            icon: Wallet,
            tone: "success",
            hint: "fee collection rolled up",
          },
          {
            label: "Active Schools",
            value: `${ps.activeSchools}/${ps.totalSchools}`,
            icon: Building2,
            tone: "accent",
            hint: `${ps.suspendedSchools} suspended`,
          },
        ]}
      />

      <div className="grid gap-4 lg:grid-cols-2">
        <ChartCard title="Revenue by School">
          <BarSeries
            data={charts.revenueBySchool}
            xKey="name"
            series={[{ key: "Revenue", label: "Revenue (₹'000)" }]}
          />
        </ChartCard>
        <ChartCard title="Students by School">
          <BarSeries
            data={charts.studentsBySchool}
            xKey="name"
            series={[{ key: "Students", label: "Students" }]}
          />
        </ChartCard>
        <ChartCard title="Plan Distribution">
          <Donut data={charts.planDistribution} />
        </ChartCard>
        <ChartCard title="Attendance Comparison">
          <BarSeries
            data={charts.attendanceBySchool}
            xKey="name"
            series={[{ key: "Attendance", label: "Attendance %" }]}
          />
        </ChartCard>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <ChartCard title="Members by Role">
          <BarSeries
            data={charts.membersByRole}
            xKey="name"
            series={[{ key: "Members", label: "Members" }]}
          />
        </ChartCard>
        <ChartCard title="Enrollment Growth">
          <AreaTrend
            data={charts.enrollmentGrowth}
            xKey="month"
            series={[{ key: "Students", label: "Total Students" }]}
          />
        </ChartCard>
      </div>
    </div>
  );
}
