import { db } from "@/data/db";
import { latency } from "@/lib/latency";
import { nowISO } from "@/lib/clock";
import { fullName } from "@/lib/format";
import type { Actor } from "@/lib/actor";
import { ROLE_LABELS, type User } from "@/types";

export interface LoginResult {
  ok: boolean;
  user?: User;
  error?: string;
}

/** Resolve a friendly display name for a user from its linked profile. */
export function resolveDisplay(user: User): { name: string; avatarUrl?: string; subtitle: string } {
  let name = user.username;
  let avatarUrl = user.avatarUrl;
  if (user.linkedProfileType === "staff" && user.linkedProfileId) {
    const s = db.getById("staff", user.linkedProfileId);
    if (s) {
      name = fullName(s.firstName, s.lastName);
      avatarUrl = avatarUrl ?? s.photoUrl;
    }
  } else if (user.linkedProfileType === "student" && user.linkedProfileId) {
    const s = db.getById("students", user.linkedProfileId);
    if (s) {
      name = fullName(s.firstName, s.lastName);
      avatarUrl = avatarUrl ?? s.photoUrl;
    }
  } else if (user.linkedProfileType === "guardian" && user.linkedProfileId) {
    const g = db.getById("guardians", user.linkedProfileId);
    if (g) {
      name = fullName(g.firstName, g.lastName);
      avatarUrl = avatarUrl ?? g.photoUrl;
    }
  }
  return { name, avatarUrl, subtitle: ROLE_LABELS[user.roleKey] };
}

export function resolveActor(user: User): Actor {
  return { userId: user.id, name: resolveDisplay(user).name, role: user.roleKey };
}

/** Is login currently permitted school-wide (Super Admin cascade)? */
export function schoolLoginActive(roleKey: User["roleKey"]): boolean {
  const school = db.getAll("schools")[0];
  if (!school?.isActive && roleKey !== "super_admin") return false;
  const adminUser = db.query("users", (u) => u.roleKey === "admin")[0];
  if (adminUser && adminUser.status !== "active" && roleKey !== "super_admin") return false;
  return true;
}

export const authService = {
  async login(username: string, password: string): Promise<LoginResult> {
    await latency(150, 400);
    const user = db.query("users", (u) => u.username.toLowerCase() === username.trim().toLowerCase())[0];
    if (!user) return { ok: false, error: "No account found with that username." };
    if (user.passwordHash !== password) return { ok: false, error: "Incorrect password. Try the demo password." };
    if (user.status !== "active") return { ok: false, error: "This account has been deactivated. Contact your administrator." };
    if (!schoolLoginActive(user.roleKey)) return { ok: false, error: "Your school's access is currently deactivated." };
    db.update("users", user.id, { lastLoginAt: nowISO() });
    return { ok: true, user };
  },

  async forgotPassword(identifier: string): Promise<{ ok: boolean; code?: string }> {
    await latency(200, 500);
    const user = db.query(
      "users",
      (u) => u.username.toLowerCase() === identifier.trim().toLowerCase() || u.email?.toLowerCase() === identifier.trim().toLowerCase(),
    )[0];
    // Always succeed (don't leak which accounts exist); return a demo OTP.
    return { ok: true, code: user ? "246813" : "246813" };
  },

  async resetPassword(identifier: string, code: string, newPassword: string): Promise<{ ok: boolean; error?: string }> {
    await latency(200, 500);
    if (code !== "246813") return { ok: false, error: "Invalid or expired reset code." };
    const user = db.query(
      "users",
      (u) => u.username.toLowerCase() === identifier.trim().toLowerCase() || u.email?.toLowerCase() === identifier.trim().toLowerCase(),
    )[0];
    if (user) db.update("users", user.id, { passwordHash: newPassword });
    return { ok: true };
  },

  verifyPin(userId: string, pin: string): boolean {
    const user = db.getById("users", userId);
    return !!user && user.pinHash === pin;
  },
};
