import { z } from "zod";
import { ClipboardList } from "lucide-react";
import { courierService } from "@/data/services";
import { formatDate, formatMoney } from "@/lib/format";
import { StatusPill } from "@/components/shared/StatusPill";
import type { ResourceConfig } from "@/types";

const schema = z.object({
  direction: z.string().min(1, "Required"),
  company: z.string().min(1, "Required"),
  party: z.string().min(1, "Required"),
  description: z.string().optional(),
  refNo: z.string().optional(),
  amount: z.coerce.number().optional(),
});

export const courierResource: ResourceConfig<"couriers"> = {
  key: "couriers",
  collection: "couriers",
  icon: ClipboardList,
  titleKey: "Courier Records",
  singularKey: "Courier",
  service: courierService,
  searchText: (c) => `${c.refNo} ${c.company} ${c.party} ${c.description}`.toLowerCase(),
  defaultSort: { key: "date", desc: true },
  columns: [
    { key: "refNo", header: "Ref No", accessor: (c) => c.refNo, mono: true },
    {
      key: "direction",
      header: "Direction",
      accessor: (c) => c.direction,
      cell: (c) => <span className="capitalize">{c.direction}</span>,
    },
    { key: "company", header: "Company", accessor: (c) => c.company },
    { key: "party", header: "Party", accessor: (c) => c.party, hideBelow: "md" },
    { key: "date", header: "Date", accessor: (c) => c.date, cell: (c) => formatDate(c.date), sortable: true },
    {
      key: "amount",
      header: "Amount",
      align: "right",
      mono: true,
      accessor: (c) => c.amount ?? null,
      cell: (c) => (c.amount != null ? formatMoney(c.amount) : "—"),
    },
    { key: "status", header: "Status", accessor: (c) => c.status, cell: (c) => <StatusPill status={c.status} /> },
  ],
  filters: [
    {
      key: "status",
      labelKey: "Status",
      type: "select",
      options: [
        { value: "received", label: "Received" },
        { value: "dispatched", label: "Dispatched" },
        { value: "delivered", label: "Delivered" },
        { value: "pending", label: "Pending" },
      ],
    },
    {
      key: "direction",
      labelKey: "Direction",
      type: "select",
      options: [
        { value: "inward", label: "Inward" },
        { value: "outward", label: "Outward" },
      ],
    },
  ],
  form: {
    schema,
    modalSize: "md",
    defaults: () => ({ direction: "inward", status: "received", date: new Date().toISOString() }),
    fields: [
      {
        type: "select",
        name: "direction",
        label: "Direction",
        required: true,
        options: [
          { value: "inward", label: "Inward" },
          { value: "outward", label: "Outward" },
        ],
      },
      { type: "text", name: "company", label: "Company", required: true },
      { type: "text", name: "party", label: "Party", required: true },
      { type: "text", name: "refNo", label: "Ref No", mono: true },
      { type: "number", name: "amount", label: "Amount" },
      { type: "textarea", name: "description", label: "Description", col: 2 },
    ],
  },
  permissions: {
    view: "courier.manage",
    create: "courier.manage",
    edit: "courier.manage",
    delete: "delete.execute",
    deleteEntity: "couriers",
    export: true,
  },
  exportable: { excel: true, pdf: true },
};
