import { useAuthStore } from "@/store/auth";
import { useServicesStore } from "@/store/services";
import { staticHasPermission } from "@/config/roles";
import type { AccessQuery, PermissionKey, RoleKey } from "@/types";

interface RbacInputs {
  role: RoleKey;
  userActive: boolean;
  schoolActive: boolean;
  isLive: (key?: string) => boolean;
  hasGrant: (role: RoleKey, key: string) => boolean | undefined;
}

/** Resolve a permission: static matrix, overridable by an explicit runtime grant. */
export function resolvePermission(
  role: RoleKey,
  key: PermissionKey,
  hasGrant: (role: RoleKey, key: string) => boolean | undefined,
): boolean {
  const grant = hasGrant(role, key);
  if (grant !== undefined) return grant;
  return staticHasPermission(role, key);
}

export function canAccess(inputs: RbacInputs, query: AccessQuery): boolean {
  if (!inputs.userActive || !inputs.schoolActive) return inputs.role === "super_admin";
  if (query.service && !inputs.isLive(query.service)) return false;
  if (query.permission && !resolvePermission(inputs.role, query.permission, inputs.hasGrant)) return false;
  if (query.deleteEntity) {
    // delete needs either the universal capability OR a per-entity grant
    const universal = resolvePermission(inputs.role, "delete.execute", inputs.hasGrant);
    const perEntity = inputs.hasGrant(inputs.role, `delete.${query.deleteEntity}`);
    if (!universal && perEntity !== true) return false;
  }
  return true;
}

/** Reactive access checker bound to the current session + service registry. */
export function useCan(): (query: AccessQuery) => boolean {
  const user = useAuthStore((s) => s.user);
  const isLive = useServicesStore((s) => s.isLive);
  const hasGrant = useServicesStore((s) => s.hasGrant);
  const schoolActive = useServicesStore((s) => s.schoolActive);

  return (query: AccessQuery) => {
    if (!user) return false;
    return canAccess(
      {
        role: user.roleKey,
        userActive: user.status === "active",
        schoolActive,
        isLive,
        hasGrant,
      },
      query,
    );
  };
}

/** Non-hook variant for guards/loaders. */
export function canAccessNow(query: AccessQuery): boolean {
  const user = useAuthStore.getState().user;
  if (!user) return false;
  const svc = useServicesStore.getState();
  return canAccess(
    {
      role: user.roleKey,
      userActive: user.status === "active",
      schoolActive: svc.schoolActive,
      isLive: svc.isLive,
      hasGrant: svc.hasGrant,
    },
    query,
  );
}
