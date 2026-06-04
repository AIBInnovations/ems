import { z } from "zod";
import { ShieldCheck } from "lucide-react";
import { db } from "@/data/db";
import { disciplineService } from "@/data/services";
import { formatDate, fullName } from "@/lib/format";
import { StatusPill } from "@/components/shared/StatusPill";
import type { FieldOption, ResourceConfig } from "@/types";

const typeOptions: FieldOption[] = [
  { value: "warning", label: "Warning" },
  { value: "suspension", label: "Suspension" },
  { value: "incident", label: "Incident" },
  { value: "counseling", label: "Counseling" },
  { value: "achievement", label: "Achievement" },
];

const severityOptions: FieldOption[] = [
  { value: "low", label: "Low" },
  { value: "medium", label: "Medium" },
  { value: "high", label: "High" },
];

const studentLabel = (studentId: string): string => {
  const s = db.getById("students", studentId);
  return s ? fullName(s.firstName, s.lastName) : studentId;
};

const schema = z.object({
  type: z.string().min(1, "Select a type"),
  date: z.string().min(1, "Required"),
  description: z.string().min(1, "Required"),
  severity: z.string().optional(),
});

export const disciplineResource: ResourceConfig<"disciplineRecords"> = {
  key: "disciplineRecords",
  collection: "disciplineRecords",
  icon: ShieldCheck,
  titleKey: "Discipline & Behavior",
  singularKey: "Record",
  service: disciplineService,
  searchText: (d) => `${studentLabel(d.studentId)} ${d.type} ${d.description}`.toLowerCase(),
  defaultSort: { key: "date", desc: true },
  columns: [
    {
      key: "student",
      header: "Student",
      accessor: (d) => studentLabel(d.studentId),
      cell: (d) => <span className="font-medium">{studentLabel(d.studentId)}</span>,
    },
    { key: "type", header: "Type", accessor: (d) => d.type, cell: (d) => <span className="capitalize">{d.type}</span> },
    { key: "date", header: "Date", accessor: (d) => d.date, cell: (d) => formatDate(d.date), sortable: true },
    {
      key: "description",
      header: "Description",
      hideBelow: "md",
      accessor: (d) => d.description,
      cell: (d) => <span className="text-muted-foreground">{d.description}</span>,
    },
    {
      key: "severity",
      header: "Severity",
      accessor: (d) => d.severity ?? "",
      cell: (d) => (d.severity ? <StatusPill status={d.severity} /> : "—"),
    },
  ],
  filters: [{ key: "type", labelKey: "Type", type: "select", options: typeOptions }],
  form: {
    schema,
    modalSize: "md",
    defaults: () => ({ type: "warning" }),
    fields: [
      { type: "select", name: "type", label: "Type", required: true, options: typeOptions },
      { type: "date", name: "date", label: "Date", required: true },
      { type: "textarea", name: "description", label: "Description", required: true, col: 2 },
      { type: "select", name: "severity", label: "Severity", options: severityOptions },
    ],
  },
  permissions: {
    view: "discipline.manage",
    create: "discipline.manage",
    edit: "discipline.manage",
    delete: "delete.execute",
    deleteEntity: "disciplineRecords",
    export: true,
  },
  exportable: { excel: true, pdf: true },
};
