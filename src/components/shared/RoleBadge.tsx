import { useTranslation } from "react-i18next";
import { Badge } from "@/components/ui/badge";
import { ROLE_LABELS, type RoleKey } from "@/types";

export function RoleBadge({ role }: { role: RoleKey }) {
  const { t } = useTranslation();
  return (
    <Badge variant="secondary" className="font-medium">
      {t(`role.${role}`, ROLE_LABELS[role])}
    </Badge>
  );
}
