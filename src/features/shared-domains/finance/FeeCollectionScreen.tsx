import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AlertCircle, BadgeIndianRupee, HandCoins, Loader2, Send, Wallet } from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { StatCard } from "@/components/shared/StatCard";
import { DataTable } from "@/components/shared/DataTable";
import { StatusPill } from "@/components/shared/StatusPill";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/components/ui/sonner";
import { useResourceList } from "@/hooks/useResource";
import { feeService, notificationService } from "@/data/services";
import { useCan } from "@/lib/rbac";
import { useAuthStore } from "@/store/auth";
import { db } from "@/data/db";
import { formatMoney, formatMoneyCompact, fullName, formatDate } from "@/lib/format";
import type { FeeBill, PaymentMode, ResourceColumn } from "@/types";

const studentName = (id: string) => {
  const s = db.getById("students", id);
  return s ? fullName(s.firstName, s.lastName) : "—";
};

export function FeeCollectionScreen() {
  const navigate = useNavigate();
  const can = useCan();
  const canCollect = can({ permission: "fee.collect" });
  const staffId = useAuthStore((s) => s.user?.linkedProfileId ?? undefined);
  const { data, loading, refresh } = useResourceList(feeService);

  const [active, setActive] = useState<FeeBill | null>(null);
  const [amount, setAmount] = useState(0);
  const [mode, setMode] = useState<PaymentMode>("cash");
  const [busy, setBusy] = useState(false);

  const collected = db.getAll("payments").reduce((s, p) => (p.status === "success" ? s + p.amount : s), 0);
  const pending = data.reduce((s, b) => s + b.balance, 0);
  const defaulters = data.filter((b) => b.balance > 0).length;

  const openCollect = (bill: FeeBill) => {
    setActive(bill);
    setAmount(bill.balance);
    setMode("cash");
  };

  const doCollect = async () => {
    if (!active) return;
    setBusy(true);
    try {
      const { payment } = await feeService.collect(active.id, { amount, mode, channel: "counter", collectedByStaffId: staffId });
      refresh();
      setActive(null);
      toast.success(`Receipt ${payment.receiptNo} · ${formatMoney(payment.amount)} collected`, {
        action: { label: "Print receipt", onClick: () => navigate(`/print/receipt/${payment.id}`) },
      });
    } finally {
      setBusy(false);
    }
  };

  const sendReminder = async (bill: FeeBill) => {
    await notificationService.quick(
      "Fee Reminder",
      `A balance of ${formatMoney(bill.balance)} is pending for ${bill.period}. Please pay at the earliest.`,
      "member",
      "fee",
      [bill.studentId],
    );
    toast.success("Reminder sent");
  };

  const columns: ResourceColumn<FeeBill>[] = [
    { key: "student", header: "Student", accessor: (b) => studentName(b.studentId), cell: (b) => <span className="font-medium">{studentName(b.studentId)}</span> },
    { key: "invoiceNo", header: "Invoice", mono: true, hideBelow: "md" },
    { key: "period", header: "Period", hideBelow: "lg" },
    { key: "totalDue", header: "Due", accessor: (b) => b.totalDue + b.lateFee, cell: (b) => formatMoney(b.totalDue + b.lateFee), align: "right", mono: true },
    { key: "totalPaid", header: "Paid", accessor: (b) => b.totalPaid, cell: (b) => formatMoney(b.totalPaid), align: "right", mono: true, hideBelow: "sm" },
    { key: "balance", header: "Balance", accessor: (b) => b.balance, cell: (b) => <span className={b.balance > 0 ? "font-semibold text-destructive" : ""}>{formatMoney(b.balance)}</span>, align: "right", mono: true },
    { key: "status", header: "Status", accessor: (b) => b.status, cell: (b) => <StatusPill status={b.status} /> },
  ];

  return (
    <div className="space-y-6">
      <PageHeader title="Fees & Collection" icon={<Wallet className="size-5" />} description="Collect payments, generate receipts and track dues." />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard label="Collected" value={formatMoneyCompact(collected)} icon={BadgeIndianRupee} tone="success" />
        <StatCard label="Pending Dues" value={formatMoneyCompact(pending)} icon={AlertCircle} tone="danger" />
        <StatCard label="Defaulters" value={defaulters} icon={HandCoins} tone="warning" />
      </div>

      <DataTable
        data={data}
        columns={columns}
        getRowId={(b) => b.id}
        loading={loading}
        searchText={(b) => `${studentName(b.studentId)} ${b.invoiceNo} ${b.period}`}
        filters={[{ key: "status", labelKey: "Status", type: "select", options: [
          { value: "paid", label: "Paid" }, { value: "partial", label: "Partial" }, { value: "due", label: "Due" }, { value: "overdue", label: "Overdue" },
        ] }]}
        exportConfig={{ filename: "fee-bills", title: "Fee Bills", excel: true, pdf: true }}
        rowActions={(b) => (
          <div className="flex justify-end gap-1">
            {canCollect && b.balance > 0 ? <Button variant="ghost" size="sm" onClick={() => openCollect(b)}><HandCoins className="size-4" /> Collect</Button> : null}
            {b.balance > 0 ? <Button variant="ghost" size="icon" className="size-8" title="Send reminder" onClick={() => sendReminder(b)}><Send className="size-4" /></Button> : null}
          </div>
        )}
      />

      <Dialog open={!!active} onOpenChange={(o) => !o && setActive(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Collect Payment</DialogTitle>
            <DialogDescription>{active ? `${studentName(active.studentId)} · ${active.invoiceNo} · balance ${formatMoney(active.balance)}` : ""}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="amt">Amount</Label>
              <Input id="amt" type="number" value={amount} onChange={(e) => setAmount(Math.min(active?.balance ?? 0, Number(e.target.value)))} className="font-mono" />
              <p className="text-xs text-muted-foreground">Due {active ? formatDate(active.dueDate) : ""}</p>
            </div>
            <div className="space-y-1.5">
              <Label>Mode</Label>
              <Select value={mode} onValueChange={(v) => setMode(v as PaymentMode)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {(["cash", "card", "upi", "netbanking", "cheque", "online"] as PaymentMode[]).map((m) => <SelectItem key={m} value={m} className="capitalize">{m}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setActive(null)}>Cancel</Button>
            <Button onClick={doCollect} disabled={busy || amount <= 0}>{busy ? <Loader2 className="size-4 animate-spin" /> : <HandCoins className="size-4" />} Collect {formatMoney(amount)}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
