import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { Compass } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/store/auth";
import { ROLE_BASE_ROUTE } from "@/config/roles";

export function NotFound() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center gap-5 text-center">
      <div className="flex size-20 items-center justify-center rounded-2xl bg-primary/10 text-primary">
        <Compass className="size-10" />
      </div>
      <div className="space-y-1">
        <h1 className="font-display text-display">404</h1>
        <p className="text-lg font-semibold">{t("error.notFoundTitle", "Page not found")}</p>
        <p className="max-w-md text-muted-foreground">{t("error.notFoundBody", "The page you're looking for doesn't exist or has moved.")}</p>
      </div>
      <Button onClick={() => navigate(user ? ROLE_BASE_ROUTE[user.roleKey] : "/login")}>{t("common.back", "Go home")}</Button>
    </div>
  );
}
