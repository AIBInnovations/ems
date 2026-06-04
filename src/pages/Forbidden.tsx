import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { ShieldX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/store/auth";
import { ROLE_BASE_ROUTE } from "@/config/roles";

export function Forbidden() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center gap-5 text-center">
      <div className="flex size-20 items-center justify-center rounded-2xl bg-destructive/10 text-destructive">
        <ShieldX className="size-10" />
      </div>
      <div className="space-y-1">
        <h1 className="font-display text-display">403</h1>
        <p className="text-lg font-semibold">{t("error.forbiddenTitle", "Access denied")}</p>
        <p className="max-w-md text-muted-foreground">
          {t("error.forbiddenBody", "You don't have permission to view this page, or the service has been disabled for your role.")}
        </p>
      </div>
      <Button onClick={() => navigate(user ? ROLE_BASE_ROUTE[user.roleKey] : "/login")}>{t("common.back", "Back to dashboard")}</Button>
    </div>
  );
}
