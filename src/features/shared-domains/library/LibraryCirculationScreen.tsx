import { useState } from "react";
import { BookOpen, BookUp, Loader2, Undo2 } from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { DataTable } from "@/components/shared/DataTable";
import { StatusPill } from "@/components/shared/StatusPill";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/components/ui/sonner";
import { useResourceList } from "@/hooks/useResource";
import { bookLoanService, libraryService } from "@/data/services";
import { useAuthStore } from "@/store/auth";
import { db } from "@/data/db";
import { fullName, formatDate, formatMoney } from "@/lib/format";
import type { BookLoan, ResourceColumn } from "@/types";

const bookTitle = (id: string) => db.getById("books", id)?.title ?? "—";
const memberName = (id: string) => {
  const m = db.getById("libraryMembers", id);
  if (!m) return "—";
  const s = db.getById("students", m.personId) ?? db.getById("staff", m.personId);
  return s ? fullName((s as { firstName: string }).firstName, (s as { lastName: string }).lastName) : m.cardNo;
};

export function LibraryCirculationScreen() {
  const staffId = useAuthStore((s) => s.user?.linkedProfileId ?? "");
  const { data, loading, refresh } = useResourceList(bookLoanService);

  const [issueOpen, setIssueOpen] = useState(false);
  const [bookId, setBookId] = useState("");
  const [memberId, setMemberId] = useState("");
  const [busy, setBusy] = useState(false);

  const availableBooks = db.getAll("books").filter((b) => b.availableCopies > 0);
  const members = db.getAll("libraryMembers");

  const issue = async () => {
    if (!bookId || !memberId) return;
    setBusy(true);
    try {
      await libraryService.issue(bookId, memberId, staffId);
      toast.success(`"${bookTitle(bookId)}" issued to ${memberName(memberId)}`);
      setIssueOpen(false);
      setBookId("");
      setMemberId("");
      refresh();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Issue failed");
    } finally {
      setBusy(false);
    }
  };

  const returnBook = async (loan: BookLoan) => {
    const { fine } = await libraryService.returnBook(loan.id);
    refresh();
    toast.success(fine > 0 ? `Returned · fine of ${formatMoney(fine)} applied` : "Book returned");
  };

  const columns: ResourceColumn<BookLoan>[] = [
    { key: "book", header: "Book", accessor: (l) => bookTitle(l.bookId), cell: (l) => <span className="font-medium">{bookTitle(l.bookId)}</span> },
    { key: "member", header: "Member", accessor: (l) => memberName(l.memberId) },
    { key: "issueDate", header: "Issued", accessor: (l) => l.issueDate, cell: (l) => formatDate(l.issueDate), hideBelow: "md" },
    { key: "dueDate", header: "Due", accessor: (l) => l.dueDate, cell: (l) => formatDate(l.dueDate) },
    { key: "status", header: "Status", accessor: (l) => l.status, cell: (l) => <StatusPill status={l.status} /> },
  ];

  return (
    <div className="space-y-5">
      <PageHeader
        title="Circulation"
        icon={<BookOpen className="size-5" />}
        description="Issue and return books. Overdue returns auto-calculate fines."
        actions={<Button onClick={() => setIssueOpen(true)}><BookUp className="size-4" /> Issue book</Button>}
      />

      <DataTable
        data={data}
        columns={columns}
        getRowId={(l) => l.id}
        loading={loading}
        searchText={(l) => `${bookTitle(l.bookId)} ${memberName(l.memberId)}`}
        filters={[{ key: "status", labelKey: "Status", type: "select", options: [
          { value: "issued", label: "Issued" }, { value: "overdue", label: "Overdue" }, { value: "returned", label: "Returned" }, { value: "lost", label: "Lost" },
        ] }]}
        exportConfig={{ filename: "loans", title: "Book Loans", excel: true, pdf: true }}
        rowActions={(l) => (l.status === "returned" ? null : <Button variant="ghost" size="sm" onClick={() => returnBook(l)}><Undo2 className="size-4" /> Return</Button>)}
      />

      <Dialog open={issueOpen} onOpenChange={setIssueOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle>Issue a book</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label>Book</Label>
              <Select value={bookId} onValueChange={setBookId}>
                <SelectTrigger><SelectValue placeholder="Select a book…" /></SelectTrigger>
                <SelectContent>{availableBooks.map((b) => <SelectItem key={b.id} value={b.id}>{b.title} ({b.availableCopies} avail)</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Member</Label>
              <Select value={memberId} onValueChange={setMemberId}>
                <SelectTrigger><SelectValue placeholder="Select a member…" /></SelectTrigger>
                <SelectContent>{members.map((m) => <SelectItem key={m.id} value={m.id}>{memberName(m.id)} · {m.cardNo}</SelectItem>)}</SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIssueOpen(false)}>Cancel</Button>
            <Button onClick={issue} disabled={busy || !bookId || !memberId}>{busy ? <Loader2 className="size-4 animate-spin" /> : <BookUp className="size-4" />} Issue (14 days)</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
