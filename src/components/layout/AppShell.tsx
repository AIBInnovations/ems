import { Suspense } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";
import { Breadcrumbs } from "./Breadcrumbs";
import { CommandPalette } from "./CommandPalette";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { useUiStore } from "@/store/ui";
import { useAuthStore } from "@/store/auth";

function PageFallback() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-9 w-56" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-28 rounded-xl" />)}
      </div>
      <Skeleton className="h-72 rounded-xl" />
    </div>
  );
}

export function AppShell() {
  const collapsed = useUiStore((s) => s.sidebarCollapsed);
  const user = useAuthStore((s) => s.user);
  const locked = useAuthStore((s) => s.locked);
  const location = useLocation();

  if (!user) return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  if (locked) return <Navigate to="/lock" replace />;

  return (
    <div className="min-h-dvh bg-background">
      <Sidebar />
      <div className={cn("flex min-h-dvh flex-col transition-[padding] duration-200", collapsed ? "lg:pl-[72px]" : "lg:pl-[260px]")}>
        <Topbar />
        <div className="border-b border-border bg-background/60 px-4 py-2 sm:px-6">
          <Breadcrumbs />
        </div>
        <main className="flex-1 px-4 py-5 sm:px-6 sm:py-6">
          <div className="mx-auto w-full max-w-[1320px]">
            <Suspense fallback={<PageFallback />}>
              <motion.div
                key={location.pathname}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.15, ease: "easeOut" }}
              >
                <Outlet />
              </motion.div>
            </Suspense>
          </div>
        </main>
      </div>
      <CommandPalette />
    </div>
  );
}
