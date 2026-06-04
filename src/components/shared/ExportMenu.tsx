import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Download, FileSpreadsheet, FileText, Loader2, Printer } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "@/components/ui/sonner";
import { exportToCsv, exportToExcel, exportToPdf, type ExportColumn, type ExportRow } from "@/lib/export";

export interface ExportMenuProps {
  filename: string;
  title: string;
  columns: ExportColumn[];
  getRows: () => ExportRow[];
  excel?: boolean;
  pdf?: boolean;
  print?: boolean;
  size?: "sm" | "default";
}

export function ExportMenu({ filename, title, columns, getRows, excel = true, pdf = true, print = true, size = "sm" }: ExportMenuProps) {
  const { t } = useTranslation();
  const [busy, setBusy] = useState(false);

  const run = async (fn: () => Promise<void> | void) => {
    setBusy(true);
    try {
      await fn();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Export failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size={size} disabled={busy}>
          {busy ? <Loader2 className="size-4 animate-spin" /> : <Download className="size-4" />}
          {t("action.export", "Export")}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {excel ? (
          <DropdownMenuItem onSelect={() => run(() => exportToExcel(filename, columns, getRows()))}>
            <FileSpreadsheet className="size-4 text-success" /> Excel (.xlsx)
          </DropdownMenuItem>
        ) : null}
        {pdf ? (
          <DropdownMenuItem onSelect={() => run(() => exportToPdf(filename, title, columns, getRows()))}>
            <FileText className="size-4 text-destructive" /> PDF (.pdf)
          </DropdownMenuItem>
        ) : null}
        <DropdownMenuItem onSelect={() => run(() => exportToCsv(filename, columns, getRows()))}>
          <FileText className="size-4 text-muted-foreground" /> CSV (.csv)
        </DropdownMenuItem>
        {print ? (
          <DropdownMenuItem onSelect={() => window.print()}>
            <Printer className="size-4 text-muted-foreground" /> {t("action.print", "Print")}
          </DropdownMenuItem>
        ) : null}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
