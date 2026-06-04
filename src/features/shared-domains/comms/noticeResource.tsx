import { z } from "zod";
import { Megaphone } from "lucide-react";
import { noticeService } from "@/data/services";
import { formatDate } from "@/lib/format";
import type { FieldOption, ResourceConfig } from "@/types";

const audienceOptions: FieldOption[] = [
  { value: "all", label: "All" },
  { value: "teachers", label: "Teachers" },
  { value: "parents", label: "Parents" },
  { value: "students", label: "Students" },
  { value: "employees", label: "Employees" },
];

const schema = z.object({
  title: z.string().min(1, "Required"),
  body: z.string().min(1, "Required"),
  audience: z.string().min(1, "Required"),
  pinned: z.boolean().optional(),
});

export const noticeResource: ResourceConfig<"notices"> = {
  key: "notices",
  collection: "notices",
  icon: Megaphone,
  titleKey: "Notice Board",
  singularKey: "Notice",
  service: noticeService,
  searchText: (n) => `${n.title} ${n.body}`.toLowerCase(),
  defaultSort: { key: "publishedAt", desc: true },
  columns: [
    {
      key: "title",
      header: "Title",
      accessor: (n) => n.title,
      cell: (n) => (
        <div className="min-w-0">
          <p className="truncate font-semibold">{n.title}</p>
          <p className="line-clamp-1 text-xs text-muted-foreground">{n.body}</p>
        </div>
      ),
    },
    {
      key: "audience",
      header: "Audience",
      accessor: (n) => n.audience,
      cell: (n) => <span className="capitalize">{n.audience}</span>,
      hideBelow: "sm",
    },
    {
      key: "publishedAt",
      header: "Published",
      accessor: (n) => n.publishedAt,
      cell: (n) => formatDate(n.publishedAt),
      sortable: true,
      hideBelow: "md",
    },
    {
      key: "pinned",
      header: "Pinned",
      align: "center",
      accessor: (n) => (n.pinned ? "Yes" : "No"),
      cell: (n) => (n.pinned ? "Yes" : "No"),
    },
  ],
  filters: [
    { key: "audience", labelKey: "Audience", type: "select", options: audienceOptions },
  ],
  form: {
    schema,
    modalSize: "md",
    defaults: () => ({ audience: "all", pinned: false, attachments: [], publishedAt: new Date().toISOString() }),
    fields: [
      { type: "text", name: "title", label: "Title", required: true, col: 2 },
      { type: "textarea", name: "body", label: "Body", required: true, col: 2 },
      { type: "select", name: "audience", label: "Audience", required: true, options: audienceOptions },
      { type: "switch", name: "pinned", label: "Pinned" },
    ],
  },
  permissions: {
    view: "notice.manage",
    create: "notice.manage",
    edit: "notice.manage",
    delete: "delete.execute",
    deleteEntity: "notices",
    export: true,
  },
  exportable: { excel: true, pdf: true },
};
