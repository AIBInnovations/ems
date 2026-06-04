import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  BookMarked,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Download,
  FileText,
  GraduationCap,
  Link2,
  Loader2,
  Play,
  RotateCcw,
  Trophy,
  Video,
} from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { StatGrid } from "@/features/dashboard/blocks";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/shared/EmptyState";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "@/components/ui/sonner";
import { db } from "@/data/db";
import { useAuthStore } from "@/store/auth";
import { nowISO } from "@/lib/clock";
import { logActivity } from "@/lib/activity";
import { formatDate, fileSize } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { LearningResource, Quiz } from "@/types";

const KIND_ICON = { video: Video, pdf: FileText, audio: Play, image: FileText, link: Link2 } as const;

export function LearningHub() {
  const user = useAuthStore((s) => s.user);
  const navigate = useNavigate();
  const [tick, setTick] = useState(0);

  const { classId, studentId } = useMemo(() => {
    if (user?.roleKey === "student" && user.linkedProfileId) {
      const s = db.getById("students", user.linkedProfileId);
      return { classId: s?.classId ?? "", studentId: s?.id ?? "" };
    }
    if (user?.roleKey === "parent" && user.linkedProfileId) {
      const g = db.getById("guardians", user.linkedProfileId);
      const child = g?.studentIds[0] ? db.getById("students", g.studentIds[0]) : null;
      return { classId: child?.classId ?? "", studentId: child?.id ?? "" };
    }
    return { classId: db.getAll("classes").find((c) => c.numericLevel === 12)?.id ?? "", studentId: "" };
  }, [user]);

  const resources = useMemo(() => db.query("learningResources", (r) => r.classId === classId || r.visibleTo === "all"), [classId]);
  const quizzes = useMemo(() => { void tick; return db.query("quizzes", (q) => q.classId === classId); }, [classId, tick]);
  const liveClasses = useMemo(() => db.query("liveClasses", (l) => l.classId === classId && l.status !== "ended"), [classId]);
  const attempts = useMemo(() => { void tick; return db.query("quizAttempts", (a) => a.studentId === studentId); }, [studentId, tick]);

  const attemptFor = (quizId: string) => attempts.find((a) => a.quizId === quizId);
  const [activeQuiz, setActiveQuiz] = useState<Quiz | null>(null);
  const [video, setVideo] = useState<LearningResource | null>(null);

  const subjName = (id: string) => db.getById("subjects", id)?.name ?? "General";
  const bySubject = useMemo(() => {
    const map = new Map<string, LearningResource[]>();
    resources.forEach((r) => { const k = subjName(r.subjectId ?? ""); (map.get(k) ?? map.set(k, []).get(k)!).push(r); });
    return [...map.entries()];
  }, [resources]);

  const openResource = (r: LearningResource) => {
    if (r.kind === "video") setVideo(r);
    else if (r.kind === "link") window.open(r.url, "_blank");
    else toast.success(`Opening ${r.title} (demo)`);
  };

  const completed = attempts.length;

  return (
    <div className="space-y-6">
      <PageHeader title="Online Learning" icon={<BookMarked className="size-5" />} description="Watch lessons, read notes and attempt quizzes — all for your class." />

      <StatGrid
        cols={4}
        items={[
          { label: "Resources", value: resources.length, icon: Video, tone: "primary" },
          { label: "Quizzes", value: quizzes.length, icon: GraduationCap, tone: "info" },
          { label: "Completed", value: completed, icon: CheckCircle2, tone: "success" },
          { label: "Live Classes", value: liveClasses.length, icon: Play, tone: "accent" },
        ]}
      />

      <Tabs defaultValue="resources">
        <TabsList>
          <TabsTrigger value="resources"><Video className="mr-1.5 size-4" /> Resources</TabsTrigger>
          <TabsTrigger value="quizzes"><GraduationCap className="mr-1.5 size-4" /> Quizzes</TabsTrigger>
          <TabsTrigger value="live"><Play className="mr-1.5 size-4" /> Live Classes</TabsTrigger>
        </TabsList>

        <TabsContent value="resources" className="space-y-5">
          {bySubject.length === 0 ? (
            <EmptyState icon={Video} title="No resources yet" description="Your teachers' uploads will appear here." />
          ) : (
            bySubject.map(([subject, items]) => (
              <div key={subject} className="space-y-2">
                <h3 className="font-display text-sm font-semibold text-muted-foreground">{subject}</h3>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {items.map((r) => {
                    const Icon = KIND_ICON[r.kind];
                    return (
                      <Card key={r.id} className="transition-colors hover:border-primary">
                        <CardContent className="flex items-start gap-3 p-4">
                          <span className={cn("flex size-10 shrink-0 items-center justify-center rounded-lg", r.kind === "video" ? "bg-destructive/10 text-destructive" : r.kind === "pdf" ? "bg-info/10 text-info" : "bg-primary/10 text-primary")}>
                            <Icon className="size-5" />
                          </span>
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-medium">{r.title}</p>
                            <p className="text-xs capitalize text-muted-foreground">{r.kind}{r.sizeMB ? ` · ${fileSize(r.sizeMB)}` : ""}</p>
                            <Button variant="ghost" size="sm" className="mt-1 h-7 px-2" onClick={() => openResource(r)}>
                              {r.kind === "video" ? <><Play className="size-3.5" /> Watch</> : r.kind === "pdf" ? <><Download className="size-3.5" /> Open</> : <><Link2 className="size-3.5" /> Open</>}
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </div>
            ))
          )}
        </TabsContent>

        <TabsContent value="quizzes" className="space-y-3">
          {quizzes.length === 0 ? (
            <EmptyState icon={GraduationCap} title="No quizzes yet" description="Assigned quizzes will appear here." />
          ) : (
            quizzes.map((q) => {
              const a = attemptFor(q.id);
              return (
                <Card key={q.id}>
                  <CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-3">
                      <span className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary"><GraduationCap className="size-5" /></span>
                      <div>
                        <p className="text-sm font-medium">{q.title}</p>
                        <p className="text-xs text-muted-foreground">{subjName(q.subjectId)} · {q.questions.length} questions · due {formatDate(q.dueDate)}</p>
                      </div>
                    </div>
                    {a ? (
                      <div className="flex items-center gap-3">
                        <Badge variant={a.score / q.totalMarks >= 0.5 ? "success" : "warning"} className="gap-1"><Trophy className="size-3" /> {a.score}/{q.totalMarks}</Badge>
                        <Button variant="outline" size="sm" onClick={() => setActiveQuiz(q)}><RotateCcw className="size-4" /> Retake</Button>
                      </div>
                    ) : (
                      <Button size="sm" onClick={() => setActiveQuiz(q)}>Take Quiz <ChevronRight className="size-4" /></Button>
                    )}
                  </CardContent>
                </Card>
              );
            })
          )}
        </TabsContent>

        <TabsContent value="live" className="space-y-3">
          {liveClasses.length === 0 ? (
            <EmptyState icon={Play} title="No live classes scheduled" />
          ) : (
            liveClasses.map((l) => (
              <Card key={l.id}>
                <CardContent className="flex items-center justify-between p-4">
                  <div className="flex items-center gap-3">
                    <span className="flex size-10 items-center justify-center rounded-lg bg-accent/15 text-amber-600"><Video className="size-5" /></span>
                    <div>
                      <p className="text-sm font-medium">{l.title}</p>
                      <p className="text-xs text-muted-foreground">Scheduled {formatDate(l.scheduledAt, "dd MMM, h:mm a")}</p>
                    </div>
                  </div>
                  <Button size="sm" onClick={() => navigate("/app/student/live-video")}><Play className="size-4" /> Join</Button>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>
      </Tabs>

      {activeQuiz ? <QuizPlayer quiz={activeQuiz} studentId={studentId} onClose={() => setActiveQuiz(null)} onDone={() => { setActiveQuiz(null); setTick((t) => t + 1); }} /> : null}

      <Dialog open={!!video} onOpenChange={(o) => !o && setVideo(null)}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader><DialogTitle>{video?.title}</DialogTitle></DialogHeader>
          <div className="aspect-video w-full overflow-hidden rounded-lg bg-black">
            {video ? <iframe src={video.url} title={video.title} className="size-full" allowFullScreen /> : null}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function QuizPlayer({ quiz, studentId, onClose, onDone }: { quiz: Quiz; studentId: string; onClose: () => void; onDone: () => void }) {
  const [idx, setIdx] = useState(0);
  const [answers, setAnswers] = useState<number[]>(Array(quiz.questions.length).fill(-1));
  const [result, setResult] = useState<{ score: number } | null>(null);
  const [busy, setBusy] = useState(false);
  const q = quiz.questions[idx];
  const answered = answers.filter((a) => a >= 0).length;

  const submit = () => {
    setBusy(true);
    const score = quiz.questions.reduce((s, qq, i) => s + (answers[i] === qq.correctIndex ? qq.marks : 0), 0);
    db.insert("quizAttempts", { quizId: quiz.id, studentId, answers, score, submittedAt: nowISO() });
    logActivity("quiz", "quizAttempts", quiz.id, `Attempted "${quiz.title}" — scored ${score}/${quiz.totalMarks}`);
    setTimeout(() => { setBusy(false); setResult({ score }); }, 400);
  };

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-lg">
        {result ? (
          <div className="flex flex-col items-center gap-4 py-4 text-center">
            <div className={cn("flex size-20 items-center justify-center rounded-full", result.score / quiz.totalMarks >= 0.5 ? "bg-success/12 text-success" : "bg-warning/15 text-amber-600")}>
              <Trophy className="size-10" />
            </div>
            <div>
              <p className="font-display text-2xl font-bold">{result.score} / {quiz.totalMarks}</p>
              <p className="text-sm text-muted-foreground">{result.score / quiz.totalMarks >= 0.5 ? "Well done! 🎉" : "Keep practising 💪"}</p>
            </div>
            <Button onClick={onDone} className="w-full">Done</Button>
          </div>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center justify-between">
                <span>{quiz.title}</span>
                <Badge variant="secondary">{idx + 1} / {quiz.questions.length}</Badge>
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <p className="font-medium">{q.text}</p>
              <div className="space-y-2">
                {q.options.map((opt, i) => (
                  <button
                    key={i}
                    onClick={() => setAnswers((a) => a.map((v, j) => (j === idx ? i : v)))}
                    className={cn("flex w-full items-center gap-3 rounded-lg border px-3 py-2.5 text-left text-sm transition-colors", answers[idx] === i ? "border-primary bg-primary/5" : "border-border hover:bg-muted")}
                  >
                    <span className={cn("flex size-6 shrink-0 items-center justify-center rounded-full border text-xs font-semibold", answers[idx] === i ? "border-primary bg-primary text-primary-foreground" : "border-input")}>
                      {String.fromCharCode(65 + i)}
                    </span>
                    {opt}
                  </button>
                ))}
              </div>
            </div>
            <DialogFooter className="flex-row items-center justify-between sm:justify-between">
              <Button variant="ghost" size="sm" onClick={() => setIdx((i) => Math.max(0, i - 1))} disabled={idx === 0}><ChevronLeft className="size-4" /> Back</Button>
              {idx < quiz.questions.length - 1 ? (
                <Button size="sm" onClick={() => setIdx((i) => i + 1)} disabled={answers[idx] < 0}>Next <ChevronRight className="size-4" /></Button>
              ) : (
                <Button size="sm" onClick={submit} disabled={busy || answered < quiz.questions.length}>{busy ? <Loader2 className="size-4 animate-spin" /> : <CheckCircle2 className="size-4" />} Submit</Button>
              )}
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
