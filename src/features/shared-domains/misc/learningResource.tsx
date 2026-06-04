import { z } from "zod";
import { BookMarked } from "lucide-react";
import { learningResourceService } from "@/data/services";
import type { FieldOption, ResourceConfig } from "@/types";

const kindOptions: FieldOption[] = [
  { value: "video", label: "Video" },
  { value: "audio", label: "Audio" },
  { value: "pdf", label: "PDF" },
  { value: "image", label: "Image" },
  { value: "link", label: "Link" },
];

const visibleToOptions: FieldOption[] = [
  { value: "class", label: "Class" },
  { value: "all", label: "All" },
];

const schema = z.object({
  title: z.string().min(1, "Required"),
  kind: z.string().min(1, "Required"),
  url: z.string().optional(),
  visibleTo: z.string().optional(),
});

export const learningResource: ResourceConfig<"learningResources"> = {
  key: "learningResources",
  collection: "learningResources",
  icon: BookMarked,
  titleKey: "Learning Resources",
  singularKey: "Resource",
  service: learningResourceService,
  searchText: (r) => `${r.title} ${r.kind}`.toLowerCase(),
  defaultSort: { key: "title" },
  columns: [
    { key: "title", header: "Title", accessor: (r) => r.title },
    { key: "kind", header: "Kind", accessor: (r) => r.kind, cell: (r) => <span className="capitalize">{r.kind}</span> },
    { key: "visibleTo", header: "Visible To", accessor: (r) => r.visibleTo, cell: (r) => <span className="capitalize">{r.visibleTo}</span> },
    { key: "sizeMB", header: "Size", accessor: (r) => r.sizeMB ?? "", cell: (r) => (r.sizeMB != null ? `${r.sizeMB} MB` : "—"), align: "right", mono: true },
  ],
  filters: [
    { key: "kind", labelKey: "Kind", type: "select", options: kindOptions },
  ],
  form: {
    schema,
    defaults: () => ({ kind: "link", visibleTo: "class" }),
    fields: [
      { type: "text", name: "title", label: "Title", required: true },
      { type: "select", name: "kind", label: "Kind", required: true, options: kindOptions },
      { type: "text", name: "url", label: "URL" },
      { type: "select", name: "visibleTo", label: "Visible To", options: visibleToOptions },
    ],
  },
  permissions: {
    view: "learning.manage",
    create: "learning.manage",
    edit: "learning.manage",
    delete: "delete.execute",
    deleteEntity: "learningResources",
    export: true,
  },
  exportable: { excel: true, pdf: true },
};
