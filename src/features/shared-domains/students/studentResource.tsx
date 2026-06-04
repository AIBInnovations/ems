import { z } from "zod";
import { Bell, FileText, GraduationCap, IdCard, ScrollText, Users } from "lucide-react";
import { db } from "@/data/db";
import { studentService, notificationService } from "@/data/services";
import { toast } from "@/components/ui/sonner";
import { areaRoute } from "@/lib/routes";
import { fullName } from "@/lib/format";
import { InitialsAvatar } from "@/components/shared/InitialsAvatar";
import { StatusPill } from "@/components/shared/StatusPill";
import type { FieldOption, ResourceConfig, Student } from "@/types";

const classOptions = (): FieldOption[] => db.getAll("classes").sort((a, b) => a.numericLevel - b.numericLevel).map((c) => ({ value: c.id, label: c.name }));
const sectionOptions = (): FieldOption[] =>
  db.getAll("sections").map((s) => {
    const c = db.getById("classes", s.classId);
    return { value: s.id, label: `${c?.name ?? ""} - ${s.name}` };
  });

const classLabel = (s: Student) => {
  const c = db.getById("classes", s.classId);
  const sec = db.getById("sections", s.sectionId);
  return `${c?.name ?? "—"}${sec ? " - " + sec.name : ""}`;
};

const schema = z.object({
  firstName: z.string().min(1, "Required"),
  lastName: z.string().min(1, "Required"),
  gender: z.string().min(1, "Required"),
  dob: z.string().min(1, "Required"),
  classId: z.string().min(1, "Select a class"),
  sectionId: z.string().min(1, "Select a section"),
  rollNo: z.string().optional(),
  admissionNo: z.string().optional(),
  bloodGroup: z.string().optional(),
  ssmid: z.string().optional(),
  samagraId: z.string().optional(),
  apaarId: z.string().optional(),
  address: z.string().optional(),
  emergencyContact: z.string().optional(),
});

