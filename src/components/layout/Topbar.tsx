import { useTranslation } from "react-i18next";
import { Link, useNavigate } from "react-router-dom";
import {
  Bell,
  HelpCircle,
  Languages,
  Lock,
  LogOut,
  Menu,
  Moon,
  PanelLeft,
  Search,
  Settings,
  Sun,
  User,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { InitialsAvatar } from "@/components/shared/InitialsAvatar";
import { RoleBadge } from "@/components/shared/RoleBadge";
import { useUiStore } from "@/store/ui";
import { useAuthStore } from "@/store/auth";
import { db } from "@/data/db";
import { timeAgo } from "@/lib/format";
import { ROLE_AREA } from "@/config/roles";

export function Topbar() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const toggleSidebar = useUiStore((s) => s.toggleSidebar);
  const setMobileSidebar = useUiStore((s) => s.setMobileSidebar);
  const setCommandOpen = useUiStore((s) => s.setCommandOpen);
  const theme = useUiStore((s) => s.theme);
  const toggleTheme = useUiStore((s) => s.toggleTheme);
  const language = useUiStore((s) => s.language);
  const toggleLanguage = useUiStore((s) => s.toggleLanguage);

  const user = useAuthStore((s) => s.user);
  const displayName = useAuthStore((s) => s.displayName);
  const avatarUrl = useAuthStore((s) => s.avatarUrl);
  const logout = useAuthStore((s) => s.logout);
  const lock = useAuthStore((s) => s.lock);

  // Super Admin operates the whole platform — show the platform brand, not one school.
  const isPlatform = user?.roleKey === "super_admin";
  const primarySchool = db.getAll("schools").find((s) => s.isPrimary) ?? db.getAll("schools")[0];
  const brandName = isPlatform ? "EMS Platform" : primarySchool?.name ?? "EMS Suite";
  const brandSubtitle = isPlatform ? `${db.getAll("schools").length} schools` : undefined;
  const notifications = db.getAll("notifications").filter((n) => n.status === "sent").slice(-6).reverse();
  const area = user ? ROLE_AREA[user.roleKey] : "admin";
  const [first, ...rest] = displayName.split(" ");

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-2 border-b border-border bg-background/85 px-3 backdrop-blur sm:px-4">
      <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setMobileSidebar(true)} aria-label="Open menu">
        <Menu className="size-5" />
      </Button>
      <Button variant="ghost" size="icon" className="hidden lg:inline-flex" onClick={toggleSidebar} aria-label="Toggle sidebar">
        <PanelLeft className="size-5" />
      </Button>

      <Link to={`/app/${area}`} className="flex items-center gap-2">
        <span className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
          <svg viewBox="0 0 32 32" className="size-5" aria-hidden>
            <path d="M16 5 4 11l12 6 8-4v6h2v-7L16 5Z" fill="currentColor" />
            <path d="M9 15v5c0 1.7 3.1 3 7 3s7-1.3 7-3v-5l-7 3.5L9 15Z" fill="currentColor" opacity="0.6" />
          </svg>
        </span>
        <span className="hidden flex-col leading-tight sm:flex">
          <span className="font-display text-base font-semibold">{brandName}</span>
          {brandSubtitle ? <span className="text-[11px] font-normal text-muted-foreground">{brandSubtitle}</span> : null}
        </span>
      </Link>

      <button
        onClick={() => setCommandOpen(true)}
        className="ml-2 hidden h-9 w-64 items-center gap-2 rounded-lg border border-input bg-muted/40 px-3 text-sm text-muted-foreground transition-colors hover:bg-muted md:flex"
      >
        <Search className="size-4" />
        {t("common.search", "Search")}…
        <kbd className="ml-auto rounded border border-border bg-background px-1.5 text-[10px] font-medium">⌘K</kbd>
      </button>

      <div className="ml-auto flex items-center gap-0.5 sm:gap-1">
        <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setCommandOpen(true)} aria-label="Search">
          <Search className="size-5" />
        </Button>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="icon" onClick={toggleLanguage} aria-label="Switch language">
              <Languages className="size-5" />
              <span className="sr-only">{language}</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>{language === "en" ? "हिंदी" : "English"}</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="icon" onClick={toggleTheme} aria-label="Toggle theme">
              {theme === "dark" ? <Sun className="size-5" /> : <Moon className="size-5" />}
            </Button>
          </TooltipTrigger>
          <TooltipContent>{theme === "dark" ? "Light" : "Dark"}</TooltipContent>
        </Tooltip>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="relative" aria-label="Notifications">
              <Bell className="size-5" />
              {notifications.length > 0 ? (
                <span className="absolute right-1.5 top-1.5 flex size-2 rounded-full bg-destructive ring-2 ring-background" />
              ) : null}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80">
            <DropdownMenuLabel className="flex items-center justify-between">
              {t("topbar.notifications", "Notifications")}
              <Link to="/app/notifications" className="text-xs font-normal text-primary hover:underline">{t("common.viewAll", "View all")}</Link>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            {notifications.length === 0 ? (
              <p className="px-2 py-6 text-center text-sm text-muted-foreground">{t("common.noData", "No notifications")}</p>
            ) : (
              notifications.map((n) => (
                <DropdownMenuItem key={n.id} className="flex flex-col items-start gap-0.5 whitespace-normal" onSelect={() => navigate("/app/notifications")}>
                  <span className="text-sm font-medium">{n.title}</span>
                  <span className="line-clamp-2 text-xs text-muted-foreground">{n.body}</span>
                  <span className="text-[10px] text-muted-foreground">{timeAgo(n.sentAt)}</span>
                </DropdownMenuItem>
              ))
            )}
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="ml-1 flex items-center gap-2 rounded-full p-0.5 pr-2 transition-colors hover:bg-muted" aria-label="Account menu">
              <InitialsAvatar first={first} last={rest.join(" ")} src={avatarUrl} size="sm" />
              <span className="hidden text-sm font-medium sm:inline">{first}</span>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-60">
            <div className="flex items-center gap-3 p-2">
              <InitialsAvatar first={first} last={rest.join(" ")} src={avatarUrl} size="md" />
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold">{displayName}</p>
                {user ? <RoleBadge role={user.roleKey} /> : null}
              </div>
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem onSelect={() => navigate("/app/profile")}><User className="size-4" /> {t("topbar.profile", "My Profile")}</DropdownMenuItem>
            <DropdownMenuItem onSelect={() => navigate("/app/settings")}><Settings className="size-4" /> {t("topbar.settings", "Settings")}</DropdownMenuItem>
            <DropdownMenuItem onSelect={() => navigate("/app/help")}><HelpCircle className="size-4" /> {t("topbar.help", "Help")}</DropdownMenuItem>
            <DropdownMenuItem onSelect={() => { lock(); navigate("/lock"); }}><Lock className="size-4" /> {t("topbar.lock", "Lock screen")}</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-destructive focus:text-destructive" onSelect={() => { logout(); navigate("/login"); }}>
              <LogOut className="size-4" /> {t("auth.logout", "Log out")}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
