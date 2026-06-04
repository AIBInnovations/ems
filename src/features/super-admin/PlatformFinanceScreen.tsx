import { useMemo, useState } from "react";
import {
  AlertCircle,
  BadgeIndianRupee,
  CheckCircle2,
  CreditCard,
  FileText,
  Power,
  TrendingUp,
  Wallet,
} from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import {
  StatGrid,
  Panel,
  ChartCard,
  BarSeries,
  Donut,
} from "@/features/dashboard/blocks";
import { StatusPill } from "@/components/shared/StatusPill";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useDialogs } from "@/components/shared/dialogs";
import { toast } from "@/components/ui/sonner";
import { platformStats, platformService } from "@/data/services";
import { formatMoney, formatMoneyCompact, formatDate } from "@/lib/format";
import type { School } from "@/types";

const PLAN_COLOR: Record<NonNullable<School["plan"]>, string> = {
  basic: "hsl(var(--chart-1))",
  standard: "hsl(var(--chart-2))",
  premium: "hsl(var(--chart-3))",
  enterprise: "hsl(var(--chart-4))",
};

const PLAN_BADGE: Record<NonNullable<School["plan"]>, "secondary" | "info" | "success" | "default"> = {
  basic: "secondary",
  standard: "info",
  premium: "success",
  enterprise: "default",
};

export function PlatformFinanceScreen() {
  const { confirm } = useDialogs();
  const [tick, setTick] = useState(0);
  const ps = useMemo(() => platformStats(), [tick]);

  const derived = useMemo(() => {
    // Revenue per school (in thousands ₹) for the bar chart.
    const revenueBySchool = ps.schools
      .map(({ school, metrics }) => ({
        name: school.name.length > 16 ? school.name.slice(0, 15) + "…" : school.name,
        Revenue: Math.round(metrics.monthlyRevenue / 1000),
      }))
      .sort((a, b) => b.Revenue - a.Revenue);

    // Subscriptions grouped by plan, value = sum of annual subscription fees.
    const planTotals = new Map<NonNullable<School["plan"]>, number>();
    for (const { school } of ps.schools) {
      const plan = school.plan ?? "basic";
      planTotals.set(plan, (planTotals.get(plan) ?? 0) + (school.subscriptionAmount ?? 0));
    }
    const subsByPlan = (["basic", "standard", "premium", "enterprise"] as const)
      .filter((p) => planTotals.has(p))
      .map((p) => ({
        name: p[0].toUpperCase() + p.slice(1),
        value: planTotals.get(p) ?? 0,
        color: PLAN_COLOR[p],
      }));

    const billedSchools = ps.schools.filter(({ school }) => school.subscriptionStatus !== "trial").length;

    // Billing rows, overdue first then by next billing date.
    const rows = [...ps.schools]
      .map(({ school }) => school)
      .sort((a, b) => {
        const w = (s: School) => (s.subscriptionStatus === "overdue" ? 0 : s.subscriptionStatus === "trial" ? 2 : 1);
        if (w(a) !== w(b)) return w(a) - w(b);
        return (a.nextBillingDate ?? "").localeCompare(b.nextBillingDate ?? "");
      });

    return { revenueBySchool, subsByPlan, billedSchools, rows };
  }, [ps]);

  const refresh = () => setTick((t) => t + 1);

  const markPaid = async (school: School) => {
    await platformService.markBilling(school.id, "active");
    toast.success(`${school.name} marked as paid`);
    refresh();
  };

  const toggleActive = (school: School) => {
    const next = !school.isActive;
    confirm({
      title: next ? `Reactivate ${school.name}?` : `Suspend ${school.name}?`,
      body: next
        ? "Members of this school will be able to log in again. Data is retained."
        : "Suspending blocks login for every member of this school. Data is retained and billing continues.",
      confirmLabel: next ? "Reactivate" : "Suspend",
      destructive: !next,
      onConfirm: async () => {
        await platformService.setSchoolActive(school.id, next);
        toast.success(next ? `${school.name} reactivated` : `${school.name} suspended`);
        refresh();
      },
    });
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Platform Finance"
        icon={<Wallet className="size-5" />}
        description="Subscription billing and revenue across all schools."
      />

      <StatGrid
        cols={4}
        items={[
          {
            label: "Platform Revenue",
            value: formatMoneyCompact(ps.totalRevenue),
            icon: BadgeIndianRupee,
            tone: "success",
            hint: "fees across schools",
          },
          {
            label: "MRR",
            value: formatMoneyCompact(ps.mrr),
            icon: TrendingUp,
            tone: "primary",
            hint: "subscriptions/mo",
          },
          {
            label: "Overdue Accounts",
            value: ps.overdueAccounts,
            icon: AlertCircle,
            tone: "danger",
            hint: "need follow-up",
          },
          {
            label: "Total Schools Billed",
            value: derived.billedSchools,
            icon: FileText,
            tone: "info",
            hint: "on a paid plan",
          },
        ]}
      />

      <div className="grid gap-4 lg:grid-cols-2">
        <ChartCard title="Revenue by School">
          <BarSeries
            data={derived.revenueBySchool}
            xKey="name"
            series={[{ key: "Revenue", label: "Revenue (₹'000)" }]}
          />
        </ChartCard>
        <ChartCard title="Subscriptions by Plan">
          <Donut data={derived.subsByPlan} />
        </ChartCard>
      </div>

      <Panel title="Subscription Billing" icon={CreditCard}>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted-foreground">
                <th className="px-2 py-2 font-medium">School</th>
                <th className="px-2 py-2 font-medium">Plan</th>
                <th className="px-2 py-2 text-right font-medium">Annual Fee</th>
                <th className="px-2 py-2 font-medium">Status</th>
                <th className="hidden px-2 py-2 font-medium md:table-cell">Next Billing</th>
                <th className="px-2 py-2 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {derived.rows.map((school) => {
                const plan = school.plan ?? "basic";
                const overdue = school.subscriptionStatus === "overdue";
                return (
                  <tr key={school.id} className="hover:bg-muted/40">
                    <td className="px-2 py-2.5">
                      <p className="font-medium">{school.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {[school.city, school.region].filter(Boolean).join(", ") || "—"}
                      </p>
                    </td>
                    <td className="px-2 py-2.5">
                      <Badge variant={PLAN_BADGE[plan]} className="capitalize">{plan}</Badge>
                    </td>
                    <td className="px-2 py-2.5 text-right font-mono text-[13px] tabular-nums">
                      {formatMoney(school.subscriptionAmount ?? 0)}
                    </td>
                    <td className="px-2 py-2.5">
                      <StatusPill status={school.subscriptionStatus ?? "trial"} />
                    </td>
                    <td className="hidden px-2 py-2.5 text-muted-foreground md:table-cell">
                      {formatDate(school.nextBillingDate)}
                    </td>
                    <td className="px-2 py-2.5">
                      <div className="flex justify-end gap-2">
                        {overdue ? (
                          <Button size="sm" variant="outline" onClick={() => markPaid(school)}>
                            <CheckCircle2 className="size-4" /> Mark Paid
                          </Button>
                        ) : null}
                        <Button
                          size="sm"
                          variant={school.isActive ? "ghost" : "default"}
                          onClick={() => toggleActive(school)}
                        >
                          <Power className="size-4" /> {school.isActive ? "Suspend" : "Activate"}
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Panel>
    </div>
  );
}
