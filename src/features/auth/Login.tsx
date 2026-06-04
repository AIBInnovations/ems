import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link, useNavigate } from "react-router-dom";
import { GraduationCap, Languages, Loader2, LockKeyhole, Moon, Sun, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/components/ui/sonner";
import { useAuthStore } from "@/store/auth";
import { useUiStore } from "@/store/ui";
import { ROLE_BASE_ROUTE } from "@/config/roles";
import { DEMO_PASSWORD, DEMO_ROLE_ACCOUNTS } from "@/data/seed/reference";
import { ROLE_LABELS } from "@/types";
import { cn } from "@/lib/utils";

export function Login() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const login = useAuthStore((s) => s.login);
  const user = useAuthStore((s) => s.user);
  const status = useAuthStore((s) => s.status);
  const theme = useUiStore((s) => s.theme);
  const toggleTheme = useUiStore((s) => s.toggleTheme);
  const language = useUiStore((s) => s.language);
  const toggleLanguage = useUiStore((s) => s.toggleLanguage);

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [pending, setPending] = useState<string | null>(null);

  useEffect(() => {
    if (user) navigate(ROLE_BASE_ROUTE[user.roleKey], { replace: true });
  }, [user, navigate]);

  const doLogin = async (u: string, p: string) => {
    const res = await login(u, p);
    if (res.ok && res.role) {
      toast.success(t("auth.welcome", "Welcome back") + "!");
      navigate(ROLE_BASE_ROUTE[res.role], { replace: true });
    } else {
      toast.error(res.error ?? "Login failed");
    }
  };

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    void doLogin(username, password);
  };

  const quickSignIn = async (role: string) => {
    setPending(role);
    setUsername(role);
    setPassword(DEMO_PASSWORD);
    await doLogin(role, DEMO_PASSWORD);
    setPending(null);
  };

  return (
    <div className="grid min-h-dvh lg:grid-cols-2">
      {/* Brand panel */}
      <div className="relative hidden flex-col justify-between overflow-hidden bg-sidebar p-10 text-sidebar-foreground lg:flex">
        <div className="absolute inset-0 bg-grid opacity-[0.07]" />
        <div className="absolute -right-24 -top-24 size-96 rounded-full bg-primary/30 blur-3xl" />
        <div className="absolute -bottom-24 -left-24 size-96 rounded-full bg-accent/20 blur-3xl" />
        <div className="relative flex items-center gap-3">
          <span className="flex size-11 items-center justify-center rounded-xl bg-primary text-primary-foreground">
            <GraduationCap className="size-6" />
          </span>
          <div>
            <p className="font-display text-xl font-bold">{t("app.name", "EMS Suite")}</p>
            <p className="text-sm text-sidebar-muted">{t("app.tagline", "Education Management System")}</p>
          </div>
        </div>
        <div className="relative space-y-4">
          <h2 className="font-display text-3xl font-bold leading-tight">
            One platform for your entire school — across 14 roles.
          </h2>
          <p className="max-w-md text-sidebar-muted">
            Admissions, attendance, exams, fees, library, transport, communication and more — all working, all in one place.
          </p>
          <div className="flex flex-wrap gap-2 pt-2">
            {["Attendance", "Fees & Receipts", "Marks Workflow", "Live Bus Tracking", "Recycle Bin", "Bilingual"].map((f) => (
              <span key={f} className="rounded-full bg-white/10 px-3 py-1 text-xs font-medium">{f}</span>
            ))}
          </div>
        </div>
        <p className="relative text-xs text-sidebar-muted">Demo build · data persists locally in your browser.</p>
      </div>

      {/* Form panel */}
      <div className="relative flex flex-col items-center justify-center p-6 sm:p-10">
        <div className="absolute right-4 top-4 flex gap-1">
          <Button variant="ghost" size="icon" onClick={toggleLanguage} aria-label="Language"><Languages className="size-5" /></Button>
          <Button variant="ghost" size="icon" onClick={toggleTheme} aria-label="Theme">{theme === "dark" ? <Sun className="size-5" /> : <Moon className="size-5" />}</Button>
        </div>

        <div className="w-full max-w-md space-y-6">
          <div className="space-y-1.5 lg:hidden">
            <span className="inline-flex size-11 items-center justify-center rounded-xl bg-primary text-primary-foreground"><GraduationCap className="size-6" /></span>
          </div>
          <div className="space-y-1">
            <h1 className="font-display text-h1">{t("auth.welcome", "Welcome back")}</h1>
            <p className="text-sm text-muted-foreground">{t("auth.login", "Sign in")} — {language === "en" ? "select a demo role below or enter credentials." : "नीचे एक डेमो भूमिका चुनें।"}</p>
          </div>

          <form onSubmit={onSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="username">{t("auth.username", "Username or Email")}</Label>
              <div className="relative">
                <User className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input id="username" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="admin" className="pl-9" autoComplete="username" />
              </div>
            </div>
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">{t("auth.password", "Password")}</Label>
                <Link to="/forgot-password" className="text-xs font-medium text-primary hover:underline">{t("auth.forgot", "Forgot password?")}</Link>
              </div>
              <div className="relative">
                <LockKeyhole className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder={DEMO_PASSWORD} className="pl-9" autoComplete="current-password" />
              </div>
            </div>
            <Button type="submit" className="w-full" loading={status === "authenticating" && !pending}>
              {t("auth.login", "Sign in")}
            </Button>
          </form>

          <div className="relative">
            <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-border" /></div>
            <div className="relative flex justify-center text-xs uppercase tracking-wide"><span className="bg-background px-2 text-muted-foreground">{t("auth.demoAccounts", "Demo accounts")}</span></div>
          </div>

          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {DEMO_ROLE_ACCOUNTS.map((role) => (
              <button
                key={role}
                type="button"
                onClick={() => quickSignIn(role)}
                disabled={!!pending}
                className={cn(
                  "flex items-center justify-center gap-1.5 rounded-lg border border-border bg-card px-2 py-2 text-xs font-medium transition-all hover:border-primary hover:bg-primary/5 disabled:opacity-60",
                  pending === role && "border-primary bg-primary/5",
                )}
              >
                {pending === role ? <Loader2 className="size-3.5 animate-spin" /> : null}
                {t(`role.${role}`, ROLE_LABELS[role])}
              </button>
            ))}
          </div>
          <p className="text-center text-xs text-muted-foreground">Password: <span className="font-mono">{DEMO_PASSWORD}</span> · Delete PIN: <span className="font-mono">1234</span></p>
        </div>
      </div>
    </div>
  );
}
