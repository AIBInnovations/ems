import { useMemo } from "react";
import { format } from "date-fns";
import {
  AlertTriangle,
  Boxes,
  CalendarDays,
  FlaskConical,
  PackageOpen,
  Wrench,
} from "lucide-react";
import {
  DashHeader,
  StatGrid,
  QuickActions,
  ListCard,
  type ListItem,
} from "@/features/dashboard/blocks";
import { db } from "@/data/db";
import { areaRoute } from "@/lib/routes";

type BadgeVariant = NonNullable<NonNullable<ListItem["badge"]>["variant"]>;

const STATUS_VARIANT: Record<string, BadgeVariant> = {
  requested: "warning",
  approved: "info",
  rejected: "destructive",
  done: "success",
};

export function LabDashboard() {
  const data = useMemo(() => {
    const today = format(new Date(), "yyyy-MM-dd");

    const items = db.getAll("labItems");
    const lowStock = items.filter((i) => i.quantity <= i.reorderLevel);
    const pendingReturns = db.query("labIssues", (r) => r.status === "issued");
    const todaysBookings = db.query("labBookings", (b) => b.date === today);
    const maintenance = db.query("labMaintenance", (m) => m.status === "open");

    const lowStockItems: ListItem[] = lowStock.map((i) => ({
      id: i.id,
      title: i.name,
      subtitle: `${i.labType} · ${i.quantity} ${i.unit}`,
      badge: { label: "Low", variant: "destructive" },
      to: areaRoute("inventory"),
    }));

    const pendingReturnItems: ListItem[] = pendingReturns.map((r) => ({
      id: r.id,
      title: db.getById("labItems", r.itemId)?.name ?? "Unknown item",
      subtitle: `Qty ${r.quantity}`,
    }));

    const practicalItems: ListItem[] = todaysBookings.map((b) => ({
      id: b.id,
      title: `${b.labType} Lab`,
      subtitle: `${b.startTime}–${b.endTime} · ${b.purpose ?? "Practical"}`,
      badge: { label: b.status, variant: STATUS_VARIANT[b.status] ?? "secondary" },
    }));

    const maintenanceItems: ListItem[] = maintenance.map((m) => ({
      id: m.id,
      title: m.type,
      subtitle: m.labType,
    }));

    return {
      lowStockCount: lowStock.length,
      pendingReturnsCount: pendingReturns.length,
      todaysBookingsCount: todaysBookings.length,
      totalItemsCount: items.length,
      lowStockItems,
      pendingReturnItems,
      practicalItems,
      maintenanceItems,
    };
  }, []);

  return (
    <div className="space-y-6">
      <DashHeader
        actions={
          <QuickActions
            actions={[
              { label: "Issue Equipment", icon: PackageOpen, to: areaRoute("issue-return"), tone: "accent" },
              { label: "Inventory", icon: Boxes, to: areaRoute("inventory") },
              { label: "Bookings", icon: CalendarDays, to: areaRoute("bookings") },
            ]}
          />
        }
      />

      <StatGrid
        cols={4}
        items={[
          { label: "Low Stock", value: data.lowStockCount, icon: AlertTriangle, tone: "danger", to: areaRoute("inventory"), hint: "At or below reorder level" },
          { label: "Pending Returns", value: data.pendingReturnsCount, icon: PackageOpen, tone: "warning", to: areaRoute("issue-return"), hint: "Equipment still issued" },
          { label: "Today's Bookings", value: data.todaysBookingsCount, icon: FlaskConical, tone: "info", hint: "Lab sessions today" },
          { label: "Total Items", value: data.totalItemsCount, icon: Boxes, tone: "primary", to: areaRoute("inventory"), hint: "In inventory" },
        ]}
      />

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <ListCard
            title="Low Stock Items"
            icon={AlertTriangle}
            items={data.lowStockItems}
            emptyText="All items are well stocked"
            viewAllTo={areaRoute("inventory")}
          />
        </div>
        <ListCard
          title="Pending Returns"
          icon={PackageOpen}
          items={data.pendingReturnItems}
          emptyText="No equipment pending return"
          viewAllTo={areaRoute("issue-return")}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <ListCard
            title="Today's Practicals"
            icon={FlaskConical}
            items={data.practicalItems}
            emptyText="No lab sessions booked today"
            viewAllTo={areaRoute("bookings")}
          />
        </div>
        <ListCard
          title="Maintenance"
          icon={Wrench}
          items={data.maintenanceItems}
          emptyText="No open maintenance tasks"
        />
      </div>
    </div>
  );
}
