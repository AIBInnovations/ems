import { z } from "zod";
import { BookOpen } from "lucide-react";
import { db } from "@/data/db";
import { subjectService } from "@/data/services";
import type { ResourceConfig, FieldOption } from "@/types";

const typeOptions: FieldOption[] = [
  { value: "core", label: "Core" },
  { value: "elective", label: "Elective" },
  { value: "practical", label: "Practical" },
  { value: "activity", label: "Activity" },
];

const schema = z.object({
  name: z.string().min(1, "Required"),
  code: z.string().min(1, "Required"),
  type: z.string().min(1, "Select a type"),
  maxMarks: z.coerce.number().min(0).optional(),
  passMarks: z.coerce.number().min(0).optional(),
  hasPractical: z.boolean().optional(),
});

export const subjectResource: ResourceConfig<"subjects"> = {
  key: "subjects",
  collection: "subjects",
  icon: BookOpen,
  titleKey: "Subjects",
  singularKey: "Subject",
  service: subjectService,
  searchText: (s) => `${s.name} ${s.code}`,
  defaultSort: { key: "name" },
  columns: [
    { key: "name", header: "Subject", accessor: (s) => s.name, sortable: true },
    { key: "code", header: "Code", accessor: (s) => s.code, mono: true, sortable: true },
    { key: "type", header: "Type", accessor: (s) => s.type, cell: (s) => <span className="capitalize">{s.type}</span> },
    { key: "maxMarks", header: "Max Marks", accessor: (s) => s.maxMarks, align: "right", hideBelow: "md" },
    { key: "passMarks", header: "Pass Marks", accessor: (s) => s.passMarks, align: "right", hideBelow: "md" },
    { key: "hasPractical", header: "Practical", accessor: (s) => (s.hasPractical ? "Yes" : "No"), align: "center", hideBelow: "lg" },
  ],
  filters: [
    { key: "type", labelKey: "Type", type: "select", options: typeOptions },
  ],
  form: {
    schema,
    modalSize: "md",
    defaults: () => ({ type: "core", hasPractical: false, classIds: [], maxMarks: 100, passMarks: 33 }),
    fields: [
      { type: "text", name: "name", label: "Subject Name", required: true },
      { type: "text", name: "code", label: "Code", required: true, mono: true },
      { type: "select", name: "type", label: "Type", required: true, options: typeOptions },
      { type: "number", name: "maxMarks", label: "Max Marks" },
      { type: "number", name: "passMarks", label: "Pass Marks" },
      { type: "switch", name: "hasPractical", label: "Has Practical" },
    ],
  },
  permissions: {
    view: "subject.manage",
    create: "subject.manage",
    edit: "subject.manage",
    delete: "delete.execute",
    deleteEntity: "subjects",
    export: true,
  },
  exportable: { excel: true, pdf: true },
};
