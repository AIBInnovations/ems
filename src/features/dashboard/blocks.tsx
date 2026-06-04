import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { StatCard, type StatCardProps } from "@/components/shared/StatCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { InitialsAvatar } from "@/components/shared/InitialsAvatar";
import { EmptyState } from "@/components/shared/EmptyState";
import { useAuthStore } from "@/store/auth";
import { db } from "@/data/db";
import { ROLE_LABELS } from "@/types";
import { cn } from "@/lib/utils";

export { StatCard } from "@/components/shared/StatCard";
export { ChartCard, AreaTrend, BarSeries, LineTrend, Donut } from "@/components/shared/Charts";

/** Greeting header tuned to time of day + role + school. */
export function DashHeader({ actions, subtitleOverride }: { actions?: ReactNode; subtitleOverride?: string }) {
  const user = useAuthStore((s) => s.user);
  const name = useAuthStore((s) => s.displayName);
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
  const school = db.getAll("schools")[0]?.name;
  const subtitle = subtitleOverride ?? (user ? `${ROLE_LABELS[user.roleKey]} · ${school}` : school);
  return <PageHeader title={`${greeting}, ${name.split(" ")[0]}`} description={subtitle} actions={actions} />;
}

export function StatGrid({ items, cols = 4 }: { items: StatCardProps[]; cols?: 2 | 3 | 4 }) {
  return (
    <div className={cn("grid grid-cols-2 gap-4", cols === 3 ? "lg:grid-cols-3" : cols === 2 ? "sm:grid-cols-2" : "lg:grid-cols-4")}>
      {items.map((s) => <StatCard key={s.label} {...s} />)}
    </div>
  );
}

export function Panel({ title, icon: Icon, action, children, className }: { title: string; icon?: LucideIcon; action?: ReactNode; children: ReactNode; className?: string }) {
  return (
    <Card className={className}>
      <CardHeader className="flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="flex items-center gap-2 text-base">{Icon ? <Icon className="size-4 text-muted-foreground" /> : null}{title}</CardTitle>
        {action}
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}

export interface ListItem {
  id: string;
  title: string;
  subtitle?: string;
  badge?: { label: string; variant?: "default" | "secondary" | "outline" | "success" | "warning" | "destructive" | "info" };
  avatar?: { first?: string; last?: string };
  to?: string;
  right?: ReactNode;
}

export function ListCard({ title, icon, items, emptyText = "Nothing here right now", viewAllTo, max = 6 }: {
  title: string;
  icon?: LucideIcon;
  items: ListItem[];
  emptyText?: string;
  viewAllTo?: string;
  max?: number;
}) {
  return (
    <Panel
      title={title}
      icon={icon}
      action={viewAllTo ? <Button asChild variant="ghost" size="sm"><Link to={viewAllTo}>View all <ChevronRight className="size-4" /></Link></Button> : undefined}
    >
      {items.length === 0 ? (
        <EmptyState title={emptyText} className="border-0 py-8" />
      ) : (
        <div className="space-y-1">
          {items.slice(0, max).map((it) => {
            const Row = (
              <>
                {it.avatar ? <InitialsAvatar first={it.avatar.first} last={it.avatar.last} size="sm" /> : null}
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{it.title}</p>
                  {it.subtitle ? <p className="truncate text-xs text-muted-foreground">{it.subtitle}</p> : null}
                </div>
                {it.badge ? <Badge variant={it.badge.variant ?? "secondary"}>{it.badge.label}</Badge> : null}
                {it.right}
              </>
            );
            return it.to ? (
              <Link key={it.id} to={it.to} className="flex items-center gap-3 rounded-lg px-2 py-2 transition-colors hover:bg-muted">{Row}</Link>
            ) : (
              <div key={it.id} className="flex items-center gap-3 rounded-lg px-2 py-2">{Row}</div>
            );
          })}
        </div>
      )}
    </Panel>
  );
}

export function QuickActions({ actions }: { actions: { label: string; icon: LucideIcon; to: string; tone?: "default" | "accent" }[] }) {
  return (
    <div className="flex flex-wrap gap-2">
      {actions.map((a) => {
        const Icon = a.icon;
        return (
          <Button key={a.label} asChild variant={a.tone === "accent" ? "accent" : "outline"} className="h-auto gap-2 py-2">
            <Link to={a.to}><Icon className="size-4" /> {a.label}</Link>
          </Button>
        );
      })}
    </div>
  );
}

/* ── shared data helpers ──────────────────────────────────────────── */

export function attendanceTodayStat() {
  const att = db.getAll("studentAttendance");
  const latest = att.reduce((m, a) => (a.date > m ? a.date : m), "");
  const todays = att.filter((a) => a.date === latest);
  const present = todays.filter((a) => a.status === "present").length;
  const pct = todays.length ? Math.round((present / todays.length) * 100) : 0;
  const split = (["present", "absent", "late", "leave"] as const).map((st, i) => ({
    name: st[0].toUpperCase() + st.slice(1),
    value: todays.filter((a) => a.status === st).length,
    color: ["hsl(var(--success))", "hsl(var(--destructive))", "hsl(var(--warning))", "hsl(var(--info))"][i],
  }));
  return { pct, present, total: todays.length, split };
}

export function recentActivityItems(limit = 6): ListItem[] {
  return db.getAll("activityLog").sort((a, b) => b.at.localeCompare(a.at)).slice(0, limit).map((a) => ({
    id: a.id,
    title: a.summary,
    subtitle: a.actorName,
    avatar: { first: a.actorName.split(" ")[0], last: a.actorName.split(" ")[1] },
  }));
}