export const studentResource: ResourceConfig<"students"> = {
  key: "students",
  collection: "students",
  icon: Users,
  titleKey: "nav.students",
  singularKey: "res.student",
  service: studentService,
  searchText: (s) => `${fullName(s.firstName, s.lastName)} ${s.admissionNo} ${s.rollNo} ${s.ssmid ?? ""}`,
  defaultSort: { key: "rollNo" },
  primaryLink: (s) => areaRoute(`students/${s.id}`),
  columns: [
    {
      key: "name",
      header: "Student",
      accessor: (s) => fullName(s.firstName, s.lastName),
      cell: (s) => (
        <div className="flex items-center gap-3">
          <InitialsAvatar first={s.firstName} last={s.lastName} src={s.photoUrl} size="sm" />
          <div className="min-w-0">
            <p className="truncate font-medium">{fullName(s.firstName, s.lastName)}</p>
            <p className="font-mono text-xs text-muted-foreground">{s.admissionNo}</p>
          </div>
        </div>
      ),
    },
    { key: "rollNo", header: "Roll No", mono: true, hideBelow: "sm" },
    { key: "class", header: "Class", accessor: classLabel, cell: (s) => classLabel(s) },
    { key: "gender", header: "Gender", hideBelow: "md", cell: (s) => <span className="capitalize">{s.gender}</span> },
    {
      key: "guardian",
      header: "Guardian",
      hideBelow: "lg",
      accessor: (s) => db.getById("guardians", s.guardianIds[0] ?? "")?.phone ?? "",
      cell: (s) => {
        const g = db.getById("guardians", s.guardianIds[0] ?? "");
        return g ? <span className="font-mono text-xs">{g.phone}</span> : "—";
      },
    },
    { key: "status", header: "Status", accessor: (s) => s.status, cell: (s) => <StatusPill status={s.status} /> },
  ],
  filters: [
    { key: "classId", labelKey: "Class", type: "select", options: classOptions },
    { key: "sectionId", labelKey: "Section", type: "select", options: sectionOptions },
    { key: "status", labelKey: "Status", type: "select", options: [
      { value: "active", label: "Active" },
      { value: "inactive", label: "Inactive" },
      { value: "alumni", label: "Alumni" },
    ] },
    { key: "gender", labelKey: "Gender", type: "select", options: [
      { value: "male", label: "Male" },
      { value: "female", label: "Female" },
      { value: "other", label: "Other" },
    ] },
  ],
  form: {
    schema,
    modalSize: "lg",
    dynamicScope: "admission",
    defaults: () => ({ gender: "male", status: "active", customIds: [], guardianIds: [], previousMarksheetIds: [], extra: {}, academicYearId: db.query("academicYears", (a) => a.isCurrent)[0]?.id }),
    fields: [
      { type: "section", label: "Basic details" },
      { type: "text", name: "firstName", label: "First Name", required: true },
      { type: "text", name: "lastName", label: "Last Name", required: true },
      { type: "select", name: "gender", label: "Gender", required: true, options: [
        { value: "male", label: "Male" }, { value: "female", label: "Female" }, { value: "other", label: "Other" },
      ] },
      { type: "date", name: "dob", label: "Date of Birth", required: true },
      { type: "select", name: "classId", label: "Class", required: true, options: classOptions },
      { type: "select", name: "sectionId", label: "Section", required: true, options: sectionOptions },
      { type: "text", name: "rollNo", label: "Roll No" },
      { type: "text", name: "admissionNo", label: "Admission No" },
      { type: "select", name: "bloodGroup", label: "Blood Group", options: ["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"].map((b) => ({ value: b, label: b })) },
      { type: "section", label: "Identity IDs" },
      { type: "text", name: "ssmid", label: "SSM ID", mono: true },
      { type: "text", name: "samagraId", label: "Samagra ID", mono: true },
      { type: "text", name: "apaarId", label: "APAAR ID", mono: true },
      { type: "section", label: "Contact" },
      { type: "textarea", name: "address", label: "Address", col: 2 },
      { type: "tel", name: "emergencyContact", label: "Emergency Contact" },
    ],
  },
  rowActions: [
    { key: "idcard", labelKey: "ID Card", icon: IdCard, onSelect: (s, ctx) => ctx.navigate(`/print/id-card/${s.id}`) },
    {
      key: "marksheet",
      labelKey: "Mark Sheet",
      icon: GraduationCap,
      onSelect: (s, ctx) => {
        const card = db.query("reportCards", (r) => r.studentId === s.id).slice(-1)[0];
        ctx.navigate(card ? `/print/marksheet/${card.id}` : `/print/marksheet/${s.id}`);
      },
    },
    { key: "admit", labelKey: "Admit Card", icon: FileText, onSelect: (s, ctx) => ctx.navigate(`/print/admit-card/${s.id}`) },
    { key: "tc", labelKey: "Transfer Certificate", icon: ScrollText, permission: "student.tc", onSelect: (s, ctx) => ctx.navigate(`/print/transfer-certificate/${s.id}`) },
  ],
  bulkActions: [
    {
      key: "notify",
      labelKey: "Notify families",
      icon: Bell,
      permission: "notify.send",
      onSelect: async (rows) => {
        await notificationService.send({
          title: "School Notice",
          body: "You have a new update from the school. Please check the app for details.",
          audience: "member",
          audienceRefs: rows.map((r) => r.id),
          channels: ["push", "sms"],
        });
        toast.success(`Notified ${rows.length} student${rows.length === 1 ? "" : "s"}' families`);
      },
    },
  ],
  permissions: {
    view: "student.view",
    create: "student.create",
    edit: "student.edit",
    delete: "delete.execute",
    deleteEntity: "student",
    export: true,
  },
  exportable: { excel: true, pdf: true },
  emptyHintKey: "No students yet",
};
