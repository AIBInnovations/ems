import { useMemo } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Search } from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { EmptyState } from "@/components/shared/EmptyState";
import { Card, CardContent } from "@/components/ui/card";
import { InitialsAvatar } from "@/components/shared/InitialsAvatar";
import { db } from "@/data/db";
import { fullName } from "@/lib/format";
import { areaRoute } from "@/lib/routes";

export function SearchResults() {
  const [params] = useSearchParams();
  const q = (params.get("q") ?? "").toLowerCase();

  const results = useMemo(() => {
    if (!q) return { students: [], staff: [] };
    const students = db.getAll("students").filter((s) => `${s.firstName} ${s.lastName} ${s.admissionNo} ${s.rollNo}`.toLowerCase().includes(q)).slice(0, 20);
    const staff = db.getAll("staff").filter((s) => `${s.firstName} ${s.lastName} ${s.employeeId}`.toLowerCase().includes(q)).slice(0, 20);
    return { students, staff };
  }, [q]);

  const total = results.students.length + results.staff.length;

  return (
    <div className="space-y-6">
      <PageHeader title="Search results" icon={<Search className="size-5" />} description={q ? `${total} results for "${q}"` : "Enter a search term."} />
      {total === 0 ? (
        <EmptyState title="No results" description="Try a different name or ID." />
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {results.students.map((s) => (
            <Link key={s.id} to={areaRoute(`students/${s.id}`)}>
              <Card className="transition-colors hover:border-primary"><CardContent className="flex items-center gap-3 p-3">
                <InitialsAvatar first={s.firstName} last={s.lastName} size="sm" />
                <div><p className="text-sm font-medium">{fullName(s.firstName, s.lastName)}</p><p className="text-xs text-muted-foreground">Student · {s.rollNo}</p></div>
              </CardContent></Card>
            </Link>
          ))}
          {results.staff.map((s) => (
            <Card key={s.id}><CardContent className="flex items-center gap-3 p-3">
              <InitialsAvatar first={s.firstName} last={s.lastName} size="sm" />
              <div><p className="text-sm font-medium">{fullName(s.firstName, s.lastName)}</p><p className="text-xs capitalize text-muted-foreground">{s.roleKey.replace(/_/g, " ")} · {s.employeeId}</p></div>
            </CardContent></Card>
          ))}
        </div>
      )}
    </div>
  );
}
