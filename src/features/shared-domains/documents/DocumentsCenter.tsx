import { useMemo, useState } from "react";
import { Check, FileDown, FileText } from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { InitialsAvatar } from "@/components/shared/InitialsAvatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/components/ui/sonner";
import { db } from "@/data/db";
import { fullName } from "@/lib/format";
import { cn } from "@/lib/utils";

const DOC_TYPES = [
  { value: "id-card", label: "ID Card" },
  { value: "marksheet", label: "Mark Sheet" },
  { value: "admit-card", label: "Admit Card" },
  { value: "transfer-certificate", label: "Transfer Certificate" },
];

export function DocumentsCenter() {
  const [docType, setDocType] = useState("id-card");
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<string[]>([]);

  const students = useMemo(
    () => db.getAll("students").filter((s) => `${s.firstName} ${s.lastName} ${s.admissionNo} ${s.rollNo}`.toLowerCase().includes(query.toLowerCase())),
    [query],
  );

  const toggle = (id: string) => setSelected((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));
  const allShownSelected = students.length > 0 && students.every((s) => selected.includes(s.id));

  const printFor = (studentId: string) => {
    if (docType === "marksheet") {
      const card = db.query("reportCards", (r) => r.studentId === studentId).slice(-1)[0];
      return `/print/marksheet/${card?.id ?? studentId}`;
    }
    return `/print/${docType}/${studentId}`;
  };

  const downloadSelected = () => {
    if (selected.length === 0) { toast.error("Select at least one student"); return; }
    selected.slice(0, 8).forEach((id, i) => setTimeout(() => window.open(printFor(id), "_blank"), i * 250));
    toast.success(`Opened ${Math.min(selected.length, 8)} ${DOC_TYPES.find((d) => d.value === docType)?.label}(s) for print/download`);
  };

  return (
    <div className="space-y-5">
      <PageHeader title="Documents Center" icon={<FileText className="size-5" />} description="Generate and download Mark Sheets, ID Cards, Admit Cards and TCs — individually or in bulk." />

      <Card>
        <CardContent className="space-y-4 p-4">
          <div className="flex flex-wrap items-end gap-3">
            <div className="space-y-1.5">
              <Label>Document type</Label>
              <Select value={docType} onValueChange={(v) => setDocType(v)}>
                <SelectTrigger className="w-52"><SelectValue /></SelectTrigger>
                <SelectContent>{DOC_TYPES.map((d) => <SelectItem key={d.value} value={d.value}>{d.label}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="flex-1 space-y-1.5">
              <Label>Search students</Label>
              <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Name, admission no, roll…" />
            </div>
            <Button variant="outline" onClick={() => setSelected(allShownSelected ? [] : students.map((s) => s.id))}>{allShownSelected ? "Clear" : "Select all"}</Button>
            <Button onClick={downloadSelected} disabled={selected.length === 0}><FileDown className="size-4" /> Download <Badge variant="secondary" className="ml-1">{selected.length}</Badge></Button>
          </div>

          <ScrollArea className="h-[460px] rounded-md border border-border">
            {students.map((s) => {
              const on = selected.includes(s.id);
              return (
                <div key={s.id} className={cn("flex items-center gap-3 border-b border-border px-3 py-2 last:border-0", on && "bg-primary/5")}>
                  <button onClick={() => toggle(s.id)} className={cn("flex size-5 shrink-0 items-center justify-center rounded border", on ? "border-primary bg-primary text-primary-foreground" : "border-input")}>{on ? <Check className="size-3.5" /> : null}</button>
                  <InitialsAvatar first={s.firstName} last={s.lastName} size="sm" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{fullName(s.firstName, s.lastName)}</p>
                    <p className="font-mono text-xs text-muted-foreground">{s.admissionNo} · {db.getById("classes", s.classId)?.name}</p>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => window.open(printFor(s.id), "_blank")}><FileDown className="size-4" /> Open</Button>
                </div>
              );
            })}
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}
