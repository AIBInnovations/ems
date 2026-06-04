import { z } from "zod";
import { Check, NotebookPen, X } from "lucide-react";
import { db } from "@/data/db";
import { leaveService } from "@/data/services";
import { formatDate, fullName } from "@/lib/format";
import { StatusPill } from "@/components/shared/StatusPill";
import { toast } from "@/components/ui/sonner";
import { useAuthStore } from "@/store/auth";
import type { FieldOption, LeaveApplication, ResourceConfig } from "@/types";

async function decide(l: LeaveApplication, decision: "approved" | "rejected", refresh: () => void) {
  const approver = useAuthStore.getState().user?.linkedProfileId ?? "";
  await leaveService.decide(l.id, decision, approver);
  toast.success(`Leave ${decision}`);
  refresh();
}

const typeOptions: FieldOption[] = [
  { value: "sick", label: "Sick" },
  { value: "casual", label: "Casual" },
  { value: "other", label: "Other" },
];

const statusOptions: FieldOption[] = [
  { value: "pending", label: "Pending" },
  { value: "approved", label: "Approved" },
  { value: "rejected", label: "Rejected" },
];

const applicantLabel = (l: LeaveApplication) => {
  if (l.studentId) {
    const s = db.getById("students", l.studentId);
    return s ? fullName(s.firstName, s.lastName) : "—";
  }
  return l.applicantType;
};

const schema = z.object({
  type: z.string().min(1, "Required"),
  fromDate: z.string().min(1, "Required"),
  toDate: z.string().min(1, "Required"),
  reason: z.string().min(1, "Required"),
});

export const leaveResource: ResourceConfig<"leaveApplications"> = {
  key: "leaveApplications",
  collection: "leaveApplications",
  icon: NotebookPen,
  titleKey: "Leave Applications",
  singularKey: "Leave",
  service: leaveService,
  searchText: (l) => `${applicantLabel(l)} ${l.type} ${l.reason}`.toLowerCase(),
  defaultSort: { key: "fromDate" },
  columns: [
    { key: "applicant", header: "Applicant", accessor: applicantLabel, cell: (l) => applicantLabel(l) },
    { key: "type", header: "Type", accessor: (l) => l.type, cell: (l) => <span className="capitalize">{l.type}</span> },
    { key: "fromDate", header: "From", accessor: (l) => l.fromDate, cell: (l) => formatDate(l.fromDate), sortable: true },
    { key: "toDate", header: "To", accessor: (l) => l.toDate, cell: (l) => formatDate(l.toDate) },
    { key: "reason", header: "Reason", accessor: (l) => l.reason, hideBelow: "md" },
    { key: "status", header: "Status", accessor: (l) => l.status, cell: (l) => <StatusPill status={l.status} /> },
  ],
  filters: [
    { key: "status", labelKey: "Status", type: "select", options: statusOptions },
    { key: "type", labelKey: "Type", type: "select", options: typeOptions },
  ],
  form: {
    schema,
    dynamicScope: "leave",
    defaults: () => ({ status: "pending", documents: [], extra: {} }),
    fields: [
      { type: "select", name: "type", label: "Type", required: true, options: typeOptions },
      { type: "date", name: "fromDate", label: "From Date", required: true },
      { type: "date", name: "toDate", label: "To Date", required: true },
      { type: "textarea", name: "reason", label: "Reason", required: true, col: 2 },
    ],
  },
  rowActions: [
    { key: "approve", labelKey: "Approve", icon: Check, permission: "leave.decide", show: (l) => l.status === "pending", onSelect: (l, ctx) => decide(l, "approved", ctx.refresh) },
    { key: "reject", labelKey: "Reject", icon: X, variant: "destructive", permission: "leave.decide", show: (l) => l.status === "pending", onSelect: (l, ctx) => decide(l, "rejected", ctx.refresh) },
  ],
  permissions: {
    view: "leave.apply",
    create: "leave.apply",
    edit: "leave.apply",
    delete: "delete.execute",
    deleteEntity: "leaveApplications",
    export: true,
  },
  exportable: { excel: true, pdf: true },
};
