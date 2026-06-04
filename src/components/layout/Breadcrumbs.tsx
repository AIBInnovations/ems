import { Fragment } from "react";
import { Link, useLocation } from "react-router-dom";
import { ChevronRight, Home } from "lucide-react";

function humanize(segment: string): string {
  return segment.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

export function Breadcrumbs() {
  const { pathname } = useLocation();
  const parts = pathname.split("/").filter(Boolean); // e.g. ["app","admin","students"]
  if (parts[0] !== "app" || parts.length < 2) return null;
  const area = parts[1];
  const rest = parts.slice(2);

  return (
    <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-sm text-muted-foreground">
      <Link to={`/app/${area}`} className="flex items-center gap-1 hover:text-foreground">
        <Home className="size-3.5" /> {humanize(area)}
      </Link>
      {rest.map((seg, i) => {
        const to = `/app/${area}/${rest.slice(0, i + 1).join("/")}`;
        const isLast = i === rest.length - 1;
        return (
          <Fragment key={to}>
            <ChevronRight className="size-3.5 opacity-50" />
            {isLast ? (
              <span className="font-medium text-foreground">{humanize(seg)}</span>
            ) : (
              <Link to={to} className="hover:text-foreground">{humanize(seg)}</Link>
            )}
          </Fragment>
        );
      })}
    </nav>
  );
}
