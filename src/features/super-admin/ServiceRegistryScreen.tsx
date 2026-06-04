import { useMemo } from "react";
import { Eye, EyeOff, Network, Power, ShieldAlert } from "lucide-react";
import { PageHeader, DemoBadge } from "@/components/shared/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/sonner";
import { useDialogs } from "@/components/shared/dialogs";
import { useServicesStore } from "@/store/services";
import { cn } from "@/lib/utils";

export function ServiceRegistryScreen() {
  const { confirm } = useDialogs();
  const modules = useServicesStore((s) => s.modules);
  const services = useServicesStore((s) => s.services);
  const setEnabled = useServicesStore((s) => s.setEnabled);
  const setVisible = useServicesStore((s) => s.setVisible);
  const schoolActive = useServicesStore((s) => s.schoolActive);
  const setSchoolActive = useServicesStore((s) => s.setSchoolActive);

  const grouped = useMemo(() => {
    const g: Record<string, typeof modules> = {};
    for (const m of modules) (g[m.group] ??= []).push(m);
    return g;
  }, [modules]);

  const toggleSchool = () =>
    confirm({
      title: schoolActive ? "Deactivate this school?" : "Reactivate this school?",
      body: schoolActive
        ? "Deactivating cascades to ALL members — no one in the school can log in until reactivated. Data is retained."
        : "All members will be able to log in again.",
      confirmLabel: schoolActive ? "Deactivate (cascade)" : "Reactivate",
      destructive: schoolActive,
      onConfirm: () => {
        setSchoolActive(!schoolActive);
        toast.success(schoolActive ? "School deactivated — logins blocked" : "School reactivated");
      },
    });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Services Registry"
        icon={<Network className="size-5" />}
        description="Hide/unhide and activate/deactivate any module. Changes apply instantly across every role's sidebar, routes and actions."
        actions={<DemoBadge label="Master switches" />}
      />

      <Card className={cn("border-2", schoolActive ? "border-success/30" : "border-destructive/40")}>
        <CardContent className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <span className={cn("flex size-10 items-center justify-center rounded-lg", schoolActive ? "bg-success/12 text-success" : "bg-destructive/12 text-destructive")}>
              <ShieldAlert className="size-5" />
            </span>
            <div>
              <p className="font-display font-semibold">School-wide access {schoolActive ? "active" : "deactivated"}</p>
              <p className="text-sm text-muted-foreground">Deactivating cascades to every member (login blocked, data retained).</p>
            </div>
          </div>
          <Button variant={schoolActive ? "destructive" : "default"} onClick={toggleSchool}>
            <Power className="size-4" /> {schoolActive ? "Deactivate school" : "Reactivate school"}
          </Button>
        </CardContent>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        {Object.entries(grouped).map(([group, mods]) => (
          <Card key={group}>
            <CardHeader className="pb-2"><CardTitle className="text-base">{group}</CardTitle></CardHeader>
            <CardContent className="divide-y divide-border">
              {mods.map((m) => {
                const live = services[m.key];
                const enabled = live?.enabled ?? true;
                const visible = live?.visible ?? true;
                return (
                  <div key={m.key} className="flex items-center justify-between gap-3 py-3">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">{m.label}</p>
                      <div className="mt-0.5 flex items-center gap-1.5">
                        {enabled && visible ? (
                          <Badge variant="success" className="text-[10px]">Live</Badge>
                        ) : (
                          <Badge variant="secondary" className="text-[10px]">{!visible ? "Hidden" : "Disabled"}</Badge>
                        )}
                        <span className="font-mono text-[10px] text-muted-foreground">{m.key}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <label className="flex items-center gap-1.5 text-xs text-muted-foreground" title="Visible in sidebars">
                        {visible ? <Eye className="size-3.5" /> : <EyeOff className="size-3.5" />}
                        <Switch checked={visible} onCheckedChange={(v) => setVisible(m.key, v)} />
                      </label>
                      <label className="flex items-center gap-1.5 text-xs text-muted-foreground" title="Enabled">
                        <Power className="size-3.5" />
                        <Switch checked={enabled} onCheckedChange={(v) => setEnabled(m.key, v)} />
                      </label>
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
