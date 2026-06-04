import { useTranslation } from "react-i18next";
import { RotateCcw, Trash2, Undo2 } from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { DataTable } from "@/components/shared/DataTable";
import { StatusPill } from "@/components/shared/StatusPill";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/sonner";
import { useDialogs } from "@/components/shared/dialogs";
import { useResourceList } from "@/hooks/useResource";
import { recycleBinService } from "@/data/services";
import { restore, purge } from "@/lib/bin";
import { useServicesStore } from "@/store/services";
import { daysUntil } from "@/lib/clock";
import { formatDateTime } from "@/lib/format";
import type { RecycleBinItem, ResourceColumn } from "@/types";

export function RecycleBinPage() {
  const { t } = useTranslation();
  const { confirm } = useDialogs();
  const { data, loading, refresh } = useResourceList(recycleBinService);
  const reloadServices = useServicesStore((s) => s.reload);

  const onRestore = (item: RecycleBinItem) => {
    restore(item.id);
    refresh();
    reloadServices();
    toast.success(`${item.label} restored`);
  };

  const onPurge = (item: RecycleBinItem) => {
    confirm({
      title: "Permanently delete?",
      body: `"${item.label}" will be permanently removed and cannot be recovered.`,
      confirmLabel: "Delete forever",
      destructive: true,
      onConfirm: () => {
        purge(item.id);
        refresh();
        toast.success("Permanently deleted");
      },
    });
  };

  const columns: ResourceColumn<RecycleBinItem>[] = [
    { key: "label", header: "Item", accessor: (r) => r.label, cell: (r) => <span className="font-medium">{r.label}</span> },
    { key: "origin", header: "Module", accessor: (r) => r.origin, hideBelow: "sm" },
    { key: "deletedByName", header: "Deleted by", accessor: (r) => r.deletedByName, hideBelow: "md" },
    { key: "deletedAt", header: "Deleted", accessor: (r) => r.deletedAt ?? r.createdAt, cell: (r) => formatDateTime(r.createdAt), hideBelow: "lg" },
    {
      key: "expires",
      header: "Auto-purge",
      accessor: (r) => daysUntil(r.expiresAt),
      cell: (r) => {
        const d = daysUntil(r.expiresAt);
        return <StatusPill status={d <= 3 ? "overdue" : "pending"} label={`${Math.max(0, d)} days left`} />;
      },
    },
  ];

  return (
    <div className="space-y-5">
      <PageHeader
        title={t("nav.recyclebin", "Recycle Bin")}
        icon={<Trash2 className="size-5" />}
        description="Deleted items are kept for 15 days, then permanently removed. Restore or delete them here."
      />
      <DataTable
        data={data}
        columns={columns}
        getRowId={(r) => r.id}
        loading={loading}
        searchText={(r) => `${r.label} ${r.origin}`}
        emptyTitle="Recycle bin is empty"
        emptyDescription="Deleted records will appear here for 15 days."
        rowActions={(item) => (
          <div className="flex justify-end gap-1">
            <Button variant="ghost" size="sm" onClick={() => onRestore(item)}><Undo2 className="size-4" /> {t("action.restore", "Restore")}</Button>
            <Button variant="ghost" size="icon" className="size-8 text-destructive" onClick={() => onPurge(item)}><Trash2 className="size-4" /></Button>
          </div>
        )}
        toolbar={{ extra: <span className="text-xs text-muted-foreground"><RotateCcw className="mr-1 inline size-3.5" />15-day retention</span> }}
      />
    </div>
  );
}
