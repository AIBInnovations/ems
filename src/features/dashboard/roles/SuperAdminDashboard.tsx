import { useMemo } from "react";
import { Activity, BarChart3, Building2, Network, TrendingUp, UserCog, Users } from "lucide-react";
import {
  DashHeader,
  StatGrid,
  ListCard,
  QuickActions,
  ChartCard,
  BarSeries,
  recentActivityItems,
  type ListItem,
} from "@/features/dashboard/blocks";
import type { StatCardProps } from "@/components/shared/StatCard";
import { platformStats } from "@/data/services";
import { areaRoute } from "@/lib/routes";
import { formatMoneyCompact } from "@/lib/format";

export function SuperAdminDashboard() {
  const ps = useMemo(() => platformStats(), []);

  const stats: StatCardProps[] = useMemo(
    () => [
      {
        label: "Schools",
        value: `${ps.activeSchools}/${ps.totalSchools}`,
        icon: Building2,
        tone: "primary",
        to: areaRoute("schools"),
        hint: `${ps.suspendedSchools} suspended`,
      },
      {
        label: "Total Students",
        value: ps.totalStudents.toLocaleString("en-IN"),
        icon: Users,
        tone: "info",
        hint: "all schools",
      },
      {
        label: "Total Staff",
        value: ps.totalStaff.toLocaleString("en-IN"),
        icon: UserCog,
        tone: "success",
      },
      {
        label: "Platform MRR",
        value: formatMoneyCompact(ps.mrr),
        icon: TrendingUp,
        tone: "accent",
        hint: "recurring/mo",
      },
    ],
    [ps],
  );

  const studentsBySchool = useMemo(
    () => ps.schools.map((r) => ({ name: r.school.name.split(" ")[0], Students: r.metrics.students })),
    [ps],
  );

  const needsAttention: ListItem[] = useMemo(
    () =>
      ps.schools
        .filter((r) => r.school.subscriptionStatus === "overdue" || !r.school.isActive)
        .map((r) => ({
          id: r.school.id,
          title: r.school.name,
          subtitle: r.school.city,
          badge: {
            label: !r.school.isActive ? "Suspended" : "Overdue",
            variant: (!r.school.isActive ? "secondary" : "destructive") as "secondary" | "destructive",
          },
          to: areaRoute("schools/" + r.school.id),
        })),
    [ps],
  );

  const topByRevenue: ListItem[] = useMemo(
    () =>
      [...ps.schools]
        .sort((a, b) => b.metrics.monthlyRevenue - a.metrics.monthlyRevenue)
        .slice(0, 5)
        .map((r) => ({
          id: r.school.id,
          title: r.school.name,
          subtitle: `${r.school.plan ?? "—"} plan`,
          to: areaRoute("schools/" + r.school.id),
          right: <span className="font-mono text-sm">{formatMoneyCompact(r.metrics.monthlyRevenue)}</span>,
        })),
    [ps],
  );

  const recent = useMemo(() => recentActivityItems(6), []);

  return (
    <div className="space-y-6">
      <DashHeader
        subtitleOverride="Platform overview across all schools"
        actions={
          <QuickActions
            actions={[
              { label: "All Schools", icon: Building2, to: areaRoute("schools"), tone: "accent" },
              { label: "Platform Analytics", icon: BarChart3, to: areaRoute("reports") },
              { label: "Services Registry", icon: Network, to: areaRoute("services") },
              { label: "Activity Log", icon: Activity, to: areaRoute("activity") },
            ]}
          />
        }
      />

      <StatGrid cols={4} items={stats} />

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <ChartCard title="Students by School">
            <BarSeries data={studentsBySchool} xKey="name" series={[{ key: "Students", label: "Students" }]} />
          </ChartCard>
        </div>
        <ListCard
          title="Needs Attention"
          icon={Activity}
          items={needsAttention}
          emptyText="All schools healthy"
          viewAllTo={areaRoute("schools")}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <ListCard
            title="Top Schools by Revenue"
            icon={TrendingUp}
            items={topByRevenue}
            emptyText="No revenue recorded"
            viewAllTo={areaRoute("schools")}
          />
        </div>
        <ListCard
          title="Recent Platform Activity"
          icon={Activity}
          items={recent}
          emptyText="No recent activity"
          viewAllTo={areaRoute("activity")}
        />
      </div>
    </div>
  );
}
