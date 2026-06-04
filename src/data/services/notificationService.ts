import { db } from "@/data/db";
import { latency } from "@/lib/latency";
import { nowISO } from "@/lib/clock";
import { fullName } from "@/lib/format";
import { logActivity } from "@/lib/activity";
import { createCrudService } from "@/lib/createService";
import type { Audience, Notification, NotificationChannel } from "@/types";

export interface ComposePayload {
  title: string;
  body: string;
  audience: Audience;
  audienceRefs?: string[];
  channels: NotificationChannel[];
  category?: Notification["category"];
}

/** Resolve an audience selector to concrete recipient {id,name} pairs. */
export function resolveRecipients(audience: Audience, refs: string[] = []): { id: string; name: string }[] {
  switch (audience) {
    case "all": {
      const students = db.getAll("students").map((s) => ({ id: s.id, name: fullName(s.firstName, s.lastName) }));
      const staff = db.getAll("staff").map((s) => ({ id: s.id, name: fullName(s.firstName, s.lastName) }));
      const guardians = db.getAll("guardians").map((g) => ({ id: g.id, name: fullName(g.firstName, g.lastName) }));
      return [...students, ...staff, ...guardians];
    }
    case "students":
      return db.getAll("students").map((s) => ({ id: s.id, name: fullName(s.firstName, s.lastName) }));
    case "teachers":
      return db
        .query("staff", (s) => s.roleKey === "class_teacher" || s.roleKey === "subject_teacher")
        .map((s) => ({ id: s.id, name: fullName(s.firstName, s.lastName) }));
    case "employees":
      return db.getAll("staff").map((s) => ({ id: s.id, name: fullName(s.firstName, s.lastName) }));
    case "parents":
      return db.getAll("guardians").map((g) => ({ id: g.id, name: fullName(g.firstName, g.lastName) }));
    case "class":
      return db
        .query("students", (s) => refs.includes(s.classId) || refs.includes(s.sectionId))
        .map((s) => ({ id: s.id, name: fullName(s.firstName, s.lastName) }));
    case "member":
    case "role":
      return refs.map((id) => {
        const s = db.getById("staff", id) ?? db.getById("students", id);
        return { id, name: s ? fullName((s as { firstName: string }).firstName, (s as { lastName: string }).lastName) : id };
      });
    default:
      return [];
  }
}

const base = createCrudService("notifications", { label: (n) => n.title, origin: "Communication", noun: "notification" });

export const notificationService = {
  ...base,

  async send(payload: ComposePayload): Promise<Notification> {
    await latency(150, 450);
    const recipients = resolveRecipients(payload.audience, payload.audienceRefs);
    const deliveryLog = recipients.flatMap((r) =>
      payload.channels.map((channel) => ({ recipientId: r.id, recipientName: r.name, channel, status: "sent" as const })),
    );
    const notif = db.insert("notifications", {
      title: payload.title,
      body: payload.body,
      audience: payload.audience,
      audienceRefs: payload.audienceRefs ?? [],
      channels: payload.channels,
      attachments: [],
      status: "sent",
      sentAt: nowISO(),
      category: payload.category ?? "general",
      deliveryLog,
    });
    logActivity("send", "notifications", notif.id, `Sent "${payload.title}" to ${recipients.length} recipient(s)`);
    return notif;
  },

  /** Quick helper used by fee reminders / attendance alerts elsewhere. */
  async quick(title: string, body: string, audience: Audience, category: Notification["category"], refs?: string[]) {
    return this.send({ title, body, audience, channels: ["push", "sms"], category, audienceRefs: refs });
  },
};
