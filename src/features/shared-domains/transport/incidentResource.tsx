import { z } from "zod";
import { Bus } from "lucide-react";
import { db } from "@/data/db";
import { incidentService } from "@/data/services";
import { formatDate } from "@/lib/format";
import { StatusPill } from "@/components/shared/StatusPill";
import type { FieldOption, IncidentReport, ResourceConfig } from "@/types";

const vehicleNo = (i: IncidentReport): string => db.getById("vehicles", i.vehicleId)?.vehicleNo ?? "—";

const typeOptions: FieldOption[] = [
  { value: "breakdown", label: "Breakdown" },
  { value: "accident", label: "Accident" },
  { value: "route-issue", label: "Route Issue" },
  { value: "emergency", label: "Emergency" },
  { value: "other", label: "Other" },
];

const severityOptions: FieldOption[] = [
  { value: "low", label: "Low" },
  { value: "medium", label: "Medium" },
  { value: "high", label: "High" },
];

const statusOptions: FieldOption[] = [
  { value: "open", label: "Open" },
  { value: "resolved", label: "Resolved" },
];

const schema = z.object({
  type: z.string().min(1, "Required"),
  description: z.string().min(1, "Required"),
  severity: z.string().optional(),
});

export const incidentResource: ResourceConfig<"incidents"> = {
  key: "incidents",
  collection: "incidents",
  icon: Bus,
  titleKey: "Incidents",
  singularKey: "Incident",
  service: incidentService,
  searchText: (i) => `${i.type} ${i.description} ${vehicleNo(i)}`.toLowerCase(),
  defaultSort: { key: "date" },
  columns: [
    { key: "type", header: "Type", accessor: (i) => i.type, sortable: true, cell: (i) => <span className="capitalize">{i.type}</span> },
    { key: "vehicle", header: "Vehicle", accessor: vehicleNo, cell: (i) => vehicleNo(i), mono: true },
    { key: "description", header: "Description", accessor: (i) => i.description, hideBelow: "md" },
    { key: "date", header: "Date", accessor: (i) => i.date, sortable: true, cell: (i) => formatDate(i.date) },
    { key: "severity", header: "Severity", accessor: (i) => i.severity, sortable: true, cell: (i) => <StatusPill status={i.severity} /> },
    { key: "status", header: "Status", accessor: (i) => i.status, sortable: true, cell: (i) => <StatusPill status={i.status} /> },
  ],
  filters: [
    { key: "status", labelKey: "Status", type: "select", options: statusOptions },
    { key: "severity", labelKey: "Severity", type: "select", options: severityOptions },
    { key: "type", labelKey: "Type", type: "select", options: typeOptions },
  ],
  form: {
    schema,
    modalSize: "md",
    defaults: () => ({ severity: "low", status: "open", photos: [], date: new Date().toISOString().slice(0, 10) }),
    fields: [
      { type: "select", name: "type", label: "Type", required: true, options: typeOptions },
      { type: "textarea", name: "description", label: "Description", required: true, col: 2 },
      { type: "select", name: "severity", label: "Severity", options: severityOptions },
    ],
  },
  permissions: {
    view: "transport.view",
    create: "transport.incident",
    edit: "transport.incident",
    delete: "delete.execute",
    deleteEntity: "incidents",
    export: true,
  },
  exportable: { excel: true, pdf: true },
};
