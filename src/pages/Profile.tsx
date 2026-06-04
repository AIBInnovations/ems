import { useTranslation } from "react-i18next";
import { Mail, Phone, ShieldCheck, Star } from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { InitialsAvatar } from "@/components/shared/InitialsAvatar";
import { RoleBadge } from "@/components/shared/RoleBadge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuthStore } from "@/store/auth";
import { db } from "@/data/db";
import { fullName } from "@/lib/format";

export function Profile() {
  const { t } = useTranslation();
  const user = useAuthStore((s) => s.user);
  const displayName = useAuthStore((s) => s.displayName);
  if (!user) return null;
  const [first, ...rest] = displayName.split(" ");

  const staff = user.linkedProfileType === "staff" && user.linkedProfileId ? db.getById("staff", user.linkedProfileId) : null;
  const student = user.linkedProfileType === "student" && user.linkedProfileId ? db.getById("students", user.linkedProfileId) : null;

  const rows: { label: string; value: string }[] = [];
  if (staff) {
    rows.push({ label: "Employee ID", value: staff.employeeId });
    rows.push({ label: "Department", value: staff.department ?? "—" });
    rows.push({ label: "Designation", value: staff.designation ?? "—" });
    rows.push({ label: "Joined", value: staff.joiningDate });
  }
  if (student) {
    rows.push({ label: "Admission No", value: student.admissionNo });
    rows.push({ label: "Roll No", value: student.rollNo });
    rows.push({ label: "SSM ID", value: student.ssmid ?? "—" });
    rows.push({ label: "APAAR ID", value: student.apaarId ?? "—" });
  }

  return (
    <div className="space-y-6">
      <PageHeader title={t("topbar.profile", "My Profile")} />
      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <CardContent className="flex flex-col items-center gap-3 pt-6 text-center">
            <InitialsAvatar first={first} last={rest.join(" ")} src={user.avatarUrl} size="xl" />
            <div>
              <p className="font-display text-lg font-semibold">{displayName}</p>
              <div className="mt-1 flex justify-center"><RoleBadge role={user.roleKey} /></div>
            </div>
            <div className="w-full space-y-2 pt-2 text-sm">
              {user.email ? <p className="flex items-center justify-center gap-2 text-muted-foreground"><Mail className="size-4" /> {user.email}</p> : null}
              {user.phone ? <p className="flex items-center justify-center gap-2 text-muted-foreground"><Phone className="size-4" /> {user.phone}</p> : null}
              {staff?.rating ? <p className="flex items-center justify-center gap-1 text-amber-600"><Star className="size-4 fill-current" /> {staff.rating} rating</p> : null}
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base"><ShieldCheck className="size-4" /> Details</CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-2">
              <div>
                <dt className="text-xs text-muted-foreground">Username</dt>
                <dd className="font-mono text-sm">{user.username}</dd>
              </div>
              <div>
                <dt className="text-xs text-muted-foreground">Status</dt>
                <dd><Badge variant="success">{t("status.active", "Active")}</Badge></dd>
              </div>
              {rows.map((r) => (
                <div key={r.label}>
                  <dt className="text-xs text-muted-foreground">{r.label}</dt>
                  <dd className="text-sm font-medium">{r.value}</dd>
                </div>
              ))}
            </dl>
            {staff || student ? null : <p className="text-sm text-muted-foreground">Profile for {fullName(first, rest.join(" "))}.</p>}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
