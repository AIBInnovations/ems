import { Star } from "lucide-react";
import { db } from "@/data/db";
import { ratingService } from "@/data/services";
import { fullName } from "@/lib/format";
import type { FieldOption, ResourceConfig } from "@/types";

const targetTypeOptions: FieldOption[] = [
  { value: "teacher", label: "Teacher" },
  { value: "staff", label: "Staff" },
  { value: "service", label: "Service" },
];

const targetLabel = (targetId: string): string => {
  const s = db.getById("staff", targetId);
  return s ? fullName(s.firstName, s.lastName) : targetId;
};

export const ratingResource: ResourceConfig<"ratings"> = {
  key: "ratings",
  collection: "ratings",
  icon: Star,
  titleKey: "Ratings & Feedback",
  singularKey: "Rating",
  service: ratingService,
  searchText: (r) => `${r.raterName} ${r.comment ?? ""} ${targetLabel(r.targetId)}`.toLowerCase(),
  defaultSort: { key: "stars", desc: true },
  columns: [
    {
      key: "target",
      header: "Target",
      accessor: (r) => targetLabel(r.targetId),
      cell: (r) => <span className="font-medium">{targetLabel(r.targetId)}</span>,
    },
    {
      key: "stars",
      header: "Stars",
      align: "right",
      accessor: (r) => r.stars,
      cell: (r) => (
        <span className="font-medium text-amber-500">{r.stars} ★</span>
      ),
      sortable: true,
    },
    { key: "rater", header: "Rated By", accessor: (r) => r.raterName },
    {
      key: "comment",
      header: "Comment",
      hideBelow: "md",
      accessor: (r) => r.comment ?? "",
      cell: (r) => <span className="text-muted-foreground">{r.comment ?? "—"}</span>,
    },
  ],
  filters: [{ key: "targetType", labelKey: "Target Type", type: "select", options: targetTypeOptions }],
  permissions: {
    view: "rating.view",
    delete: "delete.execute",
    deleteEntity: "ratings",
    export: true,
  },
  exportable: { excel: true, pdf: true },
};
