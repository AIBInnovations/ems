import { useMemo, useState } from "react";
import { Star } from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { InitialsAvatar } from "@/components/shared/InitialsAvatar";
import { EmptyState } from "@/components/shared/EmptyState";
import { toast } from "@/components/ui/sonner";
import { ratingService } from "@/data/services";
import { useAuthStore } from "@/store/auth";
import { db } from "@/data/db";
import { fullName } from "@/lib/format";
import { cn } from "@/lib/utils";

export function RateTeachersScreen() {
  const user = useAuthStore((s) => s.user);
  const displayName = useAuthStore((s) => s.displayName);
  const [tick, setTick] = useState(0);

  const teachers = useMemo(() => {
    void tick;
    const student = user?.linkedProfileType === "student" ? db.getById("students", user.linkedProfileId ?? "") : null;
    const sectionId = student?.sectionId;
    if (!sectionId) return [];
    const ids = Array.from(new Set(db.query("classSubjectTeachers", (c) => c.sectionId === sectionId).map((c) => c.teacherStaffId)));
    return ids.map((id) => db.getById("staff", id)).filter(Boolean) as NonNullable<ReturnType<typeof db.getById<"staff">>>[];
  }, [user, tick]);

  const myRating = (staffId: string) => db.query("ratings", (r) => r.targetId === staffId && r.raterUserId === user?.id)[0];

  return (
    <div className="space-y-5">
      <PageHeader title="Rate Your Teachers" icon={<Star className="size-5" />} description="Your feedback is anonymous to teachers — only the school admin can see who rated. Teachers see only their average." />
      {teachers.length === 0 ? (
        <EmptyState icon={Star} title="No teachers found" description="Your subject teachers will appear here." />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {teachers.map((t) => <TeacherCard key={t.id} teacher={t} displayName={displayName} userId={user?.id ?? ""} existing={myRating(t.id)} onRated={() => setTick((x) => x + 1)} />)}
        </div>
      )}
    </div>
  );
}

function TeacherCard({ teacher, displayName, userId, existing, onRated }: {
  teacher: NonNullable<ReturnType<typeof db.getById<"staff">>>;
  displayName: string;
  userId: string;
  existing?: { id: string; stars: number; comment?: string };
  onRated: () => void;
}) {
  const [stars, setStars] = useState(existing?.stars ?? 0);
  const [hover, setHover] = useState(0);
  const [comment, setComment] = useState(existing?.comment ?? "");
  const subjects = Array.from(new Set(db.query("classSubjectTeachers", (c) => c.teacherStaffId === teacher.id).map((c) => db.getById("subjects", c.subjectId)?.name).filter(Boolean)));

  const submit = async () => {
    if (stars < 1) { toast.error("Pick 1–5 stars"); return; }
    if (existing) await ratingService.update(existing.id, { stars, comment });
    else await ratingService.create({ raterUserId: userId, raterName: displayName, targetType: "teacher", targetId: teacher.id, stars, comment });
    toast.success(`Thanks for rating ${teacher.firstName}!`);
    onRated();
  };

  return (
    <Card>
      <CardContent className="space-y-3 p-4">
        <div className="flex items-center gap-3">
          <InitialsAvatar first={teacher.firstName} last={teacher.lastName} size="md" />
          <div>
            <p className="font-semibold">{fullName(teacher.firstName, teacher.lastName)}</p>
            <p className="text-xs text-muted-foreground">{subjects.join(", ") || "Teacher"}</p>
          </div>
        </div>
        <div className="flex gap-1" onMouseLeave={() => setHover(0)}>
          {[1, 2, 3, 4, 5].map((n) => (
            <button key={n} onMouseEnter={() => setHover(n)} onClick={() => setStars(n)} aria-label={`${n} stars`}>
              <Star className={cn("size-7 transition-colors", (hover || stars) >= n ? "fill-amber-400 text-amber-400" : "text-muted-foreground/40")} />
            </button>
          ))}
        </div>
        <Textarea value={comment} onChange={(e) => setComment(e.target.value)} placeholder="Optional comment…" className="min-h-[60px]" />
        <Button size="sm" onClick={submit}>{existing ? "Update rating" : "Submit rating"}</Button>
      </CardContent>
    </Card>
  );
}
