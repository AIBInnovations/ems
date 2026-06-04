import { z } from "zod";
import { Trophy } from "lucide-react";
import { db } from "@/data/db";
import { activityService } from "@/data/services";
import { fullName } from "@/lib/format";
import type { Activity, FieldOption, ResourceConfig } from "@/types";

const categoryOptions: FieldOption[] = [
  { value: "sport", label: "Sport" },
  { value: "cultural", label: "Cultural" },
  { value: "martial", label: "Martial" },
  { value: "aquatic", label: "Aquatic" },
  { value: "other", label: "Other" },
];

const coachName = (a: Activity): string => {
  const coach = a.coachStaffId ? db.getById("staff", a.coachStaffId) : undefined;
  return coach ? fullName(coach.firstName, coach.lastName) : "—";
};

const schema = z.object({
  name: z.string().min(1, "Required"),
  category: z.string().min(1, "Required"),
  description: z.string().optional(),
});

export const activityResource: ResourceConfig<"activities"> = {
  key: "activities",
  collection: "activities",
  icon: Trophy,
  titleKey: "Activities",
  singularKey: "Activity",
  service: activityService,
  searchText: (a) => `${a.name} ${a.category} ${a.description ?? ""}`.toLowerCase(),
  defaultSort: { key: "name" },
  columns: [
    { key: "name", header: "Name", accessor: (a) => a.name, sortable: true },
    {
      key: "category",
      header: "Category",
      accessor: (a) => a.category,
      cell: (a) => <span className="capitalize">{a.category}</span>,
      sortable: true,
    },
    { key: "coach", header: "Coach", accessor: coachName, cell: (a) => coachName(a) },
    {
      key: "description",
      header: "Description",
      hideBelow: "lg",
      accessor: (a) => a.description ?? "",
      cell: (a) => <span className="text-muted-foreground">{a.description ?? "—"}</span>,
    },
  ],
  filters: [
    { key: "category", labelKey: "Category", type: "select", options: categoryOptions },
  ],
  form: {
    schema,
    defaults: () => ({ category: "sport", schedule: [] }),
    fields: [
      { type: "text", name: "name", label: "Name", required: true },
      { type: "select", name: "category", label: "Category", required: true, options: categoryOptions },
      { type: "textarea", name: "description", label: "Description", col: 2 },
    ],
  },
  permissions: {
    view: "sports.view",
    create: "sports.manage",
    edit: "sports.manage",
    delete: "delete.execute",
    deleteEntity: "activities",
    export: true,
  },
  exportable: { excel: true, pdf: true },
};
