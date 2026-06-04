import { useAuthStore } from "@/store/auth";
import { ROLE_AREA } from "@/config/roles";

/** The route area for the currently signed-in user (e.g. "admin", "teacher"). */
export function currentArea(): string {
  const u = useAuthStore.getState().user;
  return u ? ROLE_AREA[u.roleKey] : "admin";
}

/** Build a route under the current user's area, e.g. areaRoute("students/abc"). */
export function areaRoute(path: string): string {
  return `/app/${currentArea()}/${path}`;
}
