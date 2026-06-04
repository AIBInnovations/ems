import { z } from "zod";
import { FlaskConical } from "lucide-react";
import { db } from "@/data/db";
import { formatDate } from "@/lib/format";
import { StatusPill } from "@/components/shared/StatusPill";
import type { FieldOption, ResourceConfig } from "@/types";
import { labIssueService } from "@/data/services";

const itemOptions = (): FieldOption[] => db.getAll("labItems").map((i) => ({ value: i.id, label: i.name }));

const statusOptions: FieldOption[] = [
  { value: "issued", label: "Issued" },
  { value: "returned", label: "Returned" },
  { value: "overdue", label: "Overdue" },
];

const schema = z.object({
  itemId: z.string().min(1, "Required"),
  quantity: z.coerce.number().min(1, "Required"),
  issuedToType: z.string().min(1, "Required"),
  issuedToId: z.string().min(1, "Required"),
  purpose: z.string().optional(),
  issueDate: z.string().min(1, "Required"),
  returnDate: z.string().optional(),
  status: z.string().min(1, "Required"),
});

export const labIssueResource: ResourceConfig<"labIssues"> = {
  key: "labIssues",
  collection: "labIssues",
  icon: FlaskConical,
  titleKey: "Equipment Issues",
  singularKey: "Issue",
  service: labIssueService,
  searchText: (i) => `${db.getById("labItems", i.itemId)?.name ?? ""} ${i.purpose ?? ""} ${i.status}`.toLowerCase(),
  defaultSort: { key: "issueDate", desc: true },
  columns: [
    {
      key: "item",
      header: "Item",
      accessor: (i) => db.getById("labItems", i.itemId)?.name ?? "—",
      cell: (i) => db.getById("labItems", i.itemId)?.name ?? "—",
    },
    { key: "quantity", header: "Quantity", align: "right", mono: true, accessor: (i) => i.quantity },
    { key: "purpose", header: "Purpose", hideBelow: "md", accessor: (i) => i.purpose ?? "—" },
    { key: "issueDate", header: "Issue Date", accessor: (i) => i.issueDate, cell: (i) => formatDate(i.issueDate), sortable: true },
    { key: "status", header: "Status", accessor: (i) => i.status, cell: (i) => <StatusPill status={i.status} /> },
  ],
  filters: [{ key: "status", labelKey: "Status", type: "select", options: statusOptions }],
  form: {
    schema,
    defaults: () => ({ issuedToType: "student", status: "issued", quantity: 1 }),
    fields: [
      { type: "select", name: "itemId", label: "Item", required: true, options: itemOptions },
      { type: "number", name: "quantity", label: "Quantity", required: true },
      {
        type: "select",
        name: "issuedToType",
        label: "Issued To Type",
        required: true,
        options: [
          { value: "student", label: "Student" },
          { value: "staff", label: "Staff" },
        ],
      },
      { type: "text", name: "issuedToId", label: "Issued To", required: true },
      { type: "date", name: "issueDate", label: "Issue Date", required: true },
      { type: "date", name: "returnDate", label: "Return Date" },
      { type: "select", name: "status", label: "Status", required: true, options: statusOptions },
      { type: "textarea", name: "purpose", label: "Purpose", col: 2 },
    ],
  },
  permissions: {
    view: "lab.view",
    create: "lab.issue",
    edit: "lab.issue",
    delete: "delete.execute",
    deleteEntity: "labIssues",
    export: true,
  },
  exportable: { excel: true, pdf: true },
};
