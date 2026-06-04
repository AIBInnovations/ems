import { useMemo, useState } from "react";
import { CheckCircle2, ClipboardEdit, GraduationCap, Loader2, ShieldCheck, Trophy } from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { StatusPill } from "@/components/shared/StatusPill";
import { EmptyState } from "@/components/shared/EmptyState";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "@/components/ui/sonner";
import { useDialogs } from "@/components/shared/dialogs";
import { marksService } from "@/data/services";
import { useCan } from "@/lib/rbac";
import { useAuthStore } from "@/store/auth";
import { db } from "@/data/db";
import { fullName } from "@/lib/format";
import { cn } from "@/lib/utils";

export function MarksScreen() {
  const can = useCan();
  const { confirm } = useDialogs();
  const user = useAuthStore((s) => s.user);
  const staffId = user?.linkedProfileId ?? "";
  const canVerify = can({ permission: "marks.verify" });
  const canPublish = can({ permission: "marks.publish" });
  const canEnter = can({ permission: "marks.enter" });

  const exams = db.getAll("exams");
  const myClassSection = user?.roleKey === "class_teacher" ? db.getById("staff", staffId)?.classTeacherOf : null;

  const [examId, setExamId] = useState(exams.find((e) => e.status === "published")?.id ?? exams[0]?.id ?? "");
  const [sectionId, setSectionId] = useState(myClassSection?.sectionId ?? db.getAll("sections")[0]?.id ?? "");
  const [tick, setTick] = useState(0);
  const refresh = () => setTick((t) => t + 1);

  const [entrySubject, setEntrySubject] = useState<string | null>(null);
  const [entryValues, setEntryValues] = useState<Record<string, number>>({});
  const [busy, setBusy] = useState(false);

  const sections = myClassSection ? db.getAll("sections").filter((s) => s.id === myClassSection.sectionId) : db.getAll("sections");

  const view = useMemo(() => {
    void tick;
    if (!examId || !sectionId) return null;
    const students = db.query("students", (s) => s.sectionId === sectionId).sort((a, b) => a.rollNo.localeCompare(b.rollNo));
    const entries = db.query("marksEntries", (m) => m.examId === examId && m.sectionId === sectionId);
    const subjectIds = Array.from(new Set(entries.map((e) => e.subjectId))).filter(Boolean);
    const cards = db.query("reportCards", (r) => r.examId === examId && r.sectionId === sectionId);
    const markOf = (studentId: string, subjectId: string) => entries.find((e) => e.studentId === studentId && e.subjectId === subjectId);
    const stageOf = (subjectId: string) => db.query("markVerifications", (v) => v.examId === examId && v.sectionId === sectionId && v.subjectId === subjectId)[0]?.stage ?? "entered";
    return { students, subjectIds, cards, markOf, stageOf };
  }, [examId, sectionId, tick]);

  const openEntry = (subjectId: string) => {
    if (!view) return;
    const vals: Record<string, number> = {};
    view.students.forEach((s) => { vals[s.id] = view.markOf(s.id, subjectId)?.marksObtained ?? 0; });
    setEntryValues(vals);
    setEntrySubject(subjectId);
  };

  const saveEntry = async () => {
    if (!entrySubject || !view) return;
    setBusy(true);
    try {
      await marksService.enter(examId, sectionId, entrySubject, view.students.map((s) => ({ studentId: s.id, marksObtained: entryValues[s.id] ?? 0 })), staffId);
      toast.success("Marks saved & submitted for verification");
      setEntrySubject(null);
      refresh();
    } finally {
      setBusy(false);
    }
  };

  const verify = async (subjectId: string) => {
    await marksService.verifyOne(examId, sectionId, subjectId, staffId);
    toast.success("Subject marks verified");
    refresh();
  };

  const publish = () =>
    confirm({
      title: "Approve & publish results?",
      body: "This computes report cards with ranks and makes results visible to students and parents.",
      confirmLabel: "Approve & Publish",
      onConfirm: async () => {
        await marksService.approveAndPublish(examId, sectionId, staffId);
        toast.success("Results published — students notified");
        refresh();
      },
    });

  const subjName = (id: string) => db.getById("subjects", id)?.code ?? "—";

  return (
    <div className="space-y-6">
      <PageHeader
        title="Marks & Results"
        icon={<GraduationCap className="size-5" />}
        description="Enter subject marks → verify → approve & publish. Ranks compute automatically."
        actions={canPublish && view?.subjectIds.length ? <Button onClick={publish}><ShieldCheck className="size-4" /> Approve & Publish</Button> : undefined}
      />

      <div className="flex flex-wrap gap-3">
        <Select value={examId} onValueChange={setExamId}>
          <SelectTrigger className="w-56"><SelectValue placeholder="Exam" /></SelectTrigger>
          <SelectContent>{exams.map((e) => <SelectItem key={e.id} value={e.id}>{e.name}</SelectItem>)}</SelectContent>
        </Select>
        <Select value={sectionId} onValueChange={setSectionId}>
          <SelectTrigger className="w-56"><SelectValue placeholder="Section" /></SelectTrigger>
          <SelectContent>
            {sections.map((s) => {
              const c = db.getById("classes", s.classId);
              return <SelectItem key={s.id} value={s.id}>{c?.name} - {s.name}</SelectItem>;
            })}
          </SelectContent>
        </Select>
      </div>

      {!view || view.students.length === 0 ? (
        <EmptyState title="No data" description="Pick an exam and section with enrolled students." />
      ) : view.subjectIds.length === 0 ? (
        <EmptyState icon={ClipboardEdit} title="No marks entered yet" description="Subject teachers enter marks here first." />
      ) : (
        <>
          <div className="flex flex-wrap gap-2">
            {view.subjectIds.map((sid) => {
              const stage = view.stageOf(sid);
              return (
                <div key={sid} className="flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2">
                  <span className="text-sm font-medium">{db.getById("subjects", sid)?.name}</span>
                  <StatusPill status={stage} />
                  {canEnter && stage !== "published" ? <Button variant="ghost" size="sm" onClick={() => openEntry(sid)}><ClipboardEdit className="size-3.5" /> Edit</Button> : null}
                  {canVerify && stage === "entered" ? <Button variant="ghost" size="sm" onClick={() => verify(sid)}><CheckCircle2 className="size-3.5" /> Verify</Button> : null}
                </div>
              );
            })}
          </div>

          <Card>
            <CardContent className="overflow-x-auto p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="sticky left-0 bg-muted/40">Student</TableHead>
                    {view.subjectIds.map((sid) => <TableHead key={sid} className="text-center">{subjName(sid)}</TableHead>)}
                    <TableHead className="text-right">Total</TableHead>
                    <TableHead className="text-right">%</TableHead>
                    <TableHead className="text-center">Rank</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {view.students.map((s) => {
                    const card = view.cards.find((c) => c.studentId === s.id);
                    return (
                      <TableRow key={s.id}>
                        <TableCell className="sticky left-0 bg-card font-medium">{fullName(s.firstName, s.lastName)}</TableCell>
                        {view.subjectIds.map((sid) => {
                          const m = view.markOf(s.id, sid);
                          return <TableCell key={sid} className="text-center font-mono tabular-nums">{m ? m.marksObtained : "—"}</TableCell>;
                        })}
                        <TableCell className="text-right font-mono tabular-nums">{card?.total ?? "—"}</TableCell>
                        <TableCell className="text-right font-mono tabular-nums">{card ? card.percentage + "%" : "—"}</TableCell>
                        <TableCell className="text-center">
                          {card ? <Badge variant={card.rank <= 3 ? "warning" : "secondary"} className="gap-1">{card.rank <= 3 ? <Trophy className="size-3" /> : null}{card.rank}</Badge> : "—"}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </>
      )}

      <Dialog open={!!entrySubject} onOpenChange={(o) => !o && setEntrySubject(null)}>
        <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Enter marks · {entrySubject ? db.getById("subjects", entrySubject)?.name : ""}</DialogTitle>
          </DialogHeader>
          <div className="space-y-2">
            {view?.students.map((s) => (
              <div key={s.id} className="flex items-center justify-between gap-3">
                <span className="text-sm">{fullName(s.firstName, s.lastName)}</span>
                <Input
                  type="number"
                  min={0}
                  max={100}
                  value={entryValues[s.id] ?? 0}
                  onChange={(e) => setEntryValues((v) => ({ ...v, [s.id]: Math.max(0, Math.min(100, Number(e.target.value))) }))}
                  className={cn("h-8 w-20 text-center font-mono")}
                />
              </div>
            ))}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEntrySubject(null)}>Cancel</Button>
            <Button onClick={saveEntry} disabled={busy}>{busy ? <Loader2 className="size-4 animate-spin" /> : null} Save & submit</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
