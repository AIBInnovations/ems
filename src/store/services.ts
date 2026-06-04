import { create } from "zustand";
import { db } from "@/data/db";
import { logActivity } from "@/lib/activity";
import type { PermissionKey, RoleKey, ServiceModule } from "@/types";

interface ServiceLive {
  enabled: boolean;
  visible: boolean;
}

interface ServicesState {
  services: Record<string, ServiceLive>;
  modules: ServiceModule[];
  schoolActive: boolean;
  grants: { roleKey: RoleKey; permissionKey: string; allowed: boolean }[];
  isLive: (key?: string) => boolean;
  hasGrant: (role: RoleKey, key: PermissionKey | string) => boolean | undefined;
  setEnabled: (key: string, enabled: boolean) => void;
  setVisible: (key: string, visible: boolean) => void;
  setSchoolActive: (active: boolean) => void;
  grant: (role: RoleKey, key: string, allowed: boolean) => void;
  reload: () => void;
}

function readServices(): { services: Record<string, ServiceLive>; modules: ServiceModule[] } {
  const modules = db.getAll("serviceModules");
  const services: Record<string, ServiceLive> = {};
  for (const m of modules) services[m.key] = { enabled: m.isEnabled, visible: m.isVisible };
  return { services, modules };
}

function readSchoolActive(): boolean {
  const school = db.getAll("schools")[0];
  if (!school?.isActive) return false;
  const adminUser = db.query("users", (u) => u.roleKey === "admin")[0];
  if (adminUser && adminUser.status !== "active") return false;
  return true;
}

export const useServicesStore = create<ServicesState>((set, get) => ({
  ...readServices(),
  schoolActive: readSchoolActive(),
  grants: db.getAll("rolePermissions").map((r) => ({ roleKey: r.roleKey, permissionKey: r.permissionKey, allowed: r.allowed })),

  isLive: (key) => {
    if (!key) return true;
    const s = get().services[key];
    return s ? s.enabled && s.visible : true;
  },
  hasGrant: (role, key) => {
    const g = get().grants.find((x) => x.roleKey === role && x.permissionKey === key);
    return g?.allowed;
  },
  setEnabled: (key, enabled) => {
    const mod = db.query("serviceModules", (m) => m.key === key)[0];
    if (mod) db.update("serviceModules", mod.id, { isEnabled: enabled });
    logActivity(enabled ? "enable" : "disable", "serviceModules", key, `${enabled ? "Activated" : "Deactivated"} service: ${key}`);
    set((st) => ({ services: { ...st.services, [key]: { ...st.services[key], enabled } } }));
  },
  setVisible: (key, visible) => {
    const mod = db.query("serviceModules", (m) => m.key === key)[0];
    if (mod) db.update("serviceModules", mod.id, { isVisible: visible });
    logActivity(visible ? "unhide" : "hide", "serviceModules", key, `${visible ? "Unhid" : "Hid"} service: ${key}`);
    set((st) => ({ services: { ...st.services, [key]: { ...st.services[key], visible } } }));
  },
  setSchoolActive: (active) => {
    const school = db.getAll("schools")[0];
    if (school) db.update("schools", school.id, { isActive: active });
    logActivity(active ? "activate" : "deactivate", "schools", school?.id ?? "", `${active ? "Activated" : "Deactivated"} school (cascade)`);
    set({ schoolActive: readSchoolActive() });
  },
  grant: (role, key, allowed) => {
    const existing = db.query("rolePermissions", (r) => r.roleKey === role && r.permissionKey === key)[0];
    if (existing) db.update("rolePermissions", existing.id, { allowed });
    else db.insert("rolePermissions", { roleKey: role, permissionKey: key, allowed });
    logActivity("grant", "rolePermissions", role, `${allowed ? "Granted" : "Revoked"} ${key} for ${role}`);
    set({ grants: db.getAll("rolePermissions").map((r) => ({ roleKey: r.roleKey, permissionKey: r.permissionKey, allowed: r.allowed })) });
  },
  reload: () => set({ ...readServices(), schoolActive: readSchoolActive(), grants: db.getAll("rolePermissions").map((r) => ({ roleKey: r.roleKey, permissionKey: r.permissionKey, allowed: r.allowed })) }),
}));
