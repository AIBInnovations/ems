import { useMemo } from "react";
import { format, subDays } from "date-fns";
import {
  AlertCircle,
  BadgeIndianRupee,
  BarChart3,
  HandCoins,
  Receipt,
  Send,
  Wallet,
} from "lucide-react";
import {
  DashHeader,
  StatGrid,
  QuickActions,
  ListCard,
  ChartCard,
  AreaTrend,
  BarSeries,
  type ListItem,
} from "@/features/dashboard/blocks";
import { db } from "@/data/db";
import { areaRoute } from "@/lib/routes";
import { fullName, formatMoney, formatMoneyCompact } from "@/lib/format";

export function AccountantDashboard() {
  const data = useMemo(() => {
    const payments = db.getAll("payments");
    const bills = db.getAll("feeBills");
    const expenses = db.getAll("expenses");
    const students = db.getAll("students");

    const studentName = (id: string) => {
      const s = students.find((st) => st.id === id);
      return s ? fullName(s.firstName, s.lastName) : "Unknown student";
    };

    // KPIs
    const collected = payments.reduce((sum, p) => (p.status === "success" ? sum + p.amount : sum), 0);
    const pendingDues = bills.reduce((sum, b) => sum + b.balance, 0);

    const today = format(new Date(), "yyyy-MM-dd");
    const todaysCollection = payments.reduce(
      (sum, p) => (p.status === "success" && p.paidAt.slice(0, 10) === today ? sum + p.amount : sum),
      0,
    );

    const defaulterBills = bills.filter((b) => b.balance > 0);
    const defaultersCount = defaulterBills.length;

    // Collection trend — last 7 days
    const trend = Array.from({ length: 7 }).map((_, i) => {
      const d = subDays(new Date(), 6 - i);
      const key = format(d, "yyyy-MM-dd");
      const amount = payments.reduce(
        (s, p) => (p.status === "success" && p.paidAt.slice(0, 10) === key ? s + p.amount : s),
        0,
      );
      return { day: format(d, "EEE"), Collection: amount };
    });

    // Income vs Expense (in thousands of rupees)
    const expensesTotal = expenses.reduce((s, e) => s + e.amount, 0);
    const toK = (n: number) => Math.round(n / 1000);
    const incomeVsExpense = [
      { name: "Collected", Amount: toK(collected) },
      { name: "Expenses", Amount: toK(expensesTotal) },
      { name: "Net", Amount: toK(collected - expensesTotal) },
    ];

    // Top defaulters
    const topDefaulters: ListItem[] = [...defaulterBills]
      .sort((a, b) => b.balance - a.balance)
      .slice(0, 6)
      .map((b) => ({
        id: b.id,
        title: studentName(b.studentId),
        subtitle: `${b.invoiceNo} · ${b.period}`,
        to: areaRoute("fees"),
        right: <span className="font-mono text-sm text-destructive">{formatMoney(b.balance)}</span>,
      }));

    // Pending reimbursements
    const reimbursements: ListItem[] = expenses
      .filter((e) => e.isReimbursement && e.status === "pending")
      .map((e) => ({
        id: e.id,
        title: e.paidTo,
        subtitle: e.description,
        badge: { label: formatMoney(e.amount) },
      }));

    return {
      collected,
      pendingDues,
      todaysCollection,
      defaultersCount,
      trend,
      incomeVsExpense,
      topDefaulters,
      reimbursements,
    };
  }, []);

  return (
    <div className="space-y-6">
      <DashHeader
        actions={
          <QuickActions
            actions={[
              { label: "Collect Fees", icon: HandCoins, to: areaRoute("fees"), tone: "accent" },
              { label: "Add Expense", icon: Receipt, to: areaRoute("expenses") },
              { label: "Reminders", icon: Send, to: areaRoute("notifications") },
              { label: "Reports", icon: BarChart3, to: areaRoute("reports") },
            ]}
          />
        }
      />

      <StatGrid
        cols={4}
        items={[
          {
            label: "Collected",
            value: formatMoneyCompact(data.collected),
            icon: BadgeIndianRupee,
            tone: "success",
            hint: "this session",
          },
          {
            label: "Pending Dues",
            value: formatMoneyCompact(data.pendingDues),
            icon: AlertCircle,
            tone: "danger",
            to: areaRoute("fees"),
          },
          {
            label: "Today's Collection",
            value: formatMoneyCompact(data.todaysCollection),
            icon: Wallet,
            tone: "info",
          },
          {
            label: "Defaulters",
            value: data.defaultersCount,
            icon: HandCoins,
            tone: "warning",
          },
        ]}
      />

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <ChartCard title="Fee Collection — Last 7 days">
            <AreaTrend data={data.trend} xKey="day" series={[{ key: "Collection", label: "Collection (₹)" }]} />
          </ChartCard>
        </div>
        <ChartCard title="Income vs Expense">
          <BarSeries data={data.incomeVsExpense} xKey="name" series={[{ key: "Amount", label: "Amount (₹ ’000)" }]} />
        </ChartCard>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <ListCard
            title="Top Defaulters"
            icon={AlertCircle}
            items={data.topDefaulters}
            emptyText="No outstanding dues"
            viewAllTo={areaRoute("fees")}
          />
        </div>
        <ListCard
          title="Pending Reimbursements"
          icon={Receipt}
          items={data.reimbursements}
          emptyText="No pending reimbursements"
          viewAllTo={areaRoute("expenses")}
        />
      </div>
    </div>
  );
}
