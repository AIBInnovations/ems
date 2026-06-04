import { z } from "zod";
import { Trophy } from "lucide-react";
import { db } from "@/data/db";
import { teamService } from "@/data/services";
import type { FieldOption, ResourceConfig, Team } from "@/types";

const genderOptions: FieldOption[] = [
  { value: "male", label: "Male" },
  { value: "female", label: "Female" },
  { value: "mixed", label: "Mixed" },
];

const activityName = (t: Team): string => db.getById("activities", t.activityId)?.name ?? "—";

const schema = z.object({
  name: z.string().min(1, "Required"),
  ageGroup: z.string().optional(),
  gender: z.string().optional(),
});

export const teamResource: ResourceConfig<"teams"> = {
  key: "teams",
  collection: "teams",
  icon: Trophy,
  titleKey: "Teams",
  singularKey: "Team",
  service: teamService,
  searchText: (t) => `${t.name} ${t.ageGroup ?? ""} ${t.gender ?? ""}`.toLowerCase(),
  defaultSort: { key: "name" },
  columns: [
    { key: "name", header: "Name", accessor: (t) => t.name, sortable: true },
    { key: "activity", header: "Activity", accessor: activityName, cell: (t) => activityName(t) },
    { key: "ageGroup", header: "Age Group", accessor: (t) => t.ageGroup ?? "—", hideBelow: "sm" },
    {
      key: "gender",
      header: "Gender",
      accessor: (t) => t.gender ?? "",
      cell: (t) => <span className="capitalize">{t.gender ?? "—"}</span>,
      hideBelow: "md",
    },
    {
      key: "players",
      header: "Players",
      align: "right",
      accessor: (t) => t.playerStudentIds.length,
      cell: (t) => t.playerStudentIds.length,
    },
  ],
  filters: [
    { key: "gender", labelKey: "Gender", type: "select", options: genderOptions },
  ],
  form: {
    schema,
    defaults: () => ({ playerStudentIds: [] }),
    fields: [
      { type: "text", name: "name", label: "Name", required: true },
      { type: "text", name: "ageGroup", label: "Age Group" },
      { type: "select", name: "gender", label: "Gender", options: genderOptions },
    ],
  },
  permissions: {
    view: "sports.view",
    create: "sports.manage",
    edit: "sports.manage",
    delete: "delete.execute",
    deleteEntity: "teams",
    export: true,
  },
  exportable: { excel: true, pdf: true },
};
