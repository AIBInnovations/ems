import { z } from "zod";
import { Trophy } from "lucide-react";
import { db } from "@/data/db";
import { equipmentService } from "@/data/services";
import { StatusPill } from "@/components/shared/StatusPill";
import type { Equipment, FieldOption, ResourceConfig } from "@/types";

const statusOptions: FieldOption[] = [
  { value: "available", label: "Available" },
  { value: "issued", label: "Issued" },
  { value: "damaged", label: "Damaged" },
];

const activityName = (e: Equipment): string => db.getById("activities", e.activityId)?.name ?? "—";

const schema = z.object({
  name: z.string().min(1, "Required"),
  quantity: z.coerce.number().min(0).optional(),
  condition: z.string().optional(),
});

export const equipmentResource: ResourceConfig<"equipment"> = {
  key: "equipment",
  collection: "equipment",
  icon: Trophy,
  titleKey: "Sports Equipment",
  singularKey: "Equipment",
  service: equipmentService,
  searchText: (e) => `${e.name} ${e.condition} ${e.status}`.toLowerCase(),
  defaultSort: { key: "name" },
  columns: [
    { key: "name", header: "Name", accessor: (e) => e.name, sortable: true },
    { key: "activity", header: "Activity", accessor: activityName, cell: (e) => activityName(e) },
    {
      key: "quantity",
      header: "Quantity",
      align: "right",
      accessor: (e) => e.quantity,
      cell: (e) => e.quantity,
      sortable: true,
    },
    { key: "condition", header: "Condition", accessor: (e) => e.condition, hideBelow: "md" },
    { key: "status", header: "Status", accessor: (e) => e.status, cell: (e) => <StatusPill status={e.status} /> },
  ],
  filters: [
    { key: "status", labelKey: "Status", type: "select", options: statusOptions },
  ],
  form: {
    schema,
    defaults: () => ({ quantity: 1, condition: "good", status: "available" }),
    fields: [
      { type: "text", name: "name", label: "Name", required: true },
      { type: "number", name: "quantity", label: "Quantity" },
      { type: "text", name: "condition", label: "Condition" },
    ],
  },
  permissions: {
    view: "sports.view",
    create: "sports.manage",
    edit: "sports.manage",
    delete: "delete.execute",
    deleteEntity: "equipment",
    export: true,
  },
  exportable: { excel: true, pdf: true },
};
