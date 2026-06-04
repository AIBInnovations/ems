import { useMemo } from "react";
import { AlertTriangle, Boxes, FlaskConical, PackageOpen, Wrench } from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { StatGrid, ChartCard, BarSeries, Donut, ListCard, type ListItem } from "@/features/dashboard/blocks";
import type { StatCardProps } from "@/components/shared/StatCard";
import { db } from "@/data/db";

const LAB_TYPE_LABELS: Record<string, string> = {
  physics: "Physics",
  chemistry: "Chemistry",
  biology: "Biology",
  computer: "Computer",
  other: "Other",
};

const CATEGORY_LABELS: Record<string, string> = {
  chemical: "Chemical",
  apparatus: "Apparatus",
  specimen: "Specimen",
  equipment: "Equipment",
};

const ISSUE_STATUS_COLORS: Record<string, string> = {
  Issued: "hsl(var(--warning))",
  Returned: "hsl(var(--success))",
  Overdue: "hsl(var(--destructive))",
};

export function LabReports() {
  const items = useMemo(() => db.getAll("labItems"), []);
  const issues = useMemo(() => db.getAll("labIssues"), []);
  const maintenance = useMemo(() => db.getAll("labMaintenance"), []);

  const lowStock = useMemo(
    () => items.filter((i) => i.quantity <= i.reorderLevel),
    [items],
  );

  const stats: StatCardProps[] = useMemo(
    () => [
      { label: "Total Items", value: items.length, icon: Boxes, tone: "primary", hint: "Across all labs" },
      { label: "Low Stock", value: lowStock.length, icon: AlertTriangle, tone: "danger", hint: "At or below reorder level" },
      { label: "Issued", value: issues.filter((i) => i.status === "issued").length, icon: PackageOpen, tone: "warning", hint: "Currently out" },
      { label: "Maintenance", value: maintenance.length, icon: Wrench, tone: "info", hint: "Logged tasks" },
    ],
    [items.length, lowStock.length, issues, maintenance.length],
  );

  // Stock quantity grouped by lab type.
  const stockByLab = useMemo(() => {
    const map = new Map<string, number>();
    for (const i of items) {
      map.set(i.labType, (map.get(i.labType) ?? 0) + i.quantity);
    }
    return Array.from(map.entries()).map(([labType, qty]) => ({
      name: LAB_TYPE_LABELS[labType] ?? labType,
      Quantity: qty,
    }));
  }, [items]);

  // Item count grouped by category.
  const byCategory = useMemo(() => {
    const map = new Map<string, number>();
    for (const i of items) {
      map.set(i.category, (map.get(i.category) ?? 0) + 1);
    }
    return Array.from(map.entries()).map(([category, count]) => ({
      name: CATEGORY_LABELS[category] ?? category,
      value: count,
    }));
  }, [items]);

  // Issues vs returns status counts.
  const issueStatus = useMemo(() => {
    const order = ["issued", "returned", "overdue"] as const;
    const map = new Map<string, number>();
    for (const i of issues) {
      map.set(i.status, (map.get(i.status) ?? 0) + 1);
    }
    return order.map((s) => ({
      name: s[0].toUpperCase() + s.slice(1),
      Count: map.get(s) ?? 0,
    }));
  }, [issues]);

  const lowStockItems: ListItem[] = useMemo(
    () =>
      lowStock
        .slice()
        .sort((a, b) => a.quantity - b.quantity)
        .map((i) => ({
          id: i.id,
          title: i.name,
          subtitle: LAB_TYPE_LABELS[i.labType] ?? i.labType,
          badge: { label: `${i.quantity} ${i.unit}`, variant: "destructive" as const },
        })),
    [lowStock],
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Laboratory Reports"
        description="Inventory, issues and maintenance analytics across all labs"
        icon={<FlaskConical className="size-5" />}
      />

      <StatGrid cols={4} items={stats} />

      <div className="grid gap-4 lg:grid-cols-2">
        <ChartCard title="Stock by Lab Type">
          <BarSeries data={stockByLab} xKey="name" series={[{ key: "Quantity", label: "Quantity" }]} />
        </ChartCard>

        <ChartCard title="Items by Category">
          <Donut data={byCategory} />
        </ChartCard>

        <ChartCard title="Issues vs Returns">
          <BarSeries data={issueStatus} xKey="name" series={[{ key: "Count", label: "Count" }]} />
        </ChartCard>

        <ListCard title="Low Stock Items" icon={AlertTriangle} items={lowStockItems} max={8} />
      </div>
    </div>
  );
}
