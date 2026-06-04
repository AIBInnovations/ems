import type { ReactNode } from "react";
import { useAuthStore } from "@/store/auth";
import type { RoleKey } from "@/types";

import { AdminReports } from "./roles/AdminReports";
import { PrincipalReports } from "./roles/PrincipalReports";
import { AccountantReports } from "./roles/AccountantReports";
import { LibraryReports } from "./roles/LibraryReports";
import { LabReports } from "./roles/LabReports";
import { ExamReports } from "./roles/ExamReports";
import { SportsReports } from "./roles/SportsReports";

const MAP: Partial<Record<RoleKey, () => ReactNode>> = {
  super_admin: () => <AdminReports />,
  admin: () => <AdminReports />,
  principal: () => <PrincipalReports />,
  accountant: () => <AccountantReports />,
  librarian: () => <LibraryReports />,
  lab_assistant: () => <LabReports />,
  examiner: () => <ExamReports />,
  sports_coach: () => <SportsReports />,
};

/** Renders the analytics report matched to the signed-in user's role. */
export function ReportsRouter() {
  const role = useAuthStore((s) => s.user?.roleKey);
  const render = role ? MAP[role] : undefined;
  return <>{render ? render() : <AdminReports />}</>;
}
