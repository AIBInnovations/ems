import { useMemo } from "react";
import { AlertTriangle, BookOpen, BookUp, IndianRupee, Library, Users } from "lucide-react";
import {
  DashHeader,
  StatGrid,
  QuickActions,
  ListCard,
  ChartCard,
  BarSeries,
  type ListItem,
} from "@/features/dashboard/blocks";
import { db } from "@/data/db";
import { areaRoute } from "@/lib/routes";
import { formatMoney } from "@/lib/format";

export function LibrarianDashboard() {
  const data = useMemo(() => {
    const loans = db.getAll("bookLoans");
    const issuedCount = loans.filter((l) => l.status === "issued" || l.status === "overdue").length;
    const overdueLoans = loans.filter((l) => l.status === "overdue");

    const pendingFines = db.query("libraryFines", (f) => f.status === "pending");
    const reservations = db.query("bookReservations", (r) => r.status === "active");

    const books = db.getAll("books");

    const overdueItems: ListItem[] = overdueLoans.map((l) => ({
      id: l.id,
      title: db.getById("books", l.bookId)?.title ?? "Unknown title",
      subtitle: `Due ${l.dueDate}`,
      badge: { label: "Overdue", variant: "destructive" },
      to: areaRoute("circulation"),
    }));

    const reservationItems: ListItem[] = reservations
      .slice()
      .sort((a, b) => a.queuePosition - b.queuePosition)
      .map((r) => ({
        id: r.id,
        title: db.getById("books", r.bookId)?.title ?? "Unknown title",
        subtitle: `Queue #${r.queuePosition}`,
      }));

    const fineItems: ListItem[] = pendingFines.map((f) => ({
      id: f.id,
      title: f.memberId,
      badge: { label: formatMoney(f.amount) },
      to: areaRoute("fines"),
    }));

    const categoryCounts = new Map<string, number>();
    for (const b of books) {
      const cat = b.category || "Uncategorized";
      categoryCounts.set(cat, (categoryCounts.get(cat) ?? 0) + 1);
    }
    const stockData = [...categoryCounts.entries()]
      .map(([category, count]) => ({ category, count }))
      .sort((a, b) => b.count - a.count);

    return {
      issuedCount,
      overdueCount: overdueLoans.length,
      pendingFinesCount: pendingFines.length,
      totalBooks: books.length,
      overdueItems,
      reservationItems,
      fineItems,
      stockData,
    };
  }, []);

  return (
    <div className="space-y-6">
      <DashHeader
        actions={
          <QuickActions
            actions={[
              { label: "Issue Book", icon: BookUp, to: areaRoute("circulation"), tone: "accent" },
              { label: "Catalog", icon: BookOpen, to: areaRoute("catalog") },
              { label: "Members", icon: Users, to: areaRoute("members") },
            ]}
          />
        }
      />

      <StatGrid
        cols={4}
        items={[
          { label: "Issued", value: data.issuedCount, icon: BookOpen, tone: "primary", to: areaRoute("circulation") },
          { label: "Overdue", value: data.overdueCount, icon: AlertTriangle, tone: "danger" },
          { label: "Fines Pending", value: data.pendingFinesCount, icon: IndianRupee, tone: "warning", to: areaRoute("fines") },
          { label: "Total Books", value: data.totalBooks, icon: Library, tone: "info", to: areaRoute("catalog") },
        ]}
      />

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <ListCard
            title="Overdue Books"
            icon={AlertTriangle}
            items={data.overdueItems}
            emptyText="No overdue books"
            viewAllTo={areaRoute("circulation")}
          />
        </div>
        <ListCard
          title="Reservations"
          icon={BookOpen}
          items={data.reservationItems}
          emptyText="No active reservations"
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <ChartCard title="Stock by Category" height={300}>
            <BarSeries data={data.stockData} xKey="category" series={[{ key: "count", label: "Books" }]} />
          </ChartCard>
        </div>
        <ListCard
          title="Pending Fines"
          icon={IndianRupee}
          items={data.fineItems}
          emptyText="No pending fines"
          viewAllTo={areaRoute("fines")}
        />
      </div>
    </div>
  );
}
