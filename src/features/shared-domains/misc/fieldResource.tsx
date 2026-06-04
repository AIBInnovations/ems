import { z } from "zod";
import { Settings } from "lucide-react";
import { fieldDefinitionService } from "@/data/services";
import type { FieldOption, ResourceConfig } from "@/types";

const scopeOptions: FieldOption[] = [
  { value: "admission", label: "Admission" },
  { value: "student", label: "Student" },
  { value: "staff", label: "Staff" },
  { value: "sports", label: "Sports" },
  { value: "leave", label: "Leave" },
  { value: "timetable", label: "Timetable" },
];

const typeOptions: FieldOption[] = [
  { value: "text", label: "Text" },
  { value: "number", label: "Number" },
  { value: "date", label: "Date" },
  { value: "select", label: "Select" },
  { value: "checkbox", label: "Checkbox" },
  { value: "file", label: "File" },
];

const schema = z.object({
  scope: z.string().min(1, "Required"),
  key: z.string().min(1, "Required"),
  label: z.string().min(1, "Required"),
  type: z.string().min(1, "Required"),
  required: z.boolean().optional(),
  order: z.coerce.number().optional(),
});

export const fieldResource: ResourceConfig<"fieldDefinitions"> = {
  key: "fieldDefinitions",
  collection: "fieldDefinitions",
  icon: Settings,
  titleKey: "Custom Fields",
  singularKey: "Field",
  service: fieldDefinitionService,
  searchText: (f) => `${f.label} ${f.key} ${f.scope}`.toLowerCase(),
  defaultSort: { key: "order" },
  columns: [
    { key: "label", header: "Label", accessor: (f) => f.label },
    { key: "key", header: "Key", accessor: (f) => f.key, mono: true },
    { key: "scope", header: "Scope", accessor: (f) => f.scope, cell: (f) => <span className="capitalize">{f.scope}</span> },
    { key: "type", header: "Type", accessor: (f) => f.type, cell: (f) => <span className="capitalize">{f.type}</span> },
    { key: "required", header: "Required", accessor: (f) => (f.required ? "Yes" : "No"), align: "center" },
    { key: "order", header: "Order", accessor: (f) => f.order, align: "right", sortable: true },
  ],
  filters: [
    { key: "scope", labelKey: "Scope", type: "select", options: scopeOptions },
    { key: "type", labelKey: "Type", type: "select", options: typeOptions },
  ],
  form: {
    schema,
    defaults: () => ({ required: false, order: 0, options: [], visibleToRoles: [] }),
    fields: [
      { type: "select", name: "scope", label: "Scope", required: true, options: scopeOptions },
      { type: "text", name: "key", label: "Key", required: true, mono: true },
      { type: "text", name: "label", label: "Label", required: true },
      { type: "select", name: "type", label: "Type", required: true, options: typeOptions },
      { type: "switch", name: "required", label: "Required" },
      { type: "number", name: "order", label: "Order" },
    ],
  },
  permissions: {
    view: "field.manage",
    create: "field.manage",
    edit: "field.manage",
    delete: "delete.execute",
    deleteEntity: "fieldDefinitions",
    export: true,
  },
  exportable: { excel: true, pdf: true },
};
