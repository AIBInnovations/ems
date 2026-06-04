import { z } from "zod";
import { GraduationCap } from "lucide-react";
import { db } from "@/data/db";
import { examService } from "@/data/services";
import { formatDate } from "@/lib/format";
import { StatusPill } from "@/components/shared/StatusPill";
import type { ResourceConfig, FieldOption } from "@/types";

const typeOptions: FieldOption[] = [
  { value: "unit", label: "Unit Test" },
  { value: "term", label: "Term" },
  { value: "final", label: "Final" },
  { value: "practical", label: "Practical" },
];

const statusOptions: FieldOption[] = [
  { value: "planned", label: "Planned" },
  { value: "ongoing", label: "Ongoing" },
  { value: "completed", label: "Completed" },
  { value: "published", label: "Published" },
];

const schema = z.object({
  name: z.string().min(1, "Required"),
  type: z.string().min(1, "Select a type"),
  startDate: z.string().min(1, "Required"),
  endDate: z.string().min(1, "Required"),
  maxMarksDefault: z.coerce.number().min(0).optional(),
});

export const examResource: ResourceConfig<"exams"> = {
  key: "exams",
  collection: "exams",
  icon: GraduationCap,
  titleKey: "Exams",
  singularKey: "Exam",
  service: examService,
  searchText: (e) => `${e.name} ${e.type}`,
  defaultSort: { key: "startDate", desc: true },
  columns: [
    { key: "name", header: "Exam", accessor: (e) => e.name, sortable: true },
    { key: "type", header: "Type", accessor: (e) => e.type, cell: (e) => <span className="capitalize">{e.type}</span> },
    { key: "startDate", header: "Start Date", accessor: (e) => e.startDate, cell: (e) => formatDate(e.startDate), sortable: true },
    { key: "endDate", header: "End Date", accessor: (e) => e.endDate, cell: (e) => formatDate(e.endDate), hideBelow: "md" },
    { key: "status", header: "Status", accessor: (e) => e.status, cell: (e) => <StatusPill status={e.status} /> },
  ],
  filters: [
    { key: "status", labelKey: "Status", type: "select", options: statusOptions },
    { key: "type", labelKey: "Type", type: "select", options: typeOptions },
  ],
  form: {
    schema,
    modalSize: "md",
    defaults: () => ({
      type: "term",
      status: "planned",
      classIds: [],
      maxMarksDefault: 100,
      academicYearId: db.query("academicYears", (a) => a.isCurrent)[0]?.id,
    }),
    fields: [
      { type: "text", name: "name", label: "Exam Name", required: true },
      { type: "select", name: "type", label: "Type", required: true, options: typeOptions },
      { type: "date", name: "startDate", label: "Start Date", required: true },
      { type: "date", name: "endDate", label: "End Date", required: true },
      { type: "number", name: "maxMarksDefault", label: "Default Max Marks" },
    ],
  },
  permissions: {
    view: "marks.view",
    create: "exam.manage",
    edit: "exam.manage",
    delete: "delete.execute",
    deleteEntity: "exams",
    export: true,
  },
  exportable: { excel: true, pdf: true },
};
