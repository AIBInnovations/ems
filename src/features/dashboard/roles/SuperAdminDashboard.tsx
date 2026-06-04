import { useMemo } from "react";
import {
  Activity,
  Layers,
  Network,
  Users,
  UserCheck,
  UserX,
} from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DashHeader,
  StatGrid,
  Panel,
  ListCard,
  QuickActions,
  ChartCard,
  BarSeries,
  recentActivityItems,
} from "@/features/dashboard/blocks";
import type { StatCardProps } from "@/components/shared/StatCard";
import { db } from "@/data/db";
import { areaRoute } from "@/lib/routes";
import type { RoleKey } from "@/types";

/** Compact axis labels for the members-by-role chart. */
const ROLE_SHORT: Partial<Record<RoleKey, string>> = {
  admin: "Admin",
  principal: "Principal",
  accountant: "Accounts",
  receptionist: "Reception",
  librarian: "Library",
  lab_assistant: "Lab",
  examiner: "Exams",
  sports_coach: "Sports",
  class_teacher: "Class Tch",
  subject_teacher: "Subject Tch",
  bus_driver: "Driver",
  bus_helper: "Helper",
  other_staff: "Other",
};

export function SuperAdminDashboard() {
  const data = useMemo(() => {
    const staff = db.getAll("staff");
    const students = db.getAll("students");
    const guardians = db.getAll("guardians");
    const users = db.getAll("users");
    const services = db.getAll("serviceModules");

    const totalMembers = staff.length + students.length + guardians.length;
    const activeMembers = users.filter((u) => u.status === "active").length;
    const inactiveMembers = users.filter((u) => u.status === "inactive").length;

    // Service module breakdown
    const live = services.filter((s) => s.isEnabled && s.isVisible).length;
    const hidden = services.filter((s) => s.isEnabled && !s.isVisible).length;
    const disabled = services.filter((s) => !s.isEnabled).length;

    // Staff grouped by role (super_admin excluded — that's the owner, not a managed member set)
    const counts = new Map<RoleKey, number>();
    for (const s of staff) {
      if (s.roleKey === "super_admin") continue;
      counts.set(s.roleKey, (counts.get(s.roleKey) ?? 0) + 1);
    }
    const byRole = Array.from(counts.entries())
      .map(([roleKey, count]) => ({ role: ROLE_SHORT[roleKey] ?? roleKey, Members: count }))
      .sort((a, b) => b.Members - a.Members);

    return {
      totalMembers,
      activeMembers,
      inactiveMembers,
      live,
      hidden,
      disabled,
      servicesTotal: services.length,
      byRole,
    };
  }, []);

  const stats: StatCardProps[] = [
    {
      label: "Total Members",
      value: data.totalMembers.toLocaleString("en-IN"),
      icon: Users,
      tone: "primary",
      to: areaRoute("members"),
      hint: "Staff, students & guardians",
    },
    {
      label: "Active Members",
      value: data.activeMembers.toLocaleString("en-IN"),
      icon: UserCheck,
      tone: "success",
      hint: "Accounts active",
    },
    {
      label: "Inactive Members",
      value: data.inactiveMembers.toLocaleString("en-IN"),
      icon: UserX,
      tone: "danger",
      hint: "Accounts disabled",
    },
    {
      label: "Services Live",
      value: data.live,
      icon: Network,
      tone: "info",
      to: areaRoute("services"),
      hint: `of ${data.servicesTotal} modules`,
    },
  ];

  return (
    <div className="space-y-6">
      <DashHeader
        actions={
          <QuickActions
            actions={[
              { label: "Services Registry", icon: Network, to: areaRoute("services"), tone: "accent" },
              { label: "All Members", icon: Users, to: areaRoute("members") },
              { label: "Activity Log", icon: Activity, to: areaRoute("activity") },
            ]}
          />
        }
      />

      <StatGrid cols={4} items={stats} />

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <ChartCard title="Members by Role">
            <BarSeries data={data.byRole} xKey="role" series={[{ key: "Members", label: "Members" }]} />
          </ChartCard>
        </div>

        <Panel title="Services" icon={Layers} action={
          <Button asChild variant="ghost" size="sm">
            <Link to={areaRoute("services")}>Manage</Link>
          </Button>
        }>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Live</span>
              <Badge variant="success">{data.live} enabled</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Hidden</span>
              <Badge variant="warning">{data.hidden} not visible</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Disabled</span>
              <Badge variant="destructive">{data.disabled} off</Badge>
            </div>
            <p className="pt-1 text-xs text-muted-foreground">
              {data.servicesTotal} modules in the platform registry.
            </p>
          </div>
        </Panel>
      </div>

      <ListCard
        title="Recent Platform Activity"
        icon={Activity}
        items={recentActivityItems(7)}
        viewAllTo={areaRoute("activity")}
        emptyText="No recent activity"
        max={7}
      />
    </div>
  );
}
