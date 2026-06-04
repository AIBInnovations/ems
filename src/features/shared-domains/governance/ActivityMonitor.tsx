import { Activity } from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { DataTable } from "@/components/shared/DataTable";
import { RoleBadge } from "@/components/shared/RoleBadge";
import { InitialsAvatar } from "@/components/shared/InitialsAvatar";
import { Badge } from "@/components/ui/badge";
import { useResourceList } from "@/hooks/useResource";
import { activityLogService } from "@/data/services";
import { timeAgo } from "@/lib/format";
import type { ActivityLog, ResourceColumn, RoleKey } from "@/types";
import { ROLE_KEYS } from "@/types";

const columns: ResourceColumn<ActivityLog>[] = [
  {
    key: "actor",
    header: "Member",
    accessor: (r) => r.actorName,
    cell: (r) => (
      <div className="flex items-center gap-2.5">
        <InitialsAvatar first={r.actorName.split(" ")[0]} last={r.actorName.split(" ")[1]} size="sm" />
        <div className="min-w-0">
          <p className="truncate text-sm font-medium">{r.actorName}</p>
          <RoleBadge role={r.actorRoleKey} />
        </div>
      </div>
    ),
  },
  { key: "action", header: "Action", accessor: (r) => r.action, cell: (r) => <Badge variant="outline" className="capitalize">{r.action}</Badge> },
  { key: "entityType", header: "Module", accessor: (r) => r.entityType, hideBelow: "md", cell: (r) => <span className="capitalize">{r.entityType}</span> },
  { key: "summary", header: "Details", accessor: (r) => r.summary, hideBelow: "sm" },
  { key: "at", header: "When", accessor: (r) => r.at, cell: (r) => <span className="text-muted-foreground">{timeAgo(r.at)}</span> },
];

export function ActivityMonitor() {
  const { data, loading } = useResourceList(activityLogService);
  const sorted = [...data].sort((a, b) => b.at.localeCompare(a.at));

  return (
    <div className="space-y-5">
      <PageHeader title="Activity Monitor" icon={<Activity className="size-5" />} description="Every create, update, delete, approval and login across all members." />
      <DataTable
        data={sorted}
        columns={columns}
        getRowId={(r) => r.id}
        loading={loading}
        searchText={(r) => `${r.actorName} ${r.action} ${r.entityType} ${r.summary}`}
        defaultSort={{ key: "at", desc: true }}
        filters={[
          { key: "action", labelKey: "Action", type: "select", options: () => Array.from(new Set(data.map((d) => d.action))).map((a) => ({ value: a, label: a })) },
          { key: "actorRoleKey", labelKey: "Role", type: "select", options: () => (ROLE_KEYS as readonly RoleKey[]).map((r) => ({ value: r, label: r.replace(/_/g, " ") })) },
        ]}
        exportConfig={{ filename: "activity-log", title: "Activity Log", excel: true, pdf: true }}
        emptyTitle="No activity yet"
      />
    </div>
  );
}
