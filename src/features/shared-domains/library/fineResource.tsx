import { z } from "zod";
import { BookOpen } from "lucide-react";
import { libraryFineService } from "@/data/services";
import { db } from "@/data/db";
import { formatDate, formatMoney } from "@/lib/format";
import { StatusPill } from "@/components/shared/StatusPill";
import type { FieldOption, ResourceConfig } from "@/types";

const reasonOptions: FieldOption[] = [
  { value: "late", label: "Late" },
  { value: "lost", label: "Lost" },
  { value: "damage", label: "Damage" },
];

const memberOptions = (): FieldOption[] =>
  db.getAll("libraryMembers").map((m) => ({ value: m.id, label: m.cardNo }));

const schema = z.object({
  memberId: z.string().min(1, "Required"),
  amount: z.coerce.number().min(0, "Required"),
  reason: z.string().min(1, "Required"),
  status: z.string().min(1, "Required"),
});

export const fineResource: ResourceConfig<"libraryFines"> = {
  key: "libraryFines",
  collection: "libraryFines",
  icon: BookOpen,
  titleKey: "Library Fines",
  singularKey: "Fine",
  service: libraryFineService,
  searchText: (f) => `${f.memberId} ${f.reason} ${f.status}`.toLowerCase(),
  defaultSort: { key: "status" },
  columns: [
    {
      key: "member",
      header: "Member",
      accessor: (f) => db.getById("libraryMembers", f.memberId)?.cardNo ?? f.memberId,
      cell: (f) => (
        <span className="font-mono text-xs">{db.getById("libraryMembers", f.memberId)?.cardNo ?? f.memberId}</span>
      ),
    },
    { key: "amount", header: "Amount", align: "right", mono: true, accessor: (f) => f.amount, cell: (f) => formatMoney(f.amount) },
    { key: "reason", header: "Reason", accessor: (f) => f.reason, cell: (f) => <span className="capitalize">{f.reason}</span> },
    { key: "status", header: "Status", accessor: (f) => f.status, cell: (f) => <StatusPill status={f.status} /> },
    { key: "paidAt", header: "Paid", accessor: (f) => f.paidAt ?? "", cell: (f) => formatDate(f.paidAt) },
  ],
  filters: [
    {
      key: "status",
      labelKey: "Status",
      type: "select",
      options: [
        { value: "pending", label: "Pending" },
        { value: "paid", label: "Paid" },
        { value: "waived", label: "Waived" },
      ],
    },
    { key: "reason", labelKey: "Reason", type: "select", options: reasonOptions },
  ],
  form: {
    schema,
    defaults: () => ({ status: "pending", reason: "late", amount: 0 }),
    fields: [
      { type: "select", name: "memberId", label: "Member", required: true, options: memberOptions, col: 2 },
      { type: "number", name: "amount", label: "Amount", required: true },
      { type: "select", name: "reason", label: "Reason", required: true, options: reasonOptions },
      {
        type: "select",
        name: "status",
        label: "Status",
        required: true,
        options: [
          { value: "pending", label: "Pending" },
          { value: "paid", label: "Paid" },
          { value: "waived", label: "Waived" },
        ],
      },
      { type: "date", name: "paidAt", label: "Paid At" },
    ],
  },
  permissions: {
    view: "library.view",
    create: "library.fine",
    edit: "library.fine",
    delete: "delete.execute",
    deleteEntity: "libraryFines",
    export: true,
  },
  exportable: { excel: true, pdf: true },
};
