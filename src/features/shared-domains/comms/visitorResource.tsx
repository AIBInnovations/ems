import { z } from "zod";
import { ClipboardList } from "lucide-react";
import { visitorService } from "@/data/services";
import { formatDateTime } from "@/lib/format";
import { StatusPill } from "@/components/shared/StatusPill";
import type { ResourceConfig } from "@/types";

const schema = z.object({
  visitorName: z.string().min(1, "Required"),
  phone: z.string().min(1, "Required"),
  purpose: z.string().min(1, "Required"),
  badgeNo: z.string().optional(),
});

export const visitorResource: ResourceConfig<"visitors"> = {
  key: "visitors",
  collection: "visitors",
  icon: ClipboardList,
  titleKey: "Visitor Book",
  singularKey: "Visitor",
  service: visitorService,
  searchText: (v) => `${v.visitorName} ${v.phone} ${v.purpose} ${v.badgeNo}`.toLowerCase(),
  defaultSort: { key: "inTime", desc: true },
  columns: [
    {
      key: "visitorName",
      header: "Visitor",
      accessor: (v) => v.visitorName,
      cell: (v) => (
        <div className="min-w-0">
          <p className="truncate font-medium">{v.visitorName}</p>
          <p className="font-mono text-xs text-muted-foreground">{v.phone}</p>
        </div>
      ),
    },
    { key: "purpose", header: "Purpose", accessor: (v) => v.purpose },
    { key: "badgeNo", header: "Badge No", accessor: (v) => v.badgeNo, mono: true, hideBelow: "md" },
    { key: "inTime", header: "In Time", accessor: (v) => v.inTime, cell: (v) => formatDateTime(v.inTime), sortable: true },
    { key: "status", header: "Status", accessor: (v) => v.status, cell: (v) => <StatusPill status={v.status} /> },
  ],
  filters: [
    {
      key: "status",
      labelKey: "Status",
      type: "select",
      options: [
        { value: "in", label: "In" },
        { value: "out", label: "Out" },
      ],
    },
  ],
  form: {
    schema,
    modalSize: "md",
    defaults: () => ({ status: "in", inTime: new Date().toISOString() }),
    fields: [
      { type: "text", name: "visitorName", label: "Visitor Name", required: true },
      { type: "tel", name: "phone", label: "Phone", required: true },
      { type: "text", name: "purpose", label: "Purpose", required: true, col: 2 },
      { type: "text", name: "badgeNo", label: "Badge No", mono: true },
    ],
  },
  permissions: {
    view: "visitor.manage",
    create: "visitor.manage",
    edit: "visitor.manage",
    delete: "delete.execute",
    deleteEntity: "visitors",
    export: true,
  },
  exportable: { excel: true, pdf: true },
};
