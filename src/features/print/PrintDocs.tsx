import type { ReactNode } from "react";
import { useParams } from "react-router-dom";
import { ArrowLeft, Printer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { db } from "@/data/db";
import { fullName, formatMoney, formatDate } from "@/lib/format";
import { NotFound } from "@/pages/NotFound";

function PrintFrame({ children, title }: { children: ReactNode; title: string }) {
  const school = db.getAll("schools")[0];
  return (
    <div className="min-h-dvh bg-muted/40 py-6 print:bg-white print:py-0">
      <div className="no-print mx-auto mb-4 flex max-w-[210mm] items-center justify-between px-4">
        <Button variant="outline" size="sm" onClick={() => window.history.back()}><ArrowLeft className="size-4" /> Back</Button>
        <span className="text-sm font-medium text-muted-foreground">{title}</span>
        <Button size="sm" onClick={() => window.print()}><Printer className="size-4" /> Print / Save PDF</Button>
      </div>
      <div className="print-page mx-auto w-[210mm] max-w-full bg-white p-[14mm] text-[13px] text-slate-800 shadow-lg print:shadow-none">
        <div className="mb-5 flex items-center gap-3 border-b-2 border-slate-800 pb-3">
          <div className="flex size-12 items-center justify-center rounded-lg bg-[#2f43c4] text-white">
            <svg viewBox="0 0 32 32" className="size-7"><path d="M16 5 4 11l12 6 8-4v6h2v-7L16 5Z" fill="currentColor" /><path d="M9 15v5c0 1.7 3.1 3 7 3s7-1.3 7-3v-5l-7 3.5L9 15Z" fill="currentColor" opacity="0.6" /></svg>
          </div>
          <div className="flex-1">
            <h1 className="font-display text-xl font-bold tracking-tight">{school?.name}</h1>
            <p className="text-[11px] text-slate-500">{school?.address}, {school?.city} · DISE: {school?.diseCode}</p>
          </div>
        </div>
        {children}
        <p className="mt-8 border-t border-slate-200 pt-2 text-center text-[10px] text-slate-400">This is a computer-generated document · {school?.website}</p>
      </div>
    </div>
  );
}

function Field({ label, value }: { label: string; value?: string | number | null }) {
  return (
    <div className="flex flex-col">
      <span className="text-[10px] uppercase tracking-wide text-slate-400">{label}</span>
      <span className="font-medium">{value ?? "—"}</span>
    </div>
  );
}

export function ReceiptPrint() {
  const { id } = useParams();
  const payment = id ? db.getById("payments", id) : null;
  if (!payment) return <NotFound />;
  const bill = db.getById("feeBills", payment.billId);
  const student = db.getById("students", payment.studentId);
  return (
    <PrintFrame title="Fee Receipt">
      <h2 className="mb-4 text-center text-lg font-bold uppercase tracking-wide">Fee Receipt</h2>
      <div className="mb-4 grid grid-cols-2 gap-3">
        <Field label="Receipt No" value={payment.receiptNo} />
        <Field label="Date" value={formatDate(payment.paidAt)} />
        <Field label="Student" value={student ? fullName(student.firstName, student.lastName) : "—"} />
        <Field label="Admission No" value={student?.admissionNo} />
        <Field label="Invoice" value={bill?.invoiceNo} />
        <Field label="Mode" value={payment.mode.toUpperCase()} />
      </div>
      <table className="mb-4 w-full border-collapse text-[12px]">
        <thead><tr className="border-y border-slate-300 bg-slate-50 text-left"><th className="p-2">Description</th><th className="p-2 text-right">Amount</th></tr></thead>
        <tbody>
          {(bill?.lineItems ?? []).map((li, i) => {
            const head = db.getById("feeHeads", li.feeHeadId);
            return <tr key={i} className="border-b border-slate-100"><td className="p-2">{head?.name ?? "Fee"}</td><td className="p-2 text-right font-mono">{formatMoney(li.amount)}</td></tr>;
          })}
        </tbody>
      </table>
      <div className="ml-auto w-56 space-y-1 text-[12px]">
        <div className="flex justify-between"><span>Total Paid</span><span className="font-mono font-bold">{formatMoney(payment.amount)}</span></div>
        {bill ? <div className="flex justify-between text-slate-500"><span>Balance</span><span className="font-mono">{formatMoney(bill.balance)}</span></div> : null}
      </div>
      <div className="mt-10 flex justify-between text-[11px] text-slate-500">
        <span>Received with thanks</span><span className="border-t border-slate-400 pt-1">Authorized Signatory</span>
      </div>
    </PrintFrame>
  );
}

export function MarksheetPrint() {
  const { id } = useParams();
  // id may be a reportCard id or a student id (use latest published card)
  const card = id ? db.getById("reportCards", id) ?? db.query("reportCards", (r) => r.studentId === id && !!r.publishedAt).slice(-1)[0] : null;
  if (!card) return <NotFound />;
  const student = db.getById("students", card.studentId);
  const exam = db.getById("exams", card.examId);
  const cls = db.getById("classes", card.classId);
  return (
    <PrintFrame title="Mark Sheet">
      <h2 className="mb-1 text-center text-lg font-bold uppercase tracking-wide">{exam?.name ?? "Examination"} — Mark Sheet</h2>
      <div className="mb-4 grid grid-cols-3 gap-3">
        <Field label="Student" value={student ? fullName(student.firstName, student.lastName) : "—"} />
        <Field label="Class" value={cls?.name} />
        <Field label="Roll No" value={student?.rollNo} />
      </div>
      <table className="mb-4 w-full border-collapse text-[12px]">
        <thead><tr className="border-y border-slate-300 bg-slate-50 text-left"><th className="p-2">Subject</th><th className="p-2 text-right">Marks</th><th className="p-2 text-right">Max</th><th className="p-2 text-center">Grade</th></tr></thead>
        <tbody>
          {card.subjects.map((s, i) => {
            const subj = db.getById("subjects", s.subjectId);
            return <tr key={i} className="border-b border-slate-100"><td className="p-2">{subj?.name ?? s.subjectId}</td><td className="p-2 text-right font-mono">{s.marks}</td><td className="p-2 text-right font-mono">{s.max}</td><td className="p-2 text-center font-semibold">{s.grade}</td></tr>;
          })}
        </tbody>
      </table>
      <div className="grid grid-cols-4 gap-3 rounded border border-slate-200 bg-slate-50 p-3">
        <Field label="Total" value={card.total} />
        <Field label="Percentage" value={`${card.percentage}%`} />
        <Field label="Grade" value={card.grade} />
        <Field label="Rank" value={`#${card.rank}`} />
      </div>
      <p className="mt-2 text-[12px]"><span className="font-semibold">Result: </span><span className="uppercase">{card.result}</span></p>
      <div className="mt-10 flex justify-between text-[11px] text-slate-500">
        <span className="border-t border-slate-400 pt-1">Class Teacher</span><span className="border-t border-slate-400 pt-1">Principal</span>
      </div>
    </PrintFrame>
  );
}

export function IdCardPrint() {
  const { id } = useParams();
  const student = id ? db.getById("students", id) : null;
  const staff = id ? db.getById("staff", id) : null;
  const school = db.getAll("schools")[0];
  if (!student && !staff) return <NotFound />;
  const name = student ? fullName(student.firstName, student.lastName) : staff ? fullName(staff.firstName, staff.lastName) : "";
  return (
    <PrintFrame title="ID Card">
      <div className="mx-auto w-[54mm] overflow-hidden rounded-xl border border-slate-300">
        <div className="bg-[#2f43c4] p-3 text-center text-white"><p className="text-[11px] font-bold leading-tight">{school?.name}</p></div>
        <div className="flex flex-col items-center gap-2 p-3">
          <div className="flex size-20 items-center justify-center rounded-full bg-slate-100 text-2xl font-bold text-slate-400">{name.split(" ").map((n) => n[0]).join("").slice(0, 2)}</div>
          <p className="text-center text-sm font-bold">{name}</p>
          <div className="w-full space-y-1 text-[10px]">
            {student ? <><div className="flex justify-between"><span className="text-slate-400">Class</span><span>{db.getById("classes", student.classId)?.name}</span></div><div className="flex justify-between"><span className="text-slate-400">Roll</span><span>{student.rollNo}</span></div><div className="flex justify-between"><span className="text-slate-400">Adm No</span><span>{student.admissionNo}</span></div></> : null}
            {staff ? <><div className="flex justify-between"><span className="text-slate-400">Role</span><span className="capitalize">{staff.roleKey.replace(/_/g, " ")}</span></div><div className="flex justify-between"><span className="text-slate-400">Emp ID</span><span>{staff.employeeId}</span></div></> : null}
          </div>
        </div>
        <div className="bg-slate-100 p-1.5 text-center text-[8px] text-slate-500">{school?.phone}</div>
      </div>
    </PrintFrame>
  );
}

export function TransferCertificatePrint() {
  const { id } = useParams();
  const student = id ? db.getById("students", id) : null;
  if (!student) return <NotFound />;
  const cls = db.getById("classes", student.classId);
  const guardian = db.getById("guardians", student.guardianIds[0] ?? "");
  return (
    <PrintFrame title="Transfer Certificate">
      <h2 className="mb-1 text-center text-lg font-bold uppercase tracking-wide">Transfer Certificate</h2>
      <p className="mb-5 text-center text-[11px] text-slate-500">Serial No: TC-{student.admissionNo}</p>
      <div className="mb-5 grid grid-cols-2 gap-3">
        <Field label="Student Name" value={fullName(student.firstName, student.lastName)} />
        <Field label="Admission No" value={student.admissionNo} />
        <Field label="Father/Guardian" value={guardian ? fullName(guardian.firstName, guardian.lastName) : "—"} />
        <Field label="Date of Birth" value={formatDate(student.dob)} />
        <Field label="Class" value={cls?.name} />
        <Field label="Category" value={student.category} />
        <Field label="Admission Date" value={formatDate(student.admissionDate)} />
        <Field label="Date of Leaving" value={formatDate(new Date().toISOString())} />
      </div>
      <p className="leading-7 text-slate-700">
        This is to certify that <strong>{fullName(student.firstName, student.lastName)}</strong>, bearing Admission No.
        <strong> {student.admissionNo}</strong>, was a bonafide student of this school in <strong>{cls?.name}</strong>.
        Their conduct during the period of study has been satisfactory and no dues are pending. This certificate is issued on request.
      </p>
      <div className="mt-12 flex justify-between text-[11px] text-slate-500">
        <span className="border-t border-slate-400 pt-1">Class Teacher</span>
        <span className="border-t border-slate-400 pt-1">Principal</span>
      </div>
    </PrintFrame>
  );
}

export function AdmitCardPrint() {
  const { id } = useParams();
  const student = id ? db.getById("students", id) : null;
  if (!student) return <NotFound />;
  const exam = db.query("exams", (e) => e.status === "ongoing")[0] ?? db.getAll("exams")[0];
  const schedules = exam ? db.query("examSchedules", (s) => s.examId === exam.id && s.sectionId === student.sectionId) : [];
  return (
    <PrintFrame title="Admit Card">
      <h2 className="mb-4 text-center text-lg font-bold uppercase tracking-wide">Admit Card — {exam?.name}</h2>
      <div className="mb-4 grid grid-cols-3 gap-3">
        <Field label="Student" value={fullName(student.firstName, student.lastName)} />
        <Field label="Class" value={db.getById("classes", student.classId)?.name} />
        <Field label="Roll No" value={student.rollNo} />
      </div>
      <table className="w-full border-collapse text-[12px]">
        <thead><tr className="border-y border-slate-300 bg-slate-50 text-left"><th className="p-2">Date</th><th className="p-2">Subject</th><th className="p-2">Time</th></tr></thead>
        <tbody>
          {schedules.length ? schedules.map((s, i) => <tr key={i} className="border-b border-slate-100"><td className="p-2">{formatDate(s.date)}</td><td className="p-2">{db.getById("subjects", s.subjectId)?.name}</td><td className="p-2">{s.startTime}–{s.endTime}</td></tr>) : <tr><td colSpan={3} className="p-3 text-center text-slate-400">Datesheet to be announced</td></tr>}
        </tbody>
      </table>
      <div className="mt-10 flex justify-end text-[11px] text-slate-500"><span className="border-t border-slate-400 pt-1">Controller of Examinations</span></div>
    </PrintFrame>
  );
}
