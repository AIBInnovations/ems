import { HandCoins } from "lucide-react";
import { db } from "@/data/db";
import { payrollService } from "@/data/services";
import { formatMoney, fullName } from "@/lib/format";
import { StatusPill } from "@/components/shared/StatusPill";
import type { FieldOption, PayrollRecord, ResourceConfig } from "@/types";

const statusOptions: FieldOption[] = [
  { value: "draft", label: "Draft" },
  { value: "finalized", label: "Finalized" },
  { value: "paid", label: "Paid" },
];

const monthOptions = (): FieldOption[] =>
  Array.from(new Set(db.getAll("payrollRecords").map((p) => p.month)))
    .sort()
    .reverse()
    .map((m) => ({ value: m, label: m }));

const staffName = (p: PayrollRecord) => {
  const s = db.getById("staff", p.staffId);
  return s ? fullName(s.firstName, s.lastName) : "—";
};

export const payrollResource: ResourceConfig<"payrollRecords"> = {
  key: "payrollRecords",
  collection: "payrollRecords",
  icon: HandCoins,
  titleKey: "Payroll",
  singularKey: "Payroll Record",
  service: payrollService,
  searchText: (p) => `${staffName(p)} ${p.month}`.toLowerCase(),
  defaultSort: { key: "month", desc: true },
  columns: [
    { key: "staff", header: "Staff", accessor: (p) => staffName(p), cell: (p) => staffName(p), sortable: true },
    { key: "month", header: "Month", accessor: (p) => p.month, sortable: true },
    { key: "paidDays", header: "Paid Days", accessor: (p) => p.paidDays, align: "right", sortable: true },
    { key: "computedGross", header: "Gross", accessor: (p) => p.computedGross, cell: (p) => formatMoney(p.computedGross), align: "right", mono: true, hideBelow: "md" },
    { key: "deductions", header: "Deductions", accessor: (p) => p.deductions, cell: (p) => formatMoney(p.deductions), align: "right", mono: true, hideBelow: "lg" },
    { key: "netPay", header: "Net Pay", accessor: (p) => p.netPay, cell: (p) => formatMoney(p.netPay), align: "right", mono: true, sortable: true },
    { key: "status", header: "Status", accessor: (p) => p.status, cell: (p) => <StatusPill status={p.status} /> },
  ],
  filters: [
    { key: "status", labelKey: "Status", type: "select", options: statusOptions },
    { key: "month", labelKey: "Month", type: "select", options: monthOptions },
  ],
  form: undefined,
  permissions: {
    view: "payroll.manage",
    delete: "delete.execute",
    deleteEntity: "payrollRecords",
    export: true,
  },
  exportable: { excel: true, pdf: true },
};
