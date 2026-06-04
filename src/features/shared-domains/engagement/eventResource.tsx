import { z } from "zod";
import { CalendarDays } from "lucide-react";
import { eventService } from "@/data/services";
import { formatDate } from "@/lib/format";
import { StatusPill } from "@/components/shared/StatusPill";
import type { FieldOption, ResourceConfig } from "@/types";

const typeOptions: FieldOption[] = [
  { value: "academic", label: "Academic" },
  { value: "cultural", label: "Cultural" },
  { value: "sports", label: "Sports" },
  { value: "meeting", label: "Meeting" },
  { value: "ptm", label: "PTM" },
  { value: "holiday", label: "Holiday" },
];

const audienceOptions: FieldOption[] = [
  { value: "all", label: "All" },
  { value: "parents", label: "Parents" },
  { value: "students", label: "Students" },
];

const statusOptions: FieldOption[] = [
  { value: "planned", label: "Planned" },
  { value: "approved", label: "Approved" },
  { value: "done", label: "Done" },
];

const schema = z.object({
  title: z.string().min(1, "Required"),
  description: z.string().optional(),
  date: z.string().min(1, "Required"),
  endDate: z.string().optional(),
  type: z.string().min(1, "Select a type"),
  audience: z.string().optional(),
  venue: z.string().optional(),
});

export const eventResource: ResourceConfig<"events"> = {
  key: "events",
  collection: "events",
  icon: CalendarDays,
  titleKey: "Events",
  singularKey: "Event",
  service: eventService,
  searchText: (e) => `${e.title} ${e.description ?? ""} ${e.venue ?? ""}`.toLowerCase(),
  defaultSort: { key: "date", desc: true },
  columns: [
    {
      key: "title",
      header: "Event",
      accessor: (e) => e.title,
      cell: (e) => (
        <div className="min-w-0">
          <p className="truncate font-medium">{e.title}</p>
          {e.venue ? <p className="truncate text-xs text-muted-foreground">{e.venue}</p> : null}
        </div>
      ),
    },
    { key: "type", header: "Type", accessor: (e) => e.type, cell: (e) => <span className="capitalize">{e.type}</span> },
    { key: "date", header: "Date", accessor: (e) => e.date, cell: (e) => formatDate(e.date), sortable: true },
    {
      key: "audience",
      header: "Audience",
      hideBelow: "md",
      accessor: (e) => e.audience,
      cell: (e) => <span className="capitalize">{e.audience}</span>,
    },
    {
      key: "status",
      header: "Status",
      accessor: (e) => e.status ?? "",
      cell: (e) => (e.status ? <StatusPill status={e.status} /> : "—"),
    },
  ],
  filters: [
    { key: "type", labelKey: "Type", type: "select", options: typeOptions },
    { key: "status", labelKey: "Status", type: "select", options: statusOptions },
  ],
  form: {
    schema,
    modalSize: "md",
    defaults: () => ({ type: "academic", audience: "all", status: "planned", attachments: [] }),
    fields: [
      { type: "text", name: "title", label: "Title", required: true },
      { type: "textarea", name: "description", label: "Description", col: 2 },
      { type: "date", name: "date", label: "Date", required: true },
      { type: "date", name: "endDate", label: "End Date" },
      { type: "select", name: "type", label: "Type", required: true, options: typeOptions },
      { type: "select", name: "audience", label: "Audience", options: audienceOptions },
      { type: "text", name: "venue", label: "Venue" },
    ],
  },
  permissions: {
    view: "event.manage",
    create: "event.manage",
    edit: "event.manage",
    delete: "delete.execute",
    deleteEntity: "events",
    export: true,
  },
  exportable: { excel: true, pdf: true },
};
