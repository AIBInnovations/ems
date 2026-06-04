import { z } from "zod";
import { ClipboardCheck } from "lucide-react";
import { db } from "@/data/db";
import { homeworkService } from "@/data/services";
import { formatDate } from "@/lib/format";
import { StatusPill } from "@/components/shared/StatusPill";
import type { FieldOption, ResourceConfig } from "@/types";

const statusOptions: FieldOption[] = [
  { value: "open", label: "Open" },
  { value: "closed", label: "Closed" },
];

const schema = z.object({
  title: z.string().min(1, "Required"),
  description: z.string().optional(),
  dueDate: z.string().min(1, "Required"),
});

export const homeworkResource: ResourceConfig<"homework"> = {
  key: "homework",
  collection: "homework",
  icon: ClipboardCheck,
  titleKey: "Homework",
  singularKey: "Homework",
  service: homeworkService,
  searchText: (h) => `${h.title} ${h.description}`.toLowerCase(),
  defaultSort: { key: "dueDate" },
  columns: [
    { key: "title", header: "Title", accessor: (h) => h.title },
    { key: "class", header: "Class", accessor: (h) => db.getById("classes", h.classId)?.name ?? "—" },
    { key: "subject", header: "Subject", accessor: (h) => db.getById("subjects", h.subjectId)?.name ?? "—" },
    { key: "dueDate", header: "Due Date", accessor: (h) => h.dueDate, cell: (h) => formatDate(h.dueDate), sortable: true },
    { key: "status", header: "Status", accessor: (h) => h.status, cell: (h) => <StatusPill status={h.status} /> },
  ],
  filters: [
    { key: "status", labelKey: "Status", type: "select", options: statusOptions },
  ],
  form: {
    schema,
    defaults: () => ({ status: "open", attachments: [] }),
    fields: [
      { type: "text", name: "title", label: "Title", required: true },
      { type: "textarea", name: "description", label: "Description", col: 2 },
      { type: "date", name: "dueDate", label: "Due Date", required: true },
    ],
  },
  permissions: {
    view: "homework.manage",
    create: "homework.manage",
    edit: "homework.manage",
    delete: "delete.execute",
    deleteEntity: "homework",
    export: true,
  },
  exportable: { excel: true, pdf: true },
};
