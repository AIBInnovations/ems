import { z } from "zod";
import { Inbox } from "lucide-react";
import { inquiryService } from "@/data/services";
import { StatusPill } from "@/components/shared/StatusPill";
import type { FieldOption, ResourceConfig } from "@/types";

const sourceOptions: FieldOption[] = [
  { value: "website", label: "Website" },
  { value: "app", label: "App" },
  { value: "walk-in", label: "Walk-in" },
  { value: "phone", label: "Phone" },
];

const statusOptions: FieldOption[] = [
  { value: "new", label: "New" },
  { value: "replied", label: "Replied" },
  { value: "closed", label: "Closed" },
];

const schema = z.object({
  name: z.string().min(1, "Required"),
  phone: z.string().min(1, "Required"),
  email: z.string().optional(),
  subject: z.string().min(1, "Required"),
  message: z.string().optional(),
  source: z.string().optional(),
});

export const inquiryResource: ResourceConfig<"inquiries"> = {
  key: "inquiries",
  collection: "inquiries",
  icon: Inbox,
  titleKey: "Inquiries",
  singularKey: "Inquiry",
  service: inquiryService,
  searchText: (i) => `${i.name} ${i.phone} ${i.subject} ${i.email ?? ""}`.toLowerCase(),
  defaultSort: { key: "name" },
  columns: [
    {
      key: "name",
      header: "Name",
      accessor: (i) => i.name,
      cell: (i) => (
        <div className="min-w-0">
          <p className="truncate font-medium">{i.name}</p>
          <p className="font-mono text-xs text-muted-foreground">{i.phone}</p>
        </div>
      ),
    },
    { key: "subject", header: "Subject", accessor: (i) => i.subject, cell: (i) => <span className="line-clamp-1">{i.subject}</span> },
    {
      key: "source",
      header: "Source",
      accessor: (i) => i.source,
      cell: (i) => <span className="capitalize">{i.source}</span>,
      hideBelow: "md",
    },
    { key: "status", header: "Status", accessor: (i) => i.status, cell: (i) => <StatusPill status={i.status} /> },
  ],
  filters: [
    { key: "status", labelKey: "Status", type: "select", options: statusOptions },
    { key: "source", labelKey: "Source", type: "select", options: sourceOptions },
  ],
  form: {
    schema,
    modalSize: "md",
    defaults: () => ({ source: "website", status: "new" }),
    fields: [
      { type: "text", name: "name", label: "Name", required: true },
      { type: "tel", name: "phone", label: "Phone", required: true },
      { type: "email", name: "email", label: "Email" },
      { type: "text", name: "subject", label: "Subject", required: true },
      { type: "textarea", name: "message", label: "Message", col: 2 },
      { type: "select", name: "source", label: "Source", options: sourceOptions },
    ],
  },
  permissions: {
    view: "inquiry.view",
    create: "inquiry.reply",
    edit: "inquiry.reply",
    delete: "delete.execute",
    deleteEntity: "inquiries",
    export: true,
  },
  exportable: { excel: true, pdf: true },
};
