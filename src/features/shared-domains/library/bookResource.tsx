import { z } from "zod";
import { BookOpen } from "lucide-react";
import { db } from "@/data/db";
import { bookService } from "@/data/services";
import type { FieldOption, ResourceConfig } from "@/types";

const categoryOptions = (): FieldOption[] => {
  const seen = new Set<string>();
  for (const b of db.getAll("books")) if (b.category) seen.add(b.category);
  return [...seen].sort().map((c) => ({ value: c, label: c }));
};

const languageOptions = (): FieldOption[] => {
  const seen = new Set<string>();
  for (const b of db.getAll("books")) if (b.language) seen.add(b.language);
  return [...seen].sort().map((l) => ({ value: l, label: l }));
};

const schema = z.object({
  title: z.string().min(1, "Required"),
  author: z.string().min(1, "Required"),
  isbn: z.string().optional(),
  publisher: z.string().optional(),
  category: z.string().min(1, "Required"),
  language: z.string().min(1, "Required"),
  totalCopies: z.coerce.number().min(0, "Required"),
  availableCopies: z.coerce.number().min(0).optional(),
  shelf: z.string().optional(),
  isDigital: z.boolean().optional(),
});

export const bookResource: ResourceConfig<"books"> = {
  key: "books",
  collection: "books",
  icon: BookOpen,
  titleKey: "Book Catalog",
  singularKey: "Book",
  service: bookService,
  searchText: (b) => `${b.title} ${b.author} ${b.isbn} ${b.category}`.toLowerCase(),
  defaultSort: { key: "title" },
  columns: [
    {
      key: "title",
      header: "Title",
      accessor: (b) => b.title,
      cell: (b) => (
        <div className="min-w-0">
          <p className="truncate font-medium">{b.title}</p>
          <p className="truncate text-xs text-muted-foreground">{b.author}</p>
        </div>
      ),
    },
    { key: "isbn", header: "ISBN", accessor: (b) => b.isbn, mono: true, hideBelow: "lg" },
    { key: "category", header: "Category", accessor: (b) => b.category, sortable: true },
    { key: "language", header: "Language", accessor: (b) => b.language, hideBelow: "md" },
    {
      key: "copies",
      header: "Copies",
      align: "right",
      accessor: (b) => `${b.availableCopies}/${b.totalCopies}`,
      mono: true,
    },
    { key: "shelf", header: "Shelf", accessor: (b) => b.shelf ?? "", hideBelow: "lg" },
  ],
  filters: [
    { key: "category", labelKey: "Category", type: "select", options: categoryOptions },
    { key: "language", labelKey: "Language", type: "select", options: languageOptions },
  ],
  form: {
    schema,
    modalSize: "lg",
    defaults: () => ({ language: "English", isDigital: false, totalCopies: 1, availableCopies: 1 }),
    fields: [
      { type: "section", label: "Book details" },
      { type: "text", name: "title", label: "Title", required: true, col: 2 },
      { type: "text", name: "author", label: "Author", required: true },
      { type: "text", name: "isbn", label: "ISBN", mono: true },
      { type: "text", name: "publisher", label: "Publisher" },
      { type: "text", name: "category", label: "Category", required: true },
      { type: "text", name: "language", label: "Language", required: true },
      { type: "section", label: "Inventory" },
      { type: "number", name: "totalCopies", label: "Total Copies", required: true },
      { type: "number", name: "availableCopies", label: "Available Copies" },
      { type: "text", name: "shelf", label: "Shelf" },
      { type: "switch", name: "isDigital", label: "Digital" },
    ],
  },
  permissions: {
    view: "library.view",
    create: "library.manage",
    edit: "library.manage",
    delete: "delete.execute",
    deleteEntity: "books",
    export: true,
  },
  exportable: { excel: true, pdf: true },
};
