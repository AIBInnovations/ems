import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { Lock, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { InitialsAvatar } from "@/components/shared/InitialsAvatar";
import { useAuthStore } from "@/store/auth";
import { authService } from "@/data/services/authService";
import { ROLE_BASE_ROUTE } from "@/config/roles";
import { cn } from "@/lib/utils";

export function LockScreen() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const displayName = useAuthStore((s) => s.displayName);
  const unlock = useAuthStore((s) => s.unlock);
  const logout = useAuthStore((s) => s.logout);
  const [password, setPassword] = useState("");
  const [error, setError] = useState(false);
  const [first, ...rest] = displayName.split(" ");

  if (!user) {
    navigate("/login", { replace: true });
    return null;
  }

  const tryUnlock = async () => {
    const res = await authService.login(user.username, password);
    if (res.ok) {
      unlock();
      navigate(ROLE_BASE_ROUTE[user.roleKey], { replace: true });
    } else {
      setError(true);
      setPassword("");
    }
  };

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-6 bg-sidebar p-6 text-sidebar-foreground">
      <InitialsAvatar first={first} last={rest.join(" ")} size="xl" />
      <div className="text-center">
        <p className="font-display text-2xl font-bold">{displayName}</p>
        <p className="flex items-center justify-center gap-1.5 text-sm text-sidebar-muted"><Lock className="size-3.5" /> {t("topbar.lock", "Screen locked")}</p>
      </div>
      <div className="w-full max-w-xs space-y-3">
        <Input
          type="password"
          autoFocus
          value={password}
          onChange={(e) => { setPassword(e.target.value); setError(false); }}
          onKeyDown={(e) => e.key === "Enter" && tryUnlock()}
          placeholder={t("auth.password", "Password")}
          className={cn("bg-white/10 text-center text-sidebar-foreground placeholder:text-sidebar-muted", error && "animate-shake border-destructive")}
        />
        <Button className="w-full" onClick={tryUnlock} disabled={!password}>{t("auth.login", "Unlock")}</Button>
        <Button variant="ghost" className="w-full text-sidebar-muted hover:text-sidebar-foreground hover:bg-white/10" onClick={() => { logout(); navigate("/login"); }}>
          <LogOut className="size-4" /> {t("auth.logout", "Sign out")}
        </Button>
      </div>
    </div>
  );
}
