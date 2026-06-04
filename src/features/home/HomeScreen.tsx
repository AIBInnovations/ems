import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Award, CalendarDays, ChevronRight, Crown, Megaphone, Play, Sparkles, Star, Trophy, Wallet } from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { toast } from "@/components/ui/sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { InitialsAvatar } from "@/components/shared/InitialsAvatar";
import { StatCard } from "@/components/shared/StatCard";
import { useAuthStore } from "@/store/auth";
import { db } from "@/data/db";
import { fullName, formatMoney, formatDate } from "@/lib/format";
import { areaRoute } from "@/lib/routes";
import { cn } from "@/lib/utils";
import type { Student } from "@/types";

export function HomeScreen() {
  const user = useAuthStore((s) => s.user);

  const children = useMemo<Student[]>(() => {
    if (!user) return [];
    if (user.roleKey === "student" && user.linkedProfileId) {
      const s = db.getById("students", user.linkedProfileId);
      return s ? [s] : [];
    }
    if (user.roleKey === "parent" && user.linkedProfileId) {
      const g = db.getById("guardians", user.linkedProfileId);
      return (g?.studentIds ?? []).map((id) => db.getById("students", id)).filter(Boolean) as Student[];
    }
    return [];
  }, [user]);

  const [childId, setChildId] = useState(children[0]?.id ?? "");
  const child = children.find((c) => c.id === childId) ?? children[0];

  const data = useMemo(() => {
    if (!child) return null;
    const cls = db.getById("classes", child.classId);
    const card = db.query("reportCards", (r) => r.studentId === child.id).slice(-1)[0];
    const att = db.query("studentAttendance", (a) => a.studentId === child.id);
    const present = att.filter((a) => a.status === "present").length;
    const attPct = att.length ? Math.round((present / att.length) * 100) : 0;
    const dues = db.query("feeBills", (b) => b.studentId === child.id).reduce((s, b) => s + b.balance, 0);

    // class topper & top-3 by rank in the child's section
    const cards = db.query("reportCards", (r) => r.sectionId === child.sectionId).sort((a, b) => a.rank - b.rank);
    const top3 = cards.slice(0, 3).map((c) => ({ student: db.getById("students", c.studentId), pct: c.percentage, rank: c.rank }));
    // highest-rated teacher of the class
    const teacherIds = db.query("classSubjectTeachers", (c) => c.sectionId === child.sectionId).map((c) => c.teacherStaffId);
    const teachers = Array.from(new Set(teacherIds)).map((id) => db.getById("staff", id)).filter(Boolean);
    const topTeacher = teachers.sort((a, b) => (b!.rating ?? 0) - (a!.rating ?? 0))[0];

    const notices = db.getAll("notices").sort((a, b) => b.publishedAt.localeCompare(a.publishedAt)).slice(0, 3);
    const events = db.getAll("events").filter((e) => e.date >= new Date().toISOString().slice(0, 10)).sort((a, b) => a.date.localeCompare(b.date)).slice(0, 3);
    const charges = db.getAll("serviceCharges").filter((c) => c.visible);
    const prayer = db.getAll("prayers").find((p) => p.enabled);
    return { cls, card, attPct, dues, top3, topTeacher, notices, events, charges, prayer };
  }, [child]);

  // auto-rotate top-3
  const [slide, setSlide] = useState(0);
  useEffect(() => {
    if (!data?.top3.length) return;
    const t = setInterval(() => setSlide((s) => (s + 1) % data.top3.length), 4000);
    return () => clearInterval(t);
  }, [data?.top3.length]);

  if (!child || !data) {
    return (
      <div className="space-y-6">
        <PageHeader title="Home" />
        <Card><CardContent className="py-10 text-center text-muted-foreground">No linked student profile.</CardContent></Card>
      </div>
    );
  }

  const featured = data.top3[slide];

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Welcome, ${user?.roleKey === "parent" ? "Parent" : child.firstName}`}
        description={`${data.cls?.name ?? ""} · ${db.getById("sections", child.sectionId)?.name ?? ""}`}
        actions={
          children.length > 1 ? (
            <div className="flex items-center gap-1 rounded-lg border border-border bg-card p-1">
              {children.map((c) => (
                <button key={c.id} onClick={() => setChildId(c.id)} className={cn("flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-sm transition-colors", child.id === c.id ? "bg-primary text-primary-foreground" : "hover:bg-muted")}>
                  <InitialsAvatar first={c.firstName} last={c.lastName} size="sm" /> {c.firstName}
                </button>
              ))}
            </div>
          ) : undefined
        }
      />

      {/* quick stats */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Attendance" value={`${data.attPct}%`} icon={CalendarDays} tone="success" to={areaRoute("attendance")} />
        <StatCard label="Class Rank" value={data.card ? `#${data.card.rank}` : "—"} icon={Trophy} tone="accent" to={areaRoute("exams")} />
        <StatCard label="Last Result" value={data.card ? `${data.card.percentage}%` : "—"} icon={Award} tone="primary" to={areaRoute("exams")} />
        <StatCard label="Fees Due" value={formatMoney(data.dues)} icon={Wallet} tone={data.dues > 0 ? "danger" : "success"} to={areaRoute("fees")} />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        {/* Topper / Top-3 slider */}
        <Card className="overflow-hidden border-accent/30 bg-gradient-to-br from-accent/10 to-transparent lg:col-span-2">
          <CardHeader className="flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="flex items-center gap-2 text-base"><Crown className="size-4 text-amber-500" /> Class Toppers</CardTitle>
            <div className="flex gap-1">{data.top3.map((_, i) => <span key={i} className={cn("size-1.5 rounded-full", i === slide ? "bg-amber-500" : "bg-muted-foreground/30")} />)}</div>
          </CardHeader>
          <CardContent>
            {featured?.student ? (
              <div className="flex items-center gap-4">
                <div className="relative">
                  <InitialsAvatar first={featured.student.firstName} last={featured.student.lastName} size="lg" />
                  <span className="absolute -bottom-1 -right-1 flex size-6 items-center justify-center rounded-full bg-amber-500 text-xs font-bold text-white">{featured.rank}</span>
                </div>
                <div>
                  <p className="font-display text-lg font-bold">{fullName(featured.student.firstName, featured.student.lastName)}</p>
                  <p className="text-sm text-muted-foreground">Rank #{featured.rank} · {featured.pct}% in the latest exam</p>
                  <Badge variant="warning" className="mt-1 gap-1"><Sparkles className="size-3" /> Top performer</Badge>
                </div>
              </div>
            ) : <p className="text-sm text-muted-foreground">Results not published yet.</p>}
          </CardContent>
        </Card>

        {/* Highest-rated teacher */}
        <Card>
          <CardHeader className="pb-2"><CardTitle className="flex items-center gap-2 text-base"><Star className="size-4 text-amber-500" /> Top Teacher</CardTitle></CardHeader>
          <CardContent>
            {data.topTeacher ? (
              <div className="flex items-center gap-3">
                <InitialsAvatar first={data.topTeacher.firstName} last={data.topTeacher.lastName} size="md" />
                <div>
                  <p className="font-semibold">{fullName(data.topTeacher.firstName, data.topTeacher.lastName)}</p>
                  <p className="flex items-center gap-1 text-sm text-amber-600"><Star className="size-3.5 fill-current" /> {data.topTeacher.rating} rating</p>
                </div>
              </div>
            ) : <p className="text-sm text-muted-foreground">—</p>}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        {/* Notices */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="flex items-center gap-2 text-base"><Megaphone className="size-4" /> Notices & Circulars</CardTitle>
            <Button asChild variant="ghost" size="sm"><Link to={areaRoute("notifications")}>View all <ChevronRight className="size-4" /></Link></Button>
          </CardHeader>
          <CardContent className="space-y-3">
            {data.notices.map((n) => (
              <div key={n.id} className="flex items-start gap-3 rounded-lg border border-border p-3">
                <span className="mt-0.5 flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary"><Megaphone className="size-4" /></span>
                <div><p className="text-sm font-medium">{n.title}</p><p className="line-clamp-1 text-xs text-muted-foreground">{n.body}</p></div>
              </div>
            ))}
            {data.notices.length === 0 ? <p className="text-sm text-muted-foreground">No notices.</p> : null}
          </CardContent>
        </Card>

        {/* Events + Prayer + charges */}
        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-2"><CardTitle className="flex items-center gap-2 text-base"><CalendarDays className="size-4" /> Upcoming</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              {data.events.map((e) => (
                <div key={e.id} className="flex items-center justify-between text-sm">
                  <span>{e.title}</span><Badge variant="secondary">{formatDate(e.date, "dd MMM")}</Badge>
                </div>
              ))}
              {data.events.length === 0 ? <p className="text-sm text-muted-foreground">No upcoming events.</p> : null}
            </CardContent>
          </Card>
          {data.prayer ? (
            <Card className="border-accent/30 bg-gradient-to-br from-accent/5 to-transparent">
              <CardHeader className="pb-2"><CardTitle className="flex items-center gap-2 text-base"><Sparkles className="size-4 text-amber-500" /> {data.prayer.title}</CardTitle></CardHeader>
              <CardContent>
                {data.prayer.kind === "text" ? (
                  <p className="text-sm italic leading-6 text-muted-foreground">"{data.prayer.content}"</p>
                ) : (
                  <button onClick={() => toast.success("Playing school prayer (demo)")} className="flex w-full items-center gap-2 rounded-lg border border-border p-2.5 text-sm hover:bg-muted">
                    <span className="flex size-9 items-center justify-center rounded-full bg-primary/10 text-primary"><Play className="size-4" /></span>
                    Play {data.prayer.kind} prayer
                  </button>
                )}
              </CardContent>
            </Card>
          ) : null}
          {data.charges.length ? (
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-base">Service Charges</CardTitle></CardHeader>
              <CardContent className="space-y-1.5">
                {data.charges.map((c) => <div key={c.id} className="flex items-center justify-between text-sm"><span className="text-muted-foreground">{c.label}</span><span className="font-mono">{formatMoney(c.amount)}</span></div>)}
              </CardContent>
            </Card>
          ) : null}
        </div>
      </div>
    </div>
  );
}
