import { useMemo, useState } from "react";
import { BookMarked, ChevronLeft, ChevronRight } from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { EmptyState } from "@/components/shared/EmptyState";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { db } from "@/data/db";

export function SyllabusReader() {
  const books = db.getAll("syllabusBooks");
  const [bookId, setBookId] = useState(books[0]?.id ?? "");
  const book = books.find((b) => b.id === bookId) ?? books[0];
  const [page, setPage] = useState(1);

  const current = useMemo(() => book?.pages.find((p) => p.pageNo === page) ?? book?.pages[0], [book, page]);

  if (!book) {
    return (
      <div className="space-y-5">
        <PageHeader title="Syllabus Reader" icon={<BookMarked className="size-5" />} />
        <EmptyState icon={BookMarked} title="No syllabus books" description="Uploaded class books will be readable here." />
      </div>
    );
  }

  const total = book.totalPages;
  const subj = db.getById("subjects", book.subjectId);
  const cls = db.getById("classes", book.classId);

  return (
    <div className="space-y-5">
      <PageHeader title="Syllabus Reader" icon={<BookMarked className="size-5" />} description={`${cls?.name ?? ""} · ${subj?.name ?? ""}`} />

      <div className="flex flex-wrap items-center gap-3">
        <Select value={bookId} onValueChange={(v) => { setBookId(v); setPage(1); }}>
          <SelectTrigger className="w-72"><SelectValue /></SelectTrigger>
          <SelectContent>{books.map((b) => <SelectItem key={b.id} value={b.id}>{b.title}</SelectItem>)}</SelectContent>
        </Select>
        <div className="ml-auto flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page <= 1}><ChevronLeft className="size-4" /></Button>
          <span className="text-sm text-muted-foreground">Page</span>
          <Input type="number" min={1} max={total} value={page} onChange={(e) => setPage(Math.max(1, Math.min(total, Number(e.target.value))))} className="h-9 w-16 text-center" />
          <span className="text-sm text-muted-foreground">/ {total}</span>
          <Button variant="outline" size="icon" onClick={() => setPage((p) => Math.min(total, p + 1))} disabled={page >= total}><ChevronRight className="size-4" /></Button>
        </div>
      </div>

      <Card className="mx-auto w-full max-w-3xl">
        <CardContent className="min-h-[460px] p-8">
          <div className="mb-4 flex items-center justify-between border-b border-border pb-2">
            <h2 className="font-display text-lg font-semibold">{current?.title ?? `Page ${page}`}</h2>
            <span className="text-xs text-muted-foreground">{book.title}</span>
          </div>
          {current?.imageUrl ? (
            <img src={current.imageUrl} alt={current.title} className="mx-auto max-h-[400px] rounded-lg" />
          ) : (
            <p className="whitespace-pre-line leading-7 text-foreground/90">{current?.body ?? "This page is part of the syllabus and will display its content here."}</p>
          )}
        </CardContent>
      </Card>

      <div className="flex items-center justify-center gap-1">
        {Array.from({ length: total }).map((_, i) => (
          <button key={i} onClick={() => setPage(i + 1)} className={`size-2 rounded-full ${page === i + 1 ? "bg-primary" : "bg-muted-foreground/30"}`} />
        ))}
      </div>
    </div>
  );
}
