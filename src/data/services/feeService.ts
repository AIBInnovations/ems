import { db } from "@/data/db";
import { latency } from "@/lib/latency";
import { nowISO } from "@/lib/clock";
import { humanId } from "@/lib/id";
import { logActivity } from "@/lib/activity";
import { createCrudService } from "@/lib/createService";
import type { FeeBill, Payment, PaymentMode } from "@/types";

function recomputeStatus(bill: FeeBill): FeeBill["status"] {
  if (bill.balance <= 0) return "paid";
  if (bill.totalPaid > 0) return "partial";
  return new Date(bill.dueDate) < new Date() ? "overdue" : "due";
}

const billService = createCrudService("feeBills", { label: (b) => b.invoiceNo, origin: "Fees", noun: "fee bill" });

export const feeService = {
  ...billService,

  /** Record a payment (offline or simulated-online) → receipt + balance update. */
  async collect(
    billId: string,
    input: { amount: number; mode: PaymentMode; channel?: "counter" | "online"; reference?: string; collectedByStaffId?: string },
  ): Promise<{ payment: Payment; bill: FeeBill }> {
    await latency(200, 500);
    const bill = db.getById("feeBills", billId);
    if (!bill) throw new Error("Bill not found");
    const amount = Math.min(input.amount, bill.balance);
    const payment = db.insert("payments", {
      receiptNo: humanId.receipt(),
      billId,
      studentId: bill.studentId,
      amount,
      mode: input.mode,
      reference: input.reference,
      paidAt: nowISO(),
      collectedByStaffId: input.collectedByStaffId,
      channel: input.channel ?? "counter",
      status: "success",
    });
    const totalPaid = bill.totalPaid + amount;
    const balance = Math.max(0, bill.totalDue + bill.lateFee - totalPaid);
    const updated = db.update("feeBills", billId, {
      totalPaid,
      balance,
      status: recomputeStatus({ ...bill, totalPaid, balance }),
    });
    logActivity("collect", "payments", payment.id, `Collected ${amount} for ${bill.invoiceNo}`);
    return { payment, bill: updated };
  },

  /** Simulated payment gateway → succeeds after a short delay, emits a receipt. */
  async payOnline(billId: string, amount: number): Promise<{ payment: Payment; bill: FeeBill }> {
    await latency(900, 1600);
    return this.collect(billId, { amount, mode: "online", channel: "online", reference: `TXN${humanId.tracking()}` });
  },

  async refund(paymentId: string, reason: string, processedByStaffId?: string) {
    await latency();
    const payment = db.getById("payments", paymentId);
    if (!payment) throw new Error("Payment not found");
    db.update("payments", paymentId, { status: "refunded" });
    const refund = db.insert("refunds", {
      paymentId,
      amount: payment.amount,
      reason,
      status: "processed",
      processedByStaffId,
      processedAt: nowISO(),
    });
    logActivity("refund", "refunds", refund.id, `Refunded ${payment.amount} for receipt ${payment.receiptNo}`);
    return refund;
  },

  paymentsForStudent(studentId: string): Payment[] {
    return db.query("payments", (p) => p.studentId === studentId);
  },
  billsForStudent(studentId: string): FeeBill[] {
    return db.query("feeBills", (b) => b.studentId === studentId);
  },
  defaulters(): FeeBill[] {
    return db.query("feeBills", (b) => b.status === "due" || b.status === "overdue" || b.status === "partial");
  },
};
