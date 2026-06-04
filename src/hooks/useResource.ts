import { useCallback, useEffect, useState } from "react";
import type { CrudService } from "@/types";

/** Loads a list from a service with a manual refresh handle. Scope filter is
 *  captured once per mount; call refresh() after mutations. */
export function useResourceList<T>(
  service: Pick<CrudService<T>, "list">,
  filter?: (row: T) => boolean,
  deps: unknown[] = [],
) {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(() => {
    setLoading(true);
    void service.list(filter).then((rows) => {
      setData(rows);
      setLoading(false);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [service, ...deps]);

  useEffect(() => {
    load();
  }, [load]);

  return { data, loading, refresh: load, setData };
}
