import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { Moon, Search, Sun } from "lucide-react";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import { useUiStore } from "@/store/ui";
import { useAuthStore } from "@/store/auth";
import { useCan } from "@/lib/rbac";
import { NAVIGATION } from "@/config/navigation";
import { ROLE_AREA } from "@/config/roles";
import { db } from "@/data/db";
import { fullName } from "@/lib/format";

export function CommandPalette() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const open = useUiStore((s) => s.commandOpen);
  const setOpen = useUiStore((s) => s.setCommandOpen);
  const toggleTheme = useUiStore((s) => s.toggleTheme);
  const user = useAuthStore((s) => s.user);
  const can = useCan();

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if ((e.key === "k" || e.key === "K") && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen(!open);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, [open, setOpen]);

  if (!user) return null;
  const area = ROLE_AREA[user.roleKey];
  const navItems = (NAVIGATION[area] ?? [])
    .flatMap((s) => s.items)
    .filter((it) => it.to && can({ permission: it.permission, service: it.service }));

  // entity quick-jumps (students/staff) where permitted
  const canStudents = can({ permission: "student.view" });
  const students = canStudents ? db.getAll("students").slice(0, 30) : [];

  const go = (to: string) => {
    setOpen(false);
    navigate(to);
  };

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput placeholder={t("common.searchPlaceholder", "Search pages, students, actions…")} />
      <CommandList>
        <CommandEmpty>{t("common.noData", "No results found.")}</CommandEmpty>
        <CommandGroup heading={t("common.search", "Pages")}>
          {navItems.map((it) => {
            const Icon = it.icon;
            return (
              <CommandItem key={it.key} value={it.label} onSelect={() => go(it.to!)}>
                {Icon ? <Icon className="size-4" /> : <Search className="size-4" />}
                {t(it.labelKey ?? it.label, it.label)}
              </CommandItem>
            );
          })}
        </CommandGroup>
        {students.length > 0 ? (
          <>
            <CommandSeparator />
            <CommandGroup heading="Students">
              {students.map((s) => (
                <CommandItem key={s.id} value={`student ${fullName(s.firstName, s.lastName)} ${s.admissionNo}`} onSelect={() => go(`/app/${area}/students/${s.id}`)}>
                  <Search className="size-4" /> {fullName(s.firstName, s.lastName)} · {s.rollNo}
                </CommandItem>
              ))}
            </CommandGroup>
          </>
        ) : null}
        <CommandSeparator />
        <CommandGroup heading="Quick actions">
          <CommandItem value="toggle theme dark light" onSelect={() => { toggleTheme(); setOpen(false); }}>
            <Sun className="size-4 dark:hidden" /><Moon className="hidden size-4 dark:block" /> Toggle theme
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}
