import { useRouteError, useNavigate, isRouteErrorResponse } from "react-router-dom";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";
import { Button } from "@/components/ui/button";

/** Friendly error element for the router — recovers gracefully from render errors
 *  and stale dynamic-import failures (offers a reload). */
export function RouteError() {
  const error = useRouteError();
  const navigate = useNavigate();

  const message = isRouteErrorResponse(error)
    ? `${error.status} ${error.statusText}`
    : error instanceof Error
      ? error.message
      : "Something went wrong";

  const isChunkError = /dynamically imported module|Importing a module script failed|Failed to fetch/i.test(message);

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-5 bg-background p-6 text-center">
      <div className="flex size-16 items-center justify-center rounded-2xl bg-warning/15 text-amber-600 dark:text-amber-400">
        <AlertTriangle className="size-8" />
      </div>
      <div className="space-y-1.5">
        <h1 className="font-display text-h2">{isChunkError ? "A fresh version is available" : "Unexpected error"}</h1>
        <p className="max-w-md text-sm text-muted-foreground">
          {isChunkError
            ? "This screen couldn't load because the app was updated. Reload to get the latest version."
            : "This page hit an error. You can reload or head back to your dashboard."}
        </p>
        {!isChunkError ? <p className="mx-auto max-w-md truncate rounded bg-muted px-2 py-1 font-mono text-xs text-muted-foreground">{message}</p> : null}
      </div>
      <div className="flex flex-wrap items-center justify-center gap-2">
        <Button onClick={() => window.location.reload()}>
          <RefreshCw className="size-4" /> Reload
        </Button>
        <Button variant="outline" onClick={() => navigate("/app")}>
          <Home className="size-4" /> Dashboard
        </Button>
      </div>
    </div>
  );
}
