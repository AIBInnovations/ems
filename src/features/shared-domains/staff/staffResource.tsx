import { z } from "zod";
import { Power, UserCog } from "lucide-react";
import { db } from "@/data/db";
import { staffService } from "@/data/services";
import { toast } from "@/components/ui/sonner";
import { fullName } from "@/lib/format";
import { InitialsAvatar } from "@/components/shared/InitialsAvatar";
import { RoleBadge } from "@/components/shared/RoleBadge";
import { StatusPill } from "@/components/shared/StatusPill";
import { ROLE_LABELS } from "@/types";
import type { FieldOption, ResourceConfig, StaffMember } from "@/types";

const STAFF_ROLE_OPTIONS: FieldOption[] = [
  "principal",
  "accountant",
  "receptionist",
  "librarian",
  "lab_assistant",
  "examiner",
  "sports_coach",
  "class_teacher",
  "subject_teacher",
  "bus_driver",
  "bus_helper",
  "other_staff",
].map((r) => ({ value: r, label: ROLE_LABELS[r as keyof typeof ROLE_LABELS] ?? r }));

const roleFilterOptions = (): FieldOption[] => {
  const keys = Array.from(new Set(db.getAll("staff").map((s) => s.roleKey)));
  return keys.map((k) => ({ value: k, label: ROLE_LABELS[k] ?? k }));
};

const departmentOptions = (): FieldOption[] => {
  const depts = Array.from(
    new Set(db.getAll("staff").map((s) => s.department).filter((d): d is string => !!d)),
  ).sort();
  return depts.map((d) => ({ value: d, label: d }));
};

const schema = z.object({
  firstName: z.string().min(1, "Required"),
  lastName: z.string().min(1, "Required"),
  gender: z.string().min(1, "Required"),
  roleKey: z.string().min(1, "Select a role"),
  department: z.string().optional(),
  designation: z.string().optional(),
  joiningDate: z.string().min(1, "Required"),
});

export const staffResource: ResourceConfig<"staff"> = {
  key: "staff",
  collection: "staff",
  icon: UserCog,
  titleKey: "Staff Members",
  singularKey: "Staff Member",
  service: staffService,
  searchText: (s) => `${fullName(s.firstName, s.lastName)} ${s.employeeId} ${s.designation ?? ""} ${s.department ?? ""}`,
  defaultSort: { key: "name" },
  columns: [
    {
      key: "name",
      header: "Staff",
      accessor: (s) => fullName(s.firstName, s.lastName),
      cell: (s) => (
        <div className="flex items-center gap-3">
          <InitialsAvatar first={s.firstName} last={s.lastName} src={s.photoUrl} size="sm" />
          <div className="min-w-0">
            <p className="truncate font-medium">{fullName(s.firstName, s.lastName)}</p>
            <p className="font-mono text-xs text-muted-foreground">{s.employeeId}</p>
          </div>
        </div>
      ),
    },
    {
      key: "roleKey",
      header: "Role",
      accessor: (s) => s.roleKey,
      cell: (s) => <RoleBadge role={s.roleKey} />,
    },
    { key: "department", header: "Department", hideBelow: "md", accessor: (s) => s.department ?? "—" },
    {
      key: "designation",
      header: "Designation",
      hideBelow: "lg",
      accessor: (s) => s.designation ?? "",
      cell: (s) => <span className="capitalize">{s.designation ?? "—"}</span>,
    },
    {
      key: "phone",
      header: "Phone",
      mono: true,
      hideBelow: "lg",
      accessor: (s) => s.contact.phone ?? "",
      cell: (s) => <span className="font-mono text-xs">{s.contact.phone ?? "—"}</span>,
    },
    {
      key: "rating",
      header: "Rating",
      align: "right",
      accessor: (s) => s.rating ?? 0,
      cell: (s) => (s.rating != null ? <span>{s.rating.toFixed(1)} ★</span> : <span className="text-muted-foreground">—</span>),
    },
    { key: "status", header: "Status", accessor: (s) => s.status, cell: (s) => <StatusPill status={s.status} /> },
  ],
  filters: [
    { key: "roleKey", labelKey: "Role", type: "select", options: roleFilterOptions },
    { key: "department", labelKey: "Department", type: "select", options: departmentOptions },
    {
      key: "status",
      labelKey: "Status",
      type: "select",
      options: [
        { value: "active", label: "Active" },
        { value: "inactive", label: "Inactive" },
      ],
    },
  ],
  form: {
    schema,
    modalSize: "lg",
    dynamicScope: "staff",
    defaults: () => ({ gender: "male", status: "active", roleKey: "other_staff", qualifications: [], extra: {} }),
    fields: [
      { type: "section", label: "Basic" },
      { type: "text", name: "firstName", label: "First Name", required: true },
      { type: "text", name: "lastName", label: "Last Name", required: true },
      {
        type: "select",
        name: "gender",
        label: "Gender",
        required: true,
        options: [
          { value: "male", label: "Male" },
          { value: "female", label: "Female" },
          { value: "other", label: "Other" },
        ],
      },
      { type: "select", name: "roleKey", label: "Role", required: true, options: STAFF_ROLE_OPTIONS },
      { type: "text", name: "department", label: "Department" },
      { type: "text", name: "designation", label: "Designation" },
      { type: "date", name: "joiningDate", label: "Joining Date", required: true },
    ],
  },
  rowActions: [
    {
      key: "toggle",
      labelKey: "Toggle active",
      icon: Power,
      permission: "member.activate",
      onSelect: async (s, ctx) => {
        await staffService.setActive(s.id, s.status !== "active");
        toast.success(`${fullName(s.firstName, s.lastName)} ${s.status === "active" ? "deactivated — login blocked" : "activated"}`);
        ctx.refresh();
      },
    },
  ],
  permissions: {
    view: "staff.view",
    create: "staff.create",
    edit: "staff.edit",
    delete: "delete.execute",
    deleteEntity: "staff",
    export: true,
  },
  exportable: { excel: true, pdf: true },
  emptyHintKey: "No staff members yet",
};
