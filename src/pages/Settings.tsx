import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { Languages, Monitor, Moon, RefreshCw, Sun, Trash2 } from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { toast } from "@/components/ui/sonner";
import { useDialogs } from "@/components/shared/dialogs";
import { useUiStore } from "@/store/ui";
import { useAuthStore } from "@/store/auth";
import { db } from "@/data/db";
import { cn } from "@/lib/utils";
import type { Theme } from "@/types";

export function Settings() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { confirm } = useDialogs();
  const theme = useUiStore((s) => s.theme);
  const setTheme = useUiStore((s) => s.setTheme);
  const language = useUiStore((s) => s.language);
  const setLanguage = useUiStore((s) => s.setLanguage);
  const density = useUiStore((s) => s.density);
  const setDensity = useUiStore((s) => s.setDensity);
  const role = useAuthStore((s) => s.user?.roleKey);

  const themes: { key: Theme; label: string; icon: typeof Sun }[] = [
    { key: "light", label: "Light", icon: Sun },
    { key: "dark", label: "Dark", icon: Moon },
    { key: "system", label: "System", icon: Monitor },
  ];

  const resetDemo = () =>
    confirm({
      title: "Reset demo data?",
      body: "This wipes all local changes and regenerates the original demo dataset. You'll be signed out.",
      confirmLabel: "Reset & sign out",
      destructive: true,
      onConfirm: () => {
        db.reset();
        useAuthStore.getState().logout();
        toast.success("Demo data reset");
        navigate("/login");
        setTimeout(() => window.location.reload(), 300);
      },
    });

  return (
    <div className="space-y-6">
      <PageHeader title={t("topbar.settings", "Settings")} description="Personalize your experience and manage the demo." />

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Appearance</CardTitle>
          <CardDescription>Theme, language and table density.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label>Theme</Label>
            <div className="flex flex-wrap gap-2">
              {themes.map((th) => {
                const Icon = th.icon;
                return (
                  <button key={th.key} onClick={() => setTheme(th.key)} className={cn("flex items-center gap-2 rounded-lg border px-4 py-2 text-sm transition-colors", theme === th.key ? "border-primary bg-primary/5 text-primary" : "border-border hover:bg-muted")}>
                    <Icon className="size-4" /> {th.label}
                  </button>
                );
              })}
            </div>
          </div>
          <div className="space-y-2">
            <Label className="flex items-center gap-2"><Languages className="size-4" /> Language</Label>
            <div className="flex gap-2">
              {(["en", "hi"] as const).map((l) => (
                <button key={l} onClick={() => setLanguage(l)} className={cn("rounded-lg border px-4 py-2 text-sm transition-colors", language === l ? "border-primary bg-primary/5 text-primary" : "border-border hover:bg-muted")}>
                  {l === "en" ? "English" : "हिंदी"}
                </button>
              ))}
            </div>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <Label>Compact tables</Label>
              <p className="text-sm text-muted-foreground">Denser rows for data-heavy screens.</p>
            </div>
            <Switch checked={density === "compact"} onCheckedChange={(v) => setDensity(v ? "compact" : "comfortable")} />
          </div>
        </CardContent>
      </Card>

      {role === "super_admin" || role === "admin" ? (
        <Card className="border-destructive/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base"><Trash2 className="size-4 text-destructive" /> Demo data</CardTitle>
            <CardDescription>Restore the application to its original seeded state.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="destructive" onClick={resetDemo}><RefreshCw className="size-4" /> Reset demo data</Button>
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}
