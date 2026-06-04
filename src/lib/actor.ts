import type { RoleKey } from "@/types";

export interface Actor {
  userId: string;
  name: string;
  role: RoleKey;
}

let current: Actor = { userId: "system", name: "System", role: "admin" };

export function setCurrentActor(actor: Actor) {
  current = actor;
}

export function getCurrentActor(): Actor {
  return current;
}
