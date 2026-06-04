import { useTranslation } from "react-i18next";
import { NavLink, useLocation } from "react-router-dom";
import type { LucideIcon } from "lucide-react";
import { ChevronRight } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { useUiStore } from "@/store/ui";
import { useAuthStore } from "@/store/auth";
import { useCan } from "@/lib/rbac";
import { NAVIGATION } from "@/config/navigation";
import { ROLE_AREA } from "@/config/roles";
import { ROLE_LABELS, type NavItem, type NavSection } from "@/types";

function useVisibleNav(): NavSection[] {
  const user = useAuthStore((s) => s.user);
  const can = useCan();
  if (!user) return [];
  const area = ROLE_AREA[user.roleKey];
  const sections = NAVIGATION[area] ?? [];
  return sections
    .map((sec) => ({
      ...sec,
      items: sec.items.filter((it) => can({ permission: it.permission, service: it.service })),
    }))
    .filter((sec) => sec.items.length > 0);
}

function NavRow({ item, collapsed, onNavigate }: { item: NavItem; collapsed: boolean; onNavigate?: () => void }) {
  const { t } = useTranslation();
  const Icon = item.icon as LucideIcon | undefined;
  return (
    <NavLink
      to={item.to ?? "#"}
      end={item.exact}
      onClick={onNavigate}
      className={({ isActive }) =>
        cn(
          "group relative flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-sidebar-foreground/80 transition-colors hover:bg-white/5 hover:text-sidebar-foreground",
          isActive && "bg-white/10 text-sidebar-foreground",
          collapsed && "justify-center px-0",
        )
      }
      title={collapsed ? t(item.labelKey ?? item.label, item.label) : undefined}
    >
      {({ isActive }) => (
        <>
          {isActive ? <span className="absolute left-0 top-1/2 h-5 w-1 -translate-y-1/2 rounded-r-full bg-sidebar-active" /> : null}
          {Icon ? <Icon className={cn("size-[18px] shrink-0", isActive ? "text-sidebar-active" : "text-sidebar-foreground/70")} /> : null}
          {!collapsed ? <span className="truncate">{t(item.labelKey ?? item.label, item.label)}</span> : null}
        </>
      )}
    </NavLink>
  );
}

function SidebarBody({ collapsed, onNavigate }: { collapsed: boolean; onNavigate?: () => void }) {
  const { t } = useTranslation();
  const sections = useVisibleNav();
  const user = useAuthStore((s) => s.user);

  return (
    <div className="flex h-full flex-col bg-sidebar text-sidebar-foreground">
      <ScrollArea className="flex-1 px-3 py-4">
        <nav className="space-y-5">
          {sections.map((sec) => (
            <div key={sec.groupKey} className="space-y-1">
              {!collapsed ? (
                <p className="px-3 pb-1 text-[11px] font-semibold uppercase tracking-wider text-sidebar-muted">
                  {t(sec.groupKey, sec.groupLabel)}
                </p>
              ) : (
                <div className="mx-3 mb-1 border-t border-sidebar-border" />
              )}
              {sec.items.map((item) => (
                <NavRow key={item.key} item={item} collapsed={collapsed} onNavigate={onNavigate} />
              ))}
            </div>
          ))}
        </nav>
      </ScrollArea>
      {!collapsed && user ? (
        <div className="border-t border-sidebar-border p-4 text-xs text-sidebar-muted">
          <div className="flex items-center justify-between">
            <span className="font-medium text-sidebar-foreground/90">{t(`role.${user.roleKey}`, ROLE_LABELS[user.roleKey])}</span>
            <span className="rounded-full bg-white/10 px-2 py-0.5 text-[10px]">v0.1 · Demo</span>
          </div>
        </div>
      ) : null}
    </div>
  );
}

export function Sidebar() {
  const collapsed = useUiStore((s) => s.sidebarCollapsed);
  const mobileOpen = useUiStore((s) => s.mobileSidebarOpen);
  const setMobile = useUiStore((s) => s.setMobileSidebar);

  return (
    <>
      {/* Desktop rail */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 hidden border-r border-sidebar-border transition-[width] duration-200 lg:block",
          collapsed ? "w-[72px]" : "w-[260px]",
        )}
      >
        <div className="flex h-16 items-center gap-2 border-b border-sidebar-border bg-sidebar px-4">
          <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <ChevronRight className="size-4" />
          </span>
          {!collapsed ? <span className="font-display text-sm font-bold text-sidebar-foreground">EMS Suite</span> : null}
        </div>
        <div className="h-[calc(100%-4rem)]">
          <SidebarBody collapsed={collapsed} />
        </div>
      </aside>

      {/* Mobile drawer */}
      <Sheet open={mobileOpen} onOpenChange={setMobile}>
        <SheetContent side="left" className="w-[280px] border-sidebar-border bg-sidebar p-0">
          <SidebarBody collapsed={false} onNavigate={() => setMobile(false)} />
        </SheetContent>
      </Sheet>
    </>
  );
}
