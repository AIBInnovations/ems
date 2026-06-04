import { useMemo, useState } from "react";
import { Check, MessageSquare, Plus, Search, Send, Users } from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { InitialsAvatar } from "@/components/shared/InitialsAvatar";
import { EmptyState } from "@/components/shared/EmptyState";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "@/components/ui/sonner";
import { db } from "@/data/db";
import { chatMessageService, chatThreadService } from "@/data/services";
import { resolveDisplay } from "@/data/services/authService";
import { useAuthStore } from "@/store/auth";
import { useCan } from "@/lib/rbac";
import { nowISO } from "@/lib/clock";
import { timeAgo } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { ChatThread } from "@/types";

function userName(userId: string): string {
  const u = db.getById("users", userId);
  return u ? resolveDisplay(u).name : "Unknown";
}

export function ChatScreen() {
  const me = useAuthStore((s) => s.user);
  const can = useCan();
  const canCreateGroup = can({ permission: "chat.group.create" });
  const [tick, setTick] = useState(0);
  const refresh = () => setTick((t) => t + 1);

  const threads = useMemo(() => {
    void tick;
    return db
      .query("chatThreads", (t) => !!me && t.memberUserIds.includes(me.id))
      .sort((a, b) => (b.lastMessageAt ?? b.createdAt).localeCompare(a.lastMessageAt ?? a.createdAt));
  }, [me, tick]);

  const [activeId, setActiveId] = useState<string | null>(threads[0]?.id ?? null);
  const active = activeId ? db.getById("chatThreads", activeId) : threads[0] ?? null;
  const [text, setText] = useState("");
  const [groupOpen, setGroupOpen] = useState(false);

  const messages = useMemo(() => {
    void tick;
    return active ? db.query("chatMessages", (m) => m.threadId === active.id).sort((a, b) => a.sentAt.localeCompare(b.sentAt)) : [];
  }, [active, tick]);

  const threadTitle = (t: ChatThread) => t.title ?? userName(t.memberUserIds.find((id) => id !== me?.id) ?? t.memberUserIds[0]);

  const send = async () => {
    if (!text.trim() || !active || !me) return;
    await chatMessageService.create({ threadId: active.id, senderUserId: me.id, text: text.trim(), attachments: [], sentAt: nowISO(), readBy: [me.id] });
    db.update("chatThreads", active.id, { lastMessageAt: nowISO() });
    setText("");
    refresh();
  };

  return (
    <div className="space-y-5">
      <PageHeader
        title="Chat & Groups"
        icon={<MessageSquare className="size-5" />}
        description="Direct messages and class/parent groups."
        actions={canCreateGroup ? <Button onClick={() => setGroupOpen(true)}><Plus className="size-4" /> New group</Button> : undefined}
      />

      <Card className="grid h-[600px] grid-cols-1 overflow-hidden md:grid-cols-[300px_1fr]">
        {/* conversation list */}
        <div className="hidden flex-col border-r border-border md:flex">
          <div className="relative p-3">
            <Search className="pointer-events-none absolute left-5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Search chats" className="h-9 pl-8" />
          </div>
          <ScrollArea className="flex-1">
            {threads.map((t) => {
              const last = db.query("chatMessages", (m) => m.threadId === t.id).slice(-1)[0];
              return (
                <button key={t.id} onClick={() => setActiveId(t.id)} className={cn("flex w-full items-center gap-3 px-3 py-2.5 text-left transition-colors hover:bg-muted", active?.id === t.id && "bg-muted")}>
                  {t.kind === "group" ? (
                    <span className="flex size-10 items-center justify-center rounded-full bg-primary/15 text-primary"><Users className="size-5" /></span>
                  ) : (
                    <InitialsAvatar first={threadTitle(t).split(" ")[0]} last={threadTitle(t).split(" ")[1]} size="md" />
                  )}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <p className="truncate text-sm font-medium">{threadTitle(t)}</p>
                      <span className="shrink-0 text-[10px] text-muted-foreground">{last ? timeAgo(last.sentAt) : ""}</span>
                    </div>
                    <p className="truncate text-xs text-muted-foreground">{last?.text ?? "No messages yet"}</p>
                  </div>
                </button>
              );
            })}
          </ScrollArea>
        </div>

        {/* thread */}
        <div className="flex flex-col">
          {active ? (
            <>
              <div className="flex items-center gap-3 border-b border-border p-3">
                {active.kind === "group" ? <span className="flex size-9 items-center justify-center rounded-full bg-primary/15 text-primary"><Users className="size-4" /></span> : <InitialsAvatar first={threadTitle(active).split(" ")[0]} last={threadTitle(active).split(" ")[1]} size="sm" />}
                <div>
                  <p className="text-sm font-semibold">{threadTitle(active)}</p>
                  <p className="text-xs text-muted-foreground">{active.kind === "group" ? `${active.memberUserIds.length} members` : "Direct message"}</p>
                </div>
              </div>
              <ScrollArea className="flex-1 bg-muted/20 p-4">
                <div className="space-y-2">
                  {messages.map((m) => {
                    const mine = m.senderUserId === me?.id;
                    return (
                      <div key={m.id} className={cn("flex", mine ? "justify-end" : "justify-start")}>
                        <div className={cn("max-w-[75%] rounded-2xl px-3 py-2 text-sm", mine ? "rounded-br-sm bg-primary text-primary-foreground" : "rounded-bl-sm bg-card border border-border")}>
                          {active.kind === "group" && !mine ? <p className="mb-0.5 text-[11px] font-semibold text-primary">{userName(m.senderUserId)}</p> : null}
                          {m.text}
                          <span className={cn("ml-2 text-[10px]", mine ? "text-primary-foreground/70" : "text-muted-foreground")}>{timeAgo(m.sentAt)}</span>
                        </div>
                      </div>
                    );
                  })}
                  {messages.length === 0 ? <p className="py-8 text-center text-sm text-muted-foreground">Say hello 👋</p> : null}
                </div>
              </ScrollArea>
              <div className="flex items-center gap-2 border-t border-border p-3">
                <Input value={text} onChange={(e) => setText(e.target.value)} onKeyDown={(e) => e.key === "Enter" && send()} placeholder="Type a message…" />
                <Button size="icon" onClick={send} disabled={!text.trim()}><Send className="size-4" /></Button>
              </div>
            </>
          ) : (
            <EmptyState icon={MessageSquare} title="No conversations" description="Start a new group or wait for a message." className="m-auto border-0" />
          )}
        </div>
      </Card>

      {canCreateGroup ? <NewGroupDialog open={groupOpen} onOpenChange={setGroupOpen} onCreated={(id) => { setActiveId(id); refresh(); }} /> : null}
    </div>
  );
}

