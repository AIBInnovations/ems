import { useMemo, useState } from "react";
import { Power, ShieldCheck, UserCheck, UserX, Users } from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { StatGrid } from "@/features/dashboard/blocks";
import { DataTable } from "@/components/shared/DataTable";
import { RoleBadge } from "@/components/shared/RoleBadge";
import { StatusPill } from "@/components/shared/StatusPill";
import { InitialsAvatar } from "@/components/shared/InitialsAvatar";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/sonner";
import { useDialogs } from "@/components/shared/dialogs";
import { db } from "@/data/db";
import { logActivity } from "@/lib/activity";
import { resolveDisplay } from "@/data/services/authService";
import { timeAgo } from "@/lib/format";
import { ROLE_KEYS, ROLE_LABELS, type ResourceColumn, type RoleKey, type User } from "@/types";

export function PlatformMembersScreen() {
  const { confirm } = useDialogs();
  const [tick, setTick] = useState(0);
  const users = useMemo(() => db.getAll("users"), [tick]);
  const primary = db.getAll("schools").find((s) => s.isPrimary)?.name ?? "Platform";

  const total = users.length;
  const active = users.filter((u) => u.status === "active").length;
  const adminRoles: RoleKey[] = ["super_admin", "admin", "principal"];
  const admins = users.filter((u) => adminRoles.includes(u.roleKey)).length;

  const schoolFor = (u: User) => (u.roleKey === "super_admin" ? "Platform" : primary);

  const toggle = (u: User) => {
    const next = u.status === "active" ? "inactive" : "active";
    const isAdmin = u.roleKey === "admin";
    confirm({
      title: `${next === "inactive" ? "Suspend" : "Reactivate"} ${resolveDisplay(u).name}?`,
      body:
        next === "inactive"
          ? isAdmin
            ? "This is a school Admin — suspending blocks their login. Use the school's suspend action to cascade to all members."
            : "This account will be blocked from logging in. Data is retained."
          : "This account will be able to log in again.",
      confirmLabel: next === "inactive" ? "Suspend" : "Reactivate",
      destructive: next === "inactive",
      onConfirm: () => {
        db.update("users", u.id, { status: next });
        if (u.linkedProfileType === "staff" && u.linkedProfileId) db.update("staff", u.linkedProfileId, { status: next });
        logActivity(next === "inactive" ? "suspend" : "activate", "users", u.id, `${next === "inactive" ? "Suspended" : "Reactivated"} ${resolveDisplay(u).name}`);
        toast.success(`${resolveDisplay(u).name} ${next === "inactive" ? "suspended" : "reactivated"}`);
        setTick((t) => t + 1);
      },
    });
  };

  const columns: ResourceColumn<User>[] = [
    {
      key: "member",
      header: "Member",
      accessor: (u) => resolveDisplay(u).name,
      cell: (u) => {
        const d = resolveDisplay(u);
        return (
          <div className="flex items-center gap-3">
            <InitialsAvatar first={d.name.split(" ")[0]} last={d.name.split(" ")[1]} size="sm" />
            <div className="min-w-0">
              <p className="truncate text-sm font-medium">{d.name}</p>
              <p className="font-mono text-xs text-muted-foreground">@{u.username}</p>
            </div>
          </div>
        );
      },
    },
    { key: "role", header: "Role", accessor: (u) => u.roleKey, cell: (u) => <RoleBadge role={u.roleKey} /> },
    { key: "school", header: "School", accessor: schoolFor, hideBelow: "md" },
    { key: "lastLoginAt", header: "Last Login", accessor: (u) => u.lastLoginAt ?? "", cell: (u) => <span className="text-muted-foreground">{u.lastLoginAt ? timeAgo(u.lastLoginAt) : "Never"}</span>, hideBelow: "lg" },
    { key: "status", header: "Status", accessor: (u) => u.status, cell: (u) => <StatusPill status={u.status} /> },
  ];

  return (
    <div className="space-y-6">
      <PageHeader title="Platform Members" icon={<Users className="size-5" />} description="Every account on the platform. Suspend or reactivate any member — suspending a school Admin cascades to that school." />

      <StatGrid
        items={[
          { label: "Total Accounts", value: total, icon: Users, tone: "primary" },
          { label: "Active", value: active, icon: UserCheck, tone: "success" },
          { label: "Suspended", value: total - active, icon: UserX, tone: "danger" },
          { label: "Admins & Leaders", value: admins, icon: ShieldCheck, tone: "info" },
        ]}
      />

      <DataTable
        data={users}
        columns={columns}
        getRowId={(u) => u.id}
        searchText={(u) => `${resolveDisplay(u).name} ${u.username} ${u.roleKey}`}
        defaultSort={{ key: "role" }}
        filters={[
          { key: "roleKey", labelKey: "Role", type: "select", options: () => (ROLE_KEYS as readonly RoleKey[]).filter((r) => users.some((u) => u.roleKey === r)).map((r) => ({ value: r, label: ROLE_LABELS[r] })) },
          { key: "status", labelKey: "Status", type: "select", options: [{ value: "active", label: "Active" }, { value: "inactive", label: "Suspended" }] },
        ]}
        exportConfig={{ filename: "platform-members", title: "Platform Members", excel: true, pdf: true }}
        rowActions={(u) => (
          <Button variant="ghost" size="sm" onClick={() => toggle(u)} className={u.status === "active" ? "text-destructive" : "text-success"}>
            <Power className="size-4" /> {u.status === "active" ? "Suspend" : "Activate"}
          </Button>
        )}
      />
    </div>
  );
}
