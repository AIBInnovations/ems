import { useState } from "react";
import { Building2, Facebook, Globe, Instagram, Loader2, Save, Youtube } from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/components/ui/sonner";
import { db } from "@/data/db";
import { useCan } from "@/lib/rbac";
import type { School } from "@/types";

export function SchoolProfileScreen() {
  const can = useCan();
  const editable = can({ permission: "settings.manage" });
  const school = db.getAll("schools")[0];
  const [form, setForm] = useState<School>({ ...school });
  const [busy, setBusy] = useState(false);

  const set = (k: keyof School, v: string | number) => setForm((f) => ({ ...f, [k]: v }));
  const setSocial = (k: keyof School["socialLinks"], v: string) => setForm((f) => ({ ...f, socialLinks: { ...f.socialLinks, [k]: v } }));

  const save = async () => {
    setBusy(true);
    db.update("schools", school.id, form);
    setTimeout(() => { setBusy(false); toast.success("School profile saved"); }, 400);
  };

  const Field = ({ label, k, type = "text" }: { label: string; k: keyof School; type?: string }) => (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      <Input type={type} value={String(form[k] ?? "")} disabled={!editable} onChange={(e) => set(k, type === "number" ? Number(e.target.value) : e.target.value)} />
    </div>
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="School Profile"
        icon={<Building2 className="size-5" />}
        description="Institution details shown across documents and the app."
        actions={editable ? <Button onClick={save} disabled={busy}>{busy ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />} Save</Button> : undefined}
      />

      <Card>
        <CardHeader className="pb-3"><CardTitle className="text-base">Institution</CardTitle></CardHeader>
        <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Field label="School Name" k="name" />
          <Field label="DISE Code" k="diseCode" />
          <Field label="License Number" k="licenseNo" />
          <Field label="Affiliation No" k="affiliationNo" />
          <Field label="Principal Name" k="principalName" />
          <Field label="Established Year" k="establishedYear" type="number" />
          <Field label="Phone" k="phone" />
          <Field label="Email" k="email" type="email" />
          <Field label="Website" k="website" />
          <Field label="City" k="city" />
          <Field label="State" k="state" />
          <Field label="Pincode" k="pincode" />
          <div className="space-y-1.5 sm:col-span-2 lg:col-span-3">
            <Label>Address</Label>
            <Input value={form.address ?? ""} disabled={!editable} onChange={(e) => set("address", e.target.value)} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3"><CardTitle className="text-base">Social Links</CardTitle></CardHeader>
        <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {[
            { k: "facebook" as const, label: "Facebook", icon: Facebook },
            { k: "instagram" as const, label: "Instagram", icon: Instagram },
            { k: "youtube" as const, label: "YouTube", icon: Youtube },
            { k: "website" as const, label: "Website", icon: Globe },
          ].map(({ k, label, icon: Icon }) => (
            <div key={k} className="space-y-1.5">
              <Label className="flex items-center gap-1.5"><Icon className="size-3.5" /> {label}</Label>
              <Input value={(form.socialLinks?.[k as keyof School["socialLinks"]] ?? "") as string} disabled={!editable} onChange={(e) => setSocial(k as keyof School["socialLinks"], e.target.value)} placeholder="https://" />
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
