import { useMemo } from "react";
import {
  Activity,
  AlertTriangle,
  Boxes,
  Bus,
  Building2,
  FlaskConical,
  Gauge,
  Library,
  Network,
  Route as RouteIcon,
  ShieldCheck,
  Trophy,
} from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import {
  StatGrid,
  Panel,
  ListCard,
  type ListItem,
} from "@/features/dashboard/blocks";
import { Badge } from "@/components/ui/badge";
import { platformStats } from "@/data/services";
import { db } from "@/data/db";
import { areaRoute } from "@/lib/routes";

/** Static demo health gauges — labelled as simulated platform telemetry. */
const HEALTH = [
  { label: "Storage Used", pct: 62, value: "62% of 500 GB", tone: "warning" as const },
  { label: "Uptime (30d)", pct: 99.9, value: "99.9%", tone: "ok" as const },
  { label: "API Latency", pct: 88, value: "fast · 142 ms p95", tone: "ok" as const },
  { label: "Error Rate", pct: 8, value: "0.8% (last 24h)", tone: "ok" as const },
];

const HEALTH_COLOR: Record<"ok" | "warning" | "bad", string> = {
  ok: "hsl(var(--success))",
  warning: "hsl(var(--warning))",
  bad: "hsl(var(--destructive))",
};

export function PlatformOperationsScreen() {
  const ps = useMemo(() => platformStats(), []);

  const ops = useMemo(() => {
    const modules = db.getAll("serviceModules");
    const vehicles = db.getAll("vehicles");
    const openIncidents = db.query("incidents", (i) => i.status === "open");
    const liveModules = modules.filter((m) => m.isEnabled && m.isVisible);

    // Service adoption grouped by module group
    const grouped: Record<string, typeof modules> = {};
    for (const m of modules) (grouped[m.group] ??= []).push(m);
    const adoption = Object.entries(grouped).sort((a, b) => a[0].localeCompare(b[0]));

    // Resource inventory rows
    const resources = [
      { id: "books", label: "Library Books", icon: Library, count: db.getAll("books").length },
      { id: "labItems", label: "Lab Items", icon: FlaskConical, count: db.getAll("labItems").length },
      { id: "activities", label: "Activities", icon: Trophy, count: db.getAll("activities").length },
      { id: "routes", label: "Transport Routes", icon: RouteIcon, count: db.getAll("routes").length },
    ];

    // Recent incidents → list items
    const incidents: ListItem[] = db
      .getAll("incidents")
      .sort((a, b) => b.date.localeCompare(a.date))
      .slice(0, 8)
      .map((i) => ({
        id: i.id,
        title: i.type
          .split("-")
          .map((w) => w[0].toUpperCase() + w.slice(1))
          .join(" "),
        subtitle: i.description,
        badge: {
          label: i.severity,
          variant:
            i.severity === "high"
              ? ("destructive" as const)
              : i.severity === "medium"
                ? ("warning" as const)
                : ("secondary" as const),
        },
      }));

    return {
      modules,
      vehicles,
      openIncidents,
      liveModules,
      adoption,
      resources,
      incidents,
    };
  }, []);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Platform Operations"
        icon={<Activity className="size-5" />}
        description="Fleet, resources, service adoption and system health."
      />

      <StatGrid
        cols={4}
        items={[
          {
            label: "Schools",
            value: ps.totalSchools,
            icon: Building2,
            tone: "primary",
            hint: `${ps.activeSchools} active · ${ps.suspendedSchools} suspended`,
          },
          {
            label: "Transport Fleet",
            value: ops.vehicles.length,
            icon: Bus,
            tone: "info",
            hint: "vehicles across fleet",
          },
          {
            label: "Open Incidents",
            value: ops.openIncidents.length,
            icon: AlertTriangle,
            tone: "danger",
            hint: "awaiting resolution",
          },
          {
            label: "Services Live",
            value: `${ops.liveModules.length}/${ops.modules.length}`,
            icon: Network,
            tone: "success",
            to: areaRoute("services"),
            hint: "enabled & visible",
          },
        ]}
      />

      <div className="grid gap-4 lg:grid-cols-3">
        <Panel title="Service Adoption" icon={Network} className="lg:col-span-2">
          <div className="space-y-5">
            {ops.adoption.map(([group, mods]) => (
              <div key={group} className="space-y-2">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{group}</p>
                <div className="flex flex-wrap gap-2">
                  {mods.map((m) => {
                    const live = m.isEnabled && m.isVisible;
                    const label = live ? "Live" : !m.isEnabled ? "Disabled" : "Hidden";
                    return (
                      <span
                        key={m.id}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-2.5 py-1.5 text-xs"
                      >
                        <span className="font-medium">{m.label}</span>
                        <Badge variant={live ? "success" : "secondary"} className="text-[10px]">
                          {label}
                        </Badge>
                      </span>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </Panel>

        <Panel title="Resources" icon={Boxes}>
          <div className="space-y-1">
            {ops.resources.map((r) => {
              const Icon = r.icon;
              return (
                <div key={r.id} className="flex items-center gap-3 rounded-lg px-2 py-2.5">
                  <span className="flex size-8 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                    <Icon className="size-4" />
                  </span>
                  <span className="min-w-0 flex-1 truncate text-sm font-medium">{r.label}</span>
                  <span className="font-mono text-sm tabular-nums">{r.count}</span>
                </div>
              );
            })}
          </div>
        </Panel>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Panel title="System Health" icon={Gauge} action={<DemoTag />} className="lg:col-span-2">
          <div className="space-y-4">
            {HEALTH.map((h) => (
              <div key={h.label} className="space-y-1.5">
                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2 font-medium">
                    <span
                      className="size-2 rounded-full"
                      style={{ background: HEALTH_COLOR[h.tone] }}
                    />
                    {h.label}
                  </span>
                  <span className="font-mono text-xs tabular-nums text-muted-foreground">{h.value}</span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{ width: `${h.pct}%`, background: HEALTH_COLOR[h.tone] }}
                  />
                </div>
              </div>
            ))}
            <p className="flex items-center gap-1.5 pt-1 text-xs text-muted-foreground">
              <ShieldCheck className="size-3.5 text-success" />
              All core services operational · simulated telemetry
            </p>
          </div>
        </Panel>

        <ListCard
          title="Recent Incidents"
          icon={AlertTriangle}
          items={ops.incidents}
          max={8}
          emptyText="No incidents reported"
        />
      </div>
    </div>
  );
}

function DemoTag() {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-accent/15 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-amber-700 dark:text-amber-300">
      Demo values
    </span>
  );
}
