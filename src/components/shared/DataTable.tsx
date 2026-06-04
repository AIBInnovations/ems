import { useMemo, useState, type ReactNode } from "react";
import { useTranslation } from "react-i18next";
import {
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type SortingState,
  type VisibilityState,
} from "@tanstack/react-table";
import {
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  Columns3,
  Plus,
  Rows3,
  Search,
  SlidersHorizontal,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { EmptyState } from "./EmptyState";
import { ExportMenu } from "./ExportMenu";
import { cn } from "@/lib/utils";
import type { Density, FilterDef, ResourceColumn } from "@/types";

export interface DataTableProps<T> {
  data: T[];
  columns: ResourceColumn<T>[];
  getRowId: (row: T) => string;
  searchText?: (row: T) => string;
  filters?: FilterDef<T>[];
  defaultSort?: { key: string; desc?: boolean };
  loading?: boolean;
  density?: Density;
  onRowClick?: (row: T) => void;
  rowActions?: (row: T) => ReactNode;
  selection?: { enabled: boolean; bulkBar?: (rows: T[], clear: () => void) => ReactNode };
  toolbar?: { addLabel?: string; onAdd?: () => void; extra?: ReactNode };
  exportConfig?: { filename: string; title: string; excel?: boolean; pdf?: boolean };
  emptyTitle?: string;
  emptyDescription?: string;
  emptyAction?: ReactNode;
  pageSize?: number;
}

function resolveOptions<T>(f: FilterDef<T>) {
  const opts = typeof f.options === "function" ? f.options() : f.options ?? [];
  return opts;
}

export function DataTable<T>({
  data,
  columns,
  getRowId,
  searchText,
  filters = [],
  defaultSort,
  loading,
  density = "comfortable",
  onRowClick,
  rowActions,
  selection,
  toolbar,
  exportConfig,
  emptyTitle,
  emptyDescription,
  emptyAction,
  pageSize = 10,
}: DataTableProps<T>) {
  const { t } = useTranslation();
  const [search, setSearch] = useState("");
  const [activeFilters, setActiveFilters] = useState<Record<string, string>>({});
  const [sorting, setSorting] = useState<SortingState>(defaultSort ? [{ id: defaultSort.key, desc: !!defaultSort.desc }] : []);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>(
    Object.fromEntries(columns.filter((c) => c.defaultHidden).map((c) => [c.key, false])),
  );
  const [rowSelection, setRowSelection] = useState<Record<string, boolean>>({});
  const [tableDensity, setTableDensity] = useState<Density>(density);

  const filtered = useMemo(() => {
    let rows = data;
    if (search && searchText) {
      const q = search.toLowerCase();
      rows = rows.filter((r) => searchText(r).toLowerCase().includes(q));
    }
    for (const f of filters) {
      const val = activeFilters[f.key];
      if (!val) continue;
      const acc = f.accessor ?? ((r: T) => (r as Record<string, unknown>)[f.key]);
      rows = rows.filter((r) => String(acc(r) ?? "") === val);
    }
    return rows;
  }, [data, search, searchText, filters, activeFilters]);

  const tableColumns = useMemo<ColumnDef<T>[]>(() => {
    const defs: ColumnDef<T>[] = [];
    if (selection?.enabled) {
      defs.push({
        id: "__select",
        header: ({ table }) => (
          <Checkbox
            checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && "indeterminate")}
            onCheckedChange={(v) => table.toggleAllPageRowsSelected(!!v)}
            aria-label="Select all"
          />
        ),
        cell: ({ row }) => (
          <Checkbox
            checked={row.getIsSelected()}
            onCheckedChange={(v) => row.toggleSelected(!!v)}
            onClick={(e) => e.stopPropagation()}
            aria-label="Select row"
          />
        ),
        enableSorting: false,
        size: 40,
      });
    }
    for (const col of columns) {
      defs.push({
        id: col.key,
        accessorFn: (row) => (col.accessor ? col.accessor(row) : (row as Record<string, unknown>)[col.key]),
        header: col.header,
        cell: ({ row }) => (col.cell ? col.cell(row.original) : String((row.getValue(col.key) as unknown) ?? "—")),
        enableSorting: col.sortable ?? true,
        meta: { align: col.align, mono: col.mono, hideBelow: col.hideBelow },
      });
    }
    if (rowActions) {
      defs.push({
        id: "__actions",
        header: () => <span className="sr-only">{t("common.actions", "Actions")}</span>,
        cell: ({ row }) => <div className="flex justify-end">{rowActions(row.original)}</div>,
        enableSorting: false,
        size: 56,
      });
    }
    return defs;
  }, [columns, rowActions, selection?.enabled, t]);

  const table = useReactTable({
    data: filtered,
    columns: tableColumns,
    state: { sorting, columnVisibility, rowSelection },
    getRowId,
    onSortingChange: setSorting,
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    enableRowSelection: selection?.enabled,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageSize } },
  });

  const selectedRows = table.getSelectedRowModel().rows.map((r) => r.original);
  const activeFilterCount = Object.values(activeFilters).filter(Boolean).length;
  const compact = tableDensity === "compact";

  const exportRows = () =>
    filtered.map((row) => {
      const out: Record<string, string | number> = {};
      for (const c of columns) {
        const v = c.accessor ? c.accessor(row) : (row as Record<string, unknown>)[c.key];
        out[c.key] = v == null ? "" : (typeof v === "boolean" ? (v ? "Yes" : "No") : (v as string | number));
      }
      return out;
    });

  return (
    <div className="space-y-3">
      {/* Toolbar */}
      <div className="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-1 flex-wrap items-center gap-2">
          {searchText ? (
            <div className="relative w-full sm:w-64">
              <Search className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder={t("common.search", "Search") + "…"} className="h-9 pl-8" />
            </div>
          ) : null}
          {filters.map((f) => (
            <Select key={f.key} value={activeFilters[f.key] ?? "__all"} onValueChange={(v) => setActiveFilters((s) => ({ ...s, [f.key]: v === "__all" ? "" : v }))}>
              <SelectTrigger className="h-9 w-auto min-w-[8rem] gap-1">
                <SlidersHorizontal className="size-3.5 text-muted-foreground" />
                <SelectValue placeholder={t(f.labelKey, f.key)} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__all">{t(f.labelKey, f.key)}: {t("common.all", "All")}</SelectItem>
                {resolveOptions(f).map((o) => (
                  <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          ))}
          {activeFilterCount > 0 ? (
            <Button variant="ghost" size="sm" onClick={() => setActiveFilters({})}>
              <X className="size-4" /> {t("action.reset", "Reset")}
            </Button>
          ) : null}
        </div>

        <div className="flex items-center gap-2">
          {toolbar?.extra}
          <Button variant="outline" size="sm" onClick={() => setTableDensity(compact ? "comfortable" : "compact")} title="Density">
            <Rows3 className="size-4" />
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm"><Columns3 className="size-4" /> <span className="hidden sm:inline">{t("action.columns", "Columns")}</span></Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>{t("action.columns", "Columns")}</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {table.getAllColumns().filter((c) => c.getCanHide() && !c.id.startsWith("__")).map((c) => {
                const col = columns.find((x) => x.key === c.id);
                return (
                  <DropdownMenuCheckboxItem key={c.id} checked={c.getIsVisible()} onCheckedChange={(v) => c.toggleVisibility(!!v)}>
                    {col?.header ?? c.id}
                  </DropdownMenuCheckboxItem>
                );
              })}
            </DropdownMenuContent>
          </DropdownMenu>
          {exportConfig ? (
            <ExportMenu
              filename={exportConfig.filename}
              title={exportConfig.title}
              columns={columns.map((c) => ({ key: c.key, header: c.header }))}
              getRows={exportRows}
              excel={exportConfig.excel}
              pdf={exportConfig.pdf}
            />
          ) : null}
          {toolbar?.onAdd ? (
            <Button size="sm" onClick={toolbar.onAdd}>
              <Plus className="size-4" /> {toolbar.addLabel ?? t("action.add", "Add")}
            </Button>
          ) : null}
        </div>
      </div>

      {/* Bulk action bar */}
      {selection?.enabled && selectedRows.length > 0 ? (
        <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-primary/30 bg-primary/5 px-3 py-2">
          <span className="text-sm font-medium">
            {selectedRows.length} {t("common.rowsSelected", "selected")}
          </span>
          <div className="flex items-center gap-2">
            {selection.bulkBar?.(selectedRows, () => setRowSelection({}))}
            <Button variant="ghost" size="sm" onClick={() => setRowSelection({})}><X className="size-4" /></Button>
          </div>
        </div>
      ) : null}

      {/* Table */}
      <div className="overflow-hidden rounded-lg border border-border bg-card">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="sticky top-0 z-10 bg-muted/40 backdrop-blur">
              {table.getHeaderGroups().map((hg) => (
                <TableRow key={hg.id} className="hover:bg-transparent">
                  {hg.headers.map((header) => {
                    const meta = header.column.columnDef.meta as { align?: string; hideBelow?: string } | undefined;
                    const canSort = header.column.getCanSort();
                    return (
                      <TableHead
                        key={header.id}
                        className={cn(
                          meta?.align === "right" && "text-right",
                          meta?.align === "center" && "text-center",
                          meta?.hideBelow === "sm" && "hidden sm:table-cell",
                          meta?.hideBelow === "md" && "hidden md:table-cell",
                          meta?.hideBelow === "lg" && "hidden lg:table-cell",
                        )}
                      >
                        {header.isPlaceholder ? null : canSort ? (
                          <button className="inline-flex items-center gap-1 hover:text-foreground" onClick={header.column.getToggleSortingHandler()}>
                            {flexRender(header.column.columnDef.header, header.getContext())}
                            <ArrowUpDown className="size-3 opacity-50" />
                          </button>
                        ) : (
                          flexRender(header.column.columnDef.header, header.getContext())
                        )}
                      </TableHead>
                    );
                  })}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {loading ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <TableRow key={i}>
                    {table.getVisibleLeafColumns().map((c) => (
                      <TableCell key={c.id}><Skeleton className="h-5 w-full max-w-[160px]" /></TableCell>
                    ))}
                  </TableRow>
                ))
              ) : table.getRowModel().rows.length === 0 ? (
                <TableRow className="hover:bg-transparent">
                  <TableCell colSpan={table.getVisibleLeafColumns().length} className="p-0">
                    <EmptyState title={emptyTitle ?? t("common.noData", "No records")} description={emptyDescription} action={emptyAction} className="border-0" />
                  </TableCell>
                </TableRow>
              ) : (
                table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() && "selected"}
                    className={cn(onRowClick && "cursor-pointer")}
                    onClick={onRowClick ? () => onRowClick(row.original) : undefined}
                  >
                    {row.getVisibleCells().map((cell) => {
                      const meta = cell.column.columnDef.meta as { align?: string; mono?: boolean; hideBelow?: string } | undefined;
                      return (
                        <TableCell
                          key={cell.id}
                          className={cn(
                            compact ? "py-1.5" : "py-2.5",
                            meta?.align === "right" && "text-right",
                            meta?.align === "center" && "text-center",
                            meta?.mono && "font-mono text-[13px] tabular-nums",
                            meta?.hideBelow === "sm" && "hidden sm:table-cell",
                            meta?.hideBelow === "md" && "hidden md:table-cell",
                            meta?.hideBelow === "lg" && "hidden lg:table-cell",
                          )}
                        >
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </TableCell>
                      );
                    })}
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Pagination */}
      {!loading && filtered.length > 0 ? (
        <div className="flex flex-col items-center justify-between gap-3 sm:flex-row">
          <p className="text-sm text-muted-foreground">
            {table.getFilteredRowModel().rows.length} {t("common.total", "total")}
            {selectedRows.length ? ` · ${selectedRows.length} ${t("common.rowsSelected", "selected")}` : ""}
          </p>
          <div className="flex items-center gap-2">
            <Select value={String(table.getState().pagination.pageSize)} onValueChange={(v) => table.setPageSize(Number(v))}>
              <SelectTrigger className="h-8 w-[4.5rem]"><SelectValue /></SelectTrigger>
              <SelectContent>
                {[10, 25, 50, 100].map((n) => <SelectItem key={n} value={String(n)}>{n}</SelectItem>)}
              </SelectContent>
            </Select>
            <span className="text-sm text-muted-foreground">
              {t("common.page", "Page")} {table.getState().pagination.pageIndex + 1} {t("common.of", "of")} {table.getPageCount() || 1}
            </span>
            <Button variant="outline" size="icon" className="size-8" onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()}>
              <ChevronLeft className="size-4" />
            </Button>
            <Button variant="outline" size="icon" className="size-8" onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>
              <ChevronRight className="size-4" />
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
