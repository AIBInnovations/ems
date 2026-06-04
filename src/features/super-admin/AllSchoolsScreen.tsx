import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Building2,
  School2,
  Power,
  PowerOff,
  AlertTriangle,
  Users,
  CircleDollarSign,
} from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import {
  StatGrid,
  Panel,
  ChartCard,
  BarSeries,
  Donut,
} from "@/features/dashboard/blocks";
import { DataTable } from "@/components/shared/DataTable";
import { StatusPill } from "@/components/shared/StatusPill";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useDialogs } from "@/components/shared/dialogs";
import { toast } from "@/components/ui/sonner";
import { db } from "@/data/db";
import { platformService, schoolMetrics } from "@/data/services";
import { formatMoneyCompact } from "@/lib/format";
import type { School, ResourceColumn } from "@/types";

const PLAN_COLORS = [
  "hsl(var(--chart-1))",
  "hsl(var(--chart-2))",
  "hsl(var(--chart-3))",
  "hsl(var(--chart-4))",
];

const SUBSCRIPTION_COLORS: Record<string, string> = {
  active: "hsl(var(--success))",
  overdue: "hsl(var(--destructive))",
  trial: "hsl(var(--info))",
};

export function AllSchoolsScreen() {
  const navigate = useNavigate();
  const { confirm } = useDialogs();
  const [tick, setTick] = useState(0);

  const schools = useMemo(() => db.getAll("schools"), [tick]);

  const derived = useMemo(() => {
    const rows = schools.map((s) => ({ school: s, metrics: schoolMetrics(s) }));

    const totalSchools = schools.length;
    const activeSchools = schools.filter((s) => s.isActive).length;
    const overdueAccounts = schools.filter((s) => s.subscriptionStatus === "overdue").length;
    const mrr = schools.reduce(
      (sum, s) =>
        s.subscriptionStatus !== "trial" && s.isActive
          ? sum + Math.round((s.subscriptionAmount ?? 0) / 12)
          : sum,
      0,
    );

    // Students by school (top 8 by enrolment)
    const studentsBySchool = [...rows]
      .sort((a, b) => b.metrics.students - a.metrics.students)
      .slice(0, 8)
      .map((r) => ({ name: r.school.name, Students: r.metrics.students }));

    // Plan distribution
    const planOrder: NonNullable<School["plan"]>[] = ["basic", "standard", "premium", "enterprise"];
    const planMix = planOrder
      .map((plan, i) => ({
        name: plan[0].toUpperCase() + plan.slice(1),
        value: schools.filter((s) => s.plan === plan).length,
        color: PLAN_COLORS[i % PLAN_COLORS.length],
      }))
      .filter((p) => p.value > 0);

    // Subscription status mix
    const subOrder: NonNullable<School["subscriptionStatus"]>[] = ["active", "overdue", "trial"];
    const subscriptionMix = subOrder
      .map((status) => ({
        name: status[0].toUpperCase() + status.slice(1),
        value: schools.filter((s) => s.subscriptionStatus === status).length,
        color: SUBSCRIPTION_COLORS[status],
      }))
      .filter((s) => s.value > 0);

    return { totalSchools, activeSchools, overdueAccounts, mrr, studentsBySchool, planMix, subscriptionMix };
  }, [schools]);

  const columns: ResourceColumn<School>[] = useMemo(
    () => [
      {
        key: "name",
        header: "School",
        accessor: (s) => s.name,
        cell: (s) => (
          <div className="min-w-0">
            <p className="truncate font-semibold">{s.name}</p>
            <p className="truncate text-xs text-muted-foreground">{s.city}</p>
          </div>
        ),
      },
      {
        key: "region",
        header: "Region",
        accessor: (s) => s.region ?? "—",
        hideBelow: "lg",
      },
      {
        key: "plan",
        header: "Plan",
        accessor: (s) => s.plan ?? "",
        cell: (s) => (
          <Badge
            variant={
              s.plan === "enterprise" ? "default" : s.plan === "premium" ? "info" : "secondary"
            }
            className="capitalize"
          >
            {s.plan ?? "—"}
          </Badge>
        ),
      },
      {
        key: "students",
        header: "Students",
        accessor: (s) => schoolMetrics(s).students,
        align: "right",
      },
      {
        key: "staff",
        header: "Staff",
        accessor: (s) => schoolMetrics(s).staff,
        align: "right",
        hideBelow: "md",
      },
      {
        key: "revenue",
        header: "Revenue",
        accessor: (s) => schoolMetrics(s).monthlyRevenue,
        cell: (s) => formatMoneyCompact(schoolMetrics(s).monthlyRevenue),
        align: "right",
        mono: true,
        hideBelow: "md",
      },
      {
        key: "attendance",
        header: "Attendance",
        accessor: (s) => schoolMetrics(s).attendancePct,
        cell: (s) => schoolMetrics(s).attendancePct + "%",
        align: "right",
        hideBelow: "lg",
      },
      {
        key: "subscription",
        header: "Subscription",
        accessor: (s) => s.subscriptionStatus ?? "",
        cell: (s) => (
          <StatusPill
            status={
              s.subscriptionStatus === "active"
                ? "active"
                : s.subscriptionStatus === "overdue"
                  ? "overdue"
                  : "pending"
            }
            label={s.subscriptionStatus}
          />
        ),
      },
      {
        key: "status",
        header: "Status",
        accessor: (s) => (s.isActive ? "active" : "inactive"),
        cell: (s) => <StatusPill status={s.isActive ? "active" : "inactive"} />,
      },
    ],
    [],
  );

  const toggleActive = (s: School) =>
    confirm({
      title: (s.isActive ? "Suspend" : "Activate") + " " + s.name + "?",
      body: s.isActive
        ? "Cascades to all members — they cannot log in until reactivated. Data retained."
        : "Members can log in again.",
      confirmLabel: s.isActive ? "Suspend" : "Activate",
      destructive: s.isActive,
      onConfirm: async () => {
        await platformService.setSchoolActive(s.id, !s.isActive);
        toast.success(s.isActive ? "School suspended" : "School activated");
        setTick((t) => t + 1);
      },
    });

  return (
    <div className="space-y-6">
      <PageHeader
        title="All Schools"
        icon={<Building2 className="size-5" />}
        description="Manage every school on the platform."
      />

      <StatGrid
        cols={4}
        items={[
          {
            label: "Total Schools",
            value: derived.totalSchools,
            icon: School2,
            hint: `${derived.activeSchools} active`,
          },
          {
            label: "Active Schools",
            value: derived.activeSchools,
            icon: Power,
            tone: "success",
            hint: `${derived.totalSchools - derived.activeSchools} suspended`,
          },
          {
            label: "Platform MRR",
            value: formatMoneyCompact(derived.mrr),
            icon: CircleDollarSign,
            tone: "info",
            hint: "monthly recurring",
          },
          {
            label: "Overdue Accounts",
            value: derived.overdueAccounts,
            icon: AlertTriangle,
            tone: derived.overdueAccounts > 0 ? "danger" : "success",
            hint: "subscription overdue",
          },
        ]}
      />

      <div className="grid gap-4 lg:grid-cols-2">
        <ChartCard title="Students by School">
          <BarSeries
            data={derived.studentsBySchool}
            xKey="name"
            series={[{ key: "Students", label: "Students" }]}
          />
        </ChartCard>
        <div className="grid gap-4 sm:grid-cols-2">
          <ChartCard title="Plan Distribution">
            <Donut data={derived.planMix} />
          </ChartCard>
          <ChartCard title="Subscription Status">
            <Donut data={derived.subscriptionMix} />
          </ChartCard>
        </div>
      </div>

      <Panel title="Schools Portfolio" icon={Users}>
        <DataTable<School>
          data={schools}
          columns={columns}
          getRowId={(s) => s.id}
          searchText={(s) => s.name + " " + s.city + " " + (s.region ?? "")}
          filters={[
            {
              key: "plan",
              labelKey: "Plan",
              type: "select",
              accessor: (s) => s.plan ?? "",
              options: [
                { value: "basic", label: "Basic" },
                { value: "standard", label: "Standard" },
                { value: "premium", label: "Premium" },
                { value: "enterprise", label: "Enterprise" },
              ],
            },
            {
              key: "subscriptionStatus",
              labelKey: "Subscription",
              type: "select",
              accessor: (s) => s.subscriptionStatus ?? "",
              options: [
                { value: "active", label: "Active" },
                { value: "overdue", label: "Overdue" },
                { value: "trial", label: "Trial" },
              ],
            },
          ]}
          rowActions={(s) => (
            <div className="flex items-center justify-end gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate("/app/super-admin/schools/" + s.id)}
              >
                View
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className={s.isActive ? "text-destructive" : "text-success"}
                onClick={() => toggleActive(s)}
              >
                {s.isActive ? (
                  <>
                    <PowerOff className="size-4" /> Suspend
                  </>
                ) : (
                  <>
                    <Power className="size-4" /> Activate
                  </>
                )}
              </Button>
            </div>
          )}
          exportConfig={{ filename: "schools", title: "Schools", excel: true, pdf: true }}
        />
      </Panel>
    </div>
  );
}
