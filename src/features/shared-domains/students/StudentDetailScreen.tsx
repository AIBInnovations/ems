import { useParams, Link } from "react-router-dom";
import { CalendarCheck, CreditCard, FileText, GraduationCap, IdCard, User } from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { InitialsAvatar } from "@/components/shared/InitialsAvatar";
import { StatusPill } from "@/components/shared/StatusPill";
import { NotFound } from "@/pages/NotFound";
import { db } from "@/data/db";
import { fullName, formatMoney, formatDate, percent } from "@/lib/format";

function Detail({ label, value, mono }: { label: string; value?: string | number | null; mono?: boolean }) {
  return (
    <div>
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className={mono ? "font-mono text-sm" : "text-sm font-medium"}>{value ?? "—"}</dd>
    </div>
  );
}

export function StudentDetailScreen({ studentId }: { studentId?: string } = {}) {
  const params = useParams();
  const id = studentId ?? params.id;
  const s = id ? db.getById("students", id) : null;
  if (!s) return <NotFound />;

  const cls = db.getById("classes", s.classId);
  const sec = db.getById("sections", s.sectionId);
  const guardian = db.getById("guardians", s.guardianIds[0] ?? "");
  const att = db.query("studentAttendance", (a) => a.studentId === s.id);
  const present = att.filter((a) => a.status === "present").length;
  const attPct = att.length ? (present / att.length) * 100 : 0;
  const cards = db.query("reportCards", (r) => r.studentId === s.id);
  const bills = db.query("feeBills", (b) => b.studentId === s.id);
  const dues = bills.reduce((sum, b) => sum + b.balance, 0);

  return (
    <div className="space-y-6">
      <PageHeader title="Student Profile" description={`${cls?.name ?? ""} - ${sec?.name ?? ""}`} />

      <Card>
        <CardContent className="flex flex-col items-center gap-4 p-6 sm:flex-row sm:items-start">
          <InitialsAvatar first={s.firstName} last={s.lastName} src={s.photoUrl} size="xl" />
          <div className="flex-1 text-center sm:text-left">
            <h2 className="font-display text-h2">{fullName(s.firstName, s.lastName)}</h2>
            <p className="text-sm text-muted-foreground">Admission {s.admissionNo} · Roll {s.rollNo}</p>
            <div className="mt-2 flex flex-wrap justify-center gap-2 sm:justify-start">
              <StatusPill status={s.status} />
              <Badge variant="secondary">{cls?.name} - {sec?.name}</Badge>
              {s.house ? <Badge variant="outline">{s.house} House</Badge> : null}
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button asChild variant="outline" size="sm"><Link to={`/print/id-card/${s.id}`}><IdCard className="size-4" /> ID Card</Link></Button>
            <Button asChild variant="outline" size="sm"><Link to={`/print/admit-card/${s.id}`}><FileText className="size-4" /> Admit Card</Link></Button>
            {cards[0] ? <Button asChild variant="outline" size="sm"><Link to={`/print/marksheet/${cards[0].id}`}><GraduationCap className="size-4" /> Mark Sheet</Link></Button> : null}
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="overview">
        <TabsList className="flex-wrap">
          <TabsTrigger value="overview"><User className="mr-1.5 size-4" /> Overview</TabsTrigger>
          <TabsTrigger value="attendance"><CalendarCheck className="mr-1.5 size-4" /> Attendance</TabsTrigger>
          <TabsTrigger value="results"><GraduationCap className="mr-1.5 size-4" /> Results</TabsTrigger>
          <TabsTrigger value="fees"><CreditCard className="mr-1.5 size-4" /> Fees</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <Card><CardContent className="grid grid-cols-2 gap-4 p-6 sm:grid-cols-3 lg:grid-cols-4">
            <Detail label="Date of Birth" value={formatDate(s.dob)} />
            <Detail label="Gender" value={s.gender} />
            <Detail label="Blood Group" value={s.bloodGroup} />
            <Detail label="Category" value={s.category} />
            <Detail label="SSM ID" value={s.ssmid} mono />
            <Detail label="Samagra ID" value={s.samagraId} mono />
            <Detail label="Scholar No" value={s.scholarNo} mono />
            <Detail label="APAAR ID" value={s.apaarId} mono />
            <Detail label="Aadhaar" value={s.aadhaarMasked} mono />
            <Detail label="PEN" value={s.penNo} mono />
            <Detail label="Guardian" value={guardian ? fullName(guardian.firstName, guardian.lastName) : "—"} />
            <Detail label="Contact" value={guardian?.phone} mono />
            <Detail label="Address" value={s.address} />
            <Detail label="Emergency" value={s.emergencyContact} mono />
          </CardContent></Card>
        </TabsContent>

        <TabsContent value="attendance">
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-base">Attendance — {percent(attPct, 0)} present</CardTitle></CardHeader>
            <CardContent>
              <div className="mb-4 grid grid-cols-3 gap-3 sm:grid-cols-5">
                {(["present", "absent", "late", "leave", "half_day"] as const).map((st) => (
                  <div key={st} className="rounded-lg border border-border p-3 text-center">
                    <p className="font-display text-2xl font-bold tabular-nums">{att.filter((a) => a.status === st).length}</p>
                    <p className="text-xs capitalize text-muted-foreground">{st.replace("_", " ")}</p>
                  </div>
                ))}
              </div>
              <div className="flex flex-wrap gap-1">
                {att.slice(-30).map((a) => (
                  <span key={a.id} title={`${a.date}: ${a.status}`} className={`size-5 rounded ${a.status === "present" ? "bg-success" : a.status === "absent" ? "bg-destructive" : a.status === "late" ? "bg-warning" : "bg-info"}`} />
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="results">
          {cards.length === 0 ? <Card><CardContent className="py-8 text-center text-muted-foreground">No published results yet.</CardContent></Card> : cards.map((c) => {
            const exam = db.getById("exams", c.examId);
            return (
              <Card key={c.id} className="mb-3">
                <CardHeader className="flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-base">{exam?.name}</CardTitle>
                  <div className="flex items-center gap-2"><Badge variant="warning">Rank #{c.rank}</Badge><Badge variant="success">{c.percentage}%</Badge><StatusPill status={c.result} /></div>
                </CardHeader>
                <CardContent>
                  <table className="w-full text-sm">
                    <tbody>
                      {c.subjects.map((sub, i) => <tr key={i} className="border-b border-border last:border-0"><td className="py-1.5">{db.getById("subjects", sub.subjectId)?.name}</td><td className="py-1.5 text-right font-mono">{sub.marks}/{sub.max}</td><td className="py-1.5 text-right font-semibold">{sub.grade}</td></tr>)}
                    </tbody>
                  </table>
                </CardContent>
              </Card>
            );
          })}
        </TabsContent>

        <TabsContent value="fees">
          <Card>
            <CardHeader className="flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-base">Fee bills</CardTitle>
              <Badge variant={dues > 0 ? "destructive" : "success"}>Balance {formatMoney(dues)}</Badge>
            </CardHeader>
            <CardContent>
              <table className="w-full text-sm">
                <thead><tr className="border-b border-border text-left text-xs text-muted-foreground"><th className="py-1.5">Invoice</th><th>Period</th><th className="text-right">Due</th><th className="text-right">Paid</th><th className="text-right">Balance</th><th>Status</th></tr></thead>
                <tbody>
                  {bills.map((b) => <tr key={b.id} className="border-b border-border last:border-0"><td className="py-1.5 font-mono text-xs">{b.invoiceNo}</td><td>{b.period}</td><td className="text-right font-mono">{formatMoney(b.totalDue)}</td><td className="text-right font-mono">{formatMoney(b.totalPaid)}</td><td className="text-right font-mono">{formatMoney(b.balance)}</td><td><StatusPill status={b.status} /></td></tr>)}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
