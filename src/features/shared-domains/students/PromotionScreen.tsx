import { useMemo, useState } from "react";
import { ArrowUpCircle, GraduationCap, Loader2 } from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { StatusPill } from "@/components/shared/StatusPill";
import { InitialsAvatar } from "@/components/shared/InitialsAvatar";
import { EmptyState } from "@/components/shared/EmptyState";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/components/ui/sonner";
import { useDialogs } from "@/components/shared/dialogs";
import { studentService } from "@/data/services";
import { useCan } from "@/lib/rbac";
import { db } from "@/data/db";
import { fullName } from "@/lib/format";

export function PromotionScreen() {
  const can = useCan();
  const canPromote = can({ permission: "student.promote" });
  const { confirm } = useDialogs();
  const classes = db.getAll("classes").sort((a, b) => a.numericLevel - b.numericLevel);
  const [classId, setClassId] = useState(classes[0]?.id ?? "");
  const [busy, setBusy] = useState(false);
  const [tick, setTick] = useState(0);

  const cls = classes.find((c) => c.id === classId);
  const nextClass = classes.find((c) => c.numericLevel === (cls?.numericLevel ?? -99) + 1);

  const students = useMemo(() => {
    void tick;
    return db.query("students", (s) => s.classId === classId).map((s) => {
      const card = db.query("reportCards", (r) => r.studentId === s.id).slice(-1)[0];
      return { s, result: card?.result ?? "pass" };
    });
  }, [classId, tick]);

  const eligible = students.filter((x) => x.result === "pass").length;

  const promote = () =>
    confirm({
      title: `Promote to ${nextClass?.name ?? "next class"}?`,
      body: `${eligible} passed student(s) in ${cls?.name} will move up. Students with compartment/fail stay back.`,
      confirmLabel: "Promote",
      onConfirm: async () => {
        setBusy(true);
        try {
          const n = await studentService.autoPromote(classId);
          toast.success(`Promoted ${n} student(s) to ${nextClass?.name}`);
          setTick((t) => t + 1);
        } finally {
          setBusy(false);
        }
      },
    });

  return (
    <div className="space-y-5">
      <PageHeader
        title="Student Promotions"
        icon={<ArrowUpCircle className="size-5" />}
        description="Promote students who passed to the next class. Auto-promotion respects exam results."
      />

      <div className="flex flex-wrap items-center gap-3">
        <Select value={classId} onValueChange={(v) => setClassId(v)}>
          <SelectTrigger className="w-56"><SelectValue placeholder="Class" /></SelectTrigger>
          <SelectContent>{classes.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent>
        </Select>
        <Badge variant="secondary" className="gap-1"><GraduationCap className="size-3.5" /> {eligible}/{students.length} eligible</Badge>
        {nextClass ? <span className="text-sm text-muted-foreground">→ {nextClass.name}</span> : <Badge variant="outline">Final class</Badge>}
        <Button className="ml-auto" onClick={promote} disabled={!canPromote || busy || eligible === 0 || !nextClass}>
          {busy ? <Loader2 className="size-4 animate-spin" /> : <ArrowUpCircle className="size-4" />} Promote {eligible} student(s)
        </Button>
      </div>

      {students.length === 0 ? (
        <EmptyState icon={GraduationCap} title="No students" description="This class has no enrolled students." />
      ) : (
        <Card>
          <CardContent className="divide-y divide-border p-0">
            {students.map(({ s, result }) => (
              <div key={s.id} className="flex items-center justify-between px-4 py-2.5">
                <div className="flex items-center gap-3">
                  <InitialsAvatar first={s.firstName} last={s.lastName} size="sm" />
                  <div><p className="text-sm font-medium">{fullName(s.firstName, s.lastName)}</p><p className="font-mono text-xs text-muted-foreground">{s.rollNo}</p></div>
                </div>
                <StatusPill status={result} />
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
