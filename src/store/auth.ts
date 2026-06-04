import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { RoleKey, User } from "@/types";
import { setCurrentActor } from "@/lib/actor";
import { authService, resolveActor, resolveDisplay } from "@/data/services/authService";
import { useUiStore } from "@/store/ui";

interface AuthState {
  user: User | null;
  displayName: string;
  avatarUrl?: string;
  status: "idle" | "authenticating";
  locked: boolean;
  login: (username: string, password: string) => Promise<{ ok: boolean; error?: string; role?: RoleKey }>;
  logout: () => void;
  lock: () => void;
  unlock: () => void;
  /** Re-read the current user from the db (after profile/role changes). */
  refresh: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      displayName: "",
      avatarUrl: undefined,
      status: "idle",
      locked: false,
      login: async (username, password) => {
        set({ status: "authenticating" });
        const res = await authService.login(username, password);
        if (!res.ok || !res.user) {
          set({ status: "idle" });
          return { ok: false, error: res.error };
        }
        const user = res.user;
        const display = resolveDisplay(user);
        setCurrentActor(resolveActor(user));
        // adopt the user's language preference
        if (user.languagePref) useUiStore.getState().setLanguage(user.languagePref);
        set({ user, displayName: display.name, avatarUrl: display.avatarUrl, status: "idle", locked: false });
        return { ok: true, role: user.roleKey };
      },
      logout: () => {
        setCurrentActor({ userId: "system", name: "System", role: "admin" });
        set({ user: null, displayName: "", avatarUrl: undefined, locked: false });
      },
      lock: () => set({ locked: true }),
      unlock: () => set({ locked: false }),
      refresh: () => {
        const u = get().user;
        if (!u) return;
        const display = resolveDisplay(u);
        set({ displayName: display.name, avatarUrl: display.avatarUrl });
      },
    }),
    {
      name: "ems-auth",
      partialize: (s) => ({ user: s.user, displayName: s.displayName, avatarUrl: s.avatarUrl, locked: s.locked }),
      onRehydrateStorage: () => (state) => {
        if (state?.user) setCurrentActor(resolveActor(state.user));
      },
    },
  ),
);
