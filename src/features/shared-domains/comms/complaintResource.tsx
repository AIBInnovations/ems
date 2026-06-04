import { z } from "zod";
import { Megaphone } from "lucide-react";
import { complaintService } from "@/data/services";
import { db } from "@/data/db";
import { StatusPill } from "@/components/shared/StatusPill";
import type { FieldOption, ResourceConfig } from "@/types";

const statusOptions: FieldOption[] = [
  { value: "open", label: "Open" },
  { value: "in-progress", label: "In Progress" },
  { value: "resolved", label: "Resolved" },
];

const categoryOptions = (): FieldOption[] => {
  const seen = new Set<string>();
  const opts: FieldOption[] = [];
  for (const c of db.getAll("complaints")) {
    if (c.category && !seen.has(c.category)) {
      seen.add(c.category);
      opts.push({ value: c.category, label: c.category });
    }
  }
  return opts;
};

const schema = z.object({
  fromName: z.string().min(1, "Required"),
  category: z.string().min(1, "Required"),
  subject: z.string().min(1, "Required"),
  description: z.string().optional(),
});

export const complaintResource: ResourceConfig<"complaints"> = {
  key: "complaints",
  collection: "complaints",
  icon: Megaphone,
  titleKey: "Complaints",
  singularKey: "Complaint",
  service: complaintService,
  searchText: (c) => `${c.subject} ${c.fromName} ${c.category}`.toLowerCase(),
  defaultSort: { key: "subject" },
  columns: [
    {
      key: "subject",
      header: "Subject",
      accessor: (c) => c.subject,
      cell: (c) => (
        <div className="min-w-0">
          <p className="truncate font-semibold">{c.subject}</p>
          <p className="truncate text-xs text-muted-foreground">{c.fromName}</p>
        </div>
      ),
    },
    {
      key: "category",
      header: "Category",
      accessor: (c) => c.category,
      cell: (c) => <span className="capitalize">{c.category}</span>,
      hideBelow: "sm",
    },
    { key: "status", header: "Status", accessor: (c) => c.status, cell: (c) => <StatusPill status={c.status} /> },
  ],
  filters: [
    { key: "status", labelKey: "Status", type: "select", options: statusOptions },
    { key: "category", labelKey: "Category", type: "select", options: categoryOptions },
  ],
  form: {
    schema,
    modalSize: "md",
    defaults: () => ({ status: "open" }),
    fields: [
      { type: "text", name: "fromName", label: "From", required: true },
      { type: "text", name: "category", label: "Category", required: true },
      { type: "text", name: "subject", label: "Subject", required: true },
      { type: "textarea", name: "description", label: "Description", col: 2 },
    ],
  },
  permissions: {
    view: "complaint.view",
    create: "complaint.view",
    edit: "complaint.view",
    delete: "delete.execute",
    deleteEntity: "complaints",
    export: true,
  },
  exportable: { excel: true, pdf: true },
};
