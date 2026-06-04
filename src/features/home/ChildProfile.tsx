import { StudentDetailScreen } from "@/features/shared-domains/students/StudentDetailScreen";
import { useAuthStore } from "@/store/auth";
import { db } from "@/data/db";

/** Parent's view of their child's full profile (first/linked child). */
export function ChildProfile() {
  const user = useAuthStore((s) => s.user);
  let studentId: string | undefined;
  if (user?.roleKey === "student") studentId = user.linkedProfileId ?? undefined;
  else if (user?.roleKey === "parent" && user.linkedProfileId) {
    studentId = db.getById("guardians", user.linkedProfileId)?.studentIds[0];
  }
  return <StudentDetailScreen studentId={studentId} />;
}
