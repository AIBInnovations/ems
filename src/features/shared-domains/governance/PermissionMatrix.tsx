import { useState } from "react";
import { ShieldCheck } from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/components/ui/sonner";
import { useServicesStore } from "@/store/services";
import { staticHasPermission } from "@/config/roles";
import { ROLE_LABELS, type RoleKey } from "@/types";

const GRANTABLE_ROLES: RoleKey[] = ["principal", "accountant", "librarian", "examiner", "class_teacher"];

const DELETE_ENTITIES = [
  { key: "students", label: "Students" },
  { key: "staff", label: "Staff" },
  { key: "books", label: "Library books" },
  { key: "exams", label: "Exams" },
  { key: "feeBills", label: "Fee records" },
  { key: "notices", label: "Notices" },
  { key: "events", label: "Events" },
  { key: "disciplineRecords", label: "Discipline records" },
];

const OTHER_PERMS = [
  { key: "delete.execute", label: "Universal delete (all modules)" },
  { key: "fee.collect", label: "Collect fees" },
  { key: "marks.publish", label: "Publish results" },
  { key: "admission.approve", label: "Approve admissions" },
];

export function PermissionMatrix() {
  const [role, setRole] = useState<RoleKey>("principal");
  const grant = useServicesStore((s) => s.grant);
  const hasGrant = useServicesStore((s) => s.hasGrant);
  // subscribe so toggles re-render
  useServicesStore((s) => s.grants);

  const resolve = (key: string) => {
    const g = hasGrant(role, key);
    return g !== undefined ? g : staticHasPermission(role, key as never);
  };

  const onToggle = (key: string, label: string, val: boolean) => {
    grant(role, key, val);
    toast.success(`${val ? "Granted" : "Revoked"} "${label}" for ${ROLE_LABELS[role]}`);
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Delete & Permission Grants" icon={<ShieldCheck className="size-5" />} description="Grant selected delete and approval permissions to roles. Major deletions stay Admin-only unless granted here." />

      <div className="flex items-center gap-3">
        <span className="text-sm font-medium">Grant to:</span>
        <Select value={role} onValueChange={(v) => setRole(v as RoleKey)}>
          <SelectTrigger className="w-56"><SelectValue /></SelectTrigger>
          <SelectContent>{GRANTABLE_ROLES.map((r) => <SelectItem key={r} value={r}>{ROLE_LABELS[r]}</SelectItem>)}</SelectContent>
        </Select>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-base">Delete permissions (PIN-gated)</CardTitle></CardHeader>
          <CardContent className="divide-y divide-border">
            {DELETE_ENTITIES.map((e) => {
              const key = `delete.${e.key}`;
              const on = resolve(key) || resolve("delete.execute");
              return (
                <div key={e.key} className="flex items-center justify-between py-3">
                  <span className="text-sm">{e.label}</span>
                  <Switch checked={on} disabled={resolve("delete.execute")} onCheckedChange={(v) => onToggle(key, e.label, v)} />
                </div>
              );
            })}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-base">Capability grants</CardTitle></CardHeader>
          <CardContent className="divide-y divide-border">
            {OTHER_PERMS.map((p) => (
              <div key={p.key} className="flex items-center justify-between py-3">
                <span className="text-sm">{p.label}</span>
                <div className="flex items-center gap-2">
                  {!staticHasPermission(role, p.key as never) && hasGrant(role, p.key) === undefined ? <Badge variant="secondary" className="text-[10px]">default off</Badge> : null}
                  <Switch checked={resolve(p.key)} onCheckedChange={(v) => onToggle(p.key, p.label, v)} />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
