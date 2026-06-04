import { db } from "@/data/db";
import { latency } from "@/lib/latency";
import { addDaysISO, daysSince, nowISO } from "@/lib/clock";
import { humanId } from "@/lib/id";
import { logActivity } from "@/lib/activity";
import { format } from "date-fns";
import type { BookLoan } from "@/types";

const FINE_PER_DAY = 2;

export const libraryService = {
  async issue(bookId: string, memberId: string, issuedByStaffId: string, loanDays = 14): Promise<BookLoan | null> {
    await latency();
    const book = db.getById("books", bookId);
    if (!book || book.availableCopies <= 0) throw new Error("No copies available");
    const copy = db.insert("bookCopies", { bookId, accessionNo: humanId.accession(), status: "issued", condition: "good" });
    db.update("books", bookId, { availableCopies: book.availableCopies - 1 });
    const today = nowISO();
    const loan = db.insert("bookLoans", {
      copyId: copy.id,
      bookId,
      memberId,
      issueDate: format(new Date(), "yyyy-MM-dd"),
      dueDate: format(new Date(addDaysISO(today, loanDays)), "yyyy-MM-dd"),
      returnDate: null,
      status: "issued",
      issuedByStaffId,
    });
    logActivity("issue", "bookLoans", loan.id, `Issued "${book.title}"`);
    return loan;
  },

  async returnBook(loanId: string): Promise<{ loan: BookLoan; fine: number }> {
    await latency();
    const loan = db.getById("bookLoans", loanId);
    if (!loan) throw new Error("Loan not found");
    const overdueDays = Math.max(0, daysSince(loan.dueDate));
    const fine = overdueDays * FINE_PER_DAY;
    db.update("bookLoans", loanId, { returnDate: format(new Date(), "yyyy-MM-dd"), status: "returned" });
    const book = db.getById("books", loan.bookId);
    if (book) db.update("books", loan.bookId, { availableCopies: book.availableCopies + 1 });
    db.update("bookCopies", loan.copyId, { status: "available" });
    if (fine > 0) {
      const f = db.insert("libraryFines", { loanId, memberId: loan.memberId, amount: fine, reason: "late", status: "pending" });
      db.update("bookLoans", loanId, { fineId: f.id });
    }
    logActivity("return", "bookLoans", loanId, `Returned book${fine ? ` with ₹${fine} fine` : ""}`);
    return { loan: db.getById("bookLoans", loanId)!, fine };
  },

  async settleFine(fineId: string, action: "paid" | "waived") {
    await latency();
    db.update("libraryFines", fineId, { status: action, paidAt: action === "paid" ? nowISO() : undefined });
    logActivity(action, "libraryFines", fineId, `Fine ${action}`);
  },
};
