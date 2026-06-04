import { z } from "zod";
import { CalendarDays } from "lucide-react";
import { db } from "@/data/db";
import { appointmentService } from "@/data/services";
import { formatDateTime, fullName } from "@/lib/format";
import { StatusPill } from "@/components/shared/StatusPill";
import type { Appointment, ResourceConfig } from "@/types";

const staffName = (a: Appointment) => {
  const s = db.getById("staff", a.withStaffId);
  return s ? fullName(s.firstName, s.lastName) : "—";
};

const schema = z.object({
  requestedByName: z.string().min(1, "Required"),
  phone: z.string().min(1, "Required"),
  purpose: z.string().min(1, "Required"),
});

export const appointmentResource: ResourceConfig<"appointments"> = {
  key: "appointments",
  collection: "appointments",
  icon: CalendarDays,
  titleKey: "Appointments",
  singularKey: "Appointment",
  service: appointmentService,
  searchText: (a) => `${a.requestedByName} ${a.phone} ${a.purpose}`.toLowerCase(),
  defaultSort: { key: "dateTime", desc: true },
  columns: [
    {
      key: "requestedByName",
      header: "Requested By",
      accessor: (a) => a.requestedByName,
      cell: (a) => (
        <div className="min-w-0">
          <p className="truncate font-medium">{a.requestedByName}</p>
          <p className="font-mono text-xs text-muted-foreground">{a.phone}</p>
        </div>
      ),
    },
    { key: "with", header: "With", accessor: staffName, cell: (a) => staffName(a) },
    { key: "purpose", header: "Purpose", accessor: (a) => a.purpose, hideBelow: "md" },
    { key: "dateTime", header: "Date & Time", accessor: (a) => a.dateTime, cell: (a) => formatDateTime(a.dateTime), sortable: true },
    { key: "status", header: "Status", accessor: (a) => a.status, cell: (a) => <StatusPill status={a.status} /> },
  ],
  filters: [
    {
      key: "status",
      labelKey: "Status",
      type: "select",
      options: [
        { value: "requested", label: "Requested" },
        { value: "confirmed", label: "Confirmed" },
        { value: "done", label: "Done" },
        { value: "cancelled", label: "Cancelled" },
      ],
    },
  ],
  form: {
    schema,
    modalSize: "md",
    defaults: () => ({ status: "requested", dateTime: new Date().toISOString() }),
    fields: [
      { type: "text", name: "requestedByName", label: "Requested By", required: true },
      { type: "tel", name: "phone", label: "Phone", required: true },
      { type: "text", name: "purpose", label: "Purpose", required: true, col: 2 },
    ],
  },
  permissions: {
    view: "appointment.manage",
    create: "appointment.manage",
    edit: "appointment.manage",
    delete: "delete.execute",
    deleteEntity: "appointments",
    export: true,
  },
  exportable: { excel: true, pdf: true },
};
