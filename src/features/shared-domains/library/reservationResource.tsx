import { z } from "zod";
import { BookOpen } from "lucide-react";
import { db } from "@/data/db";
import { bookReservationService } from "@/data/services";
import { formatDate } from "@/lib/format";
import { StatusPill } from "@/components/shared/StatusPill";
import type { FieldOption, ResourceConfig } from "@/types";

const bookOptions = (): FieldOption[] =>
  db.getAll("books").map((b) => ({ value: b.id, label: b.title }));

const schema = z.object({
  bookId: z.string().min(1, "Select a book"),
  status: z.string().min(1, "Required"),
  queuePosition: z.coerce.number().min(0).optional(),
});

export const reservationResource: ResourceConfig<"bookReservations"> = {
  key: "bookReservations",
  collection: "bookReservations",
  icon: BookOpen,
  titleKey: "Reservations",
  singularKey: "Reservation",
  service: bookReservationService,
  searchText: (r) => `${db.getById("books", r.bookId)?.title ?? ""} ${r.status}`.toLowerCase(),
  defaultSort: { key: "reservedAt", desc: true },
  columns: [
    {
      key: "book",
      header: "Book",
      accessor: (r) => db.getById("books", r.bookId)?.title ?? "—",
      cell: (r) => <span className="font-medium">{db.getById("books", r.bookId)?.title ?? "—"}</span>,
    },
    { key: "queuePosition", header: "Queue", align: "right", accessor: (r) => r.queuePosition, mono: true },
    { key: "reservedAt", header: "Reserved", accessor: (r) => r.reservedAt, cell: (r) => formatDate(r.reservedAt) },
    { key: "status", header: "Status", accessor: (r) => r.status, cell: (r) => <StatusPill status={r.status} /> },
  ],
  filters: [
    {
      key: "status",
      labelKey: "Status",
      type: "select",
      options: [
        { value: "active", label: "Active" },
        { value: "fulfilled", label: "Fulfilled" },
        { value: "cancelled", label: "Cancelled" },
      ],
    },
  ],
  form: {
    schema,
    defaults: () => ({ status: "active", queuePosition: 1, reservedAt: new Date().toISOString() }),
    fields: [
      { type: "select", name: "bookId", label: "Book", required: true, options: bookOptions, col: 2 },
      {
        type: "select",
        name: "status",
        label: "Status",
        required: true,
        options: [
          { value: "active", label: "Active" },
          { value: "fulfilled", label: "Fulfilled" },
          { value: "cancelled", label: "Cancelled" },
        ],
      },
      { type: "number", name: "queuePosition", label: "Queue Position" },
    ],
  },
  permissions: {
    view: "library.view",
    create: "library.reserve",
    edit: "library.reserve",
    delete: "delete.execute",
    deleteEntity: "bookReservations",
    export: true,
  },
  exportable: { excel: true, pdf: true },
};
