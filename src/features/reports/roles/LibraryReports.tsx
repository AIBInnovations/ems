import { useMemo } from "react";
import { AlertTriangle, BookCopy, BookOpen, IndianRupee, Layers, Library } from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { StatGrid, ChartCard, BarSeries, Donut, ListCard } from "@/features/dashboard/blocks";
import type { ListItem } from "@/features/dashboard/blocks";
import type { StatCardProps } from "@/components/shared/StatCard";
import { db } from "@/data/db";
import { formatMoneyCompact, formatMoney } from "@/lib/format";

function shorten(title: string, len = 18): string {
  return title.length > len ? `${title.slice(0, len - 1)}…` : title;
}

export function LibraryReports() {
  const data = useMemo(() => {
    const books = db.getAll("books");
    const loans = db.getAll("bookLoans");
    const fines = db.getAll("libraryFines");

    // ── KPIs ──────────────────────────────────────────────
    const totalBooks = books.length;
    const issuedCount = loans.filter((l) => l.status === "issued" || l.status === "overdue").length;
    const overdueCount = loans.filter((l) => l.status === "overdue").length;
    const finesCollected = fines
      .filter((f) => f.status === "paid")
      .reduce((sum, f) => sum + f.amount, 0);

    // ── Stock by Category ─────────────────────────────────
    const byCategory = new Map<string, number>();
    for (const b of books) byCategory.set(b.category, (byCategory.get(b.category) ?? 0) + 1);
    const categoryData = [...byCategory.entries()]
      .map(([name, Books]) => ({ name, Books }))
      .sort((a, b) => b.Books - a.Books);

    // ── Availability (copies) ─────────────────────────────
    const totalCopies = books.reduce((s, b) => s + b.totalCopies, 0);
    const availableCopies = books.reduce((s, b) => s + b.availableCopies, 0);
    const issuedCopies = Math.max(0, totalCopies - availableCopies);
    const availabilityData = [
      { name: "Available", value: availableCopies, color: "hsl(var(--success))" },
      { name: "Issued", value: issuedCopies, color: "hsl(var(--info))" },
    ];

    // ── Most Issued Books (top 6 by loan count) ───────────
    const loansPerBook = new Map<string, number>();
    for (const l of loans) loansPerBook.set(l.bookId, (loansPerBook.get(l.bookId) ?? 0) + 1);
    const topBooks = [...loansPerBook.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6)
      .map(([bookId, Loans]) => {
        const book = db.getById("books", bookId);
        return { name: shorten(book?.title ?? "Unknown"), Loans, fullTitle: book?.title ?? "Unknown", bookId };
      });

    // ── Fines by status ───────────────────────────────────
    const fineStatusColors: Record<string, string> = {
      pending: "hsl(var(--warning))",
      paid: "hsl(var(--success))",
      waived: "hsl(var(--muted-foreground))",
    };
    const fineStatusData = (["pending", "paid", "waived"] as const).map((status) => ({
      name: status[0].toUpperCase() + status.slice(1),
      value: fines.filter((f) => f.status === status).length,
      color: fineStatusColors[status],
    }));

    // ── Top categories breakdown list ─────────────────────
    const topCategoryItems: ListItem[] = categoryData.slice(0, 6).map((c) => {
      const catCopies = books
        .filter((b) => b.category === c.name)
        .reduce((s, b) => s + b.totalCopies, 0);
      return {
        id: c.name,
        title: c.name,
        subtitle: `${catCopies} copies in stock`,
        badge: { label: `${c.Books} titles`, variant: "secondary" },
      };
    });

    return {
      totalBooks,
      issuedCount,
      overdueCount,
      finesCollected,
      categoryData,
      availabilityData,
      topBooks,
      fineStatusData,
      topCategoryItems,
    };
  }, []);

  const stats: StatCardProps[] = [
    { label: "Total Books", value: data.totalBooks, icon: Library, tone: "primary", hint: "Titles in catalogue" },
    { label: "Issued", value: data.issuedCount, icon: BookOpen, tone: "info", hint: "Active + overdue loans" },
    { label: "Overdue", value: data.overdueCount, icon: AlertTriangle, tone: "danger", hint: "Past due date" },
    { label: "Fines Collected", value: formatMoneyCompact(data.finesCollected), icon: IndianRupee, tone: "success", hint: formatMoney(data.finesCollected) },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Library Reports"
        description="Catalogue, circulation and fines analytics for the library."
        icon={<BookOpen className="size-5" />}
      />

      <StatGrid cols={4} items={stats} />

      <div className="grid gap-4 lg:grid-cols-2">
        <ChartCard title="Stock by Category">
          <BarSeries data={data.categoryData} xKey="name" series={[{ key: "Books", label: "Titles" }]} />
        </ChartCard>

        <ChartCard title="Availability">
          <Donut data={data.availabilityData} />
        </ChartCard>

        <ChartCard title="Most Issued Books">
          <BarSeries data={data.topBooks} xKey="name" series={[{ key: "Loans", label: "Loans" }]} />
        </ChartCard>

        <ChartCard title="Fines">
          <Donut data={data.fineStatusData} />
        </ChartCard>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <ListCard title="Top Categories" icon={Layers} items={data.topCategoryItems} max={6} />
        <ListCard
          title="Most Borrowed Titles"
          icon={BookCopy}
          items={data.topBooks.map((b) => ({
            id: b.bookId,
            title: b.fullTitle,
            subtitle: `${b.Loans} loan${b.Loans === 1 ? "" : "s"}`,
            badge: { label: `${b.Loans}`, variant: "info" },
          }))}
          max={6}
        />
      </div>
    </div>
  );
}
