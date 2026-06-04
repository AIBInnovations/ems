import { z } from "zod";
import { Bus } from "lucide-react";
import { db } from "@/data/db";
import { vehicleService } from "@/data/services";
import { fullName } from "@/lib/format";
import { StatusPill } from "@/components/shared/StatusPill";
import type { FieldOption, ResourceConfig, Vehicle } from "@/types";

const driverName = (v: Vehicle): string => {
  const s = v.driverStaffId ? db.getById("staff", v.driverStaffId) : null;
  return s ? fullName(s.firstName, s.lastName) : "—";
};

const typeOptions: FieldOption[] = [
  { value: "bus", label: "Bus" },
  { value: "van", label: "Van" },
];

const statusOptions: FieldOption[] = [
  { value: "active", label: "Active" },
  { value: "maintenance", label: "Maintenance" },
  { value: "inactive", label: "Inactive" },
];

const schema = z.object({
  vehicleNo: z.string().min(1, "Required"),
  type: z.string().min(1, "Required"),
  capacity: z.coerce.number().min(1, "Required"),
  model: z.string().optional(),
});

export const vehicleResource: ResourceConfig<"vehicles"> = {
  key: "vehicles",
  collection: "vehicles",
  icon: Bus,
  titleKey: "Vehicles",
  singularKey: "Vehicle",
  service: vehicleService,
  searchText: (v) => `${v.vehicleNo} ${v.type} ${v.model ?? ""} ${driverName(v)}`.toLowerCase(),
  defaultSort: { key: "vehicleNo" },
  columns: [
    { key: "vehicleNo", header: "Vehicle No", accessor: (v) => v.vehicleNo, mono: true, sortable: true },
    { key: "type", header: "Type", accessor: (v) => v.type, sortable: true, cell: (v) => <span className="capitalize">{v.type}</span> },
    { key: "capacity", header: "Capacity", accessor: (v) => v.capacity, sortable: true, align: "right" },
    { key: "model", header: "Model", accessor: (v) => v.model ?? "—", hideBelow: "md" },
    { key: "driver", header: "Driver", accessor: driverName, cell: (v) => driverName(v) },
    { key: "status", header: "Status", accessor: (v) => v.status, sortable: true, cell: (v) => <StatusPill status={v.status} /> },
  ],
  filters: [
    { key: "status", labelKey: "Status", type: "select", options: statusOptions },
    { key: "type", labelKey: "Type", type: "select", options: typeOptions },
  ],
  form: {
    schema,
    modalSize: "md",
    defaults: () => ({ type: "bus", status: "active", capacity: 30 }),
    fields: [
      { type: "text", name: "vehicleNo", label: "Vehicle No", required: true, mono: true },
      { type: "select", name: "type", label: "Type", required: true, options: typeOptions },
      { type: "number", name: "capacity", label: "Capacity", required: true },
      { type: "text", name: "model", label: "Model" },
    ],
  },
  permissions: {
    view: "transport.view",
    create: "transport.manage",
    edit: "transport.manage",
    delete: "delete.execute",
    deleteEntity: "vehicles",
    export: true,
  },
  exportable: { excel: true, pdf: true },
};
