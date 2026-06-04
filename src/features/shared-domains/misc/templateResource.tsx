import { z } from "zod";
import { FileText } from "lucide-react";
import { templateService } from "@/data/services";
import type { FieldOption, ResourceConfig } from "@/types";

const cap = (v?: string) => (v ? v.charAt(0).toUpperCase() + v.slice(1) : "—");

const typeOptions: FieldOption[] = [
  { value: "marksheet", label: "Marksheet" },
  { value: "admitcard", label: "Admit Card" },
  { value: "idcard", label: "ID Card" },
  { value: "timetable", label: "Timetable" },
  { value: "receipt", label: "Receipt" },
  { value: "tc", label: "Transfer Certificate" },
  { value: "certificate", label: "Certificate" },
];

const schema = z.object({
  name: z.string().min(1, "Required"),
  type: z.string().min(1, "Required"),
  isDefault: z.boolean().optional(),
});

export const templateResource: ResourceConfig<"templates"> = {
  key: "templates",
  collection: "templates",
  icon: FileText,
  titleKey: "Document Templates",
  singularKey: "Template",
  service: templateService,
  searchText: (t) => `${t.name} ${t.type}`.toLowerCase(),
  defaultSort: { key: "name" },
  columns: [
    { key: "name", header: "Name", accessor: (t) => t.name },
    { key: "type", header: "Type", accessor: (t) => t.type, cell: (t) => <span className="capitalize">{t.type}</span> },
    { key: "style", header: "Style", accessor: (t) => t.layoutConfig.style, cell: (t) => <span className="capitalize">{t.layoutConfig.style}</span> },
    { key: "isDefault", header: "Default", accessor: (t) => (t.isDefault ? "Yes" : "No"), align: "center" },
  ],
  filters: [
    { key: "type", labelKey: "Type", type: "select", options: typeOptions },
  ],
  form: {
    schema,
    defaults: () => ({ isDefault: false }),
    fields: [
      { type: "text", name: "name", label: "Name", required: true },
      { type: "select", name: "type", label: "Type", required: true, options: typeOptions },
      { type: "switch", name: "isDefault", label: "Set as default" },
    ],
  },
  permissions: {
    view: "template.manage",
    create: "template.manage",
    edit: "template.manage",
    delete: "delete.execute",
    deleteEntity: "templates",
    export: true,
  },
  exportable: { excel: true, pdf: true },
};