function NewGroupDialog({ open, onOpenChange, onCreated }: { open: boolean; onOpenChange: (o: boolean) => void; onCreated: (id: string) => void }) {
  const me = useAuthStore((s) => s.user);
  const [title, setTitle] = useState("");
  const [selected, setSelected] = useState<string[]>([]);
  const candidates = useMemo(() => db.getAll("users").filter((u) => u.id !== me?.id).slice(0, 40), [me]);

  const toggle = (id: string) => setSelected((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));
  const allSelected = selected.length === candidates.length;

  const create = async () => {
    if (!title.trim() || !me) return;
    const thread = await chatThreadService.create({ kind: "group", title: title.trim(), memberUserIds: [me.id, ...selected], adminUserIds: [me.id], createdByUserId: me.id, lastMessageAt: nowISO() });
    toast.success(`Group "${title}" created with ${selected.length + 1} members`);
    onCreated(thread.id);
    onOpenChange(false);
    setTitle("");
    setSelected([]);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader><DialogTitle>New group</DialogTitle></DialogHeader>
        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label htmlFor="gt">Group name</Label>
            <Input id="gt" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Class 8-B Parents" />
          </div>
          <div className="flex items-center justify-between">
            <Label>Members <Badge variant="secondary">{selected.length}</Badge></Label>
            <Button variant="ghost" size="sm" onClick={() => setSelected(allSelected ? [] : candidates.map((c) => c.id))}>{allSelected ? "Clear" : "Select all"}</Button>
          </div>
          <ScrollArea className="h-56 rounded-md border border-border">
            {candidates.map((u) => {
              const d = resolveDisplay(u);
              const on = selected.includes(u.id);
              return (
                <button key={u.id} onClick={() => toggle(u.id)} className={cn("flex w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-muted", on && "bg-primary/5")}>
                  <span className={cn("flex size-4 items-center justify-center rounded border", on ? "border-primary bg-primary text-primary-foreground" : "border-input")}>{on ? <Check className="size-3" /> : null}</span>
                  <InitialsAvatar first={d.name.split(" ")[0]} last={d.name.split(" ")[1]} size="sm" />
                  <span className="flex-1 truncate">{d.name}</span>
                  <span className="text-xs capitalize text-muted-foreground">{u.roleKey.replace(/_/g, " ")}</span>
                </button>
              );
            })}
          </ScrollArea>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={create} disabled={!title.trim()}>Create group</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
