import { LifeBuoy } from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DEMO_PASSWORD } from "@/data/seed/reference";

export function Help() {
  return (
    <div className="space-y-6">
      <PageHeader title="Help & Guide" icon={<LifeBuoy className="size-5" />} description="How to explore this demo build." />
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader><CardTitle className="text-base">Demo credentials</CardTitle></CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <p>Sign in with any role's username (e.g. <span className="font-mono text-foreground">admin</span>, <span className="font-mono text-foreground">teacher</span>, <span className="font-mono text-foreground">parent</span>).</p>
            <p>Password: <span className="font-mono text-foreground">{DEMO_PASSWORD}</span></p>
            <p>Delete PIN: <span className="font-mono text-foreground">1234</span></p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-base">Tips</CardTitle></CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <p>Press <kbd className="rounded border px-1">⌘K</kbd> / <kbd className="rounded border px-1">Ctrl K</kbd> to jump anywhere.</p>
            <p>Toggle light/dark and English/हिंदी from the top bar.</p>
            <p>Deletes go to the Recycle Bin (15-day restore).</p>
            <p>All data persists in your browser; reset it from Settings.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
