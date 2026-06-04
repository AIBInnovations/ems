import { z } from "zod";
import { School } from "lucide-react";
import { db } from "@/data/db";
import { classService } from "@/data/services";
import { fullName } from "@/lib/format";
import type { ResourceConfig, FieldOption, Class } from "@/types";

const academicYearOptions = (): FieldOption[] =>
  db.getAll("academicYears").map((y) => ({ value: y.id, label: y.name }));

const staffOptions = (): FieldOption[] =>
  db.getAll("staff").map((s) => ({ value: s.id, label: fullName(s.firstName, s.lastName) }));

const classTeacherName = (c: Class): string => {
  const s = c.classTeacherStaffId ? db.getById("staff", c.classTeacherStaffId) : null;
  return s ? fullName(s.firstName, s.lastName) : "—";
};

const schema = z.object({
  name: z.string().min(1, "Required"),
  numericLevel: z.coerce.number().min(0, "Required"),
  academicYearId: z.string().optional(),
  classTeacherStaffId: z.string().optional(),
});

export const classResource: ResourceConfig<"classes"> = {
  key: "classes",
  collection: "classes",
  icon: School,
  titleKey: "Classes",
  singularKey: "Class",
  service: classService,
  searchText: (c) => `${c.name}`,
  defaultSort: { key: "numericLevel" },
  columns: [
    { key: "name", header: "Class", accessor: (c) => c.name, sortable: true },
    { key: "numericLevel", header: "Level", accessor: (c) => c.numericLevel, align: "right", sortable: true },
    { key: "sections", header: "Sections", accessor: (c) => `${c.sectionIds.length} sections`, align: "right" },
    { key: "subjects", header: "Subjects", accessor: (c) => c.subjectIds.length, align: "right", hideBelow: "md" },
    { key: "classTeacher", header: "Class Teacher", accessor: classTeacherName, cell: (c) => classTeacherName(c), hideBelow: "lg" },
  ],
  filters: [
    { key: "academicYearId", labelKey: "Academic Year", type: "select", options: academicYearOptions },
  ],
  form: {
    schema,
    modalSize: "md",
    defaults: () => ({
      sectionIds: [],
      subjectIds: [],
      academicYearId: db.query("academicYears", (a) => a.isCurrent)[0]?.id,
    }),
    fields: [
      { type: "text", name: "name", label: "Class Name", required: true },
      { type: "number", name: "numericLevel", label: "Numeric Level", required: true },
      { type: "select", name: "academicYearId", label: "Academic Year", options: academicYearOptions },
      { type: "select", name: "classTeacherStaffId", label: "Class Teacher", options: staffOptions },
    ],
  },
  permissions: {
    view: "class.manage",
    create: "class.manage",
    edit: "class.manage",
    delete: "delete.execute",
    deleteEntity: "classes",
    export: true,
  },
  exportable: { excel: true, pdf: true },
};
