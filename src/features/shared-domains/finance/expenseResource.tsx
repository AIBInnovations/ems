import { z } from "zod";
import { Receipt } from "lucide-react";
import { expenseService } from "@/data/services";
import { formatMoney, formatDate } from "@/lib/format";
import { StatusPill } from "@/components/shared/StatusPill";
import type { FieldOption, ResourceConfig } from "@/types";

const categoryOptions: FieldOption[] = [
  { value: "utilities", label: "Utilities" },
  { value: "maintenance", label: "Maintenance" },
  { value: "supplies", label: "Supplies" },
  { value: "salary", label: "Salary" },
  { value: "transport", label: "Transport" },
  { value: "other", label: "Other" },
];

const modeOptions: FieldOption[] = [
  { value: "cash", label: "Cash" },
  { value: "card", label: "Card" },
  { value: "upi", label: "UPI" },
  { value: "netbanking", label: "Net Banking" },
  { value: "cheque", label: "Cheque" },
  { value: "online", label: "Online" },
];

const statusOptions: FieldOption[] = [
  { value: "recorded", label: "Recorded" },
  { value: "approved", label: "Approved" },
  { value: "reimbursed", label: "Reimbursed" },
  { value: "pending", label: "Pending" },
];

const schema = z.object({
  category: z.string().min(1, "Required"),
  amount: z.coerce.number().min(0, "Required"),
  paidTo: z.string().min(1, "Required"),
  date: z.string().min(1, "Required"),
  mode: z.string().optional(),
  description: z.string().optional(),
});

export const expenseResource: ResourceConfig<"expenses"> = {
  key: "expenses",
  collection: "expenses",
  icon: Receipt,
  titleKey: "Expenses",
  singularKey: "Expense",
  service: expenseService,
  searchText: (e) => `${e.voucherNo} ${e.category} ${e.paidTo} ${e.description ?? ""}`.toLowerCase(),
  defaultSort: { key: "date", desc: true },
  columns: [
    { key: "voucherNo", header: "Voucher No", accessor: (e) => e.voucherNo, mono: true, sortable: true },
    { key: "category", header: "Category", accessor: (e) => e.category, cell: (e) => <span className="capitalize">{e.category}</span>, sortable: true },
    { key: "paidTo", header: "Paid To", accessor: (e) => e.paidTo, sortable: true },
    { key: "amount", header: "Amount", accessor: (e) => e.amount, cell: (e) => formatMoney(e.amount), align: "right", mono: true, sortable: true },
    { key: "date", header: "Date", accessor: (e) => e.date, cell: (e) => formatDate(e.date), sortable: true },
    { key: "mode", header: "Mode", accessor: (e) => e.mode, cell: (e) => <span className="capitalize">{e.mode}</span>, hideBelow: "lg" },
    { key: "status", header: "Status", accessor: (e) => e.status, cell: (e) => <StatusPill status={e.status} /> },
  ],
  filters: [
    { key: "category", labelKey: "Category", type: "select", options: categoryOptions },
    { key: "status", labelKey: "Status", type: "select", options: statusOptions },
  ],
  form: {
    schema,
    modalSize: "md",
    defaults: () => ({ status: "recorded", mode: "cash", date: new Date().toISOString().slice(0, 10) }),
    fields: [
      { type: "select", name: "category", label: "Category", required: true, options: categoryOptions },
      { type: "number", name: "amount", label: "Amount", required: true },
      { type: "text", name: "paidTo", label: "Paid To", required: true },
      { type: "date", name: "date", label: "Date", required: true },
      { type: "select", name: "mode", label: "Mode", options: modeOptions },
      { type: "textarea", name: "description", label: "Description", col: 2 },
    ],
  },
  permissions: {
    view: "finance.report",
    create: "expense.manage",
    edit: "expense.manage",
    delete: "delete.execute",
    deleteEntity: "expenses",
    export: true,
  },
  exportable: { excel: true, pdf: true },
};
