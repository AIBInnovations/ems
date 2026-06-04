import { ResourceListPage } from "@/components/shared/ResourceListPage";
import { useAuthStore } from "@/store/auth";
import { db } from "@/data/db";
import { studentResource } from "./studentResource";
import type { Student } from "@/types";

/** Students list — same resource, role-scoped. Class teachers see only their section. */
export function StudentsScreen() {
  const user = useAuthStore((s) => s.user);

  let scope: ((s: Student) => boolean) | undefined;
  let description = "Manage student records, admissions data and documents.";

  if (user?.roleKey === "class_teacher" && user.linkedProfileId) {
    const staff = db.getById("staff", user.linkedProfileId);
    const sectionId = staff?.classTeacherOf?.sectionId;
    if (sectionId) {
      scope = (s) => s.sectionId === sectionId;
      const sec = db.getById("sections", sectionId);
      const cls = sec ? db.getById("classes", sec.classId) : null;
      description = `Your class — ${cls?.name ?? ""} ${sec?.name ?? ""}`;
    }
  }

  return <ResourceListPage config={studentResource} scope={scope} description={description} />;
}
