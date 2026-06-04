import { z } from "zod";
import { FlaskConical } from "lucide-react";
import type { FieldOption, ResourceConfig } from "@/types";
import { labItemService } from "@/data/services";

const categoryOptions: FieldOption[] = [
  { value: "chemical", label: "Chemical" },
  { value: "apparatus", label: "Apparatus" },
  { value: "specimen", label: "Specimen" },
  { value: "equipment", label: "Equipment" },
];

const labTypeOptions: FieldOption[] = [
  { value: "physics", label: "Physics" },
  { value: "chemistry", label: "Chemistry" },
  { value: "biology", label: "Biology" },
  { value: "computer", label: "Computer" },
  { value: "other", label: "Other" },
];

const schema = z.object({
  name: z.string().min(1, "Required"),
  category: z.string().min(1, "Required"),
  labType: z.string().min(1, "Required"),
  quantity: z.coerce.number().min(0, "Required"),
  unit: z.string().optional(),
  reorderLevel: z.coerce.number().optional(),
  location: z.string().optional(),
  condition: z.string().optional(),
});

export const labItemResource: ResourceConfig<"labItems"> = {
  key: "labItems",
  collection: "labItems",
  icon: FlaskConical,
  titleKey: "Lab Inventory",
  singularKey: "Lab Item",
  service: labItemService,
  searchText: (i) => `${i.name} ${i.category} ${i.labType} ${i.location ?? ""}`.toLowerCase(),
  defaultSort: { key: "name" },
  columns: [
    { key: "name", header: "Name", accessor: (i) => i.name, sortable: true },
    { key: "category", header: "Category", accessor: (i) => i.category, cell: (i) => <span className="capitalize">{i.category}</span> },
    { key: "labType", header: "Lab", accessor: (i) => i.labType, cell: (i) => <span className="capitalize">{i.labType}</span> },
    {
      key: "quantity",
      header: "Quantity",
      align: "right",
      mono: true,
      accessor: (i) => i.quantity,
      sortable: true,
      cell: (i) => (
        <span className={i.quantity <= i.reorderLevel ? "font-medium text-destructive" : undefined}>
          {i.quantity} {i.unit}
        </span>
      ),
    },
    { key: "reorderLevel", header: "Reorder", align: "right", mono: true, hideBelow: "md", accessor: (i) => i.reorderLevel },
    { key: "location", header: "Location", hideBelow: "lg", accessor: (i) => i.location ?? "—" },
    { key: "condition", header: "Condition", accessor: (i) => i.condition, cell: (i) => <span className="capitalize">{i.condition}</span> },
  ],
  filters: [
    { key: "labType", labelKey: "Lab Type", type: "select", options: labTypeOptions },
    { key: "category", labelKey: "Category", type: "select", options: categoryOptions },
  ],
  form: {
    schema,
    defaults: () => ({ unit: "pcs", condition: "good", quantity: 0, reorderLevel: 0 }),
    fields: [
      { type: "text", name: "name", label: "Name", required: true, col: 2 },
      { type: "select", name: "category", label: "Category", required: true, options: categoryOptions },
      { type: "select", name: "labType", label: "Lab Type", required: true, options: labTypeOptions },
      { type: "number", name: "quantity", label: "Quantity", required: true },
      { type: "text", name: "unit", label: "Unit" },
      { type: "number", name: "reorderLevel", label: "Reorder Level" },
      { type: "text", name: "location", label: "Location" },
      { type: "text", name: "condition", label: "Condition" },
    ],
  },
  permissions: {
    view: "lab.view",
    create: "lab.manage",
    edit: "lab.manage",
    delete: "delete.execute",
    deleteEntity: "labItems",
    export: true,
  },
  exportable: { excel: true, pdf: true },
};
