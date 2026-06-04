import { useState } from "react";
import { Mic, MicOff, MonitorUp, PhoneOff, Users, Video, VideoOff } from "lucide-react";
import { PageHeader, DemoBadge } from "@/components/shared/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { InitialsAvatar } from "@/components/shared/InitialsAvatar";
import { toast } from "@/components/ui/sonner";
import { db } from "@/data/db";
import { useAuthStore } from "@/store/auth";
import { fullName } from "@/lib/format";
import { cn } from "@/lib/utils";

export function LiveVideoRoom() {
  const me = useAuthStore((s) => s.displayName);
  const live = db.getAll("liveClasses")[0];
  const [joined, setJoined] = useState(false);
  const [mic, setMic] = useState(true);
  const [cam, setCam] = useState(true);

  const participants = db.getAll("students").slice(0, 7).map((s) => fullName(s.firstName, s.lastName));
  const host = live?.hostStaffId ? db.getById("staff", live.hostStaffId) : null;

  return (
    <div className="space-y-5">
      <PageHeader
        title="Live Video"
        icon={<Video className="size-5" />}
        description={live ? live.title : "Host or join a live class / event."}
        actions={<DemoBadge />}
      />

      <div className="grid gap-4 lg:grid-cols-4">
        <Card className="overflow-hidden lg:col-span-3">
          <div className="relative flex aspect-video items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800 text-white">
            {joined ? (
              <>
                <div className="text-center">
                  <div className="mx-auto mb-3 flex size-24 items-center justify-center rounded-full bg-white/10 text-3xl font-bold">{me.split(" ").map((n) => n[0]).join("").slice(0, 2)}</div>
                  <p className="text-sm text-white/70">{cam ? "You're live" : "Camera off"}</p>
                </div>
                <span className="absolute left-3 top-3 flex items-center gap-1.5 rounded-full bg-destructive px-2 py-1 text-xs font-semibold"><span className="size-2 animate-pulse rounded-full bg-white" /> LIVE</span>
                <div className="absolute bottom-3 right-3 flex size-24 items-center justify-center rounded-lg border border-white/20 bg-black/40 text-xs">Host: {host?.firstName ?? "—"}</div>
              </>
            ) : (
              <div className="text-center">
                <Video className="mx-auto mb-3 size-12 text-white/40" />
                <p className="text-white/70">Ready to join the live class</p>
              </div>
            )}
          </div>
          <CardContent className="flex items-center justify-center gap-2 py-4">
            {joined ? (
              <>
                <Button variant={mic ? "secondary" : "destructive"} size="icon" className="rounded-full" onClick={() => setMic((m) => !m)}>{mic ? <Mic className="size-4" /> : <MicOff className="size-4" />}</Button>
                <Button variant={cam ? "secondary" : "destructive"} size="icon" className="rounded-full" onClick={() => setCam((c) => !c)}>{cam ? <Video className="size-4" /> : <VideoOff className="size-4" />}</Button>
                <Button variant="secondary" size="icon" className="rounded-full" onClick={() => toast.success("Screen sharing started (demo)")}><MonitorUp className="size-4" /></Button>
                <Button variant="destructive" className="rounded-full" onClick={() => { setJoined(false); toast("You left the room"); }}><PhoneOff className="size-4" /> Leave</Button>
              </>
            ) : (
              <Button size="lg" onClick={() => { setJoined(true); toast.success("Joined the live class (demo)"); }}><Video className="size-4" /> Join now</Button>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2"><CardTitle className="flex items-center gap-2 text-base"><Users className="size-4" /> Participants <Badge variant="secondary">{joined ? participants.length + 1 : 0}</Badge></CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {joined ? (
              <>
                <div className="flex items-center gap-2 rounded-lg bg-primary/5 px-2 py-1.5">
                  <InitialsAvatar first={me.split(" ")[0]} last={me.split(" ")[1]} size="sm" />
                  <span className="text-sm font-medium">{me} (you)</span>
                  <span className={cn("ml-auto", mic ? "text-success" : "text-muted-foreground")}>{mic ? <Mic className="size-3.5" /> : <MicOff className="size-3.5" />}</span>
                </div>
                {participants.map((p) => (
                  <div key={p} className="flex items-center gap-2 px-2 py-1.5">
                    <InitialsAvatar first={p.split(" ")[0]} last={p.split(" ")[1]} size="sm" />
                    <span className="text-sm">{p}</span>
                    <Mic className="ml-auto size-3.5 text-muted-foreground" />
                  </div>
                ))}
              </>
            ) : <p className="py-4 text-center text-sm text-muted-foreground">Join to see participants.</p>}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
