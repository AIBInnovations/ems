import { lazy, type ComponentType } from "react";

/**
 * React.lazy with recovery for stale dynamic-import chunks. When a chunk fails to
 * load (e.g. the bundle was rebuilt while the tab was open), reload the page once
 * to fetch fresh URLs instead of crashing with "Failed to fetch dynamically
 * imported module". A sessionStorage guard prevents an infinite reload loop.
 */
const KEY = "ems:lazy-reloaded";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function lazyWithRetry<T extends ComponentType<any>>(factory: () => Promise<{ default: T }>) {
  return lazy(() =>
    factory()
      .then((mod) => {
        sessionStorage.removeItem(KEY);
        return mod;
      })
      .catch((err) => {
        if (!sessionStorage.getItem(KEY)) {
          sessionStorage.setItem(KEY, "1");
          window.location.reload();
          return new Promise<never>(() => {}); // never resolves — the reload takes over
        }
        throw err;
      }),
  );
}
