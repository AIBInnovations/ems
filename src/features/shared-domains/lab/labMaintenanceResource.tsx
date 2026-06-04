import { z } from "zod";
import { FlaskConical } from "lucide-react";
import { formatDate } from "@/lib/format";
import { StatusPill } from "@/components/shared/StatusPill";
import type { FieldOption, ResourceConfig } from "@/types";
import { labMaintenanceService } from "@/data/services";

const labTypeOptions: FieldOption[] = [
  { value: "physics", label: "Physics" },
  { value: "chemistry", label: "Chemistry" },
  { value: "biology", label: "Biology" },
  { value: "computer", label: "Computer" },
  { value: "other", label: "Other" },
];

const typeOptions: FieldOption[] = [
  { value: "repair", label: "Repair" },
  { value: "calibration", label: "Calibration" },
  { value: "safety-check", label: "Safety Check" },
  { value: "restock", label: "Restock" },
];

const statusOptions: FieldOption[] = [
  { value: "open", label: "Open" },
  { value: "done", label: "Done" },
];

const schema = z.object({
  labType: z.string().min(1, "Required"),
  type: z.string().min(1, "Required"),
  date: z.string().min(1, "Required"),
  note: z.string().optional(),
  status: z.string().min(1, "Required"),
});

export const labMaintenanceResource: ResourceConfig<"labMaintenance"> = {
  key: "labMaintenance",
  collection: "labMaintenance",
  icon: FlaskConical,
  titleKey: "Maintenance Logs",
  singularKey: "Log",
  service: labMaintenanceService,
  searchText: (m) => `${m.labType} ${m.type} ${m.note ?? ""} ${m.status}`.toLowerCase(),
  defaultSort: { key: "date", desc: true },
  columns: [
    { key: "labType", header: "Lab", accessor: (m) => m.labType, cell: (m) => <span className="capitalize">{m.labType}</span> },
    { key: "type", header: "Type", accessor: (m) => m.type, cell: (m) => <span className="capitalize">{m.type}</span> },
    { key: "date", header: "Date", accessor: (m) => m.date, cell: (m) => formatDate(m.date), sortable: true },
    { key: "note", header: "Note", hideBelow: "md", accessor: (m) => m.note ?? "—" },
    { key: "status", header: "Status", accessor: (m) => m.status, cell: (m) => <StatusPill status={m.status} /> },
  ],
  filters: [
    { key: "status", labelKey: "Status", type: "select", options: statusOptions },
    { key: "type", labelKey: "Type", type: "select", options: typeOptions },
  ],
  form: {
    schema,
    defaults: () => ({ status: "open", labType: "physics", type: "repair" }),
    fields: [
      { type: "select", name: "labType", label: "Lab Type", required: true, options: labTypeOptions },
      { type: "select", name: "type", label: "Type", required: true, options: typeOptions },
      { type: "date", name: "date", label: "Date", required: true },
      { type: "select", name: "status", label: "Status", required: true, options: statusOptions },
      { type: "textarea", name: "note", label: "Note", col: 2 },
    ],
  },
  permissions: {
    view: "lab.view",
    create: "lab.maintenance",
    edit: "lab.maintenance",
    delete: "delete.execute",
    deleteEntity: "labMaintenance",
    export: true,
  },
  exportable: { excel: true, pdf: true },
};
