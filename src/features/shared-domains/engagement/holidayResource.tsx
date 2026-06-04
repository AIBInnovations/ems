import { z } from "zod";
import { CalendarDays } from "lucide-react";
import { holidayService } from "@/data/services";
import { formatDate } from "@/lib/format";
import type { FieldOption, ResourceConfig } from "@/types";

const typeOptions: FieldOption[] = [
  { value: "national", label: "National" },
  { value: "festival", label: "Festival" },
  { value: "school", label: "School" },
  { value: "optional", label: "Optional" },
];

const schema = z.object({
  name: z.string().min(1, "Required"),
  date: z.string().min(1, "Required"),
  type: z.string().min(1, "Select a type"),
  recurring: z.boolean().optional(),
});

export const holidayResource: ResourceConfig<"holidays"> = {
  key: "holidays",
  collection: "holidays",
  icon: CalendarDays,
  titleKey: "Holiday Calendar",
  singularKey: "Holiday",
  service: holidayService,
  searchText: (h) => `${h.name} ${h.type}`.toLowerCase(),
  defaultSort: { key: "date" },
  columns: [
    { key: "name", header: "Holiday", accessor: (h) => h.name, cell: (h) => <span className="font-medium">{h.name}</span> },
    { key: "date", header: "Date", accessor: (h) => h.date, cell: (h) => formatDate(h.date), sortable: true },
    { key: "type", header: "Type", accessor: (h) => h.type, cell: (h) => <span className="capitalize">{h.type}</span> },
    { key: "recurring", header: "Recurring", accessor: (h) => (h.recurring ? "Yes" : "No"), hideBelow: "sm" },
  ],
  filters: [{ key: "type", labelKey: "Type", type: "select", options: typeOptions }],
  form: {
    schema,
    modalSize: "sm",
    defaults: () => ({ type: "national", recurring: false }),
    fields: [
      { type: "text", name: "name", label: "Name", required: true },
      { type: "date", name: "date", label: "Date", required: true },
      { type: "select", name: "type", label: "Type", required: true, options: typeOptions },
      { type: "switch", name: "recurring", label: "Recurring every year" },
    ],
  },
  permissions: {
    view: "event.manage",
    create: "event.manage",
    edit: "event.manage",
    delete: "delete.execute",
    deleteEntity: "holidays",
    export: true,
  },
  exportable: { excel: true, pdf: true },
};
