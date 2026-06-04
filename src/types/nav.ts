import type { LucideIcon } from "lucide-react";
import type { PermissionKey } from "./rbac";

export interface NavItem {
  key: string;
  /** English label (fallback). */
  label: string;
  /** Optional i18n key; falls back to `label`. */
  labelKey?: string;
  icon?: LucideIcon;
  to?: string;
  permission?: PermissionKey;
  service?: string;
  children?: NavItem[];
  badgeKey?: string;
  exact?: boolean;
}

export interface NavSection {
  groupKey: string;
  groupLabel: string;
  items: NavItem[];
}
