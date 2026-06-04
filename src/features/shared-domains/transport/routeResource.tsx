import { z } from "zod";
import { Route } from "lucide-react";
import { db } from "@/data/db";
import { routeService } from "@/data/services";
import type { ResourceConfig, Route as RouteEntity } from "@/types";

const vehicleNo = (r: RouteEntity): string => db.getById("vehicles", r.vehicleId)?.vehicleNo ?? "—";

const schema = z.object({
  name: z.string().min(1, "Required"),
  distanceKm: z.coerce.number().min(0).optional(),
  speedLimitKmph: z.coerce.number().min(0).optional(),
});

export const routeResource: ResourceConfig<"routes"> = {
  key: "routes",
  collection: "routes",
  icon: Route,
  titleKey: "Routes",
  singularKey: "Route",
  service: routeService,
  searchText: (r) => `${r.name} ${vehicleNo(r)}`.toLowerCase(),
  defaultSort: { key: "name" },
  columns: [
    { key: "name", header: "Route", accessor: (r) => r.name, sortable: true },
    { key: "vehicle", header: "Vehicle", accessor: vehicleNo, cell: (r) => vehicleNo(r), mono: true },
    { key: "stops", header: "Stops", accessor: (r) => r.stopIds.length, sortable: true, align: "right" },
    { key: "distanceKm", header: "Distance", accessor: (r) => r.distanceKm, sortable: true, align: "right", cell: (r) => `${r.distanceKm} km` },
    { key: "speedLimitKmph", header: "Speed Limit", accessor: (r) => r.speedLimitKmph, sortable: true, align: "right", cell: (r) => `${r.speedLimitKmph} km/h` },
  ],
  form: {
    schema,
    modalSize: "md",
    defaults: () => ({ stopIds: [], distanceKm: 0, speedLimitKmph: 80 }),
    fields: [
      { type: "text", name: "name", label: "Route Name", required: true },
      { type: "number", name: "distanceKm", label: "Distance (km)" },
      { type: "number", name: "speedLimitKmph", label: "Speed Limit (km/h)" },
    ],
  },
  permissions: {
    view: "transport.view",
    create: "transport.manage",
    edit: "transport.manage",
    delete: "delete.execute",
    deleteEntity: "routes",
    export: true,
  },
  exportable: { excel: true, pdf: true },
};
