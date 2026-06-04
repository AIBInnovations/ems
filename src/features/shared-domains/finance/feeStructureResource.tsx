import { z } from "zod";
import { Wallet } from "lucide-react";
import { db } from "@/data/db";
import { feeStructureService } from "@/data/services";
import { formatMoney } from "@/lib/format";
import type { FeeStructure, FieldOption, ResourceConfig } from "@/types";

const applicableToOptions: FieldOption[] = [
  { value: "class", label: "Class" },
  { value: "all", label: "All" },
  { value: "custom", label: "Custom" },
];

const totalOf = (f: FeeStructure) => f.items.reduce((sum, i) => sum + i.amount, 0);

const schema = z.object({
  name: z.string().min(1, "Required"),
  applicableTo: z.string().optional(),
});

export const feeStructureResource: ResourceConfig<"feeStructures"> = {
  key: "feeStructures",
  collection: "feeStructures",
  icon: Wallet,
  titleKey: "Fee Structures",
  singularKey: "Fee Structure",
  service: feeStructureService,
  searchText: (f) => `${f.name} ${f.applicableTo}`.toLowerCase(),
  defaultSort: { key: "name" },
  columns: [
    { key: "name", header: "Name", accessor: (f) => f.name, sortable: true },
    { key: "applicableTo", header: "Applicable To", accessor: (f) => f.applicableTo, cell: (f) => <span className="capitalize">{f.applicableTo}</span>, sortable: true },
    { key: "heads", header: "Heads", accessor: (f) => f.items.length, cell: (f) => `${f.items.length} heads`, align: "right" },
    { key: "total", header: "Total", accessor: (f) => totalOf(f), cell: (f) => formatMoney(totalOf(f)), align: "right", mono: true, sortable: true },
  ],
  filters: [
    { key: "applicableTo", labelKey: "Applicable To", type: "select", options: applicableToOptions },
  ],
  form: {
    schema,
    modalSize: "md",
    defaults: () => ({ applicableTo: "class", items: [], academicYearId: db.query("academicYears", (a) => a.isCurrent)[0]?.id }),
    fields: [
      { type: "text", name: "name", label: "Name", required: true },
      { type: "select", name: "applicableTo", label: "Applicable To", options: applicableToOptions },
    ],
  },
  permissions: {
    view: "fee.view",
    create: "fee.structure",
    edit: "fee.structure",
    delete: "delete.execute",
    deleteEntity: "feeStructures",
    export: true,
  },
  exportable: { excel: true, pdf: true },
};
