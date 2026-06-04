import { useMemo } from "react";
import { format, subDays } from "date-fns";
import { AlertCircle, BadgeIndianRupee, Receipt, TrendingUp, Wallet } from "lucide-react";
import {
  PageHeader,
} from "@/components/shared/PageHeader";
import {
  StatGrid,
  ListCard,
  ChartCard,
  AreaTrend,
  BarSeries,
  Donut,
  type ListItem,
} from "@/features/dashboard/blocks";
import { db } from "@/data/db";
import { areaRoute } from "@/lib/routes";
import { fullName, formatMoney, formatMoneyCompact } from "@/lib/format";

const EXPENSE_COLORS = [
  "hsl(var(--chart-1))",
  "hsl(var(--chart-2))",
  "hsl(var(--chart-3))",
  "hsl(var(--chart-4))",
  "hsl(var(--chart-5))",
  "hsl(var(--info))",
];

const MODE_COLORS = [
  "hsl(var(--success))",
  "hsl(var(--info))",
  "hsl(var(--primary))",
  "hsl(var(--warning))",
  "hsl(var(--chart-4))",
  "hsl(var(--chart-5))",
];

export function AccountantReports() {
  const data = useMemo(() => {
    const payments = db.getAll("payments");
    const bills = db.getAll("feeBills");
    const expenses = db.getAll("expenses");
    const feeHeads = db.getAll("feeHeads");
    const students = db.getAll("students");

    const studentName = (id: string) => {
      const s = students.find((st) => st.id === id);
      return s ? fullName(s.firstName, s.lastName) : "Unknown student";
    };

    // ── KPIs ─────────────────────────────────────────────────────────
    const collected = payments.reduce((sum, p) => (p.status === "success" ? sum + p.amount : sum), 0);
    const totalDues = bills.reduce((sum, b) => sum + b.balance, 0);
    const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
    const netBalance = collected - totalExpenses;

    // ── Collection trend — last 30 days ──────────────────────────────
    const trend = Array.from({ length: 30 }).map((_, i) => {
      const d = subDays(new Date(), 29 - i);
      const key = format(d, "yyyy-MM-dd");
      const amount = payments.reduce(
        (s, p) => (p.status === "success" && p.paidAt.slice(0, 10) === key ? s + p.amount : s),
        0,
      );
      return { day: format(d, "d MMM"), Collection: amount };
    });

    // ── Fee head collection — sum bill line items by fee head ────────
    const headNameById = new Map(feeHeads.map((h) => [h.id, h.name]));
    const headTotals = new Map<string, number>();
    for (const bill of bills) {
      for (const li of bill.lineItems) {
        headTotals.set(li.feeHeadId, (headTotals.get(li.feeHeadId) ?? 0) + li.amount);
      }
    }
    const feeHeadCollection = [...headTotals.entries()]
      .map(([headId, total]) => ({ name: headNameById.get(headId) ?? "Other", Amount: total }))
      .sort((a, b) => b.Amount - a.Amount)
      .slice(0, 8);

    // ── Expenses by category ─────────────────────────────────────────
    const categoryTotals = new Map<string, number>();
    for (const e of expenses) {
      categoryTotals.set(e.category, (categoryTotals.get(e.category) ?? 0) + e.amount);
    }
    const expensesByCategory = [...categoryTotals.entries()]
      .map(([category, value], i) => ({
        name: category[0].toUpperCase() + category.slice(1),
        value,
        color: EXPENSE_COLORS[i % EXPENSE_COLORS.length],
      }))
      .sort((a, b) => b.value - a.value);

    // ── Payment modes (by count) ─────────────────────────────────────
    const modeCounts = new Map<string, number>();
    for (const p of payments) {
      if (p.status !== "success") continue;
      modeCounts.set(p.mode, (modeCounts.get(p.mode) ?? 0) + 1);
    }
    const paymentModes = [...modeCounts.entries()]
      .map(([mode, count], i) => ({
        name: mode[0].toUpperCase() + mode.slice(1),
        value: count,
        color: MODE_COLORS[i % MODE_COLORS.length],
      }))
      .sort((a, b) => b.value - a.value);

    // ── Top defaulters ───────────────────────────────────────────────
    const topDefaulters: ListItem[] = bills
      .filter((b) => b.balance > 0)
      .sort((a, b) => b.balance - a.balance)
      .slice(0, 8)
      .map((b) => ({
        id: b.id,
        title: studentName(b.studentId),
        subtitle: b.invoiceNo,
        right: <span className="font-mono text-sm text-destructive">{formatMoney(b.balance)}</span>,
      }));

    return {
      collected,
      totalDues,
      totalExpenses,
      netBalance,
      trend,
      feeHeadCollection,
      expensesByCategory,
      paymentModes,
      topDefaulters,
    };
  }, []);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Financial Reports"
        description="Collections, dues, expenses and payment analytics"
        icon={<Wallet className="size-5" />}
      />

      <StatGrid
        cols={4}
        items={[
          {
            label: "Total Collected",
            value: formatMoneyCompact(data.collected),
            icon: BadgeIndianRupee,
            tone: "success",
            hint: "successful payments",
          },
          {
            label: "Total Dues",
            value: formatMoneyCompact(data.totalDues),
            icon: AlertCircle,
            tone: "danger",
            hint: "outstanding balance",
          },
          {
            label: "Total Expenses",
            value: formatMoneyCompact(data.totalExpenses),
            icon: Receipt,
            tone: "warning",
            hint: "all categories",
          },
          {
            label: "Net Balance",
            value: formatMoneyCompact(data.netBalance),
            icon: TrendingUp,
            tone: "info",
            hint: "collected − expenses",
          },
        ]}
      />

      <ChartCard title="Collection Trend (30 days)" height={300}>
        <AreaTrend data={data.trend} xKey="day" series={[{ key: "Collection", label: "Collection (₹)" }]} />
      </ChartCard>

      <div className="grid gap-4 lg:grid-cols-2">
        <ChartCard title="Fee Head Collection">
          <BarSeries data={data.feeHeadCollection} xKey="name" series={[{ key: "Amount", label: "Collected (₹)" }]} />
        </ChartCard>
        <ChartCard title="Expenses by Category">
          <Donut data={data.expensesByCategory} />
        </ChartCard>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <ChartCard title="Payment Modes">
          <Donut data={data.paymentModes} />
        </ChartCard>
        <ListCard
          title="Top Defaulters"
          icon={AlertCircle}
          items={data.topDefaulters}
          max={8}
          emptyText="No outstanding dues"
          viewAllTo={areaRoute("fees")}
        />
      </div>
    </div>
  );
}
