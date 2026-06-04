/** Excel + PDF export helpers. Heavy libs are dynamically imported so they
 *  stay out of the main bundle until an export is actually triggered. */

export interface ExportColumn {
  key: string;
  header: string;
}

export type ExportRow = Record<string, string | number | boolean | null | undefined>;

export async function exportToExcel(filename: string, columns: ExportColumn[], rows: ExportRow[]): Promise<void> {
  const XLSX = await import("xlsx");
  const data = rows.map((r) => {
    const out: Record<string, unknown> = {};
    for (const c of columns) out[c.header] = r[c.key] ?? "";
    return out;
  });
  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Data");
  XLSX.writeFile(wb, `${filename}.xlsx`);
}

export async function exportToPdf(
  filename: string,
  title: string,
  columns: ExportColumn[],
  rows: ExportRow[],
): Promise<void> {
  const { default: JsPDF } = await import("jspdf");
  const autoTable = (await import("jspdf-autotable")).default;
  const doc = new JsPDF({ orientation: columns.length > 6 ? "landscape" : "portrait" });
  doc.setFontSize(14);
  doc.text(title, 14, 16);
  doc.setFontSize(9);
  doc.setTextColor(120);
  doc.text(`Generated ${new Date().toLocaleString()}`, 14, 22);
  autoTable(doc, {
    head: [columns.map((c) => c.header)],
    body: rows.map((r) => columns.map((c) => String(r[c.key] ?? ""))),
    startY: 26,
    styles: { fontSize: 8, cellPadding: 2 },
    headStyles: { fillColor: [47, 67, 196], textColor: 255 },
    alternateRowStyles: { fillColor: [245, 247, 251] },
  });
  doc.save(`${filename}.pdf`);
}

export function exportToCsv(filename: string, columns: ExportColumn[], rows: ExportRow[]): void {
  const esc = (v: unknown) => `"${String(v ?? "").replace(/"/g, '""')}"`;
  const lines = [columns.map((c) => esc(c.header)).join(",")];
  for (const r of rows) lines.push(columns.map((c) => esc(r[c.key])).join(","));
  const blob = new Blob([lines.join("\n")], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${filename}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}
