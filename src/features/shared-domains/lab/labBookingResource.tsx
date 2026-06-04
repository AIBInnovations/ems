import { z } from "zod";
import { FlaskConical } from "lucide-react";
import { formatDate } from "@/lib/format";
import { StatusPill } from "@/components/shared/StatusPill";
import type { FieldOption, ResourceConfig } from "@/types";
import { labBookingService } from "@/data/services";

const labTypeOptions: FieldOption[] = [
  { value: "physics", label: "Physics" },
  { value: "chemistry", label: "Chemistry" },
  { value: "biology", label: "Biology" },
  { value: "computer", label: "Computer" },
  { value: "other", label: "Other" },
];

const statusOptions: FieldOption[] = [
  { value: "requested", label: "Requested" },
  { value: "approved", label: "Approved" },
  { value: "rejected", label: "Rejected" },
  { value: "done", label: "Done" },
];

const schema = z.object({
  labType: z.string().min(1, "Required"),
  date: z.string().min(1, "Required"),
  startTime: z.string().min(1, "Required"),
  endTime: z.string().min(1, "Required"),
  purpose: z.string().optional(),
  status: z.string().min(1, "Required"),
  teacherStaffId: z.string().optional(),
});

export const labBookingResource: ResourceConfig<"labBookings"> = {
  key: "labBookings",
  collection: "labBookings",
  icon: FlaskConical,
  titleKey: "Lab Bookings",
  singularKey: "Booking",
  service: labBookingService,
  searchText: (b) => `${b.labType} ${b.purpose ?? ""} ${b.status}`.toLowerCase(),
  defaultSort: { key: "date", desc: true },
  columns: [
    { key: "labType", header: "Lab", accessor: (b) => b.labType, cell: (b) => <span className="capitalize">{b.labType}</span> },
    { key: "date", header: "Date", accessor: (b) => b.date, cell: (b) => formatDate(b.date), sortable: true },
    { key: "time", header: "Time", mono: true, accessor: (b) => `${b.startTime} - ${b.endTime}` },
    { key: "purpose", header: "Purpose", hideBelow: "md", accessor: (b) => b.purpose ?? "—" },
    { key: "status", header: "Status", accessor: (b) => b.status, cell: (b) => <StatusPill status={b.status} /> },
  ],
  filters: [
    { key: "status", labelKey: "Status", type: "select", options: statusOptions },
    { key: "labType", labelKey: "Lab Type", type: "select", options: labTypeOptions },
  ],
  form: {
    schema,
    defaults: () => ({ status: "requested", labType: "physics" }),
    fields: [
      { type: "select", name: "labType", label: "Lab Type", required: true, options: labTypeOptions },
      { type: "date", name: "date", label: "Date", required: true },
      { type: "time", name: "startTime", label: "Start Time", required: true },
      { type: "time", name: "endTime", label: "End Time", required: true },
      { type: "select", name: "status", label: "Status", required: true, options: statusOptions },
      { type: "text", name: "teacherStaffId", label: "Teacher" },
      { type: "textarea", name: "purpose", label: "Purpose", col: 2 },
    ],
  },
  permissions: {
    view: "lab.view",
    create: "lab.booking",
    edit: "lab.booking",
    delete: "delete.execute",
    deleteEntity: "labBookings",
    export: true,
  },
  exportable: { excel: true, pdf: true },
};
