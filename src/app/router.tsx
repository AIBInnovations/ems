import { createBrowserRouter, Navigate, type RouteObject } from "react-router-dom";
import { AppShell } from "@/components/layout/AppShell";
import { NotificationCenter } from "@/features/shared-domains/comms/NotificationCenter";
import { Login } from "@/features/auth/Login";
import { ForgotPassword } from "@/features/auth/ForgotPassword";
import { LockScreen } from "@/features/auth/LockScreen";
import { Forbidden } from "@/pages/Forbidden";
import { NotFound } from "@/pages/NotFound";
import { Settings } from "@/pages/Settings";
import { Profile } from "@/pages/Profile";
import { Help } from "@/pages/Help";
import { SearchResults } from "@/pages/SearchResults";
import { RecycleBinPage } from "@/features/shared-domains/recycle-bin/RecycleBinPage";
import { ScreenForItem, PlaceholderScreen } from "@/app/screens";
import { ReceiptPrint, MarksheetPrint, IdCardPrint, AdmitCardPrint, TransferCertificatePrint } from "@/features/print/PrintDocs";
import { ChatScreen } from "@/features/shared-domains/chat/ChatScreen";
import { StudentDetailScreen } from "@/features/shared-domains/students/StudentDetailScreen";
import { SchoolDetailScreen } from "@/features/super-admin/SchoolDetailScreen";
import { RouteError } from "@/app/RouteError";
import type { ReactNode } from "react";
import { useAuthStore } from "@/store/auth";
import { useCan } from "@/lib/rbac";
import { NAVIGATION } from "@/config/navigation";
import { ROLE_AREA, ROLE_BASE_ROUTE } from "@/config/roles";
import type { NavItem } from "@/types";

function RoleIndexRedirect() {
  const user = useAuthStore((s) => s.user);
  return <Navigate to={user ? ROLE_BASE_ROUTE[user.roleKey] : "/login"} replace />;
}

function Guard({ item, area, element }: { item: NavItem; area: string; element?: ReactNode }) {
  const user = useAuthStore((s) => s.user);
  const can = useCan();
  if (!user) return <Navigate to="/login" replace />;
  if (ROLE_AREA[user.roleKey] !== area) return <Navigate to="/403" replace />;
  if (!can({ permission: item.permission, service: item.service })) return <Navigate to="/403" replace />;
  return <>{element ?? <ScreenForItem item={item} />}</>;
}

function buildAreaRoutes(): RouteObject[] {
  const routes: RouteObject[] = [];
  for (const [area, sections] of Object.entries(NAVIGATION)) {
    const items = sections.flatMap((s) => s.items).filter((i) => i.to);
    if (items.length === 0) continue;
    const dashboard = items[0].to!;
    // area index → dashboard
    routes.push({ path: area, element: <Navigate to={dashboard} replace /> });
    for (const item of items) {
      routes.push({ path: item.to!.replace("/app/", ""), element: <Guard item={item} area={area} /> });
    }
    // student detail (where the area exposes students)
    if (items.some((i) => i.to?.endsWith("/students"))) {
      routes.push({
        path: `${area}/students/:id`,
        element: <Guard item={{ key: "student-detail", label: "Student", permission: "student.view", service: "students" }} area={area} element={<StudentDetailScreen />} />,
      });
    }
    if (area === "super-admin") {
      routes.push({
        path: `super-admin/schools/:id`,
        element: <Guard item={{ key: "school-detail", label: "School", permission: "school.toggle" }} area="super-admin" element={<SchoolDetailScreen />} />,
      });
    }
  }
  return routes;
}

export const router = createBrowserRouter([
  { path: "/", element: <Navigate to="/login" replace /> },
  { path: "/login", element: <Login /> },
  { path: "/forgot-password", element: <ForgotPassword /> },
  { path: "/reset-password", element: <ForgotPassword /> },
  { path: "/lock", element: <LockScreen /> },
  { path: "/403", element: <Forbidden /> },
  { path: "/404", element: <NotFound /> },
  {
    path: "/app",
    element: <AppShell />,
    errorElement: <RouteError />,
    children: [
      { index: true, element: <RoleIndexRedirect /> },
      ...buildAreaRoutes(),
      { path: "profile", element: <Profile /> },
      { path: "settings", element: <Settings /> },
      { path: "help", element: <Help /> },
      { path: "search", element: <SearchResults /> },
      { path: "recycle-bin", element: <RecycleBinPage /> },
      { path: "notifications", element: <NotificationCenter /> },
      { path: "chat", element: <ChatScreen /> },
      { path: "*", element: <NotFound /> },
    ],
  },
  { path: "/print/receipt/:id", element: <ReceiptPrint /> },
  { path: "/print/marksheet/:id", element: <MarksheetPrint /> },
  { path: "/print/id-card/:id", element: <IdCardPrint /> },
  { path: "/print/admit-card/:id", element: <AdmitCardPrint /> },
  { path: "/print/transfer-certificate/:id", element: <TransferCertificatePrint /> },
  { path: "*", element: <NotFound /> },
]);
