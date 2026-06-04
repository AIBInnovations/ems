import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Bell, Mail, MessageCircle, Phone, Send, Smartphone } from "lucide-react";
import { PageHeader, DemoBadge } from "@/components/shared/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { StatusPill } from "@/components/shared/StatusPill";
import { EmptyState } from "@/components/shared/EmptyState";
import { toast } from "@/components/ui/sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useResourceList } from "@/hooks/useResource";
import { notificationService } from "@/data/services";
import { useCan } from "@/lib/rbac";
import { timeAgo } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { Audience, NotificationChannel } from "@/types";

const CHANNELS: { key: NotificationChannel; label: string; icon: typeof Mail }[] = [
  { key: "whatsapp", label: "WhatsApp", icon: MessageCircle },
  { key: "sms", label: "SMS", icon: Phone },
  { key: "email", label: "Email", icon: Mail },
  { key: "push", label: "Push", icon: Smartphone },
];

const AUDIENCES: { value: Audience; label: string }[] = [
  { value: "all", label: "Everyone" },
  { value: "students", label: "All students" },
  { value: "parents", label: "All parents" },
  { value: "teachers", label: "All teachers" },
  { value: "employees", label: "All employees" },
];

export function NotificationCenter() {
  const { t } = useTranslation();
  const can = useCan();
  const canSend = can({ permission: "notify.send" });
  const { data, loading, refresh } = useResourceList(notificationService);

  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [audience, setAudience] = useState<Audience>("all");
  const [channels, setChannels] = useState<NotificationChannel[]>(["push", "sms"]);
  const [sending, setSending] = useState(false);

  const toggleChannel = (c: NotificationChannel) =>
    setChannels((prev) => (prev.includes(c) ? prev.filter((x) => x !== c) : [...prev, c]));

  const send = async () => {
    if (!title.trim() || !body.trim() || channels.length === 0) {
      toast.error("Add a title, message and at least one channel.");
      return;
    }
    setSending(true);
    try {
      const n = await notificationService.send({ title, body, audience, channels });
      toast.success(`Sent to ${n.deliveryLog.length / channels.length} recipients across ${channels.length} channel(s)`);
      setTitle("");
      setBody("");
      refresh();
    } finally {
      setSending(false);
    }
  };

  const sentLog = [...data].filter((n) => n.status === "sent").sort((a, b) => (b.sentAt ?? "").localeCompare(a.sentAt ?? ""));

  return (
    <div className="space-y-6">
      <PageHeader
        title={t("nav.notifications", "Notification Center")}
        icon={<Bell className="size-5" />}
        description="Compose and broadcast across WhatsApp, SMS, Email and push."
        actions={<DemoBadge />}
      />

      <div className="grid gap-5 lg:grid-cols-5">
        {canSend ? (
          <Card className="lg:col-span-2">
            <CardHeader className="pb-3"><CardTitle className="text-base">Compose</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="ntitle">Title</Label>
                <Input id="ntitle" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Holiday Notice" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="nbody">Message</Label>
                <Textarea id="nbody" value={body} onChange={(e) => setBody(e.target.value)} placeholder="Type your message…" className="min-h-[110px]" />
              </div>
              <div className="space-y-1.5">
                <Label>Audience</Label>
                <Select value={audience} onValueChange={(v) => setAudience(v as Audience)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {AUDIENCES.map((a) => <SelectItem key={a.value} value={a.value}>{a.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Channels</Label>
                <div className="flex flex-wrap gap-2">
                  {CHANNELS.map((c) => {
                    const on = channels.includes(c.key);
                    const Icon = c.icon;
                    return (
                      <button key={c.key} type="button" onClick={() => toggleChannel(c.key)} className={cn("inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm transition-colors", on ? "border-primary bg-primary/10 text-primary" : "border-border hover:bg-muted")}>
                        <Icon className="size-4" /> {c.label}
                      </button>
                    );
                  })}
                </div>
              </div>
              <Button className="w-full" onClick={send} loading={sending}><Send className="size-4" /> Send notification</Button>
            </CardContent>
          </Card>
        ) : null}

        <Card className={canSend ? "lg:col-span-3" : "lg:col-span-5"}>
          <CardHeader className="pb-3"><CardTitle className="text-base">Sent log</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {loading ? (
              <p className="py-6 text-center text-sm text-muted-foreground">{t("common.loading", "Loading…")}</p>
            ) : sentLog.length === 0 ? (
              <EmptyState title="No notifications yet" description="Sent messages will appear here." />
            ) : (
              sentLog.map((n) => (
                <div key={n.id} className="rounded-lg border border-border p-3">
                  <div className="flex items-start justify-between gap-2">
                    <p className="font-medium">{n.title}</p>
                    <StatusPill status="sent" />
                  </div>
                  <p className="mt-0.5 line-clamp-2 text-sm text-muted-foreground">{n.body}</p>
                  <div className="mt-2 flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground">
                    <Badge variant="outline" className="capitalize">{n.audience}</Badge>
                    {n.channels.map((c) => <Badge key={c} variant="secondary" className="capitalize">{c}</Badge>)}
                    <span className="ml-auto">{Math.round(n.deliveryLog.length / Math.max(1, n.channels.length))} recipients · {timeAgo(n.sentAt)}</span>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
