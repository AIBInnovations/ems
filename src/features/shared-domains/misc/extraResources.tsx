import { z } from "zod";
import { CalendarCheck, GraduationCap, Image, Landmark } from "lucide-react";
import { db } from "@/data/db";
import {
  classroomActivityService,
  trainingService,
  gradeScaleService,
  reconciliationService,
} from "@/data/services";
import { StatusPill } from "@/components/shared/StatusPill";
import { formatDate, formatTime } from "@/lib/format";
import type { ResourceConfig } from "@/types";

export const classroomResource: ResourceConfig<"classroomActivities"> = {
  key: "classroomActivities",
  collection: "classroomActivities",
  icon: Image,
  titleKey: "Classroom Activities",
  singularKey: "Activity",
  service: classroomActivityService,
  searchText: (a) => `${a.title} ${a.type}`,
  defaultSort: { key: "date", desc: true },
  columns: [
    { key: "title", header: "Title", accessor: (a) => a.title, cell: (a) => <span className="font-medium">{a.title}</span> },
    { key: "type", header: "Type", accessor: (a) => a.type, cell: (a) => <span className="capitalize">{a.type}</span> },
    { key: "class", header: "Class", accessor: (a) => db.getById("classes", a.classId)?.name ?? "—" },
    { key: "date", header: "Date", accessor: (a) => a.date, cell: (a) => formatDate(a.date) },
    { key: "description", header: "Details", accessor: (a) => a.description, hideBelow: "md" },
  ],
  form: {
    schema: z.object({ title: z.string().min(1, "Required"), description: z.string().min(1, "Required"), date: z.string().min(1, "Required") }),
    fields: [
      { type: "text", name: "title", label: "Title", required: true },
      { type: "select", name: "type", label: "Type", options: ["lesson", "classwork", "homework", "photo", "note"].map((v) => ({ value: v, label: v })) },
      { type: "date", name: "date", label: "Date", required: true },
      { type: "textarea", name: "description", label: "Details", required: true, col: 2 },
    ],
    defaults: () => ({ type: "classwork", photos: [], date: new Date().toISOString().slice(0, 10) }),
  },
  permissions: { view: "classroom.post", create: "classroom.post", edit: "classroom.post", delete: "delete.execute", deleteEntity: "classroomActivities", export: true },
  exportable: { excel: true, pdf: true },
};

export const trainingResource: ResourceConfig<"trainingSessions"> = {
  key: "trainingSessions",
  collection: "trainingSessions",
  icon: CalendarCheck,
  titleKey: "Training Sessions",
  singularKey: "Session",
  service: trainingService,
  searchText: (t) => `${db.getById("activities", t.activityId)?.name ?? ""} ${t.focus ?? ""}`,
  defaultSort: { key: "date", desc: true },
  columns: [
    { key: "activity", header: "Activity", accessor: (t) => db.getById("activities", t.activityId)?.name ?? "—" },
    { key: "date", header: "Date", accessor: (t) => t.date, cell: (t) => formatDate(t.date) },
    { key: "time", header: "Time", accessor: (t) => t.startTime, cell: (t) => `${formatTime(t.startTime)}–${formatTime(t.endTime)}`, hideBelow: "sm" },
    { key: "venue", header: "Venue", accessor: (t) => t.venue ?? "—", hideBelow: "md" },
    { key: "focus", header: "Focus", accessor: (t) => t.focus ?? "—", hideBelow: "lg" },
    { key: "attendance", header: "Present", accessor: (t) => t.attendance.filter((a) => a.present).length, align: "right" },
  ],
  form: {
    schema: z.object({ date: z.string().min(1, "Required"), startTime: z.string().min(1), endTime: z.string().min(1) }),
    fields: [
      { type: "date", name: "date", label: "Date", required: true },
      { type: "time", name: "startTime", label: "Start", required: true },
      { type: "time", name: "endTime", label: "End", required: true },
      { type: "text", name: "venue", label: "Venue" },
      { type: "text", name: "focus", label: "Focus", col: 2 },
    ],
    defaults: () => ({ attendance: [] }),
  },
  permissions: { view: "sports.view", create: "sports.manage", edit: "sports.manage", delete: "delete.execute", deleteEntity: "trainingSessions", export: true },
  exportable: { excel: true, pdf: true },
};

export const gradeScaleResource: ResourceConfig<"gradeScales"> = {
  key: "gradeScales",
  collection: "gradeScales",
  icon: GraduationCap,
  titleKey: "Grade System",
  singularKey: "Grade Scale",
  service: gradeScaleService,
  searchText: (g) => g.name,
  columns: [
    { key: "name", header: "Name", accessor: (g) => g.name, cell: (g) => <span className="font-medium">{g.name}</span> },
    { key: "bands", header: "Bands", accessor: (g) => g.bands.length, align: "right" },
    { key: "range", header: "Grades", cell: (g) => <span className="text-sm text-muted-foreground">{g.bands.map((b) => b.grade).join(", ")}</span>, hideBelow: "md" },
  ],
  form: {
    schema: z.object({ name: z.string().min(1, "Required") }),
    fields: [{ type: "text", name: "name", label: "Scale Name", required: true }],
    defaults: () => ({ bands: [] }),
  },
  permissions: { view: "grade.manage", create: "grade.manage", edit: "grade.manage", delete: "delete.execute", deleteEntity: "gradeScales", export: true },
  exportable: { excel: true, pdf: true },
};

export const reconciliationResource: ResourceConfig<"bankReconciliations"> = {
  key: "bankReconciliations",
  collection: "bankReconciliations",
  icon: Landmark,
  titleKey: "Bank Reconciliation",
  singularKey: "Statement",
  service: reconciliationService,
  searchText: (r) => r.statementRef,
  defaultSort: { key: "date", desc: true },
  columns: [
    { key: "statementRef", header: "Statement", accessor: (r) => r.statementRef, mono: true },
    { key: "date", header: "Date", accessor: (r) => r.date, cell: (r) => formatDate(r.date) },
    { key: "entries", header: "Entries", accessor: (r) => r.entries.length, align: "right" },
    { key: "matched", header: "Matched", accessor: (r) => r.entries.filter((e) => e.matched).length, align: "right" },
    { key: "status", header: "Status", accessor: (r) => r.status, cell: (r) => <StatusPill status={r.status} /> },
  ],
  permissions: { view: "finance.report", delete: "delete.execute", deleteEntity: "bankReconciliations", export: true },
  exportable: { excel: true, pdf: true },
};
