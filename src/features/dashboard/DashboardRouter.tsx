import type { ReactNode } from "react";
import { useAuthStore } from "@/store/auth";
import type { RoleKey } from "@/types";

import { SuperAdminDashboard } from "./roles/SuperAdminDashboard";
import { AdminDashboard } from "./roles/AdminDashboard";
import { PrincipalDashboard } from "./roles/PrincipalDashboard";
import { AccountantDashboard } from "./roles/AccountantDashboard";
import { ReceptionistDashboard } from "./roles/ReceptionistDashboard";
import { LibrarianDashboard } from "./roles/LibrarianDashboard";
import { LabDashboard } from "./roles/LabDashboard";
import { ExaminerDashboard } from "./roles/ExaminerDashboard";
import { SportsDashboard } from "./roles/SportsDashboard";
import { TeacherDashboard } from "./roles/TeacherDashboard";
import { DriverDashboard } from "./roles/DriverDashboard";
import { OtherStaffDashboard } from "./roles/OtherStaffDashboard";
import { HomeScreen } from "@/features/home/HomeScreen";

const MAP: Partial<Record<RoleKey, () => ReactNode>> = {
  super_admin: () => <SuperAdminDashboard />,
  admin: () => <AdminDashboard />,
  principal: () => <PrincipalDashboard />,
  accountant: () => <AccountantDashboard />,
  receptionist: () => <ReceptionistDashboard />,
  librarian: () => <LibrarianDashboard />,
  lab_assistant: () => <LabDashboard />,
  examiner: () => <ExaminerDashboard />,
  sports_coach: () => <SportsDashboard />,
  class_teacher: () => <TeacherDashboard />,
  subject_teacher: () => <TeacherDashboard />,
  bus_driver: () => <DriverDashboard />,
  bus_helper: () => <DriverDashboard />,
  other_staff: () => <OtherStaffDashboard />,
};

/** Renders the dashboard matching the signed-in user's role. */
export function DashboardRouter() {
  const role = useAuthStore((s) => s.user?.roleKey);
  const render = role ? MAP[role] : undefined;
  return <>{render ? render() : <HomeScreen />}</>;
}
